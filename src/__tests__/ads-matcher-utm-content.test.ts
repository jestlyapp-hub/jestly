import { describe, it, expect } from "vitest";
import { matchAdFromUtmContent, type AdCandidate } from "@/lib/ads/matcher";

const ads: AdCandidate[] = [
  { provider: "pinterest", ad_id: "687195134313", ad_name: "Pin été", pin_id: "pin-1", campaign_id: "626758420271" },
  { provider: "pinterest", ad_id: "687195999888", ad_name: "Pin hiver", pin_id: "pin-2", campaign_id: "626758420271" },
];

describe("matchAdFromUtmContent", () => {
  it("match exact sur l'ad_id ({adid} seul)", () => {
    const hit = matchAdFromUtmContent("687195134313", ads);
    expect(hit?.ad_id).toBe("687195134313");
  });

  it("match sur template combiné {adid}_{device}", () => {
    const hit = matchAdFromUtmContent("687195134313_c", ads);
    expect(hit?.ad_id).toBe("687195134313");
  });

  it("match sur template combiné avec préfixe texte", () => {
    const hit = matchAdFromUtmContent("pin-687195999888-mobile", ads);
    expect(hit?.ad_id).toBe("687195999888");
  });

  it("priorité au match exact quand le contenu est ambigu", () => {
    const hit = matchAdFromUtmContent("687195134313", [
      ...ads,
      { provider: "pinterest", ad_id: "687195134313_c", ad_name: "Bizarre", pin_id: null, campaign_id: "x" },
    ]);
    expect(hit?.ad_id).toBe("687195134313");
  });

  it("pas de match → null", () => {
    expect(matchAdFromUtmContent("000000000000", ads)).toBeNull();
    expect(matchAdFromUtmContent("organic_post", ads)).toBeNull();
  });

  it("contenu vide / null / undefined → null", () => {
    expect(matchAdFromUtmContent("", ads)).toBeNull();
    expect(matchAdFromUtmContent("   ", ads)).toBeNull();
    expect(matchAdFromUtmContent(null, ads)).toBeNull();
    expect(matchAdFromUtmContent(undefined, ads)).toBeNull();
  });

  it("ignore les tokens numériques courts (< 6 chiffres, anti faux positifs)", () => {
    const shortIdAds: AdCandidate[] = [
      { provider: "pinterest", ad_id: "12345", ad_name: null, pin_id: null, campaign_id: "c1" },
    ];
    // "12345" en token interne ne doit pas matcher, mais en exact oui
    expect(matchAdFromUtmContent("v2_12345_c", shortIdAds)).toBeNull();
    expect(matchAdFromUtmContent("12345", shortIdAds)?.ad_id).toBe("12345");
  });

  it("liste d'ads vide → null", () => {
    expect(matchAdFromUtmContent("687195134313", [])).toBeNull();
  });
});
