/**
 * Catalogue de présentation des métriques configurables du DÉTAIL CAMPAGNE.
 * Même mécanique que le catalogue Dashboard (`metric-catalog.ts`) : ce registre
 * ne porte que le RENDU (label, section, unité, tooltip, sens, défaut) — la
 * donnée vient de la carte `metrics` du détail campagne. Découplage strict.
 *
 * On réutilise `MetricSection`, `MetricUnit`, `formatMetric`, `metricDelta` et le
 * type `MetricDef` du catalogue Dashboard : sections et rendu identiques, seule
 * la LISTE de métriques diffère (scopée campagne : Part du budget, % des ventes…).
 */
import type { MetricDef } from "./metric-catalog";

export const CAMPAIGN_METRIC_CATALOG: MetricDef[] = [
  // ── Acquisition ──
  { id: "spend", label: "Dépense", section: "acquisition", unit: "currency", defaultVisible: true, tooltip: "Dépense Google Ads de la campagne (SUM sur la période)" },
  { id: "clicks", label: "Clics", section: "acquisition", unit: "number", tooltip: "Clics Google Ads de la campagne" },
  { id: "impressions", label: "Impressions", section: "acquisition", unit: "number", tooltip: "Impressions Google Ads de la campagne" },
  { id: "ctr", label: "CTR", section: "acquisition", unit: "percent", tooltip: "CTR = clics ÷ impressions" },
  { id: "cpc", label: "CPC moyen", section: "acquisition", unit: "currency", tooltip: "CPC = dépense ÷ clics" },
  { id: "conversions", label: "Conversions Google", section: "acquisition", unit: "number", goodWhenUp: true, tooltip: "Conversions déclarées par Google pour cette campagne" },
  { id: "budget_share", label: "Part du budget total", section: "acquisition", unit: "percent", tooltip: "Dépense de la campagne ÷ dépense Google Ads totale de la boutique" },
  // ── Attribution ──
  { id: "ca_attributed", label: "CA Shopify attribué", section: "attribution", unit: "currency", goodWhenUp: true, defaultVisible: true, tooltip: "CA Shopify réel attribué à cette campagne (résolution unifiée : mesuré + pixel + manuel)" },
  { id: "orders", label: "Nb ventes", section: "attribution", unit: "number", goodWhenUp: true, defaultVisible: true, tooltip: "Ventes Shopify attribuées à cette campagne" },
  { id: "aov", label: "AOV campagne", section: "attribution", unit: "currency", goodWhenUp: true, tooltip: "Panier moyen = CA attribué ÷ nombre de ventes attribuées" },
  { id: "roas_google", label: "ROAS Google", section: "attribution", unit: "ratio_x", defaultVisible: true, tooltip: "Ce que Google s'attribue : valeur de conversion ÷ dépense. Surestime souvent." },
  { id: "roas_jestly", label: "ROAS Jestly", section: "attribution", unit: "ratio_x", goodWhenUp: true, defaultVisible: true, tooltip: "CA Shopify réel attribué à la campagne ÷ dépense — ton chiffre de pilotage" },
  { id: "sales_share", label: "% des ventes boutique", section: "attribution", unit: "percent", tooltip: "CA attribué à la campagne ÷ CA total de la boutique sur la période" },
  // ── Rentabilité ──
  { id: "net_profit", label: "Net Profit campagne", section: "rentabilite", unit: "currency", goodWhenUp: true, tooltip: "CA attribué − COGS − dépense − frais par commande (dépenses récurrentes exclues, non imputables à une campagne)" },
  { id: "cpa", label: "CPA", section: "rentabilite", unit: "currency", defaultVisible: true, tooltip: "Dépense ÷ ventes attribuées (résolution Jestly)" },
];

export const CAMPAIGN_METRIC_BY_ID: Record<string, MetricDef> = Object.fromEntries(
  CAMPAIGN_METRIC_CATALOG.map((d) => [d.id, d]),
);

/** Sélection KPI par défaut du détail campagne, ordre inclus. */
export const DEFAULT_CAMPAIGN_KPI_IDS: string[] = CAMPAIGN_METRIC_CATALOG.filter((d) => d.defaultVisible).map((d) => d.id);

/** KPI cerclés (liseré violet) : ROAS Jestly + Net Profit campagne. */
export const CAMPAIGN_HIGHLIGHT_IDS: string[] = ["roas_jestly", "net_profit"];
