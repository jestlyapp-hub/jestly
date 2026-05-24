import { describe, it, expect } from "vitest";
import { currencyUnitsToCents, microToCents } from "@/lib/pinterest/formatters";

/**
 * Tests sur le mapping fait par sync.ts (conversions monétaires + parsing).
 * On valide directement la cohérence des helpers + scénarios fréquents Pinterest.
 */

describe("pinterest sync mapping", () => {
  it("ligne campaign : daily_spend_cap (micro) → cents", () => {
    // Campaign Pinterest avec daily_spend_cap = 50 € en micro = 50_000_000
    const row = {
      daily_spend_cap_cents: microToCents(50_000_000),
    };
    expect(row.daily_spend_cap_cents).toBe(5000); // 50 € = 5000 cents
  });

  it("ligne metrics_daily : SPEND_IN_DOLLAR + TOTAL_CHECKOUT_VALUE_IN_DOLLAR (units) → cents", () => {
    // Pinterest renvoie : SPEND = 12.34, CHECKOUT_VALUE = 100.00 → ROAS = 100/12.34 ≈ 8.10
    const m = {
      spend_cents: currencyUnitsToCents(12.34),
      conversion_value_cents: currencyUnitsToCents(100.00),
    };
    expect(m.spend_cents).toBe(1234);
    expect(m.conversion_value_cents).toBe(10000);
    // ROAS calculé côté Jestly cohérent avec celui de Pinterest natif
    const roas = m.conversion_value_cents / m.spend_cents;
    expect(roas).toBeCloseTo(8.103, 2);
  });

  it("ligne metrics_daily : valeurs nulles ne crashent pas", () => {
    expect(currencyUnitsToCents(null)).toBe(0);
    expect(microToCents(undefined)).toBe(0);
  });

  it("ligne metrics_daily : CPC null géré", () => {
    const m: { CPC_IN_DOLLAR: number | null } = { CPC_IN_DOLLAR: null };
    const cpc_cents = m.CPC_IN_DOLLAR != null ? currencyUnitsToCents(m.CPC_IN_DOLLAR) : null;
    expect(cpc_cents).toBeNull();
  });

  it("rounding micro→cents : 1 micro = 0 cents (arrondi), pas de fraction silencieuse", () => {
    expect(microToCents(1)).toBe(0); // 0.0001 cents → 0
    expect(microToCents(9_999)).toBe(1); // 9_999 / 10_000 = 0.9999 → 1
    expect(microToCents(10_000)).toBe(1); // 1 cent
  });
});
