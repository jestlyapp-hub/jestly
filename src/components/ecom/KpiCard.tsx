"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  label: string;
  value: string;
  variation?: number | null;
  positiveIsGood?: boolean;
  sparkline?: { date: string; value: number }[];
  loading?: boolean;
}

export default function KpiCard({ label, value, variation, positiveIsGood = true, sparkline, loading }: Props) {
  const variationDisplay = variation != null
    ? `${variation >= 0 ? "+" : ""}${variation.toFixed(1)} %`
    : null;

  let color = "text-[#8A8A88]";
  if (variation != null && variation !== 0) {
    const good = positiveIsGood ? variation > 0 : variation < 0;
    color = good ? "text-emerald-600" : "text-rose-600";
  }
  const Icon = variation == null || variation === 0 ? Minus : variation > 0 ? TrendingUp : TrendingDown;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white border border-[#E6E6E4] rounded-xl p-4"
    >
      <div className="text-[11px] font-semibold uppercase tracking-wide text-[#8A8A88] mb-1.5">
        {label}
      </div>
      <div className="text-[24px] font-bold text-[#191919] tracking-tight tabular-nums">
        {loading ? <span className="inline-block h-7 w-24 bg-[#F7F7F5] rounded animate-pulse" /> : value}
      </div>
      {variationDisplay && !loading && (
        <div className={`flex items-center gap-1 mt-1 text-[12px] font-semibold ${color}`}>
          <Icon size={12} />
          {variationDisplay}
          <span className="text-[#8A8A88] font-normal ml-1">vs période précédente</span>
        </div>
      )}
      {sparkline && sparkline.length > 1 && !loading && (
        <Sparkline data={sparkline} color={variation != null && variation < 0 ? "#F43F5E" : "#7C3AED"} />
      )}
    </motion.div>
  );
}

function Sparkline({ data, color }: { data: { date: string; value: number }[]; color: string }) {
  const values = data.map((d) => d.value);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * 100;
      const y = 100 - ((v - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-8 mt-2">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
