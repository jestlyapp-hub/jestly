"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Compass, Store, Target, TrendingUp, Rocket,
  Lock, Check, Clock, ChevronRight, Zap, Flag,
} from "lucide-react";
import type { EcomStage, EcomProgress, StageStatus } from "@/lib/ecom/types";
import {
  NODE_POSITIONS,
  PATH_D,
  SVG_VIEWBOX,
  NODE_ALIGN,
  PATH_MILESTONES,
  computePathProgress,
  isMilestoneReached,
  getStageCompletion,
} from "@/lib/ecom/path-config";

// ── Icons ──

const STAGE_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Compass, Store, Target, TrendingUp, Rocket,
};

// ── Status helpers ──

const isCurrent = (s: StageStatus) => s === "in_progress" || s === "pending_validation";
const isDone = (s: StageStatus) => s === "completed" || s === "validated";

function cardTranslateX(align: "right" | "left" | "center"): string {
  if (align === "center") return "-50%";
  return align === "right" ? "-8%" : "-92%";
}

// ── Difficulty label ──

const DIFFICULTY_DOT: Record<string, string> = {
  "débutant": "bg-emerald-400",
  "intermédiaire": "bg-amber-400",
  "avancé": "bg-red-400",
};

// ── Component ──

interface Props {
  stages: EcomStage[];
  progress: EcomProgress;
  onSelectStage: (id: string) => void;
}

