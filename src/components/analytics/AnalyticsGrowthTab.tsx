"use client";

import { motion } from "framer-motion";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { TrendingUp, BarChart3, Sparkles, Trophy, AlertCircle, Flame, Activity } from "lucide-react";
import type { AnalyticsData } from "./analytics-types";
import { TOOLTIP_STYLE, fmt, fmtEur, fmtPct } from "./analytics-types";
import { Section, EmptyState } from "./AnalyticsShared";

interface GrowthTabProps {
  data: AnalyticsData;
}

export default function AnalyticsGrowthTab({ data }: GrowthTabProps) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {data.bestMonth && (
          <motion.div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl border border-emerald-100 p-5" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-2">
              <Trophy size={16} className="text-emerald-600" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600">Meilleur mois</span>
            </div>
            <div className="text-[20px] font-bold text-[#1A1A1A]">{fmtEur(data.bestMonth.revenue)}</div>
            <div className="text-[12px] text-[#999] mt-0.5">{data.bestMonth.month}</div>
          </motion.div>
        )}
        {data.worstMonth && (
          <motion.div className="bg-gradient-to-br from-red-50 to-white rounded-xl border border-red-100 p-5" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={16} className="text-red-500" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-red-500">Mois le plus faible</span>
            </div>
            <div className="text-[20px] font-bold text-[#1A1A1A]">{fmtEur(data.worstMonth.revenue)}</div>
            <div className="text-[12px] text-[#999] mt-0.5">{data.worstMonth.month}</div>
          </motion.div>
        )}
        <motion.div className="bg-gradient-to-br from-[#4F46E5]/5 to-white rounded-xl border border-[#4F46E5]/10 p-5" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center gap-2 mb-2">
            <Flame size={16} className="text-[#4F46E5]" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#4F46E5]">Croissance</span>
          </div>
          <div className="text-[20px] font-bold text-[#1A1A1A]">
            {data.forecast.confidence > 0 ? fmtPct(data.forecast.avgGrowthRate ?? 0) : "—"}
          </div>
          <div className="text-[12px] text-[#999] mt-0.5">{data.forecast.confidence > 0 ? "Taux moyen" : "Données insuffisantes"}</div>
        </motion.div>
      </div>

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
  );
}
