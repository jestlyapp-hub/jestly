"use client";

import { motion } from "framer-motion";
import { Zap, Flame, ArrowRight, Gauge, Clock, Unlock } from "lucide-react";
import type { EcomProgress } from "@/lib/ecom/types";

interface Props {
  progress: EcomProgress;
  onContinue: () => void;
}

export default function EcomHeader({ progress, onContinue }: Props) {
  const {
    level, xp, xpToNext, xpInLevel, xpLevelRange,
    streak, percentage, nextAction,
    actionsToNextStage, nextStageName,
    globalReadiness, estimatedDaysLeft,
  } = progress;

  const levelProgress = xpToNext > 0 ? xpInLevel / xpLevelRange : 1;

  return (
    <div className="flex items-stretch gap-0 bg-white border border-[#E6E6E4] rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">

      {/* ── Left: Title + context ── */}
      <div className="flex items-center gap-4 px-5 py-3 border-r border-[#F0F0EE] flex-shrink-0">
        {/* Level badge */}
        <div className="relative">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#6366F1] flex items-center justify-center shadow-[0_2px_8px_rgba(79,70,229,0.25)]">
            <span className="text-[15px] font-black text-white">{level.number}</span>
          </div>
          {streak > 0 && (
            <div className="absolute -top-1.5 -right-1.5 flex items-center gap-0.5 bg-orange-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
              <Flame size={8} />
              {streak}
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-[15px] font-bold text-[#191919] tracking-tight">ECOM</h1>
            <div className="h-3 w-px bg-[#E6E6E4]" />
            <span className="text-[11px] font-semibold text-[#4F46E5]">{level.name}</span>
          </div>
          <p className="text-[11px] text-[#8A8A88] leading-tight">
            {actionsToNextStage > 0
              ? `Encore ${actionsToNextStage} action${actionsToNextStage > 1 ? "s" : ""} pour débloquer ${nextStageName}`
              : "Toutes les tâches de l'étape sont complètes"
            }
          </p>
        </div>
      </div>

      {/* ── Center: Metrics band ── */}
      <div className="flex items-center gap-5 px-5 py-3 flex-1 min-w-0">

        {/* XP Progress */}
        <div className="flex items-center gap-2.5 min-w-0">
          <Zap size={14} className="text-[#4F46E5] flex-shrink-0" />
          <div className="w-28">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-[#191919]">{xp} XP</span>
              {xpToNext > 0 && (
                <span className="text-[9px] text-[#B0B0AE] font-medium">+{xpToNext} → niv.{level.number + 1}</span>
              )}
            </div>
            <div className="h-[5px] bg-[#F0F0EE] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#4F46E5] to-[#818CF8] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${levelProgress * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" as const }}
              />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-7 bg-[#F0F0EE] flex-shrink-0" />

        {/* Global progress ring */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="relative w-9 h-9">
            <svg viewBox="0 0 36 36" className="w-9 h-9 -rotate-90">
              <circle cx="18" cy="18" r="14.5" fill="none" stroke="#F0F0EE" strokeWidth="2.5" />
              <motion.circle
                cx="18" cy="18" r="14.5"
                fill="none"
                stroke="#4F46E5"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 14.5}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 14.5 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 14.5 * (1 - percentage / 100) }}
                transition={{ duration: 1, ease: "easeOut" as const }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[#191919]">
              {percentage}%
            </span>
          </div>
          <span className="text-[11px] font-medium text-[#5A5A58]">complété</span>
        </div>

        {/* Divider */}
        <div className="w-px h-7 bg-[#F0F0EE] flex-shrink-0" />

        {/* Readiness */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Gauge size={14} className="text-[#5A5A58]" />
          <div>
            <span className="text-[11px] font-semibold text-[#191919]">{globalReadiness}%</span>
            <span className="text-[10px] text-[#8A8A88] ml-1">prêt</span>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-7 bg-[#F0F0EE] flex-shrink-0" />

        {/* Time est. */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Clock size={13} className="text-[#8A8A88]" />
          <span className="text-[11px] text-[#8A8A88]">~{estimatedDaysLeft}j</span>
        </div>
      </div>

      {/* ── Right: CTA ── */}
      {nextAction && (
        <div className="flex items-center px-4 border-l border-[#F0F0EE] flex-shrink-0">
          <button
            onClick={onContinue}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] active:bg-[#3730A3] text-white text-[12px] font-semibold rounded-lg transition-all duration-150 cursor-pointer shadow-[0_1px_3px_rgba(79,70,229,0.3)] hover:shadow-[0_2px_6px_rgba(79,70,229,0.35)]"
          >
            <Unlock size={13} />
            Continuer
            <ArrowRight size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
