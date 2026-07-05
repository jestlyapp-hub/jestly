import { describe, it, expect } from "vitest";
import {
  resolveUnitCost, prorateExpenses, dailyRate, computeBlendedStats,
  type ProductCostRow, type BlendedOrder,
} from "@/lib/costs/engine";

const NO_FEES = { shipping_cost_cents: 0, payment_fee_percent: 0, payment_fee_fixed_cents: 0, packaging_cost_cents: 0 };

describe("resolveUnitCost — COGS versionnés", () => {
  const costs: ProductCostRow[] = [
    { shopify_product_id: "p1", unit_cost_cents: 3000, effective_from: "2026-06-01" },
    { shopify_product_id: "p1", unit_cost_cents: 3500, effective_from: "2026-07-01" },
    { shopify_product_id: "p2", unit_cost_cents: 1000, effective_from: "2026-06-15" },
  ];

  it("prend la version la plus récente dont effective_from ≤ date de commande", () => {
    expect(resolveUnitCost(costs, "p1", "2026-06-20T10:00:00Z")).toBe(3000);
    expect(resolveUnitCost(costs, "p1", "2026-07-01T00:00:00Z")).toBe(3500);
    expect(resolveUnitCost(costs, "p1", "2026-08-15T00:00:00Z")).toBe(3500);
  });

  it("null avant la première version ou produit inconnu — jamais inventé", () => {
    expect(resolveUnitCost(costs, "p1", "2026-05-20T00:00:00Z")).toBeNull();
    expect(resolveUnitCost(costs, "p999", "2026-07-01T00:00:00Z")).toBeNull();
    expect(resolveUnitCost(costs, null, "2026-07-01T00:00:00Z")).toBeNull();
  });
});

describe("prorateExpenses — prorata journalier", () => {
  it("mensuel : taux journalier = montant × 12 ÷ 365", () => {
    expect(dailyRate({ amount_cents: 36500, period: "monthly" })).toBeCloseTo(1200, 5);
    expect(dailyRate({ amount_cents: 36500, period: "yearly" })).toBeCloseTo(100, 5);
  });

  it("impute uniquement les jours actifs dans la plage", () => {
    const expense = { amount_cents: 36500, period: "monthly" as const, starts_on: "2026-06-01", ends_on: null };
    // 10 jours actifs × 1200/j = 12000
    expect(prorateExpenses([expense], { from: "2026-06-01", to: "2026-06-10" })).toBe(12000);
  });

  it("respecte starts_on et ends_on (chevauchement partiel)", () => {
    const expense = { amount_cents: 36500, period: "monthly" as const, starts_on: "2026-06-05", ends_on: "2026-06-07" };
    // Actif seulement 5, 6, 7 juin → 3 jours × 1200
    expect(prorateExpenses([expense], { from: "2026-06-01", to: "2026-06-30" })).toBe(3600);
    // Hors plage → 0
    expect(prorateExpenses([expense], { from: "2026-07-01", to: "2026-07-31" })).toBe(0);
  });
});

