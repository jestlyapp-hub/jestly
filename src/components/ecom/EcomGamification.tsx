"use client";

import { motion } from "framer-motion";
import {
  Flame, Trophy, ArrowRight, Zap,
  Target, Shield, Gauge,
  TrendingUp, AlertTriangle,
} from "lucide-react";
import type { EcomProgress, EcomBadge, EcomHealthScore } from "@/lib/ecom/types";

// ── Next Action Card ──

function NextActionCard({ progress }: { progress: EcomProgress }) {
  const { nextAction } = progress;
  if (!nextAction) return null;

  return (
    <div className="bg-gradient-to-br from-[#4F46E5] to-[#6366F1] rounded-xl p-3.5 text-white shadow-[0_2px_8px_rgba(79,70,229,0.25)]">
      <div className="flex items-center gap-1.5 mb-2">
        <Target size={12} className="text-white/80" />
        <span className="text-[9px] font-bold uppercase tracking-[0.08em] text-white/70">Action recommandée</span>
      </div>
      <p className="text-[12px] font-semibold leading-tight mb-1.5">{nextAction.task}</p>
      <p className="text-[10px] text-white/60 leading-relaxed mb-2.5">{nextAction.reason}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-white/50">{nextAction.stageTitle}</span>
          <ArrowRight size={9} className="text-white/30" />
        </div>
        <span className="text-[11px] font-bold text-white/90 flex items-center gap-1">
          <Zap size={10} />
          +{nextAction.xp} XP
        </span>
      </div>
      {nextAction.unlocks && (
        <div className="mt-2.5 pt-2 border-t border-white/10">
          <p className="text-[9px] text-white/50 flex items-center gap-1">
            <Shield size={9} />
            Débloque : {nextAction.unlocks}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Progression Card ──

function ProgressionCard({ progress }: { progress: EcomProgress }) {
  const { level, xpInLevel, xpLevelRange, xpToNext, streak } = progress;
  const pct = xpToNext > 0 ? (xpInLevel / xpLevelRange) * 100 : 100;

  return (
    <div className="bg-white border border-[#E6E6E4] rounded-xl p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="flex items-center gap-2 mb-3">
        <Zap size={12} className="text-[#4F46E5]" />
        <span className="text-[9px] font-bold text-[#5A5A58] uppercase tracking-[0.08em]">Votre progression</span>
      </div>

      {/* Level + XP */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#818CF8] flex items-center justify-center shadow-[0_2px_6px_rgba(79,70,229,0.25)]">
          <span className="text-[14px] font-black text-white">{level.number}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-bold text-[#191919]">{level.name}</p>
          <p className="text-[9px] text-[#8A8A88]">{progress.xp} XP au total</p>
        </div>
      </div>

      {/* XP bar */}
      <div className="mb-2.5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[9px] font-medium text-[#8A8A88]">Prochain niveau</span>
          {xpToNext > 0 && (
            <span className="text-[9px] font-semibold text-[#4F46E5] tabular-nums">+{xpToNext} XP</span>
          )}
        </div>
        <div className="h-[5px] bg-[#F0F0EE] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#4F46E5] to-[#818CF8] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" as const }}
          />
        </div>
      </div>

      {/* Streak */}
      {streak > 0 && (
        <div className="flex items-center gap-2 pt-2 border-t border-[#F0F0EE]">
          <Flame size={12} className="text-orange-500" />
          <span className="text-[11px] font-bold text-[#191919]">{streak} jours</span>
          <span className="text-[9px] text-[#8A8A88]">consécutifs</span>
          <div className="flex-1" />
          <div className="flex items-center gap-[3px]">
            {Array.from({ length: 7 }, (_, i) => (
              <div
                key={i}
                className={`w-[14px] h-[14px] rounded-[3px] flex items-center justify-center text-[7px] font-bold transition-colors ${
                  i < streak
                    ? "bg-orange-100 text-orange-600"
                    : "bg-[#F5F5F4] text-[#D6D3D1]"
                }`}
              >
                {["L", "M", "M", "J", "V", "S", "D"][i]}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Business Health Panel ──

function HealthPanel({ scores, globalReadiness }: { scores: EcomHealthScore[]; globalReadiness: number }) {
  const statusColors: Record<EcomHealthScore["status"], { bg: string; text: string; dot: string }> = {
    critique: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
    fragile:  { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
    correct:  { bg: "bg-[#EEF2FF]", text: "text-[#4F46E5]", dot: "bg-[#4F46E5]" },
    solide:   { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  };

  const statusLabel: Record<EcomHealthScore["status"], string> = {
    critique: "Critique",
    fragile: "Fragile",
    correct: "Correct",
    solide: "Solide",
  };

  let globalLabel: string;
  let globalColor: string;
  if (globalReadiness < 20) { globalLabel = "En préparation"; globalColor = "text-[#8A8A88]"; }
  else if (globalReadiness < 40) { globalLabel = "Fondations"; globalColor = "text-amber-600"; }
  else if (globalReadiness < 70) { globalLabel = "En croissance"; globalColor = "text-[#4F46E5]"; }
  else { globalLabel = "Phase scaling"; globalColor = "text-[#059669]"; }

  // Find weakest score
  const weakest = [...scores].sort((a, b) => a.value - b.value)[0];

  return (
    <div className="bg-white border border-[#E6E6E4] rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      {/* Header */}
      <div className="px-3.5 py-3 border-b border-[#F0F0EE]">
        <div className="flex items-center gap-2 mb-2">
          <Gauge size={12} className="text-[#5A5A58]" />
          <span className="text-[9px] font-bold text-[#5A5A58] uppercase tracking-[0.08em]">Santé du lancement</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[22px] font-black text-[#191919] tabular-nums leading-none">{globalReadiness}%</span>
          <div>
            <p className={`text-[11px] font-bold ${globalColor}`}>{globalLabel}</p>
            {weakest && weakest.value < 50 && (
              <p className="text-[9px] text-[#8A8A88] flex items-center gap-1 mt-0.5">
                <AlertTriangle size={8} className="text-amber-500" />
                Point faible : {weakest.label.toLowerCase()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Scores */}
      <div className="px-3.5 py-2.5 space-y-2">
        {scores.map((score) => {
          const sc = statusColors[score.status];
          return (
            <div key={score.id}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold text-[#5A5A58]">{score.label}</span>
                <span className={`text-[9px] font-semibold px-1.5 py-[1px] rounded ${sc.bg} ${sc.text}`}>
                  {statusLabel[score.status]}
                </span>
              </div>
              <div className="h-[3px] bg-[#F0F0EE] rounded-full overflow-hidden mb-1">
                <motion.div
                  className={`h-full rounded-full ${
                    score.status === "critique" ? "bg-red-500" :
                    score.status === "fragile" ? "bg-amber-500" :
                    score.status === "correct" ? "bg-[#4F46E5]" : "bg-emerald-500"
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${score.value}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" as const }}
                />
              </div>
              <p className="text-[9px] text-[#B0B0AE] leading-tight">{score.nextMove}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Badges Grid ──

function BadgesGrid({ badges }: { badges: EcomBadge[] }) {
  const tierColors: Record<EcomBadge["tier"], string> = {
    bronze: "ring-amber-200",
    argent: "ring-gray-300",
    or: "ring-yellow-400",
    platine: "ring-[#4F46E5]",
  };

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <div className="bg-white border border-[#E6E6E4] rounded-xl p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="flex items-center gap-2 mb-2.5">
        <Trophy size={12} className="text-[#D97706]" />
        <span className="text-[9px] font-bold text-[#5A5A58] uppercase tracking-[0.08em]">Accomplissements</span>
        <div className="flex-1" />
        <span className="text-[10px] font-semibold text-[#8A8A88] tabular-nums">
          {unlockedCount}/{badges.length}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {badges.map((badge) => (
          <motion.div
            key={badge.id}
            whileHover={badge.unlocked ? { scale: 1.06, y: -1 } : {}}
            transition={{ duration: 0.15 }}
            className={`relative flex flex-col items-center gap-1 py-2 px-1 rounded-lg transition-all duration-200 ${
              badge.unlocked
                ? `bg-[#FAFAFA] ring-1 ${tierColors[badge.tier]} cursor-default hover:bg-[#F5F5F4] hover:shadow-[0_1px_4px_rgba(0,0,0,0.06)]`
                : "opacity-25"
            }`}
            title={badge.unlocked ? `${badge.title} — ${badge.description}` : `${badge.title} — Non débloqué`}
          >
            <span className="text-[17px] leading-none">{badge.emoji}</span>
            <span className="text-[7px] font-semibold text-[#8A8A88] text-center leading-tight truncate w-full">
              {badge.title}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Next badge hint */}
      {(() => {
        const nextBadge = badges.find((b) => !b.unlocked);
        if (!nextBadge) return null;
        return (
          <div className="mt-2.5 pt-2 border-t border-[#F0F0EE] flex items-center gap-2">
            <TrendingUp size={10} className="text-[#B0B0AE]" />
            <span className="text-[9px] text-[#8A8A88]">Prochain : {nextBadge.title}</span>
          </div>
        );
      })()}
    </div>
  );
}

// ── Stats Row ──

function StatsRow({ progress }: { progress: EcomProgress }) {
  return (
    <div className="grid grid-cols-3 gap-1.5">
      <div className="bg-white border border-[#E6E6E4] rounded-lg px-2.5 py-2 text-center shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <p className="text-[13px] font-black text-[#191919] leading-none tabular-nums">{progress.completedTasks}/{progress.totalTasks}</p>
        <p className="text-[8px] font-semibold text-[#B0B0AE] uppercase mt-1 tracking-wide">Tâches</p>
      </div>
      <div className="bg-white border border-[#E6E6E4] rounded-lg px-2.5 py-2 text-center shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <p className="text-[13px] font-black text-[#191919] leading-none tabular-nums">{progress.completedModules}/{progress.totalModules}</p>
        <p className="text-[8px] font-semibold text-[#B0B0AE] uppercase mt-1 tracking-wide">Modules</p>
      </div>
      <div className="bg-white border border-[#E6E6E4] rounded-lg px-2.5 py-2 text-center shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <p className="text-[13px] font-black text-[#4F46E5] leading-none tabular-nums">{progress.xp}</p>
        <p className="text-[8px] font-semibold text-[#B0B0AE] uppercase mt-1 tracking-wide">XP Total</p>
      </div>
    </div>
  );
}

// ── Main Export ──

interface Props {
  progress: EcomProgress;
  badges: EcomBadge[];
}

export default function EcomGamification({ progress, badges }: Props) {
  return (
    <div className="w-[260px] flex-shrink-0 flex flex-col gap-2 overflow-y-auto min-h-0">
      <NextActionCard progress={progress} />
      <ProgressionCard progress={progress} />
      <StatsRow progress={progress} />
      <HealthPanel scores={progress.businessHealth} globalReadiness={progress.globalReadiness} />
      <BadgesGrid badges={badges} />
    </div>
  );
}
