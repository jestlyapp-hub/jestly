"use client";

import { motion } from "framer-motion";
import {
  X,
  History,
  Download,
} from "lucide-react";
import { formatEur, formatDateLong, formatDate } from "./facturation-types";

/* ══════════════════════════════════════════════════════════════════════
   EXPORTS DRAWER
   ══════════════════════════════════════════════════════════════════════ */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ExportsDrawer({ exports, onClose }: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  exports: any[];
  onClose: () => void;
}) {
  // Compute totals
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalExportedHt = exports.reduce((s: number, e: any) => s + Number(e.total_ht || 0), 0);

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
        className="fixed right-0 top-0 h-screen w-[520px] max-w-full bg-white border-l border-[#E6E6E4] z-50 flex flex-col shadow-2xl"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 300 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F0EE]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F0EEFF] flex items-center justify-center">
              <History size={16} className="text-[#7C3AED]" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-[#191919]">Historique des exports</h2>
              <p className="text-[11px] text-[#A8A29E]">{exports.length} export{exports.length > 1 ? "s" : ""} · Total {formatEur(totalExportedHt)} HT</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#A8A29E] hover:text-[#57534E] hover:bg-[#F5F5F4] transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {exports.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#F5F5F4] flex items-center justify-center mx-auto mb-5">
                <Download size={24} className="text-[#D6D3D1]" />
              </div>
              <p className="text-[14px] font-semibold text-[#44403C]">Aucun export</p>
              <p className="text-[13px] text-[#A8A29E] mt-1.5">
                Vos exports CSV et PDF apparaîtront ici après téléchargement.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#F0F0EE]">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {exports.map((exp: any) => (
                <div key={exp.id} className="px-6 py-4 hover:bg-[#FAFAF9] transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-[9px] font-bold uppercase ${
                          exp.format === "pdf"
                            ? "bg-red-50 text-red-600"
                            : "bg-emerald-50 text-emerald-600"
                        }`}>
                          {exp.format}
                        </span>
                        <div className="text-[13px] font-medium text-[#191919] truncate">{exp.filename || exp.label}</div>
                      </div>
                      <div className="text-[11px] text-[#A8A29E] mt-1.5 flex items-center gap-2 flex-wrap">
                        <span>{formatDateLong(exp.created_at)}</span>
                        <span className="text-[#D6D3D1]">·</span>
                        <span>{exp.item_count} ligne{exp.item_count > 1 ? "s" : ""}</span>
                        {exp.client_count > 0 && (
                          <>
                            <span className="text-[#D6D3D1]">·</span>
                            <span>{exp.client_count} client{exp.client_count > 1 ? "s" : ""}</span>
                          </>
                        )}
                      </div>
                      {exp.period_start && exp.period_end && (
                        <div className="text-[11px] text-[#A8A29E] mt-0.5">
                          Période : {formatDate(exp.period_start)} → {formatDate(exp.period_end)}
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <div className="text-[14px] font-bold text-[#191919] tabular-nums">{formatEur(Number(exp.total_ht || 0))}</div>
                      {Number(exp.total_tva || 0) > 0 && (
                        <div className="text-[11px] text-[#A8A29E] tabular-nums mt-0.5">
                          TVA {formatEur(Number(exp.total_tva))}
                        </div>
                      )}
                      {Number(exp.total_ttc || 0) > Number(exp.total_ht || 0) && (
                        <div className="text-[11px] text-[#78716C] font-semibold tabular-nums">
                          TTC {formatEur(Number(exp.total_ttc))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
