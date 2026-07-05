/**
 * Agrégateur Google Ads — croise la dépense CSV (gads_daily) avec le CA
 * Shopify réel (shopify_orders) pour les 3 vues du dashboard.
 *
 * Règles héritées de l'audit ROAS :
 *  - le ROAS décisionnel est TOUJOURS SUM(revenue) / SUM(spend) sur la période
 *    (jamais un ROAS journalier isolé — bug 5,78 documenté) ;
 *  - garde-fou `insufficient_data` via determinePeriodStatus ;
 *  - courbe lissée via computeRollingRoas (7 jours glissants) ;
 *  - les overrides manuels restent SÉPARÉS : "ROAS données brutes" et
 *    "ROAS avec overrides" sont exposés côte à côte, jamais fondus.
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { computeRoas, getEcomSettings } from "@/lib/ads/roas-engine";
import { computeRollingRoas, determinePeriodStatus } from "@/lib/ads/aggregator";
import type { AggregatedProfitStatus, DateRange } from "@/lib/ads/types";
import { filterRealOrders } from "@/lib/shopify/test-orders-filter";
import { findMissingDates } from "./importer";
import { deriveMeasuredChannel } from "./channels";

// ── Types exposés aux routes ─────────────────────────────────────
export interface GadsOverview {
  range: DateRange;
  // Google Ads (CSV)
  spend_cents: number;
  clicks: number;
  impressions: number;
  conversions: number;
  conversion_value_cents: number;
  reported_roas: number | null; // ROAS déclaré par Google (valeur de conv. / coût)
  // Shopify réel
  shopify_revenue_cents: number;
  shopify_orders: number;
  real_roas: number | null; // SUM(CA Shopify) / SUM(coût CSV) sur la période
  status: AggregatedProfitStatus;
  // Traçabilité des commandes de la période
  tracked_orders: number;
  ghost_orders: number;
  unmatched_orders: number;
  unknown_orders: number;
  // Overrides manuels (séparés, jamais fondus)
  manual_revenue_cents: number;
  manual_orders: number;
  roas_with_manual: number | null;
  // Qualité de la donnée Ads
  missing_dates: string[];
  covered_range: DateRange | null;
}

export interface GadsTimelinePoint {
  date: string;
  cost_cents: number;
  clicks: number;
  conversions: number;
  shopify_revenue_cents: number;
  shopify_orders: number;
  /** ROAS du jour isolé — INDICATIF uniquement, jamais décisionnel. */
  day_roas: number | null;
  /** ROAS lissé 7 jours glissants (SUM/SUM) — la courbe décisionnelle. */
  rolling_roas: number | null;
  /** Jour dans la plage couverte mais sans aucune ligne Ads (trou CSV). */
  is_gap: boolean;
}

export type TrackingBucket = "tracked" | "ghost" | "unmatched" | "unknown";

export interface GadsAttribution {
  range: DateRange;
  breakdown: Array<{
    status: TrackingBucket;
    orders: number;
    revenue_cents: number;
    revenue_share: number | null; // part du CA total de la période (0-1)
  }>;
  /** CA qui échappe à l'attribution (ghost + unmatched + inconnu). */
  shadow_revenue_cents: number;
  shadow_share: number | null;
  /** Commandes rattachables à Google (utm/referrer/gclid → google). */
  google_attributed_orders: number;
  google_attributed_revenue_cents: number;
  /** Comparaison de confiance. */
  roas_declared: number | null;        // valeur de conv. Google / coût CSV
  roas_crossed: number | null;         // CA Shopify total / coût CSV
  roas_google_attributed: number | null; // CA Shopify attribué Google / coût CSV
  /** Mesuré Google + commandes fantômes résolues google_ads par le pixel. */
  roas_google_with_pixel: number | null;
  roas_with_manual: number | null;     // (CA Shopify + overrides) / coût CSV
  manual_revenue_cents: number;
  manual_orders: number;
  /** Sources récupérées par le pixel Jestly sur les commandes non attribuables. */
  pixel_recovered: {
    orders: number;
    revenue_cents: number;
    by_source: Array<{ source: string; orders: number; revenue_cents: number }>;
  };
}

// ── Chargement des données ───────────────────────────────────────
interface GadsDailyRow {
  campaign_name: string;
  date: string;
  cost_cents: number;
  clicks: number;
  impressions: number;
  conversions: number;
  conversion_value_cents: number;
}

