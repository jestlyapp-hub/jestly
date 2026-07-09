/**
 * Catalogue de présentation des métriques configurables du Dashboard (client).
 * La DONNÉE vient de /api/ecom/dashboard/metrics ; ce registre porte uniquement
 * le rendu : label, section, unité, tooltip formule, sens (goodWhenUp), défaut.
 * Découplage strict → une métrique s'ajoute sans toucher au calcul serveur.
 */
import { formatCurrency, formatNumberFr, formatRoas } from "@/lib/ads/formatters";

export type MetricSection = "acquisition" | "rentabilite" | "attribution";
export type MetricUnit = "currency" | "number" | "ratio_x" | "percent";

export interface MetricDef {
  id: string;
  label: string;
  section: MetricSection;
  unit: MetricUnit;
  tooltip?: string;
  /** true = une hausse est bonne (colore le delta en vert). */
  goodWhenUp?: boolean;
  /** Affichée par défaut si l'utilisateur n'a pas encore choisi. */
  defaultVisible?: boolean;
}

export const SECTION_LABELS: Record<MetricSection, string> = {
  acquisition: "Acquisition",
  rentabilite: "Rentabilité",
  attribution: "Attribution",
};

export const SECTION_ORDER: MetricSection[] = ["acquisition", "rentabilite", "attribution"];

export const METRIC_CATALOG: MetricDef[] = [
  // ── Acquisition ──
  { id: "revenue", label: "Revenue", section: "acquisition", unit: "currency", goodWhenUp: true, defaultVisible: true, tooltip: "CA Shopify (SUM sur la période)" },
  { id: "spend", label: "Blended Ad Spend", section: "acquisition", unit: "currency", defaultVisible: true, tooltip: "Dépense Google Ads (CSV/API)" },
  { id: "orders", label: "Commandes", section: "acquisition", unit: "number", goodWhenUp: true, defaultVisible: true, tooltip: "Nombre de commandes réelles" },
  { id: "new_customers", label: "Nouveaux clients", section: "acquisition", unit: "number", goodWhenUp: true, tooltip: "1re commande du customer_id (tout historique)" },
  { id: "aov", label: "AOV", section: "acquisition", unit: "currency", goodWhenUp: true, defaultVisible: true, tooltip: "AOV = Revenue ÷ nombre de commandes" },
  { id: "nc_aov", label: "Panier moyen NC", section: "acquisition", unit: "currency", goodWhenUp: true, tooltip: "CA nouveaux clients ÷ nombre de nouveaux clients" },
  { id: "clicks", label: "Clics", section: "acquisition", unit: "number", tooltip: "Clics Google Ads sur la période" },
  { id: "impressions", label: "Impressions", section: "acquisition", unit: "number", tooltip: "Impressions Google Ads sur la période" },
  { id: "ctr", label: "CTR", section: "acquisition", unit: "percent", tooltip: "CTR = clics ÷ impressions" },
  { id: "cpc", label: "CPC moyen", section: "acquisition", unit: "currency", tooltip: "CPC = dépense ÷ clics" },
  { id: "conversions", label: "Conversions Google", section: "acquisition", unit: "number", goodWhenUp: true, tooltip: "Conversions déclarées par Google" },
  { id: "conversion_rate", label: "Taux de conversion", section: "acquisition", unit: "percent", goodWhenUp: true, tooltip: "Commandes ÷ sessions" },
  // ── Rentabilité ──
  { id: "mer", label: "MER", section: "rentabilite", unit: "ratio_x", goodWhenUp: true, defaultVisible: true, tooltip: "MER = SUM(Revenue) ÷ SUM(dépense) — insensible aux ventes fantômes" },
  { id: "be_roas", label: "BE-ROAS", section: "rentabilite", unit: "ratio_x", defaultVisible: true, tooltip: "Seuil de rentabilité = AOV ÷ (AOV − coût variable moyen/commande)" },
  { id: "net_profit", label: "Net Profit", section: "rentabilite", unit: "currency", goodWhenUp: true, defaultVisible: true, tooltip: "Revenue − COGS − dépense − frais − dépenses récurrentes" },
  { id: "net_margin", label: "Net Margin", section: "rentabilite", unit: "percent", goodWhenUp: true, tooltip: "Net Margin = Net Profit ÷ Revenue" },
  { id: "cogs_coverage", label: "Couverture COGS", section: "rentabilite", unit: "percent", goodWhenUp: true, tooltip: "Part des unités vendues avec un coût renseigné" },
  { id: "nc_roas", label: "NC-ROAS", section: "rentabilite", unit: "ratio_x", goodWhenUp: true, tooltip: "CA nouveaux clients ÷ dépense" },
  { id: "ncpa", label: "NCPA", section: "rentabilite", unit: "currency", tooltip: "Dépense ÷ nombre de nouveaux clients" },
  { id: "cpa", label: "CPA", section: "rentabilite", unit: "currency", tooltip: "Coût / conversion Google (dépense ÷ conversions)" },
  // ── Attribution ──
  { id: "roas_google", label: "ROAS Google", section: "attribution", unit: "ratio_x", defaultVisible: true, tooltip: "Ce que Google s'attribue : valeur de conversion ÷ dépense" },
  { id: "roas_jestly", label: "ROAS Jestly", section: "attribution", unit: "ratio_x", goodWhenUp: true, defaultVisible: true, tooltip: "CA Shopify attribué au canal Google (mesuré + pixel + manuel) ÷ dépense" },
  { id: "attributable_share", label: "% CA attribuable", section: "attribution", unit: "percent", goodWhenUp: true, tooltip: "Part du CA rattachée à un canal (mesuré + pixel + manuel + survey)" },
  { id: "ca_google", label: "CA Google Ads", section: "attribution", unit: "currency", goodWhenUp: true, tooltip: "CA Shopify attribué à Google Ads (effectif)" },
  { id: "ca_seo", label: "CA SEO", section: "attribution", unit: "currency", goodWhenUp: true, tooltip: "CA Shopify attribué au SEO (effectif)" },
  { id: "ca_pinterest", label: "CA Pinterest", section: "attribution", unit: "currency", goodWhenUp: true, tooltip: "CA Shopify attribué à Pinterest (effectif)" },
  { id: "ca_other", label: "CA Autre", section: "attribution", unit: "currency", goodWhenUp: true, tooltip: "CA Shopify attribué aux autres canaux (effectif)" },
];

export const METRIC_BY_ID: Record<string, MetricDef> = Object.fromEntries(METRIC_CATALOG.map((d) => [d.id, d]));

/** Sélection KPI par défaut (Dashboard), ordre inclus. */
export const DEFAULT_KPI_IDS: string[] = METRIC_CATALOG.filter((d) => d.defaultVisible).map((d) => d.id);

/** Colonnes par défaut de la Vue journalière. */
export const DEFAULT_DAILY_IDS: string[] = ["spend", "clicks", "conversions", "revenue", "orders", "roas_google"];

/** Formatte une valeur selon son unité. Valeur nulle → « non disponible ». */
export function formatMetric(value: number | null | undefined, unit: MetricUnit): string {
  if (value == null) return "non disponible";
  switch (unit) {
    case "currency": return formatCurrency(value);
    case "number": return formatNumberFr(Math.round(value));
    case "ratio_x": return formatRoas(value);
    case "percent": return `${(value * 100).toFixed(1)} %`;
  }
}

/** Delta % relatif vs période précédente (null si incalculable). */
export function metricDelta(value: number | null, previous: number | null): number | null {
  if (value == null || previous == null || previous === 0) return null;
  return Math.round(((value - previous) / Math.abs(previous)) * 1000) / 10;
}
