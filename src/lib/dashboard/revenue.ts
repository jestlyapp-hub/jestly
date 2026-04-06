import type { SupabaseClient } from "@supabase/supabase-js";
import type { RevenueMonthPoint, DashboardRevenueData } from "./types";

// ═══════════════════════════════════════
// getDashboardRevenueSeries
// ═══════════════════════════════════════
// Computes monthly revenue over the last N months.
//
// REVENUE DEFINITION:
//   Revenue = sum of `amount` for orders with status IN ('paid', 'invoiced', 'delivered')
//   Date reference: paid_at if available, else created_at
//   This matches real business revenue (work done + paid/invoiced), not just pipeline.
//
// We explicitly DO NOT count: 'new', 'brief_received', 'in_progress', 'in_review',
//   'cancelled', 'refunded', 'dispute', 'validated'

const REVENUE_STATUSES = ["paid", "invoiced", "delivered"];

export async function getDashboardRevenueSeries(
  supabase: SupabaseClient,
  userId: string,
  months: number = 6
): Promise<DashboardRevenueData> {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  // Compute date range: first day of (current month - months + 1) to today
  const startMonth = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
  const startDate = `${startMonth.getFullYear()}-${String(startMonth.getMonth() + 1).padStart(2, "0")}-01`;

  // ── Fetch revenue-eligible orders ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: orders, error } = await (supabase.from("orders") as any)
    .select("id, amount, status, created_at, paid_at")
    .eq("user_id", userId)
    .in("status", REVENUE_STATUSES);

  if (error) {
    console.error("[DASHBOARD:REVENUE] ❌ Query failed:", error.message);
    return emptyRevenue(months);
  }

  const allOrders = orders || [];

  // ── Build month buckets ──
  const series: RevenueMonthPoint[] = [];
  const monthBuckets: Record<string, { revenue: number; ordersCount: number; paidCount: number }> = {};

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthBuckets[mKey] = { revenue: 0, ordersCount: 0, paidCount: 0 };
  }

  // ── Assign orders to months ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  allOrders.forEach((o: any) => {
    // Use paid_at if available, else created_at
    const rawDate = o.paid_at || o.created_at;
    const dateRef = rawDate ? String(rawDate).slice(0, 7) : null;
    if (!dateRef) return;

    const bucket = monthBuckets[dateRef];
    if (!bucket) return; // Outside our range

    const amount = Number(o.amount) || 0;
    bucket.revenue += amount;
    bucket.ordersCount++;
    if (o.status === "paid") bucket.paidCount++;
  });

  // ── Build series ──
  let totalRevenue = 0;
  let currentMonthRevenue = 0;
  let previousMonthRevenue = 0;

  const currentMKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const prevMDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMKey = `${prevMDate.getFullYear()}-${String(prevMDate.getMonth() + 1).padStart(2, "0")}`;

  for (const [mKey, bucket] of Object.entries(monthBuckets)) {
    const [y, m] = mKey.split("-").map(Number);
    const monthLabel = new Date(y, m - 1).toLocaleDateString("fr-FR", { month: "short" });

    const rev = Math.round(bucket.revenue * 100) / 100;
    totalRevenue += rev;

    if (mKey === currentMKey) currentMonthRevenue = rev;
    if (mKey === prevMKey) previousMonthRevenue = rev;

    series.push({
      monthKey: mKey,
      monthLabel,
      revenue: rev,
      ordersCount: bucket.ordersCount,
      paidOrdersCount: bucket.paidCount,
    });
  }

  const changePercent = previousMonthRevenue > 0
    ? Math.round(((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100)
    : 0;

  console.log(`[DASHBOARD:REVENUE] user=${userId} | eligible_orders=${allOrders.length} statuses=${REVENUE_STATUSES.join(",")} | total=${totalRevenue}€ | series: ${series.map(s => `${s.monthLabel}=${s.revenue}€`).join(" | ")}`);

  return {
    series,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    currentMonthRevenue,
    previousMonthRevenue,
    changePercent,
  };
}

function emptyRevenue(months: number): DashboardRevenueData {
  const now = new Date();
  const series: RevenueMonthPoint[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    series.push({
      monthKey: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      monthLabel: d.toLocaleDateString("fr-FR", { month: "short" }),
      revenue: 0,
      ordersCount: 0,
      paidOrdersCount: 0,
    });
  }
  return { series, totalRevenue: 0, currentMonthRevenue: 0, previousMonthRevenue: 0, changePercent: 0 };
}
