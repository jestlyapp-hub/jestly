// ── Analytics Aggregation Engine ──
// Pure functions that compute all analytics metrics from raw DB rows.
// No DB access — receives data, returns computed results.

import type {
  TimeSeriesPoint,
  ProductPerformance,
  TopClient,
  DayRevenue,
  HourRevenue,
  CustomerSegment,
  MonthlyGrowthPoint,
  Forecast,
  RecentEvent,
  PaymentMethodStat,
} from "./types";
import { COMPLETED_STATUSES } from "./types";
import { getGranularity, type DateRange } from "./date-range";
import { getActiveClientsCount } from "@/lib/business-metrics";

// ── DB Row types (what Supabase actually returns) ──
export interface OrderRow {
  id: string;
  amount: number;           // NUMERIC in euros (not cents!)
  status: string;
  created_at: string;
  client_id: string | null;
  product_id: string | null;
  title: string | null;
  paid: boolean | null;
  // Joined client data
  clients?: { name: string; email: string } | null;
}

export interface ClientRow {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface ProductRow {
  id: string;
  name: string;
  price_cents: number;
  status: string;
  type: string;
}

export interface BillingRow {
  id: string;
  total: number;
  total_ttc: number;
  status: string;
  performed_at: string;
  client_id: string;
}

// ── Helpers ──

/** Is this order counted as revenue? (not cancelled, not refunded) */
function isRevenueOrder(o: OrderRow): boolean {
  return o.status !== "cancelled" && o.status !== "refunded" && o.status !== "dispute";
}

/** Safe number from DB */
function num(v: unknown): number {
  return Number(v) || 0;
}

// ═══════════════════════════════════════
// KPI COMPUTATIONS
// ═══════════════════════════════════════

export function computeKPIs(
  orders: OrderRow[],
  prevOrders: OrderRow[],
) {
  const active = orders.filter(isRevenueOrder);
  const prevActive = prevOrders.filter(isRevenueOrder);
  const refunded = orders.filter((o) => o.status === "refunded");

  // Revenue
  const totalRevenue = active.reduce((s, o) => s + num(o.amount), 0);
  const prevRevenue = prevActive.reduce((s, o) => s + num(o.amount), 0);
  const revenueChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

  // Orders
  const totalOrders = active.length;
  const prevTotalOrders = prevActive.length;
  const ordersChange = prevTotalOrders > 0 ? ((totalOrders - prevTotalOrders) / prevTotalOrders) * 100 : 0;

  // AOV
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const prevAvg = prevActive.length > 0 ? Math.round(prevRevenue / prevActive.length) : 0;
  const aovChange = prevAvg > 0 ? ((avgOrderValue - prevAvg) / prevAvg) * 100 : 0;

  // Refunds
  const refundRate = (active.length + refunded.length) > 0
    ? (refunded.length / (active.length + refunded.length)) * 100
    : 0;
  const refundAmount = refunded.reduce((s, o) => s + num(o.amount), 0);

  // Net profit
  const netProfit = totalRevenue - refundAmount;
  const prevRefundAmount = prevOrders.filter((o) => o.status === "refunded").reduce((s, o) => s + num(o.amount), 0);
  const prevNetProfit = prevRevenue - prevRefundAmount;
  const profitChange = prevNetProfit > 0 ? ((netProfit - prevNetProfit) / prevNetProfit) * 100 : 0;

  // Active clients — source de vérité unique (business-metrics.ts)
  const activeClients = getActiveClientsCount(orders);
  const prevActiveClients = getActiveClientsCount(prevOrders);
  const clientsChange = prevActiveClients > 0 ? ((activeClients - prevActiveClients) / prevActiveClients) * 100 : 0;

  // Returning customers
  const clientOrderCount = new Map<string, number>();
  active.forEach((o) => {
    if (o.client_id) clientOrderCount.set(o.client_id, (clientOrderCount.get(o.client_id) || 0) + 1);
  });
  const returningCount = [...clientOrderCount.values()].filter((c) => c > 1).length;
  const returningRate = activeClients > 0 ? Math.round((returningCount / activeClients) * 100) : 0;

  // Conversion rate: completed / all non-draft orders
  const completed = orders.filter((o) => (COMPLETED_STATUSES as readonly string[]).includes(o.status));
  const conversionRate = orders.length > 0 ? Math.round((completed.length / orders.length) * 100) : 0;
  const prevCompleted = prevOrders.filter((o) => (COMPLETED_STATUSES as readonly string[]).includes(o.status));
  const prevConversion = prevOrders.length > 0 ? Math.round((prevCompleted.length / prevOrders.length) * 100) : 0;
  const conversionChange = conversionRate - prevConversion;

  return {
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    revenueChange: Math.round(revenueChange * 10) / 10,
    netProfit: Math.round(netProfit * 100) / 100,
    profitChange: Math.round(profitChange * 10) / 10,
    totalOrders,
    ordersChange: Math.round(ordersChange * 10) / 10,
    conversionRate,
    conversionChange,
    avgOrderValue,
    aovChange: Math.round(aovChange * 10) / 10,
    returningRate,
    refundRate: Math.round(refundRate * 10) / 10,
    activeClients,
    clientsChange: Math.round(clientsChange * 10) / 10,
    // Extra for later use
    _refundAmount: refundAmount,
    _returningCount: returningCount,
  };
}

// ═══════════════════════════════════════
// TIME SERIES
// ═══════════════════════════════════════

export function buildTimeSeries(
  orders: OrderRow[],
  range: DateRange,
): TimeSeriesPoint[] {
  const active = orders.filter(isRevenueOrder);
  const refunded = orders.filter((o) => o.status === "refunded");
  const granularity = getGranularity(range);

  if (granularity === "hour") {
    return Array.from({ length: 24 }, (_, i) => {
      const hourOrders = active.filter((o) => new Date(o.created_at).getHours() === i);
      const hourRefunds = refunded.filter((o) => new Date(o.created_at).getHours() === i);
      const revenue = hourOrders.reduce((s, o) => s + num(o.amount), 0);
      const refundAmt = hourRefunds.reduce((s, o) => s + num(o.amount), 0);
      return {
        label: `${i}h`,
        revenue: Math.round(revenue * 100) / 100,
        orders: hourOrders.length,
        profit: Math.round((revenue - refundAmt) * 100) / 100,
      };
    });
  }

  if (granularity === "day") {
    const series: TimeSeriesPoint[] = [];
    const cursor = new Date(range.start);
    while (cursor <= range.end) {
      const dayStr = cursor.toISOString().slice(0, 10);
      const dayOrders = active.filter((o) => o.created_at.slice(0, 10) === dayStr);
      const dayRefunds = refunded.filter((o) => o.created_at.slice(0, 10) === dayStr);
      const revenue = dayOrders.reduce((s, o) => s + num(o.amount), 0);
      const refundAmt = dayRefunds.reduce((s, o) => s + num(o.amount), 0);
      series.push({
        label: cursor.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
        revenue: Math.round(revenue * 100) / 100,
        orders: dayOrders.length,
        profit: Math.round((revenue - refundAmt) * 100) / 100,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    return series;
  }

  // Monthly
  const series: TimeSeriesPoint[] = [];
  const cursor = new Date(range.start.getFullYear(), range.start.getMonth(), 1);
  while (cursor <= range.end) {
    const monthStart = cursor.toISOString();
    const nextMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    const monthEnd = nextMonth.toISOString();
    const monthOrders = active.filter((o) => o.created_at >= monthStart && o.created_at < monthEnd);
    const monthRefunds = refunded.filter((o) => o.created_at >= monthStart && o.created_at < monthEnd);
    const revenue = monthOrders.reduce((s, o) => s + num(o.amount), 0);
    const refundAmt = monthRefunds.reduce((s, o) => s + num(o.amount), 0);
    series.push({
      label: cursor.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }),
      revenue: Math.round(revenue * 100) / 100,
      orders: monthOrders.length,
      profit: Math.round((revenue - refundAmt) * 100) / 100,
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return series;
}

// ═══════════════════════════════════════
// PRODUCT PERFORMANCE
// ═══════════════════════════════════════

export function computeProductPerformance(
  orders: OrderRow[],
  products: ProductRow[],
): ProductPerformance[] {
  const active = orders.filter(isRevenueOrder);
  const refunded = orders.filter((o) => o.status === "refunded");
  const totalRevenue = active.reduce((s, o) => s + num(o.amount), 0);

  const productMap = new Map(products.map((p) => [p.id, p]));
  const byProduct = new Map<string, { name: string; revenue: number; orders: number; refunds: number }>();

  // Groupement par product_id quand il existe, sinon par titre normalisé
  // (les commandes manuelles n'ont pas de product_id)
  active.forEach((o) => {
    const prod = o.product_id ? productMap.get(o.product_id) : undefined;
    const name = prod?.name || o.title || "Autre";
    const key = o.product_id || `title_${name}`;
    const entry = byProduct.get(key) || { name, revenue: 0, orders: 0, refunds: 0 };
    entry.revenue += num(o.amount);
    entry.orders += 1;
    byProduct.set(key, entry);
  });

  refunded.forEach((o) => {
    const prod = o.product_id ? productMap.get(o.product_id) : undefined;
    const name = prod?.name || o.title || "Autre";
    const key = o.product_id || `title_${name}`;
    const entry = byProduct.get(key);
    if (entry) entry.refunds += 1;
  });

  return [...byProduct.values()]
    .map((p) => ({
      name: p.name,
      revenue: Math.round(p.revenue * 100) / 100,
      orders: p.orders,
      refunds: p.refunds,
      avgPrice: p.orders > 0 ? Math.round(p.revenue / p.orders) : 0,
      refundRate: p.orders > 0 ? Math.round((p.refunds / p.orders) * 100) : 0,
      revenueShare: totalRevenue > 0 ? Math.round((p.revenue / totalRevenue) * 100) : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

// ═══════════════════════════════════════
// TOP CLIENTS
// ═══════════════════════════════════════

export function computeTopClients(
  orders: OrderRow[],
  clients: ClientRow[],
): TopClient[] {
  const active = orders.filter(isRevenueOrder);
  const clientMap = new Map(clients.map((c) => [c.id, c]));

  const byClient = new Map<string, TopClient>();
  active.forEach((o) => {
    const cid = o.client_id || "unknown";
    const client = clientMap.get(cid);
    // Use joined client data from the order, then fall back to clients table
    const joinedClient = o.clients;
    const clientName = joinedClient?.name || client?.name || "Anonyme";
    const clientEmail = joinedClient?.email || client?.email || "";

    const entry = byClient.get(cid) || {
      name: clientName,
      email: clientEmail,
      revenue: 0,
      orders: 0,
      lastPurchase: o.created_at,
    };
    entry.revenue += num(o.amount);
    entry.orders += 1;
    if (o.created_at > entry.lastPurchase) entry.lastPurchase = o.created_at;
    byClient.set(cid, entry);
  });

  return [...byClient.values()]
    .map((c) => ({ ...c, revenue: Math.round(c.revenue * 100) / 100 }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);
}

// ═══════════════════════════════════════
// REVENUE BY DAY OF WEEK / HOUR
// ═══════════════════════════════════════

export function computeRevenueByDay(orders: OrderRow[]): DayRevenue[] {
  const active = orders.filter(isRevenueOrder);
  const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  const result = dayNames.map((name) => ({ name, revenue: 0, orders: 0 }));
  active.forEach((o) => {
    const day = new Date(o.created_at).getDay();
    result[day].revenue += num(o.amount);
    result[day].orders += 1;
  });
  result.forEach((d) => { d.revenue = Math.round(d.revenue * 100) / 100; });
  return result;
}

export function computeRevenueByHour(orders: OrderRow[]): HourRevenue[] {
  const active = orders.filter(isRevenueOrder);
  const result = Array.from({ length: 24 }, (_, i) => ({ hour: `${i}h`, revenue: 0, orders: 0 }));
  active.forEach((o) => {
    const hour = new Date(o.created_at).getHours();
    result[hour].revenue += num(o.amount);
    result[hour].orders += 1;
  });
  result.forEach((h) => { h.revenue = Math.round(h.revenue * 100) / 100; });
  return result;
}

// ═══════════════════════════════════════
// CUSTOMER ANALYTICS
// ═══════════════════════════════════════

export function computeCustomerAnalytics(
  orders: OrderRow[],
  prevOrders: OrderRow[],
  clients: ClientRow[],
  startISO: string,
  endISO: string,
  prevStart: string,
) {
  const active = orders.filter(isRevenueOrder);

  // New clients in period
  const newCustomers = clients.filter(
    (c) => c.created_at >= startISO && c.created_at <= endISO,
  ).length;
  const prevNewCustomers = clients.filter(
    (c) => c.created_at >= prevStart && c.created_at < startISO,
  ).length;
  const newCustomersChange = prevNewCustomers > 0
    ? Math.round(((newCustomers - prevNewCustomers) / prevNewCustomers) * 100)
    : 0;

  // Returning customers
  const clientOrderCount = new Map<string, number>();
  active.forEach((o) => {
    if (o.client_id) clientOrderCount.set(o.client_id, (clientOrderCount.get(o.client_id) || 0) + 1);
  });
  const returningCustomers = [...clientOrderCount.values()].filter((c) => c > 1).length;

  // Customer revenue for segments
  const clientRevenue = new Map<string, number>();
  active.forEach((o) => {
    if (o.client_id) clientRevenue.set(o.client_id, (clientRevenue.get(o.client_id) || 0) + num(o.amount));
  });
  const revenues = [...clientRevenue.entries()];

  const segments: CustomerSegment[] = [
    {
      segment: "Premium (>1000€)",
      count: revenues.filter(([, r]) => r >= 1000).length,
      revenue: Math.round(revenues.filter(([, r]) => r >= 1000).reduce((s, [, r]) => s + r, 0) * 100) / 100,
    },
    {
      segment: "Standard (200-1000€)",
      count: revenues.filter(([, r]) => r >= 200 && r < 1000).length,
      revenue: Math.round(revenues.filter(([, r]) => r >= 200 && r < 1000).reduce((s, [, r]) => s + r, 0) * 100) / 100,
    },
    {
      segment: "Découverte (<200€)",
      count: revenues.filter(([, r]) => r < 200).length,
      revenue: Math.round(revenues.filter(([, r]) => r < 200).reduce((s, [, r]) => s + r, 0) * 100) / 100,
    },
  ];

  return { newCustomers, newCustomersChange, returningCustomers, segments };
}

// ═══════════════════════════════════════
// PAYMENT METHODS (from paid boolean + stripe_payment_id)
// ═══════════════════════════════════════

export function computePaymentMethods(orders: OrderRow[]): PaymentMethodStat[] {
  const active = orders.filter(isRevenueOrder);
  // Since orders don't have a payment_method column, we use "stripe" as default
  // (all payments go through Stripe checkout)
  const method = "stripe";
  if (active.length === 0) return [];
  return [{ method, count: active.length, revenue: Math.round(active.reduce((s, o) => s + num(o.amount), 0) * 100) / 100 }];
}

// ═══════════════════════════════════════
// INSIGHTS ENGINE
// ═══════════════════════════════════════

export function generateInsights(
  kpis: ReturnType<typeof computeKPIs>,
  productPerf: ProductPerformance[],
  revenueByDay: DayRevenue[],
  revenueByHour: HourRevenue[],
  topClients: TopClient[],
): string[] {
  const insights: string[] = [];

  if (kpis.revenueChange > 5) {
    insights.push(`Tu as gagné ${Math.round(kpis.revenueChange)}% de plus que la période précédente`);
  } else if (kpis.revenueChange < -5) {
    insights.push(`Ton revenu a baissé de ${Math.abs(Math.round(kpis.revenueChange))}% par rapport à la période précédente`);
  }

  if (productPerf.length > 0 && productPerf[0].revenueShare > 0) {
    insights.push(`${productPerf[0].name} est ton produit le plus performant (${productPerf[0].revenueShare}% du CA)`);
  }

  const daysWithOrders = revenueByDay.filter((d) => d.orders > 0);
  if (daysWithOrders.length >= 2) {
    const bestDay = daysWithOrders.reduce((best, d) => (d.revenue > best.revenue ? d : best));
    insights.push(`Ton meilleur jour de vente est le ${bestDay.name}`);
  }

  const hoursWithOrders = revenueByHour.filter((h) => h.orders > 0);
  if (hoursWithOrders.length >= 2) {
    const bestHour = hoursWithOrders.reduce((best, h) => (h.revenue > best.revenue ? h : best));
    insights.push(`Tes ventes sont concentrées autour de ${bestHour.hour}`);
  }

  if (kpis.returningRate > 30) {
    insights.push(`${kpis.returningRate}% de tes clients reviennent — excellente rétention !`);
  }

  if (topClients.length > 0) {
    const topRevShare = kpis.totalRevenue > 0 ? Math.round((topClients[0].revenue / kpis.totalRevenue) * 100) : 0;
    if (topRevShare > 20) {
      insights.push(`${topClients[0].name} représente ${topRevShare}% de ton chiffre d'affaires`);
    }
  }

  if (kpis.avgOrderValue > 0) {
    insights.push(`Ton panier moyen est de ${kpis.avgOrderValue} €`);
  }

  return insights;
}

// ═══════════════════════════════════════
// MONTHLY GROWTH
// ═══════════════════════════════════════

export function computeMonthlyGrowth(orders: OrderRow[]): MonthlyGrowthPoint[] {
  const active = orders.filter(isRevenueOrder);
  const monthMap = new Map<string, { month: string; revenue: number; orders: number; clients: Set<string> }>();

  active.forEach((o) => {
    const key = o.created_at.slice(0, 7); // YYYY-MM
    const d = new Date(o.created_at);
    const entry = monthMap.get(key) || {
      month: d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }),
      revenue: 0,
      orders: 0,
      clients: new Set<string>(),
    };
    entry.revenue += num(o.amount);
    entry.orders += 1;
    if (o.client_id) entry.clients.add(o.client_id);
    monthMap.set(key, entry);
  });

  const sorted = [...monthMap.entries()].sort(([a], [b]) => a.localeCompare(b));
  return sorted.map(([, v], i) => {
    const prev = i > 0 ? sorted[i - 1][1] : null;
    return {
      month: v.month,
      revenue: Math.round(v.revenue * 100) / 100,
      orders: v.orders,
      clients: v.clients.size,
      revenueGrowth: prev && prev.revenue > 0 ? Math.round(((v.revenue - prev.revenue) / prev.revenue) * 100) : 0,
      orderGrowth: prev && prev.orders > 0 ? Math.round(((v.orders - prev.orders) / prev.orders) * 100) : 0,
    };
  });
}

// ═══════════════════════════════════════
// FORECAST (linear regression on last 6 months)
// ═══════════════════════════════════════

export function computeForecast(monthlyGrowth: MonthlyGrowthPoint[]): Forecast {
  const recent = monthlyGrowth.slice(-6);
  if (recent.length < 2) return { nextMonth: 0, trend: "stable", confidence: 0, avgGrowthRate: 0 };

  const values = recent.map((m) => m.revenue);
  const n = values.length;
  const sumX = (n * (n - 1)) / 2;
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = values.reduce((s, y, x) => s + x * y, 0);
  const sumX2 = Array.from({ length: n }, (_, i) => i * i).reduce((a, b) => a + b, 0);

  const denominator = n * sumX2 - sumX * sumX;
  if (denominator === 0) return { nextMonth: Math.round(sumY / n), trend: "stable", confidence: 30, avgGrowthRate: 0 };

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;
  const predicted = Math.round(Math.max(0, intercept + slope * n));

  const avgGrowth = recent[0].revenue > 0
    ? ((recent[recent.length - 1].revenue - recent[0].revenue) / recent[0].revenue) * 100
    : 0;

  return {
    nextMonth: predicted,
    trend: slope > 50 ? "up" : slope < -50 ? "down" : "stable",
    confidence: Math.min(95, Math.max(30, recent.length * 15)),
    avgGrowthRate: Math.round(avgGrowth),
  };
}

// ═══════════════════════════════════════
// RECENT EVENTS
// ═══════════════════════════════════════

export function buildRecentEvents(orders: OrderRow[]): RecentEvent[] {
  return orders
    .slice(-15)
    .reverse()
    .map((o) => ({
      type: (o.status === "refunded" ? "refund" : "order") as "order" | "refund",
      amount: num(o.amount),
      clientName: o.clients?.name || "Client",
      date: o.created_at,
      status: o.status,
    }));
}
