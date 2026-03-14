"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApi } from "@/lib/hooks/use-api";
import { ProductEvents } from "@/lib/product-events";
import BadgeStatus from "@/components/ui/BadgeStatus";
import type { OrderStatus } from "@/types";
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
} from "lucide-react";

// ═══════════════════════════════════════
// TYPES
// ═══════════════════════════════════════
interface CalDay { tasks: number; deadlines: number; orders: number; events: number }
interface TodayTask { id: string; type: "task"; title: string; priority: string; date: string; status: string; isOverdue: boolean }
interface TodayDeadline { id: string; type: "deadline"; title: string; status: string; clientName: string | null; date: string; isOverdue: boolean }
interface TodayNewOrder { id: string; type: "order"; title: string; amount: number; status: string; clientName: string | null }
interface ActiveWork { id: string; type: "active_work"; title: string; status: string; clientName: string | null }

interface DashboardData {
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
  monthlyRevenue: { month: string; revenue: number; orders: number }[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recentOrders: any[];
  todayTasks: TodayTask[];
  todayDeadlines: TodayDeadline[];
  todayNewOrders: TodayNewOrder[];
  activeWorkOrders: ActiveWork[];
  todayItemsCount: number;
  overdueOrders: number;
  upcomingDeadlines: { id: string; title: string; deadline: string; status: string; clientName: string | null; isToday: boolean; isOverdue: boolean }[];
  calendarDays: Record<string, CalDay>;
}

// ═══════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════
function fmtEur(n: number): string {
  if (n >= 10000) return `${(n / 1000).toFixed(1)}k €`;
  return `${n.toLocaleString("fr-FR")} €`;
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
    { label: "Nouveau produit", href: "/produits", icon: Package },
    { label: "Nouvelle tâche", href: "/taches", icon: ListTodo },
    { label: "Nouvelle facture", href: "/facturation", icon: FileText },
  ];
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1.5 px-3.5 py-2 bg-[#4F46E5] text-white text-[13px] font-medium rounded-lg hover:bg-[#4338CA] transition-all cursor-pointer shadow-sm">
        <Plus size={15} strokeWidth={2} />
        Créer
      </button>
      <AnimatePresence>
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
      <div className="text-[20px] font-bold text-[#1A1A1A] leading-tight">{value}</div>
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
        <h2 className="text-[13px] font-semibold text-[#1A1A1A]">{title}</h2>
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
// MINI CALENDAR
// ═══════════════════════════════════════
function MiniCalendar({ days: calDays }: { days: Record<string, CalDay> }) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());

