"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { Subscription } from "@/types/subscription";
import {
  project12Months,
  getHeatmapLevel,
  simulateSavings,
  monthlyAmount,
  exportCsv,
} from "@/lib/subscriptions/helpers";
import { Download, X } from "lucide-react";

// ── Heatmap colors ───────────────────────────────────────────────

const HEATMAP_COLORS = {
  low: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" },
  medium: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700" },
  high: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700" },
  danger: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700" },
};

// ── Projection view ──────────────────────────────────────────────

function ProjectionGrid({ subs }: { subs: Subscription[] }) {
  const months = useMemo(() => project12Months(subs), [subs]);
  const avgTotal = months.reduce((s, m) => s + m.total, 0) / 12;

  return (
    <div>
      <h3 className="text-[13px] font-semibold text-[#191919] mb-4">Projection 12 mois</h3>
      <div className="overflow-x-auto -mx-1 pb-2">
        <div className="flex gap-3 px-1" style={{ minWidth: "max-content" }}>
          {months.map((month, i) => {
            const level = getHeatmapLevel(month.total, avgTotal);
            const colors = HEATMAP_COLORS[level];
            return (
              <motion.div
                key={month.month}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`w-[120px] flex-shrink-0 rounded-xl border p-3.5 ${colors.bg} ${colors.border}`}
              >
                <p className="text-[11px] font-medium text-[#8A8A88] mb-1">{month.label}</p>
                <p className={`text-[18px] font-bold ${colors.text}`}>{month.total.toFixed(0)}€</p>
                <p className="text-[10px] text-[#AAA] mt-0.5">
                  {month.count} paiement{month.count > 1 ? "s" : ""}
                </p>
                {month.items.some((it) => it.isRenewal) && (
                  <span className="inline-block mt-1.5 text-[9px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full">
                    Renouvellement
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Savings simulator ────────────────────────────────────────────

function SavingsSimulator({ subs }: { subs: Subscription[] }) {
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const active = useMemo(() => subs.filter((s) => s.status === "active").sort((a, b) => monthlyAmount(b) - monthlyAmount(a)), [subs]);
  const result = useMemo(() => simulateSavings(subs, Array.from(removedIds)), [subs, removedIds]);

  const toggle = (id: string) => {
    setRemovedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div>
      <h3 className="text-[13px] font-semibold text-[#191919] mb-1">Simulateur d&apos;économies</h3>
      <p className="text-[11px] text-[#AAA] mb-4">Clique sur un abonnement pour simuler sa suppression</p>

      <div className="flex flex-wrap gap-2 mb-5">
        {active.map((sub) => {
          const removed = removedIds.has(sub.id);
          return (
            <motion.button
              key={sub.id}
              onClick={() => toggle(sub.id)}
              whileTap={{ scale: 0.95 }}
              className={`text-[12px] font-medium px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                removed
                  ? "border-red-300 bg-red-50 text-red-600 line-through"
                  : "border-[#E6E6E4] bg-white text-[#191919] hover:border-[#D0D0CE]"
              }`}
            >
              {sub.name} · {monthlyAmount(sub).toFixed(0)}€
              {removed && <X size={12} className="inline ml-1" />}
            </motion.button>
          );
        })}
      </div>

      {/* Results */}
      <motion.div
        key={removedIds.size}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-3 gap-4"
      >
        <div className="bg-[#F7F7F5] rounded-xl p-4 text-center">
          <p className="text-[10px] text-[#AAA] uppercase tracking-wider mb-1">Actuel</p>
          <p className="text-[18px] font-bold text-[#191919]">{result.currentMonthly.toFixed(0)}€<span className="text-[11px] font-normal text-[#AAA]">/mois</span></p>
        </div>
        <div className={`rounded-xl p-4 text-center ${result.savings > 0 ? "bg-emerald-50" : "bg-[#F7F7F5]"}`}>
          <p className="text-[10px] text-[#AAA] uppercase tracking-wider mb-1">Économie</p>
          <p className={`text-[18px] font-bold ${result.savings > 0 ? "text-emerald-600" : "text-[#191919]"}`}>
            {result.savings > 0 ? "-" : ""}{result.savings.toFixed(0)}€<span className="text-[11px] font-normal text-[#AAA]">/mois</span>
          </p>
        </div>
        <div className={`rounded-xl p-4 text-center ${result.savings > 0 ? "bg-emerald-50" : "bg-[#F7F7F5]"}`}>
          <p className="text-[10px] text-[#AAA] uppercase tracking-wider mb-1">Sur 1 an</p>
          <p className={`text-[18px] font-bold ${result.yearlySavings > 0 ? "text-emerald-600" : "text-[#191919]"}`}>
            {result.yearlySavings > 0 ? "-" : ""}{result.yearlySavings.toFixed(0)}€
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// ── Export button ─────────────────────────────────────────────────

function ExportButton({ subs }: { subs: Subscription[] }) {
  const handleExport = () => {
    const csv = exportCsv(subs);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `abonnements-jestly-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 text-[12px] font-medium text-[#5A5A58] hover:text-[#191919] bg-white border border-[#E6E6E4] hover:border-[#D0D0CE] px-3 py-2 rounded-lg transition-colors cursor-pointer"
    >
      <Download size={14} />
      Export CSV
    </button>
  );
}

// ── Main ─────────────────────────────────────────────────────────

export default function SubsProjection({ subs }: { subs: Subscription[] }) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div />
        <ExportButton subs={subs} />
      </div>
      <div className="bg-white rounded-xl border border-[#E6E6E4] p-5">
        <ProjectionGrid subs={subs} />
      </div>
      <div className="bg-white rounded-xl border border-[#E6E6E4] p-5">
        <SavingsSimulator subs={subs} />
      </div>
    </div>
  );
}
