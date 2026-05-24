import { describe, it, expect } from "vitest";
import { extractUtmsFromOrder, normalizeSource, normalizeCampaignName } from "@/lib/ads/utm-parser";

describe("extractUtmsFromOrder", () => {
  it("colonnes dénormalisées prioritaires", () => {
    const order = {
      utm_source: "pinterest", utm_medium: "PaidSocial", utm_campaign: "626758420271",
      utm_content: "ad_xyz", utm_term: "horloge",
    };
    const utms = extractUtmsFromOrder(order);
    expect(utms.source).toBe("pinterest");
    expect(utms.campaign).toBe("626758420271");
    expect(utms.content).toBe("ad_xyz");
  });

  it("parse landing_site query string", () => {
    const order = {
      landing_site: "https://lhorlogemurale.fr/products/cornwall?utm_source=pinterest&utm_campaign=test_camp&utm_medium=paid",
    };
    const utms = extractUtmsFromOrder(order);
    expect(utms.source).toBe("pinterest");
    expect(utms.campaign).toBe("test_camp");
    expect(utms.medium).toBe("paid");
    expect(utms.landing_path).toBe("/products/cornwall");
  });

  it("note_attributes en fallback", () => {
    const order = {
      note_attributes: [{ name: "utm_source", value: "pinterest" }, { name: "utm_campaign", value: "fallback_camp" }],
    };
    const utms = extractUtmsFromOrder(order);
    expect(utms.source).toBe("pinterest");
    expect(utms.campaign).toBe("fallback_camp");
  });

  it("referring_site fallback pour source si non définie", () => {
    const order = { referring_site: "https://www.pinterest.com/" };
    const utms = extractUtmsFromOrder(order);
    expect(utms.source).toBe("pinterest");
    expect(utms.referring_site).toBe("https://www.pinterest.com/");
  });

  it("android-app pinterest detection", () => {
    const order = { referring_site: "android-app://com.pinterest/" };
    const utms = extractUtmsFromOrder(order);
    expect(utms.source).toBe("pinterest");
  });

  it("ne crash pas sur landing_site invalide", () => {
    const order = { landing_site: "not a url" };
    expect(() => extractUtmsFromOrder(order)).not.toThrow();
  });

  it("commande totalement vide", () => {
    expect(extractUtmsFromOrder({})).toEqual({});
  });
});

describe("normalizeSource", () => {
  it("pinterest variants → pinterest", () => {
    expect(normalizeSource("pinterest")).toBe("pinterest");
    expect(normalizeSource("Pinterest")).toBe("pinterest");
    expect(normalizeSource("pinterest.com")).toBe("pinterest");
    expect(normalizeSource("pinterest_ads")).toBe("pinterest");
  });

  it("google variants → google_ads", () => {
    expect(normalizeSource("google")).toBe("google_ads");
    expect(normalizeSource("Google Ads")).toBe("google_ads");
    expect(normalizeSource("adwords")).toBe("google_ads");
  });

  it("facebook/meta variants → meta_ads", () => {
    expect(normalizeSource("facebook")).toBe("meta_ads");
    expect(normalizeSource("Meta")).toBe("meta_ads");
    expect(normalizeSource("fb_ads")).toBe("meta_ads");
    expect(normalizeSource("instagram")).toBe("meta_ads");
  });

  it("source inconnue → null", () => {
    expect(normalizeSource("random_thing")).toBeNull();
    expect(normalizeSource(null)).toBeNull();
    expect(normalizeSource("")).toBeNull();
  });
});

describe("normalizeCampaignName", () => {
  it("trim + lowercase + collapse spaces", () => {
    expect(normalizeCampaignName("  Test  Campaign  ")).toBe("test campaign");
    expect(normalizeCampaignName("VINTAGE_CORNWALL_V2")).toBe("vintage_cornwall_v2");
  });
});
