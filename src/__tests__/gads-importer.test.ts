import { describe, it, expect } from "vitest";
import { classifyRows, findMissingDates } from "@/lib/gads/importer";
import type { GadsCsvRow } from "@/lib/gads/csv-parser";

const row = (campaign: string, date: string): GadsCsvRow => ({
  campaign_name: campaign,
  date,
  cost_cents: 1000,
  clicks: 10,
  impressions: 100,
  conversions: 1,
  conversion_value_cents: 5000,
});

describe("classifyRows — logique incrémentale avec écrasement", () => {
  it("distingue les lignes ajoutées des lignes écrasées", () => {
    const rows = [row("Brand", "2026-06-25"), row("Brand", "2026-06-26"), row("Promo", "2026-06-25")];
    const existing = new Set(["Brand|2026-06-25"]);
    const { added, updated } = classifyRows(rows, existing);
    expect(updated).toHaveLength(1);
    expect(updated[0].date).toBe("2026-06-25");
    expect(added).toHaveLength(2);
  });

  it("réimport de juin entier puis 25 juin → aujourd'hui : tout converge", () => {
    // Premier import : juin entier déjà en base.
    const existing = new Set([
      "Brand|2026-06-25", "Brand|2026-06-26", "Brand|2026-06-27",
      "Brand|2026-06-28", "Brand|2026-06-29", "Brand|2026-06-30",
    ]);
    // Second import : 25 juin → 2 juillet.
    const rows = [
      row("Brand", "2026-06-25"), row("Brand", "2026-06-26"), row("Brand", "2026-06-27"),
      row("Brand", "2026-06-28"), row("Brand", "2026-06-29"), row("Brand", "2026-06-30"),
      row("Brand", "2026-07-01"), row("Brand", "2026-07-02"),
    ];
    const { added, updated } = classifyRows(rows, existing);
    // 25→30 juin mis à jour avec les valeurs les plus récentes, juillet ajouté.
    expect(updated).toHaveLength(6);
    expect(added.map((r) => r.date)).toEqual(["2026-07-01", "2026-07-02"]);
  });

  it("tout est ajouté quand la base est vide", () => {
    const { added, updated } = classifyRows([row("Brand", "2026-06-01")], new Set());
    expect(added).toHaveLength(1);
    expect(updated).toHaveLength(0);
  });
});

describe("findMissingDates — détection de trous", () => {
  it("détecte les jours sans données dans la plage min→max", () => {
    expect(findMissingDates(["2026-06-10", "2026-06-11", "2026-06-14"]))
      .toEqual(["2026-06-12", "2026-06-13"]);
  });

  it("plage continue → aucun trou", () => {
    expect(findMissingDates(["2026-06-10", "2026-06-11", "2026-06-12"])).toEqual([]);
  });

  it("gère les doublons de dates (plusieurs campagnes par jour)", () => {
    expect(findMissingDates(["2026-06-10", "2026-06-10", "2026-06-12"])).toEqual(["2026-06-11"]);
  });

  it("traverse les fins de mois", () => {
    expect(findMissingDates(["2026-06-29", "2026-07-02"]))
      .toEqual(["2026-06-30", "2026-07-01"]);
  });

  it("liste vide → aucun trou", () => {
    expect(findMissingDates([])).toEqual([]);
  });

  it("un seul jour → aucun trou", () => {
    expect(findMissingDates(["2026-06-10"])).toEqual([]);
  });
});
