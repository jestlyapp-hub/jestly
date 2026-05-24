/**
 * Orchestration sync Pinterest → cache Supabase.
 *
 * Entités cachées (par integration_id) :
 *   - pinterest_ad_accounts (snapshot)
 *   - pinterest_campaigns / ad_groups / ads (snapshot, scopé par ad_account_id sélectionné)
 *   - pinterest_metrics_daily (campaigns + ad_groups + ads, granularity DAY)
 *   - pinterest_pins (snapshot, limit V1 = top 100)
 *
 * Conversions monétaires :
 *   - budget/bid (micro-units) → microToCents
 *   - analytics *_IN_DOLLAR (units devise) → currencyUnitsToCents
 *
 * Limite Pinterest : 90 jours max d'historique non-HOUR par requête analytics.
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";
import {
  listAdAccounts,
  listCampaigns,
  listAdGroups,
  listAds,
  listPins,
  getCampaignsAnalytics,
  getAdGroupsAnalytics,
  getAdsAnalytics,
} from "./queries";
import type { PinterestIntegrationRef } from "./client";
import { microToCents, currencyUnitsToCents } from "./formatters";

const ANALYTICS_HISTORY_DAYS = 90; // limite Pinterest non-HOUR
const ANALYTICS_BATCH_SIZE = 50; // ids par appel (Pinterest accepte jusqu'à 50 dans la query string)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Json = Record<string, any>;

export interface SyncResult {
  ad_accounts: number;
  campaigns: number;
  ad_groups: number;
  ads: number;
  metrics_rows: number;
  pins: number;
}

// ── Helpers ──────────────────────────────────────────────────────
function isoDate(d: Date): string { return d.toISOString().slice(0, 10); }
function daysAgo(n: number): string {
  return isoDate(new Date(Date.now() - n * 24 * 3600 * 1000));
}
function today(): string { return isoDate(new Date()); }

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// ── Sync ad_accounts ────────────────────────────────────────────
export async function syncAdAccounts(integration: PinterestIntegrationRef): Promise<{ synced: number; accounts: Json[] }> {
  const accounts = await listAdAccounts(integration);
  const supabase = createAdminClient();
  const rows = accounts.map((a) => ({
    integration_id: integration.id,
    pinterest_ad_account_id: String(a.id),
    name: String(a.name ?? "Ad account"),
    country: a.country ?? null,
    currency: a.currency ?? null,
    owner_user_id: a.owner_user_id ? String(a.owner_user_id) : null,
    raw_data: a,
    updated_at: new Date().toISOString(),
  }));
  if (rows.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("pinterest_ad_accounts") as any)
      .upsert(rows, { onConflict: "integration_id,pinterest_ad_account_id" });
    if (error) throw new Error(`Upsert ad_accounts: ${error.message}`);
  }
  return { synced: rows.length, accounts };
}

// ── Sync campaigns ──────────────────────────────────────────────
export async function syncCampaigns(integration: PinterestIntegrationRef, adAccountId: string): Promise<{ synced: number; ids: string[] }> {
  const campaigns = await listCampaigns(integration, adAccountId);
  const supabase = createAdminClient();
  const rows = campaigns.map((c) => ({
    integration_id: integration.id,
    ad_account_id: adAccountId,
    pinterest_campaign_id: String(c.id),
    name: String(c.name ?? `Campaign ${c.id}`),
    status: c.status ?? null,
    objective_type: c.objective_type ?? null,
    start_time: c.start_time ?? null,
    end_time: c.end_time ?? null,
    daily_spend_cap_cents: c.daily_spend_cap != null ? microToCents(Number(c.daily_spend_cap)) : null,
    lifetime_spend_cap_cents: c.lifetime_spend_cap != null ? microToCents(Number(c.lifetime_spend_cap)) : null,
    raw_data: c,
    updated_at: new Date().toISOString(),
  }));
  if (rows.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("pinterest_campaigns") as any)
      .upsert(rows, { onConflict: "integration_id,pinterest_campaign_id" });
    if (error) throw new Error(`Upsert campaigns: ${error.message}`);
  }
  return { synced: rows.length, ids: rows.map((r) => r.pinterest_campaign_id) };
}

// ── Sync ad_groups ──────────────────────────────────────────────
export async function syncAdGroups(integration: PinterestIntegrationRef, adAccountId: string): Promise<{ synced: number; ids: string[] }> {
  const adGroups = await listAdGroups(integration, adAccountId);
  const supabase = createAdminClient();
  const rows = adGroups.map((g) => ({
    integration_id: integration.id,
    campaign_id: String(g.campaign_id ?? ""),
    pinterest_ad_group_id: String(g.id),
    name: String(g.name ?? `Ad group ${g.id}`),
    status: g.status ?? null,
    budget_in_micro_currency: g.budget_in_micro_currency != null ? Number(g.budget_in_micro_currency) : null,
    bid_in_micro_currency: g.bid_in_micro_currency != null ? Number(g.bid_in_micro_currency) : null,
    targeting_spec: g.targeting_spec ?? null,
    raw_data: g,
    updated_at: new Date().toISOString(),
  }));
  if (rows.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("pinterest_ad_groups") as any)
      .upsert(rows, { onConflict: "integration_id,pinterest_ad_group_id" });
    if (error) throw new Error(`Upsert ad_groups: ${error.message}`);
  }
  return { synced: rows.length, ids: rows.map((r) => r.pinterest_ad_group_id) };
}

// ── Sync ads ────────────────────────────────────────────────────
export async function syncAds(integration: PinterestIntegrationRef, adAccountId: string): Promise<{ synced: number; ids: string[] }> {
  const ads = await listAds(integration, adAccountId);
  const supabase = createAdminClient();
  const rows = ads.map((a) => ({
    integration_id: integration.id,
    ad_group_id: String(a.ad_group_id ?? ""),
    pinterest_ad_id: String(a.id),
    name: a.name ?? null,
    status: a.status ?? null,
    pin_id: a.pin_id ? String(a.pin_id) : null,
    click_tracking_url: a.click_tracking_url ?? null,
    raw_data: a,
    updated_at: new Date().toISOString(),
  }));
  if (rows.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("pinterest_ads") as any)
      .upsert(rows, { onConflict: "integration_id,pinterest_ad_id" });
    if (error) throw new Error(`Upsert ads: ${error.message}`);
  }
  return { synced: rows.length, ids: rows.map((r) => r.pinterest_ad_id) };
}

// ── Sync metrics (campaigns/ad_groups/ads × DAY) ────────────────
type EntityType = "campaign" | "ad_group" | "ad";

function metricRowFrom(integrationId: string, entityType: EntityType, entityId: string, m: Json) {
  return {
    integration_id: integrationId,
    entity_type: entityType,
    entity_id: entityId,
    date: String(m.DATE ?? m.date),
    impressions: Number(m.IMPRESSION_1 ?? 0),
    clicks: Number(m.CLICKTHROUGH_1 ?? 0),
    outbound_clicks: Number(m.OUTBOUND_CLICK_1 ?? 0),
    spend_cents: currencyUnitsToCents(Number(m.SPEND_IN_DOLLAR ?? 0)),
    ctr: m.CTR != null ? Number(m.CTR) : null,
    cpc_cents: m.CPC_IN_DOLLAR != null ? currencyUnitsToCents(Number(m.CPC_IN_DOLLAR)) : null,
    conversions: Number(m.TOTAL_CONVERSIONS ?? 0),
    conversion_value_cents: currencyUnitsToCents(Number(m.TOTAL_CHECKOUT_VALUE_IN_DOLLAR ?? 0)),
    pinterest_reported_roas: m.CHECKOUT_ROAS != null ? Number(m.CHECKOUT_ROAS) : null,
    raw_data: m,
  };
}

/**
 * Pinterest analytics : la réponse est un dict { <entityId>: [ {DATE, …}, … ] } pour DAY,
 * mais selon les versions ça peut aussi être un array plat. On normalise dans les 2 cas.
 */
