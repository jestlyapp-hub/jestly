import { describe, it, expect } from "vitest";
import {
  isRevenueOrder,
  isExcludedOrder,
  getOrderDate,
  REVENUE_STATUSES,
  EXCLUDED_STATUSES,
  computeOrdersPipelineSummary,
  fmtEurPipeline,
} from "@/lib/business-metrics";

describe("Business Metrics", () => {
  it("REVENUE_STATUSES includes paid, invoiced, delivered", () => {
    expect(REVENUE_STATUSES).toContain("paid");
    expect(REVENUE_STATUSES).toContain("invoiced");
    expect(REVENUE_STATUSES).toContain("delivered");
    expect(REVENUE_STATUSES).not.toContain("new");
    expect(REVENUE_STATUSES).not.toContain("cancelled");
  });

  it("isRevenueOrder correctly identifies revenue orders", () => {
    expect(isRevenueOrder("paid")).toBe(true);
    expect(isRevenueOrder("invoiced")).toBe(true);
    expect(isRevenueOrder("delivered")).toBe(true);
    expect(isRevenueOrder("new")).toBe(false);
    expect(isRevenueOrder("cancelled")).toBe(false);
    expect(isRevenueOrder("dispute")).toBe(false);
  });

  it("isExcludedOrder correctly identifies excluded orders", () => {
    expect(isExcludedOrder("cancelled")).toBe(true);
    expect(isExcludedOrder("refunded")).toBe(true);
    expect(isExcludedOrder("dispute")).toBe(true);
    expect(isExcludedOrder("paid")).toBe(false);
  });

  it("getOrderDate prefers paid_at over created_at", () => {
    expect(getOrderDate({ paid_at: "2026-03-15", created_at: "2026-03-01" })).toBe("2026-03-15");
    expect(getOrderDate({ paid_at: null, created_at: "2026-03-01" })).toBe("2026-03-01");
    expect(getOrderDate({ created_at: "2026-03-01" })).toBe("2026-03-01");
  });

  it("computeOrdersPipelineSummary excludes cancelled/refunded/dispute", () => {
    const orders = [
      { status: "paid", amount: 100 },
      { status: "cancelled", amount: 50 },
      { status: "refunded", amount: 30 },
      { status: "dispute", amount: 20 },
      { status: "new", amount: 200 },
    ];
    const summary = computeOrdersPipelineSummary(orders);
    // Total = paid (100) + new (200) = 300
    expect(summary.totalRevenue).toBe(300);
    expect(summary.totalCount).toBe(2);
  });

  it("computeOrdersPipelineSummary sépare à faire, en cours et prêtes", () => {
    const orders = [
      { status: "new", amount: 100 },
      { status: "in_progress", amount: 200 },
      { status: "delivered", amount: 300 },
      { status: "paid", amount: 400 },
    ];
    const summary = computeOrdersPipelineSummary(orders);
    // "new" = à faire, PAS en cours
    expect(summary.todoRevenue).toBe(100);
    expect(summary.todoCount).toBe(1);
    // "in_progress" = en cours (sans "new")
    expect(summary.inProgressRevenue).toBe(200);
    expect(summary.inProgressCount).toBe(1);
    // "delivered" = prêtes
    expect(summary.readyRevenue).toBe(300);
    expect(summary.readyCount).toBe(1);
    expect(summary.totalRevenue).toBe(1000);
    expect(summary.totalCount).toBe(4);
  });

  it("ne compte JAMAIS 'new' dans 'en cours'", () => {
    const orders = [
      { status: "new", amount: 500 },
      { status: "new", amount: 300 },
      { status: "brief_received", amount: 100 },
      { status: "in_progress", amount: 200 },
    ];
    const summary = computeOrdersPipelineSummary(orders);
    expect(summary.todoRevenue).toBe(800);
    expect(summary.todoCount).toBe(2);
    expect(summary.inProgressRevenue).toBe(300);
    expect(summary.inProgressCount).toBe(2);
  });

  it("fmtEurPipeline formats correctly in FR", () => {
    const result = fmtEurPipeline(1234.5);
    // Should contain the number and € sign
    expect(result).toContain("€");
    expect(result).toContain("1");
    expect(result).toContain("234");
  });
});
