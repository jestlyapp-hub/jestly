/**
 * Attribution Board (Partie B) — hiérarchie stricte des sources par commande
 * et répartition par canal selon le modèle first-click / last-click.
 *
 * Hiérarchie (ordre STRICT, testé) :
 *  1. Pixel Jestly (confidence affichée) — first ou last selon le toggle
 *  2. Shopify natif (utm/gclid — first-touch uniquement : Shopify ne nous
 *     donne que firstVisit, le toggle n'affecte donc que le pixel)
 *  3. Attribution manuelle (un « ghost » manuel explicite force le niveau 5)
 *  4. Survey « déclaré client » (PPS) — jamais prioritaire sur 1-3
 *  5. Ghost (non résolu)
 */
import { createAdminClient } from "@/lib/supabase/admin";
import type { DateRange } from "@/lib/ads/types";
import { deriveMeasuredChannel, type Channel, type ManualConfidence } from "./channels";
import {
  loadOrdersAndManual, computeChannelStats, SMALL_SAMPLE_THRESHOLD,
  type ChannelStats, type PixelResolution, type DbOrderRow,
} from "./attribution-aggregator";
import { resolveSessionSource, type PixelSessionLike, type PixelResolvedSource } from "@/lib/pixel/matcher";
import { ppsAnswerToChannel, type PpsAnswer } from "@/lib/pixel/pps";

export type AttributionModel = "first" | "last";
export type SourceOrigin = "pixel" | "native" | "manual" | "survey" | "ghost";
export type BoardChannel = Exclude<Channel, "ghost"> | "direct";

export interface ResolvedSource {
  channel: BoardChannel | null; // null = ghost non résolu
  origin: SourceOrigin;
  confidence: number | null;
}

export interface BoardOrderInput {
  total_cents: number;
  native_channel: Exclude<Channel, "ghost"> | null;
  manual: { channel: Channel; confidence: ManualConfidence | null } | null;
  pixel: {
    source_first: PixelResolvedSource;
    source_last: PixelResolvedSource;
    confidence: number;
    match_method: string;
  } | null;
  survey: PpsAnswer | null;
}

// ── Hiérarchie pure (testée) ─────────────────────────────────────
export function resolveSourceHierarchy(o: BoardOrderInput, model: AttributionModel): ResolvedSource {
  // 1. Pixel Jestly — le toggle first/last ne joue qu'ici.
  if (o.pixel) {
    const source = model === "first" ? o.pixel.source_first : o.pixel.source_last;
    return { channel: source, origin: "pixel", confidence: o.pixel.confidence };
  }
  // 2. Shopify natif (first-touch, seul disponible).
  if (o.native_channel) {
    return { channel: o.native_channel, origin: "native", confidence: 1 };
  }
  // 3. Manuel — un ghost explicite force le non-attribué.
  if (o.manual) {
    if (o.manual.channel === "ghost") return { channel: null, origin: "ghost", confidence: null };
    const conf = o.manual.confidence === "sure" ? 0.9 : o.manual.confidence === "assumed" ? 0.6 : 0.3;
    return { channel: o.manual.channel as Exclude<Channel, "ghost">, origin: "manual", confidence: conf };
  }
  // 4. Survey déclaré client — jamais au-dessus de 1-3.
  if (o.survey) {
    return { channel: ppsAnswerToChannel(o.survey), origin: "survey", confidence: 0.5 };
  }
  // 5. Ghost.
  return { channel: null, origin: "ghost", confidence: null };
}

export interface ChannelRepartitionRow {
  channel: BoardChannel | "ghost";
  orders: number;
  revenue_cents: number;
  revenue_share: number | null;
  by_origin: Partial<Record<SourceOrigin, number>>;
  sample_small: boolean;
}

