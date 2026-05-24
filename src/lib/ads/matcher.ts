/**
 * Matcher commande Shopify → campagne Ads.
 *
 * 4 heuristiques (essayées dans l'ordre) :
 *   1. utm_campaign_exact : utm_campaign === campaign_id numérique OU campaign_name normalisé
 *   2. utm_source_prorata : utm_source connu mais pas de campaign match → prorata par spend
 *      sur la fenêtre d'attribution (top 3 campagnes du provider, weights sum = 1)
 *   3. referring_site     : pas d'UTMs mais referring_site contient le domaine du provider
 *   4. unmatched          : rien
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { extractUtmsFromOrder, normalizeSource, normalizeCampaignName } from "./utm-parser";
import type { MatchResult, AdsProvider } from "./types";

interface ShopifyOrderLike {
  shopify_order_id: string;
  created_at: string;
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

interface MatchParams {
  userId: string;
  order: ShopifyOrderLike;
  attributionWindowDays: number;
}

interface CampaignCandidate {
  provider: AdsProvider;
  campaign_id: string;
  campaign_name: string;
  spend_cents_window: number;
}

const PROVIDER_TABLE: Record<AdsProvider, { campaignsTable: string; idCol: string; metricsTable: string; integrationProvider: string }> = {
  pinterest: { campaignsTable: "pinterest_campaigns", idCol: "pinterest_campaign_id", metricsTable: "pinterest_metrics_daily", integrationProvider: "pinterest" },
  google_ads: { campaignsTable: "google_ads_campaigns", idCol: "google_ads_campaign_id", metricsTable: "google_ads_metrics_daily", integrationProvider: "google_ads" },
  meta_ads: { campaignsTable: "meta_ads_campaigns", idCol: "meta_ads_campaign_id", metricsTable: "meta_ads_metrics_daily", integrationProvider: "meta_ads" },
  tiktok_ads: { campaignsTable: "tiktok_ads_campaigns", idCol: "tiktok_ads_campaign_id", metricsTable: "tiktok_ads_metrics_daily", integrationProvider: "tiktok_ads" },
};

/**
 * Charge toutes les campagnes actives ou récentes par provider.
 * V1 = Pinterest only. Étendre quand Google/Meta arrivent.
 */
async function loadCampaignsForUser(userId: string): Promise<Array<{ provider: AdsProvider; campaign_id: string; campaign_name: string; integration_id: string }>> {
  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: integrations } = await (supabase.from("integrations") as any)
    .select("id, provider")
    .eq("user_id", userId)
    .eq("status", "active");
  const out: Array<{ provider: AdsProvider; campaign_id: string; campaign_name: string; integration_id: string }> = [];

  for (const integ of (integrations ?? []) as Array<{ id: string; provider: string }>) {
    if (integ.provider === "pinterest") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase.from("pinterest_campaigns") as any)
        .select("pinterest_campaign_id, name")
        .eq("integration_id", integ.id);
      for (const c of (data ?? []) as Array<{ pinterest_campaign_id: string; name: string }>) {
        out.push({ provider: "pinterest", campaign_id: c.pinterest_campaign_id, campaign_name: c.name, integration_id: integ.id });
      }
    }
    // google_ads, meta_ads, tiktok_ads à brancher quand les tables existeront
  }
  return out;
}

/** Charge le spend agrégé par campagne d'un provider sur la fenêtre [from, to]. */
async function loadSpendByCampaign(
  userId: string,
  provider: AdsProvider,
  fromIso: string,
  toIso: string,
): Promise<Map<string, number>> {
  const out = new Map<string, number>();
  if (provider !== "pinterest") return out; // V1 = Pinterest only
  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: integ } = await (supabase.from("integrations") as any)
    .select("id")
    .eq("user_id", userId)
    .eq("provider", "pinterest")
    .eq("status", "active")
    .maybeSingle();
  if (!integ) return out;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rows } = await (supabase.from("pinterest_metrics_daily") as any)
    .select("entity_id, spend_cents")
    .eq("integration_id", integ.id)
    .eq("entity_type", "campaign")
    .gte("date", fromIso)
    .lte("date", toIso);
  for (const r of (rows ?? []) as Array<{ entity_id: string; spend_cents: number }>) {
    out.set(r.entity_id, (out.get(r.entity_id) ?? 0) + (r.spend_cents ?? 0));
  }
  return out;
}

/**
 * Renvoie un array de touchpoints (1 entry en single-touch, jusqu'à 3 en prorata).
 * La somme des `attribution_weight` doit faire 1 par order.
 */
