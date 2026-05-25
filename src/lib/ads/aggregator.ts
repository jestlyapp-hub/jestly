/**
 * Aggregator — requêtes optimisées pour les endpoints API du module Ads.
 * Utilise campaign_performance_daily comme source primaire (déjà computé).
 */
import { createAdminClient } from "@/lib/supabase/admin";
import type { AdsProvider, DateRange, ProfitStatus, CampaignRow } from "./types";
import { computeRoas } from "./roas-engine";

export interface OverviewKpis {
  range: DateRange;
  spend_cents: number;
  revenue_cents: number;
  orders: number;
  impressions: number;
  clicks: number;
  global_roas: number | null;
  avg_cpc_cents: number | null;
  avg_cpa_cents: number | null;
  profitable_campaigns: number;
  warning_campaigns: number;
  unprofitable_campaigns: number;
  total_campaigns: number;
}

export interface TimelinePoint {
  date: string;
  spend_cents: number;
  revenue_cents: number;
  orders: number;
  roas: number | null;
}

interface PerfRow {
  date: string; provider: string; campaign_id: string; campaign_name: string;
  campaign_status: string | null;
  ads_spend_cents: number; ads_impressions: number; ads_clicks: number;
  ads_outbound_clicks: number; ads_reported_roas: number | null;
  shopify_orders_count: number; shopify_revenue_cents: number;
  real_roas: number | null; profit_status: ProfitStatus; attribution_method: string | null;
  marginal_roas: number | null;
}

/** Une campagne est-elle archivée (cycle de vie Ads, pas le profit_status) ? */
function isArchived(status: string | null | undefined): boolean {
  return String(status ?? "").toUpperCase() === "ARCHIVED";
}

// ── Helpers DB ──────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchPerf(
  supabase: any, userId: string, range: DateRange,
  providers?: AdsProvider[], includeArchived = false,
): Promise<PerfRow[]> {
  let q = supabase.from("campaign_performance_daily")
    .select("date, provider, campaign_id, campaign_name, campaign_status, ads_spend_cents, ads_impressions, ads_clicks, ads_outbound_clicks, ads_reported_roas, shopify_orders_count, shopify_revenue_cents, real_roas, profit_status, attribution_method, marginal_roas")
    .eq("user_id", userId)
    .gte("date", range.from)
    .lte("date", range.to);
  if (providers && providers.length > 0) q = q.in("provider", providers);
  const { data } = await q;
  const rows = (data ?? []) as PerfRow[];
  // Par défaut on masque les campagnes archivées (toggle "Voir aussi les archivées").
  return includeArchived ? rows : rows.filter((r) => !isArchived(r.campaign_status));
}

// ── Overview KPIs ───────────────────────────────────────────────
export async function getOverviewKpis(userId: string, range: DateRange, providers?: AdsProvider[]): Promise<OverviewKpis> {
  const supabase = createAdminClient();
  const rows = await fetchPerf(supabase, userId, range, providers);

  let spend = 0, revenue = 0, orders = 0, impressions = 0, clicks = 0;
  const campaignsByStatus = { profitable: new Set<string>(), warning: new Set<string>(), unprofitable: new Set<string>(), unmatched: new Set<string>() };

  for (const r of rows) {
    spend += r.ads_spend_cents;
    revenue += r.shopify_revenue_cents;
    orders += r.shopify_orders_count;
    impressions += r.ads_impressions;
    clicks += r.ads_clicks;
    const k = `${r.provider}|${r.campaign_id}`;
    if (r.profit_status === "profitable") campaignsByStatus.profitable.add(k);
    else if (r.profit_status === "warning") campaignsByStatus.warning.add(k);
    else if (r.profit_status === "unprofitable") campaignsByStatus.unprofitable.add(k);
    else campaignsByStatus.unmatched.add(k);
  }

  return {
    range,
    spend_cents: spend,
    revenue_cents: revenue,
    orders,
    impressions,
    clicks,
    global_roas: computeRoas(revenue, spend),
    avg_cpc_cents: clicks > 0 ? Math.round(spend / clicks) : null,
    avg_cpa_cents: orders > 0 ? Math.round(spend / orders) : null,
    profitable_campaigns: campaignsByStatus.profitable.size,
    warning_campaigns: campaignsByStatus.warning.size,
    unprofitable_campaigns: campaignsByStatus.unprofitable.size,
    total_campaigns: campaignsByStatus.profitable.size + campaignsByStatus.warning.size + campaignsByStatus.unprofitable.size + campaignsByStatus.unmatched.size,
  };
}

