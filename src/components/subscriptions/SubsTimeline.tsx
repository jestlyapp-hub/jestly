"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { Subscription } from "@/types/subscription";
import { CATEGORY_CONFIG } from "@/types/subscription";
import {
  monthlyAmount,
  nextBillingDate,
  daysUntilBilling,
  isUrgent,
} from "@/lib/subscriptions/helpers";
import { AlertTriangle } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────

interface TimelineEntry {
  sub: Subscription;
  date: Date;
  days: number;
  amount: number;
}

// ── Build timeline for current month ─────────────────────────────

function buildTimeline(subs: Subscription[]): { entries: TimelineEntry[]; totalMonth: number; monthLabel: string } {
  const now = new Date();
  const entries: TimelineEntry[] = [];

  for (const sub of subs.filter((s) => s.status === "active")) {
    const date = nextBillingDate(sub, now);
    // Only include if billing is this month or next month
    const monthDiff = (date.getFullYear() - now.getFullYear()) * 12 + date.getMonth() - now.getMonth();
    if (monthDiff <= 1) {
      entries.push({
        sub,
        date,
        days: daysUntilBilling(sub, now),
        amount: sub.billing_frequency === "monthly"
          ? sub.amount_cents / 100
          : sub.billing_frequency === "quarterly"
          ? sub.amount_cents / 100
          : sub.amount_cents / 100,
      });
    }
  }

  entries.sort((a, b) => a.date.getTime() - b.date.getTime());

  const totalMonth = entries
    .filter((e) => e.date.getMonth() === now.getMonth())
    .reduce((sum, e) => sum + e.amount, 0);

  const monthLabel = now.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  return { entries, totalMonth, monthLabel };
}

// ── Component ────────────────────────────────────────────────────

export default function SubsTimeline({ subs }: { subs: Subscription[] }) {
  const { entries, totalMonth, monthLabel } = useMemo(() => buildTimeline(subs), [subs]);
  const maxAmount = Math.max(...entries.map((e) => e.amount), 1);

  if (entries.length === 0) {
    return (
      <div className="text-center py-16 text-[#AAA]">
        <p className="text-[14px]">Aucun prélèvement prévu</p>
      </div>
    );
  }

  return (
    <div>
      {/* Month header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[16px] font-bold text-[#191919] capitalize">{monthLabel}</h2>
        <div className="text-right">
          <p className="text-[20px] font-bold text-[#191919]">{totalMonth.toFixed(0)}€</p>
          <p className="text-[11px] text-[#AAA]">{entries.length} prélèvement{entries.length > 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[52px] top-0 bottom-0 w-px bg-[#E6E6E4]" />

        <div className="space-y-1">
          {entries.map((entry, i) => {
            const urgent = isUrgent(entry.sub);
            const catConfig = CATEGORY_CONFIG[entry.sub.category];
            const barWidth = Math.max(15, (entry.amount / maxAmount) * 100);

            return (
              <motion.div
                key={entry.sub.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`flex items-center gap-4 py-2.5 px-3 rounded-lg transition-colors ${
                  urgent ? "bg-red-50/50" : "hover:bg-[#F7F7F5]"
                }`}
              >
                {/* Date */}
                <div className="w-10 text-right flex-shrink-0">
                  <p className={`text-[13px] font-bold ${urgent ? "text-red-600" : "text-[#191919]"}`}>
                    {entry.date.getDate()}
                  </p>
                  <p className="text-[9px] text-[#BBB] uppercase">
                    {entry.date.toLocaleDateString("fr-FR", { month: "short" })}
                  </p>
                </div>

                {/* Dot */}
                <div className="relative z-10">
                  {urgent ? (
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-3 h-3 rounded-full bg-red-500 border-2 border-white shadow"
                    />
                  ) : (
                    <div
                      className="w-3 h-3 rounded-full border-2 border-white shadow"
                      style={{ backgroundColor: catConfig.color }}
                    />
                  )}
                </div>

                {/* Bar + Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${barWidth}%` }}
                      transition={{ duration: 0.5, delay: i * 0.03 }}
                      className="h-6 rounded-md flex items-center px-2"
                      style={{ backgroundColor: `${catConfig.color}15`, borderLeft: `3px solid ${catConfig.color}` }}
                    >
                      <span className="text-[11px] font-semibold text-[#191919] truncate">{entry.sub.name}</span>
                    </motion.div>
                  </div>
                </div>

                {/* Amount */}
                <div className="text-right flex-shrink-0 w-16">
                  <p className={`text-[14px] font-bold ${urgent ? "text-red-600" : "text-[#191919]"}`}>
                    {entry.amount.toFixed(0)}€
                  </p>
                  {urgent && (
                    <p className="text-[9px] text-red-500 flex items-center gap-0.5 justify-end">
                      <AlertTriangle size={9} />
                      {entry.days <= 0 ? "Aujourd'hui" : `dans ${entry.days}j`}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
