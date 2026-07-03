import { describe, it, expect } from "vitest";
import { deriveMeasuredChannel, resolveEffectiveChannel } from "@/lib/gads/channels";

describe("deriveMeasuredChannel — canal mesuré depuis les données captées", () => {
  it("ghost ou unmatched → null (source inconnue, jamais devinée)", () => {
    expect(deriveMeasuredChannel({ tracking_status: "ghost", utm_source: "google" })).toBeNull();
    expect(deriveMeasuredChannel({ tracking_status: "unmatched" })).toBeNull();
    expect(deriveMeasuredChannel({ tracking_status: null, utm_source: "google" })).toBeNull();
  });

  it("gclid/gbraid/wbraid dans la landing → google_ads (payant prouvé)", () => {
    expect(deriveMeasuredChannel({
      tracking_status: "tracked",
      landing_site: "https://lhorlogemurale.fr/?gclid=Cj0KC",
    })).toBe("google_ads");
    expect(deriveMeasuredChannel({
      tracking_status: "tracked",
      referring_site: "https://www.google.com/",
      landing_site: "https://lhorlogemurale.fr/p?wbraid=xyz",
    })).toBe("google_ads");
  });

  it("utm_source=google posé par une campagne → google_ads", () => {
    expect(deriveMeasuredChannel({
      tracking_status: "tracked",
      utm_source: "google",
      utm_medium: "cpc",
      utm_campaign: "brand",
    })).toBe("google_ads");
  });

  it("referrer google.com SANS gclid ni utm → seo (organique, pas payant)", () => {
    expect(deriveMeasuredChannel({
      tracking_status: "tracked",
      referring_site: "https://www.google.com/",
      landing_site: "https://lhorlogemurale.fr/collections/horloges",
    })).toBe("seo");
  });

  it("autres moteurs de recherche → seo", () => {
    expect(deriveMeasuredChannel({ tracking_status: "tracked", referring_site: "https://www.bing.com/search?q=horloge" })).toBe("seo");
    expect(deriveMeasuredChannel({ tracking_status: "tracked", referring_site: "https://duckduckgo.com/" })).toBe("seo");
  });

  it("pinterest capté → pinterest", () => {
    expect(deriveMeasuredChannel({ tracking_status: "tracked", utm_source: "pinterest" })).toBe("pinterest");
    expect(deriveMeasuredChannel({ tracking_status: "tracked", referring_site: "https://www.pinterest.fr/pin/123" })).toBe("pinterest");
  });

  it("meta/tiktok ou referrer non moteur → other", () => {
    expect(deriveMeasuredChannel({ tracking_status: "tracked", utm_source: "facebook" })).toBe("other");
    expect(deriveMeasuredChannel({ tracking_status: "tracked", referring_site: "https://lesnumeriques.com/article" })).toBe("other");
  });
});

describe("resolveEffectiveChannel — le choix manuel prime", () => {
  it("manuel absent → canal mesuré", () => {
    expect(resolveEffectiveChannel("google_ads", null)).toBe("google_ads");
    expect(resolveEffectiveChannel(null, undefined)).toBeNull();
  });

  it("manuel posé → il prime sur le mesuré", () => {
    expect(resolveEffectiveChannel("seo", { channel: "google_ads", confidence: "assumed" })).toBe("google_ads");
    expect(resolveEffectiveChannel(null, { channel: "pinterest", confidence: "guessed" })).toBe("pinterest");
  });

  it("manuel « ghost » explicite → non attribué, même si mesuré", () => {
    expect(resolveEffectiveChannel("google_ads", { channel: "ghost", confidence: null })).toBeNull();
  });
});
