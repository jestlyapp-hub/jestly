"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid, Cell,
} from "recharts";
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Target,
  ShoppingBag, Repeat, RefreshCw, Calendar, Clock, CreditCard, Activity,
  Sparkles, Trophy, X, Wallet,
} from "lucide-react";
import PipelineSummaryCards from "@/components/ui/PipelineSummaryCards";
import type { AnalyticsData } from "./analytics-types";
import { CHART_COLORS, TOOLTIP_STYLE, fmt, fmtEur, fmtDate } from "./analytics-types";
import { KPICard, Section, MetricToggle, EmptyState, ProgressRing } from "./AnalyticsShared";

interface OverviewTabProps {
  data: AnalyticsData;
  sparkData: number[];
  orderSparkData: number[];
  range: string;
}

export default function AnalyticsOverviewTab({ data, sparkData, orderSparkData, range }: OverviewTabProps) {
  const { kpis } = data;
  const [chartType, setChartType] = useState<"area" | "bar" | "line">("area");
  const [chartMetric, setChartMetric] = useState("revenue");
  const [showComparison, setShowComparison] = useState(false);
  const [goalRevenue, setGoalRevenue] = useState<number | null>(null);
  const [showGoalInput, setShowGoalInput] = useState(false);
  const [goalInputValue, setGoalInputValue] = useState("");

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

  return (
    <>
      <div className="mb-6">
        <PipelineSummaryCards summary={data.pipelineSummary} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard label="CA total" value={fmtEur(data.pipelineSummary.totalRevenue)} change={0} icon={DollarSign} sparkData={sparkData} index={0} tooltip="CA total — toutes commandes actives (source de vérité unique)" />
        <KPICard label="Revenu net" value={fmtEur(kpis.netProfit)} change={kpis.profitChange} icon={Wallet} sparkData={sparkData} index={1} tooltip="Revenu payé - remboursements sur la période" />
        <KPICard label="Commandes payées" value={fmt(kpis.totalOrders)} change={kpis.ordersChange} icon={ShoppingCart} sparkData={orderSparkData} index={2} tooltip="Commandes payées/livrées/facturées sur la période" />
        <KPICard label="Taux de conversion" value={`${kpis.conversionRate}%`} change={kpis.conversionChange} icon={Target} index={3} tooltip="Commandes payées / total commandes sur la période" />
        <KPICard label="Panier moyen" value={fmtEur(kpis.avgOrderValue)} change={kpis.aovChange} icon={ShoppingBag} index={4} tooltip="Montant moyen par commande" />
        <KPICard label="Clients récurrents" value={`${kpis.returningRate}%`} change={0} icon={Repeat} index={5} tooltip="% de clients avec plus d'une commande" />
        <KPICard label="Taux de remboursement" value={`${kpis.refundRate}%`} change={0} icon={RefreshCw} index={6} tooltip="% de commandes remboursées" />
        <KPICard label="Clients actifs" value={fmt(kpis.activeClients)} change={kpis.clientsChange} icon={Users} index={7} tooltip="Clients ayant commandé sur la période" />
      </div>

      {/* MAIN REVENUE CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <Section
            title="Évolution des revenus"
            icon={TrendingUp}
            delay={0.3}
            action={
              <div className="flex items-center gap-2">
                <MetricToggle options={[{ key: "revenue", label: "Revenu" }, { key: "profit", label: "Profit" }, { key: "orders", label: "Commandes" }]} active={chartMetric} onChange={setChartMetric} />
                <MetricToggle options={[{ key: "area", label: "Area" }, { key: "bar", label: "Bar" }, { key: "line", label: "Line" }]} active={chartType} onChange={(k) => setChartType(k as "area" | "bar" | "line")} />
                <button onClick={() => setShowComparison(!showComparison)} className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all cursor-pointer ${showComparison ? "bg-[#4F46E5] text-white" : "bg-[#F7F7F5] text-[#999] hover:text-[#666]"}`}>
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

        {/* GOAL + FORECAST SIDEBAR */}
        <div className="flex flex-col gap-6">
          <Section title="Objectif mensuel" icon={Target} delay={0.35}>
            {goalRevenue ? (
              <div className="flex flex-col items-center">
                <ProgressRing value={kpis.totalRevenue} max={goalRevenue} label={`${fmtEur(kpis.totalRevenue)} / ${fmtEur(goalRevenue)}`} />
                <div className="w-full mt-4">
                  <div className="h-2 bg-[#F0F0EE] rounded-full overflow-hidden">
                    <motion.div className="h-full bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] rounded-full" initial={{ width: 0 }} animate={{ width: `${Math.min(100, (kpis.totalRevenue / goalRevenue) * 100)}%` }} transition={{ duration: 1, ease: "easeOut" }} />
                  </div>
                </div>
                {kpis.totalRevenue >= goalRevenue && (
                  <motion.div className="mt-3 flex items-center gap-1.5 text-[12px] font-semibold text-emerald-600" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.5 }}>
                    <Trophy size={14} /> Objectif atteint !
                  </motion.div>
                )}
                <button onClick={() => { setShowGoalInput(true); setGoalInputValue(String(goalRevenue)); }} className="mt-3 text-[11px] text-[#999] hover:text-[#4F46E5] cursor-pointer">
                  Modifier l&apos;objectif
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center py-4">
                <p className="text-[12px] text-[#999] mb-3">Définis un objectif de revenu</p>
                <button onClick={() => setShowGoalInput(true)} className="px-4 py-2 bg-[#4F46E5] text-white text-[12px] font-medium rounded-lg hover:bg-[#4338CA] transition-all cursor-pointer">
                  Définir un objectif
                </button>
              </div>
            )}
            <AnimatePresence>
              {showGoalInput && (
                <motion.div className="mt-4 p-3 bg-[#F7F7F5] rounded-lg" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                  <div className="flex items-center gap-2">
                    <input type="number" value={goalInputValue} onChange={(e) => setGoalInputValue(e.target.value)} placeholder="5000" className="flex-1 bg-white border border-[#E6E6E4] rounded-lg px-3 py-1.5 text-[13px] focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 outline-none" onKeyDown={(e) => e.key === "Enter" && saveGoal()} />
                    <span className="text-[12px] text-[#999]">€</span>
                    <button onClick={saveGoal} className="px-3 py-1.5 bg-[#4F46E5] text-white text-[12px] rounded-lg cursor-pointer">OK</button>
                    <button onClick={() => setShowGoalInput(false)} className="p-1 text-[#999] cursor-pointer"><X size={14} /></button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Section>

          <Section title="Prévision" icon={Sparkles} delay={0.4} badge={`${data.forecast.confidence}% confiance`}>
            <div className="text-center">
              <div className="text-[11px] text-[#999] uppercase tracking-wider mb-1">Revenu estimé prochain mois</div>
              <div className="text-[28px] font-bold text-[#1A1A1A]">{fmtEur(data.forecast.nextMonth)}</div>
              <div className={`flex items-center justify-center gap-1 mt-1 text-[12px] font-semibold ${data.forecast.trend === "up" ? "text-emerald-600" : data.forecast.trend === "down" ? "text-red-500" : "text-[#999]"}`}>
                {data.forecast.trend === "up" ? <TrendingUp size={13} /> : data.forecast.trend === "down" ? <TrendingDown size={13} /> : <Activity size={13} />}
                Tendance {data.forecast.trend === "up" ? "haussière" : data.forecast.trend === "down" ? "baissière" : "stable"}
                {data.forecast.avgGrowthRate !== undefined && ` (${data.forecast.avgGrowthRate > 0 ? "+" : ""}${data.forecast.avgGrowthRate}%)`}
              </div>
            </div>
          </Section>
        </div>
      </div>

      {/* SALES INSIGHTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Section title="Revenu par jour" icon={Calendar} delay={0.45}>
          {(data.revenueByDay || []).every((d) => d.revenue === 0) ? (
            <EmptyState message="Aucune donnée" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.revenueByDay || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EFEFEF" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#999" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#999" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${fmt(v)} €`} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number | undefined) => [fmtEur(v ?? 0), "Revenu"]} />
                <Bar dataKey="revenue" fill="#4F46E5" radius={[4, 4, 0, 0]}>
                  {(data.revenueByDay || []).map((entry, i) => {
                    const maxRev = Math.max(...(data.revenueByDay || []).map((d) => d.revenue));
                    return <Cell key={i} fill={entry.revenue === maxRev ? "#4F46E5" : "#C7D2FE"} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Section>

        <Section title="Revenu par heure" icon={Clock} delay={0.5}>
          {(data.revenueByHour || []).every((h) => h.revenue === 0) ? (
            <EmptyState message="Aucune donnée" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data.revenueByHour || []}>
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

      {/* PAYMENT METHODS + ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Section title="Moyens de paiement" icon={CreditCard} delay={0.65}>
          {(data.paymentMethods || []).length === 0 ? (
            <EmptyState message="Aucune donnée" />
          ) : (
            <div className="space-y-3">
              {(data.paymentMethods || []).map((pm) => {
                const totalPayments = (data.paymentMethods || []).reduce((s, p) => s + p.count, 0);
                const pct = totalPayments > 0 ? Math.round((pm.count / totalPayments) * 100) : 0;
                return (
                  <div key={pm.method}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] font-medium text-[#1A1A1A] capitalize">{pm.method}</span>
                      <span className="text-[11px] text-[#999]">{pct}% · {fmtEur(pm.revenue)}</span>
                    </div>
                    <div className="h-2 bg-[#F0F0EE] rounded-full overflow-hidden">
                      <motion.div className="h-full bg-[#4F46E5] rounded-full" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Section>

        <div className="lg:col-span-2">
          <Section title="Activité récente" icon={Activity} delay={0.7}>
            {(data.recentEvents || []).length === 0 ? (
              <EmptyState message="Aucune activité récente" />
            ) : (
              <div className="space-y-2 max-h-[280px] overflow-y-auto">
                {(data.recentEvents || []).map((event, i) => (
                  <motion.div key={i} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#F7F7F5] transition-all" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 + i * 0.03 }}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${event.type === "refund" ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-600"}`}>
                      {event.type === "refund" ? <RefreshCw size={14} /> : <ShoppingCart size={14} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] text-[#1A1A1A] font-medium">{event.type === "refund" ? "Remboursement" : "Nouvelle commande"}</div>
                      <div className="text-[11px] text-[#999] truncate">{event.clientName}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-[12px] font-semibold ${event.type === "refund" ? "text-red-500" : "text-emerald-600"}`}>{event.type === "refund" ? "-" : "+"}{fmtEur(event.amount)}</div>
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
  );
}
