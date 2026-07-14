import { describe, it, expect } from "vitest";
import {
  computeCampaignTrend, computeCampaignScore, computeBudgetRecommendation, buildCampaignMetrics,
  type DailyPointLike, type CampaignAggregate,
} from "@/lib/gads/campaign-analysis";

const pt = (spend: number, rev: number, roas: number | null = null): DailyPointLike => ({
  date: "2026-07-01", spend_cents: spend, jestly_revenue_cents: rev, rolling_roas: roas,
});

describe("computeCampaignTrend — ROAS Jestly récent vs précédent", () => {
  it("détecte une hausse (SUM/SUM sur fenêtres égales)", () => {
    // 8 jours : 4 « avant » à ROAS 1, 4 « récents » à ROAS 2.
    const points = [
      ...Array.from({ length: 4 }, () => pt(100, 100)),
      ...Array.from({ length: 4 }, () => pt(100, 200)),
    ];
    const t = computeCampaignTrend(points);
    expect(t.available).toBe(true);
    expect(t.direction).toBe("up");
    expect(t.window_days).toBe(4);
    expect(t.recent_roas).toBe(2);
    expect(t.prior_roas).toBe(1);
    expect(t.pct).toBe(1); // +100 %
  });

  it("détecte une baisse", () => {
    const points = [
      ...Array.from({ length: 3 }, () => pt(100, 200)),
      ...Array.from({ length: 3 }, () => pt(100, 100)),
    ];
    const t = computeCampaignTrend(points);
    expect(t.direction).toBe("down");
    expect(t.pct).toBeLessThan(0);
  });

  it("non disponible si trop peu de jours (< 3 par fenêtre)", () => {
    const t = computeCampaignTrend([pt(100, 100), pt(100, 100), pt(100, 100), pt(100, 100)]);
    expect(t.available).toBe(false);
  });
});

describe("computeCampaignScore — 0-100, non calculable sans seuil", () => {
  it("score élevé quand ROAS ≥ 2× seuil, volume et régularité au top", () => {
    const points = Array.from({ length: 6 }, () => pt(100, 200, 2)); // ROAS glissant stable
    const s = computeCampaignScore({ roas_jestly: 2, be_roas: 1, jestly_orders: 10, points });
    expect(s.available).toBe(true);
    expect(s.score).toBeGreaterThanOrEqual(90);
    expect(s.label).toBe("Excellent");
  });

  it("non disponible sans seuil de rentabilité", () => {
    const s = computeCampaignScore({ roas_jestly: 2, be_roas: null, jestly_orders: 10, points: [] });
    expect(s.available).toBe(false);
    expect(s.score).toBe(0);
  });

  it("score faible quand sous le seuil et faible volume", () => {
    const s = computeCampaignScore({ roas_jestly: 0.5, be_roas: 2, jestly_orders: 1, points: [] });
    expect(s.score).toBeLessThan(35);
    expect(s.label).toBe("Faible");
  });
});

describe("computeBudgetRecommendation — règle déterministe", () => {
  const base = { spend_cents: 10000, jestly_orders: 8, sample_small: false };
  it("recommande d'augmenter avec projection à ROAS constant", () => {
    const r = computeBudgetRecommendation({ ...base, roas_jestly: 2, be_roas: 1.2 });
    expect(r.direction).toBe("increase");
    expect(r.suggested_delta_pct).toBe(0.3);
    // 10000 × 0,3 × 2 = 6000
    expect(r.projected_ca_delta_cents).toBe(6000);
  });

  it("recommande de réduire sous le seuil", () => {
    const r = computeBudgetRecommendation({ ...base, roas_jestly: 0.8, be_roas: 1.2 });
    expect(r.direction).toBe("decrease");
    expect(r.projected_ca_delta_cents).toBeNull();
  });

  it("maintient entre le seuil et 1,15× le seuil", () => {
    const r = computeBudgetRecommendation({ ...base, roas_jestly: 1.25, be_roas: 1.2 });
    expect(r.direction).toBe("hold");
  });

  it("insuffisant sans ROAS ou sans seuil", () => {
    expect(computeBudgetRecommendation({ ...base, roas_jestly: null, be_roas: 1.2 }).direction).toBe("insufficient");
    expect(computeBudgetRecommendation({ ...base, roas_jestly: 2, be_roas: null }).direction).toBe("insufficient");
  });

  it("n'augmente pas sur échantillon faible même si ROAS élevé", () => {
    const r = computeBudgetRecommendation({ ...base, roas_jestly: 3, be_roas: 1, sample_small: true, jestly_orders: 2 });
    expect(r.direction).not.toBe("increase");
  });
});

describe("buildCampaignMetrics — carte { id → MetricValue }", () => {
  const agg = (over: Partial<CampaignAggregate> = {}): CampaignAggregate => ({
    spend_cents: 10000, clicks: 200, impressions: 4000, ctr: 5, avg_cpc_cents: 50,
    google_conversions: 12, google_conversion_value_cents: 30000, roas_google: 3,
    jestly_orders: 8, jestly_revenue_cents: 24000, roas_jestly: 2.4, cpa_cents: 1250,
    aov_cents: 3000, net_profit_cents: 5000, ...over,
  });

  it("compose parts boutique + séries + disponibilité", () => {
    const cur = agg();
    const prev = agg({ spend_cents: 8000, jestly_revenue_cents: 16000 });
    const points = [pt(5000, 12000, 2.4), pt(5000, 12000, 2.4)];
    const m = buildCampaignMetrics(cur, prev, points, {
      shop_total_spend_cents: 40000, shop_revenue_cents: 120000, shop_orders: 40,
    });
    expect(m.spend.value).toBe(10000);
    expect(m.spend.previous).toBe(8000);
    expect(m.spend.series).toEqual([5000, 5000]);
    // Part du budget = 10000 / 40000 = 0,25
    expect(m.budget_share.value).toBeCloseTo(0.25, 5);
    // % des ventes = 24000 / 120000 = 0,2
    expect(m.sales_share.value).toBeCloseTo(0.2, 5);
    expect(m.roas_jestly.value).toBe(2.4);
    expect(m.net_profit.available).toBe(true);
  });

  it("net profit non disponible quand null (jamais inventé)", () => {
    const m = buildCampaignMetrics(agg({ net_profit_cents: null }), agg(), [], {
      shop_total_spend_cents: 0, shop_revenue_cents: 0, shop_orders: 0,
    });
    expect(m.net_profit.available).toBe(false);
    expect(m.budget_share.available).toBe(false); // shop spend 0 → non disponible
  });
});
