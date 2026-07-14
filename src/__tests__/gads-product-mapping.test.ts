import { describe, it, expect } from "vitest";
import { parseItemId, buildProductIndex, mapItemToProduct, readableItemLabel } from "@/lib/gads/product-mapping";
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

describe("mapItemToProduct — flux où item_id = SKU (Mignou)", () => {
  // Catalogue Mignou : SKU au format fournisseur (14:...#...;5:...). Google renvoie
  // l'item_id en minuscules ; les SKU Shopify ont une casse mixte.
  const index = buildProductIndex([
    {
      shopify_product_id: "16338326520153",
      title: "Meuble cache litière - Gus",
      variants: [{ id: "58208468238681", sku: "14:29#white;200007763:201336342" }],
    },
    {
      shopify_product_id: "16339501384025",
      title: "Tapis attrape-litière",
      variants: [
        { id: "58216813691225", sku: "14:105010371#Black;5:880#30x30cm" },
        { id: "58216813723993", sku: "14:105010371#Black;5:100014132#40x50cm" },
      ],
    },
  ]);

  it("mappe l'item_id sur le SKU de variante, insensible à la casse", () => {
    expect(mapItemToProduct("14:29#white;200007763:201336342", index)?.title).toBe("Meuble cache litière - Gus");
    // Google minuscule vs SKU « Black »
    expect(mapItemToProduct("14:105010371#black;5:880#30x30cm", index)?.title).toBe("Tapis attrape-litière");
    expect(mapItemToProduct("14:105010371#BLACK;5:100014132#40x50cm", index)?.title).toBe("Tapis attrape-litière");
  });

  it("SKU absent du catalogue → null (jamais deviné)", () => {
    expect(mapItemToProduct("14:999#unknown", index)).toBeNull();
  });

  it("NON-RÉGRESSION : un flux numérique (LHM) reste mappé par variante malgré l'index SKU", () => {
    const lhm = buildProductIndex([
      { shopify_product_id: "8123456789", title: "Horloge Lisbonne", variants: [{ id: "55568161407316", sku: "LISBOA-01" }] },
    ]);
    expect(mapItemToProduct("55568161407316", lhm)?.title).toBe("Horloge Lisbonne"); // par variante numérique
    expect(mapItemToProduct("lisboa-01", lhm)?.title).toBe("Horloge Lisbonne"); // SKU aussi disponible
  });
});

describe("readableItemLabel — repli lisible d'un item_id non mappé", () => {
  it("extrait les attributs humains après #", () => {
    expect(readableItemLabel("14:29#a gray")).toBe("a gray");
    expect(readableItemLabel("14:193#green;5:100014064#s 41×31×17cm")).toBe("green · s 41×31×17cm");
  });
  it("sans attribut lisible → item_id brut", () => {
    expect(readableItemLabel("14:175;200007763:201336342;5:4182")).toBe("14:175;200007763:201336342;5:4182");
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
