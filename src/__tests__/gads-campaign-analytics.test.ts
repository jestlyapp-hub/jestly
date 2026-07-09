import { describe, it, expect } from "vitest";
import {
  computeCampaignAnalytics, computeCampaignInsights, deriveCampaignStatus,
  type CampaignMeta, type CampaignDailyMetric, type CampaignOrderInput, type ManualOverrideRow,
} from "@/lib/gads/campaign-analytics";
import { computeCampaignProducts, computeCampaignTimeline } from "@/lib/gads/campaign-detail";
import { buildProductIndex } from "@/lib/gads/product-mapping";

const RANGE = { from: "2026-07-01", to: "2026-07-02" };
const TODAY = "2026-07-09";

const CAMPAIGNS: CampaignMeta[] = [
  { campaign_id: "1", name: "Winner products", status: "ENABLED", channel_type: "SHOPPING", start_date: "2026-06-01", end_date: null, current_budget_cents: 1000, bidding_strategy: null, last_seen_at: TODAY },
  { campaign_id: "2", name: "Branding", status: "PAUSED", channel_type: "SEARCH", start_date: "2026-06-01", end_date: null, current_budget_cents: 500, bidding_strategy: null, last_seen_at: TODAY },
];
const DAILY: CampaignDailyMetric[] = [
  { campaign_id: "1", date: "2026-07-01", cost_cents: 6000, clicks: 100, impressions: 1000, conversions: 1, conversion_value_cents: 3000 },
  { campaign_id: "1", date: "2026-07-02", cost_cents: 4000, clicks: 50, impressions: 500, conversions: 0, conversion_value_cents: 0 },
  { campaign_id: "2", date: "2026-07-01", cost_cents: 2000, clicks: 20, impressions: 200, conversions: 0, conversion_value_cents: 0 },
];

