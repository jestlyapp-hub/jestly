/**
 * Conversions & libellés Pinterest.
 *
 * ⚠️ DEUX unités monétaires distinctes chez Pinterest (source de bugs ROAS) :
 *  - Champs budget/bid des objets (campaigns/ad_groups) : MICRO-units de la devise
 *    (1 € = 1 000 000 micro)  → microToCents = /10 000.
 *  - Colonnes analytics *_IN_DOLLAR (SPEND_IN_DOLLAR, CPC_IN_DOLLAR, …) :
 *    valeurs en UNITÉS de la devise du compte (1 € = 1.0), MALGRÉ le nom "_IN_DOLLAR".
 *    → currencyUnitsToCents = *100.
 * On stocke tout en cents (1 € = 100 cents) pour les calculs cross-canal.
 */

/** Micro-units de devise → cents. 1 000 000 micro = 1 € = 100 cents. */
export function microToCents(value: number | null | undefined): number {
  if (value == null || Number.isNaN(value)) return 0;
  return Math.round(value / 10_000);
}

/** Unités de devise (ex: SPEND_IN_DOLLAR=12.34) → cents (1234). */
export function currencyUnitsToCents(value: number | null | undefined): number {
  if (value == null || Number.isNaN(value)) return 0;
  return Math.round(value * 100);
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Actif",
  PAUSED: "En pause",
  ARCHIVED: "Archivé",
  DRAFT: "Brouillon",
  RUNNING: "En cours",
  COMPLETED: "Terminé",
};

export function formatPinterestStatus(status?: string | null): string {
  if (!status) return "—";
  return STATUS_LABELS[status.toUpperCase()] ?? status;
}

const OBJECTIVE_LABELS: Record<string, string> = {
  AWARENESS: "Notoriété",
  CONSIDERATION: "Considération",
  VIDEO_VIEW: "Vues vidéo",
  WEB_CONVERSION: "Conversions web",
  CATALOG_SALES: "Ventes catalogue",
  WEB_SESSIONS: "Sessions web",
};

export function formatObjectiveType(type?: string | null): string {
  if (!type) return "—";
  return OBJECTIVE_LABELS[type.toUpperCase()] ?? type;
}