export function computeRepartition(orders: BoardOrderInput[], model: AttributionModel): ChannelRepartitionRow[] {
  const buckets = new Map<string, ChannelRepartitionRow>();
  let total = 0;
  for (const o of orders) {
    total += o.total_cents;
    const resolved = resolveSourceHierarchy(o, model);
    const key = resolved.channel ?? "ghost";
    const row = buckets.get(key) ?? {
      channel: key as ChannelRepartitionRow["channel"],
      orders: 0, revenue_cents: 0, revenue_share: null, by_origin: {}, sample_small: true,
    };
    row.orders += 1;
    row.revenue_cents += o.total_cents;
    row.by_origin[resolved.origin] = (row.by_origin[resolved.origin] ?? 0) + 1;
    buckets.set(key, row);
  }
  const rows = [...buckets.values()];
  for (const r of rows) {
    r.revenue_share = total > 0 ? Math.round((r.revenue_cents / total) * 1000) / 1000 : null;
    r.sample_small = r.orders < SMALL_SAMPLE_THRESHOLD;
  }
  return rows.sort((a, b) => b.revenue_cents - a.revenue_cents);
}

// ── Chargement + composition ─────────────────────────────────────
export interface BoardOrderRow extends BoardOrderInput {
  order_id: string;
  name: string | null;
  created_at: string;
  tracking_status: "tracked" | "ghost" | "unmatched" | null;
  resolved_first: ResolvedSource;
  resolved_last: ResolvedSource;
}

export interface AttributionBoard {
  orders: BoardOrderRow[];
  /** Triple ROAS Google Ads (mesuré / avec pixel / avec manuelles). */
  google_stats: ChannelStats | null;
  survey: {
    responses: Partial<Record<PpsAnswer, number>>;
    response_rate: number | null;
    recovered_orders: number;
    recovered_revenue_cents: number;
  };
}

interface PixelRowWithSession {
  order_id: string;
  session_id: string;
  shop_id: string;
  confidence: number;
  match_method: string;
  resolved_source: PixelResolvedSource;
}