function flattenAnalyticsResponse(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  response: any,
  entityIdField: "CAMPAIGN_ID" | "AD_GROUP_ID" | "AD_ID",
): { id: string; rows: Json[] }[] {
  if (Array.isArray(response)) {
    // Array flat → group by entityIdField
    const grouped = new Map<string, Json[]>();
    for (const row of response) {
      const id = String(row[entityIdField] ?? row.id ?? "");
      if (!id) continue;
      const list = grouped.get(id) ?? [];
      list.push(row);
      grouped.set(id, list);
    }
    return [...grouped.entries()].map(([id, rows]) => ({ id, rows }));
  }
  if (response && typeof response === "object") {
    return Object.entries(response).map(([id, rows]) => ({ id, rows: rows as Json[] }));
  }
  return [];
}

async function fetchAndUpsertMetrics(
  integration: PinterestIntegrationRef,
  adAccountId: string,
  entityType: EntityType,
  ids: string[],
  startDate: string,
  endDate: string,
): Promise<number> {
  if (ids.length === 0) return 0;
  const supabase = createAdminClient();
  let total = 0;

  for (const batch of chunk(ids, ANALYTICS_BATCH_SIZE)) {
    let response;
    let idField: "CAMPAIGN_ID" | "AD_GROUP_ID" | "AD_ID";
    if (entityType === "campaign") {
      response = await getCampaignsAnalytics(integration, adAccountId, batch, { startDate, endDate, granularity: "DAY" });
      idField = "CAMPAIGN_ID";
    } else if (entityType === "ad_group") {
      response = await getAdGroupsAnalytics(integration, adAccountId, batch, { startDate, endDate, granularity: "DAY" });
      idField = "AD_GROUP_ID";
    } else {
      response = await getAdsAnalytics(integration, adAccountId, batch, { startDate, endDate, granularity: "DAY" });
      idField = "AD_ID";
    }

    const grouped = flattenAnalyticsResponse(response, idField);
    const rows: ReturnType<typeof metricRowFrom>[] = [];
    for (const { id, rows: dayRows } of grouped) {
      for (const m of dayRows) {
        if (!m.DATE && !m.date) continue;
        rows.push(metricRowFrom(integration.id, entityType, id, m));
      }
    }
    if (rows.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from("pinterest_metrics_daily") as any)
        .upsert(rows, { onConflict: "integration_id,entity_type,entity_id,date" });
      if (error) throw new Error(`Upsert metrics_daily (${entityType}): ${error.message}`);
      total += rows.length;
    }
  }
  return total;
}

