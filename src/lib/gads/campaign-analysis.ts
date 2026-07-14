/**
 * Analyses avancées d'une campagne — fonctions PURES, testables sans DB.
 *
 * Tendance, score de rentabilité, recommandation de budget et carte de métriques
 * configurables (même forme `MetricValue` que le Dashboard). RÈGLES, pas d'IA :
 * chaque sortie est déterministe et honnête (donnée absente → non disponible,
 * jamais inventée ; projections annoncées comme telles).
 *
 * Garde-fou : le seuil de rentabilité (`be_roas`) est celui de la BOUTIQUE
 * (point mort unique) ; on ne fabrique jamais un seuil par campagne.
 */
import type { MetricValue } from "./dashboard-metrics";
import { SMALL_SAMPLE_THRESHOLD } from "./attribution-aggregator";

/** Point journalier minimal (structurel) — évite un import circulaire. */
export interface DailyPointLike {
  date: string;
  spend_cents: number;
  jestly_revenue_cents: number;
  rolling_roas: number | null;
}

/** Agrégats KPI d'une campagne sur une période (SUM/SUM). */
export interface CampaignAggregate {
  spend_cents: number;
  clicks: number;
  impressions: number;
  ctr: number | null;
  avg_cpc_cents: number | null;
  google_conversions: number;
  google_conversion_value_cents: number;
  roas_google: number | null;
  jestly_orders: number;
  jestly_revenue_cents: number;
  roas_jestly: number | null;
  cpa_cents: number | null;
  aov_cents: number | null;
  net_profit_cents: number | null;
}

// ── Tendance ROAS Jestly ──────────────────────────────────────────
export interface CampaignTrend {
  available: boolean;
  direction: "up" | "down" | "flat";
  /** Variation relative (0,12 = +12 %). null si incalculable. */
  pct: number | null;
  window_days: number;
  recent_roas: number | null;
  prior_roas: number | null;
}

const roasOfWindow = (pts: DailyPointLike[]): number | null => {
  let s = 0, r = 0;
  for (const p of pts) { s += p.spend_cents; r += p.jestly_revenue_cents; }
  return s > 0 ? Math.round((r / s) * 10000) / 10000 : null;
};

/**
 * Tendance du ROAS Jestly : compare les N derniers jours aux N précédents
 * (SUM/SUM), N = min(14, moitié des jours dispo). Fenêtre honnête, bornée à la
 * période sélectionnée — pas de requête 60 j séparée. < 3 jours par fenêtre →
 * non disponible plutôt qu'un signal trompeur.
 */
export function computeCampaignTrend(points: DailyPointLike[]): CampaignTrend {
  const len = points.length;
  const window = Math.min(14, Math.floor(len / 2));
  const base: CampaignTrend = { available: false, direction: "flat", pct: null, window_days: window, recent_roas: null, prior_roas: null };
  if (window < 3) return base;
  const recent = roasOfWindow(points.slice(len - window));
  const prior = roasOfWindow(points.slice(len - 2 * window, len - window));
  if (recent == null || prior == null || prior === 0) {
    return { ...base, recent_roas: recent, prior_roas: prior };
  }
  const pct = Math.round(((recent - prior) / prior) * 1000) / 1000;
  const direction: CampaignTrend["direction"] = pct > 0.03 ? "up" : pct < -0.03 ? "down" : "flat";
  return { available: true, direction, pct, window_days: window, recent_roas: recent, prior_roas: prior };
}

