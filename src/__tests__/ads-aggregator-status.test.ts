import { describe, it, expect } from "vitest";
import { determinePeriodStatus } from "@/lib/ads/aggregator";

const SETTINGS = {
  roas_profitability_threshold: 2.0,
  roas_warning_threshold: 1.5,
  alert_min_spend_cents: 5000, // 50 €
};

describe("determinePeriodStatus (statut depuis l'agrégat de période)", () => {
  it("volume suffisant → statut selon le ROAS de période", () => {
    // 250 € revenue / 100 € spend = 2.5 → profitable
    expect(determinePeriodStatus({ spend_cents: 10000, revenue_cents: 25000, orders: 3 }, SETTINGS)).toBe("profitable");
    // 170 € / 100 € = 1.7 → warning
    expect(determinePeriodStatus({ spend_cents: 10000, revenue_cents: 17000, orders: 2 }, SETTINGS)).toBe("warning");
    // 100 € / 100 € = 1.0 → unprofitable
    expect(determinePeriodStatus({ spend_cents: 10000, revenue_cents: 10000, orders: 1 }, SETTINGS)).toBe("unprofitable");
  });

  it("le cas du diagnostic : campagne A sur 7 j (61,95 € / 60,45 €, ROAS 1,02) → Perte cohérente, plus jamais le pire-des-jours", () => {
    // Avant le fix : badgée « Perte » parce que 6 jours sur 7 n'avaient pas de vente.
    // Après : le statut découle du MÊME ROAS que le chiffre affiché (1,02 < 1,5).
    expect(determinePeriodStatus({ spend_cents: 6045, revenue_cents: 6195, orders: 1 }, SETTINGS)).toBe("unprofitable");
  });

  it("garde-fou : spend de période sous le seuil → données partielles", () => {
    // Campagne B du diagnostic sur 7 j : 47,95 € de vente / 4,20 € de spend
    // (ROAS « 11,4 » trompeur, la vente vient d'avant la période)
    expect(determinePeriodStatus({ spend_cents: 420, revenue_cents: 4795, orders: 1 }, SETTINGS)).toBe("insufficient_data");
  });

  it("garde-fou : aucune commande sur la période → données partielles", () => {
    expect(determinePeriodStatus({ spend_cents: 10000, revenue_cents: 0, orders: 0 }, SETTINGS)).toBe("insufficient_data");
  });

  it("garde-fou : revenue présent sans aucun spend → données partielles", () => {
    expect(determinePeriodStatus({ spend_cents: 0, revenue_cents: 4795, orders: 1 }, SETTINGS)).toBe("insufficient_data");
  });

  it("seuil exactement atteint → jugé normalement", () => {
    // 50 € pile de spend, 1 commande : plus de garde-fou
    expect(determinePeriodStatus({ spend_cents: 5000, revenue_cents: 12000, orders: 1 }, SETTINGS)).toBe("profitable");
  });
});
