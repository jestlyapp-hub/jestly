import { describe, it, expect } from "vitest";
import { detectAnomalies, type AnomalyInput } from "@/lib/insights/anomaly-detector";

function baseInput(): AnomalyInput {
  return {
    ad_spend_today_cents: 10000,
    ad_spend_avg7_cents: 10000,
    conversions_today: 10,
    conversions_avg7: 10,
    conversion_rate_today: 0.03,
    conversion_rate_prev: 0.03,
    aov_today_cents: 5000,
    aov_avg7_cents: 5000,
    campaigns: [],
    bounce_rate_today: 0.4,
    bounce_rate_avg7: 0.4,
    new_sources: [],
    refunds_last7: 0,
    out_of_stock_seen_in_ads: [],
    cohort_ltv30_current_cents: 5000,
    cohort_ltv30_prev_cents: 5000,
    goal_progress_percent: null,
    goal_expected_percent: null,
  };
}

describe("detectAnomalies", () => {
  it("situation nominale → aucune anomalie", () => {
    expect(detectAnomalies(baseInput())).toEqual([]);
  });

  it("règle 1 : pic de dépense sans conversions → critical", () => {
    const input = baseInput();
    input.ad_spend_today_cents = 20000; // +100 %
    input.conversions_today = 10; // pas de hausse
    const res = detectAnomalies(input);
    expect(res.some((a) => a.rule === "ad_spend_spike_no_conversions" && a.severity === "critical")).toBe(true);
  });

  it("règle 1 : pic de dépense AVEC conversions proportionnelles → pas d'anomalie", () => {
    const input = baseInput();
    input.ad_spend_today_cents = 20000;
    input.conversions_today = 20; // hausse proportionnelle
    expect(detectAnomalies(input).some((a) => a.rule === "ad_spend_spike_no_conversions")).toBe(false);
  });

  it("règle 2 : chute du taux de conversion → critical", () => {
    const input = baseInput();
    input.conversion_rate_today = 0.02; // -33 %
    expect(detectAnomalies(input).some((a) => a.rule === "conversion_rate_drop_24h")).toBe(true);
  });

  it("règle 4 : campagne ROAS < 1x pendant 3 jours → warning", () => {
    const input = baseInput();
    input.campaigns = [{ name: "DSA", roas: 0.8, days_below_1: 3 }];
    const res = detectAnomalies(input);
    expect(res.some((a) => a.rule === "campaign_roas_below_1")).toBe(true);
  });

  it("règle 7 : pic de remboursements → critical", () => {
    const input = baseInput();
    input.refunds_last7 = 3;
    expect(detectAnomalies(input).some((a) => a.rule === "refund_spike")).toBe(true);
  });

  it("règle 8 : rupture de stock diffusée → critical", () => {
    const input = baseInput();
    input.out_of_stock_seen_in_ads = ["Lisbonne"];
    expect(detectAnomalies(input).some((a) => a.rule === "out_of_stock_in_ads")).toBe(true);
  });

  it("tri par sévérité : critical avant warning avant info", () => {
    const input = baseInput();
    input.refunds_last7 = 3; // critical
    input.aov_today_cents = 3000; // warning
    input.new_sources = ["tiktok"]; // info
    const res = detectAnomalies(input);
    const severities = res.map((a) => a.severity);
    expect(severities[0]).toBe("critical");
    expect(severities[severities.length - 1]).toBe("info");
  });
});
