/**
 * ROAS Engine — orchestration du calcul performance campagnes.
 *
 * Pour chaque (user, provider, campaign, jour) dans la fenêtre :
 *  1. Récupère metrics Ads (pinterest_metrics_daily ou équivalent provider)
 *  2. Pour chaque order Shopify du jour, run le matcher
 *  3. Agrège les orders attribués par campagne (× attribution_weight)
 *  4. Calcule real_roas, marginal_roas, profit_status
 *  5. Upsert dans campaign_performance_daily
 *  6. Trace dans order_attribution_touches
 *
 * Idempotent : ré-exécution écrase les rows existantes pour la même clé.
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";
import { matchOrderToCampaign } from "./matcher";
import { detectAlerts } from "./alerts-engine";
import { DEFAULT_ECOM_SETTINGS } from "./types";
import type { AdsProvider, EcomSettings, ProfitStatus, MatchResult } from "./types";

interface RefreshParams {
  userId: string;
  daysBack?: number;
  providers?: AdsProvider[];
  fullRecompute?: boolean;
}

interface RefreshResult {
  rows_upserted: number;
  duration_ms: number;
  alerts_generated: number;
}

// ── Public helpers ──────────────────────────────────────────────
export function computeRoas(revenueCents: number, spendCents: number): number | null {
  if (spendCents <= 0) return null;
  return Math.round((revenueCents / spendCents) * 10000) / 10000;
}

export function computeMarginalRoas(
  revenueCents: number, spendCents: number, marginPercent: number,
): number | null {
  if (spendCents <= 0) return null;
  const margin = marginPercent / 100;
  return Math.round(((revenueCents * margin) / spendCents) * 10000) / 10000;
}

export function determineProfitStatus(
  realRoas: number | null,
  profitThreshold: number,
  warningThreshold: number,
): ProfitStatus {
  if (realRoas == null) return "unmatched";
  if (realRoas >= profitThreshold) return "profitable";
  if (realRoas >= warningThreshold) return "warning";
  return "unprofitable";
}

// ── Settings loader (avec defaults) ─────────────────────────────
export async function getEcomSettings(userId: string): Promise<EcomSettings> {
  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from("ecom_settings") as any)
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (data) return data as EcomSettings;
  return { user_id: userId, ...DEFAULT_ECOM_SETTINGS };
}

// ── Récupère metrics + campaign info par provider ───────────────
interface DailyMetricsRow {
  date: string;
  campaign_id: string;
  campaign_name: string;
  campaign_status: string | null; // cycle de vie (ACTIVE/PAUSED/ARCHIVED)
  spend_cents: number;
  impressions: number;
  clicks: number;
  outbound_clicks: number;
  conversions: number;
  conversion_value_cents: number;
  ads_reported_roas: number | null;
}

async function loadMetricsByProvider(
  userId: string, provider: AdsProvider, fromIso: string, toIso: string,
): Promise<DailyMetricsRow[]> {
  if (provider !== "pinterest") return []; // V1 = Pinterest only

  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: integ } = await (supabase.from("integrations") as any)
    .select("id")
    .eq("user_id", userId)
    .eq("provider", "pinterest")
    .eq("status", "active")
    .maybeSingle();
  if (!integ) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rows } = await (supabase.from("pinterest_metrics_daily") as any)
    .select("date, entity_id, spend_cents, impressions, clicks, outbound_clicks, conversions, conversion_value_cents, pinterest_reported_roas")
    .eq("integration_id", integ.id)
    .eq("entity_type", "campaign")
    .gte("date", fromIso)
    .lte("date", toIso);

  // Récupère le nom + statut de cycle de vie des campagnes
  const ids = [...new Set((rows ?? []).map((r: { entity_id: string }) => r.entity_id))];
  const nameMap = new Map<string, string>();
  const statusMap = new Map<string, string | null>();
  if (ids.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: camps } = await (supabase.from("pinterest_campaigns") as any)
      .select("pinterest_campaign_id, name, status")
      .eq("integration_id", integ.id)
      .in("pinterest_campaign_id", ids);
    for (const c of (camps ?? []) as Array<{ pinterest_campaign_id: string; name: string; status: string | null }>) {
      nameMap.set(c.pinterest_campaign_id, c.name);
      statusMap.set(c.pinterest_campaign_id, c.status ?? null);
    }
  }

  return (rows ?? []).map((r: Record<string, unknown>) => ({
    date: r.date as string,
    campaign_id: r.entity_id as string,
    campaign_name: nameMap.get(r.entity_id as string) ?? String(r.entity_id),
    campaign_status: statusMap.get(r.entity_id as string) ?? null,
    spend_cents: Number(r.spend_cents ?? 0),
    impressions: Number(r.impressions ?? 0),
    clicks: Number(r.clicks ?? 0),
    outbound_clicks: Number(r.outbound_clicks ?? 0),
    conversions: Number(r.conversions ?? 0),
    conversion_value_cents: Number(r.conversion_value_cents ?? 0),
    ads_reported_roas: r.pinterest_reported_roas != null ? Number(r.pinterest_reported_roas) : null,
  }));
}

// ── Metrics ad-level (grain créatif/visuel) ─────────────────────
interface AdDailyMetricsRow {
  date: string;
  ad_id: string;
  ad_name: string | null;
  ad_group_id: string | null;
  campaign_id: string | null;
  campaign_name: string | null;
  pin_id: string | null;
  spend_cents: number;
  impressions: number;
  clicks: number;
  conversions: number;
  conversion_value_cents: number;
  ctr: number | null;
  cpc_cents: number | null;
}

async function loadAdMetricsByProvider(
  userId: string, provider: AdsProvider, fromIso: string, toIso: string,
): Promise<AdDailyMetricsRow[]> {
  if (provider !== "pinterest") return []; // V1 = Pinterest only

  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: integ } = await (supabase.from("integrations") as any)
    .select("id")
    .eq("user_id", userId)
    .eq("provider", "pinterest")
    .eq("status", "active")
    .maybeSingle();
  if (!integ) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rows } = await (supabase.from("pinterest_metrics_daily") as any)
    .select("date, entity_id, spend_cents, impressions, clicks, conversions, conversion_value_cents, ctr, cpc_cents")
    .eq("integration_id", integ.id)
    .eq("entity_type", "ad")
    .gte("date", fromIso)
    .lte("date", toIso);
  if (!rows || rows.length === 0) return [];

  // Résout la hiérarchie ad → ad_group → campaign (+ noms, pin)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: ads } = await (supabase.from("pinterest_ads") as any)
    .select("pinterest_ad_id, name, ad_group_id, pin_id")
    .eq("integration_id", integ.id);
  const adInfo = new Map<string, { name: string | null; ad_group_id: string; pin_id: string | null }>();
  for (const a of (ads ?? []) as Array<{ pinterest_ad_id: string; name: string | null; ad_group_id: string; pin_id: string | null }>) {
    adInfo.set(a.pinterest_ad_id, { name: a.name ?? null, ad_group_id: a.ad_group_id, pin_id: a.pin_id ?? null });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: adGroups } = await (supabase.from("pinterest_ad_groups") as any)
    .select("pinterest_ad_group_id, campaign_id")
    .eq("integration_id", integ.id);
  const campaignByAdGroup = new Map<string, string>();
  for (const g of (adGroups ?? []) as Array<{ pinterest_ad_group_id: string; campaign_id: string }>) {
    campaignByAdGroup.set(g.pinterest_ad_group_id, g.campaign_id);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: camps } = await (supabase.from("pinterest_campaigns") as any)
    .select("pinterest_campaign_id, name")
    .eq("integration_id", integ.id);
  const campaignName = new Map<string, string>();
  for (const c of (camps ?? []) as Array<{ pinterest_campaign_id: string; name: string }>) {
    campaignName.set(c.pinterest_campaign_id, c.name);
  }

  return (rows as Array<Record<string, unknown>>).map((r) => {
    const adId = r.entity_id as string;
    const info = adInfo.get(adId);
    const campaignId = info ? (campaignByAdGroup.get(info.ad_group_id) ?? null) : null;
    return {
      date: r.date as string,
      ad_id: adId,
      ad_name: info?.name ?? null,
      ad_group_id: info?.ad_group_id ?? null,
      campaign_id: campaignId,
      campaign_name: campaignId ? (campaignName.get(campaignId) ?? null) : null,
      pin_id: info?.pin_id ?? null,
      spend_cents: Number(r.spend_cents ?? 0),
      impressions: Number(r.impressions ?? 0),
      clicks: Number(r.clicks ?? 0),
      conversions: Number(r.conversions ?? 0),
      conversion_value_cents: Number(r.conversion_value_cents ?? 0),
      ctr: r.ctr != null ? Number(r.ctr) : null,
      cpc_cents: r.cpc_cents != null ? Number(r.cpc_cents) : null,
    };
  });
}

// ── Orders shopify de la fenêtre ────────────────────────────────
interface ShopifyOrderForMatch {
  shopify_order_id: string;
  created_at: string;
  total_price: number;
  landing_site?: string | null;
  referring_site?: string | null;
  source_name?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  note_attributes?: any;
}

async function loadOrdersInWindow(userId: string, fromIso: string, toIso: string): Promise<ShopifyOrderForMatch[]> {
  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: integs } = await (supabase.from("integrations") as any)
    .select("id")
    .eq("user_id", userId)
    .eq("provider", "shopify")
    .eq("status", "active");
  const integIds = (integs ?? []).map((i: { id: string }) => i.id);
  if (integIds.length === 0) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rows } = await (supabase.from("shopify_orders") as any)
    .select("shopify_order_id, created_at, total_price, landing_site, referring_site, source_name, utm_source, utm_medium, utm_campaign, utm_content, utm_term")
    .in("integration_id", integIds)
    .gte("created_at", fromIso + "T00:00:00")
    .lte("created_at", toIso + "T23:59:59")
    .is("cancelled_at", null);

  return ((rows ?? []) as Array<Record<string, unknown>>).map((r) => ({
    shopify_order_id: r.shopify_order_id as string,
    created_at: r.created_at as string,
    total_price: Number(r.total_price ?? 0),
    landing_site: (r.landing_site as string | null) ?? null,
    referring_site: (r.referring_site as string | null) ?? null,
    source_name: (r.source_name as string | null) ?? null,
    utm_source: (r.utm_source as string | null) ?? null,
    utm_medium: (r.utm_medium as string | null) ?? null,
    utm_campaign: (r.utm_campaign as string | null) ?? null,
    utm_content: (r.utm_content as string | null) ?? null,
    utm_term: (r.utm_term as string | null) ?? null,
  }));
}

// ── Agrégation revenue par (ad, jour) ───────────────────────────
// Seuls les matches utm_content_exact portent un ad_id : le ROAS visuel est
// exact par construction (pas de répartition approximative campagne → ads).
export interface AdDayAggregate {
  orders: Set<string>;
  revenue_cents: number;
  confidences: number[];
}

export function aggregateRevenueByAdDay(
  orderMatches: Array<{ order: { shopify_order_id: string; created_at: string; total_price: number }; matches: MatchResult[] }>,
): Map<string, AdDayAggregate> {
  const out = new Map<string, AdDayAggregate>();
  for (const { order, matches } of orderMatches) {
    const dayIso = order.created_at.slice(0, 10);
    const orderRevenueCents = Math.round(order.total_price * 100);
    for (const m of matches) {
      if (!m.ad_id) continue;
      const key = `${m.ad_id}|${dayIso}`;
      const cur = out.get(key) ?? { orders: new Set<string>(), revenue_cents: 0, confidences: [] };
      cur.orders.add(order.shopify_order_id);
      cur.revenue_cents += Math.round(orderRevenueCents * m.attribution_weight);
      cur.confidences.push(m.confidence);
      out.set(key, cur);
    }
  }
  return out;
}

// ── Cœur du refresh ─────────────────────────────────────────────
export async function refreshUserCampaignPerformance(params: RefreshParams): Promise<RefreshResult> {
  const t0 = Date.now();
  const { userId } = params;
  const daysBack = params.fullRecompute ? 90 : (params.daysBack ?? 7);
  const providers: AdsProvider[] = params.providers ?? ["pinterest"];

  const settings = await getEcomSettings(userId);
  const toIso = new Date().toISOString().slice(0, 10);
  const fromIso = new Date(Date.now() - daysBack * 24 * 3600 * 1000).toISOString().slice(0, 10);

  logger.info("roas_refresh_start", { userId, daysBack, providers, fromIso, toIso });

  // 1. Charge tous les orders de la fenêtre + attribution_window pour matching
  const matchWindowFromIso = new Date(
    Date.now() - (daysBack + settings.attribution_window_days) * 24 * 3600 * 1000
  ).toISOString().slice(0, 10);
  const orders = await loadOrdersInWindow(userId, matchWindowFromIso, toIso);

  // 2. Match chaque order et garde les résultats en mémoire
  type OrderMatch = { order: ShopifyOrderForMatch; matches: MatchResult[] };
  const orderMatches: OrderMatch[] = [];
  for (const order of orders) {
    const matches = await matchOrderToCampaign({
      userId, order, attributionWindowDays: settings.attribution_window_days,
    });
    orderMatches.push({ order, matches });
  }

  // 3. Persiste les touchpoints (truncate + insert pour cette fenêtre)
  await persistAttributionTouches(userId, orderMatches, fromIso);

  // 4. Pour chaque provider, charge les metrics journalières puis upsert performance_daily
  let totalUpserted = 0;
  for (const provider of providers) {
    const supabase = createAdminClient();
    const metrics = await loadMetricsByProvider(userId, provider, fromIso, toIso);

    // Recompute cohérent : purge la fenêtre [fromIso, toIso] pour ce provider AVANT
    // de ré-insérer. Sinon les jours qui ne sont plus renvoyés par l'API Ads (ex.
    // une campagne dont la fenêtre de dépense s'est rétrécie) restent en base et
    // gonflent le spend agrégé. L'upsert seul ne nettoie pas ces orphelins.
    // Cf bug agrégation Ads 2026-05-25.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("campaign_performance_daily") as any)
      .delete()
      .eq("user_id", userId)
      .eq("provider", provider)
      .gte("date", fromIso)
      .lte("date", toIso);

    if (metrics.length === 0) {
      // Pas de metrics → on log mais on continue (les autres providers ou les orders unmatched)
      logger.info("roas_no_metrics_for_provider", { userId, provider });
      continue;
    }

    // Agrège les orders attribués par (campaign, jour)
    const attrByCampaignDay = new Map<string, { orders: Set<string>; revenue_cents: number; methods: Set<string>; confidences: number[] }>();
    for (const { order, matches } of orderMatches) {
      const dayIso = order.created_at.slice(0, 10);
      const orderRevenueCents = Math.round(order.total_price * 100);
      for (const m of matches) {
        if (m.provider !== provider || !m.campaign_id) continue;
        const key = `${m.campaign_id}|${dayIso}`;
        const cur = attrByCampaignDay.get(key) ?? { orders: new Set(), revenue_cents: 0, methods: new Set(), confidences: [] };
        cur.orders.add(order.shopify_order_id);
        cur.revenue_cents += Math.round(orderRevenueCents * m.attribution_weight);
        cur.methods.add(m.method);
        cur.confidences.push(m.confidence);
        attrByCampaignDay.set(key, cur);
      }
    }

    // Upsert 1 row par (campaign, jour)
    for (const m of metrics) {
      const key = `${m.campaign_id}|${m.date}`;
      const attr = attrByCampaignDay.get(key);
      const revenueCents = attr?.revenue_cents ?? 0;
      const orderCount = attr?.orders.size ?? 0;
      const orderIds = attr ? [...attr.orders] : [];
      const realRoas = computeRoas(revenueCents, m.spend_cents);
      const marginalRoas = computeMarginalRoas(revenueCents, m.spend_cents, settings.net_margin_percent);
      const roasDelta = realRoas != null && m.ads_reported_roas != null ? realRoas - m.ads_reported_roas : null;
      const status: ProfitStatus = m.spend_cents === 0
        ? (revenueCents > 0 ? "profitable" : "unmatched")
        : determineProfitStatus(realRoas, settings.roas_profitability_threshold, settings.roas_warning_threshold);
      const method = attr ? [...attr.methods].sort()[0] : null;
      const confidence = attr && attr.confidences.length > 0
        ? attr.confidences.reduce((s, c) => s + c, 0) / attr.confidences.length
        : null;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from("campaign_performance_daily") as any).upsert({
        user_id: userId,
        date: m.date,
        provider,
        campaign_id: m.campaign_id,
        campaign_name: m.campaign_name,
        campaign_status: m.campaign_status,
        ads_spend_cents: m.spend_cents,
        ads_impressions: m.impressions,
        ads_clicks: m.clicks,
        ads_outbound_clicks: m.outbound_clicks,
        ads_conversions: m.conversions,
        ads_conversions_value_cents: m.conversion_value_cents,
        ads_reported_roas: m.ads_reported_roas,
        shopify_orders_count: orderCount,
        shopify_revenue_cents: revenueCents,
        shopify_attributable_order_ids: orderIds,
        real_roas: realRoas,
        roas_delta: roasDelta,
        marginal_roas: marginalRoas,
        is_profitable: status === "profitable",
        profit_status: status,
        attribution_method: method,
        attribution_confidence: confidence,
        computed_at: new Date().toISOString(),
      }, { onConflict: "user_id,date,provider,campaign_id" });
      if (error) {
        logger.error("roas_upsert_failed", { error: error.message, campaign_id: m.campaign_id, date: m.date });
        continue;
      }
      totalUpserted += 1;
    }
  }

  // 4bis. Grain ad/visuel : upsert ad_creative_performance_daily (par provider)
  for (const provider of providers) {
    totalUpserted += await refreshAdCreativePerformance(
      userId, provider, fromIso, toIso, orderMatches, settings,
    );
  }

  // 5. Détecte les alertes
  let alertsGenerated = 0;
  try {
    const res = await detectAlerts(userId);
    alertsGenerated = res.new_alerts;
  } catch (e) {
    logger.warn("alerts_detection_failed", { error: (e as Error).message });
  }

  const duration_ms = Date.now() - t0;
  logger.info("roas_refresh_complete", { userId, rows_upserted: totalUpserted, duration_ms, alerts_generated: alertsGenerated });
  return { rows_upserted: totalUpserted, duration_ms, alerts_generated: alertsGenerated };
}

/**
 * Calcule et persiste la performance jour × ad (créatif/visuel).
 * Spend : pinterest_metrics_daily entity_type='ad' (déjà synchronisé).
 * Revenue : commandes matchées en utm_content_exact uniquement (exact, pas réparti).
 * Même pattern delete-then-upsert que le grain campagne (cf bug 2026-05-25).
 */
