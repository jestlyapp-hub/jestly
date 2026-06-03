import { describe, it, expect } from "vitest";
import { parseCogsCsv, moneyToCents, parseCsvLine } from "@/lib/profit/csv-importer";

describe("moneyToCents", () => {
  it("gère point et virgule décimale", () => {
    expect(moneyToCents("12.50")).toBe(1250);
    expect(moneyToCents("12,50")).toBe(1250);
    expect(moneyToCents("0")).toBe(0);
    expect(moneyToCents(" 3.00 ")).toBe(300);
  });
  it("rejette les valeurs invalides", () => {
    expect(moneyToCents("abc")).toBeNull();
    expect(moneyToCents("-5")).toBeNull();
    expect(moneyToCents("")).toBeNull();
  });
});

describe("parseCsvLine", () => {
  it("gère les champs entre guillemets avec virgules", () => {
    expect(parseCsvLine('a,"b,c",d')).toEqual(["a", "b,c", "d"]);
  });
  it("gère les guillemets échappés", () => {
    expect(parseCsvLine('"he said ""hi""",x')).toEqual(['he said "hi"', "x"]);
  });
});

describe("parseCogsCsv", () => {
  it("parse un CSV valide product_id + cogs", () => {
    const csv = "product_id,cogs,shipping_cost,effective_from\nP1,12.50,2.00,2026-01-01\nP2,8,0,2026-02-01";
    const res = parseCogsCsv(csv, "2026-06-03");
    expect(res.errors).toEqual([]);
    expect(res.rows).toHaveLength(2);
    expect(res.rows[0]).toMatchObject({
      product_id: "P1",
      cogs_cents: 1250,
      shipping_cost_cents: 200,
      effective_from: "2026-01-01",
    });
  });

  it("accepte sku au lieu de product_id et applique la date du jour par défaut", () => {
    const res = parseCogsCsv("sku,cogs\nSKU-1,5.00", "2026-06-03");
    expect(res.rows[0]).toMatchObject({ sku: "SKU-1", cogs_cents: 500, effective_from: "2026-06-03" });
  });

  it("rapporte les erreurs ligne par ligne sans bloquer les lignes valides", () => {
    const res = parseCogsCsv("product_id,cogs\nP1,12.00\nP2,oops\nP3,3.00", "2026-06-03");
    expect(res.rows).toHaveLength(2);
    expect(res.errors).toHaveLength(1);
    expect(res.errors[0]?.line).toBe(3);
  });

  it("colonne cogs manquante → erreur globale", () => {
    const res = parseCogsCsv("product_id,price\nP1,10", "2026-06-03");
    expect(res.rows).toHaveLength(0);
    expect(res.errors[0]?.message).toContain("cogs");
  });

  it("ni product_id ni sku → erreur globale", () => {
    const res = parseCogsCsv("cogs\n10.00", "2026-06-03");
    expect(res.errors[0]?.message).toContain("product_id ou sku");
  });
});
