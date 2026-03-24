"use client";

import { motion } from "framer-motion";
import { DollarSign, Loader, CheckCircle2, ClipboardList } from "lucide-react";
import type { PipelineSummary } from "@/lib/business-metrics";
import { fmtEurPipeline } from "@/lib/business-metrics";

// ═══════════════════════════════════════════════════════════
// PipelineSummaryCards — 3 cartes business cohérentes
//
// CA total | À faire | En cours | Prêtes
//
// Réutilisé sur : Dashboard, Commandes, Analytics
// ═══════════════════════════════════════════════════════════

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: "easeOut" as const, delay },
});

interface Props {
  summary: PipelineSummary;
  /** Delay d'animation de base (défaut 0) */
  baseDelay?: number;
}

function PipelineCard({
  label,
  amount,
  sub,
  icon: Icon,
  color,
  delay,
}: {
  label: string;
  amount: string;
  sub: string;
  icon: React.ElementType;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      className="bg-white rounded-xl border border-[#E6E6E4] p-4 hover:shadow-sm transition-all"
      {...fadeUp(delay)}
    >
      <div className="flex items-center gap-2.5 mb-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={15} strokeWidth={1.8} />
        </div>
        <span className="text-[11px] font-medium text-[#8A8A88] uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="text-[20px] font-bold text-[#191919] leading-tight">
        {amount}
      </div>
      <div className="text-[11px] text-[#8A8A88] mt-1">{sub}</div>
    </motion.div>
  );
}

export default function PipelineSummaryCards({ summary, baseDelay = 0 }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <PipelineCard
        label="CA total"
        amount={fmtEurPipeline(summary.totalRevenue)}
        sub={`${summary.totalCount} commande${summary.totalCount > 1 ? "s" : ""}`}
        icon={DollarSign}
        color="bg-emerald-50 text-emerald-600"
        delay={baseDelay}
      />
      <PipelineCard
        label="À faire"
        amount={fmtEurPipeline(summary.todoRevenue)}
        sub={`${summary.todoCount} en attente`}
        icon={ClipboardList}
        color="bg-slate-50 text-slate-600"
        delay={baseDelay + 0.05}
      />
      <PipelineCard
        label="En cours"
        amount={fmtEurPipeline(summary.inProgressRevenue)}
        sub={`${summary.inProgressCount} en production`}
        icon={Loader}
        color="bg-amber-50 text-amber-600"
        delay={baseDelay + 0.1}
      />
      <PipelineCard
        label="Prêtes"
        amount={fmtEurPipeline(summary.readyRevenue)}
        sub={`${summary.readyCount} à facturer`}
        icon={CheckCircle2}
        color="bg-blue-50 text-blue-600"
        delay={baseDelay + 0.15}
      />
    </div>
  );
}
