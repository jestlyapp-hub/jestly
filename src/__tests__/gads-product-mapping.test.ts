import { describe, it, expect } from "vitest";
import { parseItemId, buildProductIndex, mapItemToProduct } from "@/lib/gads/product-mapping";
import { mapProductGaqlResults } from "@/lib/gads/api-sync";

describe("parseItemId — formats multiples du flux Shopping", () => {
  it("ID numérique nu = variante Shopify", () => {
    expect(parseItemId("46943259066712")).toEqual({ product_id: null, variant_id: "46943259066712" });
  });

  it("shopify_FR_{product}_{variant} (insensible à la casse — Google renvoie en minuscules)", () => {
    expect(parseItemId("shopify_fr_8123456789_46943259066712"))
      .toEqual({ product_id: "8123456789", variant_id: "46943259066712" });
    expect(parseItemId("SHOPIFY_FR_8123456789_46943259066712"))
      .toEqual({ product_id: "8123456789", variant_id: "46943259066712" });
  });

  it("shopify_FR_{product} sans variante", () => {
    expect(parseItemId("shopify_fr_8123456789")).toEqual({ product_id: "8123456789", variant_id: null });
  });

  it("format inconnu → non mappable (jamais deviné)", () => {
    expect(parseItemId("sku-custom-abc")).toEqual({ product_id: null, variant_id: null });
    expect(parseItemId("123")).toEqual({ product_id: null, variant_id: null }); // trop court pour un ID Shopify
  });
});

describe("mapItemToProduct — croisement avec le catalogue", () => {
  const index = buildProductIndex([
    {
      shopify_product_id: "8123456789",
      title: "Horloge géante",
      featured_image_url: "https://cdn.shopify.com/h.jpg",
      price_min: 59.9,
      variants: [{ id: "46943259066712" }, { id: 46943259066713 }],
    },
  ]);

  it("mappe par variante (ID nu) et par produit (format shopify_)", () => {
    expect(mapItemToProduct("46943259066712", index)?.title).toBe("Horloge géante");
    expect(mapItemToProduct("46943259066713", index)?.title).toBe("Horloge géante"); // id numérique dans le jsonb
    expect(mapItemToProduct("shopify_fr_8123456789_46943259066712", index)?.title).toBe("Horloge géante");
    expect(mapItemToProduct("shopify_fr_8123456789", index)?.title).toBe("Horloge géante");
  });

  it("item inconnu → null (affiché « Produit inconnu », jamais ignoré)", () => {
    expect(mapItemToProduct("99999999999999", index)).toBeNull();
    expect(mapItemToProduct("sku-abc", index)).toBeNull();
  });
});

describe("mapProductGaqlResults — réponse shopping_performance_view", () => {
  it("convertit les unités et somme les doublons (item, jour)", () => {
    const { rows } = mapProductGaqlResults([
      { segments: { productItemId: "46943259066712", date: "2026-07-01" }, metrics: { costMicros: "1500000", clicks: "10", impressions: "300", conversions: 0.5, conversionsValue: 29.95 } },
      { segments: { productItemId: "46943259066712", date: "2026-07-01" }, metrics: { costMicros: "500000", clicks: "5", impressions: "100", conversions: 0.5, conversionsValue: 30 } },
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toEqual({
      item_id: "46943259066712",
      date: "2026-07-01",
      cost_cents: 200,
      clicks: 15,
      impressions: 400,
      conversions: 1,
      conversion_value_cents: 5995,
    });
  });

  it("ignore les lignes sans item_id avec avertissement", () => {
    const { rows, warnings } = mapProductGaqlResults([{ segments: { date: "2026-07-01" }, metrics: {} }]);
    expect(rows).toHaveLength(0);
    expect(warnings).toHaveLength(1);
  });
});
