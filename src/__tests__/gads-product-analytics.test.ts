import { describe, it, expect } from "vitest";
import { computeProductAnalytics } from "@/lib/gads/product-analytics";
import { buildProductIndex } from "@/lib/gads/product-mapping";

const RANGE = { from: "2026-07-01", to: "2026-07-03" };
const INDEX = buildProductIndex([
  { shopify_product_id: "p1", title: "Horloge géante", price_min: 59.9, variants: [{ id: "40000000000001" }] },
  { shopify_product_id: "p2", title: "Pendule", price_min: 39.9, variants: [{ id: "40000000000002" }] },
]);

const order = (productId: string, price: number, opts: {
  channel?: "google_ads" | "seo" | null; isNew?: boolean;
  pixel?: "google_ads" | null; day?: string;
  manual?: "google_ads" | "seo" | "pinterest" | "other" | "ghost" | null;
} = {}) => ({
  created_at: `${opts.day ?? "2026-07-02"}T10:00:00Z`,
  is_new_customer: opts.isNew ?? false,
  measured_channel: opts.channel ?? null,
  manual: opts.manual ? { channel: opts.manual, confidence: "assumed" as const } : null,
  pixel: opts.pixel ? { resolved_source: opts.pixel, match_method: "cart_attribute" as const, confidence: 0.95 } : null,
  line_items: [{ product_id: productId, title: "x", quantity: 1, price, total_discount: 0 }],
});

const item = (itemId: string, cost: number, conversions = 0) => ({
  item_id: itemId, date: "2026-07-02", cost_cents: cost, clicks: 10, impressions: 100,
  conversions, conversion_value_cents: conversions > 0 ? 5990 : 0,
});

