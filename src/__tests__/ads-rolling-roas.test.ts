import { describe, it, expect } from "vitest";
import { computeRollingRoas } from "@/lib/ads/aggregator";

describe("computeRollingRoas (ROAS glissant 7 j)", () => {
  it("fenêtre mobile : chaque point = SUM/SUM des 7 derniers jours", () => {
    // 10 jours : spend 10 €/j, une seule vente de 70 € au jour 5 (index 4)
    const points = Array.from({ length: 10 }, (_, i) => ({
      spend_cents: 1000,
      revenue_cents: i === 4 ? 7000 : 0,
    }));
    const rolling = computeRollingRoas(points, 7);
    // Jour 5 : fenêtre = jours 1-5 → 7000 / 5000 = 1.4 (pas 7.0 comme en jour isolé)
    expect(rolling[4]).toBe(1.4);
    // Jour 10 (index 9) : fenêtre = jours 4-10, la vente du jour 5 est encore dedans → 7000/7000 = 1
    expect(rolling[9]).toBe(1);
    // Jour 3 : aucune vente dans la fenêtre → 0
    expect(rolling[2]).toBe(0);
  });

  it("la vente sort de la fenêtre après windowDays", () => {
    const points = Array.from({ length: 12 }, (_, i) => ({
      spend_cents: 1000,
      revenue_cents: i === 0 ? 7000 : 0,
    }));
    const rolling = computeRollingRoas(points, 7);
    expect(rolling[6]).toBe(1);      // jour 7 : la vente du jour 1 est encore dans la fenêtre
    expect(rolling[7]).toBe(0);      // jour 8 : sortie de fenêtre
  });

  it("spend nul sur toute la fenêtre → null (pas de division par zéro)", () => {
    const rolling = computeRollingRoas([
      { spend_cents: 0, revenue_cents: 0 },
      { spend_cents: 0, revenue_cents: 5000 },
    ], 7);
    expect(rolling[0]).toBeNull();
    expect(rolling[1]).toBeNull();
  });

  it("liste vide → liste vide", () => {
    expect(computeRollingRoas([], 7)).toEqual([]);
  });
});