// ── Timeline ────────────────────────────────────────────────────
export async function getTimeline(userId: string, range: DateRange, providers?: AdsProvider[]): Promise<TimelinePoint[]> {
  const supabase = createAdminClient();
  const rows = await fetchPerf(supabase, userId, range, providers);

  const byDay = new Map<string, { spend: number; revenue: number; orders: number }>();
  for (const r of rows) {
    const cur = byDay.get(r.date) ?? { spend: 0, revenue: 0, orders: 0 };
    cur.spend += r.ads_spend_cents;
    cur.revenue += r.shopify_revenue_cents;
    cur.orders += r.shopify_orders_count;
    byDay.set(r.date, cur);
  }

  const out: TimelinePoint[] = [];
  const fromD = new Date(range.from);
  const toD = new Date(range.to);
  for (let d = new Date(fromD); d <= toD; d.setDate(d.getDate() + 1)) {
    const day = d.toISOString().slice(0, 10);
    const v = byDay.get(day) ?? { spend: 0, revenue: 0, orders: 0 };
    out.push({
      date: day,
      spend_cents: v.spend, revenue_cents: v.revenue, orders: v.orders,
      roas: computeRoas(v.revenue, v.spend),
    });
  }
  return out;
}

// ── Campaigns list ──────────────────────────────────────────────
export interface CampaignsListParams {
  range: DateRange;
  providers?: AdsProvider[];
  status?: ProfitStatus;
  search?: string;
  sortBy?: "spend" | "revenue" | "roas" | "orders";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
  /** Inclure les campagnes archivées (default false). */
  includeArchived?: boolean;
}

export async function getCampaignsList(userId: string, params: CampaignsListParams): Promise<{ campaigns: CampaignRow[]; total: number }> {
  const supabase = createAdminClient();
  const rows = await fetchPerf(supabase, userId, params.range, params.providers, params.includeArchived ?? false);

  // Agrège par campaign
  const map = new Map<string, CampaignRow & { _statuses: ProfitStatus[] }>();
  for (const r of rows) {
    const key = `${r.provider}|${r.campaign_id}`;
    const cur = map.get(key) ?? {
      provider: r.provider as AdsProvider,
      campaign_id: r.campaign_id,
      campaign_name: r.campaign_name,
      lifecycle_status: r.campaign_status ?? null,
      spend_cents: 0, revenue_cents: 0, orders: 0, impressions: 0, clicks: 0,
      ads_reported_roas: null, real_roas: null, marginal_roas: null,
      profit_status: "unmatched" as ProfitStatus,
      attribution_method: null,
      _statuses: [] as ProfitStatus[],
    };
    cur.spend_cents += r.ads_spend_cents;
    cur.revenue_cents += r.shopify_revenue_cents;
    cur.orders += r.shopify_orders_count;
    cur.impressions += r.ads_impressions;
    cur.clicks += r.ads_clicks;
    cur._statuses.push(r.profit_status);
    if (r.campaign_status != null) cur.lifecycle_status = r.campaign_status;
    if (r.attribution_method) cur.attribution_method = (r.attribution_method as CampaignRow["attribution_method"]);
    if (r.ads_reported_roas != null) cur.ads_reported_roas = r.ads_reported_roas;
    map.set(key, cur);
  }

  // Recompute aggregated real_roas + profit_status
  const aggregated = [...map.values()].map((c) => {
    c.real_roas = computeRoas(c.revenue_cents, c.spend_cents);
    // Status agrégé : pire des statuts daily (unprofitable > warning > profitable > unmatched)
    const order: Record<ProfitStatus, number> = { unprofitable: 4, warning: 3, profitable: 2, unmatched: 1 };
    c.profit_status = c._statuses.reduce<ProfitStatus>((worst, s) => (order[s] > order[worst] ? s : worst), "unmatched");
    delete (c as { _statuses?: ProfitStatus[] })._statuses;
    return c as CampaignRow;
  });

  // Filtres
  let filtered = aggregated;
  if (params.status) filtered = filtered.filter((c) => c.profit_status === params.status);
  if (params.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter((c) => c.campaign_name.toLowerCase().includes(q));
  }

  // Tri
  const sortBy = params.sortBy ?? "spend";
  const sortOrder = params.sortOrder ?? "desc";
  filtered.sort((a, b) => {
    const va = sortBy === "spend" ? a.spend_cents : sortBy === "revenue" ? a.revenue_cents : sortBy === "roas" ? (a.real_roas ?? -1) : a.orders;
    const vb = sortBy === "spend" ? b.spend_cents : sortBy === "revenue" ? b.revenue_cents : sortBy === "roas" ? (b.real_roas ?? -1) : b.orders;
    return sortOrder === "asc" ? va - vb : vb - va;
  });

  const total = filtered.length;
  const offset = params.offset ?? 0;
  const limit = params.limit ?? 50;
  return { campaigns: filtered.slice(offset, offset + limit), total };
}

