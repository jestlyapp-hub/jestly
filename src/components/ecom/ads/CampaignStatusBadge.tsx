"use client";

import type { AggregatedProfitStatus } from "@/lib/ads/types";

interface Props { status: AggregatedProfitStatus; size?: "sm" | "md" }

const CONFIG: Record<AggregatedProfitStatus, { label: string; cls: string; dot: string; tooltip?: string }> = {
  profitable: { label: "Rentable", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  warning: { label: "Limite", cls: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  unprofitable: { label: "Perte", cls: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-500" },
  unmatched: { label: "Non attribué", cls: "bg-[#F7F7F5] text-[#5A5A58] border-[#E6E6E4]", dot: "bg-[#8A8A88]" },
  insufficient_data: {
    label: "Données partielles",
    cls: "bg-sky-50 text-sky-700 border-sky-200",
    dot: "bg-sky-400",
    tooltip: "Volume insuffisant sur la période pour juger la rentabilité",
  },
};

export default function CampaignStatusBadge({ status, size = "sm" }: Props) {
  const cfg = CONFIG[status];
  const sizeCls = size === "md" ? "px-2 py-0.5 text-[11px]" : "px-1.5 py-0.5 text-[10px]";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded font-medium border ${cfg.cls} ${sizeCls} whitespace-nowrap`}
      title={cfg.tooltip}
    >
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
