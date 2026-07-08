import { describe, it, expect } from "vitest";
import { computeDataQuality, type QualityOrderLike } from "@/lib/costs/blended";

/**
 * §7 — L'attribution manuelle doit sortir une commande fantôme de la zone
 * d'ombre (comptée dans le % attribuable) SANS jamais toucher sa traçabilité.
 * La hiérarchie §2 (natif > pixel > manuel > survey) est respectée.
 */
const order = (id: string, tracking: string | null, cents: number): QualityOrderLike =>
  ({ id, shopify_order_id: `s_${id}`, tracking_status: tracking, total_cents: cents });

const empty = () => ({
  pixelOrderIds: new Set<string>(),
  manualChannelOrderIds: new Set<string>(),
  surveyShopifyIds: new Set<string>(),
});

describe("computeDataQuality — l'attribution manuelle compte dans le % attribuable", () => {
  it("une commande ghost qualifiée à la main devient attribuable, traçabilité intacte", () => {
    const orders = [order("a", "tracked", 10000), order("b", "ghost", 5000)];
    const q = computeDataQuality({
      orders,
      ...empty(),
      manualChannelOrderIds: new Set(["b"]),
      totalRevenueCents: 15000,
    });
    // Traçabilité : b reste comptée « ghost » (fait Shopify, jamais réécrit).
    expect(q.tracked).toBe(1);
    expect(q.ghost).toBe(1);
    // Attribuable : tracked (100€) + manuel (50€) = 150€ / 150€ = 100 %.
    expect(q.attributable_revenue_share).toBe(1);
    expect(q.manual_recovered).toBe(1);
    expect(q.manual_recovered_revenue_cents).toBe(5000);
    // Sous-distinction honnête : 50€ des 150€ attribuables le sont au jugé.
    expect(q.manual_share_of_attributable).toBeCloseTo(0.333, 3);
  });

  it("retirer l'override → la commande repasse dans l'ombre", () => {
    const orders = [order("a", "tracked", 10000), order("b", "ghost", 5000)];
    const q = computeDataQuality({ orders, ...empty(), totalRevenueCents: 15000 });
    expect(q.manual_recovered).toBe(0);
    // Seul le tracked (100€) est attribuable → 100/150 ≈ 0.667.
    expect(q.attributable_revenue_share).toBeCloseTo(0.667, 3);
    expect(q.manual_share_of_attributable).toBe(0);
  });

  it("un « ghost » manuel explicite ne résout rien (pas dans manualChannelOrderIds)", () => {
    const orders = [order("b", "ghost", 5000)];
    // Gabriel a choisi « laisser fantôme » → l'order n'entre pas dans l'ensemble.
    const q = computeDataQuality({ orders, ...empty(), totalRevenueCents: 5000 });
    expect(q.manual_recovered).toBe(0);
    expect(q.attributable_revenue_share).toBe(0);
  });

  it("précédence natif > pixel > manuel > survey pour le comptage récupéré", () => {
    const orders = [
      order("pixonly", "ghost", 1000),   // pixel seul
      order("manonly", "ghost", 2000),   // manuel seul
      order("both", "ghost", 3000),      // pixel ET manuel → compte pixel, pas manuel
      order("srv", "unmatched", 4000),   // survey seul
      order("man_srv", "ghost", 5000),   // manuel ET survey → compte manuel, pas survey
    ];
    const q = computeDataQuality({
      orders,
      pixelOrderIds: new Set(["pixonly", "both"]),
      manualChannelOrderIds: new Set(["manonly", "both", "man_srv"]),
      surveyShopifyIds: new Set(["s_srv", "s_man_srv"]),
      totalRevenueCents: 15000,
    });
    expect(q.pixel_recovered).toBe(2);   // pixonly + both
    expect(q.manual_recovered).toBe(2);  // manonly + man_srv (both pris par pixel)
    expect(q.survey_recovered).toBe(1);  // srv seul (man_srv pris par manuel)
    // Tout est attribuable → 15000/15000.
    expect(q.attributable_revenue_share).toBe(1);
  });

  it("une commande trackée n'est jamais « récupérée » par une couche inférieure", () => {
    const orders = [order("a", "tracked", 10000)];
    const q = computeDataQuality({
      orders,
      pixelOrderIds: new Set(["a"]),
      manualChannelOrderIds: new Set(["a"]),
      surveyShopifyIds: new Set(["s_a"]),
      totalRevenueCents: 10000,
    });
    expect(q.pixel_recovered).toBe(0);
    expect(q.manual_recovered).toBe(0);
    expect(q.survey_recovered).toBe(0);
    expect(q.attributable_revenue_share).toBe(1);
    expect(q.manual_share_of_attributable).toBe(0);
  });
});