// ── Score de rentabilité ──────────────────────────────────────────
export interface CampaignScore {
  available: boolean;
  /** 0-100 combinant performance (ROAS vs seuil), volume, régularité. */
  score: number;
  label: "Excellent" | "Bon" | "Moyen" | "Faible" | "—";
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/**
 * Score 0-100 : performance (ROAS Jestly ÷ seuil de rentabilité, 55 pts),
 * volume de ventes attribuées (25 pts), régularité du ROAS journalier (20 pts).
 * Non calculable sans seuil ou sans ROAS → non disponible.
 */
export function computeCampaignScore(input: {
  roas_jestly: number | null;
  be_roas: number | null;
  jestly_orders: number;
  points: DailyPointLike[];
}): CampaignScore {
  const { roas_jestly, be_roas, jestly_orders, points } = input;
  if (roas_jestly == null || be_roas == null || be_roas <= 0) {
    return { available: false, score: 0, label: "—" };
  }
  const perf = (clamp(roas_jestly / be_roas, 0, 2) / 2) * 55;
  const volume = clamp(jestly_orders / 10, 0, 1) * 25;

  // Régularité : coefficient de variation du ROAS glissant (jours avec dépense).
  const roasSeries = points.filter((p) => p.spend_cents > 0 && p.rolling_roas != null).map((p) => p.rolling_roas!);
  let regularity = 10; // neutre si pas assez de points
  if (roasSeries.length >= 3) {
    const mean = roasSeries.reduce((a, b) => a + b, 0) / roasSeries.length;
    if (mean > 0) {
      const variance = roasSeries.reduce((a, b) => a + (b - mean) ** 2, 0) / roasSeries.length;
      const cv = Math.sqrt(variance) / mean;
      regularity = (1 - clamp(cv, 0, 1)) * 20;
    }
  }
  const score = Math.round(clamp(perf + volume + regularity, 0, 100));
  const label: CampaignScore["label"] = score >= 75 ? "Excellent" : score >= 55 ? "Bon" : score >= 35 ? "Moyen" : "Faible";
  return { available: true, score, label };
}

// ── Recommandation de budget ──────────────────────────────────────
export interface BudgetRecommendation {
  direction: "increase" | "decrease" | "hold" | "insufficient";
  message: string;
  /** Suggestion de variation de budget (0,3 = +30 %). null si non applicable. */
  suggested_delta_pct: number | null;
  /** CA attribué projeté supplémentaire à ROAS constant (cents). null si non applicable. */
  projected_ca_delta_cents: number | null;
}

/**
 * Recommandation déterministe (règle, pas d'IA). Rentable, au-dessus du seuil de
 * façon nette, avec volume → augmenter le budget (projection à ROAS constant,
 * annoncée comme telle). Sous le seuil → réduire / retravailler. Sinon maintenir.
 * Le ROAS pouvant se dégrader à l'échelle, la projection est un ordre de grandeur.
 */
export function computeBudgetRecommendation(input: {
  roas_jestly: number | null;
  be_roas: number | null;
  spend_cents: number;
  jestly_orders: number;
  sample_small: boolean;
}): BudgetRecommendation {
  const { roas_jestly, be_roas, spend_cents, jestly_orders, sample_small } = input;
  if (roas_jestly == null || be_roas == null) {
    return {
      direction: "insufficient",
      message: "Rentabilité non calculable (coûts non renseignés ou pas de ventes attribuées) — impossible de recommander un budget.",
      suggested_delta_pct: null,
      projected_ca_delta_cents: null,
    };
  }
  if (roas_jestly >= be_roas * 1.15 && !sample_small && jestly_orders >= SMALL_SAMPLE_THRESHOLD) {
    const pct = 0.3;
    const projected = Math.round(spend_cents * pct * roas_jestly);
    return {
      direction: "increase",
      message: `Rentable et sous-exploitée : ROAS Jestly ${roas_jestly.toFixed(2)}× nettement au-dessus du seuil ${be_roas.toFixed(2)}×. Envisage d'augmenter le budget.`,
      suggested_delta_pct: pct,
      projected_ca_delta_cents: projected,
    };
  }
  if (roas_jestly < be_roas) {
    return {
      direction: "decrease",
      message: `En perte : ROAS Jestly ${roas_jestly.toFixed(2)}× sous le seuil de rentabilité ${be_roas.toFixed(2)}×. Réduis le budget ou retravaille la campagne (ciblage, produits, enchères).`,
      suggested_delta_pct: -0.2,
      projected_ca_delta_cents: null,
    };
  }
  return {
    direction: "hold",
    message: `Proche du seuil (ROAS Jestly ${roas_jestly.toFixed(2)}× vs ${be_roas.toFixed(2)}×) : maintiens le budget et surveille la tendance avant d'ajuster.`,
    suggested_delta_pct: null,
    projected_ca_delta_cents: null,
  };
}

// ── Carte de métriques configurables (scopée campagne) ────────────
const div = (a: number, b: number): number | null => (b > 0 ? a / b : null);
const mv = (value: number | null, previous: number | null, opts?: { series?: number[]; available?: boolean }): MetricValue => ({
  value,
  previous,
  series: opts?.series,
  available: opts?.available ?? value != null,
});

export interface CampaignShopContext {
  shop_total_spend_cents: number;
  shop_revenue_cents: number;
  shop_orders: number;
}

/**
 * Compose la carte { id → MetricValue } de la campagne à partir des agrégats
 * courant/précédent, de la timeline (sparklines) et du contexte boutique
 * (part du budget / des ventes). Donnée absente → available:false.
 */
export function buildCampaignMetrics(
  current: CampaignAggregate,
  previous: CampaignAggregate,
  points: DailyPointLike[],
  shop: CampaignShopContext,
): Record<string, MetricValue> {
  const sSpend = points.map((p) => p.spend_cents);
  const sRevenue = points.map((p) => p.jestly_revenue_cents);
  const sRoas = points.map((p) => p.rolling_roas ?? 0);

  const budgetShare = div(current.spend_cents, shop.shop_total_spend_cents);
  const salesShare = div(current.jestly_revenue_cents, shop.shop_revenue_cents);
  const budgetSharePrev = div(previous.spend_cents, shop.shop_total_spend_cents);

  return {
    // ── Acquisition ──
    spend: mv(current.spend_cents, previous.spend_cents, { series: sSpend }),
    clicks: mv(current.clicks, previous.clicks),
    impressions: mv(current.impressions, previous.impressions),
    ctr: mv(current.ctr, previous.ctr),
    cpc: mv(current.avg_cpc_cents, previous.avg_cpc_cents),
    conversions: mv(current.google_conversions, previous.google_conversions),
    budget_share: mv(budgetShare, budgetSharePrev, { available: budgetShare != null }),
    // ── Attribution ──
    ca_attributed: mv(current.jestly_revenue_cents || null, previous.jestly_revenue_cents || null, { series: sRevenue, available: current.jestly_revenue_cents > 0 }),
    orders: mv(current.jestly_orders, previous.jestly_orders),
    aov: mv(current.aov_cents, previous.aov_cents, { available: current.aov_cents != null }),
    roas_google: mv(current.roas_google, previous.roas_google, { available: current.roas_google != null }),
    roas_jestly: mv(current.roas_jestly, previous.roas_jestly, { series: sRoas, available: current.roas_jestly != null }),
    sales_share: mv(salesShare, null, { available: salesShare != null }),
    // ── Rentabilité ──
    net_profit: mv(current.net_profit_cents, previous.net_profit_cents, { available: current.net_profit_cents != null }),
    cpa: mv(current.cpa_cents, previous.cpa_cents, { available: current.cpa_cents != null }),
  };
}
