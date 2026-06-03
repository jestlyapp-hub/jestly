/**
 * Types du moteur d'attribution multi-touch (MTA).
 *
 * Un order Shopify est rattaché à une suite de touchpoints (clics, vues
 * d'annonces, sessions paid) ordonnés dans le temps. Chaque modèle répartit
 * 100 % du revenu de la commande sur ces touchpoints selon sa propre logique.
 */

export type AttributionModelKey =
  | "last_click"
  | "first_click"
  | "linear"
  | "time_decay"
  | "position_based";

export const ATTRIBUTION_MODELS: AttributionModelKey[] = [
  "last_click",
  "first_click",
  "linear",
  "time_decay",
  "position_based",
];

/** Libellés FR pour l'UI (vouvoiement, sans em-dash). */
export const ATTRIBUTION_MODEL_LABELS: Record<AttributionModelKey, string> = {
  last_click: "Dernier clic",
  first_click: "Premier clic",
  linear: "Linéaire",
  time_decay: "Décroissance temporelle",
  position_based: "Basé sur la position",
};

export interface Touchpoint {
  /** Canal normalisé : pinterest, google_ads, meta_ads, email, direct, organic... */
  channel: string;
  campaign_id: string | null;
  campaign_name: string | null;
  /** Horodatage ISO 8601 du touchpoint. */
  occurred_at: string;
  source: string | null;
}

export interface WeightedTouchpoint extends Touchpoint {
  /** Poids d'attribution dans [0, 1]. La somme des poids d'une commande vaut 1. */
  weight: number;
  /** Revenu attribué en centimes (somme exacte = order_total_cents). */
  attributed_cents: number;
}

export interface AttributionResult {
  model: AttributionModelKey;
  order_id: string;
  order_total_cents: number;
  currency: string;
  touchpoints: WeightedTouchpoint[];
  /** Map canal vers centimes attribués (agrégation des touchpoints par canal). */
  attributed_channels: Record<string, number>;
}

/**
 * Signature commune des fonctions de pondération.
 * Reçoit les touchpoints triés par date croissante et l'instant de conversion.
 * Retourne un tableau de poids de même longueur dont la somme vaut 1
 * (ou 0 si aucun touchpoint).
 */
export type WeightFn = (touchpoints: Touchpoint[], conversionAt: string) => number[];
