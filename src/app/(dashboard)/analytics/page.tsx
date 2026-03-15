"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApi } from "@/lib/hooks/use-api";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Calendar,
  Download,
  Sparkles,
  Award,
  Zap,
  Clock,
  RefreshCw,
  ChevronDown,
  X,
  Trophy,
  Star,
  Flame,
  ArrowRight,
  Percent,
  CreditCard,
  Wallet,
  Activity,
  Eye,
  MousePointerClick,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  Package,
  UserPlus,
  UserCheck,
  Repeat,
  Globe,
  FileText,
  Image,
} from "lucide-react";

// ── Types ──
interface AnalyticsData {
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
  insights: string[];
  monthlyGrowth: MonthlyGrowth[];
  bestMonth: { month: string; revenue: number } | null;
  worstMonth: { month: string; revenue: number } | null;
  forecast: { nextMonth: number; trend: string; confidence: number; avgGrowthRate?: number };
  profitBreakdown: { revenue: number; fees: number; refunds: number; netProfit: number };
  recentEvents: RecentEvent[];
  funnel: { pageViews: number; productViews: number; checkoutsStarted: number; ordersCompleted: number; hasRealData: boolean };
}
interface TimePoint { label: string; revenue: number; orders: number; profit: number }
interface ProductPerf { name: string; revenue: number; orders: number; refunds: number; avgPrice: number; refundRate: number; conversionRate: number; revenueShare: number }
interface TopClient { name: string; email: string; revenue: number; orders: number; lastPurchase: string }
interface MonthlyGrowth { month: string; revenue: number; orders: number; clients: number; revenueGrowth: number; orderGrowth: number }
interface RecentEvent { type: string; amount: number; clientName: string; date: string; status: string }

// ── Constants ──
const RANGES = [
  { key: "today", label: "Aujourd'hui" },
  { key: "7d", label: "7 jours" },
  { key: "30d", label: "30 jours" },
  { key: "90d", label: "90 jours" },
  { key: "12m", label: "12 mois" },
  { key: "all", label: "Tout" },
] as const;

const CHART_COLORS = {
  primary: "#4F46E5",
  primaryLight: "#818CF8",
  secondary: "#10B981",
  tertiary: "#F59E0B",
  quaternary: "#EF4444",
  purple: "#8B5CF6",
  pink: "#EC4899",
  cyan: "#06B6D4",
};

const PIE_COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

const TOOLTIP_STYLE = {
  background: "#fff",
  border: "1px solid #E6E6E4",
  borderRadius: "10px",
  fontSize: "12px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
  padding: "10px 14px",
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const, delay: i * 0.05 },
  }),
};

// ── Helpers ──
function fmt(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toLocaleString("fr-FR");
}
function fmtEur(n: number): string { return `${fmt(n)} €`; }
function fmtPct(n: number): string { return `${n > 0 ? "+" : ""}${Math.round(n)}%`; }
function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

// ── Mini Sparkline ──
function Sparkline({ data, color = CHART_COLORS.primary, height = 32 }: { data: number[]; color?: string; height?: number }) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${height - ((v - min) / range) * (height - 4) - 2}`).join(" ");
  return (
    <svg width={w} height={height} className="mt-1">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── KPI Card ──
function KPICard({ label, value, change, icon: Icon, sparkData, index, tooltip }: {
  label: string; value: string; change: number; icon: React.ElementType; sparkData?: number[]; index: number; tooltip?: string;
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const isPositive = change >= 0;
  return (
    <motion.div
      className="relative bg-white rounded-xl border border-[#E6E6E4] p-5 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-default group"
      variants={fadeUp}
      custom={index}
      initial="hidden"
      animate="visible"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-medium text-[#999] uppercase tracking-wider mb-1.5">{label}</div>
          <div className="text-[22px] font-bold text-[#1A1A1A] leading-tight">{value}</div>
          {change !== 0 && (
            <div className={`flex items-center gap-1 mt-1.5 text-[12px] font-semibold ${isPositive ? "text-emerald-600" : "text-red-500"}`}>
              {isPositive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
              {fmtPct(change)} vs période préc.
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isPositive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
            <Icon size={18} strokeWidth={1.8} />
          </div>
          {sparkData && sparkData.length > 1 && (
            <Sparkline data={sparkData} color={isPositive ? "#10B981" : "#EF4444"} />
          )}
        </div>
      </div>
      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && tooltip && (
          <motion.div
            className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#1A1A1A] text-white text-[11px] px-3 py-1.5 rounded-lg whitespace-nowrap z-50 pointer-events-none"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
          >
            {tooltip}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1A1A1A] rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Section wrapper ──
function Section({ title, icon: Icon, children, delay = 0, badge, action }: {
  title: string; icon: React.ElementType; children: React.ReactNode; delay?: number; badge?: string; action?: React.ReactNode;
}) {
  return (
    <motion.div
      className="bg-white rounded-xl border border-[#E6E6E4] overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F0EE]">
        <div className="flex items-center gap-2.5">
          <Icon size={16} className="text-[#4F46E5]" strokeWidth={1.8} />
          <h2 className="text-[14px] font-semibold text-[#1A1A1A]">{title}</h2>
          {badge && (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#4F46E5]/10 text-[#4F46E5] px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </motion.div>
  );
}

// ── Chart Metric Toggle ──
function MetricToggle({ options, active, onChange }: {
  options: { key: string; label: string }[]; active: string; onChange: (k: string) => void;
}) {
  return (
    <div className="flex items-center gap-1 bg-[#F7F7F5] rounded-lg p-0.5">
      {options.map((o) => (
        <button
          key={o.key}
          onClick={() => onChange(o.key)}
          className={`px-3 py-1 text-[11px] font-medium rounded-md transition-all cursor-pointer ${
            active === o.key
              ? "bg-white text-[#1A1A1A] shadow-sm"
              : "text-[#999] hover:text-[#666]"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ── Skeleton ──
function CardSkeleton({ h = "h-24" }: { h?: string }) {
  return <div className={`${h} bg-white rounded-xl border border-[#E6E6E4] animate-pulse`} />;
}
function ChartSkeleton({ h = "h-[300px]" }: { h?: string }) {
  return <div className={`${h} bg-[#F7F7F5] rounded-lg animate-pulse`} />;
}

// ── Empty state ──
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-14 h-14 rounded-xl bg-[#F7F7F5] flex items-center justify-center mb-3">
        <BarChart3 size={24} className="text-[#CCC]" />
      </div>
      <p className="text-[13px] text-[#999]">{message}</p>
    </div>
  );
}