describe("computeProductAnalytics — croisement ventes × Ads par produit", () => {
  it("double ROAS produit : déclaré (API) vs croisé (CA attribué Google, mesuré + pixel)", () => {
    const res = computeProductAnalytics({
      orders: [
        order("p1", 59.9, { channel: "google_ads" }),        // mesurée Google
        order("p1", 59.9, { channel: null, pixel: "google_ads" }), // ghost récupérée pixel
        order("p1", 59.9, { channel: "seo" }),               // SEO : pas dans le croisé
      ],
      itemRows: [item("40000000000001", 5990, 1)],
      index: INDEX,
      costs: [],
      range: RANGE,
      channelFilter: "all",
    });
    const p1 = res.rows.find((r) => r.product_id === "p1")!;
    expect(p1.google_orders).toBe(2);
    expect(p1.google_revenue_cents).toBe(11980);
    expect(p1.roas_crossed).toBe(2);      // 119,80 € / 59,90 €
    expect(p1.roas_declared).toBe(1);     // 59,90 € déclaré / 59,90 €
    expect(p1.cpa_cents).toBe(2995);      // 59,90 € / 2 ventes Google
  });

  it("cas Stockholm : vente fantôme attribuée Google à la main → croisé non nul, pas de faux badge", () => {
    // 1 vente 69 €, ghost (aucune mesure), attribuée Google Ads à la main,
    // dépense produit 66,74 €. Avant le fix : croisé 0.00× + « dépense sans conversion ».
    const res = computeProductAnalytics({
      orders: [order("p1", 69, { channel: null, manual: "google_ads" })],
      itemRows: [item("40000000000001", 6674, 0)], // dépense 66,74 €, 0 conversion Google déclarée
      index: INDEX,
      costs: [],
      range: RANGE,
      channelFilter: "all",
    });
    const p1 = res.rows.find((r) => r.product_id === "p1")!;
    expect(p1.google_orders).toBe(1);
    expect(p1.google_revenue_cents).toBe(6900);
    expect(p1.roas_crossed).toBeCloseTo(1.03, 2);   // 69 € / 66,74 €
    expect(p1.wasted_spend).toBe(false);            // plus de faux badge
    expect(res.wasted_spend_cents).toBe(0);
  });

  it("la même vente sous le filtre Google Ads est bien retenue (résolution manuelle)", () => {
    const res = computeProductAnalytics({
      orders: [order("p1", 69, { channel: null, manual: "google_ads" })],
      itemRows: [],
      index: INDEX,
      costs: [],
      range: RANGE,
      channelFilter: "google_ads",
    });
    expect(res.rows.find((r) => r.product_id === "p1")?.orders_count).toBe(1);
  });

  it("un « ghost » manuel explicite ne compte PAS dans le croisé Google", () => {
    const res = computeProductAnalytics({
      orders: [order("p1", 69, { channel: null, manual: "ghost" })],
      itemRows: [item("40000000000001", 6674, 0)],
      index: INDEX,
      costs: [],
      range: RANGE,
      channelFilter: "all",
    });
    const p1 = res.rows.find((r) => r.product_id === "p1")!;
    expect(p1.google_orders).toBe(0);
    expect(p1.wasted_spend).toBe(true); // vraie dépense sans aucune vente résolue
  });

  it("dépense > 0 et 0 conversion → wasted_spend, remonté en tête, total en encart", () => {
    const res = computeProductAnalytics({
      orders: [order("p1", 59.9, { channel: "google_ads" })],
      itemRows: [item("40000000000001", 3000, 1), item("40000000000002", 4500, 0)], // p2 brûle 45 € sans conversion
      index: INDEX,
      costs: [],
      range: RANGE,
      channelFilter: "all",
    });
    const p2 = res.rows.find((r) => r.product_id === "p2")!;
    expect(p2.wasted_spend).toBe(true);
    expect(res.wasted_spend_cents).toBe(4500);
    expect(res.rows[0].product_id).toBe("p2"); // tri par défaut : gaspilleurs d'abord
    expect(res.rows.find((r) => r.product_id === "p1")!.wasted_spend).toBe(false);
  });

  it("item_id non mappable → ligne « Produit inconnu », jamais ignorée", () => {
    const res = computeProductAnalytics({
      orders: [],
      itemRows: [item("sku-mystere", 1200, 0)],
      index: INDEX,
      costs: [],
      range: RANGE,
      channelFilter: "all",
    });
    const unknown = res.rows.find((r) => r.unknown_item)!;
    expect(unknown.title).toBe("Produit inconnu (sku-mystere)");
    expect(unknown.ads?.spend_cents).toBe(1200);
  });

  it("COGS versionnés et marge brute ; produit sans coût → « non renseigné » (null)", () => {
    const res = computeProductAnalytics({
      orders: [order("p1", 59.9, { channel: "google_ads" }), order("p2", 39.9, { channel: "seo" })],
      itemRows: [],
      index: INDEX,
      costs: [{ shopify_product_id: "p1", unit_cost_cents: 2000, effective_from: "2026-01-01" }],
      range: RANGE,
      channelFilter: "all",
    });
    const p1 = res.rows.find((r) => r.product_id === "p1")!;
    expect(p1.cogs_cents).toBe(2000);
    expect(p1.gross_margin_cents).toBe(3990);
    const p2 = res.rows.find((r) => r.product_id === "p2")!;
    expect(p2.cogs_cents).toBeNull();
    expect(p2.gross_margin_cents).toBeNull();
  });

  it("filtre canal : seules les ventes du canal effectif comptent, sparkline alignée", () => {
    const res = computeProductAnalytics({
      orders: [
        order("p1", 59.9, { channel: "google_ads", day: "2026-07-01" }),
        order("p1", 59.9, { channel: "seo", day: "2026-07-03" }),
      ],
      itemRows: [],
      index: INDEX,
      costs: [],
      range: RANGE,
      channelFilter: "google_ads",
    });
    const p1 = res.rows.find((r) => r.product_id === "p1")!;
    expect(p1.orders_count).toBe(1);
    expect(p1.revenue_by_day).toEqual([5990, 0, 0]); // 3 jours de plage
  });
});
