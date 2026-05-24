/**
 * Extraction des UTMs depuis une commande Shopify (multi-source).
 *
 * Pinterest envoie souvent l'utm_campaign = campaign_id numérique (ex "626758420271")
 * plutôt que le campaign_name. Le matcher doit checker l'ID en premier.
 */
import type { UtmExtraction } from "./types";

interface ShopifyOrderLike {
  landing_site?: string | null;
  referring_site?: string | null;
  source_name?: string | null;
  source_url?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  note_attributes?: Array<{ name: string; value: string }> | any;
}

/**
 * Extrait les UTMs en consolidant 4 sources :
 * 1. Colonnes utm_* dénormalisées (synced par notre code Shopify)
 * 2. Query string de landing_site
 * 3. note_attributes (custom tracking Shopify)
 * 4. referring_site (fallback domain)
 */
export function extractUtmsFromOrder(order: ShopifyOrderLike): UtmExtraction {
  const out: UtmExtraction = {};

  // 1. Colonnes dénormalisées (priorité haute)
  if (order.utm_source) out.source = order.utm_source;
  if (order.utm_medium) out.medium = order.utm_medium;
  if (order.utm_campaign) out.campaign = order.utm_campaign;
  if (order.utm_content) out.content = order.utm_content;
  if (order.utm_term) out.term = order.utm_term;

  // 2. landing_site query string
  if (order.landing_site) {
    try {
      const url = new URL(order.landing_site);
      out.landing_path = url.pathname;
      if (url.search) {
        out.raw_query = url.search;
        if (!out.source) out.source = url.searchParams.get("utm_source") ?? undefined;
        if (!out.medium) out.medium = url.searchParams.get("utm_medium") ?? undefined;
        if (!out.campaign) out.campaign = url.searchParams.get("utm_campaign") ?? undefined;
        if (!out.content) out.content = url.searchParams.get("utm_content") ?? undefined;
        if (!out.term) out.term = url.searchParams.get("utm_term") ?? undefined;
      }
    } catch { /* invalid URL → skip */ }
  }

  // 3. note_attributes (peuvent contenir des utm_* en clé)
  if (Array.isArray(order.note_attributes)) {
    for (const attr of order.note_attributes) {
      if (!attr || typeof attr !== "object") continue;
      const name = String(attr.name ?? "").toLowerCase();
      const value = String(attr.value ?? "");
      if (!value) continue;
      if (name === "utm_source" && !out.source) out.source = value;
      else if (name === "utm_medium" && !out.medium) out.medium = value;
      else if (name === "utm_campaign" && !out.campaign) out.campaign = value;
      else if (name === "utm_content" && !out.content) out.content = value;
      else if (name === "utm_term" && !out.term) out.term = value;
    }
  }

  // 4. referring_site (fallback)
  if (order.referring_site) {
    out.referring_site = order.referring_site;
    if (!out.source) {
      const inferred = inferSourceFromReferrer(order.referring_site);
      if (inferred) out.source = inferred;
    }
  }

  return out;
}

/** Devine le provider depuis un domain de referrer. */
function inferSourceFromReferrer(referrer: string): string | undefined {
  const r = referrer.toLowerCase();
  if (r.includes("pinterest")) return "pinterest";
  if (r.includes("google") || r.includes("adwords")) return "google";
  if (r.includes("facebook") || r.includes("fb.com") || r.includes("meta")) return "facebook";
  if (r.includes("instagram")) return "instagram";
  if (r.includes("tiktok")) return "tiktok";
  return undefined;
}

/**
 * Normalise un nom de source vers un identifiant canonique de provider Ads.
 * Renvoie null si la source n'est pas un provider Ads tracké.
 */
export function normalizeSource(source: string | null | undefined): string | null {
  if (!source) return null;
  const s = source.toLowerCase().replace(/[_\s-]/g, "");
  if (["pinterest", "pinterestads", "pinterestcom"].includes(s)) return "pinterest";
  if (["google", "googleads", "googleadwords", "adwords", "googlecom"].includes(s)) return "google_ads";
  if (["facebook", "meta", "metaads", "fb", "fbads", "facebookcom", "instagram", "ig"].includes(s)) return "meta_ads";
  if (["tiktok", "tt", "tiktokads", "tiktokcom"].includes(s)) return "tiktok_ads";
  return null;
}

/**
 * Normalise un nom de campagne pour le match (case-insensitive, trim, espaces compactés).
 */
export function normalizeCampaignName(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, " ");
}
