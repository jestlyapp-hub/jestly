import { describe, it, expect } from "vitest";
import { aggregateRevenueByAdDay } from "@/lib/ads/roas-engine";
import type { MatchResult } from "@/lib/ads/types";

function adMatch(adId: string, weight = 1.0): MatchResult {
  return {
    provider: "pinterest",
    campaign_id: "camp-1",
    campaign_name: "Campagne",
    method: "utm_content_exact",
    confidence: 0.95,
    attribution_weight: weight,
    ad_id: adId,
    ad_name: "Pin",
    pin_id: "pin-1",
  };
}

function campaignMatch(): MatchResult {
  return {
    provider: "pinterest",
    campaign_id: "camp-1",
    campaign_name: "Campagne",
    method: "utm_campaign_exact",
    confidence: 0.98,
    attribution_weight: 1.0,
  };
}

describe("aggregateRevenueByAdDay", () => {
  it("agrège revenue et commandes par (ad, jour)", () => {
    const out = aggregateRevenueByAdDay([
      { order: { shopify_order_id: "o1", created_at: "2026-06-10T10:00:00Z", total_price: 100 }, matches: [adMatch("ad-1")] },
      { order: { shopify_order_id: "o2", created_at: "2026-06-10T15:00:00Z", total_price: 50 }, matches: [adMatch("ad-1")] },
    ]);
    const agg = out.get("ad-1|2026-06-10");
    expect(agg).toBeDefined();
    expect(agg!.revenue_cents).toBe(15000);
    expect(agg!.orders.size).toBe(2);
  });

  it("sépare par jour", () => {
    const out = aggregateRevenueByAdDay([
      { order: { shopify_order_id: "o1", created_at: "2026-06-10T10:00:00Z", total_price: 100 }, matches: [adMatch("ad-1")] },
      { order: { shopify_order_id: "o2", created_at: "2026-06-11T10:00:00Z", total_price: 100 }, matches: [adMatch("ad-1")] },
    ]);
    expect(out.get("ad-1|2026-06-10")!.revenue_cents).toBe(10000);
    expect(out.get("ad-1|2026-06-11")!.revenue_cents).toBe(10000);
  });

  it("ignore les matches sans ad_id (grain campagne)", () => {
    const out = aggregateRevenueByAdDay([
      { order: { shopify_order_id: "o1", created_at: "2026-06-10T10:00:00Z", total_price: 100 }, matches: [campaignMatch()] },
    ]);
    expect(out.size).toBe(0);
  });

  it("applique l'attribution_weight au revenue", () => {
    const out = aggregateRevenueByAdDay([
      { order: { shopify_order_id: "o1", created_at: "2026-06-10T10:00:00Z", total_price: 100 }, matches: [adMatch("ad-1", 0.5)] },
    ]);
    expect(out.get("ad-1|2026-06-10")!.revenue_cents).toBe(5000);
  });

  it("collecte les confidences pour la moyenne", () => {
    const out = aggregateRevenueByAdDay([
      { order: { shopify_order_id: "o1", created_at: "2026-06-10T10:00:00Z", total_price: 100 }, matches: [adMatch("ad-1")] },
    ]);
    expect(out.get("ad-1|2026-06-10")!.confidences).toEqual([0.95]);
  });

  it("liste vide → map vide", () => {
    expect(aggregateRevenueByAdDay([]).size).toBe(0);
  });
});
