import { describe, it, expect } from "vitest";
import { buildInsights } from "@/lib/gads/insights";
import { computeGoalProgress } from "@/lib/gads/goals";
import type { BlendedStats } from "@/lib/costs/engine";
import type { DataQuality } from "@/lib/costs/blended";

const stats = (over: Partial<BlendedStats>): BlendedStats => ({
  range: { from: "2026-07-01", to: "2026-07-30" },
  orders_count: 10,
  revenue_cents: 100000,
  spend_cents: 20000,
  mer: 5,
  aov_cents: 10000,
  new_customers: 5,
  nc_revenue_cents: 50000,
  nc_roas: 2.5,
  ncpa_cents: 4000,
  costs_configured: true,
  cogs: { cogs_cents: 30000, total_units: 10, covered_units: 10, coverage: 1 },
  variable_cost_per_order_cents: 4000,
  be_roas: 1.67,
  be_roas_reachable: true,
  expenses_prorated_cents: 0,
  net_profit_cents: 40000,
  net_margin: 0.4,
  status: "profitable",
  mer_vs_be_roas: 3.33,
  ...over,
});

const quality = (over: Partial<DataQuality> = {}): DataQuality => ({
  tracked: 8, ghost: 1, unmatched: 1, unknown: 0, pixel_recovered: 0,
  survey_recovered: 0, survey_recovered_revenue_cents: 0,
  manual_recovered: 0, manual_recovered_revenue_cents: 0,
  attributable_revenue_share: 0.9, manual_share_of_attributable: null,
  ...over,
});

describe("buildInsights — règles automatiques priorisées par impact", () => {
  it("MER sous BE-ROAS → insight critique", () => {
    const out = buildInsights({
      current: stats({ mer: 1.2, be_roas: 1.8, status: "unprofitable" }),
      previous: stats({}),
      quality: quality(),
    });
    expect(out.some((i) => i.id === "mer_below_be" && i.severity === "critical")).toBe(true);
  });

  it("marge unitaire négative → insight structurel vers les coûts", () => {
    const out = buildInsights({
      current: stats({ be_roas: null, be_roas_reachable: false }),
      previous: stats({}),
      quality: quality(),
    });
    const s = out.find((i) => i.id === "structural_loss");
    expect(s?.href).toBe("/ecom/settings?tab=couts");
  });

  it("budget gaspillé → mène aux Produits avec le pire produit nommé", () => {
    const out = buildInsights({
      current: stats({}),
      previous: stats({}),
      quality: quality(),
      wastedSpendCents: 4500,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      products: [{ title: "Pendule", wasted_spend: true, ads: { spend_cents: 4500 } } as any],
    });
    const w = out.find((i) => i.id === "wasted_spend");
    expect(w?.message).toContain("Pendule");
    expect(w?.href).toBe("/ecom/products");
  });

  it("part fantôme élevée → insight attribution ; part saine → rien", () => {
    const withGhost = buildInsights({
      current: stats({}),
      previous: stats({}),
      quality: quality({ attributable_revenue_share: 0.5 }),
    });
    expect(withGhost.some((i) => i.id === "ghost_share")).toBe(true);
    const healthy = buildInsights({ current: stats({}), previous: stats({}), quality: quality() });
    expect(healthy.some((i) => i.id === "ghost_share")).toBe(false);
  });

  it("les qualifications manuelles comptent dans les commandes déjà sorties de l'ombre", () => {
    const out = buildInsights({
      current: stats({}),
      previous: stats({}),
      quality: quality({ attributable_revenue_share: 0.5, manual_recovered: 3, pixel_recovered: 1 }),
    });
    const ghost = out.find((i) => i.id === "ghost_share")!;
    // 1 pixel + 0 survey + 3 manuelles = 4 commandes récupérées, signalées dans le message.
    expect(ghost.message).toContain("4");
    expect(ghost.message).toContain("manuelles");
  });

  it("maximum 5 insights, triés par impact décroissant", () => {
    const out = buildInsights({
      current: stats({ mer: 1, be_roas: 2, net_profit_cents: -50000, cogs: { cogs_cents: 0, total_units: 10, covered_units: 5, coverage: 0.5 } }),
      previous: stats({ spend_cents: 10000, mer: 3 }),
      quality: quality({ attributable_revenue_share: 0.4 }),
      wastedSpendCents: 4500,
      products: [],
    });
    expect(out.length).toBeLessThanOrEqual(5);
    for (let i = 1; i < out.length; i++) {
      expect(out[i - 1].impact_cents).toBeGreaterThanOrEqual(out[i].impact_cents);
    }
  });
});

describe("computeGoalProgress — jauge d'objectif mensuel", () => {
  it("progression et prorata", () => {
    const g = computeGoalProgress(50000, 100000, 15, 30)!;
    expect(g.progress).toBe(0.5);
    expect(g.prorata).toBe(0.5);
    expect(g.ahead).toBe(true); // pile au prorata = en ligne
  });

  it("en retard quand le réalisé est sous le prorata", () => {
    const g = computeGoalProgress(20000, 100000, 15, 30)!;
    expect(g.ahead).toBe(false);
  });

  it("pas d'objectif (0) → null, jamais de jauge inventée", () => {
    expect(computeGoalProgress(50000, 0, 15, 30)).toBeNull();
  });
});
