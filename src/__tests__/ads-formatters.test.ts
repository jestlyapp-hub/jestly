import { describe, it, expect } from "vitest";
import {
  formatCurrency, formatRoas, formatPercentDelta, formatConfidence,
  formatAttributionMethod, formatProvider, providerEmoji, formatPercent, formatNumberFr,
} from "@/lib/ads/formatters";

describe("formatCurrency (cents)", () => {
  it("100 cents → 1,00 €", () => {
    expect(formatCurrency(100)).toMatch(/1,00\s?€/);
  });
  it("12345 cents → 123,45 €", () => {
    expect(formatCurrency(12345)).toMatch(/123,45\s?€/);
  });
  it("0 cents → 0,00 €", () => {
    expect(formatCurrency(0)).toMatch(/0,00\s?€/);
  });
});

describe("formatRoas", () => {
  it("2 → 2.00×", () => {
    expect(formatRoas(2)).toBe("2.00×");
  });
  it("null → —", () => {
    expect(formatRoas(null)).toBe("—");
  });
});

describe("formatPercentDelta", () => {
  it("positif → +12.3 %", () => {
    expect(formatPercentDelta(12.3)).toBe("+12.3 %");
  });
  it("négatif → -8.5 %", () => {
    expect(formatPercentDelta(-8.5)).toBe("-8.5 %");
  });
  it("null → —", () => {
    expect(formatPercentDelta(null)).toBe("—");
  });
});

describe("formatConfidence", () => {
  it("≥ 0.9 → Très haute", () => { expect(formatConfidence(0.95)).toBe("Très haute"); });
  it("≥ 0.7 → Haute", () => { expect(formatConfidence(0.75)).toBe("Haute"); });
  it("≥ 0.5 → Moyenne", () => { expect(formatConfidence(0.6)).toBe("Moyenne"); });
  it("< 0.5 → Faible", () => { expect(formatConfidence(0.3)).toBe("Faible"); });
  it("null → —", () => { expect(formatConfidence(null)).toBe("—"); });
});

describe("formatAttributionMethod", () => {
  it("4 méthodes traduites FR", () => {
    expect(formatAttributionMethod("utm_campaign_exact")).toBe("UTM exact");
    expect(formatAttributionMethod("utm_source_prorata")).toBe("Source prorata");
    expect(formatAttributionMethod("referring_site")).toBe("Domaine référent");
    expect(formatAttributionMethod("unmatched")).toBe("Non attribuée");
  });
});

describe("formatProvider + providerEmoji", () => {
  it("provider labels", () => {
    expect(formatProvider("pinterest")).toBe("Pinterest");
    expect(formatProvider("google_ads")).toBe("Google Ads");
  });
  it("provider emojis", () => {
    expect(providerEmoji("pinterest")).toBe("📌");
    expect(providerEmoji("google_ads")).toBe("🔵");
    expect(providerEmoji(null)).toBe("🎯");
  });
});

describe("formatNumberFr + formatPercent", () => {
  it("number FR locale (espaces)", () => {
    const f = formatNumberFr(1234567);
    expect(f).toMatch(/1.?234.?567/); // espaces ou non-breaking space
  });
  it("percent with 2 digits default", () => {
    expect(formatPercent(12.345)).toBe("12.35 %");
  });
});
