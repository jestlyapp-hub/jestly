/**
 * Détecteur d'anomalies basé sur des règles (rules-based).
 *
 * Alimente les AI Insights : les anomalies détectées ici sont injectées dans le
 * prompt Claude pour rédaction du brief quotidien, et déclenchent les alertes
 * critiques (push / email). Logique pure, testable, sans appel externe.
 */

export type Severity = "info" | "warning" | "critical";

export interface Anomaly {
  rule: string;
  severity: Severity;
  title: string;
  description: string;
}

export interface CampaignSnapshot {
  name: string;
  roas: number | null;
  /** Nombre de jours consécutifs sous 1x de ROAS. */
  days_below_1: number;
}

export interface AnomalyInput {
  ad_spend_today_cents: number;
  ad_spend_avg7_cents: number;
  conversions_today: number;
  conversions_avg7: number;
  conversion_rate_today: number; // 0..1
  conversion_rate_prev: number; // 0..1 (24 h précédentes)
  aov_today_cents: number;
  aov_avg7_cents: number;
  campaigns: CampaignSnapshot[];
  bounce_rate_today: number; // 0..1
  bounce_rate_avg7: number; // 0..1
  new_sources: string[];
  refunds_last7: number;
  /** Produits vus dans les Ads mais hors stock côté Shopify. */
  out_of_stock_seen_in_ads: string[];
  cohort_ltv30_current_cents: number;
  cohort_ltv30_prev_cents: number;
  goal_progress_percent: number | null; // avancement réel vers l'objectif du mois
  goal_expected_percent: number | null; // avancement attendu au prorata du mois
}

function eur(cents: number): string {
  return `${(cents / 100).toFixed(2)} €`;
}

/**
 * Applique les 10 règles. Retourne les anomalies déclenchées, des plus critiques
 * aux plus informatives.
 */
export function detectAnomalies(input: AnomalyInput): Anomaly[] {
  const out: Anomaly[] = [];

  // 1. Pic de dépense pub (+50 % vs moyenne 7j) sans conversions proportionnelles.
  if (
    input.ad_spend_avg7_cents > 0 &&
    input.ad_spend_today_cents >= input.ad_spend_avg7_cents * 1.5
  ) {
    const convRatio =
      input.conversions_avg7 > 0 ? input.conversions_today / input.conversions_avg7 : 0;
    if (convRatio < 1.2) {
      out.push({
        rule: "ad_spend_spike_no_conversions",
        severity: "critical",
        title: "Pic de dépense publicitaire sans conversions",
        description: `La dépense du jour (${eur(input.ad_spend_today_cents)}) dépasse de plus de 50 % la moyenne 7 jours (${eur(input.ad_spend_avg7_cents)}) sans hausse proportionnelle des conversions.`,
      });
    }
  }

  // 2. Taux de conversion -30 % sur 24 h.
  if (
    input.conversion_rate_prev > 0 &&
    input.conversion_rate_today <= input.conversion_rate_prev * 0.7
  ) {
    out.push({
      rule: "conversion_rate_drop_24h",
      severity: "critical",
      title: "Chute du taux de conversion",
      description: `Le taux de conversion a baissé de plus de 30 % sur 24 heures (${(input.conversion_rate_today * 100).toFixed(2)} % contre ${(input.conversion_rate_prev * 100).toFixed(2)} %).`,
    });
  }

  // 3. AOV -20 % sur 7j.
  if (input.aov_avg7_cents > 0 && input.aov_today_cents <= input.aov_avg7_cents * 0.8) {
    out.push({
      rule: "aov_drop_7d",
      severity: "warning",
      title: "Baisse du panier moyen",
      description: `Le panier moyen du jour (${eur(input.aov_today_cents)}) est inférieur de plus de 20 % à la moyenne 7 jours (${eur(input.aov_avg7_cents)}).`,
    });
  }

  // 4. ROAS d'une campagne < 1x pendant 3 jours.
  for (const c of input.campaigns) {
    if (c.days_below_1 >= 3) {
      out.push({
        rule: "campaign_roas_below_1",
        severity: "warning",
        title: `Campagne non rentable : ${c.name}`,
        description: `La campagne « ${c.name} » affiche un ROAS sous 1x depuis ${c.days_below_1} jours consécutifs.`,
      });
    }
  }

  // 5. Bounce rate +20 % (points relatifs) sur landing page.
  if (input.bounce_rate_avg7 > 0 && input.bounce_rate_today >= input.bounce_rate_avg7 * 1.2) {
    out.push({
      rule: "bounce_rate_spike",
      severity: "warning",
      title: "Hausse du taux de rebond",
      description: `Le taux de rebond du jour (${(input.bounce_rate_today * 100).toFixed(1)} %) dépasse de plus de 20 % la moyenne 7 jours.`,
    });
  }

  // 6. Nouvelle source d'achat détectée.
  for (const source of input.new_sources) {
    out.push({
      rule: "new_purchase_source",
      severity: "info",
      title: "Nouvelle source d'achat",
      description: `Une nouvelle source de conversion est apparue : ${source}.`,
    });
  }

  // 7. Pic de remboursements (au moins 3 sur 7 jours).
  if (input.refunds_last7 >= 3) {
    out.push({
      rule: "refund_spike",
      severity: "critical",
      title: "Pic de remboursements",
      description: `${input.refunds_last7} remboursements enregistrés sur les 7 derniers jours.`,
    });
  }

  // 8. Rupture de stock sur un produit encore diffusé en Ads.
  for (const product of input.out_of_stock_seen_in_ads) {
    out.push({
      rule: "out_of_stock_in_ads",
      severity: "critical",
      title: "Produit en rupture toujours diffusé",
      description: `Le produit « ${product} » est hors stock côté Shopify mais reste diffusé dans vos annonces.`,
    });
  }

  // 9. Dégradation de la LTV à 30j entre cohortes successives.
  if (
    input.cohort_ltv30_prev_cents > 0 &&
    input.cohort_ltv30_current_cents < input.cohort_ltv30_prev_cents
  ) {
    out.push({
      rule: "cohort_ltv_decline",
      severity: "warning",
      title: "Recul de la LTV à 30 jours",
      description: `La LTV à 30 jours de la dernière cohorte (${eur(input.cohort_ltv30_current_cents)}) est inférieure à celle de la précédente (${eur(input.cohort_ltv30_prev_cents)}).`,
    });
  }

  // 10. Objectif du mois en retard sur le rythme attendu.
  if (
    input.goal_progress_percent !== null &&
    input.goal_expected_percent !== null &&
    input.goal_progress_percent < input.goal_expected_percent - 10
  ) {
    out.push({
      rule: "goal_off_track",
      severity: "info",
      title: "Objectif du mois en retard",
      description: `Vous êtes à ${input.goal_progress_percent.toFixed(0)} % de l'objectif alors que ${input.goal_expected_percent.toFixed(0)} % étaient attendus à ce stade du mois.`,
    });
  }

  const order: Record<Severity, number> = { critical: 0, warning: 1, info: 2 };
  return out.sort((a, b) => order[a.severity] - order[b.severity]);
}