export async function syncMetricsInitial(
  integration: PinterestIntegrationRef,
  adAccountId: string,
  ids: { campaigns: string[]; adGroups: string[]; ads: string[] },
): Promise<{ rows: number }> {
  const startDate = daysAgo(ANALYTICS_HISTORY_DAYS);
  const endDate = today();
  let rows = 0;
  rows += await fetchAndUpsertMetrics(integration, adAccountId, "campaign", ids.campaigns, startDate, endDate);
  rows += await fetchAndUpsertMetrics(integration, adAccountId, "ad_group", ids.adGroups, startDate, endDate);
  rows += await fetchAndUpsertMetrics(integration, adAccountId, "ad", ids.ads, startDate, endDate);
  return { rows };
}

export async function syncMetricsDelta(
  integration: PinterestIntegrationRef,
  adAccountId: string,
  ids: { campaigns: string[]; adGroups: string[]; ads: string[] },
  lastSyncedAt: string | null,
): Promise<{ rows: number }> {
  // Rejoue les 3 derniers jours pour absorber les late-arriving conversions (cf doc Pinterest).
  const sinceDate = lastSyncedAt
    ? isoDate(new Date(Math.max(new Date(lastSyncedAt).getTime() - 3 * 24 * 3600 * 1000, Date.now() - ANALYTICS_HISTORY_DAYS * 24 * 3600 * 1000)))
    : daysAgo(3);
  const endDate = today();
  let rows = 0;
  rows += await fetchAndUpsertMetrics(integration, adAccountId, "campaign", ids.campaigns, sinceDate, endDate);
  rows += await fetchAndUpsertMetrics(integration, adAccountId, "ad_group", ids.adGroups, sinceDate, endDate);
  rows += await fetchAndUpsertMetrics(integration, adAccountId, "ad", ids.ads, sinceDate, endDate);
  return { rows };
}

