import { describe, it, expect } from "vitest";
import { parseGadsCsv, parseLocaleNumber, parseCsvDate } from "@/lib/gads/csv-parser";

describe("parseLocaleNumber", () => {
  it("parse les nombres FR (virgule décimale, espaces milliers, €)", () => {
    expect(parseLocaleNumber("12,34")).toBe(12.34);
    expect(parseLocaleNumber("1 234,56")).toBe(1234.56);
    expect(parseLocaleNumber("1 234,56 €")).toBe(1234.56);
    expect(parseLocaleNumber("1 234,56 €")).toBe(1234.56); // espace insécable
    expect(parseLocaleNumber("1 234,56")).toBe(1234.56); // espace fine insécable
    expect(parseLocaleNumber("0,00")).toBe(0);
  });

  it("parse les nombres EN (point décimal, virgules milliers)", () => {
    expect(parseLocaleNumber("12.34")).toBe(12.34);
    expect(parseLocaleNumber("1,234.56")).toBe(1234.56);
    expect(parseLocaleNumber('"1,234"')).toBe(1234); // virgule milliers (3 chiffres)
    expect(parseLocaleNumber("1,234,567")).toBe(1234567);
  });

  it("gère les valeurs vides et non numériques", () => {
    expect(parseLocaleNumber("--")).toBe(0);
    expect(parseLocaleNumber("—")).toBe(0);
    expect(parseLocaleNumber("")).toBe(0);
    expect(parseLocaleNumber("abc")).toBeNull();
    expect(parseLocaleNumber(null)).toBeNull();
  });
});

describe("parseCsvDate", () => {
  it("accepte YYYY-MM-DD et DD/MM/YYYY", () => {
    expect(parseCsvDate("2026-06-25")).toBe("2026-06-25");
    expect(parseCsvDate("25/06/2026")).toBe("2026-06-25");
    expect(parseCsvDate("5/6/2026")).toBe("2026-06-05");
    expect(parseCsvDate("Total")).toBeNull();
    expect(parseCsvDate("")).toBeNull();
  });
});

describe("parseGadsCsv — export FR standard", () => {
  const CSV_FR = [
    "Rapport de campagne",
    '"1 juin 2026 - 30 juin 2026"',
    "Jour,Campagne,Coût,Clics,Impressions,Conversions,Valeur de conv.",
    '2026-06-01,Marques propres,"12,34",45,"1 234","2,00","89,90"',
    '2026-06-02,Marques propres,"8,10",30,987,"1,00","44,95"',
    '2026-06-02,Générique horloges,"25,00",80,"2 500","0,00","0,00"',
    'Total : toutes les campagnes,"45,44",155,"4 721","3,00","134,85",',
  ].join("\n");

  it("extrait les lignes et convertit en centimes", () => {
    const res = parseGadsCsv(CSV_FR);
    expect(res.rows).toHaveLength(3);
    const first = res.rows[0];
    expect(first).toEqual({
      campaign_name: "Marques propres",
      date: "2026-06-01",
      cost_cents: 1234,
      clicks: 45,
      impressions: 1234,
      conversions: 2,
      conversion_value_cents: 8990,
    });
  });

  it("ignore les lignes de total", () => {
    const res = parseGadsCsv(CSV_FR);
    expect(res.skipped_totals).toBe(1);
    expect(res.rows.every((r) => !r.campaign_name.toLowerCase().startsWith("total"))).toBe(true);
  });

  it("ignore les lignes d'en-tête parasites avant le header", () => {
    const res = parseGadsCsv(CSV_FR);
    expect(res.rows.map((r) => r.date)).toEqual(["2026-06-01", "2026-06-02", "2026-06-02"]);
  });
});

