/**
 * GET /api/ecom/dashboard?from=YYYY-MM-DD&to=YYYY-MM-DD&compare=1
 * Retourne tous les agrégats nécessaires au dashboard principal pour la période donnée.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { filterRealOrders, isTestOrder } from "@/lib/shopify/test-orders-filter";
import {
  deriveMeasuredChannel,
  resolveUnifiedChannel,
  type Channel,
  type DisplayChannel,
  type ManualConfidence,
  type PixelResolvedSource,
} from "@/lib/gads/channels";

interface PeriodPayload {
  range: { from: string; to: string };
  kpis: {
    gross_sales: number;
    orders: number;
    aov: number;
    sessions: number;
    conversion_rate: number;
  };
  timeline: { date: string; gross_sales: number; orders: number }[];
}

interface DashboardResponse {
  current: PeriodPayload;
  previous?: PeriodPayload;
  top_products: { id: string; title: string; image_url: string | null; units: number; revenue: number }[];
  recent_orders: {
    id: string; name: string; created_at: string; total_price: number; currency: string;
    email: string | null; financial_status: string | null; fulfillment_status: string | null;
    channel: DisplayChannel;
  }[];
  sources: { channel: DisplayChannel; orders: number; revenue: number }[];
  // cart / checkout à null = étape non suivie par le pixel MVP (pas de zéro trompeur).
  funnel: { sessions: number; cart: number | null; checkout: number | null; purchase: number };
  countries: { country: string; revenue: number; orders: number }[];
  alerts: {
    low_stock: { product_id: string; title: string; inventory: number }[];
    pending_fulfillment: number;
    failed_webhooks: number;
  };
}

export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const url = new URL(req.url);
  const from = url.searchParams.get("from") ?? new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString().slice(0, 10);
  const to = url.searchParams.get("to") ?? new Date().toISOString().slice(0, 10);
  const compare = url.searchParams.get("compare") === "1";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: integration } = await (supabase.from("integrations") as any)
    .select("id")
    .eq("user_id", user.id)
    .eq("provider", "shopify")
    .eq("status", "active")
    .maybeSingle();
  if (!integration) return NextResponse.json({ error: "Aucune intégration" }, { status: 404 });

  const current = await buildPeriod(supabase, integration.id, from, to);

  let previous: PeriodPayload | undefined;
  if (compare) {
    const durationMs = new Date(to).getTime() - new Date(from).getTime();
    const prevTo = new Date(new Date(from).getTime() - 24 * 3600 * 1000).toISOString().slice(0, 10);
    const prevFrom = new Date(new Date(prevTo).getTime() - durationMs).toISOString().slice(0, 10);
    previous = await buildPeriod(supabase, integration.id, prevFrom, prevTo);
  }

  // Top produits + sources (basé sur orders line_items dans la période, filtre
  // commandes test). On charge aussi les signaux d'attribution (tracking, utm,
  // referrer, landing) pour dériver le canal unifié — plus de source_name brut.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: ordersForProductsRaw } = await (supabase.from("shopify_orders") as any)
    .select("id, name, line_items, tracking_status, utm_source, utm_medium, utm_campaign, referring_site, landing_site, total_price, shipping_address")
    .eq("integration_id", integration.id)
    .gte("created_at", from)
    .lte("created_at", to + "T23:59:59");

  // Exclure les commandes de test des analytics (cf lib/shopify/test-orders-filter)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ordersForProducts = filterRealOrders((ordersForProductsRaw ?? []) as any[]);

  const productAgg = new Map<string, { units: number; revenue: number; title: string; image_url: string | null }>();
  for (const o of (ordersForProducts ?? []) as { line_items: Array<{ product_id: string | null; title: string; quantity: number; price: number; image_url: string | null }> }[]) {
    for (const li of o.line_items ?? []) {
      if (!li.product_id) continue;
      const cur = productAgg.get(li.product_id) ?? { units: 0, revenue: 0, title: li.title, image_url: li.image_url };
      cur.units += li.quantity;
      cur.revenue += (li.price ?? 0) * li.quantity;
      productAgg.set(li.product_id, cur);
    }
  }
  const top_products = [...productAgg.entries()]
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Recent orders (10 dernières) — affiche tout, avec badge "Test" pour commandes exclues
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: recent_orders_raw } = await (supabase.from("shopify_orders") as any)
    .select("id, name, created_at, total_price, currency, email, financial_status, fulfillment_status, tracking_status, utm_source, utm_medium, utm_campaign, referring_site, landing_site")
    .eq("integration_id", integration.id)
    .order("created_at", { ascending: false })
    .limit(10);

  // Canal unifié : on résout la même vérité que la vue Commandes (natif > pixel >
  // manuel > non attribué), pour la colonne Source et le widget Sources.
  const attributionOrderIds = [
    ...new Set([
      ...((ordersForProducts ?? []) as Array<{ id?: string }>).map((o) => o.id).filter(Boolean),
      ...((recent_orders_raw ?? []) as Array<{ id?: string }>).map((o) => o.id).filter(Boolean),
    ]),
  ] as string[];
  const { pixelByOrder, manualByOrder } = await loadAttributionSignals(supabase, user.id, attributionOrderIds);

  const channelOf = (o: Record<string, unknown>): DisplayChannel =>
    resolveUnifiedChannel({
      measured: deriveMeasuredChannel({
        tracking_status: (o.tracking_status as string) ?? null,
        utm_source: (o.utm_source as string) ?? null,
        utm_medium: (o.utm_medium as string) ?? null,
        utm_campaign: (o.utm_campaign as string) ?? null,
        referring_site: (o.referring_site as string) ?? null,
        landing_site: (o.landing_site as string) ?? null,
      }),
      pixel: pixelByOrder.get(o.id as string) ?? null,
      manual: manualByOrder.get(o.id as string) ?? null,
    });

  const recent_orders = (recent_orders_raw ?? []).map((o: Record<string, unknown>) => ({
    id: o.id as string,
    name: o.name as string,
    created_at: o.created_at as string,
    total_price: Number(o.total_price ?? 0),
    currency: (o.currency as string) ?? "EUR",
    email: (o.email as string) ?? null,
    financial_status: (o.financial_status as string) ?? null,
    fulfillment_status: (o.fulfillment_status as string) ?? null,
    channel: channelOf(o),
    is_test: isTestOrder({ name: o.name as string }),
  }));

  // Sources (CA par canal unifié) — plus de source_name brut, fantôme explicite.
  const sourceAgg = new Map<DisplayChannel, { orders: number; revenue: number }>();
  for (const o of (ordersForProducts ?? []) as Array<Record<string, unknown>>) {
    const ch = channelOf(o);
    const cur = sourceAgg.get(ch) ?? { orders: 0, revenue: 0 };
    cur.revenue += Number((o as { total_price?: number }).total_price ?? 0);
    cur.orders += 1;
    sourceAgg.set(ch, cur);
  }
  const sources = [...sourceAgg.entries()]
    .map(([channel, v]) => ({ channel, ...v }))
    .sort((a, b) => b.revenue - a.revenue);

  // Funnel : rebranché sur les données réelles disponibles. Sessions = pixel
  // first-party (période) ; Achat = commandes réelles Shopify (période). Le
  // pixel MVP ne capte pas encore Ajout panier / Checkout → « non suivi »
  // (null) plutôt que des zéros qui font croire à un site mort.
  const pixelSessions = await countPixelSessions(supabase, user.id, from, to);
  const funnel = {
    sessions: pixelSessions,
    cart: null as number | null,
    checkout: null as number | null,
    purchase: current.kpis.orders,
  };

  // Géographie (top pays par revenu — depuis shipping_address)
  const countryAgg = new Map<string, { revenue: number; orders: number }>();
  for (const o of (ordersForProducts ?? []) as Array<{ shipping_address?: { country?: string }; total_price?: number }>) {
    const country = o.shipping_address?.country ?? "Inconnu";
    const cur = countryAgg.get(country) ?? { revenue: 0, orders: 0 };
    cur.revenue += Number(o.total_price ?? 0);
    cur.orders += 1;
    countryAgg.set(country, cur);
  }
  const countries = [...countryAgg.entries()]
    .map(([country, v]) => ({ country, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);

  // Alertes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: lowStock } = await (supabase.from("shopify_products") as any)
    .select("shopify_product_id, title, total_inventory")
    .eq("integration_id", integration.id)
    .not("total_inventory", "is", null)
    .lt("total_inventory", 5)
    .order("total_inventory", { ascending: true })
    .limit(5);

  const fortyEightHoursAgo = new Date(Date.now() - 48 * 3600 * 1000).toISOString();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count: pendingFulfillment } = await (supabase.from("shopify_orders") as any)
    .select("id", { count: "exact", head: true })
    .eq("integration_id", integration.id)
    .eq("financial_status", "paid")
    .or("fulfillment_status.is.null,fulfillment_status.eq.unfulfilled")
    .lte("created_at", fortyEightHoursAgo);

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count: failedWebhooks } = await (supabase.from("shopify_webhook_events") as any)
    .select("id", { count: "exact", head: true })
    .eq("integration_id", integration.id)
    .not("error", "is", null)
    .gte("received_at", sevenDaysAgo);

  const response: DashboardResponse = {
    current,
    previous,
    top_products,
    recent_orders,
    sources,
    funnel,
    countries,
    alerts: {
      low_stock: (lowStock ?? []).map((p: Record<string, unknown>) => ({
        product_id: p.shopify_product_id as string,
        title: p.title as string,
        inventory: Number(p.total_inventory ?? 0),
      })),
      pending_fulfillment: pendingFulfillment ?? 0,
      failed_webhooks: failedWebhooks ?? 0,
    },
  };

  return NextResponse.json(response);
}

// ── Helpers ──────────────────────────────────────────────────────

/** Charge pixel + manuel pour un lot de commandes (une seule vérité d'attribution). */
async function loadAttributionSignals(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
  orderIds: string[],
): Promise<{
  pixelByOrder: Map<string, { resolved_source: PixelResolvedSource }>;
  manualByOrder: Map<string, { channel: Channel; confidence: ManualConfidence | null }>;
}> {
  const pixelByOrder = new Map<string, { resolved_source: PixelResolvedSource }>();
  const manualByOrder = new Map<string, { channel: Channel; confidence: ManualConfidence | null }>();
  if (orderIds.length === 0) return { pixelByOrder, manualByOrder };

  const [{ data: pixel }, { data: manual }] = await Promise.all([
    (supabase.from("pixel_order_attribution") as any) // eslint-disable-line @typescript-eslint/no-explicit-any
      .select("order_id, resolved_source")
      .in("order_id", orderIds),
    (supabase.from("order_manual_attribution") as any) // eslint-disable-line @typescript-eslint/no-explicit-any
      .select("order_id, channel, confidence")
      .eq("user_id", userId)
      .in("order_id", orderIds),
  ]);
  for (const p of (pixel ?? []) as Array<{ order_id: string; resolved_source: PixelResolvedSource }>) {
    pixelByOrder.set(p.order_id, { resolved_source: p.resolved_source });
  }
  for (const m of (manual ?? []) as Array<{ order_id: string; channel: Channel; confidence: ManualConfidence | null }>) {
    manualByOrder.set(m.order_id, { channel: m.channel, confidence: m.confidence });
  }
  return { pixelByOrder, manualByOrder };
}