export async function getAttributionBoard(userId: string, range: DateRange, integrationId?: string | null): Promise<AttributionBoard> {
  const supabase = createAdminClient();
  const { orders, manualByOrder, pixelByOrder } = await loadOrdersAndManual(userId, range, integrationId);
  const orderIds = (orders as DbOrderRow[]).map((o) => o.id);
  // Boutique ciblée résolue une fois pour scoper la dépense gads_daily.
  const { resolveShopifyIntegrationId } = await import("@/lib/shopify/resolve-integration");
  const integId = (await resolveShopifyIntegrationId(supabase, userId, integrationId)) ?? "";

  // GARDE-FOU MULTI-TENANT : pps_responses (service_role) est scopée aux
  // boutiques pixel de l'utilisateur — sinon on chargerait les réponses survey
  // de tous les tenants en mémoire avant de les re-filtrer.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: shopRows } = await (supabase.from("pixel_shops") as any).select("id").eq("user_id", userId);
  const pixelShopIds = ((shopRows ?? []) as Array<{ id: string }>).map((r) => r.id);

  // Pixel, survey, dépense et IDs Shopify en parallèle (une seule vague).
  const [pixelRows, ppsRows, gadsSpendRows, shopifyIdRows] = await Promise.all([
    orderIds.length > 0
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? (supabase.from("pixel_order_attribution") as any)
          .select("order_id, session_id, shop_id, confidence, match_method, resolved_source")
          .in("order_id", orderIds)
          .then(({ data }: { data: PixelRowWithSession[] | null }) => data ?? [])
      : Promise.resolve([] as PixelRowWithSession[]),
    orderIds.length > 0 && pixelShopIds.length > 0
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? (supabase.from("pps_responses") as any)
          .select("shopify_order_id, answer")
          .in("shop_id", pixelShopIds)
          .then(({ data }: { data: Array<{ shopify_order_id: string; answer: PpsAnswer }> | null }) => data ?? [])
      : Promise.resolve([]),
    // Dépense de la BOUTIQUE (gads_daily.integration_id).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("gads_daily") as any)
      .select("cost_cents")
      .eq("integration_id", integId)
      .gte("date", range.from)
      .lte("date", range.to)
      .then(({ data }: { data: Array<{ cost_cents: number }> | null }) => data ?? []),
    orderIds.length > 0
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? (supabase.from("shopify_orders") as any)
          .select("id, shopify_order_id")
          .in("id", orderIds)
          .then(({ data }: { data: Array<{ id: string; shopify_order_id: string }> | null }) => data ?? [])
      : Promise.resolve([]),
  ]);

  // Sessions des résolutions pixel → first vs last touch
  const sessionKeyOf = (p: PixelRowWithSession) => `${p.shop_id}|${p.session_id}`;
  const sessionByKey = new Map<string, PixelSessionLike>();
  if ((pixelRows as PixelRowWithSession[]).length > 0) {
    const sessionIds = [...new Set((pixelRows as PixelRowWithSession[]).map((p) => p.session_id))];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: sessions } = await (supabase.from("pixel_sessions") as any)
      .select("shop_id, session_id, gclid, gbraid, wbraid, utm_source, utm_medium, utm_campaign, referrer, last_touch")
      .in("session_id", sessionIds);
    for (const s of (sessions ?? []) as Array<PixelSessionLike & { shop_id: string; session_id: string }>) {
      sessionByKey.set(`${s.shop_id}|${s.session_id}`, s);
    }
  }
  const pixelDetail = new Map<string, BoardOrderInput["pixel"]>();
  for (const p of pixelRows as PixelRowWithSession[]) {
    const session = sessionByKey.get(sessionKeyOf(p));
    pixelDetail.set(p.order_id, {
      // first = colonnes first-touch (session sans last_touch) ; last = résolution stockée
      source_first: session ? resolveSessionSource({ ...session, last_touch: null }) : p.resolved_source,
      source_last: p.resolved_source,
      confidence: Number(p.confidence),
      match_method: p.match_method,
    });
  }

  // Survey par shopify_order_id → l'ID Shopify de chaque commande
  const shopifyIdByOrderId = new Map<string, string>();
  for (const r of shopifyIdRows as Array<{ id: string; shopify_order_id: string }>) {
    shopifyIdByOrderId.set(r.id, r.shopify_order_id);
  }
  const surveyByShopifyId = new Map<string, PpsAnswer>();
  for (const r of ppsRows as Array<{ shopify_order_id: string; answer: PpsAnswer }>) {
    surveyByShopifyId.set(r.shopify_order_id, r.answer);
  }

  const boardOrders: BoardOrderRow[] = (orders as DbOrderRow[]).map((o) => {
    const manualRaw = manualByOrder.get(o.id);
    const input: BoardOrderInput = {
      total_cents: Math.round((o.total_price ?? 0) * 100),
      native_channel: deriveMeasuredChannel(o),
      manual: manualRaw ? { channel: manualRaw.channel, confidence: manualRaw.confidence } : null,
      pixel: pixelDetail.get(o.id) ?? null,
      survey: surveyByShopifyId.get(shopifyIdByOrderId.get(o.id) ?? "") ?? null,
    };
    return {
      ...input,
      order_id: o.id,
      name: o.name,
      created_at: o.created_at,
      tracking_status: o.tracking_status,
      resolved_first: resolveSourceHierarchy(input, "first"),
      resolved_last: resolveSourceHierarchy(input, "last"),
    };
  });

  // Triple ROAS Google (mesuré / avec pixel / avec manuelles) — existant, non cassé.
  const spend = (gadsSpendRows as Array<{ cost_cents: number }>).reduce((s, g) => s + g.cost_cents, 0);
  const stats = computeChannelStats(
    boardOrders.map((o) => ({
      total_cents: o.total_cents,
      measured_channel: o.native_channel,
      manual: o.manual,
      pixel: pixelByOrder.get(o.order_id) ?? null,
    })),
    { google_ads: spend },
  );

  // Bloc survey : réponses, taux, CA récupéré (ghost sans pixel avec réponse)
  const responses: Partial<Record<PpsAnswer, number>> = {};
  let recoveredOrders = 0, recoveredRevenue = 0;
  for (const o of boardOrders) {
    if (o.survey) responses[o.survey] = (responses[o.survey] ?? 0) + 1;
    const resolved = o.resolved_last;
    if (resolved.origin === "survey") {
      recoveredOrders += 1;
      recoveredRevenue += o.total_cents;
    }
  }
  const answered = Object.values(responses).reduce((s, n) => s + (n ?? 0), 0);

  return {
    orders: boardOrders,
    google_stats: stats.find((s) => s.channel === "google_ads") ?? null,
    survey: {
      responses,
      response_rate: boardOrders.length > 0 ? Math.round((answered / boardOrders.length) * 1000) / 1000 : null,
      recovered_orders: recoveredOrders,
      recovered_revenue_cents: recoveredRevenue,
    },
  };
}
