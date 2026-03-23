// ── Analytics Domain Types ──
// Source de vérité pour toutes les définitions métier analytics

/** Statuts de commande comptés comme "revenu réalisé" (aligné sur business-metrics.ts) */
export const REVENUE_STATUSES = ["paid", "invoiced", "delivered"] as const;

/** Statuts exclus des analytics — ne génèrent pas de revenu (aligné sur business-metrics.ts) */
export const EXCLUDED_STATUSES = ["cancelled", "refunded", "dispute"] as const;

/** Statuts considérés comme "commande complétée" pour le taux de conversion */
export const COMPLETED_STATUSES = ["paid", "delivered", "invoiced"] as const;

// ── API Response Types ──

export interface AnalyticsKPIs {
  totalRevenue: number;       // Somme amount des orders non-cancelled/non-refunded (en €)
  revenueChange: number;      // % vs période précédente
  netProfit: number;          // Revenue - remboursements
  profitChange: number;       // % vs période précédente
  totalOrders: number;        // Nombre commandes valides (excl. cancelled)
  ordersChange: number;       // % vs période précédente
  conversionRate: number;     // % commandes complétées / total commandes
  conversionChange: number;   // Différence en points vs période précédente
  avgOrderValue: number;      // Revenue / orders
  aovChange: number;          // % vs période précédente
  returningRate: number;      // % clients avec 2+ commandes
  refundRate: number;         // % commandes remboursées
  activeClients: number;      // Clients distincts avec commande sur la période
  clientsChange: number;      // % vs période précédente
}

export interface TimeSeriesPoint {
  label: string;
  revenue: number;
  orders: number;
  profit: number;
}

export interface ProductPerformance {
  name: string;
  revenue: number;
  orders: number;
  refunds: number;
  avgPrice: number;
  refundRate: number;
  revenueShare: number;
}

export interface TopClient {
  name: string;
  email: string;
  revenue: number;
  orders: number;
  lastPurchase: string;
}

export interface DayRevenue {
  name: string;
  revenue: number;
  orders: number;
}

export interface HourRevenue {
  hour: string;
  revenue: number;
  orders: number;
}

export interface CustomerSegment {
  segment: string;
  count: number;
  revenue: number;
}

export interface MonthlyGrowthPoint {
  month: string;
  revenue: number;
  orders: number;
  clients: number;
  revenueGrowth: number;
  orderGrowth: number;
}

export interface Forecast {
  nextMonth: number;
  trend: "up" | "down" | "stable";
  confidence: number;
  avgGrowthRate: number;
}

export interface ProfitBreakdown {
  revenue: number;
  fees: number;
  refunds: number;
  netProfit: number;
}

export interface RecentEvent {
  type: "order" | "refund";
  amount: number;
  clientName: string;
  date: string;
  status: string;
}

export interface PaymentMethodStat {
  method: string;
  count: number;
  revenue: number;
}

export interface AnalyticsResponse {
  kpis: AnalyticsKPIs;
  timeSeries: TimeSeriesPoint[];
  prevTimeSeries: TimeSeriesPoint[];
  productPerformance: ProductPerformance[];
  topClients: TopClient[];
  revenueByDay: DayRevenue[];
  revenueByHour: HourRevenue[];
  customerAnalytics: {
    newCustomers: number;
    newCustomersChange: number;
    returningCustomers: number;
    segments: CustomerSegment[];
  };
  paymentMethods: PaymentMethodStat[];
  insights: string[];
  monthlyGrowth: MonthlyGrowthPoint[];
  bestMonth: { month: string; revenue: number } | null;
  worstMonth: { month: string; revenue: number } | null;
  forecast: Forecast;
  profitBreakdown: ProfitBreakdown;
  recentEvents: RecentEvent[];
  _debug?: DebugInfo;
}

/** Debug info — only returned when DEBUG query param is set */
export interface DebugInfo {
  userId: string;
  ordersFound: number;
  prevOrdersFound: number;
  clientsFound: number;
  productsFound: number;
  billingItemsFound: number;
  dateRange: { start: string; end: string };
  prevDateRange: { start: string; end: string };
  statusBreakdown: Record<string, number>;
  sampleOrder: Record<string, unknown> | null;
}
