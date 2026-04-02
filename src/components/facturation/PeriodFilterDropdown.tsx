"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, ChevronDown, X, Check, ArrowRight } from "lucide-react";
import {
  type PeriodFilter,
  PERIOD_ALL,
  buildShortcutPresets,
  buildMonthPresets,
  buildQuarterPresets,
} from "@/lib/period-filter";

type TabId = "shortcuts" | "months" | "quarters" | "custom";

const TABS: { id: TabId; label: string }[] = [
  { id: "shortcuts", label: "Raccourcis" },
  { id: "months", label: "Mois" },
  { id: "quarters", label: "Trimestres" },
  { id: "custom", label: "Personnalisé" },
];

interface Props {
  value: PeriodFilter;
  onChange: (filter: PeriodFilter) => void;
}

export default function PeriodFilterDropdown({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<TabId>("shortcuts");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const shortcuts = useMemo(() => buildShortcutPresets(), []);
  const months = useMemo(() => buildMonthPresets(18), []);
  const quarters = useMemo(() => buildQuarterPresets(8), []);

  const isActive = value.range !== null;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const select = useCallback(
    (label: string, range: { start: string; end: string }) => {
      onChange({ label, range });
      setOpen(false);
    },
    [onChange],
  );

  const reset = useCallback(() => {
    onChange(PERIOD_ALL);
    setCustomStart("");
    setCustomEnd("");
    setOpen(false);
  }, [onChange]);

  const applyCustom = useCallback(() => {
    if (!customStart || !customEnd) return;
    if (customStart > customEnd) return;
    const fmt = (iso: string) => {
      const [y, m, d] = iso.split("-");
      return `${d}/${m}/${y}`;
    };
    select(`${fmt(customStart)} → ${fmt(customEnd)}`, { start: customStart, end: customEnd });
  }, [customStart, customEnd, select]);

  // Determine if a given range matches the current selection
  const isSelected = useCallback(
    (range: { start: string; end: string }) => {
      if (!value.range) return false;
      return value.range.start === range.start && value.range.end === range.end;
    },
    [value.range],
  );

  return (
    <div ref={containerRef} className="relative">
      {/* ── Trigger Button ── */}
      <button
        onClick={() => setOpen(!open)}
        className={`
          flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium rounded-lg border transition-all cursor-pointer
          ${isActive
            ? "bg-[#F0EEFF] border-[#DDD6FE] text-[#6D28D9]"
            : "bg-white border-[#E6E6E4] text-[#57534E] hover:bg-[#FAFAF9]"
          }
        `}
      >
        <Calendar size={12} className={isActive ? "text-[#7C3AED]" : "text-[#A8A29E]"} />
        <span className="max-w-[200px] truncate">{value.label}</span>
        <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""} ${isActive ? "text-[#7C3AED]" : "text-[#A8A29E]"}`} />
      </button>

      {/* ── Dropdown Panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full mt-1.5 z-50 bg-white border border-[#E6E6E4] rounded-xl shadow-lg shadow-black/[0.06] w-[340px] overflow-hidden"
          >
            {/* ── Header with tabs ── */}
            <div className="flex items-center border-b border-[#F0F0EE] bg-[#FAFAF9] px-1 py-1">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`
                    flex-1 px-2 py-1.5 text-[11px] font-medium rounded-lg transition-all cursor-pointer
                    ${tab === t.id
                      ? "bg-white text-[#1A1A1A] shadow-sm border border-[#E6E6E4]"
                      : "text-[#78716C] hover:text-[#57534E] hover:bg-white/60"
                    }
                  `}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* ── Content ── */}
            <div className="max-h-[320px] overflow-y-auto overscroll-contain">
              {/* Raccourcis */}
              {tab === "shortcuts" && (
                <div className="p-1.5">
                  {shortcuts.map((preset) => {
                    const r = preset.range();
                    const selected = isSelected(r);
                    return (
                      <button
                        key={preset.id}
                        onClick={() => select(preset.label, r)}
                        className={`
                          w-full flex items-center justify-between px-3 py-2 text-[12px] rounded-lg transition-all cursor-pointer
                          ${selected
                            ? "bg-[#F0EEFF] text-[#6D28D9] font-medium"
                            : "text-[#3D3D3D] hover:bg-[#FAFAF9]"
                          }
                        `}
                      >
                        <span>{preset.label}</span>
                        {selected && <Check size={13} className="text-[#7C3AED]" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Mois */}
              {tab === "months" && (
                <div className="p-1.5">
                  {months.map((mo) => {
                    const r = mo.range();
                    const selected = isSelected(r);
                    return (
                      <button
                        key={`${mo.year}-${mo.month}`}
                        onClick={() => select(mo.label, r)}
                        className={`
                          w-full flex items-center justify-between px-3 py-2 text-[12px] rounded-lg transition-all cursor-pointer
                          ${selected
                            ? "bg-[#F0EEFF] text-[#6D28D9] font-medium"
                            : "text-[#3D3D3D] hover:bg-[#FAFAF9]"
                          }
                        `}
                      >
                        <span>{mo.label}</span>
                        {selected && <Check size={13} className="text-[#7C3AED]" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Trimestres */}
              {tab === "quarters" && (
                <div className="p-1.5">
                  {quarters.map((q) => {
                    const r = q.range();
                    const selected = isSelected(r);
                    return (
                      <button
                        key={`${q.year}-Q${q.quarter}`}
                        onClick={() => select(q.label, r)}
                        className={`
                          w-full flex items-center justify-between px-3 py-2 text-[12px] rounded-lg transition-all cursor-pointer
                          ${selected
                            ? "bg-[#F0EEFF] text-[#6D28D9] font-medium"
                            : "text-[#3D3D3D] hover:bg-[#FAFAF9]"
                          }
                        `}
                      >
                        <span>{q.label}</span>
                        {selected && <Check size={13} className="text-[#7C3AED]" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Personnalisé */}
              {tab === "custom" && (
                <div className="p-3 space-y-3">
                  <div>
                    <label className="block text-[11px] font-medium text-[#57534E] mb-1">Date de début</label>
                    <input
                      type="date"
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                      className="w-full px-3 py-2 text-[12px] text-[#191919] border border-[#E6E6E4] rounded-lg bg-white focus:outline-none focus:border-[#7C3AED]/40 focus:ring-2 focus:ring-[#7C3AED]/8 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#57534E] mb-1">Date de fin</label>
                    <input
                      type="date"
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      min={customStart || undefined}
                      className="w-full px-3 py-2 text-[12px] text-[#191919] border border-[#E6E6E4] rounded-lg bg-white focus:outline-none focus:border-[#7C3AED]/40 focus:ring-2 focus:ring-[#7C3AED]/8 transition-all"
                    />
                  </div>
                  {customStart && customEnd && customStart > customEnd && (
                    <p className="text-[11px] text-red-500">La date de fin doit être postérieure à la date de début.</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={applyCustom}
                      disabled={!customStart || !customEnd || customStart > customEnd}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-[12px] font-medium text-white bg-[#7C3AED] rounded-lg hover:bg-[#6D28D9] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      <ArrowRight size={12} />
                      Appliquer
                    </button>
                    {(customStart || customEnd) && (
                      <button
                        onClick={() => { setCustomStart(""); setCustomEnd(""); }}
                        className="px-3 py-2 text-[12px] font-medium text-[#78716C] border border-[#E6E6E4] rounded-lg hover:bg-[#FAFAF9] transition-all cursor-pointer"
                      >
                        Effacer
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ── Footer: reset ── */}
            {isActive && (
              <div className="border-t border-[#F0F0EE] px-3 py-2">
                <button
                  onClick={reset}
                  className="flex items-center gap-1.5 text-[11px] font-medium text-[#7C3AED] hover:text-[#6D28D9] transition-colors cursor-pointer"
                >
                  <X size={12} />
                  Réinitialiser le filtre
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
