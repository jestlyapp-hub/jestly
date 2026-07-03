/**
 * Flag de traçabilité d'une commande Shopify — 3 états DISTINCTS.
 *
 * Calculé à la sync depuis customerJourneySummary (migration 094) :
 *   'tracked'   : momentsCount > 0 ET attribution exploitable
 *   'ghost'     : momentsCount = 0 → parcours vide (ex. consentement refusé),
 *                 vente NON attribuable — ne jamais la compter comme trackée
 *   'unmatched' : momentsCount > 0 MAIS aucun signal d'attribution exploitable
 *   null        : inconnu — journey indisponible ou pas encore traité par Shopify
 *
 * "Attribution exploitable" = au moins un utm_*, un referrer, ou un gclid
 * dans la landing page (auto-tagging Google Ads sans utm).
 */

export type OrderTrackingStatus = "tracked" | "ghost" | "unmatched";

export interface TrackingSignals {
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  referring_site?: string | null;
  landing_site?: string | null;
}

/** Un signal d'attribution exploitable est-il présent sur la commande ? */
export function hasAttributionSignal(signals: TrackingSignals): boolean {
  if (signals.utm_source || signals.utm_medium || signals.utm_campaign) return true;
  if (signals.referring_site) return true;
  const landing = signals.landing_site ?? "";
  // Auto-tagging Google Ads (gclid) ou utm passés uniquement dans l'URL d'entrée.
  if (/[?&](gclid|gbraid|wbraid|utm_[a-z]+)=/i.test(landing)) return true;
  return false;
}

/**
 * @param momentsCount `customerJourneySummary.momentsCount.count`, ou null si
 *        le journey est indisponible / pas prêt (`ready` à false).
 */
export function computeTrackingStatus(
  momentsCount: number | null | undefined,
  signals: TrackingSignals,
): OrderTrackingStatus | null {
  if (momentsCount == null) return null;
  if (momentsCount === 0) return "ghost";
  return hasAttributionSignal(signals) ? "tracked" : "unmatched";
}
