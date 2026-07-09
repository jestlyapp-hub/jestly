import { describe, it, expect } from "vitest";
import {
  mapCampaignsMeta, mapCampaignDailyById, mapCampaignProducts, budgetChangesToArchive,
  type CampaignMetaRow,
} from "@/lib/gads/campaign-sync";
import type { GaqlCampaignDailyRow } from "@/lib/gads/google-ads-client";

describe("mapCampaignsMeta — métadonnées campagnes → lignes gads_campaigns", () => {
  it("convertit amount_micros en cents, extrait la date du datetime, dédup par id", () => {
    const rows = mapCampaignsMeta([
      {
        campaign: {
          id: "111", name: "  Winner products  ", status: "ENABLED",
          advertisingChannelType: "SHOPPING",
          startDateTime: "2026-06-16 14:35:00", endDateTime: undefined,
          biddingStrategyType: "MAXIMIZE_CONVERSION_VALUE",
        },
        campaignBudget: { amountMicros: "10000000" }, // 10 € = 1000 cents
      },
      // Doublon d'id → ignoré (garde le premier)
      { campaign: { id: "111", name: "Autre" }, campaignBudget: { amountMicros: "999" } },
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toEqual({
      campaign_id: "111",
      name: "Winner products",
      status: "ENABLED",
      channel_type: "SHOPPING",
      start_date: "2026-06-16",
      end_date: null,
      current_budget_cents: 1000,
      bidding_strategy: "MAXIMIZE_CONVERSION_VALUE",
    });
  });

  it("neutralise la sentinelle Google 2037-12-30 en date de fin nulle", () => {
    const rows = mapCampaignsMeta([
      { campaign: { id: "9", name: "X", status: "ENABLED", endDateTime: "2037-12-30 00:00:00" }, campaignBudget: {} },
    ]);
    expect(rows[0].end_date).toBeNull();
    expect(rows[0].current_budget_cents).toBeNull(); // budget absent → null, jamais 0 inventé
  });

  it("ignore les lignes sans id ou sans nom", () => {
    const rows = mapCampaignsMeta([
      { campaign: { name: "sans id" } },
      { campaign: { id: "5" } },
    ]);
    expect(rows).toHaveLength(0);
  });
});

describe("mapCampaignDailyById — réutilise les résultats campagne×jour, agrège par id", () => {
  it("somme les métriques par (campaign_id, date) et convertit les unités", () => {
    const results: GaqlCampaignDailyRow[] = [
      { campaign: { id: "1", name: "A" }, segments: { date: "2026-07-01" }, metrics: { costMicros: "12340000", clicks: "45", impressions: "1000", conversions: 1, conversionsValue: 89.9 } },
      // même campagne + jour (segment dupliqué) → sommé
      { campaign: { id: "1", name: "A" }, segments: { date: "2026-07-01" }, metrics: { costMicros: "660000", clicks: "5", impressions: "234", conversions: 0.5, conversionsValue: 10.1 } },
      { campaign: { id: "2", name: "B" }, segments: { date: "2026-07-01" }, metrics: { costMicros: "5000000", clicks: "10", impressions: "500", conversions: 2, conversionsValue: 50 } },
    ];
    const rows = mapCampaignDailyById(results).sort((a, b) => a.campaign_id.localeCompare(b.campaign_id));
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({
      campaign_id: "1", date: "2026-07-01",
      cost_cents: 1234 + 66, clicks: 50, impressions: 1234, conversions: 1.5, conversion_value_cents: 8990 + 1010,
    });
    expect(rows[1].campaign_id).toBe("2");
  });

  it("ignore les lignes sans id ou date invalide", () => {
    const rows = mapCampaignDailyById([
      { segments: { date: "2026-07-01" }, metrics: {} },
      { campaign: { id: "1" }, segments: { date: "bad" }, metrics: {} },
    ]);
    expect(rows).toHaveLength(0);
  });
});

describe("mapCampaignProducts — shopping_performance_view segmentée campagne", () => {
  it("agrège par (campagne, item, jour) et garde le titre Google + item brut", () => {
    const { rows, warnings } = mapCampaignProducts([
      { campaign: { id: "1" }, segments: { date: "2026-07-01", productItemId: "shopify_FR_123_456", productTitle: "Horloge X" }, metrics: { costMicros: "2000000", clicks: "3", impressions: "40", conversions: 0, conversionsValue: 0 } },
    ]);
    expect(warnings).toHaveLength(0);
    expect(rows[0]).toMatchObject({
      campaign_id: "1", item_id: "shopify_FR_123_456", product_title: "Horloge X", date: "2026-07-01",
      cost_cents: 200, clicks: 3, impressions: 40,
    });
  });

  it("signale (warning) et écarte une ligne sans item_id", () => {
    const { rows, warnings } = mapCampaignProducts([
      { campaign: { id: "1" }, segments: { date: "2026-07-01" }, metrics: {} },
    ]);
    expect(rows).toHaveLength(0);
    expect(warnings.length).toBeGreaterThan(0);
  });
});

describe("budgetChangesToArchive — archive APPEND uniquement si le budget a changé", () => {
  const metas: CampaignMetaRow[] = [
    { campaign_id: "1", name: "A", status: "ENABLED", channel_type: null, start_date: null, end_date: null, current_budget_cents: 1000, bidding_strategy: null },
    { campaign_id: "2", name: "B", status: "ENABLED", channel_type: null, start_date: null, end_date: null, current_budget_cents: 500, bidding_strategy: null },
    { campaign_id: "3", name: "C", status: "ENABLED", channel_type: null, start_date: null, end_date: null, current_budget_cents: null, bidding_strategy: null },
  ];

  it("n'archive que les campagnes dont le budget diffère du dernier connu", () => {
    const last = new Map<string, number>([["1", 1000], ["2", 300]]);
    const changes = budgetChangesToArchive(metas, last);
    // 1 inchangé (1000=1000) → rien ; 2 changé (300→500) → archivé ; 3 budget null → ignoré
    expect(changes).toEqual([{ campaign_id: "2", budget_cents: 500 }]);
  });

  it("archive une campagne jamais observée", () => {
    const changes = budgetChangesToArchive(metas, new Map());
    expect(changes.map((c) => c.campaign_id).sort()).toEqual(["1", "2"]); // 3 (null) exclu
  });
});