// ── Funnel Step ──
function FunnelStep({ label, value, rate, index, total }: { label: string; value: number; rate?: number; index: number; total: number }) {
  const width = total > 0 ? Math.max(20, (value / total) * 100) : 20;
  return (
    <div className="flex items-center gap-4">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[12px] font-medium text-[#1A1A1A]">{label}</span>
          <span className="text-[12px] font-bold text-[#1A1A1A]">{fmt(value)}</span>
        </div>
        <div className="h-8 bg-[#F7F7F5] rounded-lg overflow-hidden">
          <motion.div
            className="h-full rounded-lg bg-gradient-to-r from-[#4F46E5] to-[#818CF8]"
            initial={{ width: 0 }}
            animate={{ width: `${width}%` }}
            transition={{ duration: 0.8, delay: index * 0.15, ease: "easeOut" }}
          />
        </div>
      </div>
      {rate !== undefined && (
        <div className="text-[11px] font-semibold text-[#4F46E5] bg-[#4F46E5]/10 px-2 py-0.5 rounded-full whitespace-nowrap">
          {rate}%
        </div>
      )}
    </div>
  );
}

// ── Progress Ring ──
function ProgressRing({ value, max, size = 80, label }: { value: number; max: number; size?: number; label: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F0F0EE" strokeWidth={6} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#4F46E5" strokeWidth={6}
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="text-center -mt-14">
        <div className="text-[16px] font-bold text-[#1A1A1A]">{Math.round(pct)}%</div>
      </div>
      <div className="text-[11px] text-[#999] mt-6">{label}</div>
    </div>
  );
}

// ═══════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════
export default function AnalyticsPage() {
  const [range, setRange] = useState("30d");
  const [chartType, setChartType] = useState<"area" | "bar" | "line">("area");
  const [chartMetric, setChartMetric] = useState("revenue");
  const [showComparison, setShowComparison] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [productSort, setProductSort] = useState<"revenue" | "orders" | "refundRate">("revenue");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [goalRevenue, setGoalRevenue] = useState<number | null>(null);
  const [showGoalInput, setShowGoalInput] = useState(false);
  const [goalInputValue, setGoalInputValue] = useState("");

  const apiUrl = `/api/analytics/advanced?range=${range}`;
  const { data, loading, error, mutate } = useApi<AnalyticsData>(apiUrl);

  // Build sparkline data from time series
  const sparkData = useMemo(() => {
    if (!data?.timeSeries) return [];
    return data.timeSeries.map((p) => p.revenue);
  }, [data?.timeSeries]);

  const orderSparkData = useMemo(() => {
    if (!data?.timeSeries) return [];
    return data.timeSeries.map((p) => p.orders);
  }, [data?.timeSeries]);

  // Load goal from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("jestly_revenue_goal");
    if (stored) setGoalRevenue(parseInt(stored));
  }, []);

  const saveGoal = useCallback(() => {
    const val = parseInt(goalInputValue);
    if (!isNaN(val) && val > 0) {
      setGoalRevenue(val);
      localStorage.setItem("jestly_revenue_goal", String(val));
      setShowGoalInput(false);
    }
  }, [goalInputValue]);

  // Sorted products
  const sortedProducts = useMemo(() => {
    if (!data?.productPerformance) return [];
    return [...data.productPerformance].sort((a, b) => {
      if (productSort === "orders") return b.orders - a.orders;
      if (productSort === "refundRate") return b.refundRate - a.refundRate;
      return b.revenue - a.revenue;
    });
  }, [data?.productPerformance, productSort]);

  // Funnel data — from real analytics_events tracking
  const funnelData = data?.funnel ?? null;

  // ── TABS ──
  const TABS = [
    { key: "overview", label: "Vue d'ensemble", icon: BarChart3 },
    { key: "products", label: "Produits", icon: Package },
    { key: "customers", label: "Clients", icon: Users },
    { key: "growth", label: "Croissance", icon: TrendingUp },
  ];

  // ── LOADING STATE ──
  if (loading && !data) {
    return (
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 w-40 bg-[#F7F7F5] rounded-lg animate-pulse" />
          <div className="h-9 w-64 bg-[#F7F7F5] rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <CardSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2"><CardSkeleton h="h-[380px]" /></div>
          <CardSkeleton h="h-[380px]" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CardSkeleton h="h-[300px]" />
          <CardSkeleton h="h-[300px]" />
        </div>
      </div>
    );
  }

  // ── ERROR STATE ──
  if (error) {
    return (
      <div className="max-w-[1200px] mx-auto flex flex-col items-center justify-center py-24">
        <AlertCircle size={40} className="text-red-400 mb-4" />
        <p className="text-[14px] text-[#1A1A1A] font-medium mb-1">Erreur de chargement</p>
        <p className="text-[13px] text-[#999] mb-4">{error}</p>
        <button onClick={mutate} className="text-[13px] text-[#4F46E5] hover:underline cursor-pointer">Réessayer</button>
      </div>
    );
  }

  if (!data) return null;

  const { kpis } = data;

  return (
    <div className="max-w-[1200px] mx-auto pb-12">
      {/* ═══ HEADER ═══ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Analytics</h1>
          <p className="text-[13px] text-[#999] mt-0.5">Vue complète de ton activité</p>
        </motion.div>

        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {/* Time range */}
          <div className="flex items-center gap-1 bg-white border border-[#E6E6E4] rounded-lg p-0.5">
            {RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className={`px-3 py-1.5 text-[11px] font-medium rounded-md transition-all cursor-pointer ${
                  range === r.key
                    ? "bg-[#4F46E5] text-white shadow-sm"
                    : "text-[#666] hover:text-[#1A1A1A] hover:bg-[#F7F7F5]"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Refresh */}
          <button
            onClick={mutate}
            className="p-2 text-[#999] hover:text-[#4F46E5] hover:bg-[#F7F7F5] rounded-lg transition-all cursor-pointer"
            title="Rafraîchir"
          >
            <RefreshCw size={15} />
          </button>

          {/* Export */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="p-2 text-[#999] hover:text-[#4F46E5] hover:bg-[#F7F7F5] rounded-lg transition-all cursor-pointer"
              title="Exporter"
            >
              <Download size={15} />
            </button>
            <AnimatePresence>
              {showExportMenu && (
                <motion.div
                  className="absolute right-0 top-10 bg-white border border-[#E6E6E4] rounded-xl shadow-lg p-1 z-50 min-w-[140px]"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                >
                  {[
                    { label: "CSV", icon: FileText },
                    { label: "PDF", icon: FileText },
                    { label: "PNG", icon: Image },
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      className="flex items-center gap-2 w-full px-3 py-2 text-[12px] text-[#666] hover:bg-[#F7F7F5] rounded-lg cursor-pointer"
                      onClick={() => setShowExportMenu(false)}
                    >
                      <opt.icon size={14} />
                      Exporter {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* ═══ TABS ═══ */}
      <motion.div
        className="flex items-center gap-1 mb-6 border-b border-[#E6E6E4]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-medium border-b-2 transition-all cursor-pointer -mb-px ${
              activeTab === tab.key
                ? "border-[#4F46E5] text-[#4F46E5]"
                : "border-transparent text-[#999] hover:text-[#666]"
            }`}
          >
            <tab.icon size={15} strokeWidth={1.8} />
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* ═══ KPI STRIP ═══ */}
      {activeTab === "overview" && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KPICard label={`Revenu ${RANGES.find(r => r.key === range)?.label || "sur la période"}`} value={fmtEur(kpis.totalRevenue)} change={kpis.revenueChange} icon={DollarSign} sparkData={sparkData} index={0} tooltip="Revenu des commandes payées/livrées/facturées sur la période" />
            <KPICard label="Revenu net" value={fmtEur(kpis.netProfit)} change={kpis.profitChange} icon={Wallet} sparkData={sparkData} index={1} tooltip="Revenu payé - remboursements sur la période" />
            <KPICard label="Commandes payées" value={fmt(kpis.totalOrders)} change={kpis.ordersChange} icon={ShoppingCart} sparkData={orderSparkData} index={2} tooltip="Commandes payées/livrées/facturées sur la période" />
            <KPICard label="Taux de conversion" value={`${kpis.conversionRate}%`} change={kpis.conversionChange} icon={Target} index={3} tooltip="Commandes payées / total commandes sur la période" />
            <KPICard label="Panier moyen" value={fmtEur(kpis.avgOrderValue)} change={kpis.aovChange} icon={ShoppingBag} index={4} tooltip="Montant moyen par commande" />
            <KPICard label="Clients récurrents" value={`${kpis.returningRate}%`} change={0} icon={Repeat} index={5} tooltip="% de clients avec plus d'une commande" />
            <KPICard label="Taux de remboursement" value={`${kpis.refundRate}%`} change={0} icon={RefreshCw} index={6} tooltip="% de commandes remboursées" />
            <KPICard label="Clients actifs" value={fmt(kpis.activeClients)} change={kpis.clientsChange} icon={Users} index={7} tooltip="Clients ayant commandé sur la période" />
          </div>

          {/* ═══ INSIGHTS BAR ═══ */}
          {data.insights.length > 0 && (
            <motion.div
              className="mb-6 bg-gradient-to-r from-[#4F46E5]/5 to-[#8B5CF6]/5 rounded-xl border border-[#4F46E5]/10 p-4"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={15} className="text-[#4F46E5]" />
                <span className="text-[12px] font-semibold text-[#4F46E5] uppercase tracking-wider">Insights</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {data.insights.map((insight, i) => (
                  <motion.div
                    key={i}
                    className="flex items-start gap-2 text-[12px] text-[#444] bg-white/60 rounded-lg px-3 py-2"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                  >
                    <Zap size={12} className="text-[#F59E0B] mt-0.5 flex-shrink-0" />
                    {insight}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ═══ MAIN REVENUE CHART ═══ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <Section
                title="Évolution des revenus"
                icon={TrendingUp}
                delay={0.3}
                action={
                  <div className="flex items-center gap-2">
                    <MetricToggle
                      options={[
                        { key: "revenue", label: "Revenu" },
                        { key: "profit", label: "Profit" },
                        { key: "orders", label: "Commandes" },
                      ]}
                      active={chartMetric}
                      onChange={setChartMetric}
                    />
                    <MetricToggle
                      options={[
                        { key: "area", label: "Area" },
                        { key: "bar", label: "Bar" },
                        { key: "line", label: "Line" },
                      ]}
                      active={chartType}
                      onChange={(k) => setChartType(k as "area" | "bar" | "line")}
                    />
                    <button
                      onClick={() => setShowComparison(!showComparison)}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all cursor-pointer ${
                        showComparison ? "bg-[#4F46E5] text-white" : "bg-[#F7F7F5] text-[#999] hover:text-[#666]"
                      }`}
                    >
                      Comparer
                    </button>
                  </div>
                }
              >
                {data.timeSeries.length === 0 ? (
                  <EmptyState message="Aucune donnée pour cette période" />
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    {chartType === "area" ? (
                      <AreaChart data={data.timeSeries}>
                        <defs>
                          <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="gradPrev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#999" stopOpacity={0.08} />
                            <stop offset="95%" stopColor="#999" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#EFEFEF" vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#999" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: "#999" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => chartMetric === "orders" ? String(v) : `${fmt(v)} €`} />
                        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number | undefined) => [chartMetric === "orders" ? (v ?? 0) : fmtEur(v ?? 0), chartMetric === "revenue" ? "Revenu" : chartMetric === "profit" ? "Profit" : "Commandes"]} />
                        {showComparison && data.prevTimeSeries.length > 0 && (
                          <Area type="monotone" data={data.prevTimeSeries} dataKey={chartMetric} stroke="#CCC" strokeWidth={1.5} strokeDasharray="4 4" fill="url(#gradPrev)" />
                        )}
                        <Area type="monotone" dataKey={chartMetric} stroke="#4F46E5" strokeWidth={2} fill="url(#gradRevenue)" />
                      </AreaChart>
                    ) : chartType === "bar" ? (
                      <BarChart data={data.timeSeries}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#EFEFEF" vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#999" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: "#999" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => chartMetric === "orders" ? String(v) : `${fmt(v)} €`} />
                        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number | undefined) => [chartMetric === "orders" ? (v ?? 0) : fmtEur(v ?? 0)]} />
                        <Bar dataKey={chartMetric} fill="#4F46E5" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    ) : (
                      <LineChart data={data.timeSeries}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#EFEFEF" vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#999" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: "#999" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => chartMetric === "orders" ? String(v) : `${fmt(v)} €`} />
                        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number | undefined) => [chartMetric === "orders" ? (v ?? 0) : fmtEur(v ?? 0)]} />
                        {showComparison && data.prevTimeSeries.length > 0 && (
                          <Line type="monotone" data={data.prevTimeSeries} dataKey={chartMetric} stroke="#CCC" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                        )}
                        <Line type="monotone" dataKey={chartMetric} stroke="#4F46E5" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#4F46E5" }} />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                )}
              </Section>
            </div>

            {/* ═══ GOAL + FORECAST SIDEBAR ═══ */}
            <div className="flex flex-col gap-6">
              {/* Goal Tracking */}
              <Section title="Objectif mensuel" icon={Target} delay={0.35}>
                {goalRevenue ? (
                  <div className="flex flex-col items-center">
                    <ProgressRing value={kpis.totalRevenue} max={goalRevenue} label={`${fmtEur(kpis.totalRevenue)} / ${fmtEur(goalRevenue)}`} />
                    <div className="w-full mt-4">
                      <div className="h-2 bg-[#F0F0EE] rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (kpis.totalRevenue / goalRevenue) * 100)}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                    {kpis.totalRevenue >= goalRevenue && (
                      <motion.div
                        className="mt-3 flex items-center gap-1.5 text-[12px] font-semibold text-emerald-600"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.5 }}
                      >
                        <Trophy size={14} />
                        Objectif atteint !
                      </motion.div>
                    )}
                    <button
                      onClick={() => { setShowGoalInput(true); setGoalInputValue(String(goalRevenue)); }}
                      className="mt-3 text-[11px] text-[#999] hover:text-[#4F46E5] cursor-pointer"
                    >
                      Modifier l&apos;objectif
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-4">
                    <p className="text-[12px] text-[#999] mb-3">Définis un objectif de revenu</p>
                    <button
                      onClick={() => setShowGoalInput(true)}
                      className="px-4 py-2 bg-[#4F46E5] text-white text-[12px] font-medium rounded-lg hover:bg-[#4338CA] transition-all cursor-pointer"
                    >
                      Définir un objectif
                    </button>
                  </div>
                )}
                {/* Goal input modal */}
                <AnimatePresence>
                  {showGoalInput && (
                    <motion.div
                      className="mt-4 p-3 bg-[#F7F7F5] rounded-lg"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={goalInputValue}
                          onChange={(e) => setGoalInputValue(e.target.value)}
                          placeholder="5000"
                          className="flex-1 bg-white border border-[#E6E6E4] rounded-lg px-3 py-1.5 text-[13px] focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 outline-none"
                          onKeyDown={(e) => e.key === "Enter" && saveGoal()}
                        />
                        <span className="text-[12px] text-[#999]">€</span>
                        <button onClick={saveGoal} className="px-3 py-1.5 bg-[#4F46E5] text-white text-[12px] rounded-lg cursor-pointer">OK</button>
                        <button onClick={() => setShowGoalInput(false)} className="p-1 text-[#999] cursor-pointer"><X size={14} /></button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Section>

              {/* Forecast */}
              <Section title="Prévision" icon={Sparkles} delay={0.4} badge={`${data.forecast.confidence}% confiance`}>
                <div className="text-center">
                  <div className="text-[11px] text-[#999] uppercase tracking-wider mb-1">Revenu estimé prochain mois</div>
                  <div className="text-[28px] font-bold text-[#1A1A1A]">{fmtEur(data.forecast.nextMonth)}</div>
                  <div className={`flex items-center justify-center gap-1 mt-1 text-[12px] font-semibold ${
                    data.forecast.trend === "up" ? "text-emerald-600" : data.forecast.trend === "down" ? "text-red-500" : "text-[#999]"
                  }`}>
                    {data.forecast.trend === "up" ? <TrendingUp size={13} /> : data.forecast.trend === "down" ? <TrendingDown size={13} /> : <Activity size={13} />}
                    Tendance {data.forecast.trend === "up" ? "haussière" : data.forecast.trend === "down" ? "baissière" : "stable"}
                    {data.forecast.avgGrowthRate !== undefined && ` (${data.forecast.avgGrowthRate > 0 ? "+" : ""}${data.forecast.avgGrowthRate}%)`}
                  </div>
                </div>
              </Section>
            </div>
          </div>

          {/* ═══ SALES INSIGHTS ROW ═══ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Revenue by day of week */}
            <Section title="Revenu par jour" icon={Calendar} delay={0.45}>
              {data.revenueByDay.every((d) => d.revenue === 0) ? (
                <EmptyState message="Aucune donnée" />
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.revenueByDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EFEFEF" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#999" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#999" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${fmt(v)} €`} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number | undefined) => [fmtEur(v ?? 0), "Revenu"]} />
                    <Bar dataKey="revenue" fill="#4F46E5" radius={[4, 4, 0, 0]}>
                      {data.revenueByDay.map((entry, i) => {
                        const maxRev = Math.max(...data.revenueByDay.map((d) => d.revenue));
                        return <Cell key={i} fill={entry.revenue === maxRev ? "#4F46E5" : "#C7D2FE"} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Section>

            {/* Revenue by hour */}
            <Section title="Revenu par heure" icon={Clock} delay={0.5}>
              {data.revenueByHour.every((h) => h.revenue === 0) ? (
                <EmptyState message="Aucune donnée" />
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={data.revenueByHour}>
                    <defs>
                      <linearGradient id="gradHour" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EFEFEF" vertical={false} />
                    <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#999" }} axisLine={false} tickLine={false} interval={2} />
                    <YAxis tick={{ fontSize: 10, fill: "#999" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${fmt(v)} €`} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number | undefined) => [fmtEur(v ?? 0), "Revenu"]} />
                    <Area type="monotone" dataKey="revenue" stroke="#8B5CF6" strokeWidth={2} fill="url(#gradHour)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </Section>
          </div>

          {/* ═══ FUNNEL + PROFIT ═══ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Sales Funnel — real data from analytics_events */}
            <Section title="Tunnel de vente" icon={MousePointerClick} delay={0.55}>
              {funnelData && (funnelData.hasRealData || funnelData.ordersCompleted > 0) ? (
                <div className="space-y-3">
                  {funnelData.hasRealData ? (
                    <>
                      <FunnelStep label="Visiteurs" value={funnelData.pageViews} index={0} total={funnelData.pageViews} />
                      <FunnelStep label="Intérêt produit" value={funnelData.productViews} rate={funnelData.pageViews > 0 ? Math.round((funnelData.productViews / funnelData.pageViews) * 100) : 0} index={1} total={funnelData.pageViews} />
                      <FunnelStep label="Checkout démarré" value={funnelData.checkoutsStarted} rate={funnelData.productViews > 0 ? Math.round((funnelData.checkoutsStarted / funnelData.productViews) * 100) : 0} index={2} total={funnelData.pageViews} />
                    </>
                  ) : (
                    <div className="mb-3 px-3 py-2 bg-amber-50 border border-amber-100 rounded-lg">
                      <p className="text-[11px] text-amber-700">Visiteurs, vues et checkouts seront disponibles quand ton site recevra du trafic.</p>
                    </div>
                  )}
                  <FunnelStep label="Commandes finalisées" value={funnelData.ordersCompleted} rate={funnelData.checkoutsStarted > 0 ? Math.round((funnelData.ordersCompleted / funnelData.checkoutsStarted) * 100) : undefined} index={3} total={funnelData.hasRealData ? funnelData.pageViews : funnelData.ordersCompleted} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-12 h-12 rounded-xl bg-[#F7F7F5] flex items-center justify-center mb-3">
                    <MousePointerClick size={22} className="text-[#CCC]" />
                  </div>
                  <p className="text-[13px] font-medium text-[#666] mb-1">Tracking non configuré</p>
                  <p className="text-[11px] text-[#999] max-w-[220px]">Le tunnel de vente se remplira automatiquement quand ton site public recevra des visites.</p>
                </div>
              )}
            </Section>

            {/* Profit Breakdown */}
            <Section title="Décomposition du profit" icon={Wallet} delay={0.6}>
              <div className="space-y-4">
                {[
                  { label: "Revenu brut", value: data.profitBreakdown.revenue, color: "bg-[#4F46E5]" },
                  { label: "Frais / TVA", value: -data.profitBreakdown.fees, color: "bg-amber-500" },
                  { label: "Remboursements", value: -data.profitBreakdown.refunds, color: "bg-red-500" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                      <span className="text-[12px] text-[#666]">{item.label}</span>
                    </div>
                    <span className={`text-[13px] font-semibold ${item.value < 0 ? "text-red-500" : "text-[#1A1A1A]"}`}>
                      {item.value < 0 ? "-" : ""}{fmtEur(Math.abs(item.value))}
                    </span>
                  </div>
                ))}
                <div className="pt-3 border-t border-[#F0F0EE] flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-[#1A1A1A]">Profit net</span>
                  <span className="text-[16px] font-bold text-emerald-600">{fmtEur(data.profitBreakdown.netProfit)}</span>
                </div>
              </div>

              {/* Margin over time mini chart */}
              {data.timeSeries.length > 1 && (
                <div className="mt-6">
                  <div className="text-[11px] text-[#999] uppercase tracking-wider mb-2">Marge sur la période</div>
                  <ResponsiveContainer width="100%" height={80}>
                    <AreaChart data={data.timeSeries}>
                      <defs>
                        <linearGradient id="gradProfit" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={1.5} fill="url(#gradProfit)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Section>
          </div>

          {/* ═══ PAYMENT METHODS + ACTIVITY ═══ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Payment Methods */}
            <Section title="Moyens de paiement" icon={CreditCard} delay={0.65}>
              {data.paymentMethods.length === 0 ? (
                <EmptyState message="Aucune donnée" />
              ) : (
                <div className="space-y-3">
                  {data.paymentMethods.map((pm) => {
                    const totalPayments = data.paymentMethods.reduce((s, p) => s + p.count, 0);
                    const pct = totalPayments > 0 ? Math.round((pm.count / totalPayments) * 100) : 0;
                    return (
                      <div key={pm.method}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[12px] font-medium text-[#1A1A1A] capitalize">{pm.method}</span>
                          <span className="text-[11px] text-[#999]">{pct}% · {fmtEur(pm.revenue)}</span>
                        </div>
                        <div className="h-2 bg-[#F0F0EE] rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-[#4F46E5] rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8 }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Section>

            {/* Activity Feed */}
            <div className="lg:col-span-2">
              <Section title="Activité récente" icon={Activity} delay={0.7}>
                {data.recentEvents.length === 0 ? (
                  <EmptyState message="Aucune activité récente" />
                ) : (
                  <div className="space-y-2 max-h-[280px] overflow-y-auto">
                    {data.recentEvents.map((event, i) => (
                      <motion.div
                        key={i}
                        className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#F7F7F5] transition-all"
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + i * 0.03 }}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          event.type === "refund" ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-600"
                        }`}>
                          {event.type === "refund" ? <RefreshCw size={14} /> : <ShoppingCart size={14} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[12px] text-[#1A1A1A] font-medium">
                            {event.type === "refund" ? "Remboursement" : "Nouvelle commande"}
                          </div>
                          <div className="text-[11px] text-[#999] truncate">{event.clientName}</div>
                        </div>
                        <div className="text-right">
                          <div className={`text-[12px] font-semibold ${event.type === "refund" ? "text-red-500" : "text-emerald-600"}`}>
                            {event.type === "refund" ? "-" : "+"}{fmtEur(event.amount)}
                          </div>
                          <div className="text-[10px] text-[#CCC]">{fmtDate(event.date)}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </Section>
            </div>
          </div>
        </>
      )}

      {/* ═══════════════════════════ */}
      {/* ═══ PRODUCTS TAB ═══ */}
      {/* ═══════════════════════════ */}
      {activeTab === "products" && (
        <>
          {/* Top products chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Section title="Revenu par produit" icon={Package} delay={0.2}>
              {sortedProducts.length === 0 ? (
                <EmptyState message={data?.productsLinked === false ? "Commandes non reliées à des produits" : "Aucun produit vendu"} />
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={sortedProducts.slice(0, 8)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#EFEFEF" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: "#999" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${fmt(v)} €`} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#666" }} axisLine={false} tickLine={false} width={120} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number | undefined) => [fmtEur(v ?? 0), "Revenu"]} />
                    <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                      {sortedProducts.slice(0, 8).map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Section>

            {/* Revenue share pie */}
            <Section title="Part de revenu" icon={Percent} delay={0.25}>
              {sortedProducts.length === 0 ? (
                <EmptyState message={data?.productsLinked === false ? "Commandes non reliées à des produits" : "Aucun produit vendu"} />
              ) : (
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width="50%" height={220}>
                    <PieChart>
                      <Pie
                        data={sortedProducts.slice(0, 6)}
                        dataKey="revenue"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={50}
                        paddingAngle={2}
                      >
                        {sortedProducts.slice(0, 6).map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number | undefined) => [fmtEur(v ?? 0)]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-2">
                    {sortedProducts.slice(0, 6).map((p, i) => (
                      <div key={p.name} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="text-[11px] text-[#666] flex-1 truncate">{p.name}</span>
                        <span className="text-[11px] font-semibold text-[#1A1A1A]">{p.revenueShare}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Section>
          </div>

          {/* Product performance table */}
          <Section title="Performance des produits" icon={BarChart3} delay={0.3}>
            {sortedProducts.length === 0 ? (
              <EmptyState message={data?.productsLinked === false ? "Commandes non reliées à des produits" : "Aucun produit vendu sur cette période"} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#F0F0EE]">
                      {[
                        { key: "name", label: "Produit", sortable: false },
                        { key: "revenue", label: "Revenu", sortable: true },
                        { key: "orders", label: "Commandes", sortable: true },
                        { key: "avgPrice", label: "Prix moyen", sortable: false },
                        { key: "revenueShare", label: "Part CA", sortable: false },
                        { key: "refundRate", label: "Remboursements", sortable: true },
                      ].map((col) => (
                        <th
                          key={col.key}
                          className={`text-left text-[11px] uppercase tracking-wider font-semibold text-[#999] pb-3 px-2 ${col.sortable ? "cursor-pointer hover:text-[#4F46E5]" : ""}`}
                          onClick={() => col.sortable && setProductSort(col.key as typeof productSort)}
                        >
                          <span className="flex items-center gap-1">
                            {col.label}
                            {col.sortable && productSort === col.key && <ChevronDown size={11} />}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedProducts.map((p, i) => (
                      <motion.tr
                        key={p.name}
                        className="border-b border-[#F7F7F5] hover:bg-[#FAFAFF] transition-colors"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 + i * 0.03 }}
                      >
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            {i === 0 && <Star size={12} className="text-amber-500" />}
                            <span className="text-[13px] font-medium text-[#1A1A1A]">{p.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-[13px] font-semibold text-[#1A1A1A]">{fmtEur(p.revenue)}</td>
                        <td className="py-3 px-2 text-[13px] text-[#666]">{p.orders}</td>
                        <td className="py-3 px-2 text-[13px] text-[#666]">{fmtEur(p.avgPrice)}</td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-[#F0F0EE] rounded-full overflow-hidden">
                              <div className="h-full bg-[#4F46E5] rounded-full" style={{ width: `${p.revenueShare}%` }} />
                            </div>
                            <span className="text-[11px] text-[#999]">{p.revenueShare}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <span className={`text-[12px] font-medium ${p.refundRate > 5 ? "text-red-500" : "text-emerald-600"}`}>
                            {p.refundRate}%
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>
        </>
      )}

      {/* ═══════════════════════════ */}
      {/* ═══ CUSTOMERS TAB ═══ */}
      {/* ═══════════════════════════ */}
      {activeTab === "customers" && (
        <>
          {/* Customer KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KPICard label="Nouveaux clients" value={fmt(data.customerAnalytics.newCustomers)} change={data.customerAnalytics.newCustomersChange} icon={UserPlus} index={0} />
            <KPICard label="Clients récurrents" value={fmt(data.customerAnalytics.returningCustomers)} change={0} icon={UserCheck} index={1} />
            <KPICard label="Taux de récurrence" value={`${kpis.returningRate}%`} change={0} icon={Repeat} index={2} />
            <KPICard label="Clients actifs" value={fmt(kpis.activeClients)} change={kpis.clientsChange} icon={Users} index={3} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Customer segments */}
            <Section title="Segments clients" icon={Users} delay={0.2}>
              {data.customerAnalytics.segments.length === 0 ? (
                <EmptyState message="Aucun segment" />
              ) : (
                <div className="space-y-4">
                  {data.customerAnalytics.segments.map((seg, i) => {
                    const totalClients = data.customerAnalytics.segments.reduce((s, sg) => s + sg.count, 0);
                    const pct = totalClients > 0 ? Math.round((seg.count / totalClients) * 100) : 0;
                    return (
                      <div key={seg.segment}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                            <span className="text-[12px] font-medium text-[#1A1A1A]">{seg.segment}</span>
                          </div>
                          <span className="text-[11px] text-[#999]">{seg.count} clients · {fmtEur(seg.revenue)}</span>
                        </div>
                        <div className="h-2 bg-[#F0F0EE] rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: PIE_COLORS[i] }}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: i * 0.1 }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Section>

            {/* Revenue by segment pie */}
            <Section title="Revenu par segment" icon={Percent} delay={0.25}>
              {data.customerAnalytics.segments.every((s) => s.revenue === 0) ? (
                <EmptyState message="Aucune donnée" />
              ) : (
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={data.customerAnalytics.segments}
                        dataKey="revenue"
                        nameKey="segment"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={50}
                        paddingAngle={2}
                      >
                        {data.customerAnalytics.segments.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number | undefined) => [fmtEur(v ?? 0)]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Section>
          </div>

          {/* Top clients table */}
          <Section title="Meilleurs clients" icon={Award} delay={0.3}>
            {data.topClients.length === 0 ? (
              <EmptyState message="Aucun client sur cette période" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#F0F0EE]">
                      <th className="text-left text-[11px] uppercase tracking-wider font-semibold text-[#999] pb-3 px-2">#</th>
                      <th className="text-left text-[11px] uppercase tracking-wider font-semibold text-[#999] pb-3 px-2">Client</th>
                      <th className="text-left text-[11px] uppercase tracking-wider font-semibold text-[#999] pb-3 px-2">Revenu</th>
                      <th className="text-left text-[11px] uppercase tracking-wider font-semibold text-[#999] pb-3 px-2">Commandes</th>
                      <th className="text-left text-[11px] uppercase tracking-wider font-semibold text-[#999] pb-3 px-2">Dernier achat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topClients.map((c, i) => (
                      <motion.tr
                        key={c.email}
                        className="border-b border-[#F7F7F5] hover:bg-[#FAFAFF] transition-colors"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 + i * 0.03 }}
                      >
                        <td className="py-3 px-2">
                          {i < 3 ? (
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              i === 0 ? "bg-amber-100 text-amber-600" : i === 1 ? "bg-gray-100 text-gray-600" : "bg-orange-50 text-orange-500"
                            }`}>
                              {i + 1}
                            </div>
                          ) : (
                            <span className="text-[12px] text-[#999] pl-1.5">{i + 1}</span>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          <div className="text-[13px] font-medium text-[#1A1A1A]">{c.name}</div>
                          <div className="text-[11px] text-[#999]">{c.email}</div>
                        </td>
                        <td className="py-3 px-2 text-[13px] font-semibold text-[#1A1A1A]">{fmtEur(c.revenue)}</td>
                        <td className="py-3 px-2 text-[13px] text-[#666]">{c.orders}</td>
                        <td className="py-3 px-2 text-[12px] text-[#999]">{fmtDate(c.lastPurchase)}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>
        </>
      )}

      {/* ═══════════════════════════ */}
      {/* ═══ GROWTH TAB ═══ */}
      {/* ═══════════════════════════ */}
      {activeTab === "growth" && (
        <>
          {/* Best / Worst month + growth rate */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {data.bestMonth && (
              <motion.div
                className="bg-gradient-to-br from-emerald-50 to-white rounded-xl border border-emerald-100 p-5"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Trophy size={16} className="text-emerald-600" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600">Meilleur mois</span>
                </div>
                <div className="text-[20px] font-bold text-[#1A1A1A]">{fmtEur(data.bestMonth.revenue)}</div>
                <div className="text-[12px] text-[#999] mt-0.5">{data.bestMonth.month}</div>
              </motion.div>
            )}
            {data.worstMonth && (
              <motion.div
                className="bg-gradient-to-br from-red-50 to-white rounded-xl border border-red-100 p-5"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle size={16} className="text-red-500" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-red-500">Mois le plus faible</span>
                </div>
                <div className="text-[20px] font-bold text-[#1A1A1A]">{fmtEur(data.worstMonth.revenue)}</div>
                <div className="text-[12px] text-[#999] mt-0.5">{data.worstMonth.month}</div>
              </motion.div>
            )}
            <motion.div
              className="bg-gradient-to-br from-[#4F46E5]/5 to-white rounded-xl border border-[#4F46E5]/10 p-5"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Flame size={16} className="text-[#4F46E5]" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#4F46E5]">Croissance</span>
              </div>
              <div className="text-[20px] font-bold text-[#1A1A1A]">
                {data.forecast.avgGrowthRate !== undefined ? fmtPct(data.forecast.avgGrowthRate) : "—"}
              </div>
              <div className="text-[12px] text-[#999] mt-0.5">Taux moyen</div>
            </motion.div>
          </div>

          {/* Revenue growth chart */}
          <Section title="Croissance du revenu" icon={TrendingUp} delay={0.2}>
            {data.monthlyGrowth.length === 0 ? (
              <EmptyState message="Pas assez de données" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.monthlyGrowth}>
                  <defs>
                    <linearGradient id="gradGrowth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EFEFEF" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#999" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#999" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${fmt(v)} €`} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number | undefined) => [fmtEur(v ?? 0), "Revenu"]} />
                  <Area type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={2} fill="url(#gradGrowth)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Section>

          {/* Growth rates */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <Section title="Taux de croissance mensuel" icon={BarChart3} delay={0.3}>
              {data.monthlyGrowth.length === 0 ? (
                <EmptyState message="Pas assez de données" />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data.monthlyGrowth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EFEFEF" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#999" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#999" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v}%`} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number | undefined) => [`${v ?? 0}%`, "Croissance"]} />
                    <Bar dataKey="revenueGrowth" radius={[4, 4, 0, 0]}>
                      {data.monthlyGrowth.map((entry, i) => (
                        <Cell key={i} fill={entry.revenueGrowth >= 0 ? "#10B981" : "#EF4444"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Section>

            {/* Forecast chart */}
            <Section title="Prévision de revenu" icon={Sparkles} delay={0.35} badge="IA">
              {data.monthlyGrowth.length < 2 ? (
                <EmptyState message="Pas assez de données pour la prévision" />
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={[
                      ...data.monthlyGrowth.slice(-6),
                      { month: "Prévu", revenue: data.forecast.nextMonth, orders: 0, clients: 0, revenueGrowth: 0, orderGrowth: 0 },
                    ]}>
                      <defs>
                        <linearGradient id="gradForecast" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#EFEFEF" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#999" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "#999" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${fmt(v)} €`} />
                      <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number | undefined) => [fmtEur(v ?? 0), "Revenu"]} />
                      <Area type="monotone" dataKey="revenue" stroke="#8B5CF6" strokeWidth={2} fill="url(#gradForecast)" strokeDasharray="0" />
                    </AreaChart>
                  </ResponsiveContainer>
                  <div className="mt-3 flex items-center justify-center gap-4 text-[11px] text-[#999]">
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-0.5 bg-[#8B5CF6] rounded" /> Historique + prévision
                    </span>
                    <span>Confiance : {data.forecast.confidence}%</span>
                  </div>
                </>
              )}
            </Section>
          </div>
        </>
      )}
    </div>
  );
}
