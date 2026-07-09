import { describe, it, expect, afterEach } from "vitest";
import { isGoogleAdsOwner, getGoogleAdsOwnerUserId } from "@/lib/gads/google-ads-client";

/**
 * Garde-fou multi-tenant : les credentials Google Ads sont globaux (mono-compte).
 * Seul le propriétaire désigné (GOOGLE_ADS_USER_ID) peut déclencher la sync API —
 * sinon un autre utilisateur ingérerait les données du propriétaire dans son
 * propre compte (fuite d'isolation corrigée).
 */
describe("gate propriétaire Google Ads", () => {
  const original = process.env.GOOGLE_ADS_USER_ID;
  afterEach(() => {
    if (original === undefined) delete process.env.GOOGLE_ADS_USER_ID;
    else process.env.GOOGLE_ADS_USER_ID = original;
  });

  it("seul le user désigné est propriétaire", () => {
    process.env.GOOGLE_ADS_USER_ID = "owner-123";
    expect(getGoogleAdsOwnerUserId()).toBe("owner-123");
    expect(isGoogleAdsOwner("owner-123")).toBe(true);
    expect(isGoogleAdsOwner("someone-else")).toBe(false);
  });

  it("fail closed : sans GOOGLE_ADS_USER_ID, personne n'est propriétaire", () => {
    delete process.env.GOOGLE_ADS_USER_ID;
    expect(getGoogleAdsOwnerUserId()).toBeNull();
    expect(isGoogleAdsOwner("owner-123")).toBe(false);
    expect(isGoogleAdsOwner("")).toBe(false);
  });
});
