/**
 * Blended Stats Board — chargement DB + composition (Phase 1B).
 * Toute la logique de calcul vit dans engine.ts (pur, testé).
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { getEcomSettings } from "@/lib/ads/roas-engine";
import { computeRollingRoas } from "@/lib/ads/aggregator";
import type { DateRange } from "@/lib/ads/types";
import { filterRealOrders } from "@/lib/shopify/test-orders-filter";
import { findMissingDates } from "@/lib/gads/importer";
import {
  computeBlendedStats, computeOrdersCogs, prorateExpenses,
  type BlendedOrder, type BlendedStats, type CustomExpenseRow, type ProductCostRow,
} from "./engine";

export interface BlendedTimelinePoint {
  date: string;
  revenue_cents: number;
  spend_cents: number;
  net_profit_cents: number | null;
  orders: number;
  rolling_mer: number | null;
  is_gap: boolean;
}

export interface DataQuality {
  tracked: number;
  ghost: number;
  unmatched: number;
  unknown: number;
  pixel_recovered: number;
  /** Part du CA attribuable (mesuré + pixel) sur le CA total (0-1). */
  attributable_revenue_share: number | null;
}

export interface BlendedBoard {
  current: BlendedStats;
  previous: BlendedStats;
  timeline: BlendedTimelinePoint[];
  quality: DataQuality;
  missing_dates: string[];
}

interface DbOrder {
  id: string;
  name: string | null;
  total_price: number | null;
  customer_id: string | null;
  created_at: string;
  tracking_status: string | null;
  line_items: Array<{ product_id?: string | null; quantity?: number | null }> | null;
}

function nextDayIso(day: string): string {
  return new Date(new Date(`${day}T00:00:00Z`).getTime() + 24 * 3600 * 1000).toISOString();
}

function previousRange(range: DateRange): DateRange {
  const from = new Date(`${range.from}T00:00:00Z`).getTime();
  const to = new Date(`${range.to}T00:00:00Z`).getTime();
  const days = Math.round((to - from) / 86_400_000) + 1;
  return {
    from: new Date(from - days * 86_400_000).toISOString().slice(0, 10),
    to: new Date(from - 86_400_000).toISOString().slice(0, 10),
  };
}

