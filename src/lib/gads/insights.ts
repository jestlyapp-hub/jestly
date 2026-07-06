/**
 * Insights automatiques du Dashboard (refonte ECOM, carte blanche A).
 * Règles SIMPLES sur la donnée réelle — pas d'IA, pas de déco. Chaque insight
 * est cliquable vers la vue concernée, max 5, priorisés par impact en euros.
 */
import type { BlendedStats } from "@/lib/costs/engine";
import type { DataQuality } from "@/lib/costs/blended";
import type { ProductAnalyticsRow } from "./product-analytics";

export type InsightSeverity = "critical" | "warning" | "info";

export interface Insight {
  id: string;
  severity: InsightSeverity;
  message: string;
  impact_cents: number;
  href: string;
}

const euros = (cents: number): string =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(cents / 100);

export function buildInsights(input: {
  current: BlendedStats;
  previous: BlendedStats;
  quality: DataQuality;
  products?: ProductAnalyticsRow[] | null;
  wastedSpendCents?: number;
}): Insight[] {
  const { current: c, previous: p, quality, products, wastedSpendCents } = input;
  const insights: Insight[] = [];

  // 1. MER sous le seuil de rentabilité — chaque euro de pub perd de l'argent.
  if (c.costs_configured && c.spend_cents > 0) {
    if (!c.be_roas_reachable) {
      insights.push({
        id: "structural_loss",
        severity: "critical",
        message: "Marge unitaire négative : le coût variable moyen dépasse le panier moyen — aucun budget publicitaire ne peut être rentable en l'état.",
        impact_cents: c.spend_cents,
        href: "/ecom/settings?tab=couts",
      });
    } else if (c.mer != null && c.be_roas != null && c.mer < c.be_roas) {
      insights.push({
        id: "mer_below_be",
        severity: "critical",
        message: `Ton MER (${c.mer.toFixed(2)}×) est sous ton seuil de rentabilité (${c.be_roas.toFixed(2)}×) : chaque euro de pub perd de l'argent en l'état.`,
        impact_cents: c.spend_cents,
        href: "/ecom",
      });
    }
  }

  // 2. Net Profit négatif sur la période.
  if (c.net_profit_cents != null && c.net_profit_cents < 0) {
    insights.push({
      id: "negative_profit",
      severity: "critical",
      message: `Net Profit négatif sur la période : ${euros(c.net_profit_cents)}.`,
      impact_cents: Math.abs(c.net_profit_cents),
      href: "/ecom",
    });
  }

  // 3. Budget consommé sans conversion → candidats à l'exclusion du flux.
  if (wastedSpendCents && wastedSpendCents > 0) {
    const topWasted = (products ?? []).find((r) => r.wasted_spend);
    insights.push({
      id: "wasted_spend",
      severity: "warning",
      message: topWasted
        ? `« ${topWasted.title} » a consommé ${euros(topWasted.ads?.spend_cents ?? 0)} sans conversion (${euros(wastedSpendCents)} au total) → candidat à l'exclusion du flux Shopping.`
        : `${euros(wastedSpendCents)} de budget consommé sans conversion sur la période → candidats à l'exclusion du flux Shopping.`,
      impact_cents: wastedSpendCents,
      href: "/ecom/products",
    });
  }

  // 4. Part fantôme du CA — et ce que le pixel a récupéré.
  const totalOrders = quality.tracked + quality.ghost + quality.unmatched + quality.unknown;
  if (totalOrders > 0 && quality.attributable_revenue_share != null && quality.attributable_revenue_share < 0.8) {
    const shadowCents = Math.round(c.revenue_cents * (1 - quality.attributable_revenue_share));
    const recovered = quality.pixel_recovered + quality.survey_recovered;
    insights.push({
      id: "ghost_share",
      severity: "warning",
      message: `${Math.round((1 - quality.attributable_revenue_share) * 100)} % de ton CA n'est pas attribuable sur la période${recovered > 0 ? ` — pixel et survey ont déjà récupéré ${recovered} commande${recovered > 1 ? "s" : ""}` : ""}.`,
      impact_cents: shadowCents,
      href: "/ecom/attribution",
    });
  }

  // 5. Dépense en forte hausse pendant que le MER recule.
  if (p.spend_cents > 0 && c.spend_cents > p.spend_cents * 1.3 && c.mer != null && p.mer != null && c.mer < p.mer) {
    insights.push({
      id: "spend_up_mer_down",
      severity: "warning",
      message: `La dépense a augmenté de ${Math.round(((c.spend_cents - p.spend_cents) / p.spend_cents) * 100)} % vs période précédente pendant que le MER passait de ${p.mer.toFixed(2)}× à ${c.mer.toFixed(2)}×.`,
      impact_cents: c.spend_cents - p.spend_cents,
      href: "/ecom?view=daily",
    });
  }

  // 6. Couverture COGS incomplète : le Net Profit est optimiste.
  if (c.costs_configured && c.cogs.total_units > 0 && c.cogs.coverage < 1) {
    insights.push({
      id: "cogs_coverage",
      severity: "info",
      message: `${Math.round((1 - c.cogs.coverage) * 100)} % des unités vendues n'ont pas de coût d'achat renseigné : ton Net Profit est optimiste.`,
      impact_cents: 0,
      href: "/ecom/settings?tab=couts",
    });
  }

  return insights.sort((a, b) => b.impact_cents - a.impact_cents).slice(0, 5);
}
