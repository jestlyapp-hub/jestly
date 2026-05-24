import { describe, it, expect } from "vitest";
import { filterRealOrders, isRealOrder, isTestOrder, getExcludedOrderNames } from "@/lib/shopify/test-orders-filter";

describe("test-orders-filter", () => {
  const all = [
    { name: "#1001", total: 0 },
    { name: "#1002", total: 41.95 },
    { name: "#1003", total: 41.95 },
    { name: "#1004", total: 121.95 },
    { name: "#1005", total: 41.95 },
    { name: "#1006", total: 47.95 },
    { name: "#1007", total: 71.95 },
    { name: "#1008", total: 37.95 },
    { name: "#1009", total: 71.95 },
  ];

  it("default excluded list = #1001, #1002, #1004, #1005", () => {
    const excluded = getExcludedOrderNames();
    expect(excluded).toEqual(expect.arrayContaining(["#1001", "#1002", "#1004", "#1005"]));
  });

  it("filterRealOrders keeps only 5 real orders", () => {
    const real = filterRealOrders(all);
    expect(real).toHaveLength(5);
    expect(real.map((o) => o.name)).toEqual(["#1003", "#1006", "#1007", "#1008", "#1009"]);
  });

  it("real orders sum = 271.75 EUR", () => {
    const real = filterRealOrders(all);
    const sum = real.reduce((s, o) => s + o.total, 0);
    expect(sum).toBeCloseTo(271.75, 2);
  });

  it("isRealOrder + isTestOrder are complementary", () => {
    for (const o of all) {
      expect(isRealOrder(o)).toBe(!isTestOrder(o));
    }
  });

  it("handles null/undefined name gracefully", () => {
    expect(isRealOrder({ name: null })).toBe(true);
    expect(isRealOrder({ name: undefined })).toBe(true);
  });
});
