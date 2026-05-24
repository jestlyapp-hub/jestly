import { describe, it, expect } from "vitest";
import { parseRange, parseProviders } from "@/app/api/ecom/ads/_helpers";

describe("parseRange", () => {
  it("range=7d → 7 jours en arrière", () => {
    const r = parseRange("7d", null, null);
    const from = new Date(r.from), to = new Date(r.to);
    const days = Math.round((to.getTime() - from.getTime()) / (24 * 3600 * 1000));
    expect(days).toBe(7);
  });
  it("range=30d → 30 jours", () => {
    const r = parseRange("30d", null, null);
    const days = Math.round((new Date(r.to).getTime() - new Date(r.from).getTime()) / (24 * 3600 * 1000));
    expect(days).toBe(30);
  });
  it("range=90d → 90 jours", () => {
    const r = parseRange("90d", null, null);
    const days = Math.round((new Date(r.to).getTime() - new Date(r.from).getTime()) / (24 * 3600 * 1000));
    expect(days).toBe(90);
  });
  it("default → 30 jours si range invalide", () => {
    const r = parseRange("invalid", null, null);
    const days = Math.round((new Date(r.to).getTime() - new Date(r.from).getTime()) / (24 * 3600 * 1000));
    expect(days).toBe(30);
  });
  it("from + to custom prioritaires", () => {
    const r = parseRange("7d", "2026-01-01", "2026-01-31");
    expect(r.from).toBe("2026-01-01");
    expect(r.to).toBe("2026-01-31");
  });
});

describe("parseProviders", () => {
  it("CSV → array filtré sur whitelist", () => {
    expect(parseProviders("pinterest,google_ads")).toEqual(["pinterest", "google_ads"]);
    expect(parseProviders("pinterest,invalid,meta_ads")).toEqual(["pinterest", "meta_ads"]);
  });
  it("null → undefined", () => {
    expect(parseProviders(null)).toBeUndefined();
  });
  it("vide → undefined", () => {
    expect(parseProviders("invalid,foo,bar")).toBeUndefined();
  });
});
