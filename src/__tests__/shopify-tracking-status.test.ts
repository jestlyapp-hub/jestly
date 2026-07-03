import { describe, it, expect } from "vitest";
import { computeTrackingStatus, hasAttributionSignal } from "@/lib/shopify/tracking-status";

describe("computeTrackingStatus — 3 états distincts, jamais confondus", () => {
  it("ghost : momentsCount = 0, même si des utm sont présents", () => {
    // Un parcours vide reste ghost : la donnée d'attribution ne peut pas être fiable.
    expect(computeTrackingStatus(0, {})).toBe("ghost");
    expect(computeTrackingStatus(0, { utm_source: "google" })).toBe("ghost");
    expect(computeTrackingStatus(0, { referring_site: "https://google.com" })).toBe("ghost");
  });

  it("tracked : momentsCount > 0 ET signal d'attribution exploitable", () => {
    expect(computeTrackingStatus(3, { utm_source: "google" })).toBe("tracked");
    expect(computeTrackingStatus(1, { utm_campaign: "brand" })).toBe("tracked");
    expect(computeTrackingStatus(1, { referring_site: "https://www.google.com/" })).toBe("tracked");
    expect(computeTrackingStatus(2, {
      landing_site: "https://lhorlogemurale.fr/?gclid=abc123",
    })).toBe("tracked");
  });

  it("unmatched : momentsCount > 0 MAIS aucun signal exploitable", () => {
    expect(computeTrackingStatus(2, {})).toBe("unmatched");
    expect(computeTrackingStatus(1, {
      utm_source: null, utm_medium: null, utm_campaign: null,
      referring_site: null, landing_site: "https://lhorlogemurale.fr/collections/horloges",
    })).toBe("unmatched");
  });

  it("null (inconnu) : journey indisponible — jamais assimilé à ghost", () => {
    expect(computeTrackingStatus(null, { utm_source: "google" })).toBeNull();
    expect(computeTrackingStatus(undefined, {})).toBeNull();
  });
});

describe("hasAttributionSignal", () => {
  it("détecte utm, referrer et auto-tagging Google (gclid/gbraid/wbraid)", () => {
    expect(hasAttributionSignal({ utm_source: "google" })).toBe(true);
    expect(hasAttributionSignal({ utm_medium: "cpc" })).toBe(true);
    expect(hasAttributionSignal({ referring_site: "https://google.com" })).toBe(true);
    expect(hasAttributionSignal({ landing_site: "https://x.fr/?gclid=Cj0KC" })).toBe(true);
    expect(hasAttributionSignal({ landing_site: "https://x.fr/?wbraid=xyz" })).toBe(true);
    expect(hasAttributionSignal({ landing_site: "https://x.fr/p?a=1&utm_source=google" })).toBe(true);
  });

  it("aucun signal → false", () => {
    expect(hasAttributionSignal({})).toBe(false);
    expect(hasAttributionSignal({ landing_site: "https://x.fr/collections" })).toBe(false);
    // "gclid" dans le chemin sans être un paramètre ne compte pas.
    expect(hasAttributionSignal({ landing_site: "https://x.fr/gclid-page" })).toBe(false);
  });
});