async function refreshAdCreativePerformance(
  userId: string,
  provider: AdsProvider,
  fromIso: string,
  toIso: string,
  orderMatches: Array<{ order: { shopify_order_id: string; created_at: string; total_price: number }; matches: MatchResult[] }>,
  settings: EcomSettings,
): Promise<number> {
  const supabase = createAdminClient();
  const metrics = await loadAdMetricsByProvider(userId, provider, fromIso, toIso);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from("ad_creative_performance_daily") as any)
    .delete()
    .eq("user_id", userId)
    .eq("provider", provider)
    .gte("date", fromIso)
    .lte("date", toIso);

  if (metrics.length === 0) {
    logger.info("roas_no_ad_metrics_for_provider", { userId, provider });
    return 0;
  }

  const attrByAdDay = aggregateRevenueByAdDay(orderMatches);

  let upserted = 0;
  for (const m of metrics) {
    const attr = attrByAdDay.get(`${m.ad_id}|${m.date}`);
    const revenueCents = attr?.revenue_cents ?? 0;
    const realRoas = computeRoas(revenueCents, m.spend_cents);
    const status: ProfitStatus = m.spend_cents === 0
      ? (revenueCents > 0 ? "profitable" : "unmatched")
      : determineProfitStatus(realRoas, settings.roas_profitability_threshold, settings.roas_warning_threshold);
    const confidence = attr && attr.confidences.length > 0
      ? attr.confidences.reduce((s, c) => s + c, 0) / attr.confidences.length
      : null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("ad_creative_performance_daily") as any).upsert({
      user_id: userId,
      date: m.date,
      provider,
      campaign_id: m.campaign_id ?? "unknown",
      campaign_name: m.campaign_name,
      ad_group_id: m.ad_group_id,
      ad_id: m.ad_id,
      ad_name: m.ad_name,
      pin_id: m.pin_id,
      spend_cents: m.spend_cents,
      impressions: m.impressions,
      clicks: m.clicks,
      conversions: m.conversions,
      conversions_value_cents: m.conversion_value_cents,
      ctr: m.ctr,
      cpc_cents: m.cpc_cents,
      cpm_cents: m.impressions > 0 ? Math.round((m.spend_cents / m.impressions) * 1000) : null,
      shopify_orders_count: attr?.orders.size ?? 0,
      shopify_revenue_cents: revenueCents,
      shopify_attributable_order_ids: attr ? [...attr.orders] : [],
      real_roas: realRoas,
      profit_status: status,
      attribution_confidence: confidence,
      computed_at: new Date().toISOString(),
    }, { onConflict: "user_id,date,provider,ad_id" });
    if (error) {
      logger.error("ad_roas_upsert_failed", { error: error.message, ad_id: m.ad_id, date: m.date });
      continue;
    }
    upserted += 1;
  }
  return upserted;
}

