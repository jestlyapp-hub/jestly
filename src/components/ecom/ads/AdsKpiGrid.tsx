"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { AggregatedProfitStatus } from "@/lib/ads/types";

export interface KpiData {
  label: string;
  value: string;
  delta_percent: number | null;
  /** True si une variation positive est bonne (CA, ROAS, commandes) ; false pour CPC/CPA. */
  positiveIsGood: boolean;
  status?: AggregatedProfitStatus;
}

interface Props {
  kpis: KpiData[];
  loading?: boolean;
}

const STATUS_COLOR: Record<NonNullable<KpiData["status"]>, string> = {
  profitable: "text-emerald-600",
  warning: "text-amber-600",
  unprofitable: "text-rose-600",
  unmatched: "text-[#8A8A88]",
  insufficient_data: "text-sky-600",
};

export default function AdsKpiGrid({ kpis, loading }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
      {kpis.map((k, i) => (
        <motion.div
          key={k.label}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: i * 0.04 }}
          className="bg-white border border-[#E6E6E4] rounded-xl p-3"
        >
          <div className="text-[10px] font-semibold uppercase tracking-wide text-[#8A8A88] mb-1">
            {k.label}
          </div>
          <div className={`text-[18px] font-bold tracking-tight tabular-nums ${k.status ? STATUS_COLOR[k.status] : "text-[#191919]"}`}>
            {loading ? <span className="inline-block h-5 w-16 bg-[#F7F7F5] rounded animate-pulse" /> : k.value}
          </div>
          {k.delta_percent != null && !loading && (
            <Delta value={k.delta_percent} positiveIsGood={k.positiveIsGood} />
          )}
        </motion.div>
      ))}
    </div>
  );
}

function Delta({ value, positiveIsGood }: { value: number; positiveIsGood: boolean }) {
  if (value === 0) {
    return <div className="flex items-center gap-1 mt-1 text-[10px] text-[#8A8A88]"><Minus size={10} />0,0 %</div>;
  }
  const good = positiveIsGood ? value > 0 : value < 0;
  const color = good ? "text-emerald-600" : "text-rose-600";
  const Icon = value > 0 ? TrendingUp : TrendingDown;
  return (
    <div className={`flex items-center gap-1 mt-1 text-[10px] font-semibold ${color}`}>
      <Icon size={10} />
      {value > 0 ? "+" : ""}{value.toFixed(1)} %
    </div>
  );
}