export default function EcomPathView({ stages, progress, onSelectStage }: Props) {
  const pathProgress = useMemo(() => computePathProgress(stages), [stages]);

  return (
    <div className="flex flex-col h-full bg-white">

      {/* ════════════════ HEADER ════════════════ */}
      <div className="shrink-0 flex items-center justify-between px-8 py-4 border-b border-[#F0F0EE]">
        {/* Left — Title + context */}
        <div className="flex items-center gap-5">
          <div>
            <div className="flex items-center gap-2.5 mb-0.5">
              <h1 className="text-[18px] font-bold text-[#111827] tracking-tight">ECOM</h1>
              <div className="flex items-center gap-1 bg-[#EEF2FF] text-[#4F46E5] px-2 py-0.5 rounded-full text-[10px] font-bold">
                <Zap size={10} />
                Niv. {progress.level.number} · {progress.level.name}
              </div>
            </div>
            <p className="text-[12px] text-[#6B7280]">
              Votre parcours vers un e-commerce rentable
            </p>
          </div>
        </div>

        {/* Center — Progress */}
        <div className="flex items-center gap-6">
          {/* Global progress */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10">
              <svg viewBox="0 0 40 40" className="w-10 h-10 -rotate-90">
                <circle cx="20" cy="20" r="16" fill="none" stroke="#F3F4F6" strokeWidth="3" />
                <motion.circle
                  cx="20" cy="20" r="16"
                  fill="none"
                  stroke={progress.percentage === 100 ? "#059669" : "#6366F1"}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={100.53}
                  initial={{ strokeDashoffset: 100.53 }}
                  animate={{ strokeDashoffset: 100.53 * (1 - progress.percentage / 100) }}
                  transition={{ duration: 1, ease: "easeOut" as const }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-[#111827]">
                {progress.percentage}%
              </span>
            </div>
            <div>
              <p className="text-[12px] font-semibold text-[#111827]">{progress.xp} XP</p>
              <p className="text-[10px] text-[#9CA3AF]">{progress.estimatedTimeLeft}</p>
            </div>
          </div>

          {/* Next milestone */}
          {progress.actionsToNextStage > 0 && (
            <>
              <div className="w-px h-8 bg-[#F0F0EE]" />
              <div className="text-right">
                <p className="text-[10px] text-[#9CA3AF]">Prochaine étape</p>
                <p className="text-[12px] font-semibold text-[#111827]">
                  {progress.actionsToNextStage} action{progress.actionsToNextStage > 1 ? "s" : ""} → {progress.nextStageName}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Right — CTA */}
        <button
          onClick={() => onSelectStage(progress.currentStageId)}
          className="flex items-center gap-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-colors shadow-[0_2px_8px_rgba(79,70,229,0.25)]"
        >
          Reprendre mon étape
          <ChevronRight size={14} />
        </button>
      </div>

      {/* ════════════════ CANVAS ════════════════ */}
      <div className="flex-1 relative min-h-0 overflow-hidden">

        {/* ── Background ── */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAFAFA] to-[#F5F5F4]" />
        <div className="absolute top-[8%] left-[42%] w-[600px] h-[600px] rounded-full bg-[#6366F1]/[0.02] blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[15%] right-[10%] w-[400px] h-[400px] rounded-full bg-[#8B5CF6]/[0.015] blur-[100px] pointer-events-none" />

        {/* ── SVG Path ── */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox={SVG_VIEWBOX}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="pathGrad" x1="0" y1="100" x2="50" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>

          {/* Track */}
          <path
            d={PATH_D}
            stroke="#E5E7EB"
            strokeWidth={6}
            fill="none"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />

          {/* Glow */}
          <motion.path
            d={PATH_D}
            stroke="url(#pathGrad)"
            strokeWidth={18}
            fill="none"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            opacity={0.15}
            style={{ filter: "blur(6px)" }}
            pathLength={1}
            strokeDasharray={1}
            initial={{ strokeDashoffset: 1 }}
            animate={{ strokeDashoffset: 1 - pathProgress }}
            transition={{ duration: 1.2, ease: "easeOut" as const }}
          />

          {/* Progress */}
          <motion.path
            d={PATH_D}
            stroke="url(#pathGrad)"
            strokeWidth={6}
            fill="none"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            pathLength={1}
            strokeDasharray={1}
            initial={{ strokeDashoffset: 1 }}
            animate={{ strokeDashoffset: 1 - pathProgress }}
            transition={{ duration: 1.2, ease: "easeOut" as const }}
          />
        </svg>

        {/* ── Milestones ── */}
        {PATH_MILESTONES.map((m, i) => {
          const reached = isMilestoneReached(m.segment, m.t, pathProgress);
          return (
            <div
              key={i}
              className="absolute z-10 pointer-events-none"
              style={{
                left: `${m.x}%`,
                top: `${m.y}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div className="flex flex-col items-center gap-1">
                <span
                  className={`text-[8px] font-semibold whitespace-nowrap transition-all duration-700 ${
                    reached ? "text-[#6B7280]" : "text-[#D1D5DB]"
                  }`}
                >
                  {m.label}
                </span>
                <div
                  className={`w-[9px] h-[9px] rounded-full border-[2.5px] border-white transition-all duration-700 ${
                    reached
                      ? "bg-[#6366F1] shadow-[0_0_6px_rgba(99,102,241,0.3)]"
                      : "bg-[#D1D5DB]"
                  }`}
                />
              </div>
            </div>
          );
        })}

        {/* ── Summit marker ── */}
        <div
          className="absolute z-10 pointer-events-none"
          style={{ left: "50%", top: "3%", transform: "translateX(-50%)" }}
        >
          <div className="flex items-center gap-1.5 text-[#6366F1]/40">
            <Flag size={11} />
            <span className="text-[9px] font-bold uppercase tracking-wider">Business autonome</span>
          </div>
        </div>

        {/* ── Stage Nodes ── */}
        {stages.map((stage, i) => {
          const pos = NODE_POSITIONS[i];
          const align = NODE_ALIGN[i];
          const pct = getStageCompletion(stage);
          const current = isCurrent(stage.status);
          const done = isDone(stage.status);
          const locked = stage.status === "locked";
          const available = stage.status === "available";
          const Icon = STAGE_ICONS[stage.iconName] || Compass;
          const diffDot = DIFFICULTY_DOT[stage.difficulty] || "bg-gray-400";

          return (
            <div
              key={stage.id}
              className="absolute z-20"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: `translate(${cardTranslateX(align)}, -50%)`,
              }}
            >
              {/* Glow halo for active stage */}
              {current && (
                <motion.div
                  className="absolute -inset-3 rounded-[24px] bg-[#6366F1]/[0.06]"
                  animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.98, 1.01, 0.98] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
              )}

              <motion.button
                onClick={() => !locked && onSelectStage(stage.id)}
                whileHover={!locked ? { scale: 1.03, y: -3 } : undefined}
                whileTap={!locked ? { scale: 0.97 } : undefined}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={[
                  "relative flex items-start gap-3.5 bg-white rounded-[18px] text-left w-[260px] transition-all",
                  // Current
                  current && "border-2 border-[#6366F1]/40 shadow-[0_0_0_4px_rgba(99,102,241,0.06),0_12px_32px_rgba(99,102,241,0.12)] p-4",
                  // Done
                  done && "border border-emerald-200/60 shadow-[0_4px_16px_rgba(0,0,0,0.04)] p-[15px]",
                  // Available
                  available && "border border-[#E5E7EB] shadow-[0_4px_16px_rgba(0,0,0,0.04)] p-[15px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-[#D1D5DB]",
                  // Locked
                  locked && "border border-[#F0F0EE] shadow-[0_2px_8px_rgba(0,0,0,0.02)] p-[15px] opacity-50 cursor-not-allowed",
                ].filter(Boolean).join(" ")}
              >
                {/* Icon */}
                <div className={[
                  "shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center transition-all",
                  current && "bg-gradient-to-br from-[#4F46E5] to-[#6366F1] shadow-[0_2px_8px_rgba(99,102,241,0.3)]",
                  done && "bg-emerald-50 ring-1 ring-emerald-200/60",
                  available && "bg-[#F5F5F4] ring-1 ring-[#E5E7EB]",
                  locked && "bg-[#F5F5F4]",
                ].filter(Boolean).join(" ")}>
                  {locked ? (
                    <Lock size={16} className="text-[#C4C4C2]" />
                  ) : done ? (
                    <Check size={16} className="text-emerald-500" strokeWidth={2.5} />
                  ) : (
                    <Icon size={16} className={current ? "text-white" : "text-[#6B7280]"} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Label + badge */}
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] font-medium text-[#9CA3AF]">
                      Étape {stage.number}
                    </span>
                    {current && (
                      <span className="text-[8px] font-bold uppercase tracking-widest text-[#4F46E5] bg-[#EEF2FF] px-1.5 py-0.5 rounded-full">
                        En cours
                      </span>
                    )}
                    {done && (
                      <span className="text-[8px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                        Validée
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-[14px] font-semibold text-[#111827] leading-snug truncate">
                    {stage.title}
                  </h3>

                  {/* Subtitle */}
                  {!locked && (
                    <p className="text-[10px] text-[#9CA3AF] leading-tight mt-0.5 line-clamp-1">
                      {stage.subtitle}
                    </p>
                  )}

                  {!locked ? (
                    <>
                      {/* Progress bar */}
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-[5px] rounded-full bg-[#F3F4F6] overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${
                              done
                                ? "bg-emerald-400"
                                : "bg-gradient-to-r from-[#6366F1] to-[#8B5CF6]"
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" as const, delay: i * 0.06 }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-[#6B7280] tabular-nums w-8 text-right">
                          {pct}%
                        </span>
                      </div>

                      {/* Meta row */}
                      <div className="mt-1.5 flex items-center gap-3 text-[10px] text-[#9CA3AF]">
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {stage.estimatedDuration}
                        </span>
                        <span className="flex items-center gap-1">
                          <div className={`w-[5px] h-[5px] rounded-full ${diffDot}`} />
                          {stage.difficulty}
                        </span>
                        {!done && stage.unlock && (
                          <span className="text-[#6366F1] font-medium truncate">
                            → {stage.unlock.unlocks}
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    <p className="mt-1.5 text-[10px] text-[#C4C4C2] leading-snug">
                      {stage.unlock.condition}
                    </p>
                  )}
                </div>
              </motion.button>
            </div>
          );
        })}

        {/* ── Next action floating chip ── */}
        {progress.nextAction && (
          <div
            className="absolute z-30"
            style={{ left: "50%", bottom: "3%", transform: "translateX(-50%)" }}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="flex items-center gap-3 bg-white/90 backdrop-blur-sm border border-[#E5E7EB] rounded-2xl px-5 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.08)]"
            >
              <div className="w-8 h-8 rounded-xl bg-[#EEF2FF] flex items-center justify-center">
                <Zap size={14} className="text-[#4F46E5]" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-bold text-[#9CA3AF] uppercase tracking-wider">Prochaine action</p>
                <p className="text-[13px] font-semibold text-[#111827] truncate max-w-[280px]">
                  {progress.nextAction.task}
                </p>
              </div>
              <span className="text-[11px] font-bold text-[#6366F1] tabular-nums whitespace-nowrap">
                +{progress.nextAction.xp} XP
              </span>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
