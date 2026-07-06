import { describe, it, expect } from "vitest";
import { PixelPayloadSchema, isLikelyBot, hasAttributionSignals, isConsentTwin } from "@/lib/pixel/collect";

const VALID = {
  pixel_id: "6f1d1f52-7d4a-4f4e-9a5b-2f3c4d5e6f70",
  session_id: "3f2b8c9d-1a2b-4c3d-8e9f-0a1b2c3d4e5f",
  shop: "lhorlogemurale.fr",
  landing: "https://lhorlogemurale.fr/?gclid=abc",
  referrer: "https://www.google.com/",
  params: { gclid: "abc" },
  ts: 1751500000000,
};

describe("PixelPayloadSchema — validation de l'endpoint public", () => {
  it("accepte un payload complet valide", () => {
    expect(PixelPayloadSchema.safeParse(VALID).success).toBe(true);
  });

  it("accepte un payload minimal (arrivée directe, sans signaux)", () => {
    expect(PixelPayloadSchema.safeParse({
      pixel_id: VALID.pixel_id,
      session_id: VALID.session_id,
    }).success).toBe(true);
  });

  it("rejette un pixel_id non uuid", () => {
    expect(PixelPayloadSchema.safeParse({ ...VALID, pixel_id: "abc" }).success).toBe(false);
  });

  it("rejette un session_id exotique (injection)", () => {
    expect(PixelPayloadSchema.safeParse({ ...VALID, session_id: "x'; DROP TABLE--" }).success).toBe(false);
    expect(PixelPayloadSchema.safeParse({ ...VALID, session_id: "court" }).success).toBe(false);
  });

  it("rejette les champs trop longs", () => {
    expect(PixelPayloadSchema.safeParse({ ...VALID, landing: "x".repeat(2001) }).success).toBe(false);
    expect(PixelPayloadSchema.safeParse({ ...VALID, params: { gclid: "x".repeat(501) } }).success).toBe(false);
  });
});

describe("isLikelyBot — filtre des bots évidents", () => {
  it("détecte les crawlers et clients headless", () => {
    expect(isLikelyBot("Mozilla/5.0 (compatible; Googlebot/2.1)")).toBe(true);
    expect(isLikelyBot("python-requests/2.31")).toBe(true);
    expect(isLikelyBot("curl/8.0")).toBe(true);
    expect(isLikelyBot("HeadlessChrome/120.0")).toBe(true);
    expect(isLikelyBot(null)).toBe(true);
    expect(isLikelyBot("")).toBe(true);
  });

  it("laisse passer les navigateurs réels", () => {
    expect(isLikelyBot("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36")).toBe(false);
    expect(isLikelyBot("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Version/17.0 Mobile Safari/604.1")).toBe(false);
  });
});

describe("isConsentTwin — fusion des doublons de session au consentement", () => {
  it("même landing + même referrer = même visiteur (bannière qui purge et recharge)", () => {
    expect(isConsentTwin(
      { landing_page: "https://lhorlogemurale.fr/?gclid=abc", referrer: null },
      { landing: "https://lhorlogemurale.fr/?gclid=abc", referrer: null },
    )).toBe(true);
  });

  it("landing ou referrer différents = visiteurs distincts, jamais fusionnés", () => {
    expect(isConsentTwin(
      { landing_page: "https://lhorlogemurale.fr/?gclid=abc", referrer: null },
      { landing: "https://lhorlogemurale.fr/produits/pendule", referrer: null },
    )).toBe(false);
    expect(isConsentTwin(
      { landing_page: "https://lhorlogemurale.fr/", referrer: "https://google.com/" },
      { landing: "https://lhorlogemurale.fr/", referrer: "https://ecosia.org/" },
    )).toBe(false);
  });
});

describe("hasAttributionSignals — arrivée porteuse de signaux", () => {
  const base = { pixel_id: VALID.pixel_id, session_id: VALID.session_id };

  it("gclid, utm ou referrer → signaux présents", () => {
    expect(hasAttributionSignals({ ...base, params: { gclid: "abc" } })).toBe(true);
    expect(hasAttributionSignals({ ...base, params: { utm_source: "pinterest" } })).toBe(true);
    expect(hasAttributionSignals({ ...base, referrer: "https://bing.com" })).toBe(true);
  });

  it("arrivée directe nue → aucun signal", () => {
    expect(hasAttributionSignals({ ...base })).toBe(false);
    expect(hasAttributionSignals({ ...base, params: {} })).toBe(false);
  });
});