async function persistAttributionTouches(
  userId: string,
  orderMatches: Array<{ order: ShopifyOrderForMatch; matches: MatchResult[] }>,
  windowFromIso: string,
): Promise<void> {
  const supabase = createAdminClient();
  // Supprime les anciens touchpoints de la fenêtre (réécriture cohérente)
  const orderIds = orderMatches
    .filter(({ order }) => order.created_at >= windowFromIso + "T00:00:00")
    .map(({ order }) => order.shopify_order_id);
  if (orderIds.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("order_attribution_touches") as any)
      .delete()
      .eq("user_id", userId)
      .in("order_id", orderIds);
  }

  // Insert les nouveaux
  const rows: Record<string, unknown>[] = [];
  for (const { order, matches } of orderMatches) {
    if (order.created_at < windowFromIso + "T00:00:00") continue;
    matches.forEach((m, idx) => {
      rows.push({
        user_id: userId,
        order_id: order.shopify_order_id,
        touch_index: idx,
        touch_at: order.created_at,
        provider: m.provider,
        campaign_id: m.campaign_id,
        campaign_name: m.campaign_name,
        utm_source: order.utm_source,
        utm_medium: order.utm_medium,
        utm_campaign: order.utm_campaign,
        utm_content: order.utm_content,
        utm_term: order.utm_term,
        referring_site: order.referring_site,
        landing_path: order.landing_site,
        attribution_weight: m.attribution_weight,
        attribution_method: m.method,
        // Grain ad/visuel (utm_content_exact) → retrouvable par la vue Visuels
        metadata: m.ad_id ? { ad_id: m.ad_id, ad_name: m.ad_name ?? null, pin_id: m.pin_id ?? null } : {},
      });
    });
  }
  if (rows.length > 0) {
    // Batch insert par 500 pour éviter payload trop gros
    for (let i = 0; i < rows.length; i += 500) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from("order_attribution_touches") as any)
        .insert(rows.slice(i, i + 500));
      if (error) logger.warn("touches_insert_partial", { error: error.message, batch_start: i });
    }
  }
}