// ── Campaign detail ─────────────────────────────────────────────
export async function getCampaignDetail(
  userId: string, campaignId: string, provider: AdsProvider, range: DateRange,
) {
  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rows } = await (supabase.from("campaign_performance_daily") as any)
    .select("*")
    .eq("user_id", userId)
    .eq("provider", provider)
    .eq("campaign_id", campaignId)
    .gte("date", range.from)
    .lte("date", range.to)
    .order("date");

  // Totaux
  const totals = { spend: 0, revenue: 0, orders: 0, impressions: 0, clicks: 0, outbound: 0 };
  const orderIds = new Set<string>();
  let campaignName = "";
  for (const r of (rows ?? []) as Array<Record<string, unknown>>) {
    totals.spend += Number(r.ads_spend_cents ?? 0);
    totals.revenue += Number(r.shopify_revenue_cents ?? 0);
    totals.orders += Number(r.shopify_orders_count ?? 0);
    totals.impressions += Number(r.ads_impressions ?? 0);
    totals.clicks += Number(r.ads_clicks ?? 0);
    totals.outbound += Number(r.ads_outbound_clicks ?? 0);
    for (const id of (r.shopify_attributable_order_ids as string[]) ?? []) orderIds.add(id);
    if (r.campaign_name) campaignName = String(r.campaign_name);
  }

  const timeline = ((rows ?? []) as Array<Record<string, unknown>>).map((r) => ({
    date: r.date as string,
    spend_cents: Number(r.ads_spend_cents ?? 0),
    revenue_cents: Number(r.shopify_revenue_cents ?? 0),
    orders: Number(r.shopify_orders_count ?? 0),
    roas: r.real_roas != null ? Number(r.real_roas) : null,
  }));

  return {
    campaign: {
      provider, campaign_id: campaignId, campaign_name: campaignName,
      ...totals,
      real_roas: computeRoas(totals.revenue, totals.spend),
      ctr: totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : null,
      cpc_cents: totals.clicks > 0 ? Math.round(totals.spend / totals.clicks) : null,
    },
    timeline,
    funnel: {
      impressions: totals.impressions,
      clicks: totals.clicks,
      outbound_clicks: totals.outbound,
      orders: totals.orders,
    },
    attributed_order_ids: [...orderIds],
  };
}

// ── Top campaigns ───────────────────────────────────────────────
export async function getTopCampaigns(
  userId: string, range: DateRange, type: "profitable" | "unprofitable", limit = 5,
): Promise<CampaignRow[]> {
  const { campaigns } = await getCampaignsList(userId, {
    range,
    status: type,
    sortBy: type === "profitable" ? "revenue" : "spend",
    sortOrder: "desc",
    limit,
  });
  return campaigns;
}

// ── Heatmap (day of week × hour) ────────────────────────────────
export interface HeatmapCell { day_of_week: number; hour: number; value: number; orders: number; spend_cents: number; revenue_cents: number }

export async function getHeatmap(
  userId: string, range: DateRange, metric: "roas" | "spend" | "revenue" | "orders",
): Promise<HeatmapCell[]> {
  const supabase = createAdminClient();
  // Pour la heatmap on a besoin des orders avec leur created_at horaire
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: integs } = await (supabase.from("integrations") as any)
    .select("id").eq("user_id", userId).eq("provider", "shopify").eq("status", "active");
  const integIds = (integs ?? []).map((i: { id: string }) => i.id);
  if (integIds.length === 0) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: orders } = await (supabase.from("shopify_orders") as any)
    .select("created_at, total_price")
    .in("integration_id", integIds)
    .gte("created_at", range.from + "T00:00:00")
    .lte("created_at", range.to + "T23:59:59");

  // Pour le spend on agrège campaign_perf par date (pas d'horaire dispo Pinterest)
  // → spend / revenue par cellule = spend total du jour distribué uniformément
  const cells = new Map<string, HeatmapCell>();
  for (let d = 0; d < 7; d++) for (let h = 0; h < 24; h++) {
    cells.set(`${d}|${h}`, { day_of_week: d, hour: h, value: 0, orders: 0, spend_cents: 0, revenue_cents: 0 });
  }

  for (const o of (orders ?? []) as Array<{ created_at: string; total_price: number }>) {
    const date = new Date(o.created_at);
    const dow = date.getUTCDay();
    const hour = date.getUTCHours();
    const cell = cells.get(`${dow}|${hour}`)!;
    cell.orders += 1;
    cell.revenue_cents += Math.round(o.total_price * 100);
  }

  // Set value selon le métrique
  for (const cell of cells.values()) {
    if (metric === "orders") cell.value = cell.orders;
    else if (metric === "revenue") cell.value = cell.revenue_cents;
    else if (metric === "spend") cell.value = cell.spend_cents;
    else cell.value = cell.spend_cents > 0 ? cell.revenue_cents / cell.spend_cents : 0;
  }

  return [...cells.values()];
}