describe("computeBlendedStats — les métriques de vérité", () => {
  const RANGE = { from: "2026-06-01", to: "2026-06-30" };
  const order = (cents: number, customer: string | null, productId = "p1", qty = 1): BlendedOrder => ({
    total_cents: cents,
    customer_id: customer,
    created_at: "2026-06-15T10:00:00Z",
    line_items: [{ product_id: productId, quantity: qty }],
  });
  const COSTS: ProductCostRow[] = [{ shopify_product_id: "p1", unit_cost_cents: 3000, effective_from: "2026-01-01" }];
  const FEES = { shipping_cost_cents: 500, payment_fee_percent: 2, payment_fee_fixed_cents: 30, packaging_cost_cents: 100 };

  it("scénario complet : MER, AOV, BE-ROAS, Net Profit, statut", () => {
    const s = computeBlendedStats({
      orders: [order(10000, "c1"), order(10000, "c2")],
      spend_cents: 10000,
      costs: COSTS,
      fees: FEES,
      expenses: [],
      range: RANGE,
      firstOrderAtByCustomer: new Map([["c1", "2026-06-15T10:00:00Z"], ["c2", "2026-06-15T10:00:00Z"]]),
    });
    expect(s.revenue_cents).toBe(20000);
    expect(s.mer).toBe(2);                       // 200 € / 100 €
    expect(s.aov_cents).toBe(10000);
    expect(s.cogs.cogs_cents).toBe(6000);        // 2 × 30 €
    expect(s.cogs.coverage).toBe(1);
    // Coût variable / commande = 3000 (COGS) + 630 (ship+fixe+pack) + 200 (2 % AOV) = 3830
    expect(s.variable_cost_per_order_cents).toBe(3830);
    // BE-ROAS = 10000 / (10000 − 3830) = 1.62
    expect(s.be_roas).toBe(1.62);
    expect(s.status).toBe("profitable");         // MER 2 ≥ 1.62
    expect(s.mer_vs_be_roas).toBe(0.38);
    // Net Profit = 20000 − 6000 − 10000 − 1000 (ship) − 460 (2 %×20000 + 2×30) − 200 (pack) = 2340
    expect(s.net_profit_cents).toBe(2340);
    expect(s.net_margin).toBe(0.117);
  });

  it("mode dégradé : sans coûts, MER/AOV restent, BE-ROAS et Net Profit sont null", () => {
    const s = computeBlendedStats({
      orders: [order(10000, "c1")],
      spend_cents: 5000,
      costs: [],
      fees: NO_FEES,
      expenses: [],
      range: RANGE,
      firstOrderAtByCustomer: new Map(),
    });
    expect(s.costs_configured).toBe(false);
    expect(s.mer).toBe(2);
    expect(s.aov_cents).toBe(10000);
    expect(s.be_roas).toBeNull();
    expect(s.net_profit_cents).toBeNull();
    expect(s.status).toBe("insufficient_data");
  });

  it("perte structurelle : coût variable ≥ AOV → BE-ROAS inatteignable, jamais un nombre", () => {
    const s = computeBlendedStats({
      orders: [order(3000, "c1")], // AOV 30 € < COGS 30 € + frais
      spend_cents: 1000,
      costs: COSTS,
      fees: FEES,
      expenses: [],
      range: RANGE,
      firstOrderAtByCustomer: new Map(),
    });
    expect(s.be_roas).toBeNull();
    expect(s.be_roas_reachable).toBe(false);
    expect(s.status).toBe("unprofitable");
  });

  it("NC-ROAS / NCPA : nouveau = toute première commande du customer_id", () => {
    const s = computeBlendedStats({
      orders: [
        order(10000, "nouveau"),                 // première commande → nouveau
        order(6000, "ancien"),                   // avait déjà commandé en mai → pas nouveau
        order(4000, null),                       // invité inconnu → compté nouveau
      ],
      spend_cents: 7000,
      costs: [],
      fees: NO_FEES,
      expenses: [],
      range: RANGE,
      firstOrderAtByCustomer: new Map([
        ["nouveau", "2026-06-15T10:00:00Z"],
        ["ancien", "2026-05-02T08:00:00Z"],
      ]),
    });
    expect(s.new_customers).toBe(2);
    expect(s.nc_revenue_cents).toBe(14000);
    expect(s.nc_roas).toBe(2);                   // 140 € / 70 €
    expect(s.ncpa_cents).toBe(3500);             // 70 € / 2
  });

  it("les dépenses récurrentes entrent dans le Net Profit mais PAS dans le BE-ROAS", () => {
    const expenses = [{ amount_cents: 36500, period: "monthly" as const, starts_on: "2026-01-01", ends_on: null }];
    const base = {
      orders: [order(50000, "c1")],
      spend_cents: 10000,
      costs: COSTS,
      fees: NO_FEES,
      range: RANGE,
      firstOrderAtByCustomer: new Map<string, string>(),
    };
    const sans = computeBlendedStats({ ...base, expenses: [] });
    const avec = computeBlendedStats({ ...base, expenses });
    expect(avec.be_roas).toBe(sans.be_roas);     // BE-ROAS insensible aux fixes
    expect(avec.expenses_prorated_cents).toBe(36000); // 30 jours × 1200
    expect(avec.net_profit_cents).toBe((sans.net_profit_cents ?? 0) - 36000);
  });

  it("couverture COGS partielle signalée, jamais comblée", () => {
    const s = computeBlendedStats({
      orders: [order(10000, "c1", "p1"), order(10000, "c2", "p_sans_cout")],
      spend_cents: 5000,
      costs: COSTS,
      fees: NO_FEES,
      expenses: [],
      range: RANGE,
      firstOrderAtByCustomer: new Map(),
    });
    expect(s.cogs.coverage).toBe(0.5);
    expect(s.cogs.cogs_cents).toBe(3000);        // seul p1 compté, p_sans_cout = 0, pas inventé
  });
});
