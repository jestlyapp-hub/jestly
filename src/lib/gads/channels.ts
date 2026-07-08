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

// ── Canal unifié d'affichage (une seule vérité pour tous les widgets) ──
//
// Réduit les trois signaux d'une commande (natif Shopify, pixel first-party,
// attribution manuelle) à UN canal affichable, avec les mêmes chips et
// couleurs partout. Le fantôme (source inconnue) est un canal explicite
// « Non attribué » — jamais fondu dans « Direct ». Aucun widget ne lit plus
// le source_name brut de Shopify.
export type DisplayChannel = "google_ads" | "seo" | "pinterest" | "other" | "direct" | "unattributed";

/** Source résolue par le pixel (schéma 097) — inclut « direct » (canal réel). */
export type PixelResolvedSource = "google_ads" | "seo" | "pinterest" | "direct" | "other";

/**
 * Précédence identique au reste de l'app : le natif Shopify (mesuré) est la
 * référence ; le pixel ne fait que combler une source inconnue ; l'attribution
 * manuelle est l'hypothèse de dernier recours. Rien de mesuré, rien au pixel,
 * rien de posé → « Non attribué » (ex-fantôme rendu visible).
 */
export function resolveUnifiedChannel(input: {
  measured: Exclude<Channel, "ghost"> | null;
  pixel?: { resolved_source: PixelResolvedSource } | null;
  manual?: { channel: Channel } | null;
}): DisplayChannel {
  if (input.measured) return input.measured;
  if (input.pixel) return input.pixel.resolved_source;
  if (input.manual && input.manual.channel !== "ghost") return input.manual.channel;
  return "unattributed";
}

// ── Statut d'affichage de traçabilité (dérivé, jamais persisté) ──────
//
// `tracking_status` en base reste la vérité technique Shopify (tracked / ghost /
// unmatched), JAMAIS réécrit. Mais l'AFFICHAGE combine cette vérité avec
// l'existence d'une résolution (pixel / manuel / survey) : une commande fantôme
// qui a reçu une résolution n'est plus « Fantôme » rouge — elle devient
// « Résolu Jestly » violet, car elle compte désormais dans les stats du canal.
// Ce statut est CALCULÉ à l'affichage, jamais écrit comme « tracked ».
export type DisplayTrackingStatus = "tracked" | "resolved_jestly" | "ghost" | "unmatched" | "unknown";

/**
 * Statut d'affichage d'une commande :
 *  - tracked          → mesurée par Shopify (vert)
 *  - resolved_jestly  → ghost/unmatched MAIS résolue (pixel/manuel/survey) → violet
 *  - ghost / unmatched → non résolue, vraiment dans l'ombre (rouge / ambre)
 */
export function resolveDisplayStatus(
  trackingStatus: string | null | undefined,
  hasResolution: boolean,
): DisplayTrackingStatus {
  if (trackingStatus === "tracked") return "tracked";
  const base: DisplayTrackingStatus =
    trackingStatus === "ghost" ? "ghost" : trackingStatus === "unmatched" ? "unmatched" : "unknown";
  // Une commande non mesurée mais résolue par Jestly sort de l'ombre.
  if (hasResolution && (base === "ghost" || base === "unmatched")) return "resolved_jestly";
  return base;
}

/** Libellé + pastille + description, constants dans toute l'app. */
export const DISPLAY_STATUS_META: Record<DisplayTrackingStatus, { label: string; dot: string; description: string }> = {
  tracked: {
    label: "Trackée",
    dot: "bg-emerald-500",
    description: "Parcours mesuré par Shopify (utm, referrer ou gclid capté).",
  },
  resolved_jestly: {
    label: "Résolu Jestly",
    dot: "bg-[#7C3AED]",
    description: "Parcours non capté par Shopify, mais cette vente est attribuée à un canal via Jestly (pixel, ton attribution manuelle ou survey). Elle compte dans tes stats de ce canal.",
  },
  ghost: {
    label: "Fantôme",
    dot: "bg-rose-500",
    description: "Parcours vide (momentsCount = 0) et aucune résolution — vraiment dans l'ombre.",
  },
  unmatched: {
    label: "Non rattachée",
    dot: "bg-amber-500",
    description: "Parcours présent mais aucun signal exploitable ni résolution.",
  },
  unknown: {
    label: "Inconnue",
    dot: "bg-[#B4B4B2]",
    description: "Parcours pas encore disponible (commande à resynchroniser).",
  },
};

/** Libellé + classes de chip + couleur de pastille, constants dans toute l'app. */
export const DISPLAY_CHANNEL_META: Record<DisplayChannel, { label: string; chip: string; dot: string }> = {
  google_ads:   { label: "Google Ads",  chip: "bg-[#EEF2FF] text-[#4338CA] border-[#C7D2FE]",       dot: "#6366F1" },
  seo:          { label: "SEO",          chip: "bg-emerald-50 text-emerald-700 border-emerald-200",  dot: "#10B981" },
  pinterest:    { label: "Pinterest",    chip: "bg-rose-50 text-rose-700 border-rose-200",           dot: "#E60023" },
  other:        { label: "Autre",        chip: "bg-violet-50 text-violet-700 border-violet-200",     dot: "#8B5CF6" },
  direct:       { label: "Direct",       chip: "bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]",       dot: "#64748B" },
  unattributed: { label: "Non attribué", chip: "bg-amber-50 text-amber-700 border-amber-200",        dot: "#F59E0B" },
};
