/**
 * Canaux marketing d'une commande — mesuré vs manuel.
 *
 * Le canal MESURÉ est dérivé des seules données captées par Shopify
 * (utm, referrer, gclid). Il distingue le payant de l'organique :
 * un referrer google.com SANS gclid ni utm payant est du SEO, pas du
 * Google Ads — compter l'organique dans le payant gonflerait le ROAS.
 *
 * Le canal MANUEL est l'hypothèse de Gabriel (order_manual_attribution).
 * L'EFFECTIF (utilisé par le « ROAS avec attributions manuelles ») prend
 * le manuel quand il existe, sinon le mesuré. Les deux ROAS restent
 * affichés côte à côte, jamais fusionnés.
 */
import { extractUtmsFromOrder, normalizeSource } from "@/lib/ads/utm-parser";

export type Channel = "google_ads" | "seo" | "pinterest" | "other" | "ghost";
export type ManualConfidence = "sure" | "assumed" | "guessed";

export const CHANNELS: Channel[] = ["google_ads", "seo", "pinterest", "other", "ghost"];

export interface OrderSignals {
  tracking_status?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  referring_site?: string | null;
  landing_site?: string | null;
}

const PAID_MEDIUMS = new Set(["cpc", "ppc", "paid", "paidsearch", "paid_search", "sem", "retargeting", "display"]);

/**
 * Canal mesuré d'une commande, ou null si inconnu (ghost, unmatched,
 * ou signaux inexploitables). N'utilise QUE la donnée captée.
 */
export function deriveMeasuredChannel(order: OrderSignals): Exclude<Channel, "ghost"> | null {
  // Parcours vide ou non capté : la vraie source est INCONNUE.
  if (order.tracking_status !== "tracked") return null;

  const landing = order.landing_site ?? "";
  // Auto-tagging Google Ads : preuve directe de clic payant.
  if (/[?&](gclid|gbraid|wbraid)=/i.test(landing)) return "google_ads";

  const utms = extractUtmsFromOrder(order);
  const provider = normalizeSource(utms.source);
  const medium = (utms.medium ?? "").toLowerCase();
  const hasExplicitUtm = Boolean(order.utm_source || order.utm_medium || order.utm_campaign || /[?&]utm_[a-z]+=/i.test(landing));

  if (provider === "google_ads") {
    // utm_source=google posé par une campagne (l'organique ne pose pas d'utm) → payant.
    if (hasExplicitUtm) return "google_ads";
    // Sinon : referrer google.com sans utm ni gclid = recherche organique.
    return "seo";
  }
  if (provider === "pinterest") return "pinterest";
  if (provider) return "other"; // meta_ads / tiktok_ads captés → autre canal payant

  // Referrer non publicitaire : moteur de recherche → SEO, sinon autre.
  const referrer = (order.referring_site ?? "").toLowerCase();
  if (/(google\.|bing\.|duckduckgo\.|qwant\.|ecosia\.|yahoo\.)/.test(referrer)) return "seo";
  if (referrer || hasExplicitUtm || PAID_MEDIUMS.has(medium)) return "other";
  return "other";
}

export interface ManualAttribution {
  channel: Channel;
  confidence: ManualConfidence | null;
}

/**
 * Canal effectif pour le « ROAS avec attributions manuelles » :
 * le choix manuel prime (y compris `ghost` explicite → non attribué),
 * sinon le canal mesuré.
 */
export function resolveEffectiveChannel(
  measured: Exclude<Channel, "ghost"> | null,
  manual: ManualAttribution | null | undefined,
): Exclude<Channel, "ghost"> | null {
  if (manual) return manual.channel === "ghost" ? null : manual.channel;
  return measured;
}

export const CHANNEL_LABELS: Record<Channel, string> = {
  google_ads: "Google Ads",
  seo: "SEO",
  pinterest: "Pinterest",
  other: "Autre",
  ghost: "Fantôme (non attribué)",
};

export const CONFIDENCE_LABELS: Record<ManualConfidence, string> = {
  sure: "Sûr",
  assumed: "Supposé",
  guessed: "Deviné",
};
