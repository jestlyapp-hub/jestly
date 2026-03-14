// ═══════════════════════════════════════
// Dashboard — Shared types
// ═══════════════════════════════════════

// ── Calendar ──
export type CalendarDaySummary = {
  date: string;
  isToday: boolean;
  tasksCount: number;
  deadlinesCount: number;
  ordersCount: number;
  eventsCount: number;
  paymentsCount: number;
  totalCount: number;
  hasAny: boolean;
  dominantType: "task" | "deadline" | "order" | "event" | "payment" | null;
  hasUrgent: boolean;
};

export type DashboardCalendarMonthData = {
  month: number;
  year: number;
  days: Record<string, CalendarDaySummary>;
};

// ── Today ──
export type TodayItem = {
  id: string;
  type: "task" | "order" | "deadline" | "event" | "invoice";
  title: string;
  subtitle?: string;
  clientName?: string | null;
  date: string;
  timeLabel?: string | null;
  status?: string | null;
  priority?: "low" | "medium" | "high" | "urgent" | null;
  isOverdue: boolean;
  amount?: number | null;
};

export type DashboardTodayData = {
  date: string;
  items: TodayItem[];
  overdueItems: TodayItem[];
  totalCount: number;
  hasAny: boolean;
};

// ── Revenue ──
export type RevenueMonthPoint = {
  monthKey: string;
  monthLabel: string;
  revenue: number;
  ordersCount: number;
  paidOrdersCount: number;
};

export type DashboardRevenueData = {
  series: RevenueMonthPoint[];
  totalRevenue: number;
  currentMonthRevenue: number;
  previousMonthRevenue: number;
  changePercent: number;
};
