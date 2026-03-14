import { describe, it, expect } from "vitest";
import { computeMRR, computeBillingMetrics, centsToEur } from "@/lib/billing-intelligence";

// Mock Stripe subscription structure
function mockSub(opts: {
  status: string;
  amount: number;  // cents
  interval: string;
  intervalCount?: number;
  quantity?: number;
}): any {
  return {
    status: opts.status,
    items: {
      data: [{
        price: {
          unit_amount: opts.amount,
          recurring: {
            interval: opts.interval,
            interval_count: opts.intervalCount || 1,
          },
        },
        quantity: opts.quantity || 1,
      }],
    },
  };
}

describe("computeMRR", () => {
  it("monthly sub = direct MRR", () => {
    const subs = [mockSub({ status: "active", amount: 700, interval: "month" })];
    expect(computeMRR(subs)).toBe(700); // 7€/mois
  });

  it("yearly sub = amount/12", () => {
    const subs = [mockSub({ status: "active", amount: 8400, interval: "year" })];
    expect(computeMRR(subs)).toBe(700); // 84€/an = 7€/mois
  });

  it("trialing subs included in MRR", () => {
    const subs = [mockSub({ status: "trialing", amount: 700, interval: "month" })];
    expect(computeMRR(subs)).toBe(700);
  });

  it("canceled subs excluded from MRR", () => {
    const subs = [mockSub({ status: "canceled", amount: 700, interval: "month" })];
    expect(computeMRR(subs)).toBe(0);
  });

  it("past_due subs excluded from MRR", () => {
    const subs = [mockSub({ status: "past_due", amount: 700, interval: "month" })];
    expect(computeMRR(subs)).toBe(0);
  });

  it("multiple subs summed", () => {
    const subs = [
      mockSub({ status: "active", amount: 700, interval: "month" }),
      mockSub({ status: "active", amount: 1900, interval: "month" }),
    ];
    expect(computeMRR(subs)).toBe(2600); // 7€ + 19€ = 26€
  });

  it("quantity multiplied", () => {
    const subs = [mockSub({ status: "active", amount: 700, interval: "month", quantity: 3 })];
    expect(computeMRR(subs)).toBe(2100); // 7€ * 3
  });

  it("empty array = 0", () => {
    expect(computeMRR([])).toBe(0);
  });

  it("bi-monthly interval", () => {
    const subs = [mockSub({ status: "active", amount: 1400, interval: "month", intervalCount: 2 })];
    expect(computeMRR(subs)).toBe(700); // 14€ every 2 months = 7€/month
  });
});

describe("computeBillingMetrics", () => {
  it("computes all fields correctly", () => {
    const subs = [
      mockSub({ status: "active", amount: 700, interval: "month" }),
      mockSub({ status: "active", amount: 1900, interval: "month" }),
      mockSub({ status: "trialing", amount: 700, interval: "month" }),
      mockSub({ status: "past_due", amount: 700, interval: "month" }),
      mockSub({ status: "canceled", amount: 700, interval: "month" }),
    ];
    const metrics = computeBillingMetrics(subs);
    expect(metrics.mrr).toBe(3300); // 7+19+7 (active+trialing)
    expect(metrics.arr).toBe(39600);
    expect(metrics.active_subscriptions).toBe(2);
    expect(metrics.trialing_subscriptions).toBe(1);
    expect(metrics.past_due_subscriptions).toBe(1);
    expect(metrics.canceled_subscriptions).toBe(1);
    expect(metrics.arpu).toBe(1650); // 3300/2
  });

  it("empty = all zeros", () => {
    const metrics = computeBillingMetrics([]);
    expect(metrics.mrr).toBe(0);
    expect(metrics.arr).toBe(0);
    expect(metrics.active_subscriptions).toBe(0);
    expect(metrics.arpu).toBe(0);
  });
});

describe("centsToEur", () => {
  it("formats correctly", () => {
    const result = centsToEur(700);
    expect(result).toContain("7");
    expect(result).toContain("€");
  });

  it("handles zero", () => {
    const result = centsToEur(0);
    expect(result).toContain("0");
  });
});