describe("computeCampaignAnalytics — ROAS Jestly croisé au grain campagne", () => {
  it("rattache le CA Shopify par utm_campaign (nom normalisé) + inclut le manuel campagne", () => {
    const orders: CampaignOrderInput[] = [
      // Google Ads, utm_campaign 'winner' (casse différente) → matche « Winner products »
      { created_at: "2026-07-01T10:00:00Z", total_cents: 5000, measured_channel: "google_ads", manual: null, pixel: null, utm_campaign: "winner products" },
      // Google Ads sans utm_campaign → non rattaché (bucket unmatched)
      { created_at: "2026-07-01T11:00:00Z", total_cents: 3000, measured_channel: "google_ads", manual: null, pixel: null, utm_campaign: null },
      // SEO → hors périmètre Google Ads
      { created_at: "2026-07-01T12:00:00Z", total_cents: 9999, measured_channel: "seo", manual: null, pixel: null, utm_campaign: "winner products" },
    ];
    const manual: ManualOverrideRow[] = [
      { campaign_name: "Winner products", revenue_cents: 2000, orders_count: 1 },
    ];

    const a = computeCampaignAnalytics({ campaigns: CAMPAIGNS, daily: DAILY, orders, manualOverrides: manual, range: RANGE, be_roas: 1.15, today: TODAY });

    const c1 = a.rows.find((r) => r.campaign_id === "1")!;
    expect(c1.spend_cents).toBe(10000);
    expect(c1.clicks).toBe(150);
    expect(c1.impressions).toBe(1500);
    expect(c1.ctr).toBeCloseTo(10, 3); // 150/1500
    // ROAS Jestly = (5000 commande + 2000 manuel) / 10000 = 0,70 (SUM/SUM)
    expect(c1.jestly_orders).toBe(2);
    expect(c1.jestly_revenue_cents).toBe(7000);
    expect(c1.jestly_manual_revenue_cents).toBe(2000);
    expect(c1.roas_jestly).toBe(0.7);
    // ROAS Google = valeur déclarée 3000 / dépense 10000 = 0,30 (jamais fondu avec Jestly)
    expect(c1.roas_google).toBe(0.3);
    expect(c1.profitable).toBe(false); // 0,70 < seuil 1,15
    expect(c1.spend_by_day).toEqual([6000, 4000]);

    // Couverture au grain COMMANDE (les overrides bulk alimentent le CA campagne
    // mais ne comptent pas dans la couverture des commandes Google Ads).
    expect(a.attribution_coverage.google_revenue_cents).toBe(8000);        // 5000 + 3000 (commandes)
    expect(a.attribution_coverage.matched_to_campaign_cents).toBe(5000);   // seule la commande 1 matchée
    expect(a.attribution_coverage.matched_measured_cents).toBe(5000);
    expect(a.attribution_coverage.unmatched_cents).toBe(3000);
  });

  it("rattache aussi par campaign_id quand utm_campaign = l'id numérique", () => {
    const orders: CampaignOrderInput[] = [
      { created_at: "2026-07-01T10:00:00Z", total_cents: 4000, measured_channel: "google_ads", manual: null, pixel: null, utm_campaign: "1" },
    ];
    const a = computeCampaignAnalytics({ campaigns: CAMPAIGNS, daily: DAILY, orders, manualOverrides: [], range: RANGE, be_roas: null, today: TODAY });
    expect(a.rows.find((r) => r.campaign_id === "1")!.jestly_revenue_cents).toBe(4000);
  });

  it("le manuel prime via la résolution unifiée (vente fantôme qualifiée Google)", () => {
    const orders: CampaignOrderInput[] = [
      // Non mesurée, mais attribuée à la main à Google Ads + utm_campaign présent
      { created_at: "2026-07-01T10:00:00Z", total_cents: 6000, measured_channel: null, manual: { channel: "google_ads" }, pixel: null, utm_campaign: "Winner products" },
    ];
    const a = computeCampaignAnalytics({ campaigns: CAMPAIGNS, daily: DAILY, orders, manualOverrides: [], range: RANGE, be_roas: 1.15, today: TODAY });
    expect(a.rows.find((r) => r.campaign_id === "1")!.jestly_revenue_cents).toBe(6000);
  });

  it("totaux blended en SUM/SUM et budget jamais inventé", () => {
    const a = computeCampaignAnalytics({ campaigns: CAMPAIGNS, daily: DAILY, orders: [], manualOverrides: [], range: RANGE, be_roas: 1.15, today: TODAY });
    expect(a.totals.spend_cents).toBe(12000);
    expect(a.totals.roas_google_blended).toBe(0.25); // 3000 / 12000
    const c2 = a.rows.find((r) => r.campaign_id === "2")!;
    expect(c2.current_budget_cents).toBe(500);
  });
});

