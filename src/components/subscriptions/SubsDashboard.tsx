"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { Subscription } from "@/types/subscription";
import { CATEGORY_CONFIG } from "@/types/subscription";
import {
  computeTotals,
  categoryBreakdown,
  monthlyAmount,
  generateInsights,
} from "@/lib/subscriptions/helpers";
import {
  DollarSign,
  Calendar,
  Receipt,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Info,
} from "lucide-react";

// ── Animated KPI ─────────────────────────────────────────────────

function Kpi({ label, value, sub, icon: Icon, color, delay }: {
  label: string; value: string; sub?: string; icon: React.ElementType; color: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-white rounded-xl border border-[#E6E6E4] p-5"
    >
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color}`}>
        <Icon size={18} strokeWidth={1.8} />
      </div>
      <p className="text-[11px] font-medium text-[#AAA] uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-[22px] font-bold text-[#191919]">{value}</p>
      {sub && <p className="text-[11px] text-[#BBB] mt-0.5">{sub}</p>}
    </motion.div>
  );
}

// ── Pie-like category bars ───────────────────────────────────────

function CategoryBars({ breakdown }: { breakdown: ReturnType<typeof categoryBreakdown> }) {
  return (
    <div className="space-y-3">
      {breakdown.map((cat, i) => {
        const config = CATEGORY_CONFIG[cat.category];
        return (
          <motion.div
            key={cat.category}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * i }}
          >
            <div className="flex items-center justify-between text-[12px] mb-1">
              <span className="font-medium text-[#191919]">{config.icon} {config.label}</span>
              <span className="text-[#8A8A88]">{cat.monthlyTotal.toFixed(0)}€/mois · {cat.percentage}%</span>
            </div>
            <div className="h-2 bg-[#F0F0EE] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${cat.percentage}%` }}
                transition={{ duration: 0.6, delay: 0.1 * i }}
                className="h-full rounded-full"
                style={{ backgroundColor: config.color }}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ── Impact CA bar ────────────────────────────────────────────────

function ImpactBar({ monthlyTotal, monthlyRevenue }: { monthlyTotal: number; monthlyRevenue: number }) {
  if (monthlyRevenue <= 0) return null;
  const ratio = Math.round((monthlyTotal / monthlyRevenue) * 100);
  const isDanger = ratio > 30;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`p-4 rounded-xl border ${isDanger ? "bg-red-50/50 border-red-200" : "bg-[#F7F7F5] border-[#E6E6E4]"}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12px] font-medium text-[#191919]">Part du CA en abonnements</span>
        <span className={`text-[14px] font-bold ${isDanger ? "text-red-600" : "text-[#191919]"}`}>{ratio}%</span>
      </div>
      <div className="h-3 bg-white rounded-full overflow-hidden border border-[#E6E6E4]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(ratio, 100)}%` }}
          transition={{ duration: 0.8 }}
          className={`h-full rounded-full ${isDanger ? "bg-red-500" : ratio > 20 ? "bg-amber-400" : "bg-emerald-400"}`}
        />
      </div>
      {isDanger && (
        <p className="flex items-center gap-1.5 mt-2 text-[11px] text-red-600 font-medium">
          <AlertTriangle size={12} /> Tes abonnements mangent ton CA.
        </p>
      )}
    </motion.div>
  );
}

// ── Insights panel ───────────────────────────────────────────────

function InsightsPanel({ subs, monthlyRevenue }: { subs: Subscription[]; monthlyRevenue: number }) {
  const insights = useMemo(() => generateInsights(subs, monthlyRevenue), [subs, monthlyRevenue]);
  if (insights.length === 0) return null;

  const ICONS = { warning: AlertTriangle, tip: Lightbulb, info: Info };
  const COLORS = { warning: "text-red-500 bg-red-50", tip: "text-amber-500 bg-amber-50", info: "text-blue-500 bg-blue-50" };

  return (
    <div className="space-y-2">
      <h3 className="text-[13px] font-semibold text-[#191919] mb-2">Insights</h3>
      {insights.map((ins) => {
        const Icon = ICONS[ins.type];
        const color = COLORS[ins.type];
        return (
          <motion.div
            key={ins.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-3 p-3 rounded-lg bg-white border border-[#E6E6E4]"
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
              <Icon size={14} />
            </div>
            <div>
              <p className="text-[12px] font-semibold text-[#191919]">{ins.title}</p>
              <p className="text-[11px] text-[#8A8A88] leading-relaxed">{ins.message}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ── Top dépenses ─────────────────────────────────────────────────

function TopExpenses({ subs }: { subs: Subscription[] }) {
  const top = useMemo(() =>
    subs
      .filter((s) => s.status === "active")
      .sort((a, b) => monthlyAmount(b) - monthlyAmount(a))
      .slice(0, 5),
    [subs]
  );
  const maxAmount = top[0] ? monthlyAmount(top[0]) : 1;

  return (
    <div className="space-y-2.5">
      <h3 className="text-[13px] font-semibold text-[#191919] mb-2">Top dépenses</h3>
      {top.map((sub, i) => {
        const m = monthlyAmount(sub);
        return (
          <motion.div
            key={sub.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3"
          >
            <span className="text-[12px] font-medium text-[#191919] w-24 truncate">{sub.name}</span>
            <div className="flex-1 h-5 bg-[#F0F0EE] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(m / maxAmount) * 100}%` }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="h-full rounded-full bg-[#7C3AED]"
              />
            </div>
            <span className="text-[12px] font-bold text-[#191919] w-14 text-right">{m.toFixed(0)}€</span>
          </motion.div>
        );
      })}
    </div>
  );
}

// ── Main Dashboard ───────────────────────────────────────────────

interface Props {
  subs: Subscription[];
  monthlyRevenue?: number;
}

export default function SubsDashboard({ subs, monthlyRevenue = 0 }: Props) {
  const totals = useMemo(() => computeTotals(subs), [subs]);
  const breakdown = useMemo(() => categoryBreakdown(subs), [subs]);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Total mensuel" value={`${totals.monthlyTotal.toFixed(0)}€`} icon={DollarSign} color="bg-violet-50 text-violet-600" delay={0} />
        <Kpi label="Total annuel" value={`${totals.yearlyTotal.toFixed(0)}€`} icon={Calendar} color="bg-blue-50 text-blue-600" delay={0.05} />
        <Kpi label="Part déductible" value={`${totals.deductibleMonthly.toFixed(0)}€`} sub={`${totals.deductibleYearly.toFixed(0)}€/an`} icon={Receipt} color="bg-emerald-50 text-emerald-600" delay={0.1} />
        <Kpi label="Abonnements" value={String(totals.activeCount)} sub={totals.toCancelCount > 0 ? `${totals.toCancelCount} à résilier` : undefined} icon={TrendingDown} color="bg-amber-50 text-amber-600" delay={0.15} />
      </div>

      {/* Impact CA */}
      <ImpactBar monthlyTotal={totals.monthlyTotal} monthlyRevenue={monthlyRevenue} />

      {/* Grid: Categories + Top + Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-[#E6E6E4] p-5">
          <h3 className="text-[13px] font-semibold text-[#191919] mb-4">Répartition par catégorie</h3>
          <CategoryBars breakdown={breakdown} />
        </div>
        <div className="bg-white rounded-xl border border-[#E6E6E4] p-5">
          <TopExpenses subs={subs} />
        </div>
      </div>

      {/* Insights */}
      <InsightsPanel subs={subs} monthlyRevenue={monthlyRevenue} />
    </div>
  );
}
