"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  X,
  Archive,
  Lock,
  Unlock,
  FileDown,
} from "lucide-react";
import { formatEur, formatDateLong, formatDate } from "./facturation-types";

/* ══════════════════════════════════════════════════════════════════════
   ARCHIVES DRAWER
   ══════════════════════════════════════════════════════════════════════ */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ArchivesDrawer({ closures, exports, onClose, onReopen }: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  closures: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  exports: any[];
  onClose: () => void;
  onReopen: (closureId: string) => Promise<void>;
}) {
  const [reopening, setReopening] = useState<string | null>(null);

  const handleReopen = async (id: string) => {
    setReopening(id);
    await onReopen(id);
    setReopening(null);
  };

  // Sort closures: closed first, then by date desc
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sorted = [...closures].sort((a: any, b: any) => {
    if (a.period_year !== b.period_year) return b.period_year - a.period_year;
    return b.period_month - a.period_month;
  });

  // Total closed revenue
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalClosedHt = sorted.filter((c: any) => c.status === "closed").reduce((s: number, c: any) => s + Number(c.total_ht || 0), 0);

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
        className="fixed right-0 top-0 h-screen w-[580px] max-w-full bg-white border-l border-[#E6E6E4] z-50 flex flex-col shadow-2xl"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 300 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F0EE]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F0EEFF] flex items-center justify-center">
              <Archive size={16} className="text-[#7C3AED]" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-[#1A1A1A]">Archives de périodes</h2>
              <p className="text-[11px] text-[#A8A29E]">{sorted.length} période{sorted.length > 1 ? "s" : ""} · Revenu clôturé : {formatEur(totalClosedHt)}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#A8A29E] hover:text-[#57534E] hover:bg-[#F5F5F4] transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {sorted.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#F5F5F4] flex items-center justify-center mx-auto mb-5">
                <Archive size={24} className="text-[#D6D3D1]" />
              </div>
              <p className="text-[14px] font-semibold text-[#44403C]">Aucune période archivée</p>
              <p className="text-[13px] text-[#A8A29E] mt-1.5">
                Clôturez un mois pour le retrouver ici.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#F0F0EE]">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {sorted.map((closure: any) => {
                const isClosed = closure.status === "closed";
                const snapshot = closure.snapshot || {};
                // Find related exports
                const relatedExports = exports.filter(
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (e: any) => (snapshot.export_ids || []).includes(e.id)
                );

                return (
                  <div key={closure.id} className="px-6 py-5">
                    {/* Period header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold ${
                          isClosed
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-amber-50 text-amber-600"
                        }`}>
                          {isClosed ? <Lock size={10} /> : <Unlock size={10} />}
                          {isClosed ? "Clôturée" : "Réouverte"}
                        </span>
                        <h3 className="text-[15px] font-bold text-[#1A1A1A] capitalize">{closure.period_label}</h3>
                      </div>
                      {isClosed && (
                        <button
                          onClick={() => handleReopen(closure.id)}
                          disabled={reopening === closure.id}
                          className="text-[11px] font-medium text-[#A8A29E] hover:text-[#57534E] transition-colors flex items-center gap-1 disabled:opacity-50"
                        >
                          <Unlock size={11} />
                          {reopening === closure.id ? "..." : "Rouvrir"}
                        </button>
                      )}
                    </div>

                    {/* Totals grid */}
                    <div className="grid grid-cols-5 gap-3 mb-3">
                      {[
                        { label: "HT", value: formatEur(Number(closure.total_ht || 0)), bold: true },
                        { label: "TVA", value: formatEur(Number(closure.total_tva || 0)) },
                        { label: "TTC", value: formatEur(Number(closure.total_ttc || 0)), bold: true },
                        { label: "Lignes", value: String(closure.item_count || 0) },
                        { label: "Clients", value: String(closure.client_count || 0) },
                      ].map(col => (
                        <div key={col.label}>
                          <div className="text-[10px] font-medium text-[#A8A29E] uppercase tracking-wider">{col.label}</div>
                          <div className={`text-[13px] tabular-nums mt-0.5 ${col.bold ? "font-bold text-[#1A1A1A]" : "text-[#57534E]"}`}>
                            {col.value}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Status breakdown */}
                    <div className="flex items-center gap-3 mb-2">
                      {[
                        { label: "Exportées", count: snapshot.exported || 0, color: "bg-cyan-400" },
                        { label: "Facturées", count: snapshot.invoiced || 0, color: "bg-emerald-400" },
                        { label: "Brouillons", count: snapshot.drafts || 0, color: "bg-[#A8A29E]" },
                      ].filter(s => s.count > 0).map(s => (
                        <span key={s.label} className="flex items-center gap-1 text-[10px] text-[#78716C]">
                          <span className={`w-1.5 h-1.5 rounded-full ${s.color}`} />
                          {s.count} {s.label.toLowerCase()}
                        </span>
                      ))}
                    </div>

                    {/* Top clients */}
                    {(snapshot.top_clients || []).length > 0 && (
                      <div className="mt-2">
                        <div className="flex items-center flex-wrap gap-1.5">
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {(snapshot.top_clients || []).slice(0, 4).map((tc: any, idx: number) => (
                            <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-[#F5F5F4] text-[#57534E]">
                              {tc.name} · {formatEur(tc.total_ht)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Related exports */}
                    {relatedExports.length > 0 && (
                      <div className="mt-2.5 flex items-center gap-1.5">
                        <FileDown size={11} className="text-[#A8A29E]" />
                        <span className="text-[10px] text-[#A8A29E]">{relatedExports.length} export{relatedExports.length > 1 ? "s" : ""} associé{relatedExports.length > 1 ? "s" : ""}</span>
                      </div>
                    )}

                    {/* Notes */}
                    {closure.notes && (
                      <div className="mt-2 text-[11px] text-[#78716C] italic bg-[#FAFAF9] px-3 py-2 rounded-md">
                        {closure.notes}
                      </div>
                    )}

                    {/* Closed date */}
                    <div className="mt-2 text-[10px] text-[#C4C4C2]">
                      {isClosed ? "Clôturée" : "Réouverte"} le {formatDateLong(closure.closed_at || closure.reopened_at)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
