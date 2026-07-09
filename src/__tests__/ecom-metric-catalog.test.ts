import { describe, it, expect } from "vitest";
import {
  METRIC_CATALOG, METRIC_BY_ID, DEFAULT_KPI_IDS, formatMetric, metricDelta, SECTION_ORDER,
} from "@/lib/gads/metric-catalog";

describe("catalogue de métriques Dashboard", () => {
  it("ids uniques, sections valides, tooltips présents", () => {
    const ids = METRIC_CATALOG.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length); // pas de doublon
    for (const d of METRIC_CATALOG) {
      expect(SECTION_ORDER).toContain(d.section);
      expect(METRIC_BY_ID[d.id]).toBe(d);
    }
  });

  it("les KPI par défaut existent tous dans le catalogue", () => {
    for (const id of DEFAULT_KPI_IDS) expect(METRIC_BY_ID[id]).toBeDefined();
    expect(DEFAULT_KPI_IDS.length).toBeGreaterThan(0);
  });

  it("formatMetric respecte l'unité et gère l'absence de donnée", () => {
    expect(formatMetric(null, "currency")).toBe("non disponible");
    expect(formatMetric(12345, "currency")).toContain("123");     // 123,45 €
    expect(formatMetric(2.1, "ratio_x")).toBe("2.10×");
    expect(formatMetric(0.1538, "percent")).toBe("15.4 %");
    expect(formatMetric(1990, "number").replace(/\s/g, " ")).toBe("1 990"); // séparateur fr = espace fine insécable
  });

  it("metricDelta = variation relative signée, null si incalculable", () => {
    expect(metricDelta(120, 100)).toBe(20);
    expect(metricDelta(80, 100)).toBe(-20);
    expect(metricDelta(100, 0)).toBeNull();   // pas de base
    expect(metricDelta(null, 100)).toBeNull();
    // base négative : variation calculée sur la valeur absolue
    expect(metricDelta(-50, -100)).toBe(50);
  });
});
