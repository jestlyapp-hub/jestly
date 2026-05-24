import { describe, it, expect } from "vitest";
import { computeRoas, computeMarginalRoas, determineProfitStatus } from "@/lib/ads/roas-engine";

describe("computeRoas", () => {
  it("ROAS = revenue / spend", () => {
    expect(computeRoas(20000, 10000)).toBe(2); // 200 € / 100 € = 2x
    expect(computeRoas(50000, 10000)).toBe(5);
    expect(computeRoas(5000, 10000)).toBe(0.5);
  });
  it("spend 0 → null", () => {
    expect(computeRoas(10000, 0)).toBeNull();
    expect(computeRoas(0, 0)).toBeNull();
  });
  it("revenue 0 → 0", () => {
    expect(computeRoas(0, 10000)).toBe(0);
  });
  it("précision 4 décimales", () => {
    const r = computeRoas(12345, 10000);
    expect(r).toBe(1.2345);
  });
});

describe("computeMarginalRoas", () => {
  it("marginal ROAS = (revenue × marge) / spend", () => {
    // 200 € revenue × 50% marge / 100 € spend = 1
    expect(computeMarginalRoas(20000, 10000, 50)).toBe(1);
    // 200 € × 70% / 100 € = 1.4
    expect(computeMarginalRoas(20000, 10000, 70)).toBe(1.4);
  });
  it("spend 0 → null", () => {
    expect(computeMarginalRoas(20000, 0, 50)).toBeNull();
  });
});

describe("determineProfitStatus", () => {
  const profitable = 2.0, warning = 1.5;
  it("ROAS ≥ profit threshold → profitable", () => {
    expect(determineProfitStatus(2.5, profitable, warning)).toBe("profitable");
    expect(determineProfitStatus(2.0, profitable, warning)).toBe("profitable");
  });
  it("warning ≤ ROAS < profit → warning", () => {
    expect(determineProfitStatus(1.75, profitable, warning)).toBe("warning");
    expect(determineProfitStatus(1.5, profitable, warning)).toBe("warning");
  });
  it("ROAS < warning → unprofitable", () => {
    expect(determineProfitStatus(1.49, profitable, warning)).toBe("unprofitable");
    expect(determineProfitStatus(0, profitable, warning)).toBe("unprofitable");
  });
  it("null → unmatched", () => {
    expect(determineProfitStatus(null, profitable, warning)).toBe("unmatched");
  });
});
