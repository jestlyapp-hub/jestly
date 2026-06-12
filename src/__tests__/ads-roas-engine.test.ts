import { describe, it, expect } from "vitest";
import { computeRoas, computeMarginalRoas, determineProfitStatus, aggregateRevenueByCampaignDay } from "@/lib/ads/roas-engine";
import type { MatchResult } from "@/lib/ads/types";

describe("computeRoas", () => {
  it("ROAS = revenue / spend", () => {
    expect(computeRoas(20000, 10000)).toBe(2); // 200 € / 100 € = 2x
    expect(computeRoas(50000, 10000)).toBe(5);
    expect(computeRoas(5000, 10000)).toBe(0.5);
  });
  it("spend 0 → null", () => {
    expect(computeRoas(10000, 0)).toBeNull();
    expect(computeRoas(0, 0)).toBeNull();
  });
  it("revenue 0 → 0", () => {
    expect(computeRoas(0, 10000)).toBe(0);
  });
  it("précision 4 décimales", () => {
    const r = computeRoas(12345, 10000);
    expect(r).toBe(1.2345);
  });
});

describe("computeMarginalRoas", () => {
  it("marginal ROAS = (revenue × marge) / spend", () => {
    // 200 € revenue × 50% marge / 100 € spend = 1
    expect(computeMarginalRoas(20000, 10000, 50)).toBe(1);
    // 200 € × 70% / 100 € = 1.4
    expect(computeMarginalRoas(20000, 10000, 70)).toBe(1.4);
  });
  it("spend 0 → null", () => {
    expect(computeMarginalRoas(20000, 0, 50)).toBeNull();
  });
});

describe("determineProfitStatus", () => {
  const profitable = 2.0, warning = 1.5;
  it("ROAS ≥ profit threshold → profitable", () => {
    expect(determineProfitStatus(2.5, profitable, warning)).toBe("profitable");
    expect(determineProfitStatus(2.0, profitable, warning)).toBe("profitable");
  });
  it("warning ≤ ROAS < profit → warning", () => {
    expect(determineProfitStatus(1.75, profitable, warning)).toBe("warning");
    expect(determineProfitStatus(1.5, profitable, warning)).toBe("warning");
  });
  it("ROAS < warning → unprofitable", () => {
    expect(determineProfitStatus(1.49, profitable, warning)).toBe("unprofitable");
    expect(determineProfitStatus(0, profitable, warning)).toBe("unprofitable");
  });
  it("null → unmatched", () => {
    expect(determineProfitStatus(null, profitable, warning)).toBe("unmatched");
  });
});

describe("aggregateRevenueByCampaignDay", () => {
  const match = (campaignId: string, weight = 1.0): MatchResult => ({
    provider: "pinterest",
    campaign_id: campaignId,
    campaign_name: `Campagne ${campaignId}`,
    method: "utm_campaign_exact",
    confidence: 0.98,
    attribution_weight: weight,
  });

  it("agrège revenue et commandes par (campagne, jour)", () => {
    const out = aggregateRevenueByCampaignDay([
      { order: { shopify_order_id: "o1", created_at: "2026-06-06T17:00:00Z", total_price: 61.95 }, matches: [match("camp-A")] },
      { order: { shopify_order_id: "o2", created_at: "2026-06-06T20:00:00Z", total_price: 47.95 }, matches: [match("camp-B")] },
    ], "pinterest");
    expect(out.get("camp-A|2026-06-06")!.revenue_cents).toBe(6195);
    expect(out.get("camp-B|2026-06-06")!.revenue_cents).toBe(4795);
    expect(out.get("camp-B|2026-06-06")!.orders.size).toBe(1);
    expect(out.get("camp-B|2026-06-06")!.campaign_name).toBe("Campagne camp-B");
  });

  it("une campagne SANS metrics le jour J reste présente dans l'agrégat (vente non perdue)", () => {
    // Le scénario du diagnostic : la vente existe même si la campagne n'a pas
    // dépensé ce jour-là — l'agrégat doit la porter pour la ligne synthétique.
    const out = aggregateRevenueByCampaignDay([
      { order: { shopify_order_id: "o306964", created_at: "2026-06-06T20:02:19Z", total_price: 47.95 }, matches: [match("626758420271")] },
    ], "pinterest");
    expect(out.has("626758420271|2026-06-06")).toBe(true);
    // ROAS d'une ligne spend 0 : null (affiché "—"), jamais un faux chiffre
    expect(computeRoas(out.get("626758420271|2026-06-06")!.revenue_cents, 0)).toBeNull();
  });

  it("applique l'attribution_weight et ignore les autres providers / unmatched", () => {
    const unmatched: MatchResult = { provider: null, campaign_id: null, campaign_name: null, method: "unmatched", confidence: 0, attribution_weight: 1.0 };
    const out = aggregateRevenueByCampaignDay([
      { order: { shopify_order_id: "o1", created_at: "2026-06-06T10:00:00Z", total_price: 100 }, matches: [match("camp-A", 0.5)] },
      { order: { shopify_order_id: "o2", created_at: "2026-06-06T11:00:00Z", total_price: 100 }, matches: [unmatched] },
    ], "pinterest");
    expect(out.get("camp-A|2026-06-06")!.revenue_cents).toBe(5000);
    expect(out.size).toBe(1);
  });

  it("liste vide → map vide", () => {
    expect(aggregateRevenueByCampaignDay([], "pinterest").size).toBe(0);
  });
});