export async function getBlendedBoard(userId: string, range: DateRange): Promise<BlendedBoard> {
  const supabase = createAdminClient();
  const prev = previousRange(range);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: integ } = await (supabase.from("integrations") as any)
    .select("id")
    .eq("user_id", userId)
    .eq("provider", "shopify")
    .eq("status", "active")
    .maybeSingle();

  const [ordersBothPeriods, firstOrders, gadsRows, allGadsDates, costRows, expenseRows, settings] = await Promise.all([
    // Commandes des deux périodes en une requête (période précédente incluse)
    integ
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? (supabase.from("shopify_orders") as any)
          .select("id, name, total_price, customer_id, created_at, tracking_status, line_items")
          .eq("integration_id", integ.id)
          .is("cancelled_at", null)
          .gte("created_at", `${prev.from}T00:00:00Z`)
          .lt("created_at", nextDayIso(range.to))
          .then(({ data }: { data: DbOrder[] | null }) => filterRealOrders(data ?? []))
      : Promise.resolve([] as DbOrder[]),
    // Première commande de chaque client (historique complet) pour NC-ROAS/NCPA
    integ
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? (supabase.from("shopify_orders") as any)
          .select("customer_id, created_at")
          .eq("integration_id", integ.id)
          .is("cancelled_at", null)
          .not("customer_id", "is", null)
          .then(({ data }: { data: Array<{ customer_id: string; created_at: string }> | null }) => data ?? [])
      : Promise.resolve([]),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("gads_daily") as any)
      .select("date, cost_cents")
      .eq("user_id", userId)
      .gte("date", prev.from)
      .lte("date", range.to)
      .then(({ data }: { data: Array<{ date: string; cost_cents: number }> | null }) => data ?? []),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("gads_daily") as any)
      .select("date")
      .eq("user_id", userId)
      .then(({ data }: { data: Array<{ date: string }> | null }) => [...new Set((data ?? []).map((r) => r.date))]),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("ecom_product_costs") as any)
      .select("shopify_product_id, unit_cost_cents, effective_from")
      .eq("user_id", userId)
      .then(({ data }: { data: ProductCostRow[] | null }) => data ?? []),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("ecom_custom_expenses") as any)
      .select("label, amount_cents, period, starts_on, ends_on")
      .eq("user_id", userId)
      .then(({ data }: { data: CustomExpenseRow[] | null }) => data ?? []),
    getEcomSettings(userId),
  ]);

  const firstOrderAtByCustomer = new Map<string, string>();
  for (const r of firstOrders as Array<{ customer_id: string; created_at: string }>) {
    const cur = firstOrderAtByCustomer.get(r.customer_id);
    if (!cur || r.created_at < cur) firstOrderAtByCustomer.set(r.customer_id, r.created_at);
  }

  const fees = {
    shipping_cost_cents: settings.shipping_cost_cents ?? 0,
    payment_fee_percent: settings.payment_fee_percent ?? 0,
    payment_fee_fixed_cents: settings.payment_fee_fixed_cents ?? 0,
    packaging_cost_cents: settings.packaging_cost_cents ?? 0,
  };

  const toBlended = (o: DbOrder): BlendedOrder & DbOrder => ({
    ...o,
    total_cents: Math.round((o.total_price ?? 0) * 100),
    line_items: o.line_items ?? [],
  });
  const all = (ordersBothPeriods as DbOrder[]).map(toBlended);
  const inRange = (o: { created_at: string }, r: DateRange) =>
    o.created_at >= `${r.from}T00:00:00Z` && o.created_at < nextDayIso(r.to);
  const currentOrders = all.filter((o) => inRange(o, range));
  const previousOrders = all.filter((o) => inRange(o, prev));

  const spendIn = (r: DateRange) =>
    (gadsRows as Array<{ date: string; cost_cents: number }>)
      .filter((g) => g.date >= r.from && g.date <= r.to)
      .reduce((s, g) => s + g.cost_cents, 0);

  const stats = (orders: typeof currentOrders, r: DateRange): BlendedStats =>
    computeBlendedStats({
      orders,
      spend_cents: spendIn(r),
      costs: costRows as ProductCostRow[],
      fees,
      expenses: expenseRows as CustomExpenseRow[],
      range: r,
      firstOrderAtByCustomer,
    });

  const current = stats(currentOrders, range);
  const previous = stats(previousOrders, prev);

  // ── Qualité de donnée (bandeau 1C) ─────────────────────────────
  const quality: DataQuality = {
    tracked: 0, ghost: 0, unmatched: 0, unknown: 0, pixel_recovered: 0,
    attributable_revenue_share: null,
  };
  let attributableRevenue = 0;
  const pixelByOrder = new Set<string>();
  if (currentOrders.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: pixelRows } = await (supabase.from("pixel_order_attribution") as any)
      .select("order_id")
      .in("order_id", currentOrders.map((o) => o.id));
    for (const p of (pixelRows ?? []) as Array<{ order_id: string }>) pixelByOrder.add(p.order_id);
  }
  for (const o of currentOrders) {
    const bucket = (o.tracking_status ?? "unknown") as keyof Pick<DataQuality, "tracked" | "ghost" | "unmatched" | "unknown">;
    quality[bucket in quality ? bucket : "unknown"] += 1;
    const attributable = o.tracking_status === "tracked" || pixelByOrder.has(o.id);
    if (attributable) attributableRevenue += o.total_cents;
    if (o.tracking_status !== "tracked" && pixelByOrder.has(o.id)) quality.pixel_recovered += 1;
  }
  quality.attributable_revenue_share = current.revenue_cents > 0
    ? Math.round((attributableRevenue / current.revenue_cents) * 1000) / 1000
    : null;

  // ── Timeline : Revenue / Spend / Net Profit par jour + MER glissant 7 j ──
  const revenueByDay = new Map<string, { revenue: number; orders: number; cogs: number }>();
  for (const o of currentOrders) {
    const day = o.created_at.slice(0, 10);
    const cur = revenueByDay.get(day) ?? { revenue: 0, orders: 0, cogs: 0 };
    cur.revenue += o.total_cents;
    cur.orders += 1;
    cur.cogs += computeOrdersCogs([o], costRows as ProductCostRow[]).cogs_cents;
    revenueByDay.set(day, cur);
  }
  const spendByDay = new Map<string, number>();
  for (const g of gadsRows as Array<{ date: string; cost_cents: number }>) {
    if (g.date < range.from || g.date > range.to) continue;
    spendByDay.set(g.date, (spendByDay.get(g.date) ?? 0) + g.cost_cents);
  }
  const dailyExpenses = (expenseRows as CustomExpenseRow[]).length > 0
    ? prorateExpenses(expenseRows as CustomExpenseRow[], range) /
      (Math.round((new Date(`${range.to}T00:00:00Z`).getTime() - new Date(`${range.from}T00:00:00Z`).getTime()) / 86_400_000) + 1)
    : 0;
  const sortedGads = [...(allGadsDates as string[])].sort();
  const coveredFrom = sortedGads[0] ?? null;
  const coveredTo = sortedGads[sortedGads.length - 1] ?? null;
  const gadsDaySet = new Set(allGadsDates as string[]);

  const timeline: BlendedTimelinePoint[] = [];
  const fromT = new Date(`${range.from}T00:00:00Z`).getTime();
  const toT = new Date(`${range.to}T00:00:00Z`).getTime();
  for (let t = fromT; t <= toT; t += 86_400_000) {
    const day = new Date(t).toISOString().slice(0, 10);
    const r = revenueByDay.get(day) ?? { revenue: 0, orders: 0, cogs: 0 };
    const spend = spendByDay.get(day) ?? 0;
    const netProfit = current.costs_configured
      ? r.revenue - r.cogs - spend
        - (fees.shipping_cost_cents + fees.packaging_cost_cents + fees.payment_fee_fixed_cents) * r.orders
        - Math.round(r.revenue * (fees.payment_fee_percent / 100))
        - Math.round(dailyExpenses)
      : null;
    timeline.push({
      date: day,
      revenue_cents: r.revenue,
      spend_cents: spend,
      net_profit_cents: netProfit,
      orders: r.orders,
      rolling_mer: null,
      is_gap: coveredFrom != null && coveredTo != null && day >= coveredFrom && day <= coveredTo && !gadsDaySet.has(day),
    });
  }
  const rolling = computeRollingRoas(
    timeline.map((p) => ({ spend_cents: p.spend_cents, revenue_cents: p.revenue_cents })),
  );
  timeline.forEach((p, i) => { p.rolling_mer = rolling[i]; });

  return {
    current,
    previous,
    timeline,
    quality,
    missing_dates: findMissingDates(allGadsDates as string[]),
  };
}
