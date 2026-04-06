"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTrack } from "@/lib/hooks/use-track";
import { usePreferences } from "@/lib/hooks/use-preferences";
import { motion, AnimatePresence } from "framer-motion";
import { useApi } from "@/lib/hooks/use-api";
import { ProductEvents } from "@/lib/product-events";
import BadgeStatus from "@/components/ui/BadgeStatus";
import PipelineSummaryCards from "@/components/ui/PipelineSummaryCards";
import { computeOrdersPipelineSummary } from "@/lib/business-metrics";
import type { OrderStatus } from "@/types";
import type {
  CalendarDaySummary,
  DashboardCalendarMonthData,
  TodayItem,
  DashboardTodayData,
  RevenueMonthPoint,
  DashboardRevenueData,
} from "@/lib/dashboard/types";
import WorkloadSnapshot from "@/components/dashboard/WorkloadSnapshot";
import { GraduationCap, ArrowRight, Sparkles } from "lucide-react";
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  ClipboardList,
  UserPlus,
  Package,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  ChevronRight,
  ChevronLeft,
  ListTodo,
  Activity,
  CalendarDays,
  Receipt,
  Zap,
} from "lucide-react";

// ═══════════════════════════════════════
// TYPES
// ═══════════════════════════════════════
interface DashboardData {
  pipelineSummary: import("@/lib/business-metrics").PipelineSummary;
  totalRevenue: number;
  monthRevenue: number;
  todayRevenue: number;
  revenueChange: number;
  ordersCount: number;
  activeOrdersCount: number;
  pendingOrders: number;
  inProgressOrders: number;
  deliveredOrders: number;
  paidOrders: number;
  clientsCount: number;
  newClientsThisMonth: number;
  activeProductsCount: number;
  revenueData: DashboardRevenueData;
  todayData: DashboardTodayData;
  calendarData: DashboardCalendarMonthData;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recentOrders: any[];
  overdueOrders: number;
  upcomingDeadlines: { id: string; title: string; deadline: string; status: string; clientName: string | null; isToday: boolean; isOverdue: boolean }[];
}

// ═══════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════
function fmtEur(n: number): string {
  if (n >= 10000) return `${(n / 1000).toFixed(1)}k €`;
  return `${n.toLocaleString("fr-FR")} €`;
}

/** Count total events in the current week (Mon–Sun) from calendarData */
function countWeekEvents(calendarData: DashboardCalendarMonthData): number {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  let total = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const day = calendarData.days[key];
    if (day) total += day.totalCount;
  }
  return total;
}

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: "easeOut" as const, delay },
});

