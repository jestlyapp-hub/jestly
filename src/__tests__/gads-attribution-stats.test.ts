import { describe, it, expect } from "vitest";
import { computeChannelStats, computeProductBreakdown } from "@/lib/gads/attribution-aggregator";

const order = (
  cents: number,
  measured: "google_ads" | "seo" | "pinterest" | "other" | null,
  manual: { channel: "google_ads" | "seo" | "pinterest" | "other" | "ghost"; confidence: "sure" | "assumed" | "guessed" | null } | null = null,
) => ({ total_cents: cents, measured_channel: measured, manual });

describe("computeChannelStats — double ROAS mesuré vs avec manuelles", () => {
  it("sépare le ROAS mesuré du ROAS avec attributions manuelles", () => {
    const orders = [
      order(10000, "google_ads"),                                            // mesurée Google
      order(5000, null, { channel: "google_ads", confidence: "assumed" }),   // ghost attribuée à la main
      order(8000, "seo"),                                                    // mesurée SEO
    ];
    const stats = computeChannelStats(orders, { google_ads: 10000 }); // 100 € de dépense
    const gads = stats.find((s) => s.channel === "google_ads")!;

    expect(gads.roas_measured).toBe(1);          // 100 € / 100 €
    expect(gads.roas_with_manual).toBe(1.5);     // 150 € / 100 €
    expect(gads.delta_percent).toBe(50);
    expect(gads.orders_measured).toBe(1);
    expect(gads.orders_effective).toBe(2);
    expect(gads.orders_from_manual).toBe(1);     // « 2 ventes : 1 mesurée, 1 manuelle »
  });

  it("le manuel qui retire un canal baisse le ROAS avec manuelles", () => {
    const orders = [
      order(10000, "google_ads"),
      order(6000, "google_ads", { channel: "seo", confidence: "sure" }), // réattribuée SEO
    ];
    const stats = computeChannelStats(orders, { google_ads: 8000 });
    const gads = stats.find((s) => s.channel === "google_ads")!;
    expect(gads.roas_measured).toBe(2);        // 160 € / 80 €
    expect(gads.roas_with_manual).toBe(1.25);  // 100 € / 80 €
    expect(gads.delta_percent).toBe(-37.5);
    const seo = stats.find((s) => s.channel === "seo")!;
    expect(seo.orders_from_manual).toBe(1);
  });

  it("le manuel « ghost » explicite retire la vente du canal mesuré", () => {
    const orders = [order(10000, "google_ads", { channel: "ghost", confidence: null })];
    const stats = computeChannelStats(orders, { google_ads: 5000 });
    const gads = stats.find((s) => s.channel === "google_ads")!;
    expect(gads.orders_measured).toBe(1);   // le mesuré reste la référence
    expect(gads.orders_effective).toBe(0);  // mais l'effectif respecte le choix
  });

  it("canal sans dépense saisie → ROAS null, jamais inventé", () => {
    const stats = computeChannelStats([order(10000, "seo")], { google_ads: 5000 });
    const seo = stats.find((s) => s.channel === "seo")!;
    expect(seo.spend_cents).toBeNull();
    expect(seo.roas_measured).toBeNull();
    expect(seo.roas_with_manual).toBeNull();
  });

  it("garde-fou volume : moins de 5 ventes = échantillon faible", () => {
    const four = Array.from({ length: 4 }, () => order(1000, "google_ads"));
    expect(computeChannelStats(four, { google_ads: 1000 }).find((s) => s.channel === "google_ads")!.sample_small).toBe(true);
    const five = Array.from({ length: 5 }, () => order(1000, "google_ads"));
    expect(computeChannelStats(five, { google_ads: 1000 }).find((s) => s.channel === "google_ads")!.sample_small).toBe(false);
  });
});

