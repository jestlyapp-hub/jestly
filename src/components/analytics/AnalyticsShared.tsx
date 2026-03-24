"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
} from "lucide-react";
import { CHART_COLORS, fadeUp, fmtPct } from "./analytics-types";

// ── Mini Sparkline ──
export function Sparkline({ data, color = CHART_COLORS.primary, height = 32 }: { data: number[]; color?: string; height?: number }) {
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
export function KPICard({ label, value, change, icon: Icon, sparkData, index, tooltip }: {
  label: string; value: string; change: number | null; icon: React.ElementType; sparkData?: number[]; index: number; tooltip?: string;
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const hasChange = change !== null && change !== 0;
  const isPositive = (change ?? 0) >= 0;
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
          {hasChange && (
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
export function Section({ title, icon: Icon, children, delay = 0, badge, action }: {
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
export function MetricToggle({ options, active, onChange }: {
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
export function CardSkeleton({ h = "h-24" }: { h?: string }) {
  return <div className={`${h} bg-white rounded-xl border border-[#E6E6E4] animate-pulse`} />;
}
export function ChartSkeleton({ h = "h-[300px]" }: { h?: string }) {
  return <div className={`${h} bg-[#F7F7F5] rounded-lg animate-pulse`} />;
}

// ── Empty state ──
export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-14 h-14 rounded-xl bg-[#F7F7F5] flex items-center justify-center mb-3">
        <BarChart3 size={24} className="text-[#CCC]" />
      </div>
      <p className="text-[13px] text-[#999]">{message}</p>
    </div>
  );
}

// ── Progress Ring ──
export function ProgressRing({ value, max, size = 80, label }: { value: number; max: number; size?: number; label: string }) {
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
