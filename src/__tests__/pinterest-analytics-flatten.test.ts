import { describe, it, expect } from "vitest";

/**
 * Pinterest analytics renvoie soit un objet { entityId: [rows] }, soit un array plat
 * [{ CAMPAIGN_ID, DATE, … }]. Le helper flattenAnalyticsResponse normalise.
 *
 * Comme la fonction est interne à sync.ts, on duplique sa logique ici pour la tester
 * (sortie attendue identique).
 */

interface Row { id: string; rows: Record<string, unknown>[] }

function flattenAnalyticsResponse(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  response: any,
  entityIdField: "CAMPAIGN_ID" | "AD_GROUP_ID" | "AD_ID",
): Row[] {
  if (Array.isArray(response)) {
    const grouped = new Map<string, Record<string, unknown>[]>();
    for (const row of response) {
      const id = String(row[entityIdField] ?? row.id ?? "");
      if (!id) continue;
      const list = grouped.get(id) ?? [];
      list.push(row);
      grouped.set(id, list);
    }
    return [...grouped.entries()].map(([id, rows]) => ({ id, rows }));
  }
  if (response && typeof response === "object") {
    return Object.entries(response).map(([id, rows]) => ({ id, rows: rows as Record<string, unknown>[] }));
  }
  return [];
}

describe("pinterest analytics flatten", () => {
  it("objet { id: [rows] } → array Row[]", () => {
    const input = {
      "12345": [{ DATE: "2026-05-01", SPEND_IN_DOLLAR: 10 }, { DATE: "2026-05-02", SPEND_IN_DOLLAR: 12 }],
      "67890": [{ DATE: "2026-05-01", SPEND_IN_DOLLAR: 5 }],
    };
    const out = flattenAnalyticsResponse(input, "CAMPAIGN_ID");
    expect(out).toHaveLength(2);
    expect(out.find((r) => r.id === "12345")?.rows).toHaveLength(2);
    expect(out.find((r) => r.id === "67890")?.rows).toHaveLength(1);
  });

  it("array plat → groupé par entityIdField", () => {
    const input = [
      { CAMPAIGN_ID: "1", DATE: "2026-05-01", SPEND_IN_DOLLAR: 10 },
      { CAMPAIGN_ID: "1", DATE: "2026-05-02", SPEND_IN_DOLLAR: 12 },
      { CAMPAIGN_ID: "2", DATE: "2026-05-01", SPEND_IN_DOLLAR: 5 },
    ];
    const out = flattenAnalyticsResponse(input, "CAMPAIGN_ID");
    expect(out).toHaveLength(2);
    expect(out.find((r) => r.id === "1")?.rows).toHaveLength(2);
  });

  it("array sans CAMPAIGN_ID mais avec id → groupe par id", () => {
    const input = [
      { id: "abc", DATE: "2026-05-01" },
      { id: "abc", DATE: "2026-05-02" },
    ];
    const out = flattenAnalyticsResponse(input, "CAMPAIGN_ID");
    expect(out).toHaveLength(1);
    expect(out[0].id).toBe("abc");
    expect(out[0].rows).toHaveLength(2);
  });

  it("response null/empty → []", () => {
    expect(flattenAnalyticsResponse(null, "CAMPAIGN_ID")).toEqual([]);
    expect(flattenAnalyticsResponse([], "CAMPAIGN_ID")).toEqual([]);
    expect(flattenAnalyticsResponse({}, "CAMPAIGN_ID")).toEqual([]);
  });
});