describe("parseGadsCsv — variantes", () => {
  it("accepte l'export EN (Day/Campaign/Cost/Conv. value)", () => {
    const csv = [
      "Day,Campaign,Cost,Clicks,Impressions,Conversions,Conv. value",
      '2026-06-01,Brand,"1,234.56","1,000","10,000",5.00,450.00',
      "Total: account,999.99,0,0,0,0",
    ].join("\n");
    const res = parseGadsCsv(csv);
    expect(res.rows).toHaveLength(1);
    expect(res.rows[0].cost_cents).toBe(123456);
    expect(res.rows[0].clicks).toBe(1000);
    expect(res.rows[0].impressions).toBe(10000);
    expect(res.rows[0].conversion_value_cents).toBe(45000);
    expect(res.skipped_totals).toBe(1);
  });

  it("accepte le séparateur point-virgule et les dates DD/MM/YYYY", () => {
    const csv = [
      "Jour;Campagne;Coût (EUR);Clics;Impressions;Conversions;Valeur de conv.",
      "25/06/2026;Promo été;10,50;20;500;1,00;59,90",
    ].join("\n");
    const res = parseGadsCsv(csv);
    expect(res.rows).toHaveLength(1);
    expect(res.rows[0].date).toBe("2026-06-25");
    expect(res.rows[0].campaign_name).toBe("Promo été");
    expect(res.rows[0].cost_cents).toBe(1050);
  });

  it("accepte le séparateur tabulation", () => {
    const csv = [
      "Jour\tCampagne\tCoût\tClics\tImpressions\tConversions\tValeur de conv.",
      "2026-06-01\tMarques propres\t12,34\t45\t1 234\t2,00\t89,90",
    ].join("\n");
    const res = parseGadsCsv(csv);
    expect(res.rows).toHaveLength(1);
    expect(res.rows[0].cost_cents).toBe(1234);
  });

  it("somme les doublons (campagne, jour) — export segmenté par réseau", () => {
    const csv = [
      "Jour,Campagne,Coût,Clics,Impressions,Conversions,Valeur de conv.",
      '2026-06-01,Brand,"10,00",10,100,"1,00","50,00"',
      '2026-06-01,Brand,"5,00",5,50,"0,50","25,00"',
    ].join("\n");
    const res = parseGadsCsv(csv);
    expect(res.rows).toHaveLength(1);
    expect(res.rows[0].cost_cents).toBe(1500);
    expect(res.rows[0].clicks).toBe(15);
    expect(res.rows[0].conversions).toBe(1.5);
    expect(res.rows[0].conversion_value_cents).toBe(7500);
  });

  it("gère le BOM UTF-8 en tête de fichier", () => {
    const csv = "﻿Jour,Campagne,Coût\n2026-06-01,Brand,\"12,34\"";
    const res = parseGadsCsv(csv);
    expect(res.rows).toHaveLength(1);
    expect(res.rows[0].cost_cents).toBe(1234);
  });

  it("signale les colonnes optionnelles absentes sans échouer", () => {
    const csv = "Jour,Campagne,Coût\n2026-06-01,Brand,\"12,34\"";
    const res = parseGadsCsv(csv);
    expect(res.rows[0].clicks).toBe(0);
    expect(res.rows[0].conversion_value_cents).toBe(0);
    expect(res.warnings.length).toBeGreaterThan(0);
  });

  it("échoue proprement si l'en-tête est introuvable", () => {
    const res = parseGadsCsv("n'importe quoi\nsans structure");
    expect(res.rows).toHaveLength(0);
    expect(res.warnings[0]).toContain("En-tête introuvable");
  });

  it("ne confond pas Coût avec Coût / conv.", () => {
    const csv = [
      "Jour,Campagne,Coût / conv.,Coût,Clics,Impressions,Conversions,Valeur de conv.",
      '2026-06-01,Brand,"6,17","12,34",45,100,"2,00","89,90"',
    ].join("\n");
    const res = parseGadsCsv(csv);
    expect(res.rows[0].cost_cents).toBe(1234);
  });
});