describe("computeCampaignAnalytics — rattachement MANUEL à une campagne", () => {
  it("une commande Google Ads sans utm rattachée à la main alimente le CA/ROAS de la campagne (marqué manuel)", () => {
    const orders: CampaignOrderInput[] = [
      // Google Ads mesuré mais SANS utm_campaign → rattachée manuellement à la campagne "1"
      { created_at: "2026-07-01T10:00:00Z", total_cents: 6000, measured_channel: "google_ads", manual: null, pixel: null, utm_campaign: null, manual_campaign_id: "1" },
    ];
    const a = computeCampaignAnalytics({ campaigns: CAMPAIGNS, daily: DAILY, orders, manualOverrides: [], range: RANGE, be_roas: 1.15, today: TODAY });
    const c1 = a.rows.find((r) => r.campaign_id === "1")!;
    expect(c1.jestly_revenue_cents).toBe(6000);
    expect(c1.jestly_manual_revenue_cents).toBe(6000);   // compté comme manuel
    expect(c1.jestly_measured_revenue_cents).toBe(0);    // pas mesuré
    expect(c1.roas_jestly).toBe(0.6);                    // 6000 / 10000
    expect(c1.roas_jestly_measured).toBe(0);             // 0 mesuré / 10000 dépense
    // Couverture : la part manuelle est distinguée du mesuré, jamais fondue.
    expect(a.attribution_coverage.matched_manual_cents).toBe(6000);
    expect(a.attribution_coverage.matched_measured_cents).toBe(0);
  });

  it("le mesuré (utm) est prioritaire sur le rattachement manuel", () => {
    const orders: CampaignOrderInput[] = [
      // utm pointe la campagne 1, mais un rattachement manuel pointe la 2 → le mesuré gagne
      { created_at: "2026-07-01T10:00:00Z", total_cents: 5000, measured_channel: "google_ads", manual: null, pixel: null, utm_campaign: "winner products", manual_campaign_id: "2" },
    ];
    const a = computeCampaignAnalytics({ campaigns: CAMPAIGNS, daily: DAILY, orders, manualOverrides: [], range: RANGE, be_roas: null, today: TODAY });
    expect(a.rows.find((r) => r.campaign_id === "1")!.jestly_measured_revenue_cents).toBe(5000);
    expect(a.rows.find((r) => r.campaign_id === "2")!.jestly_revenue_cents).toBe(0);
  });

  it("cohérence : le CA rattaché aux campagnes ne dépasse jamais le CA canal Google Ads", () => {
    const orders: CampaignOrderInput[] = [
      { created_at: "2026-07-01T10:00:00Z", total_cents: 5000, measured_channel: "google_ads", manual: null, pixel: null, utm_campaign: "winner products", manual_campaign_id: null },
      { created_at: "2026-07-01T11:00:00Z", total_cents: 6000, measured_channel: "google_ads", manual: null, pixel: null, utm_campaign: null, manual_campaign_id: "2" },
      { created_at: "2026-07-01T12:00:00Z", total_cents: 3000, measured_channel: "google_ads", manual: null, pixel: null, utm_campaign: null, manual_campaign_id: null }, // reste au niveau canal
    ];
    const a = computeCampaignAnalytics({ campaigns: CAMPAIGNS, daily: DAILY, orders, manualOverrides: [], range: RANGE, be_roas: null, today: TODAY });
    const cov = a.attribution_coverage;
    expect(cov.matched_to_campaign_cents).toBeLessThanOrEqual(cov.google_revenue_cents);
    expect(cov.matched_to_campaign_cents).toBe(11000);   // 5000 mesuré + 6000 manuel
    expect(cov.google_revenue_cents).toBe(14000);        // + 3000 non rattaché
    expect(cov.unmatched_cents).toBe(3000);
    expect(cov.matched_measured_cents + cov.matched_manual_cents).toBe(cov.matched_to_campaign_cents);
  });

  it("un manual_campaign_id inconnu (campagne d'un autre user / supprimée) est ignoré, la vente reste au niveau canal", () => {
    const orders: CampaignOrderInput[] = [
      { created_at: "2026-07-01T10:00:00Z", total_cents: 4000, measured_channel: "google_ads", manual: null, pixel: null, utm_campaign: null, manual_campaign_id: "999-inexistant" },
    ];
    const a = computeCampaignAnalytics({ campaigns: CAMPAIGNS, daily: DAILY, orders, manualOverrides: [], range: RANGE, be_roas: null, today: TODAY });
    expect(a.rows.every((r) => r.jestly_revenue_cents === 0)).toBe(true);
    expect(a.attribution_coverage.unmatched_cents).toBe(4000);
  });
});

describe("deriveCampaignStatus — actif / en pause / terminée", () => {
  it("REMOVED → terminée", () => {
    expect(deriveCampaignStatus({ status: "REMOVED", end_date: null }, TODAY)).toBe("ended");
  });
  it("date de fin passée → terminée même si ENABLED", () => {
    expect(deriveCampaignStatus({ status: "ENABLED", end_date: "2026-07-01" }, TODAY)).toBe("ended");
  });
  it("PAUSED → en pause, ENABLED → active, fin future → active", () => {
    expect(deriveCampaignStatus({ status: "PAUSED", end_date: null }, TODAY)).toBe("paused");
    expect(deriveCampaignStatus({ status: "ENABLED", end_date: null }, TODAY)).toBe("active");
    expect(deriveCampaignStatus({ status: "ENABLED", end_date: "2026-12-01" }, TODAY)).toBe("active");
  });
});