/** Sessions pixel first-party sur la période (toutes boutiques du user). */
async function countPixelSessions(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
  from: string,
  to: string,
): Promise<number> {
  const { data: shops } = await (supabase.from("pixel_shops") as any) // eslint-disable-line @typescript-eslint/no-explicit-any
    .select("id")
    .eq("user_id", userId);
  const shopIds = ((shops ?? []) as Array<{ id: string }>).map((s) => s.id);
  if (shopIds.length === 0) return 0;

  const { count } = await (supabase.from("pixel_sessions") as any) // eslint-disable-line @typescript-eslint/no-explicit-any
    .select("id", { count: "exact", head: true })
    .in("shop_id", shopIds)
    .gte("first_seen_at", from)
    .lte("first_seen_at", to + "T23:59:59");
  return count ?? 0;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function buildPeriod(supabase: any, integrationId: string, from: string, to: string): Promise<PeriodPayload> {
  const { data: ordersRowsRaw } = await (supabase.from("shopify_orders") as any)
    .select("name, created_at, total_price")
    .eq("integration_id", integrationId)
    .gte("created_at", from)
    .lte("created_at", to + "T23:59:59");

  // Filtre commandes test (#1001, #1002, #1004, #1005) — KPIs basés sur vraies commandes uniquement
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ordersRows = filterRealOrders((ordersRowsRaw ?? []) as any[]);

  const { data: sessionsRows } = await (supabase.from("shopify_sessions_daily") as any)
    .select("date, sessions, sessions_that_completed_checkout")
    .eq("integration_id", integrationId)
    .gte("date", from)
    .lte("date", to);

  let totalSales = 0;
  let orderCount = 0;
  const byDay = new Map<string, { gross_sales: number; orders: number }>();
  for (const o of (ordersRows ?? []) as { created_at: string; total_price: number | string | null }[]) {
    const amount = Number(o.total_price ?? 0);
    totalSales += amount;
    orderCount += 1;
    const day = (o.created_at ?? "").slice(0, 10);
    const cur = byDay.get(day) ?? { gross_sales: 0, orders: 0 };
    cur.gross_sales += amount;
    cur.orders += 1;
    byDay.set(day, cur);
  }

  let totalSessions = 0;
  let completedCheckouts = 0;
  for (const s of sessionsRows ?? []) {
    totalSessions += s.sessions ?? 0;
    completedCheckouts += s.sessions_that_completed_checkout ?? 0;
  }

  const aov = orderCount > 0 ? totalSales / orderCount : 0;
  const conversion = totalSessions > 0 ? (completedCheckouts / totalSessions) * 100 : 0;

  // Construire timeline complète (jours manquants à 0)
  const timeline: { date: string; gross_sales: number; orders: number }[] = [];
  const fromD = new Date(from);
  const toD = new Date(to);
  for (let d = new Date(fromD); d <= toD; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().slice(0, 10);
    const v = byDay.get(key) ?? { gross_sales: 0, orders: 0 };
    timeline.push({ date: key, ...v });
  }

  return {
    range: { from, to },
    kpis: {
      gross_sales: totalSales,
      orders: orderCount,
      aov,
      sessions: totalSessions,
      conversion_rate: conversion,
    },
    timeline,
  };
}
