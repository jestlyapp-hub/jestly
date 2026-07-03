/**
 * Client REST Google Ads API — LECTURE SEULE (reporting GAQL).
 *
 * Aucune mutation : seul l'endpoint `googleAds:search` est appelé.
 * Pas de dépendance npm : appels REST directs (token refresh + GAQL).
 *
 * Secrets : variables d'environnement GOOGLE_ADS_* (.env.local en dev,
 * variables Vercel en prod). Rien en dur, rien de committé.
 *
 * Version d'API : v23 par défaut (supportée ~jusqu'à janvier 2027, cadence
 * mensuelle Google depuis 2026) — surchargeable via GOOGLE_ADS_API_VERSION.
 */
import { logger } from "@/lib/logger";

export interface GoogleAdsConfig {
  developerToken: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  /** Compte manager (MCC), chiffres uniquement, sans tirets. */
  loginCustomerId: string;
  /** Compte annonceur (LHM), chiffres uniquement, sans tirets. */
  customerId: string;
  apiVersion: string;
}

/** Config depuis l'env — null si l'une des 6 clés requises manque. */
export function getGoogleAdsConfig(): GoogleAdsConfig | null {
  const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
  const clientId = process.env.GOOGLE_ADS_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN;
  const loginCustomerId = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID?.replace(/-/g, "");
  const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID?.replace(/-/g, "");
  if (!developerToken || !clientId || !clientSecret || !refreshToken || !loginCustomerId || !customerId) {
    return null;
  }
  return {
    developerToken,
    clientId,
    clientSecret,
    refreshToken,
    loginCustomerId,
    customerId,
    apiVersion: process.env.GOOGLE_ADS_API_VERSION ?? "v23",
  };
}

export class GoogleAdsApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "GoogleAdsApiError";
  }
}

/** Access token éphémère via le refresh token (grant refresh_token). */
export async function mintAccessToken(cfg: GoogleAdsConfig): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
      refresh_token: cfg.refreshToken,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    logger.error("gads_token_refresh_failed", { status: res.status });
    throw new GoogleAdsApiError(
      `Refresh du token Google échoué (${res.status}) — le refresh token est peut-être révoqué, relance scripts/gads-get-refresh-token.mjs. ${body.slice(0, 200)}`,
      res.status,
    );
  }
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) throw new GoogleAdsApiError("Réponse OAuth sans access_token");
  return json.access_token;
}

/** Ligne brute renvoyée par googleAds:search pour notre requête reporting. */
export interface GaqlCampaignDailyRow {
  campaign?: { id?: string; name?: string };
  segments?: { date?: string };
  metrics?: {
    /** int64 sérialisé en string par l'API REST. */
    costMicros?: string | number;
    clicks?: string | number;
    impressions?: string | number;
    conversions?: number;
    conversionsValue?: number;
  };
}

/**
 * Exécute une requête GAQL (endpoint search, paginé via nextPageToken).
 * LECTURE SEULE — cet appel ne peut rien modifier sur le compte Ads.
 */
export async function searchGaql(cfg: GoogleAdsConfig, query: string): Promise<GaqlCampaignDailyRow[]> {
  const accessToken = await mintAccessToken(cfg);
  const url = `https://googleads.googleapis.com/${cfg.apiVersion}/customers/${cfg.customerId}/googleAds:search`;

  const rows: GaqlCampaignDailyRow[] = [];
  let pageToken: string | undefined;
  do {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "developer-token": cfg.developerToken,
        "login-customer-id": cfg.loginCustomerId,
      },
      body: JSON.stringify(pageToken ? { query, pageToken } : { query }),
    });

    if (!res.ok) {
      const body = await res.text();
      logger.error("gads_gaql_failed", { status: res.status, body: body.slice(0, 500) });
      const hint = res.status === 404
        ? ` — la version ${cfg.apiVersion} est peut-être en sunset, ajuste GOOGLE_ADS_API_VERSION.`
        : "";
      throw new GoogleAdsApiError(`Requête Google Ads échouée (${res.status})${hint} ${body.slice(0, 300)}`, res.status);
    }

    const json = (await res.json()) as { results?: GaqlCampaignDailyRow[]; nextPageToken?: string };
    rows.push(...(json.results ?? []));
    pageToken = json.nextPageToken;
  } while (pageToken);

  return rows;
}