// ═══════════════════════════════════════
// SPARKLINE (mini chart SVG)
// ═══════════════════════════════════════
function Sparkline({ data, color = "#4F46E5", h = 28, w = 64 }: { data: number[]; color?: string; h?: number; w?: number }) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 4) - 2}`).join(" ");
  return (
    <svg width={w} height={h} className="flex-shrink-0 opacity-60">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ═══════════════════════════════════════
// CREATE MENU
// ═══════════════════════════════════════
function CreateMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const items = [
    { label: "Nouvelle commande", href: "/commandes", icon: ClipboardList },
    { label: "Nouveau client", href: "/clients", icon: UserPlus },
    { label: "Nouvelle offre", href: "/produits", icon: Package },
    { label: "Nouvelle tâche", href: "/taches", icon: ListTodo },
    { label: "Nouvelle facture", href: "/facturation", icon: FileText },
  ];
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1.5 px-3.5 py-2 bg-[#4F46E5] text-white text-[13px] font-medium rounded-lg hover:bg-[#4338CA] transition-all cursor-pointer shadow-sm">
        <Plus size={15} strokeWidth={2} />
        Créer
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div className="absolute right-0 top-full mt-2 bg-white border border-[#E6E6E4] rounded-xl shadow-lg p-1.5 z-50 min-w-[200px]" initial={{ opacity: 0, scale: 0.95, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -4 }} transition={{ duration: 0.15 }}>
            {items.map((item) => (
              <a key={item.label} href={item.href} className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-[#444] hover:bg-[#F7F7F5] rounded-lg transition-colors" onClick={() => setOpen(false)}>
                <item.icon size={15} strokeWidth={1.7} className="text-[#999]" />
                {item.label}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════
// KPI CARD
// ═══════════════════════════════════════
function KpiCard({ label, value, sub, change, icon: Icon, sparkData, color, delay }: {
  label: string; value: string; sub?: string; change?: number; icon: React.ElementType;
  sparkData?: number[]; color: string; delay: number;
}) {
  const pos = (change ?? 0) >= 0;
  return (
    <motion.div className="bg-white rounded-xl border border-[#E6E6E4] p-4 hover:shadow-sm transition-all" {...fadeUp(delay)}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={15} strokeWidth={1.8} />
        </div>
        {sparkData && sparkData.length > 1 && <Sparkline data={sparkData} color={pos ? "#10B981" : "#EF4444"} />}
      </div>
      <div className="text-[11px] font-medium text-[#AAA] uppercase tracking-wider mb-0.5">{label}</div>
      <div className="text-[20px] font-bold text-[#191919] leading-tight">{value}</div>
      <div className="flex items-center gap-2 mt-1">
        {change !== undefined && change !== 0 && (
          <span className={`flex items-center gap-0.5 text-[10px] font-semibold ${pos ? "text-emerald-600" : "text-red-500"}`}>
            {pos ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
            {pos ? "+" : ""}{change}%
          </span>
        )}
        {sub && <span className="text-[10px] text-[#BBB]">{sub}</span>}
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════
// CARD WRAPPER
// ═══════════════════════════════════════
function Card({ title, action, children, delay = 0, className = "" }: {
  title: string; action?: { label: string; href: string }; children: React.ReactNode; delay?: number; className?: string;
}) {
  return (
    <motion.div className={`bg-white rounded-xl border border-[#E6E6E4] overflow-hidden flex flex-col ${className}`} {...fadeUp(delay)}>
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#F0F0EE]">
        <h2 className="text-[13px] font-semibold text-[#191919]">{title}</h2>
        {action && (
          <a href={action.href} className="flex items-center gap-0.5 text-[11px] font-medium text-[#4F46E5] hover:underline">
            {action.label} <ChevronRight size={12} />
          </a>
        )}
      </div>
      <div className="flex-1">{children}</div>
    </motion.div>
  );
}

