/**
 * Insights « À regarder » d'une campagne — règles déterministes (pas d'IA),
 * priorisés par impact en euros, au même format `Insight` que le tiroir du
 * Dashboard (réutilisation directe de `InsightsDrawer`). Les liens pointent vers
 * les ancres de sections de la page détail (#analyse, #produits, #graphe).
 */
import type { Insight } from "./insights";
import type { CampaignProductRowOut } from "./campaign-detail";
import type { CampaignTrend, BudgetRecommendation } from "./campaign-analysis";
import { formatCurrency } from "@/lib/ads/formatters";

export function buildCampaignInsights(input: {
  roas_jestly: number | null;
  be_roas: number | null;
  spend_cents: number;
  products_active: CampaignProductRowOut[];
  products_inactive: CampaignProductRowOut[];
  trend: CampaignTrend;
  recommendation: BudgetRecommendation;
  limit?: number;
}): Insight[] {
  const { roas_jestly, be_roas, spend_cents, products_active, products_inactive, trend, recommendation } = input;
  const out: Insight[] = [];

  // 1. Produits qui brûlent du budget sans convertir → à exclure du flux.
  const wasted = products_active.filter((p) => p.candidate_exclude);
  const wastedSpend = wasted.reduce((s, p) => s + p.spend_cents, 0);
  if (wasted.length > 0 && wastedSpend > 0) {
    out.push({
      id: "campaign_wasted_products",
      severity: "warning",
      message: `${wasted.length} produit${wasted.length > 1 ? "s" : ""} dépensent sans aucune conversion — candidats à l'exclusion du flux.`,
      impact_cents: wastedSpend,
      href: "#produits",
    });
  }

  // 2. Recommandation budget (perte ou opportunité).
  if (recommendation.direction === "decrease") {
    out.push({
      id: "campaign_loss",
      severity: "critical",
      message: recommendation.message,
      impact_cents: spend_cents,
      href: "#analyse",
    });
  } else if (recommendation.direction === "increase") {
    out.push({
      id: "campaign_opportunity",
      severity: "info",
      message: recommendation.projected_ca_delta_cents != null
        ? `${recommendation.message} Projection à ROAS constant : ≈ ${formatCurrency(recommendation.projected_ca_delta_cents)} de CA en plus.`
        : recommendation.message,
      impact_cents: recommendation.projected_ca_delta_cents ?? 0,
      href: "#analyse",
    });
  }

  // 3. Campagne rentable qui décroche (alerte tendance).
  const profitable = roas_jestly != null && be_roas != null && roas_jestly >= be_roas;
  if (profitable && trend.available && trend.direction === "down" && trend.pct != null && trend.pct <= -0.1) {
    out.push({
      id: "campaign_trend_down",
      severity: "warning",
      message: `Campagne rentable qui décroche : ROAS Jestly en baisse de ${Math.round(Math.abs(trend.pct) * 100)} % sur ${trend.window_days} j — surveille avant que ça bascule.`,
      impact_cents: spend_cents,
      href: "#graphe",
    });
  }

  // 4. Produits qui vendaient mais ne diffusent plus → à réactiver.
  const reactivate = products_inactive.filter((p) => p.candidate_reactivate);
  const reactivateRevenue = reactivate.reduce((s, p) => s + p.jestly_revenue_cents, 0);
  if (reactivate.length > 0) {
    out.push({
      id: "campaign_reactivate_products",
      severity: "info",
      message: `${reactivate.length} produit${reactivate.length > 1 ? "s" : ""} vendaient via la campagne mais ne diffusent plus — candidats à réactiver.`,
      impact_cents: reactivateRevenue,
      href: "#produits",
    });
  }

  return out
    .sort((a, b) => b.impact_cents - a.impact_cents)
    .slice(0, input.limit ?? 6);
}