describe("computeChannelStats — 3e ligne : ROAS avec pixel Jestly", () => {
  const pixel = (source: "google_ads" | "seo" | "pinterest" | "direct" | "other") =>
    ({ resolved_source: source, match_method: "cart_attribute" as const, confidence: 0.95 });

  it("le pixel comble les commandes sans mesure, sans toucher au mesuré", () => {
    const orders = [
      { ...order(10000, "google_ads"), pixel: null },
      { ...order(6000, null), pixel: pixel("google_ads") }, // ghost récupérée
    ];
    const stats = computeChannelStats(orders, { google_ads: 8000 });
    const gads = stats.find((s) => s.channel === "google_ads")!;
    expect(gads.roas_measured).toBe(1.25);      // 100 € / 80 € — inchangé
    expect(gads.roas_with_pixel).toBe(2);       // 160 € / 80 €
    expect(gads.orders_from_pixel).toBe(1);
  });

  it("le pixel ne remplace JAMAIS une mesure Shopify divergente", () => {
    const orders = [{ ...order(10000, "seo"), pixel: pixel("google_ads") }];
    const stats = computeChannelStats(orders, { google_ads: 5000 });
    const gads = stats.find((s) => s.channel === "google_ads")!;
    expect(gads.orders_from_pixel).toBe(0);     // mesuré seo = vérité, pixel ignoré
    expect(gads.revenue_with_pixel_cents).toBe(0);
  });

  it("une résolution pixel « direct » ne gonfle aucun canal", () => {
    const orders = [{ ...order(5000, null), pixel: pixel("direct") }];
    const stats = computeChannelStats(orders, { google_ads: 1000 });
    for (const s of stats) expect(s.orders_from_pixel).toBe(0);
  });

  it("les trois ROAS restent distincts (mesuré / pixel / manuel)", () => {
    const orders = [
      { ...order(8000, "google_ads"), pixel: null },
      { ...order(4000, null), pixel: pixel("google_ads") },
      { ...order(2000, null, { channel: "google_ads", confidence: "guessed" }), pixel: null },
    ];
    const gads = computeChannelStats(orders, { google_ads: 4000 }).find((s) => s.channel === "google_ads")!;
    expect(gads.roas_measured).toBe(2);       // 80 € / 40 €
    expect(gads.roas_with_pixel).toBe(3);     // (80+40) / 40
    expect(gads.roas_with_manual).toBe(2.5);  // (80+20) / 40
  });
});

describe("computeProductBreakdown — ventilation par produit et canal", () => {
  const li = (title: string, price: number, qty = 1, product_id: string | null = null) =>
    ({ title, price, quantity: qty, total_discount: 0, product_id });

  it("agrège les line_items par produit avec répartition par canal effectif", () => {
    const orders = [
      { ...order(0, "google_ads"), line_items: [li("Horloge géante", 59.9, 1, "p1")] },
      { ...order(0, "seo"), line_items: [li("Horloge géante", 59.9, 2, "p1"), li("Pendule", 39.9, 1, "p2")] },
      { ...order(0, null), line_items: [li("Horloge géante", 59.9, 1, "p1")] },
    ];
    const rows = computeProductBreakdown(orders, "all");
    const geante = rows.find((r) => r.product_id === "p1")!;
    expect(geante.orders_count).toBe(3);
    expect(geante.units).toBe(4);
    expect(geante.revenue_cents).toBe(4 * 5990);
    expect(geante.by_channel.google_ads?.orders).toBe(1);
    expect(geante.by_channel.seo?.orders).toBe(1);
    expect(geante.by_channel.unattributed?.orders).toBe(1);
    expect(geante.sample_small).toBe(true); // 3 ventes < 5
  });

  it("filtre par canal : seules les commandes du canal comptent", () => {
    const orders = [
      { ...order(0, "google_ads"), line_items: [li("Horloge géante", 59.9, 1, "p1")] },
      { ...order(0, "seo"), line_items: [li("Horloge géante", 59.9, 1, "p1")] },
    ];
    const rows = computeProductBreakdown(orders, "google_ads");
    expect(rows).toHaveLength(1);
    expect(rows[0].orders_count).toBe(1);
    expect(rows[0].revenue_cents).toBe(5990);
  });

  it("le choix manuel déplace le produit de canal", () => {
    const orders = [
      {
        ...order(0, "seo", { channel: "google_ads", confidence: "guessed" }),
        line_items: [li("Pendule", 39.9, 1, "p2")],
      },
    ];
    const rows = computeProductBreakdown(orders, "google_ads");
    expect(rows).toHaveLength(1);
    expect(computeProductBreakdown(orders, "seo")).toHaveLength(0);
  });

  it("déduit les remises et plancher à zéro", () => {
    const orders = [{
      ...order(0, "google_ads"),
      line_items: [{ title: "Horloge", price: 50, quantity: 1, total_discount: 60, product_id: "p1" }],
    }];
    expect(computeProductBreakdown(orders, "all")[0].revenue_cents).toBe(0);
  });
});