// ═══════════════════════════════════════
// EMPTY BLOCK
// ═══════════════════════════════════════
function Empty({ message, icon: Icon, action }: { message: string; icon: React.ElementType; action?: { label: string; href: string } }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[120px] max-h-[180px] px-4 text-center">
      <div className="w-9 h-9 rounded-xl bg-[#F7F7F5] flex items-center justify-center mb-2">
        <Icon size={16} className="text-[#CCC]" />
      </div>
      <p className="text-[12px] text-[#999] mb-2">{message}</p>
      {action && (
        <a href={action.href} className="px-3 py-1.5 bg-[#4F46E5] text-white text-[11px] font-medium rounded-lg hover:bg-[#4338CA] transition-all">
          {action.label}
        </a>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// MINI CALENDAR (enriched heatmap)
// ═══════════════════════════════════════
const DOT_COLORS: Record<string, string> = {
  task: "bg-violet-500",
  deadline: "bg-amber-500",
  order: "bg-emerald-500",
  event: "bg-blue-500",
  payment: "bg-green-500",
};

function MiniCalendar({ calendarData }: { calendarData: DashboardCalendarMonthData }) {
  const now = new Date();
  const [month, setMonth] = useState(calendarData.month);
  const [year, setYear] = useState(calendarData.year);

  const todayStr = now.toISOString().slice(0, 10);

  const { dayNums, firstDayOfWeek, monthLabel } = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const firstDayOfWeek = firstDay === 0 ? 6 : firstDay - 1;
    const dayNums = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const monthLabel = new Date(year, month).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    return { dayNums, firstDayOfWeek, monthLabel };
  }, [month, year]);

  const prev = () => { if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1); };
  const next = () => { if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1); };

  // Only use calendar data if it matches current view month
  const days = (month === calendarData.month && year === calendarData.year) ? calendarData.days : {};

  return (
    <div>
      <div className="flex items-center justify-between mb-3 px-1">
        <button onClick={prev} className="p-1 hover:bg-[#F7F7F5] rounded-md cursor-pointer"><ChevronLeft size={14} className="text-[#999]" /></button>
        <span className="text-[12px] font-semibold text-[#191919] capitalize">{monthLabel}</span>
        <button onClick={next} className="p-1 hover:bg-[#F7F7F5] rounded-md cursor-pointer"><ChevronRight size={14} className="text-[#999]" /></button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
          <div key={i} className="text-center text-[9px] font-semibold text-[#CCC] uppercase py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e-${i}`} />)}
        {dayNums.map((day) => {
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isToday = dateStr === todayStr;
          const info: CalendarDaySummary | undefined = days[dateStr];
          const hasAny = info?.hasAny ?? false;
          const hasUrgent = info?.hasUrgent ?? false;

          // Build dot colors for types present this day
          const dotColors: string[] = [];
          if (info) {
            if (info.tasksCount > 0) dotColors.push(DOT_COLORS.task);
            if (info.deadlinesCount > 0) dotColors.push(DOT_COLORS.deadline);
            if (info.ordersCount > 0) dotColors.push(DOT_COLORS.order);
            if (info.eventsCount > 0) dotColors.push(DOT_COLORS.event);
            if (info.paymentsCount > 0) dotColors.push(DOT_COLORS.payment);
          }

          // Tooltip text
          const tooltipParts: string[] = [];
          if (info) {
            if (info.ordersCount > 0) tooltipParts.push(`${info.ordersCount} cmd`);
            if (info.tasksCount > 0) tooltipParts.push(`${info.tasksCount} tâche${info.tasksCount > 1 ? "s" : ""}`);
            if (info.deadlinesCount > 0) tooltipParts.push(`${info.deadlinesCount} échéance${info.deadlinesCount > 1 ? "s" : ""}`);
            if (info.eventsCount > 0) tooltipParts.push(`${info.eventsCount} evt`);
            if (info.paymentsCount > 0) tooltipParts.push(`${info.paymentsCount} paiement${info.paymentsCount > 1 ? "s" : ""}`);
          }

          // Intensity ring for heavy days (4+ items)
          const isHeavy = (info?.totalCount ?? 0) >= 4;

          return (
            <a
              key={day}
              href={`/calendrier?date=${dateStr}`}
              className="flex flex-col items-center py-0.5 group relative cursor-pointer"
            >
              <div className={`w-7 h-7 flex items-center justify-center rounded-full text-[11px] font-medium transition-all ${
                isToday
                  ? "bg-[#4F46E5] text-white shadow-sm"
                  : hasUrgent
                    ? "text-red-600 font-bold"
                    : hasAny
                      ? "text-[#191919] font-semibold hover:bg-[#F0EEFF]"
                      : "text-[#BBB] hover:text-[#999]"
              } ${isHeavy && !isToday ? "ring-1 ring-violet-200" : ""}`}>
                {day}
              </div>
              {/* Typed dots */}
              {dotColors.length > 0 && (
                <div className="flex items-center gap-[2px] mt-[1px] h-[5px]">
                  {dotColors.slice(0, 4).map((c, i) => (
                    <div key={i} className={`w-[3.5px] h-[3.5px] rounded-full ${isToday ? "bg-white/70" : c}`} />
                  ))}
                  {(info?.totalCount ?? 0) > 4 && (
                    <span className={`text-[7px] font-bold leading-none ${isToday ? "text-white/70" : "text-[#999]"}`}>+</span>
                  )}
                </div>
              )}
              {/* Hover tooltip */}
              {hasAny && (
                <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-[#191919] text-white text-[9px] px-2 py-1 rounded-md whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg">
                  {tooltipParts.join(" · ")}
                  {hasUrgent && <span className="text-red-300 ml-1">⚡</span>}
                </div>
              )}
            </a>
          );
        })}
      </div>
      {/* Legend */}
      <div className="flex items-center gap-3 mt-3 px-1 pt-2 border-t border-[#F5F5F3]">
        {[
          { label: "Tâches", color: "bg-violet-500" },
          { label: "Échéances", color: "bg-amber-500" },
          { label: "Commandes", color: "bg-emerald-500" },
          { label: "Événements", color: "bg-blue-500" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1">
            <div className={`w-[5px] h-[5px] rounded-full ${item.color}`} />
            <span className="text-[8px] text-[#BBB]">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// TODAY WIDGET (real aggregation)
// ═══════════════════════════════════════
const TODAY_TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bgColor: string; label: string }> = {
  task: { icon: CheckCircle2, color: "text-violet-600", bgColor: "bg-violet-50", label: "Tâche" },
  order: { icon: ShoppingCart, color: "text-emerald-600", bgColor: "bg-emerald-50", label: "Commande" },
  deadline: { icon: Clock, color: "text-amber-600", bgColor: "bg-amber-50", label: "Échéance" },
  event: { icon: CalendarDays, color: "text-blue-600", bgColor: "bg-blue-50", label: "Événement" },
  invoice: { icon: Receipt, color: "text-orange-600", bgColor: "bg-orange-50", label: "Facture" },
};

function TodayItemRow({ item }: { item: TodayItem }) {
  const config = TODAY_TYPE_CONFIG[item.type] || TODAY_TYPE_CONFIG.task;
  const Icon = config.icon;

  const href = item.type === "task" ? "/taches"
    : item.type === "event" ? "/calendrier"
    : item.type === "invoice" ? "/facturation"
    : "/commandes";

  return (
    <a href={href} className="flex items-center gap-3 px-5 py-2.5 hover:bg-[#FBFBFA] transition-colors">
      <div className={`w-6 h-6 rounded-md flex items-center justify-center ${item.isOverdue ? "bg-red-50" : config.bgColor}`}>
        <Icon size={12} className={item.isOverdue ? "text-red-500" : config.color} />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[12px] text-[#191919] block truncate">{item.title}</span>
        <span className="text-[10px] text-[#BBB]">
          {item.clientName ? `${item.clientName} · ` : ""}
          {item.subtitle || config.label}
          {item.timeLabel ? ` · ${item.timeLabel}` : ""}
        </span>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {item.amount != null && item.amount > 0 && (
          <span className="text-[11px] font-semibold text-emerald-600">{item.amount} €</span>
        )}
        {item.isOverdue && (
          <span className="text-[9px] font-bold uppercase text-red-500 bg-red-50 px-1.5 py-0.5 rounded">En retard</span>
        )}
        {!item.isOverdue && item.priority === "urgent" && (
          <span className="text-[9px] font-bold uppercase text-red-500 bg-red-50 px-1.5 py-0.5 rounded">Urgent</span>
        )}
        {!item.isOverdue && item.status && !["urgent"].includes(item.priority || "") && (
          <BadgeStatus status={item.status as OrderStatus} />
        )}
      </div>
    </a>
  );
}

function TodayWidget({ todayData }: { todayData: DashboardTodayData }) {
  if (!todayData.hasAny) {
    return <Empty message="Rien de prévu aujourd'hui" icon={Calendar} />;
  }

  return (
    <div className="divide-y divide-[#F5F5F3]">
      {/* Overdue items first */}
      {todayData.overdueItems.length > 0 && (
        <div>
          <div className="px-5 py-1.5 bg-red-50/50">
            <span className="text-[10px] font-semibold text-red-500 uppercase tracking-wider flex items-center gap-1">
              <Zap size={10} /> En retard ({todayData.overdueItems.length})
            </span>
          </div>
          {todayData.overdueItems.map((item) => (
            <TodayItemRow key={item.id} item={item} />
          ))}
        </div>
      )}
      {/* Today items */}
      {todayData.items.map((item) => (
        <TodayItemRow key={item.id} item={item} />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════
// REVENUE CHART (real data)
// ═══════════════════════════════════════
function RevenueChart({ revenueData }: { revenueData: DashboardRevenueData }) {
  const allZero = revenueData.series.every((m) => m.revenue === 0);

  if (allZero) {
    return <Empty message="Pas encore de revenu encaissé" icon={TrendingUp} />;
  }

  const series = revenueData.series;
  const maxRev = Math.max(...series.map((m) => m.revenue), 1);
  const W = 280;
  const H = 120;
  const PAD = 2;

  // Build SVG area + line path
  const points = series.map((m, i) => ({
    x: PAD + (i / Math.max(series.length - 1, 1)) * (W - PAD * 2),
    y: PAD + (1 - m.revenue / maxRev) * (H - PAD * 2 - 4) + 2,
  }));
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1].x},${H} L${points[0].x},${H} Z`;

  return (
    <div className="px-5 py-4 flex-1 flex flex-col">
      {/* Summary */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[22px] font-bold text-[#191919]">{fmtEur(revenueData.totalRevenue)}</span>
          <span className="text-[11px] text-[#8A8A88] ml-2">sur 6 mois</span>
        </div>
        {revenueData.changePercent !== 0 && (
          <span className={`flex items-center gap-1 text-[12px] font-semibold px-2.5 py-1 rounded-full ${revenueData.changePercent >= 0 ? "text-emerald-700 bg-emerald-50" : "text-red-600 bg-red-50"}`}>
            {revenueData.changePercent >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {revenueData.changePercent >= 0 ? "+" : ""}{revenueData.changePercent}%
          </span>
        )}
      </div>

      {/* Area chart SVG */}
      <div className="flex-1 min-h-[120px] relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.01" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#revGrad)" />
          <path d={linePath} fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {/* Dots */}
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="3" fill="white" stroke="#4F46E5" strokeWidth="1.5" className="opacity-0 hover:opacity-100 transition-opacity" />
          ))}
          {/* Last dot always visible */}
          <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="3.5" fill="#4F46E5" stroke="white" strokeWidth="2" />
        </svg>
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between mt-2">
        {series.map((m) => (
          <span key={m.monthKey} className="text-[10px] text-[#8A8A88] capitalize">{m.monthLabel}</span>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// SKELETON
// ═══════════════════════════════════════
function Sk({ className = "" }: { className?: string }) {
  return <div className={`bg-[#F7F7F5] rounded-xl animate-pulse ${className}`} />;
}

// ═══════════════════════════════════════
// MAIN DASHBOARD PAGE
// ═══════════════════════════════════════
/* ── Welcome Block — New user empty state ── */
function WelcomeBlock() {
  const [dismissed, setDismissed] = useState(false);
  const [guideCompleted, setGuideCompleted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("jestly_guide_v3");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.completedChapters?.length > 0) setGuideCompleted(true);
      }
    } catch {}
  }, []);

  if (dismissed || guideCompleted) return null;

  const handleStartGuide = () => {
    // Reset guide state and dismiss key so GuideLauncher picks it up
    localStorage.removeItem("jestly_guide_v3");
    localStorage.removeItem("jestly_guide_v3_launch_dismissed");
    window.location.reload();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-6 bg-white rounded-2xl border border-[#E6E6E4] overflow-hidden"
    >
      <div className="px-7 py-8 flex items-start gap-6">
        <div className="w-12 h-12 rounded-xl bg-[#EEF2FF] flex items-center justify-center flex-shrink-0 mt-0.5">
          <Sparkles size={24} className="text-[#4F46E5]" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-[18px] font-bold text-[#191919] mb-1.5">
            Bienvenue sur Jestly
          </h2>
          <p className="text-[14px] text-[#5A5A58] leading-relaxed mb-5">
            On va t&apos;aider à configurer ton espace et à lancer tes premières actions.
            Le guide interactif te montrera comment créer ton site, tes offres et gérer tes clients.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={handleStartGuide}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4F46E5] text-white text-[13px] font-semibold hover:bg-[#4338CA] active:scale-[0.98] transition-all cursor-pointer"
            >
              <GraduationCap size={15} />
              Commencer le guide
              <ArrowRight size={14} />
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="text-[13px] text-[#8A8A88] hover:text-[#5A5A58] transition-colors cursor-pointer"
            >
              Passer pour l&apos;instant
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { data, loading, error, mutate } = useApi<DashboardData>("/api/dashboard/stats");
  const track = useTrack();
  const router = useRouter();
  const { preferences, loading: prefsLoading } = usePreferences();

  // Redirect to preferred home page if not dashboard
  const [redirectChecked, setRedirectChecked] = useState(false);
  useEffect(() => {
    if (!prefsLoading && !redirectChecked) {
      setRedirectChecked(true);
      const page = preferences.defaultPage;
      if (page && page !== "dashboard" && ["commandes", "clients", "facturation", "taches", "calendrier", "analytics"].includes(page)) {
        router.replace(`/${page}`);
      }
    }
  }, [prefsLoading, preferences.defaultPage, redirectChecked, router]);

  // Track page view au montage
  useEffect(() => {
    ProductEvents.pageViewed("/dashboard");
    track("dashboard_page_viewed");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Loading ──
  if (loading) {
    return (
      <div className="max-w-[1100px] mx-auto">
        <Sk className="h-7 w-36 mb-1 rounded-lg" />
        <Sk className="h-4 w-52 mb-7 rounded-lg" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[0, 1, 2, 3].map((i) => <Sk key={i} className="h-[120px]" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
          <Sk className="h-[220px] lg:col-span-8" />
          <Sk className="h-[220px] lg:col-span-4" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
          <Sk className="h-[280px] lg:col-span-7" />
          <Sk className="h-[280px] lg:col-span-5" />
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className="max-w-[1100px] mx-auto py-16 text-center">
        <AlertTriangle size={32} className="text-red-400 mx-auto mb-3" />
        <p className="text-[14px] text-[#191919] font-medium mb-1">Erreur de chargement</p>
        <p className="text-[13px] text-[#999] mb-4">{error}</p>
        <button onClick={mutate} className="text-[13px] text-[#4F46E5] hover:underline cursor-pointer">Réessayer</button>
      </div>
    );
  }

  if (!data) return null;

  // Safe defaults — API may return partial data
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const raw = data as any;
  const safeData = {
    pipelineSummary: (raw.pipelineSummary ?? { totalRevenue: 0, totalCount: 0, inProgressRevenue: 0, inProgressCount: 0, readyRevenue: 0, readyCount: 0 }) as DashboardData["pipelineSummary"],
    revenueData: (raw.revenueData ?? { series: [], totalRevenue: 0, totalOrders: 0, avgOrder: 0 }) as DashboardData["revenueData"],
    calendarData: (raw.calendarData ?? { month: new Date().getMonth(), year: new Date().getFullYear(), days: {} }) as DashboardData["calendarData"],
    todayData: (raw.todayData ?? { totalCount: 0, events: [] }) as DashboardData["todayData"],
    recentOrders: (raw.recentOrders ?? []) as DashboardData["recentOrders"],
    upcomingDeadlines: (raw.upcomingDeadlines ?? []) as DashboardData["upcomingDeadlines"],
    pendingOrders: (raw.pendingOrders ?? 0) as number,
    inProgressOrders: (raw.inProgressOrders ?? 0) as number,
    overdueOrders: (raw.overdueOrders ?? 0) as number,
    clientsCount: (raw.clientsCount ?? 0) as number,
    totalRevenue: (raw.totalRevenue ?? 0) as number,
    monthRevenue: (raw.monthRevenue ?? 0) as number,
    todayRevenue: (raw.todayRevenue ?? 0) as number,
    revenueChange: (raw.revenueChange ?? 0) as number,
    ordersCount: (raw.ordersCount ?? 0) as number,
    activeOrdersCount: (raw.activeOrdersCount ?? 0) as number,
    deliveredOrders: (raw.deliveredOrders ?? 0) as number,
    paidOrders: (raw.paidOrders ?? 0) as number,
    newClientsThisMonth: (raw.newClientsThisMonth ?? 0) as number,
    activeProductsCount: (raw.activeProductsCount ?? 0) as number,
  };
  /* eslint-enable @typescript-eslint/no-explicit-any */
  const sparkRev = safeData.revenueData.series?.map((m) => m.revenue) ?? [];
  const sparkOrd = safeData.revenueData.series?.map((m) => m.ordersCount) ?? [];

  // Detect empty account (new user)
  const isEmptyAccount = safeData.ordersCount === 0 && safeData.clientsCount === 0 && safeData.activeProductsCount === 0;

  return (
    <div className="max-w-[1100px] mx-auto pb-10">

      {/* ════════════════════════ HEADER V2 ════════════════════════ */}
      <motion.div className="flex items-start justify-between mb-7" {...fadeUp(0)}>
        <div>
          <h1 className="text-[24px] font-bold text-[#191919] tracking-tight">
            {isEmptyAccount ? "Bienvenue sur Jestly" : "Dashboard"}
          </h1>
          <p className="text-[13px] text-[#8A8A88] mt-1">
            {isEmptyAccount
              ? "Configure ton espace pour démarrer"
              : new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <CreateMenu />
      </motion.div>

      {/* ════════════════════════ WELCOME BLOCK (new accounts) ════════════════════════ */}
      {isEmptyAccount && <WelcomeBlock />}

      {/* ════════════════════════ ALERT BANNER ════════════════════════ */}
      {safeData.overdueOrders > 0 && (
        <motion.a href="/commandes" className="flex items-center gap-2.5 mb-5 px-4 py-2.5 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100/50 transition-all" {...fadeUp(0)}>
          <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />
          <span className="text-[12px] font-semibold text-red-700">{safeData.overdueOrders} commande{data.overdueOrders > 1 ? "s" : ""} en retard</span>
          <ChevronRight size={13} className="text-red-400 ml-auto" />
        </motion.a>
      )}

      {/* ════════════════════════ ROW 1 — Pipeline Summary (source de vérité unique) ════════════════════════ */}
      <div className="mb-6">
        <PipelineSummaryCards summary={safeData.pipelineSummary} baseDelay={0.05} />
      </div>

      {/* ════════════════════════ WORKLOAD SNAPSHOT ════════════════════════ */}
      <div className="mb-6">
        <WorkloadSnapshot
          pendingOrders={safeData.pendingOrders}
          activeTasks={safeData.inProgressOrders}
          pendingInvoices={safeData.deliveredOrders}
          clientsCount={safeData.clientsCount}
          weekEvents={safeData.calendarData ? countWeekEvents(safeData.calendarData) : 0}
          overdueItems={safeData.overdueOrders}
        />
      </div>

      {/* ════════════════════════ ROW 2 — Aujourd'hui + Actions ════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6 items-stretch">
        {/* Aujourd'hui — 8 col */}
        <div className="lg:col-span-8 flex">
          <Card
            title={`Aujourd'hui${safeData.todayData.totalCount > 0 ? ` · ${safeData.todayData.totalCount} élément${safeData.todayData.totalCount > 1 ? "s" : ""}` : ""}`}
            action={{ label: "Calendrier", href: "/calendrier" }}
            delay={0.25}
            className="w-full"
          >
            <TodayWidget todayData={safeData.todayData} />
          </Card>
        </div>

        {/* Actions rapides — 4 col */}
        <div className="lg:col-span-4 flex">
          <motion.div className="bg-white rounded-xl border border-[#E6E6E4] p-4 flex flex-col w-full" {...fadeUp(0.3)}>
            <h2 className="text-[13px] font-semibold text-[#191919] mb-3">Actions rapides</h2>
            <div className="grid grid-cols-2 gap-2 flex-1 content-start">
              {[
                { label: "Commande", href: "/commandes", icon: ClipboardList, color: "bg-violet-50 text-violet-600" },
                { label: "Client", href: "/clients", icon: UserPlus, color: "bg-blue-50 text-blue-600" },
                { label: "Offre", href: "/produits", icon: Package, color: "bg-emerald-50 text-emerald-600" },
                { label: "Facture", href: "/facturation", icon: FileText, color: "bg-amber-50 text-amber-600" },
              ].map((item) => (
                <a key={item.label} href={item.href} className="flex flex-col items-center gap-1.5 py-3 rounded-xl border border-[#F0F0EE] hover:border-[#E0E0DE] hover:bg-[#FBFBFA] transition-all group">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.color} group-hover:scale-105 transition-transform`}>
                    <item.icon size={15} strokeWidth={1.7} />
                  </div>
                  <span className="text-[10px] font-medium text-[#777]">{item.label}</span>
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ════════════════════════ ROW 3 — Commandes + Revenus ════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6 items-stretch">
        {/* Commandes récentes — 7 col */}
        <div className="lg:col-span-7 flex">
          <Card title="Commandes récentes" action={{ label: "Tout voir", href: "/commandes" }} delay={0.35} className="w-full">
            {safeData.recentOrders.length === 0 ? (
              <Empty message="Aucune commande" icon={ShoppingCart} action={{ label: "Créer une commande", href: "/commandes" }} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#F0F0EE]">
                      <th className="text-left text-[10px] font-semibold text-[#BBB] uppercase tracking-wider px-4 py-2">Client</th>
                      <th className="text-left text-[10px] font-semibold text-[#BBB] uppercase tracking-wider px-4 py-2 hidden md:table-cell">Produit</th>
                      <th className="text-right text-[10px] font-semibold text-[#BBB] uppercase tracking-wider px-4 py-2">Prix</th>
                      <th className="text-left text-[10px] font-semibold text-[#BBB] uppercase tracking-wider px-4 py-2">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {safeData.recentOrders.slice(0, 6).map((o: { id: string; title: string; amount: number; status: string; created_at: string; clients?: { name: string } | null; products?: { name: string } | null }) => (
                      <tr key={o.id} className="border-b border-[#F8F8F6] last:border-b-0 hover:bg-[#FBFBFA] transition-colors">
                        <td className="px-4 py-2.5 text-[12px] font-medium text-[#191919] max-w-[140px] truncate">{o.clients?.name ?? "\u2014"}</td>
                        <td className="px-4 py-2.5 text-[12px] text-[#888] max-w-[140px] truncate hidden md:table-cell">{o.products?.name || o.title || "\u2014"}</td>
                        <td className="px-4 py-2.5 text-[12px] font-semibold text-[#191919] text-right">{Number(o.amount)} €</td>
                        <td className="px-4 py-2.5"><BadgeStatus status={o.status as OrderStatus} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Revenue chart — 5 col */}
        <div className="lg:col-span-5 flex">
          <Card title="Revenus encaissés" action={{ label: "Analytics", href: "/analytics" }} delay={0.4} className="w-full">
            <RevenueChart revenueData={safeData.revenueData} />
          </Card>
        </div>
      </div>

      {/* ════════════════════════ ROW 4 — Calendrier + Échéances ════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Mini calendrier — 5 col */}
        <div className="lg:col-span-5 flex">
          <motion.div className="bg-white rounded-xl border border-[#E6E6E4] p-4 w-full" {...fadeUp(0.45)}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[13px] font-semibold text-[#191919]">Calendrier</h2>
              <a href="/calendrier" className="flex items-center gap-0.5 text-[11px] font-medium text-[#4F46E5] hover:underline">
                Ouvrir <ChevronRight size={12} />
              </a>
            </div>
            {safeData.calendarData ? <MiniCalendar calendarData={safeData.calendarData} /> : <div className="text-center py-8 text-[12px] text-[#CCC]">Calendrier indisponible</div>}
          </motion.div>
        </div>

        {/* Échéances à venir — 7 col */}
        <div className="lg:col-span-7 flex">
          <Card title="Échéances à venir" action={{ label: "Commandes", href: "/commandes" }} delay={0.5} className="w-full">
            {!safeData.upcomingDeadlines || safeData.upcomingDeadlines.length === 0 ? (
              <Empty message="Aucune échéance prochaine" icon={Clock} />
            ) : (
              <div className="divide-y divide-[#F5F5F3]">
                {(safeData.upcomingDeadlines || []).slice(0, 6).map((d) => {
                  const dateObj = new Date(d.deadline + "T00:00:00");
                  const now = new Date();
                  const diffDays = Math.ceil((dateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                  const dayLabel = dateObj.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
                  const urgencyLabel = d.isOverdue
                    ? "En retard"
                    : d.isToday
                      ? "Aujourd'hui"
                      : diffDays === 1
                        ? "Demain"
                        : diffDays <= 7
                          ? `Dans ${diffDays}j`
                          : dayLabel;

                  return (
                    <a key={d.id} href="/commandes" className="flex items-center gap-3 px-5 py-3 hover:bg-[#FBFBFA] transition-colors group">
                      {/* Urgency indicator */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        d.isOverdue ? "bg-red-50 border border-red-100" : d.isToday ? "bg-amber-50 border border-amber-100" : "bg-[#F7F7F5] border border-[#EFEFEF]"
                      }`}>
                        {d.isOverdue ? (
                          <AlertTriangle size={14} className="text-red-500" />
                        ) : (
                          <Clock size={14} className={d.isToday ? "text-amber-600" : "text-[#999]"} />
                        )}
                      </div>
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <span className="text-[13px] font-medium text-[#191919] block truncate">{d.title}</span>
                        <span className="text-[11px] text-[#8A8A88]">
                          {d.clientName ? `${d.clientName} · ` : ""}{dayLabel}
                        </span>
                      </div>
                      {/* Urgency badge */}
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                        d.isOverdue
                          ? "text-red-700 bg-red-50 border border-red-100"
                          : d.isToday
                            ? "text-amber-700 bg-amber-50 border border-amber-100"
                            : diffDays <= 3
                              ? "text-orange-600 bg-orange-50 border border-orange-100"
                              : "text-[#8A8A88] bg-[#F7F7F5] border border-[#EFEFEF]"
                      }`}>
                        {urgencyLabel}
                      </span>
                      <BadgeStatus status={d.status as OrderStatus} />
                    </a>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* ════════════════════════ ROW 5 — Stats rapides V2 ════════════════════════ */}
      <motion.div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3" {...fadeUp(0.55)}>
        {[
          { label: "CA total", value: fmtEur(safeData.pipelineSummary.totalRevenue), icon: DollarSign, color: "bg-emerald-50 text-emerald-600" },
          { label: "Commandes totales", value: String(safeData.pipelineSummary.totalCount), icon: ShoppingCart, color: "bg-violet-50 text-violet-600" },
          { label: "Produits actifs", value: String(safeData.activeProductsCount), icon: Package, color: "bg-blue-50 text-blue-600" },
          { label: "Taux complétion", value: safeData.ordersCount > 0 ? `${Math.round((safeData.paidOrders / safeData.ordersCount) * 100)}%` : "\u2014", icon: CheckCircle2, color: "bg-amber-50 text-amber-600" },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-xl border border-[#E6E6E4] px-4 py-3 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.color}`}>
              <item.icon size={15} strokeWidth={1.8} />
            </div>
            <div>
              <div className="text-[10px] font-medium text-[#8A8A88] uppercase tracking-wider">{item.label}</div>
              <div className="text-[16px] font-bold text-[#191919] leading-tight">{item.value}</div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