describe("computeCampaignInsights — règles déterministes", () => {
  it("perte sur campagne active sous le seuil, gaspillage si 0 conversion, rien sur les non-actives", () => {
    const orders: CampaignOrderInput[] = [
      { created_at: "2026-07-01T10:00:00Z", total_cents: 5000, measured_channel: "google_ads", manual: null, pixel: null, utm_campaign: "Winner products" },
    ];
    const a = computeCampaignAnalytics({ campaigns: CAMPAIGNS, daily: DAILY, orders, manualOverrides: [], range: RANGE, be_roas: 1.15, today: TODAY });
    const insights = computeCampaignInsights(a);
    // Campagne 1 active, ROAS Jestly 0,50 < 1,15 mais a une vente → « perte »
    expect(insights.some((i) => i.campaign_id === "1" && i.nature === "loss")).toBe(true);
    // Campagne 2 en pause → aucun insight (non actionnable)
    expect(insights.some((i) => i.campaign_id === "2")).toBe(false);
  });

  it("signale le gaspillage (dépense, 0 conversion) même sans seuil de rentabilité", () => {
    const daily: CampaignDailyMetric[] = [
      { campaign_id: "1", date: "2026-07-01", cost_cents: 8000, clicks: 40, impressions: 400, conversions: 0, conversion_value_cents: 0 },
    ];
    const a = computeCampaignAnalytics({ campaigns: [CAMPAIGNS[0]], daily, orders: [], manualOverrides: [], range: RANGE, be_roas: null, today: TODAY });
    const insights = computeCampaignInsights(a);
    expect(insights).toEqual([
      expect.objectContaining({ campaign_id: "1", nature: "data", impact_cents: 8000 }),
    ]);
  });
});

describe("computeCampaignProducts — diffusés vs sans diffusion, candidats", () => {
  const index = buildProductIndex([
    { shopify_product_id: "100", title: "Horloge A", featured_image_url: "a.jpg", price_min: 50, variants: [{ id: "200" }] },
    { shopify_product_id: "300", title: "Horloge B", featured_image_url: "b.jpg", price_min: 80, variants: [{ id: "400" }] },
  ]);

  it("classe un item qui diffuse sans conversion en candidat à exclure, et un vendeur sans diffusion en candidat à réactiver", () => {
    const { active, inactive } = computeCampaignProducts({
      productItemRows: [
        { item_id: "shopify_FR_100_200", product_title: "Horloge A", cost_cents: 5000, clicks: 10, impressions: 100, conversions: 0, conversion_value_cents: 0 },
      ],
      matchedOrders: [
        { line_items: [{ product_id: "300", title: "Horloge B", quantity: 1, price: 80, total_discount: 0 }] },
      ],
      index,
    });

    expect(active).toHaveLength(1);
    expect(active[0]).toMatchObject({ product_id: "100", title: "Horloge A", status_in_feed: "active", candidate_exclude: true });

    expect(inactive).toHaveLength(1);
    expect(inactive[0]).toMatchObject({ product_id: "300", title: "Horloge B", status_in_feed: "inactive", candidate_reactivate: true, jestly_revenue_cents: 8000 });
  });

  it("garde un item non mappé visible en « Produit inconnu », jamais ignoré", () => {
    const { active } = computeCampaignProducts({
      productItemRows: [
        { item_id: "999999999", product_title: null, cost_cents: 1000, clicks: 2, impressions: 20, conversions: 0, conversion_value_cents: 0 },
      ],
      matchedOrders: [],
      index,
    });
    expect(active[0].unknown_item).toBe(true);
    expect(active[0].title).toContain("Produit inconnu");
  });
});

describe("computeCampaignTimeline — ROAS Jestly glissant 7 j (SUM/SUM)", () => {
  it("calcule le ROAS glissant sur la fenêtre, null si dépense nulle", () => {
    const days = ["2026-07-01", "2026-07-02", "2026-07-03"];
    const spend = new Map([["2026-07-01", 100], ["2026-07-02", 0], ["2026-07-03", 200]]);
    const rev = new Map([["2026-07-01", 0], ["2026-07-02", 300], ["2026-07-03", 0]]);
    const t = computeCampaignTimeline(days, spend, rev);
    expect(t[0].rolling_roas).toBe(0);   // 0 / 100
    expect(t[1].rolling_roas).toBe(3);   // 300 / (100+0)
    expect(t[2].rolling_roas).toBe(1);   // 300 / (100+0+200)
    expect(t[2].spend_cents).toBe(200);
  });
});
