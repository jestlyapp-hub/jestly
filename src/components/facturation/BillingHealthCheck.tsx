"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Lightbulb,
  CircleAlert,
  CircleCheck,
  Info,
  ChevronDown,
  ChevronUp,
  Zap,
  TriangleAlert,
} from "lucide-react";
import type { HealthData, HealthAnomaly, HealthSuggestion } from "./facturation-types";
import { formatEur } from "./facturation-types";

/* ══════════════════════════════════════════════════════════════════════
   ANOMALY CARD
   ══════════════════════════════════════════════════════════════════════ */

function AnomalyCard({ anomaly }: { anomaly: HealthAnomaly }) {
  const icon = anomaly.severity === "error"
    ? <CircleAlert size={13} className="text-red-500 shrink-0 mt-0.5" />
    : anomaly.severity === "warning"
      ? <TriangleAlert size={13} className="text-amber-500 shrink-0 mt-0.5" />
      : <Info size={13} className="text-blue-400 shrink-0 mt-0.5" />;

  const border = anomaly.severity === "error"
    ? "border-red-100 bg-red-50/40"
    : anomaly.severity === "warning"
      ? "border-amber-100 bg-amber-50/30"
      : "border-[#F0F0EE] bg-[#FAFAF9]";

  return (
    <div className={`flex items-start gap-2.5 px-3 py-2.5 rounded-lg border ${border}`}>
      {icon}
      <div className="min-w-0 flex-1">
        <div className="text-[12px] font-medium text-[#191919]">{anomaly.title}</div>
        <div className="text-[11px] text-[#78716C] mt-0.5 leading-relaxed">{anomaly.description}</div>
        {anomaly.fix && (
          <div className="text-[11px] text-[#7C3AED] mt-1 font-medium">{anomaly.fix}</div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   SUGGESTION CARD
   ══════════════════════════════════════════════════════════════════════ */

function SuggestionCard({ suggestion, onAct, disabled }: { suggestion: HealthSuggestion; onAct?: () => void; disabled?: boolean }) {
  const isActionable = suggestion.type === "unbilled_order" || suggestion.type === "missing_recurring";
  return (
    <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg border border-[#E8E5F5] bg-[#FAFAFF]">
      <Zap size={13} className="text-violet-500 shrink-0 mt-0.5" />
      <div className="min-w-0 flex-1">
        <div className="text-[12px] font-medium text-[#191919]">{suggestion.title}</div>
        <div className="text-[11px] text-[#78716C] mt-0.5 leading-relaxed">{suggestion.description}</div>
        <div className="flex items-center gap-3 mt-1.5">
          {suggestion.amount != null && suggestion.amount > 0 && (
            <span className="text-[11px] font-semibold text-[#6D28D9] tabular-nums">{formatEur(suggestion.amount)}</span>
          )}
          {isActionable && onAct ? (
            <button
              onClick={(e) => { e.stopPropagation(); onAct(); }}
              disabled={disabled}
              className="text-[11px] font-semibold text-white bg-[#7C3AED] px-2.5 py-1 rounded-md hover:bg-[#6D28D9] transition-colors disabled:opacity-60 disabled:pointer-events-none"
            >
              {suggestion.action}
            </button>
          ) : (
            <span className="text-[11px] text-[#7C3AED] font-medium">{suggestion.action}</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   BILLING HEALTH PANEL
   ══════════════════════════════════════════════════════════════════════ */

export default function BillingHealthPanel({ health, expanded, onToggle, onActSuggestion, mutating }: {
  health: HealthData;
  expanded: boolean;
  onToggle: () => void;
  onActSuggestion: (suggestion: HealthSuggestion) => void;
  mutating?: boolean;
}) {
  const { score, anomalies, suggestions, counts } = health;
  const totalIssues = counts.errors + counts.warnings + counts.suggestions;

  const scoreColor = score >= 80
    ? "text-emerald-600"
    : score >= 50
      ? "text-amber-600"
      : "text-red-600";

  const scoreBg = score >= 80
    ? "bg-emerald-50 border-emerald-100"
    : score >= 50
      ? "bg-amber-50 border-amber-100"
      : "bg-red-50 border-red-100";

  const scoreIcon = score >= 80
    ? <ShieldCheck size={18} className="text-emerald-500" />
    : score >= 50
      ? <TriangleAlert size={18} className="text-amber-500" />
      : <CircleAlert size={18} className="text-red-500" />;

  // Group anomalies by severity
  const errors = anomalies.filter(a => a.severity === "error");
  const warnings = anomalies.filter(a => a.severity === "warning");

  return (
    <div className="rounded-xl border border-[#E6E6E4] bg-white overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      {/* Header — always visible */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#FAFAF9] transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-4">
          {/* Score badge */}
          <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${scoreBg}`}>
            {scoreIcon}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2.5">
              <span className="text-[14px] font-semibold text-[#191919]">Santé de la facturation</span>
              <span className={`text-[13px] font-bold tabular-nums ${scoreColor}`}>{score}/100</span>
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              {counts.errors > 0 && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-red-600">
                  <CircleAlert size={11} /> {counts.errors} erreur{counts.errors > 1 ? "s" : ""}
                </span>
              )}
              {counts.warnings > 0 && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-amber-600">
                  <TriangleAlert size={11} /> {counts.warnings} avertissement{counts.warnings > 1 ? "s" : ""}
                </span>
              )}
              {counts.suggestions > 0 && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-violet-600">
                  <Lightbulb size={11} /> {counts.suggestions} suggestion{counts.suggestions > 1 ? "s" : ""}
                </span>
              )}
              {totalIssues === 0 && (
                <span className="text-[11px] text-emerald-600 font-medium">Tout est en ordre</span>
              )}
            </div>
          </div>
        </div>
        <div className="text-[#A8A29E]">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-[#F0F0EE]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                {/* Anomalies column */}
                {(errors.length > 0 || warnings.length > 0) && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <CircleAlert size={14} className="text-amber-500" />
                      <span className="text-[12px] font-semibold text-[#44403C] uppercase tracking-wider">Anomalies détectées</span>
                    </div>
                    <div className="space-y-2">
                      {errors.map(a => (
                        <AnomalyCard key={a.id} anomaly={a} />
                      ))}
                      {warnings.slice(0, 5).map(a => (
                        <AnomalyCard key={a.id} anomaly={a} />
                      ))}
                      {warnings.length > 5 && (
                        <div className="text-[11px] text-[#A8A29E] pl-3">
                          + {warnings.length - 5} autre{warnings.length - 5 > 1 ? "s" : ""} avertissement{warnings.length - 5 > 1 ? "s" : ""}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Suggestions column */}
                {suggestions.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb size={14} className="text-violet-500" />
                      <span className="text-[12px] font-semibold text-[#44403C] uppercase tracking-wider">Facturation potentiellement oubliée</span>
                    </div>
                    <div className="space-y-2">
                      {suggestions.slice(0, 6).map(s => (
                        <SuggestionCard key={s.id} suggestion={s} onAct={() => onActSuggestion(s)} disabled={mutating} />
                      ))}
                      {suggestions.length > 6 && (
                        <div className="text-[11px] text-[#A8A29E] pl-3">
                          + {suggestions.length - 6} autre{suggestions.length - 6 > 1 ? "s" : ""} suggestion{suggestions.length - 6 > 1 ? "s" : ""}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
