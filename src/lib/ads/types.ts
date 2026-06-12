/**
 * Types partagés du module Ads (multi-provider).
 */

export type AdsProvider = "pinterest" | "google_ads" | "meta_ads" | "tiktok_ads";

export type AttributionMethod =
  | "utm_content_exact"    // utm_content match exact sur un ad_id ({adid} du tracking template)
  | "utm_campaign_exact"   // utm_campaign match exact (id ou name normalisé)
  | "utm_source_prorata"   // pas de campaign match, prorata par spend sur la fenêtre
  | "referring_site"       // fallback domain (ex pinterest.com sans UTM)
  | "unmatched";

export type ProfitStatus = "profitable" | "warning" | "unprofitable" | "unmatched";

export type AttributionModel = "first_touch" | "last_touch" | "linear" | "u_shaped";

export interface DateRange {
  from: string; // YYYY-MM-DD
  to: string;   // YYYY-MM-DD
}

export interface EcomSettings {
  user_id: string;
  roas_profitability_threshold: number; // ex 2.0
  roas_warning_threshold: number;       // ex 1.5
  net_margin_percent: number;            // ex 50
  attribution_window_days: number;       // ex 7
  attribution_model: AttributionModel;
  default_currency: string;
  alerts_enabled: boolean;
  alert_drop_threshold_percent: number;
  alert_min_spend_cents: number;
  email_digest_enabled: boolean;
  email_digest_frequency: "daily" | "weekly" | "monthly";
}

export const DEFAULT_ECOM_SETTINGS: Omit<EcomSettings, "user_id"> = {
  roas_profitability_threshold: 2.0,
  roas_warning_threshold: 1.5,
  net_margin_percent: 50.0,
  attribution_window_days: 7,
  attribution_model: "last_touch",
  default_currency: "EUR",
  alerts_enabled: true,
  alert_drop_threshold_percent: 20.0,
  alert_min_spend_cents: 5000,
  email_digest_enabled: false,
  email_digest_frequency: "weekly",
};

export interface MatchResult {
  provider: AdsProvider | null;
  campaign_id: string | null;
  campaign_name: string | null;
  method: AttributionMethod;
  confidence: number;        // 0 à 1
  attribution_weight: number; // 0 à 1, somme = 1 par order
  /** Renseignés uniquement en utm_content_exact (grain ad/visuel). */
  ad_id?: string | null;
  ad_name?: string | null;
  pin_id?: string | null;
}

export interface UtmExtraction {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  referring_site?: string;
  landing_path?: string;
  raw_query?: string;
}

export interface KpiCard {
  value: number;
  value_cents?: number;
  formatted: string;
  delta_percent: number | null;
  status?: ProfitStatus;
}

export interface CreativeRow {
  provider: AdsProvider;
  ad_id: string;
  ad_name: string | null;
  pin_id: string | null;
  pin_title: string | null;
  pin_media_url: string | null;
  campaign_id: string;
  campaign_name: string | null;
  spend_cents: number;
  revenue_cents: number;
  orders: number;
  impressions: number;
  clicks: number;
  real_roas: number | null;
  profit_status: ProfitStatus;
}

export interface CampaignRow {
  provider: AdsProvider;
  campaign_id: string;
  campaign_name: string;
  /** Statut de cycle de vie Ads (ACTIVE/PAUSED/ARCHIVED…), distinct du profit_status. */
  lifecycle_status?: string | null;
  spend_cents: number;
  revenue_cents: number;
  orders: number;
  impressions: number;
  clicks: number;
  ads_reported_roas: number | null;
  real_roas: number | null;
  marginal_roas: number | null;
  profit_status: ProfitStatus;
  attribution_method: AttributionMethod | null;
}
