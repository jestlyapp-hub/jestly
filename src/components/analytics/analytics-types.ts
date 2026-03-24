import type { PipelineSummary } from "@/lib/business-metrics";

// ── Types ──
export interface AnalyticsData {
  pipelineSummary: PipelineSummary;
  kpis: {
    totalRevenue: number;
    revenueChange: number;
    netProfit: number;
    profitChange: number;
    totalOrders: number;
    ordersChange: number;
    conversionRate: number;
    conversionChange: number;
    avgOrderValue: number;
    aovChange: number;
    returningRate: number;
    refundRate: number;
    activeClients: number;
    clientsChange: number;
  };
  timeSeries: TimePoint[];
  prevTimeSeries: TimePoint[];
  productPerformance: ProductPerf[];
  productsLinked: boolean;
  topClients: TopClient[];
  revenueByDay: { name: string; revenue: number; orders: number }[];
  revenueByHour: { hour: string; revenue: number; orders: number }[];
  customerAnalytics: {
    newCustomers: number;
    newCustomersChange: number;
    returningCustomers: number;
    segments: { segment: string; count: number; revenue: number }[];
  };
  paymentMethods: { method: string; count: number; revenue: number }[];
  monthlyGrowth: MonthlyGrowth[];
  bestMonth: { month: string; revenue: number } | null;
  worstMonth: { month: string; revenue: number } | null;
  forecast: { nextMonth: number; trend: string; confidence: number; avgGrowthRate?: number };
  profitBreakdown: { revenue: number; fees: number; refunds: number; netProfit: number };
  recentEvents: RecentEvent[];
  insights: string[];
  funnel: { pageViews: number; productViews: number; checkoutsStarted: number; ordersCompleted: number; hasRealData: boolean };
  hasPreviousPeriod: boolean;
}
export interface TimePoint { label: string; revenue: number; orders: number; profit: number }
export interface ProductPerf { name: string; revenue: number; orders: number; refunds: number; avgPrice: number; refundRate: number; conversionRate: number; revenueShare: number }
export interface TopClient { name: string; email: string; revenue: number; orders: number; lastPurchase: string }
export interface MonthlyGrowth { month: string; revenue: number; orders: number; clients: number; revenueGrowth: number; orderGrowth: number }
export interface RecentEvent { type: string; amount: number; clientName: string; date: string; status: string }

// ── Constants ──
export const RANGES = [
  { key: "today", label: "Aujourd'hui" },
  { key: "7d", label: "7 jours" },
  { key: "30d", label: "30 jours" },
  { key: "90d", label: "90 jours" },
  { key: "12m", label: "12 mois" },
  { key: "all", label: "Tout" },
] as const;

export const CHART_COLORS = {
  primary: "#4F46E5",
  primaryLight: "#818CF8",
  secondary: "#10B981",
  tertiary: "#F59E0B",
  quaternary: "#EF4444",
  purple: "#8B5CF6",
  pink: "#EC4899",
  cyan: "#06B6D4",
};

export const PIE_COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

export const TOOLTIP_STYLE = {
  background: "#fff",
  border: "1px solid #E6E6E4",
  borderRadius: "10px",
  fontSize: "12px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
  padding: "10px 14px",
};

export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const, delay: i * 0.05 },
  }),
};

// ── Helpers ──
export function fmt(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toLocaleString("fr-FR");
}
export function fmtEur(n: number): string { return `${fmt(n)} €`; }
export function fmtPct(n: number): string { return `${n > 0 ? "+" : ""}${Math.round(n)}%`; }
export function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}