interface ShopifyOrderRow {
  id: string;
  name: string | null;
  total_price: number | null;
  created_at: string;
  tracking_status: TrackingBucket | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  referring_site: string | null;
  landing_site: string | null;
}

interface ManualOverrideRow {
  id: string;
  date: string;
  campaign_name: string | null;
  revenue_cents: number;
  orders_count: number;
  note: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function loadGadsDaily(supabase: any, userId: string, range: DateRange): Promise<GadsDailyRow[]> {
  const { data, error } = await supabase.from("gads_daily")
    .select("campaign_name, date, cost_cents, clicks, impressions, conversions, conversion_value_cents")
    .eq("user_id", userId)
    .gte("date", range.from)
    .lte("date", range.to);
  if (error) throw new Error(`Lecture gads_daily échouée : ${error.message}`);
  return (data ?? []) as GadsDailyRow[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function loadShopifyOrders(supabase: any, userId: string, range: DateRange): Promise<ShopifyOrderRow[]> {
  const { data: integ } = await supabase.from("integrations")
    .select("id")
    .eq("user_id", userId)
    .eq("provider", "shopify")
    .eq("status", "active")
    .maybeSingle();
  if (!integ) return [];

  const { data, error } = await supabase.from("shopify_orders")
    .select("id, name, total_price, created_at, tracking_status, utm_source, utm_medium, utm_campaign, referring_site, landing_site")
    .eq("integration_id", integ.id)
    .is("cancelled_at", null)
    .gte("created_at", `${range.from}T00:00:00Z`)
    .lt("created_at", nextDayIso(range.to));
  if (error) throw new Error(`Lecture shopify_orders échouée : ${error.message}`);
  // Commandes de test exclues des analytics (même règle que le dashboard ECOM).
  return filterRealOrders((data ?? []) as ShopifyOrderRow[]);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function loadManualOverrides(supabase: any, userId: string, range: DateRange): Promise<ManualOverrideRow[]> {
  const { data, error } = await supabase.from("gads_manual_overrides")
    .select("id, date, campaign_name, revenue_cents, orders_count, note")
    .eq("user_id", userId)
    .gte("date", range.from)
    .lte("date", range.to);
  if (error) throw new Error(`Lecture gads_manual_overrides échouée : ${error.message}`);
  return (data ?? []) as ManualOverrideRow[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function loadAllGadsDates(supabase: any, userId: string): Promise<string[]> {
  const { data } = await supabase.from("gads_daily").select("date").eq("user_id", userId);
  return [...new Set(((data ?? []) as Array<{ date: string }>).map((r) => r.date))];
}

// ── Helpers ──────────────────────────────────────────────────────
function nextDayIso(day: string): string {
  const t = new Date(`${day}T00:00:00Z`).getTime() + 24 * 3600 * 1000;
  return new Date(t).toISOString();
}

function toCents(price: number | null): number {
  return Math.round((price ?? 0) * 100);
}

/**
 * La commande est-elle rattachable à Google Ads (payant) ?
 * Délègue à deriveMeasuredChannel : un referrer google.com sans gclid ni utm
 * est du SEO organique, pas du Google Ads — le compter gonflerait le ROAS.
 */
export function isGoogleAttributed(order: {
  tracking_status?: string | null;
  utm_source?: string | null; utm_medium?: string | null; utm_campaign?: string | null;
  referring_site?: string | null; landing_site?: string | null;
}): boolean {
  return deriveMeasuredChannel(order) === "google_ads";
}

function bucketOf(status: TrackingBucket | null): TrackingBucket {
  return status ?? "unknown";
}

// ── Vue 1 : Pilotage ─────────────────────────────────────────────
export async function getGadsOverview(userId: string, range: DateRange): Promise<GadsOverview> {
  const supabase = createAdminClient();
  const [gads, orders, manual, allDates, settings] = await Promise.all([
    loadGadsDaily(supabase, userId, range),
    loadShopifyOrders(supabase, userId, range),
    loadManualOverrides(supabase, userId, range),
    loadAllGadsDates(supabase, userId),
    getEcomSettings(userId),
  ]);

  let spend = 0, clicks = 0, impressions = 0, conversions = 0, convValue = 0;
  for (const g of gads) {
    spend += g.cost_cents;
    clicks += g.clicks;
    impressions += g.impressions;
    conversions += g.conversions;
    convValue += g.conversion_value_cents;
  }

  let revenue = 0;
  const counts: Record<TrackingBucket, number> = { tracked: 0, ghost: 0, unmatched: 0, unknown: 0 };
  for (const o of orders) {
    revenue += toCents(o.total_price);
    counts[bucketOf(o.tracking_status)] += 1;
  }

  const manualRevenue = manual.reduce((s, m) => s + m.revenue_cents, 0);
  const manualOrders = manual.reduce((s, m) => s + m.orders_count, 0);

  const sortedDates = [...allDates].sort();
  return {
    range,
    spend_cents: spend,
    clicks,
    impressions,
    conversions: Math.round(conversions * 100) / 100,
    conversion_value_cents: convValue,
    reported_roas: computeRoas(convValue, spend),
    shopify_revenue_cents: revenue,
    shopify_orders: orders.length,
    real_roas: computeRoas(revenue, spend),
    status: determinePeriodStatus(
      { spend_cents: spend, revenue_cents: revenue, orders: orders.length },
      settings,
    ),
    tracked_orders: counts.tracked,
    ghost_orders: counts.ghost,
    unmatched_orders: counts.unmatched,
    unknown_orders: counts.unknown,
    manual_revenue_cents: manualRevenue,
    manual_orders: manualOrders,
    roas_with_manual: computeRoas(revenue + manualRevenue, spend),
    missing_dates: findMissingDates(allDates),
    covered_range: sortedDates.length > 0
      ? { from: sortedDates[0], to: sortedDates[sortedDates.length - 1] }
      : null,
  };
}

// ── Vue 2 : Détail temporel ──────────────────────────────────────
export async function getGadsTimeline(userId: string, range: DateRange): Promise<GadsTimelinePoint[]> {
  const supabase = createAdminClient();
  const [gads, orders, allDates] = await Promise.all([
    loadGadsDaily(supabase, userId, range),
    loadShopifyOrders(supabase, userId, range),
    loadAllGadsDates(supabase, userId),
  ]);

  const gadsByDay = new Map<string, { cost: number; clicks: number; conversions: number }>();
  for (const g of gads) {
    const cur = gadsByDay.get(g.date) ?? { cost: 0, clicks: 0, conversions: 0 };
    cur.cost += g.cost_cents;
    cur.clicks += g.clicks;
    cur.conversions += g.conversions;
    gadsByDay.set(g.date, cur);
  }

  const revenueByDay = new Map<string, { revenue: number; orders: number }>();
  for (const o of orders) {
    const day = o.created_at.slice(0, 10);
    const cur = revenueByDay.get(day) ?? { revenue: 0, orders: 0 };
    cur.revenue += toCents(o.total_price);
    cur.orders += 1;
    revenueByDay.set(day, cur);
  }

  const sortedDates = [...allDates].sort();
  const coveredFrom = sortedDates[0] ?? null;
  const coveredTo = sortedDates[sortedDates.length - 1] ?? null;
  const daysWithAds = new Set(allDates);

  const points: GadsTimelinePoint[] = [];
  const from = new Date(`${range.from}T00:00:00Z`).getTime();
  const to = new Date(`${range.to}T00:00:00Z`).getTime();
  for (let t = from; t <= to; t += 24 * 3600 * 1000) {
    const day = new Date(t).toISOString().slice(0, 10);
    const g = gadsByDay.get(day) ?? { cost: 0, clicks: 0, conversions: 0 };
    const r = revenueByDay.get(day) ?? { revenue: 0, orders: 0 };
    const inCoveredRange = coveredFrom != null && coveredTo != null && day >= coveredFrom && day <= coveredTo;
    points.push({
      date: day,
      cost_cents: g.cost,
      clicks: g.clicks,
      conversions: Math.round(g.conversions * 100) / 100,
      shopify_revenue_cents: r.revenue,
      shopify_orders: r.orders,
      day_roas: computeRoas(r.revenue, g.cost),
      rolling_roas: null, // rempli ci-dessous
      is_gap: inCoveredRange && !daysWithAds.has(day),
    });
  }

  const rolling = computeRollingRoas(
    points.map((p) => ({ spend_cents: p.cost_cents, revenue_cents: p.shopify_revenue_cents })),
  );
  points.forEach((p, i) => { p.rolling_roas = rolling[i]; });
  return points;
}

// ── Vue 3 : Attribution / qualité de la donnée ───────────────────
export async function getGadsAttribution(userId: string, range: DateRange): Promise<GadsAttribution> {
  const supabase = createAdminClient();
  const [gads, orders, manual] = await Promise.all([
    loadGadsDaily(supabase, userId, range),
    loadShopifyOrders(supabase, userId, range),
    loadManualOverrides(supabase, userId, range),
  ]);

  // Sources récupérées par le pixel first-party (jamais fondues dans le natif).
  const pixelByOrder = new Map<string, string>();
  if (orders.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: pixelRows } = await (supabase.from("pixel_order_attribution") as any)
      .select("order_id, resolved_source")
      .in("order_id", orders.map((o) => o.id));
    for (const p of (pixelRows ?? []) as Array<{ order_id: string; resolved_source: string }>) {
      pixelByOrder.set(p.order_id, p.resolved_source);
    }
  }

  const spend = gads.reduce((s, g) => s + g.cost_cents, 0);
  const convValue = gads.reduce((s, g) => s + g.conversion_value_cents, 0);

  const agg: Record<TrackingBucket, { orders: number; revenue: number }> = {
    tracked: { orders: 0, revenue: 0 },
    ghost: { orders: 0, revenue: 0 },
    unmatched: { orders: 0, revenue: 0 },
    unknown: { orders: 0, revenue: 0 },
  };
  let totalRevenue = 0;
  let googleOrders = 0, googleRevenue = 0;
  let pixelGoogleRevenue = 0;
  const pixelRecovered = { orders: 0, revenue_cents: 0 };
  const pixelBySource = new Map<string, { orders: number; revenue_cents: number }>();
  for (const o of orders) {
    const cents = toCents(o.total_price);
    totalRevenue += cents;
    const b = bucketOf(o.tracking_status);
    agg[b].orders += 1;
    agg[b].revenue += cents;
    if (isGoogleAttributed(o)) {
      googleOrders += 1;
      googleRevenue += cents;
    } else if (b !== "tracked") {
      // Commande non attribuable côté Shopify : le pixel a-t-il récupéré la source ?
      const source = pixelByOrder.get(o.id);
      if (source) {
        pixelRecovered.orders += 1;
        pixelRecovered.revenue_cents += cents;
        const cur = pixelBySource.get(source) ?? { orders: 0, revenue_cents: 0 };
        cur.orders += 1;
        cur.revenue_cents += cents;
        pixelBySource.set(source, cur);
        if (source === "google_ads") pixelGoogleRevenue += cents;
      }
    }
  }

  const share = (cents: number): number | null =>
    totalRevenue > 0 ? Math.round((cents / totalRevenue) * 1000) / 1000 : null;

  const shadow = agg.ghost.revenue + agg.unmatched.revenue + agg.unknown.revenue;
  const manualRevenue = manual.reduce((s, m) => s + m.revenue_cents, 0);
  const manualOrders = manual.reduce((s, m) => s + m.orders_count, 0);

  return {
    range,
    breakdown: (["tracked", "ghost", "unmatched", "unknown"] as TrackingBucket[]).map((status) => ({
      status,
      orders: agg[status].orders,
      revenue_cents: agg[status].revenue,
      revenue_share: share(agg[status].revenue),
    })),
    shadow_revenue_cents: shadow,
    shadow_share: share(shadow),
    google_attributed_orders: googleOrders,
    google_attributed_revenue_cents: googleRevenue,
    roas_declared: computeRoas(convValue, spend),
    roas_crossed: computeRoas(totalRevenue, spend),
    roas_google_attributed: computeRoas(googleRevenue, spend),
    roas_google_with_pixel: computeRoas(googleRevenue + pixelGoogleRevenue, spend),
    roas_with_manual: computeRoas(totalRevenue + manualRevenue, spend),
    manual_revenue_cents: manualRevenue,
    manual_orders: manualOrders,
    pixel_recovered: {
      orders: pixelRecovered.orders,
      revenue_cents: pixelRecovered.revenue_cents,
      by_source: [...pixelBySource.entries()]
        .map(([source, v]) => ({ source, ...v }))
        .sort((a, b) => b.revenue_cents - a.revenue_cents),
    },
  };
}
