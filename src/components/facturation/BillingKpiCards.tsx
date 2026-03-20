"use client";

import {
  Plus,
  Receipt,
  RotateCcw,
} from "lucide-react";
import { formatEur } from "./facturation-types";

/* ══════════════════════════════════════════════════════════════════════
   KPI CARD
   ══════════════════════════════════════════════════════════════════════ */

export function KpiCard({ icon, label, value, sub, accent, warn }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
  warn?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-4 transition-all hover:shadow-sm ${
      accent
        ? "bg-[#FAFAFF] border-[#E8E5F5]"
        : warn
          ? "bg-amber-50/40 border-amber-100"
          : "bg-white border-[#E6E6E4]"
    }`}>
      <div className="flex items-center gap-1.5 mb-2.5">
        <span className={accent ? "text-[#7C3AED]" : warn ? "text-amber-500" : "text-[#A8A29E]"}>{icon}</span>
        <span className="text-[11px] font-semibold text-[#A8A29E] uppercase tracking-wider">{label}</span>
      </div>
      <div className={`text-[20px] font-bold tabular-nums tracking-tight ${
        accent ? "text-[#6D28D9]" : warn ? "text-amber-700" : "text-[#191919]"
      }`}>
        {value}
      </div>
      {sub && <div className="text-[11px] text-[#A8A29E] mt-0.5">{sub}</div>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   EMPTY STATE
   ══════════════════════════════════════════════════════════════════════ */

export function EmptyState({ hasItems, hasFilters, onClear }: {
  hasItems: boolean;
  hasFilters: boolean;
  onClear: () => void;
}) {
  return (
    <div className="py-20 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[#F5F5F4] flex items-center justify-center mx-auto mb-5">
        <Receipt size={24} className="text-[#D6D3D1]" />
      </div>
      {!hasItems ? (
        <>
          <p className="text-[15px] font-semibold text-[#44403C]">Aucune commande à suivre</p>
          <p className="text-[13px] text-[#A8A29E] mt-1.5 mb-6 max-w-sm mx-auto">
            Les commandes livrées apparaîtront automatiquement ici pour piloter votre facturation.
          </p>
          <a
            href="/commandes"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-white bg-[#7C3AED] px-5 py-2.5 rounded-lg hover:bg-[#6D28D9] transition-colors shadow-sm shadow-[#7C3AED]/20"
          >
            <Plus size={14} strokeWidth={2.5} />
            Créer une commande
          </a>
        </>
      ) : (
        <>
          <p className="text-[15px] font-semibold text-[#44403C]">Aucun résultat</p>
          <p className="text-[13px] text-[#A8A29E] mt-1.5 mb-5">
            {hasFilters ? "Aucune commande ne correspond à vos filtres." : "Essayez une autre recherche."}
          </p>
          {hasFilters && (
            <button
              onClick={onClear}
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#7C3AED] hover:bg-[#F0EEFF] px-4 py-2 rounded-lg transition-colors"
            >
              <RotateCcw size={13} />
              Réinitialiser les filtres
            </button>
          )}
        </>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   SUMMARY BAR
   ══════════════════════════════════════════════════════════════════════ */

export function SummaryBar({ count, total }: { count: number; total: number }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-[#FAFAF9] border-t border-[#F0F0EE]">
      <span className="text-[12px] text-[#A8A29E]">
        {count} commande{count > 1 ? "s" : ""}
      </span>
      <span className="text-[13px] font-bold text-[#191919] tabular-nums">
        Total HT : {formatEur(total)}
      </span>
    </div>
  );
}
