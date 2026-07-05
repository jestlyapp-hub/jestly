import { describe, it, expect } from "vitest";
import { extractJestlySid, resolveSessionSource } from "@/lib/pixel/matcher";

describe("extractJestlySid — attribut de commande vers session_id", () => {
  it("lit la forme GraphQL ({key, value})", () => {
    expect(extractJestlySid([
      { key: "autre", value: "x" },
      { key: "_jestly_sid", value: "3f2b8c9d-1a2b-4c3d-8e9f-0a1b2c3d4e5f" },
    ])).toBe("3f2b8c9d-1a2b-4c3d-8e9f-0a1b2c3d4e5f");
  });

  it("lit la forme REST des webhooks ({name, value})", () => {
    expect(extractJestlySid([
      { name: "_jestly_sid", value: "3f2b8c9d-1a2b-4c3d-8e9f-0a1b2c3d4e5f" },
    ])).toBe("3f2b8c9d-1a2b-4c3d-8e9f-0a1b2c3d4e5f");
  });

  it("rejette les valeurs exotiques (injection) et les attributs absents", () => {
    expect(extractJestlySid([{ key: "_jestly_sid", value: "x'; DROP--" }])).toBeNull();
    expect(extractJestlySid([{ key: "_jestly_sid", value: "" }])).toBeNull();
    expect(extractJestlySid([])).toBeNull();
    expect(extractJestlySid(null)).toBeNull();
  });
});

describe("resolveSessionSource — source d'une session pixel", () => {
  it("gclid/gbraid/wbraid → google_ads", () => {
    expect(resolveSessionSource({ gclid: "abc" })).toBe("google_ads");
    expect(resolveSessionSource({ wbraid: "xyz" })).toBe("google_ads");
  });

  it("utm de campagne → provider normalisé", () => {
    expect(resolveSessionSource({ utm_source: "google", utm_medium: "cpc" })).toBe("google_ads");
    expect(resolveSessionSource({ utm_source: "pinterest" })).toBe("pinterest");
    expect(resolveSessionSource({ utm_source: "newsletter" })).toBe("other");
  });

  it("referrer moteur de recherche nu → seo", () => {
    expect(resolveSessionSource({ referrer: "https://www.google.com/" })).toBe("seo");
    expect(resolveSessionSource({ referrer: "https://www.bing.com/search" })).toBe("seo");
  });

  it("referrer pinterest → pinterest, autre referrer → other", () => {
    expect(resolveSessionSource({ referrer: "https://www.pinterest.fr/pin/1" })).toBe("pinterest");
    expect(resolveSessionSource({ referrer: "https://blog.example.com/" })).toBe("other");
  });

  it("aucun signal → direct", () => {
    expect(resolveSessionSource({})).toBe("direct");
    expect(resolveSessionSource({ gclid: null, referrer: null })).toBe("direct");
  });

  it("le LAST touch prime sur le first touch", () => {
    expect(resolveSessionSource({
      gclid: "premier-clic-ads",
      last_touch: { referrer: "https://www.pinterest.fr/" },
    })).toBe("pinterest");
    // Pas de last_touch → first touch utilisé.
    expect(resolveSessionSource({ gclid: "premier-clic-ads", last_touch: null })).toBe("google_ads");
  });
});
