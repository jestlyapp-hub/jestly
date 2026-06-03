import { describe, it, expect } from "vitest";
import { computeOrderProfit, computeAggregateProfit } from "@/lib/profit/calculator";

describe("computeOrderProfit", () => {
  it("calcule la marge nette complète", () => {
    // Revenu 100 €, COGS 30 €, port 5 €, pub 10 €, remboursements 0,
    // frais paiement 1,4 % + 0,25 €, frais transaction 0.
    const b = computeOrderProfit({
      revenue_cents: 10000,
      cogs_cents: 3000,
      shipping_cost_cents: 500,
      ad_spend_cents: 1000,
      refunds_cents: 0,
      processor_fee_percent: 1.4,
      processor_fee_fixed_cents: 25,
      transaction_fee_percent: 0,
    });
    expect(b.processor_fees_cents).toBe(140 + 25); // 165
    expect(b.net_profit_cents).toBe(10000 - 3000 - 500 - 1000 - 0 - 165); // 5335
    expect(b.margin_percent).toBeCloseTo(53.35);
  });

  it("revenu nul → marge null, pas de division", () => {
    const b = computeOrderProfit({
      revenue_cents: 0,
      cogs_cents: 0,
      shipping_cost_cents: 0,
      ad_spend_cents: 0,
      refunds_cents: 0,
      processor_fee_percent: 1.4,
      processor_fee_fixed_cents: 25,
      transaction_fee_percent: 0,
    });
    expect(b.margin_percent).toBeNull();
    expect(b.net_profit_cents).toBe(-25); // frais fixes uniquement
  });

  it("marge nette peut être négative", () => {
    const b = computeOrderProfit({
      revenue_cents: 5000,
      cogs_cents: 3000,
      shipping_cost_cents: 500,
      ad_spend_cents: 4000,
      refunds_cents: 0,
      processor_fee_percent: 0,
      processor_fee_fixed_cents: 0,
      transaction_fee_percent: 0,
    });
    expect(b.net_profit_cents).toBe(-2500);
    expect(b.margin_percent).toBeCloseTo(-50);
  });
});

describe("computeAggregateProfit", () => {
  it("agrège et impute les coûts fixes", () => {
    const order = {
      revenue_cents: 10000,
      cogs_cents: 3000,
      shipping_cost_cents: 0,
      ad_spend_cents: 0,
      refunds_cents: 0,
      processor_fee_percent: 0,
      processor_fee_fixed_cents: 0,
      transaction_fee_percent: 0,
    };
    const agg = computeAggregateProfit({ orders: [order, order], fixed_costs_cents: 1000 });
    expect(agg.revenue_cents).toBe(20000);
    expect(agg.cogs_cents).toBe(6000);
    expect(agg.net_profit_cents).toBe(20000 - 6000 - 1000); // 13000
    expect(agg.margin_percent).toBeCloseTo(65);
  });

  it("liste vide → tout à zéro, marge null", () => {
    const agg = computeAggregateProfit({ orders: [] });
    expect(agg.net_profit_cents).toBe(0);
    expect(agg.margin_percent).toBeNull();
  });
});