  const { dayNums, firstDayOfWeek, monthLabel } = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const firstDayOfWeek = firstDay === 0 ? 6 : firstDay - 1;
    const dayNums = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const monthLabel = new Date(year, month).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    return { dayNums, firstDayOfWeek, monthLabel };
  }, [month, year]);

  const todayStr = now.toISOString().slice(0, 10);

  const prev = () => { if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1); };
  const next = () => { if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1); };

  return (
    <div>
      <div className="flex items-center justify-between mb-3 px-1">
        <button onClick={prev} className="p-1 hover:bg-[#F7F7F5] rounded-md cursor-pointer"><ChevronLeft size={14} className="text-[#999]" /></button>
        <span className="text-[12px] font-semibold text-[#1A1A1A] capitalize">{monthLabel}</span>
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
          const info = calDays[dateStr];
          const hasAny = info && (info.tasks + info.deadlines + info.orders + info.events) > 0;

          // Determine dot colors based on what types exist on this day
          const dotColors: string[] = [];
          if (info) {
            if (info.tasks > 0) dotColors.push("bg-violet-500");
            if (info.deadlines > 0) dotColors.push("bg-amber-500");
            if (info.orders > 0) dotColors.push("bg-emerald-500");
            if (info.events > 0) dotColors.push("bg-blue-500");
          }

          return (
            <div key={day} className="flex flex-col items-center py-0.5 group relative">
              <div className={`w-7 h-7 flex items-center justify-center rounded-full text-[11px] font-medium transition-colors ${
                isToday
                  ? "bg-[#4F46E5] text-white"
                  : hasAny
                    ? "text-[#1A1A1A] font-semibold"
                    : "text-[#BBB]"
              }`}>
                {day}
              </div>
              {/* Typed dots */}
              {dotColors.length > 0 && (
                <div className="flex items-center gap-[2px] mt-[2px] h-[5px]">
                  {dotColors.slice(0, 3).map((c, i) => (
                    <div key={i} className={`w-[4px] h-[4px] rounded-full ${isToday ? "bg-white/60" : c}`} />
                  ))}
                </div>
              )}
              {/* Hover tooltip */}
              {hasAny && info && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1A1A1A] text-white text-[9px] px-2 py-1 rounded-md whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                  {[
                    info.orders > 0 && `${info.orders} cmd`,
                    info.tasks > 0 && `${info.tasks} tâche${info.tasks > 1 ? "s" : ""}`,
                    info.deadlines > 0 && `${info.deadlines} deadline${info.deadlines > 1 ? "s" : ""}`,
                    info.events > 0 && `${info.events} evt`,
                  ].filter(Boolean).join(" · ")}
                </div>
              )}
            </div>
          );
        })}
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
export default function DashboardPage() {
  const { data, loading, error, mutate } = useApi<DashboardData>("/api/dashboard/stats");

  // Track la vue du dashboard
  useEffect(() => { ProductEvents.pageViewed("/dashboard"); }, []);

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
        <p className="text-[14px] text-[#1A1A1A] font-medium mb-1">Erreur de chargement</p>
        <p className="text-[13px] text-[#999] mb-4">{error}</p>
        <button onClick={mutate} className="text-[13px] text-[#4F46E5] hover:underline cursor-pointer">Réessayer</button>
      </div>
    );
  }

  if (!data) return null;

  const sparkRev = data.monthlyRevenue.map((m) => m.revenue);
  const sparkOrd = data.monthlyRevenue.map((m) => m.orders);

  return (
    <div className="max-w-[1100px] mx-auto pb-10">

      {/* ════════════════════════ HEADER ════════════════════════ */}
      <motion.div className="flex items-start justify-between mb-6" {...fadeUp(0)}>
        <div>
          <h1 className="text-[22px] font-bold text-[#1A1A1A]">Dashboard</h1>
          <p className="text-[13px] text-[#999] mt-0.5">Aperçu de ton activité</p>
        </div>
        <CreateMenu />
      </motion.div>

      {/* ════════════════════════ ALERT BANNER ════════════════════════ */}
      {data.overdueOrders > 0 && (
        <motion.a href="/commandes" className="flex items-center gap-2.5 mb-5 px-4 py-2.5 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100/50 transition-all" {...fadeUp(0)}>
          <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />
          <span className="text-[12px] font-semibold text-red-700">{data.overdueOrders} commande{data.overdueOrders > 1 ? "s" : ""} en retard</span>
          <ChevronRight size={13} className="text-red-400 ml-auto" />
        </motion.a>
      )}

      {/* ════════════════════════ ROW 1 — KPIs ════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Revenu ce mois" value={fmtEur(data.monthRevenue)} change={data.revenueChange} sub={data.todayRevenue > 0 ? `${fmtEur(data.todayRevenue)} aujourd'hui` : "vs mois dernier"} icon={DollarSign} sparkData={sparkRev} color="bg-emerald-50 text-emerald-600" delay={0.05} />
        <KpiCard label="Commandes" value={String(data.activeOrdersCount)} sub={`${data.pendingOrders} en attente`} icon={ShoppingCart} sparkData={sparkOrd} color="bg-violet-50 text-violet-600" delay={0.1} />
        <KpiCard label="Clients" value={String(data.clientsCount)} sub={data.newClientsThisMonth > 0 ? `+${data.newClientsThisMonth} ce mois` : "total"} icon={Users} color="bg-blue-50 text-blue-600" delay={0.15} />
        <KpiCard label="Pipeline" value={`${data.inProgressOrders}`} sub={`${data.deliveredOrders} livrées · ${data.paidOrders} payées`} icon={TrendingUp} color="bg-amber-50 text-amber-600" delay={0.2} />
      </div>

      {/* ════════════════════════ ROW 2 — Aujourd'hui + Actions ════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6 items-stretch">
        {/* Aujourd'hui — 8 col */}
        <div className="lg:col-span-8 flex">
          <Card title="Aujourd'hui" action={{ label: "Calendrier", href: "/calendrier" }} delay={0.25} className="w-full">
            {!data.todayItemsCount ? (
              <Empty message="Rien de prévu aujourd'hui" icon={Calendar} />
            ) : (
              <div className="divide-y divide-[#F5F5F3]">
                {/* New orders today */}
                {(data.todayNewOrders || []).map((o) => (
                  <a key={o.id} href="/commandes" className="flex items-center gap-3 px-5 py-2.5 hover:bg-[#FBFBFA] transition-colors">
                    <div className="w-6 h-6 rounded-md bg-emerald-50 flex items-center justify-center"><ShoppingCart size={12} className="text-emerald-600" /></div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[12px] text-[#1A1A1A] block truncate">{o.title}</span>
                      {o.clientName && <span className="text-[10px] text-[#BBB]">{o.clientName}</span>}
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-600">{o.amount} €</span>
                  </a>
                ))}
                {/* Active work (in progress / in review) */}
                {(data.activeWorkOrders || []).map((o) => (
                  <a key={o.id} href="/commandes" className="flex items-center gap-3 px-5 py-2.5 hover:bg-[#FBFBFA] transition-colors">
                    <div className="w-6 h-6 rounded-md bg-violet-50 flex items-center justify-center"><Activity size={12} className="text-violet-600" /></div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[12px] text-[#1A1A1A] block truncate">{o.title}</span>
                      {o.clientName && <span className="text-[10px] text-[#BBB]">{o.clientName}</span>}
                    </div>
                    <BadgeStatus status={o.status as OrderStatus} />
                  </a>
                ))}
                {/* Tasks due today / overdue */}
                {(data.todayTasks || []).map((t) => (
                  <a key={t.id} href="/taches" className="flex items-center gap-3 px-5 py-2.5 hover:bg-[#FBFBFA] transition-colors">
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center ${t.isOverdue ? "bg-red-50" : "bg-blue-50"}`}>
                      <CheckCircle2 size={12} className={t.isOverdue ? "text-red-500" : "text-blue-600"} />
                    </div>
                    <span className="text-[12px] text-[#1A1A1A] flex-1 truncate">{t.title}</span>
                    {t.isOverdue && <span className="text-[9px] font-bold uppercase text-red-500 bg-red-50 px-1.5 py-0.5 rounded">En retard</span>}
                    {!t.isOverdue && t.priority === "urgent" && <span className="text-[9px] font-bold uppercase text-red-500 bg-red-50 px-1.5 py-0.5 rounded">Urgent</span>}
                  </a>
                ))}
                {/* Deadlines today / overdue */}
                {(data.todayDeadlines || []).map((d) => (
                  <a key={d.id} href="/commandes" className="flex items-center gap-3 px-5 py-2.5 hover:bg-[#FBFBFA] transition-colors">
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center ${d.isOverdue ? "bg-red-50" : "bg-amber-50"}`}>
                      <Clock size={12} className={d.isOverdue ? "text-red-500" : "text-amber-600"} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[12px] text-[#1A1A1A] block truncate">{d.title}</span>
                      {d.clientName && <span className="text-[10px] text-[#BBB]">{d.clientName}</span>}
                    </div>
                    {d.isOverdue && <span className="text-[9px] font-bold uppercase text-red-500 bg-red-50 px-1.5 py-0.5 rounded">En retard</span>}
                    {!d.isOverdue && <BadgeStatus status={d.status as OrderStatus} />}
                  </a>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Actions rapides — 4 col */}
        <div className="lg:col-span-4 flex">
          <motion.div className="bg-white rounded-xl border border-[#E6E6E4] p-4 flex flex-col w-full" {...fadeUp(0.3)}>
            <h2 className="text-[13px] font-semibold text-[#1A1A1A] mb-3">Actions rapides</h2>
            <div className="grid grid-cols-2 gap-2 flex-1 content-start">
              {[
                { label: "Commande", href: "/commandes", icon: ClipboardList, color: "bg-violet-50 text-violet-600" },
                { label: "Client", href: "/clients", icon: UserPlus, color: "bg-blue-50 text-blue-600" },
                { label: "Produit", href: "/produits", icon: Package, color: "bg-emerald-50 text-emerald-600" },
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
            {data.recentOrders.length === 0 ? (
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
                    {data.recentOrders.slice(0, 6).map((o: { id: string; title: string; amount: number; status: string; created_at: string; clients?: { name: string } | null; products?: { name: string } | null }) => (
                      <tr key={o.id} className="border-b border-[#F8F8F6] last:border-b-0 hover:bg-[#FBFBFA] transition-colors">
                        <td className="px-4 py-2.5 text-[12px] font-medium text-[#1A1A1A] max-w-[140px] truncate">{o.clients?.name ?? "\u2014"}</td>
                        <td className="px-4 py-2.5 text-[12px] text-[#888] max-w-[140px] truncate hidden md:table-cell">{o.products?.name || o.title || "\u2014"}</td>
                        <td className="px-4 py-2.5 text-[12px] font-semibold text-[#1A1A1A] text-right">{Number(o.amount)} €</td>
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
          <Card title="Revenus 6 mois" action={{ label: "Analytics", href: "/analytics" }} delay={0.4} className="w-full">
            <div className="px-4 py-3 flex-1 flex flex-col">
              {data.monthlyRevenue.every((m) => m.revenue === 0) ? (
                <Empty message="Pas encore de revenu" icon={TrendingUp} />
              ) : (
                <div className="flex items-end gap-1.5 flex-1 min-h-[100px]">
                  {data.monthlyRevenue.map((m, i) => {
                    const maxRev = Math.max(...data.monthlyRevenue.map((x) => x.revenue));
                    const h = maxRev > 0 ? (m.revenue / maxRev) * 100 : 0;
                    const isLast = i === data.monthlyRevenue.length - 1;
                    return (
                      <div key={m.month} className="flex-1 flex flex-col items-center gap-0.5">
                        <span className="text-[9px] font-semibold text-[#1A1A1A]">{m.revenue > 0 ? fmtEur(m.revenue) : ""}</span>
                        <motion.div
                          className={`w-full rounded-t-md ${isLast ? "bg-[#4F46E5]" : "bg-[#EDEAFF]"}`}
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.max(h, 3)}%` }}
                          transition={{ duration: 0.5, delay: 0.4 + i * 0.06 }}
                        />
                        <span className="text-[9px] text-[#BBB]">{m.month}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* ════════════════════════ ROW 4 — Calendrier + Échéances ════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Mini calendrier — 5 col */}
        <div className="lg:col-span-5 flex">
          <motion.div className="bg-white rounded-xl border border-[#E6E6E4] p-4 w-full" {...fadeUp(0.45)}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[13px] font-semibold text-[#1A1A1A]">Calendrier</h2>
              <a href="/calendrier" className="flex items-center gap-0.5 text-[11px] font-medium text-[#4F46E5] hover:underline">
                Ouvrir <ChevronRight size={12} />
              </a>
            </div>
            <MiniCalendar days={data.calendarDays || {}} />
          </motion.div>
        </div>

        {/* Échéances à venir — 7 col */}
        <div className="lg:col-span-7 flex">
          <Card title="Échéances à venir" action={{ label: "Commandes", href: "/commandes" }} delay={0.5} className="w-full">
            {!data.upcomingDeadlines || data.upcomingDeadlines.length === 0 ? (
              <Empty message="Aucune échéance prochaine" icon={Clock} />
            ) : (
              <div className="divide-y divide-[#F5F5F3]">
                {(data.upcomingDeadlines || []).map((d) => {
                  const dateObj = new Date(d.deadline + "T00:00:00");
                  const dayLabel = dateObj.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
                  return (
                    <a key={d.id} href="/commandes" className="flex items-center gap-3 px-5 py-2.5 hover:bg-[#FBFBFA] transition-colors">
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                        d.isOverdue ? "bg-red-50" : d.isToday ? "bg-amber-50" : "bg-[#F7F7F5]"
                      }`}>
                        <Clock size={12} className={d.isOverdue ? "text-red-500" : d.isToday ? "text-amber-600" : "text-[#999]"} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[12px] font-medium text-[#1A1A1A] block truncate">{d.title}</span>
                        <span className="text-[10px] text-[#BBB]">
                          {d.clientName ? `${d.clientName} · ` : ""}{dayLabel}
                        </span>
                      </div>
                      <BadgeStatus status={d.status as OrderStatus} />
                    </a>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* ════════════════════════ ROW 5 — Stats rapides ════════════════════════ */}
      <motion.div className="mt-6 bg-white rounded-xl border border-[#E6E6E4] px-6 py-4" {...fadeUp(0.55)}>
        <div className="flex flex-wrap items-center justify-between gap-6">
          {[
            { label: "Revenu total", value: fmtEur(data.totalRevenue), icon: DollarSign, color: "text-emerald-600" },
            { label: "Commandes totales", value: String(data.ordersCount), icon: ShoppingCart, color: "text-violet-600" },
            { label: "Produits actifs", value: String(data.activeProductsCount), icon: Package, color: "text-blue-600" },
            { label: "Taux complétion", value: data.ordersCount > 0 ? `${Math.round((data.paidOrders / data.ordersCount) * 100)}%` : "\u2014", icon: CheckCircle2, color: "text-amber-600" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2.5">
              <item.icon size={14} className={item.color} strokeWidth={1.8} />
              <span className="text-[11px] text-[#999]">{item.label}</span>
              <span className="text-[13px] font-bold text-[#1A1A1A]">{item.value}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
