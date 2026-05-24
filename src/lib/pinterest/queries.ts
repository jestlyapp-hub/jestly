/**
 * Requêtes Pinterest API v5 (read-only). Une fonction par endpoint utile.
 * Les *_analytics renvoient un tableau d'objets metric (par entité × jour si granularity=DAY).
 */
import { pinterestApi, pinterestCollectAll, type PinterestIntegrationRef } from "./client";

/** Colonnes analytics utiles au ROAS (cf brief §3). */
export const ANALYTICS_COLUMNS = [
  "SPEND_IN_DOLLAR",
  "IMPRESSION_1",
  "CLICKTHROUGH_1",
  "OUTBOUND_CLICK_1",
  "CTR",
  "CPC_IN_DOLLAR",
  "TOTAL_CONVERSIONS",
  "TOTAL_CHECKOUT_VALUE_IN_DOLLAR",
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

export function listCampaigns(i: PinterestIntegrationRef, adAccountId: string): Promise<Json[]> {
  return pinterestCollectAll<Json>(i, `/ad_accounts/${adAccountId}/campaigns`, { page_size: 100 });
}

export function listAdGroups(i: PinterestIntegrationRef, adAccountId: string): Promise<Json[]> {
  return pinterestCollectAll<Json>(i, `/ad_accounts/${adAccountId}/ad_groups`, { page_size: 100 });
}

export function listAds(i: PinterestIntegrationRef, adAccountId: string): Promise<Json[]> {
  return pinterestCollectAll<Json>(i, `/ad_accounts/${adAccountId}/ads`, { page_size: 100 });
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
