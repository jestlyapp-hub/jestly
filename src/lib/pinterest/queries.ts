/**
 * Requêtes Pinterest API v5 (read-only). Une fonction par endpoint utile.
 * Les *_analytics renvoient un tableau d'objets metric (par entité × jour si granularity=DAY).
 */
import { pinterestApi, pinterestCollectAll, type PinterestIntegrationRef } from "./client";

/**
 * Colonnes analytics utiles au ROAS — noms officiels Pinterest API v5 (validés live 2026-05-24).
 *
 * Conversions monétaires (cf lib/pinterest/formatters.ts) :
 * - SPEND_IN_DOLLAR : units devise compte (ex 117.88 €) → currencyUnitsToCents (×100) = cents
 * - CPC_IN_MICRO_DOLLAR : micro-units (ex 168648 = 0,017 €) → microToCents (÷10_000) = cents
 * - TOTAL_CHECKOUT_VALUE_IN_MICRO_DOLLAR : micro-units → microToCents = cents
 *
 * Pinterest a retiré CPC_IN_DOLLAR et TOTAL_CHECKOUT_VALUE_IN_DOLLAR sans deprecation :
 * il faut absolument utiliser le suffix _IN_MICRO_DOLLAR pour ces 2 champs.
 */
export const ANALYTICS_COLUMNS = [
  "SPEND_IN_DOLLAR",
  "IMPRESSION_1",
  "CLICKTHROUGH_1",
  "OUTBOUND_CLICK_1",
  "CTR",
  "CPC_IN_MICRO_DOLLAR",
  "TOTAL_CONVERSIONS",
  "TOTAL_CHECKOUT",
  "TOTAL_CHECKOUT_VALUE_IN_MICRO_DOLLAR",
  "CHECKOUT_ROAS",
].join(",");

export interface AnalyticsOpts {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  granularity?: "TOTAL" | "DAY" | "WEEKLY" | "MONTHLY";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Json = Record<string, any>;

export function getUserAccount(i: PinterestIntegrationRef): Promise<Json> {
  return pinterestApi<Json>(i, "/user_account");
}

export function listAdAccounts(i: PinterestIntegrationRef): Promise<Json[]> {
  return pinterestCollectAll<Json>(i, "/ad_accounts", { page_size: 100 });
}

// Pinterest /campaigns (et /ad_groups, /ads) ne renvoie ACTIVE+PAUSED que par défaut :
// les ARCHIVED sont silencieusement exclues sans entity_statuses explicite. On les
// inclut au sync pour pouvoir les afficher derrière le toggle "Voir aussi les archivées".
const ALL_ENTITY_STATUSES = "ACTIVE,PAUSED,ARCHIVED";

export function listCampaigns(i: PinterestIntegrationRef, adAccountId: string): Promise<Json[]> {
  return pinterestCollectAll<Json>(i, `/ad_accounts/${adAccountId}/campaigns`, {
    page_size: 100, entity_statuses: ALL_ENTITY_STATUSES,
  });
}

export function listAdGroups(i: PinterestIntegrationRef, adAccountId: string): Promise<Json[]> {
  return pinterestCollectAll<Json>(i, `/ad_accounts/${adAccountId}/ad_groups`, {
    page_size: 100, entity_statuses: ALL_ENTITY_STATUSES,
  });
}

export function listAds(i: PinterestIntegrationRef, adAccountId: string): Promise<Json[]> {
  return pinterestCollectAll<Json>(i, `/ad_accounts/${adAccountId}/ads`, {
    page_size: 100, entity_statuses: ALL_ENTITY_STATUSES,
  });
}

export function getCampaignsAnalytics(
  i: PinterestIntegrationRef, adAccountId: string, campaignIds: string[], opts: AnalyticsOpts,
): Promise<Json[]> {
  return pinterestApi<Json[]>(i, `/ad_accounts/${adAccountId}/campaigns/analytics`, {
    query: {
      campaign_ids: campaignIds,
      start_date: opts.startDate,
      end_date: opts.endDate,
      granularity: opts.granularity ?? "DAY",
      columns: ANALYTICS_COLUMNS,
    },
  });
}

export function getAdGroupsAnalytics(
  i: PinterestIntegrationRef, adAccountId: string, adGroupIds: string[], opts: AnalyticsOpts,
): Promise<Json[]> {
  return pinterestApi<Json[]>(i, `/ad_accounts/${adAccountId}/ad_groups/analytics`, {
    query: {
      ad_group_ids: adGroupIds,
      start_date: opts.startDate,
      end_date: opts.endDate,
      granularity: opts.granularity ?? "DAY",
      columns: ANALYTICS_COLUMNS,
    },
  });
}

export function getAdsAnalytics(
  i: PinterestIntegrationRef, adAccountId: string, adIds: string[], opts: AnalyticsOpts,
): Promise<Json[]> {
  return pinterestApi<Json[]>(i, `/ad_accounts/${adAccountId}/ads/analytics`, {
    query: {
      ad_ids: adIds,
      start_date: opts.startDate,
      end_date: opts.endDate,
      granularity: opts.granularity ?? "DAY",
      columns: ANALYTICS_COLUMNS,
    },
  });
}

export function listPins(i: PinterestIntegrationRef): Promise<Json[]> {
  return pinterestCollectAll<Json>(i, "/pins", { page_size: 100 });
}

export function listBoards(i: PinterestIntegrationRef): Promise<Json[]> {
  return pinterestCollectAll<Json>(i, "/boards", { page_size: 100 });
}