// ── Sync pins (V1 = top 100) ────────────────────────────────────
export async function syncPins(integration: PinterestIntegrationRef): Promise<{ synced: number }> {
  const pins = await listPins(integration);
  const supabase = createAdminClient();
  const rows = pins.slice(0, 100).map((p) => ({
    integration_id: integration.id,
    pinterest_pin_id: String(p.id),
    board_id: p.board_id ? String(p.board_id) : null,
    title: p.title ?? null,
    description: p.description ?? null,
    link: p.link ?? null,
    pin_type: p.creative_type ?? null,
    is_promoted: Boolean(p.is_promoted ?? false),
    media_url: p.media?.images?.["1200x"]?.url ?? p.media?.images?.["600x"]?.url ?? null,
    raw_data: p,
    updated_at: new Date().toISOString(),
  }));
  if (rows.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("pinterest_pins") as any)
      .upsert(rows, { onConflict: "integration_id,pinterest_pin_id" });
    if (error) throw new Error(`Upsert pins: ${error.message}`);
  }
  return { synced: rows.length };
}

// ── runFullSync ─────────────────────────────────────────────────
export async function runFullSync(integration: PinterestIntegrationRef, adAccountId: string): Promise<SyncResult> {
  const supabase = createAdminClient();
  logger.info("pinterest_full_sync_start", { integration: integration.id, adAccount: adAccountId });

  const accounts = await syncAdAccounts(integration);
  const campaigns = await syncCampaigns(integration, adAccountId);
  const adGroups = await syncAdGroups(integration, adAccountId);
  const ads = await syncAds(integration, adAccountId);

  let metrics = { rows: 0 };
  try {
    metrics = await syncMetricsInitial(integration, adAccountId, {
      campaigns: campaigns.ids, adGroups: adGroups.ids, ads: ads.ids,
    });
  } catch (e) {
    logger.warn("pinterest_metrics_initial_partial_failure", { error: (e as Error).message });
  }

  let pins = { synced: 0 };
  try { pins = await syncPins(integration); } catch (e) {
    logger.warn("pinterest_pins_skipped", { error: (e as Error).message });
  }

  const now = new Date().toISOString();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from("integrations") as any)
    .update({ last_sync_at: now, last_error: null })
    .eq("id", integration.id);

  const result: SyncResult = {
    ad_accounts: accounts.synced,
    campaigns: campaigns.synced,
    ad_groups: adGroups.synced,
    ads: ads.synced,
    metrics_rows: metrics.rows,
    pins: pins.synced,
  };
  logger.info("pinterest_full_sync_complete", { integration: integration.id, ...result });
  return result;
}

// ── runDeltaSync (cron, toutes les 30 min) ──────────────────────
export async function runDeltaSync(integration: PinterestIntegrationRef & { external_account_id: string; last_sync_at: string | null }): Promise<SyncResult> {
  const adAccountId = integration.external_account_id;
  const supabase = createAdminClient();

  // Re-sync objets (rapide) + delta metrics (3j de rejeu)
  const accounts = await syncAdAccounts(integration);
  const campaigns = await syncCampaigns(integration, adAccountId);
  const adGroups = await syncAdGroups(integration, adAccountId);
  const ads = await syncAds(integration, adAccountId);
  let metrics = { rows: 0 };
  try {
    metrics = await syncMetricsDelta(integration, adAccountId, {
      campaigns: campaigns.ids, adGroups: adGroups.ids, ads: ads.ids,
    }, integration.last_sync_at);
  } catch (e) {
    logger.warn("pinterest_metrics_delta_partial_failure", { error: (e as Error).message });
  }

  const now = new Date().toISOString();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from("integrations") as any)
    .update({ last_sync_at: now, last_error: null })
    .eq("id", integration.id);

  return {
    ad_accounts: accounts.synced,
    campaigns: campaigns.synced,
    ad_groups: adGroups.synced,
    ads: ads.synced,
    metrics_rows: metrics.rows,
    pins: 0,
  };
}
