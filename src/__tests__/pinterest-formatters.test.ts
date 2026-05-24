import { describe, it, expect } from "vitest";
import {
  microToCents, currencyUnitsToCents, formatPinterestStatus, formatObjectiveType,
} from "@/lib/pinterest/formatters";

describe("pinterest formatters — money conversions (STOP #1 critical)", () => {
  it("microToCents: 1_000_000 micro = 1 unit = 100 cents", () => {
    expect(microToCents(1_000_000)).toBe(100);
    expect(microToCents(2_500_000)).toBe(250);
    expect(microToCents(0)).toBe(0);
    expect(microToCents(null)).toBe(0);
    expect(microToCents(undefined)).toBe(0);
  });

  it("currencyUnitsToCents: analytics _IN_DOLLAR values are units → *100", () => {
    expect(currencyUnitsToCents(12.34)).toBe(1234);
    expect(currencyUnitsToCents(0.5)).toBe(50);
    expect(currencyUnitsToCents(240)).toBe(24000);
    expect(currencyUnitsToCents(null)).toBe(0);
  });

  it("the two scales are NOT interchangeable (regression guard)", () => {
    // 240 micro ≠ 240 units. 240 micro = 0.024 cents → rounds to 0 ; 240 units = 24000 cents.
    expect(microToCents(240)).toBe(0);
    expect(currencyUnitsToCents(240)).toBe(24000);
  });
});

describe("pinterest formatters — labels", () => {
  it("status FR labels + passthrough", () => {
    expect(formatPinterestStatus("ACTIVE")).toBe("Actif");
    expect(formatPinterestStatus("PAUSED")).toBe("En pause");
    expect(formatPinterestStatus("WEIRD")).toBe("WEIRD");
    expect(formatPinterestStatus(null)).toBe("—");
  });

  it("objective FR labels", () => {
    expect(formatObjectiveType("WEB_CONVERSION")).toBe("Conversions web");
    expect(formatObjectiveType(undefined)).toBe("—");
  });
});