export async function matchOrderToCampaign(params: MatchParams): Promise<MatchResult[]> {
  const { userId, order, attributionWindowDays } = params;
  const utms = extractUtmsFromOrder(order);

  const campaigns = await loadCampaignsForUser(userId);
  if (campaigns.length === 0) {
    return [unmatchedResult()];
  }

  // ── Heuristique 1 : utm_campaign exact match (id OU name) ─────
  if (utms.campaign) {
    const utmCampaign = String(utms.campaign).trim();
    const normalized = normalizeCampaignName(utmCampaign);

    // 1a : match exact sur campaign_id (Pinterest envoie souvent l'ID numérique)
    const idMatches = campaigns.filter((c) => c.campaign_id === utmCampaign);
    if (idMatches.length === 1) {
      return [{
        provider: idMatches[0].provider,
        campaign_id: idMatches[0].campaign_id,
        campaign_name: idMatches[0].campaign_name,
        method: "utm_campaign_exact",
        confidence: 0.98,
        attribution_weight: 1.0,
      }];
    }

    // 1b : match exact sur campaign_name normalisé
    const nameMatches = campaigns.filter((c) => normalizeCampaignName(c.campaign_name) === normalized);
    if (nameMatches.length === 1) {
      return [{
        provider: nameMatches[0].provider,
        campaign_id: nameMatches[0].campaign_id,
        campaign_name: nameMatches[0].campaign_name,
        method: "utm_campaign_exact",
        confidence: 0.95,
        attribution_weight: 1.0,
      }];
    }

    // Multi-match → prend la plus dépensière sur la fenêtre
    const candidates = idMatches.length > 0 ? idMatches : nameMatches;
    if (candidates.length > 1) {
      const winner = await pickByHighestSpend(userId, candidates, order.created_at, attributionWindowDays);
      if (winner) {
        return [{
          provider: winner.provider,
          campaign_id: winner.campaign_id,
          campaign_name: winner.campaign_name,
          method: "utm_campaign_exact",
          confidence: 0.85,
          attribution_weight: 1.0,
        }];
      }
    }
  }

  // ── Heuristique 2 : utm_source prorata ────────────────────────
  const normalizedSource = normalizeSource(utms.source ?? utms.referring_site);
  if (normalizedSource) {
    const provider = normalizedSource as AdsProvider;
    const providerCampaigns = campaigns.filter((c) => c.provider === provider);
    if (providerCampaigns.length > 0) {
      const { fromIso, toIso } = windowFromOrder(order.created_at, attributionWindowDays);
      const spendByCampaign = await loadSpendByCampaign(userId, provider, fromIso, toIso);
      const activeCandidates = providerCampaigns
        .map((c) => ({ ...c, spend: spendByCampaign.get(c.campaign_id) ?? 0 }))
        .filter((c) => c.spend > 0)
        .sort((a, b) => b.spend - a.spend)
        .slice(0, 3);

      if (activeCandidates.length > 0) {
        const totalSpend = activeCandidates.reduce((s, c) => s + c.spend, 0);
        const results = activeCandidates.map((c) => ({
          provider: c.provider,
          campaign_id: c.campaign_id,
          campaign_name: c.campaign_name,
          method: "utm_source_prorata" as const,
          confidence: 0.7,
          attribution_weight: c.spend / totalSpend,
        }));
        // Garantit que la somme des weights = exactement 1
        const sumWeights = results.reduce((s, r) => s + r.attribution_weight, 0);
        if (sumWeights > 0) results[0].attribution_weight += 1 - sumWeights;
        return results;
      }
    }
  }

  // ── Heuristique 3 : referring_site fallback ──────────────────
  if (utms.referring_site) {
    const inferred = normalizeSource(utms.referring_site);
    if (inferred) {
      const provider = inferred as AdsProvider;
      const providerCampaigns = campaigns.filter((c) => c.provider === provider);
      if (providerCampaigns.length > 0) {
        const { fromIso, toIso } = windowFromOrder(order.created_at, attributionWindowDays);
        const spendByCampaign = await loadSpendByCampaign(userId, provider, fromIso, toIso);
        const top = providerCampaigns
          .map((c) => ({ ...c, spend: spendByCampaign.get(c.campaign_id) ?? 0 }))
          .sort((a, b) => b.spend - a.spend)[0];
        if (top && top.spend > 0) {
          return [{
            provider: top.provider,
            campaign_id: top.campaign_id,
            campaign_name: top.campaign_name,
            method: "referring_site",
            confidence: 0.5,
            attribution_weight: 1.0,
          }];
        }
      }
    }
  }

  // ── Heuristique 4 : unmatched ─────────────────────────────────
  return [unmatchedResult()];
}

function unmatchedResult(): MatchResult {
  return {
    provider: null,
    campaign_id: null,
    campaign_name: null,
    method: "unmatched",
    confidence: 0,
    attribution_weight: 1.0,
  };
}

function windowFromOrder(orderCreatedAt: string, windowDays: number): { fromIso: string; toIso: string } {
  const orderDate = new Date(orderCreatedAt);
  const fromDate = new Date(orderDate.getTime() - windowDays * 24 * 3600 * 1000);
  return {
    fromIso: fromDate.toISOString().slice(0, 10),
    toIso: orderDate.toISOString().slice(0, 10),
  };
}

async function pickByHighestSpend(
  userId: string,
  candidates: Array<{ provider: AdsProvider; campaign_id: string; campaign_name: string }>,
  orderCreatedAt: string,
  windowDays: number,
): Promise<{ provider: AdsProvider; campaign_id: string; campaign_name: string } | null> {
  const { fromIso, toIso } = windowFromOrder(orderCreatedAt, windowDays);
  let best: { c: typeof candidates[0]; spend: number } | null = null;
  // Group by provider pour minimiser les queries
  const byProvider = new Map<AdsProvider, typeof candidates>();
  for (const c of candidates) {
    const list = byProvider.get(c.provider) ?? [];
    list.push(c);
    byProvider.set(c.provider, list);
  }
  for (const [provider, list] of byProvider.entries()) {
    const spendByCampaign = await loadSpendByCampaign(userId, provider, fromIso, toIso);
    for (const c of list) {
      const spend = spendByCampaign.get(c.campaign_id) ?? 0;
      if (!best || spend > best.spend) best = { c, spend };
    }
  }
  return best?.c ?? null;
}
