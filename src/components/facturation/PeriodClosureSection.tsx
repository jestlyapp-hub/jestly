"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  X,
  ClipboardCheck,
  Lock,
  FileDown,
  FileText,
  CircleCheck,
  CircleAlert,
  TriangleAlert,
  Lightbulb,
  Zap,
} from "lucide-react";
import type { HealthData } from "./facturation-types";
import { formatEur, formatDateLong } from "./facturation-types";

/* ══════════════════════════════════════════════════════════════════════
   MONTHLY CLOSE DRAWER
   ══════════════════════════════════════════════════════════════════════ */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function MonthlyCloseDrawer({ health, closures, onClose, onExportCsv, onExportPdf, onClosePeriod }: {
  health: HealthData;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  closures: any[];
  onClose: () => void;
  onExportCsv: () => void;
  onExportPdf: () => void;
  onClosePeriod: (year: number, month: number, notes?: string) => Promise<void>;
}) {
  const { checklist, month, anomalies, suggestions, score } = health;
  const doneCount = checklist.filter(c => c.done).length;
  const allDone = doneCount === checklist.length;
  const [closing, setClosing] = useState(false);
  const [closeNotes, setCloseNotes] = useState("");

  const scoreColor = score >= 80 ? "text-emerald-600" : score >= 50 ? "text-amber-600" : "text-red-600";
  const scoreLabel = score >= 80 ? "Excellent" : score >= 50 ? "À améliorer" : "Attention requise";

  // Check if current month is already closed
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existingClosure = closures.find((c: any) =>
    c.period_year === currentYear && c.period_month === currentMonth && c.status === "closed"
  );

  const handleClose = async () => {
    setClosing(true);
    await onClosePeriod(currentYear, currentMonth, closeNotes || undefined);
    setClosing(false);
  };

  return (
    <>
      <motion.div
        className="fixed inset-0 bg-black/15 z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="fixed right-0 top-0 h-screen w-[560px] max-w-full bg-white border-l border-[#E6E6E4] z-50 flex flex-col shadow-2xl"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 300 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F0EE]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F0EEFF] flex items-center justify-center">
              <ClipboardCheck size={16} className="text-[#7C3AED]" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-[#191919]">Clôture mensuelle</h2>
              <p className="text-[11px] text-[#A8A29E] capitalize">{month.label}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {existingClosure && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                <Lock size={10} />
                Clôturée
              </span>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg text-[#A8A29E] hover:text-[#57534E] hover:bg-[#F5F5F4] transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Month summary */}
          <div className="px-6 py-5 bg-[#FAFAF9] border-b border-[#F0F0EE]">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-[11px] font-semibold text-[#A8A29E] uppercase tracking-wider mb-1">CA du mois</div>
                <div className="text-[20px] font-bold text-[#191919] tabular-nums">{formatEur(month.totalHt)}</div>
                <div className="text-[11px] text-[#A8A29E]">{month.totalItems} prestation{month.totalItems > 1 ? "s" : ""}</div>
              </div>
              <div>
                <div className="text-[11px] font-semibold text-[#A8A29E] uppercase tracking-wider mb-1">Prêt à exporter</div>
                <div className="text-[20px] font-bold text-[#7C3AED] tabular-nums">{formatEur(month.readyHt)}</div>
                <div className="text-[11px] text-[#A8A29E]">{month.ready} ligne{month.ready > 1 ? "s" : ""}</div>
              </div>
              <div>
                <div className="text-[11px] font-semibold text-[#A8A29E] uppercase tracking-wider mb-1">Score santé</div>
                <div className={`text-[20px] font-bold tabular-nums ${scoreColor}`}>{score}/100</div>
                <div className="text-[11px] text-[#A8A29E]">{scoreLabel}</div>
              </div>
            </div>

            {/* Progress mini-bars */}
            <div className="mt-4 grid grid-cols-4 gap-2">
              {[
                { label: "Brouillons", count: month.drafts, color: "bg-[#A8A29E]" },
                { label: "Prêtes", count: month.ready, color: "bg-violet-500" },
                { label: "Exportées", count: month.exported, color: "bg-cyan-500" },
                { label: "Facturées", count: month.invoiced, color: "bg-emerald-500" },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <div className="text-[16px] font-bold text-[#191919] tabular-nums">{s.count}</div>
                  <div className="flex items-center gap-1 justify-center mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${s.color}`} />
                    <span className="text-[10px] text-[#A8A29E]">{s.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Checklist */}
          <div className="px-6 py-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ClipboardCheck size={14} className="text-[#7C3AED]" />
                <span className="text-[13px] font-semibold text-[#191919]">Checklist de clôture</span>
              </div>
              <span className={`text-[12px] font-semibold tabular-nums ${allDone ? "text-emerald-600" : "text-[#A8A29E]"}`}>
                {doneCount}/{checklist.length}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-[#F0F0EE] rounded-full mb-5 overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${allDone ? "bg-emerald-500" : "bg-[#7C3AED]"}`}
                initial={{ width: 0 }}
                animate={{ width: `${(doneCount / checklist.length) * 100}%` }}
                transition={{ duration: 0.6, ease: "easeOut" as const }}
              />
            </div>

            <div className="space-y-2">
              {checklist.map(item => (
                <div
                  key={item.id}
                  className={`flex items-start gap-3 px-3.5 py-3 rounded-lg border transition-all ${
                    item.done
                      ? "border-emerald-100 bg-emerald-50/30"
                      : item.severity === "error"
                        ? "border-red-100 bg-red-50/30"
                        : item.severity === "warning"
                          ? "border-amber-100 bg-amber-50/20"
                          : "border-[#F0F0EE] bg-[#FAFAF9]"
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {item.done ? (
                      <CircleCheck size={16} className="text-emerald-500" />
                    ) : item.severity === "error" ? (
                      <CircleAlert size={16} className="text-red-500" />
                    ) : item.severity === "warning" ? (
                      <TriangleAlert size={16} className="text-amber-500" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-[#D6D3D1]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-[13px] font-medium ${item.done ? "text-emerald-700" : "text-[#191919]"}`}>
                      {item.label}
                    </div>
                    <div className="text-[11px] text-[#78716C] mt-0.5 leading-relaxed">{item.description}</div>
                  </div>
                  {!item.done && item.count != null && item.count > 0 && (
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${
                      item.severity === "error" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"
                    }`}>
                      {item.count}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Anomalies summary */}
          {anomalies.length > 0 && (
            <div className="px-6 pb-5">
              <div className="flex items-center gap-2 mb-3">
                <CircleAlert size={14} className="text-amber-500" />
                <span className="text-[12px] font-semibold text-[#44403C] uppercase tracking-wider">
                  {anomalies.length} anomalie{anomalies.length > 1 ? "s" : ""} restante{anomalies.length > 1 ? "s" : ""}
                </span>
              </div>
              <div className="space-y-1.5">
                {anomalies.slice(0, 4).map(a => (
                  <div key={a.id} className="flex items-center gap-2 px-3 py-2 rounded-md bg-[#FAFAF9] border border-[#F0F0EE]">
                    {a.severity === "error"
                      ? <CircleAlert size={12} className="text-red-500 shrink-0" />
                      : <TriangleAlert size={12} className="text-amber-500 shrink-0" />
                    }
                    <span className="text-[12px] text-[#57534E] truncate flex-1">{a.description}</span>
                  </div>
                ))}
                {anomalies.length > 4 && (
                  <div className="text-[11px] text-[#A8A29E] pl-3">
                    + {anomalies.length - 4} autre{anomalies.length - 4 > 1 ? "s" : ""}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Suggestions summary */}
          {suggestions.length > 0 && (
            <div className="px-6 pb-5">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb size={14} className="text-violet-500" />
                <span className="text-[12px] font-semibold text-[#44403C] uppercase tracking-wider">
                  Facturation potentiellement oubliée
                </span>
              </div>
              <div className="space-y-1.5">
                {suggestions.slice(0, 3).map(s => (
                  <div key={s.id} className="flex items-center gap-2 px-3 py-2 rounded-md bg-[#FAFAFF] border border-[#E8E5F5]">
                    <Zap size={12} className="text-violet-500 shrink-0" />
                    <span className="text-[12px] text-[#57534E] truncate flex-1">{s.title}</span>
                    {s.amount != null && s.amount > 0 && (
                      <span className="text-[11px] font-semibold text-[#6D28D9] tabular-nums shrink-0">{formatEur(s.amount)}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Close notes */}
          {!existingClosure && (
            <div className="px-6 pb-5">
              <label className="block text-[12px] font-medium text-[#57534E] mb-1.5">Notes de clôture (optionnel)</label>
              <textarea
                value={closeNotes}
                onChange={e => setCloseNotes(e.target.value)}
                placeholder="Ex: RAS, tout a été facturé..."
                className="w-full px-3.5 py-2.5 text-[13px] text-[#191919] border border-[#E6E6E4] rounded-lg bg-white focus:outline-none focus:border-[#7C3AED]/40 focus:ring-2 focus:ring-[#7C3AED]/8 placeholder:text-[#C4C4C2] transition-all resize-none h-16"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#F0F0EE] space-y-2.5">
          {existingClosure ? (
            <div className="text-center py-2">
              <div className="flex items-center justify-center gap-2 text-emerald-600 mb-2">
                <Lock size={14} />
                <span className="text-[13px] font-semibold">Période clôturée</span>
              </div>
              <p className="text-[11px] text-[#A8A29E]">
                Clôturée le {formatDateLong(existingClosure.closed_at)}
              </p>
            </div>
          ) : (
            <>
              {/* Export buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { onExportCsv(); }}
                  className="py-2.5 text-[12px] font-medium text-[#57534E] border border-[#E6E6E4] rounded-lg hover:bg-[#F5F5F4] transition-colors flex items-center justify-center gap-1.5"
                >
                  <FileDown size={13} />
                  Export CSV
                </button>
                <button
                  onClick={() => { onExportPdf(); }}
                  className="py-2.5 text-[12px] font-medium text-[#57534E] border border-[#E6E6E4] rounded-lg hover:bg-[#F5F5F4] transition-colors flex items-center justify-center gap-1.5"
                >
                  <FileText size={13} className="text-red-500" />
                  Export PDF
                </button>
              </div>

              {/* Close button */}
              {allDone ? (
                <button
                  onClick={handleClose}
                  disabled={closing}
                  className="w-full py-3 text-[13px] font-semibold text-white bg-[#7C3AED] rounded-lg hover:bg-[#6D28D9] transition-colors shadow-sm shadow-[#7C3AED]/20 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <Lock size={14} />
                  {closing ? "Clôture en cours…" : "Clôturer la période"}
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="text-center">
                    <span className="text-[12px] text-[#A8A29E]">
                      {checklist.length - doneCount} point{checklist.length - doneCount > 1 ? "s" : ""} à résoudre avant de clôturer
                    </span>
                  </div>
                  <button
                    onClick={handleClose}
                    disabled={closing}
                    className="w-full py-3 text-[13px] font-medium text-[#57534E] border border-[#E6E6E4] rounded-lg hover:bg-[#F5F5F4] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    <Lock size={14} />
                    {closing ? "Clôture en cours…" : "Clôturer quand même"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </>
  );
}
