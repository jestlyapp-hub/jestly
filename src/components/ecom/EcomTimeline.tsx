"use client";

import { motion } from "framer-motion";
import {
  Compass, Store, Target, TrendingUp, Rocket,
  Lock, Check, ChevronRight, Clock,
} from "lucide-react";
import type { EcomStage, StageStatus } from "@/lib/ecom/types";

const ICONS: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>> = {
  Compass, Store, Target, TrendingUp, Rocket,
};

const STATUS_CONFIG: Record<StageStatus, {
  bg: string; text: string; ring: string; label: string; dot: string;
}> = {
  locked: {
    bg: "bg-[#F5F5F4]", text: "text-[#C4C4C2]", ring: "ring-[#E6E6E4]",
    label: "Verrouillé", dot: "bg-[#D6D3D1]",
  },
  available: {
    bg: "bg-[#EEF2FF]", text: "text-[#4F46E5]", ring: "ring-[#C7D2FE]",
    label: "Disponible", dot: "bg-[#818CF8]",
  },
  in_progress: {
    bg: "bg-[#EEF2FF]", text: "text-[#4F46E5]", ring: "ring-[#4F46E5]/40",
    label: "En cours", dot: "bg-[#4F46E5]",
  },
  pending_validation: {
    bg: "bg-[#FEF3C7]", text: "text-[#D97706]", ring: "ring-[#FCD34D]/50",
    label: "En validation", dot: "bg-[#F59E0B]",
  },
  validated: {
    bg: "bg-[#ECFDF5]", text: "text-[#059669]", ring: "ring-[#6EE7B7]/50",
    label: "Validé", dot: "bg-[#059669]",
  },
  completed: {
    bg: "bg-[#ECFDF5]", text: "text-[#059669]", ring: "ring-[#6EE7B7]/50",
    label: "Terminé", dot: "bg-[#059669]",
  },
};

interface Props {
  stages: EcomStage[];
  selectedStageId: string;
  onSelect: (id: string) => void;
}

export default function EcomTimeline({ stages, selectedStageId, onSelect }: Props) {
  return (
    <div className="flex flex-col w-[240px] flex-shrink-0 bg-white border border-[#E6E6E4] rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      {/* Title */}
      <div className="px-4 py-3 border-b border-[#F0F0EE]">
        <p className="text-[10px] font-bold text-[#B0B0AE] uppercase tracking-[0.08em]">
          Parcours e-commerce
        </p>
      </div>

      {/* Stages list */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        {stages.map((stage, idx) => {
          const isSelected = stage.id === selectedStageId;
          const isLocked = stage.status === "locked";
          const isDone = stage.status === "completed" || stage.status === "validated";
          const isActive = stage.status === "in_progress";
          const config = STATUS_CONFIG[stage.status];
          const Icon = ICONS[stage.iconName] || Compass;
          const completedCount = stage.tasks.filter((t) => t.completed).length;
          const totalCount = stage.tasks.length;
          const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

          return (
            <div key={stage.id} className="relative">
              {/* Connecting line */}
              {idx < stages.length - 1 && (
                <div className="absolute left-[22px] top-[60px] bottom-[-4px] flex justify-center z-0">
                  <div
                    className={`w-[2px] rounded-full transition-colors duration-500 ${
                      isDone ? "bg-[#6EE7B7]" : isActive ? "bg-[#C7D2FE]" : "bg-[#EFEFEF]"
                    }`}
                  />
                </div>
              )}

              <motion.button
                type="button"
                onClick={() => !isLocked && onSelect(stage.id)}
                disabled={isLocked}
                whileHover={isLocked ? {} : { x: 2 }}
                whileTap={isLocked ? {} : { scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className={`relative z-10 w-full flex items-start gap-3 px-2.5 py-3 rounded-xl text-left transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-[#F8F7FF] border border-[#4F46E5]/15 shadow-[0_0_0_1px_rgba(79,70,229,0.06),0_1px_4px_rgba(79,70,229,0.08)]"
                    : isLocked
                      ? "opacity-45 cursor-not-allowed"
                      : "hover:bg-[#FBFBFA] border border-transparent"
                }`}
              >
                {/* Icon */}
                <div className={`w-9 h-9 rounded-lg ${config.bg} ring-1 ${config.ring} flex items-center justify-center flex-shrink-0 transition-all duration-300`}>
                  {isLocked ? (
                    <Lock size={14} className={config.text} strokeWidth={2} />
                  ) : isDone ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    >
                      <Check size={14} className={config.text} strokeWidth={2.5} />
                    </motion.div>
                  ) : (
                    <Icon size={14} className={config.text} strokeWidth={1.8} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={`text-[12px] font-semibold truncate leading-none ${
                      isSelected ? "text-[#4F46E5]" : isLocked ? "text-[#C4C4C2]" : "text-[#191919]"
                    }`}>
                      {stage.title}
                    </span>
                    {isSelected && (
                      <ChevronRight size={11} className="text-[#4F46E5] flex-shrink-0" />
                    )}
                  </div>

                  {/* Objective line */}
                  {!isLocked && (
                    <p className="text-[9px] text-[#8A8A88] leading-tight mb-1.5 line-clamp-1">
                      {stage.objective}
                    </p>
                  )}

                  {/* Progress bar + meta */}
                  {!isLocked ? (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-[3px] bg-[#F0F0EE] rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${isDone ? "bg-[#059669]" : "bg-[#4F46E5]"}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, ease: "easeOut" as const }}
                        />
                      </div>
                      <span className="text-[9px] font-semibold text-[#B0B0AE] flex-shrink-0 tabular-nums">
                        {pct}%
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <Lock size={9} className="text-[#D6D3D1]" />
                      <span className="text-[9px] text-[#C4C4C2] font-medium">{config.label}</span>
                    </div>
                  )}

                  {/* Duration & status badges */}
                  {!isLocked && (
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex items-center gap-1">
                        <Clock size={9} className="text-[#C4C4C2]" />
                        <span className="text-[9px] text-[#B0B0AE]">{stage.estimatedDuration}</span>
                      </div>
                      <div className={`flex items-center gap-1`}>
                        <div className={`w-[5px] h-[5px] rounded-full ${config.dot}`} />
                        <span className="text-[9px] font-medium text-[#8A8A88]">{config.label}</span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
