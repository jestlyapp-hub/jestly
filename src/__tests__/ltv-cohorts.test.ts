import { describe, it, expect } from "vitest";
import { computeCohorts } from "@/lib/ltv/cohorts";
import { computeCAC, computeLtvCacRatio, computeCacPaybackMonths } from "@/lib/ltv/cac";

describe("computeCohorts", () => {
  it("regroupe par mois de première commande et calcule la LTV moyenne", () => {
    const cohorts = computeCohorts([
      // Client A : 1ère commande janvier, recommande 10 jours après
      { customer_id: "A", created_at: "2026-01-05T00:00:00Z", total_cents: 10000 },
      { customer_id: "A", created_at: "2026-01-15T00:00:00Z", total_cents: 5000 },
      // Client B : 1ère commande janvier, pas de recommande
      { customer_id: "B", created_at: "2026-01-20T00:00:00Z", total_cents: 8000 },
    ]);
    expect(cohorts).toHaveLength(1);
    const jan = cohorts[0]!;
    expect(jan.cohort_month).toBe("2026-01-01");
    expect(jan.n_customers).toBe(2);
    // LTV 30j = (10000+5000 + 8000) / 2 = 11500
    expect(jan.ltv_30d_cents).toBe(11500);
    // 1 client sur 2 a recommandé dans les 30j
    expect(jan.repeat_rate_30d).toBe(0.5);
  });

  it("rattache un client à sa cohorte d'acquisition même s'il recommande un autre mois", () => {
    const cohorts = computeCohorts([
      { customer_id: "A", created_at: "2026-01-10T00:00:00Z", total_cents: 10000 },
      { customer_id: "A", created_at: "2026-03-10T00:00:00Z", total_cents: 20000 },
    ]);
    expect(cohorts).toHaveLength(1);
    expect(cohorts[0]!.cohort_month).toBe("2026-01-01");
    // La 2e commande est à 59j → comptée en LTV 60j mais pas 30j.
    expect(cohorts[0]!.ltv_30d_cents).toBe(10000);
    expect(cohorts[0]!.ltv_60d_cents).toBe(30000);
  });

  it("liste vide → []", () => expect(computeCohorts([])).toEqual([]));
});

describe("CAC", () => {
  it("CAC = dépense / nouveaux clients", () => {
    expect(computeCAC(100000, 50)).toBe(2000);
    expect(computeCAC(100000, 0)).toBeNull();
  });
  it("ratio LTV:CAC", () => {
    expect(computeLtvCacRatio(6000, 2000)).toBe(3);
    expect(computeLtvCacRatio(6000, null)).toBeNull();
    expect(computeLtvCacRatio(6000, 0)).toBeNull();
  });
  it("payback en mois", () => {
    expect(computeCacPaybackMonths(2000, 500)).toBe(4);
    expect(computeCacPaybackMonths(2000, 0)).toBeNull();
    expect(computeCacPaybackMonths(null, 500)).toBe(0);
  });
});
