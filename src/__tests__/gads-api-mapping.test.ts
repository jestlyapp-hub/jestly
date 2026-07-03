import { describe, it, expect } from "vitest";
import { mapGaqlResults, buildCampaignDailyQuery } from "@/lib/gads/api-sync";
import type { GaqlCampaignDailyRow } from "@/lib/gads/google-ads-client";

describe("mapGaqlResults — réponse API mockée → lignes gads_daily", () => {
  it("convertit cost_micros en cents et conversions_value en cents", () => {
    const results: GaqlCampaignDailyRow[] = [
      {
        campaign: { id: "123", name: "Marques propres" },
        segments: { date: "2026-07-01" },
        // L'API REST sérialise les int64 en string
        metrics: { costMicros: "12340000", clicks: "45", impressions: "1234", conversions: 1, conversionsValue: 89.9 },
      },
    ];
    const { rows, warnings } = mapGaqlResults(results);
    expect(warnings).toHaveLength(0);
    expect(rows).toEqual([{
      campaign_name: "Marques propres",
      date: "2026-07-01",
      cost_cents: 1234,          // 12 340 000 µ = 12,34 € = 1 234 cents
      clicks: 45,
      impressions: 1234,
      conversions: 1,
      conversion_value_cents: 8990, // 89,90 € = 8 990 cents
    }]);
  });

  it("gère les métriques absentes (jour sans conversion) → 0", () => {
    const { rows } = mapGaqlResults([{
      campaign: { id: "1", name: "Brand" },
      segments: { date: "2026-07-02" },
      metrics: { costMicros: "500000" },
    }]);
    expect(rows[0]).toMatchObject({
      cost_cents: 50, clicks: 0, impressions: 0, conversions: 0, conversion_value_cents: 0,
    });
  });

  it("somme les campagnes homonymes le même jour (même règle que le CSV)", () => {
    const base = { campaign: { id: "1", name: "Brand" }, segments: { date: "2026-07-01" } };
    const { rows } = mapGaqlResults([
      { ...base, metrics: { costMicros: "1000000", clicks: "10", impressions: "100", conversions: 0.5, conversionsValue: 25 } },
      { ...base, campaign: { id: "2", name: "Brand" }, metrics: { costMicros: "2000000", clicks: "20", impressions: "200", conversions: 0.5, conversionsValue: 25 } },
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      cost_cents: 300, clicks: 30, impressions: 300, conversions: 1, conversion_value_cents: 5000,
    });
  });

  it("ignore les lignes sans campagne ou sans date, avec avertissement", () => {
    const { rows, warnings } = mapGaqlResults([
      { segments: { date: "2026-07-01" }, metrics: { costMicros: "1000" } },
      { campaign: { id: "1", name: "Brand" }, metrics: {} },
    ]);
    expect(rows).toHaveLength(0);
    expect(warnings).toHaveLength(2);
  });

  it("arrondit les micros sans dérive flottante", () => {
    const { rows } = mapGaqlResults([{
      campaign: { id: "1", name: "Brand" },
      segments: { date: "2026-07-01" },
      metrics: { costMicros: "10005" }, // 10 005 µ = 1,0005 cent → 1 cent
    }]);
    expect(rows[0].cost_cents).toBe(1);
  });

  it("trie par date puis nom de campagne", () => {
    const { rows } = mapGaqlResults([
      { campaign: { id: "1", name: "Zèbre" }, segments: { date: "2026-07-02" }, metrics: {} },
      { campaign: { id: "2", name: "Alpha" }, segments: { date: "2026-07-01" }, metrics: {} },
      { campaign: { id: "3", name: "Alpha" }, segments: { date: "2026-07-02" }, metrics: {} },
    ]);
    expect(rows.map((r) => `${r.date} ${r.campaign_name}`)).toEqual([
      "2026-07-01 Alpha", "2026-07-02 Alpha", "2026-07-02 Zèbre",
    ]);
  });
});

describe("buildCampaignDailyQuery — GAQL lecture seule", () => {
  it("borne la requête sur la fenêtre demandée", () => {
    const q = buildCampaignDailyQuery("2026-06-03", "2026-07-03");
    expect(q).toContain("FROM campaign");
    expect(q).toContain("segments.date BETWEEN '2026-06-03' AND '2026-07-03'");
    expect(q).toContain("metrics.cost_micros");
    // Lecture seule : jamais de mutation dans la requête
    expect(q.toUpperCase()).not.toMatch(/MUTATE|UPDATE|CREATE|REMOVE/);
  });
});
