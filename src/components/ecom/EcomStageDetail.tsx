"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, ListChecks, ShieldCheck, StickyNote,
  ClipboardList, Check, AlertTriangle,
  Lightbulb, Ban, Activity, ChevronDown, ChevronUp,
  Play, Sparkles, Save, Clock, Zap,
  Unlock, ArrowRight, Star, AlertCircle, Circle,
  type LucideIcon,
} from "lucide-react";
import type { EcomStage, TaskPriority, InsightType, ModuleImportance } from "@/lib/ecom/types";

// ── Config maps ──

const PRIORITY_STYLES: Record<TaskPriority, { bg: string; text: string; label: string; border: string }> = {
  normal:     { bg: "bg-transparent", text: "text-[#8A8A88]", label: "", border: "border-transparent" },
  important:  { bg: "bg-amber-50", text: "text-amber-700", label: "Important", border: "border-amber-100" },
  blocking:   { bg: "bg-red-50", text: "text-red-700", label: "Bloquant", border: "border-red-100" },
  validation: { bg: "bg-indigo-50", text: "text-[#4F46E5]", label: "Validation", border: "border-indigo-100" },
};

const IMPORTANCE_CONFIG: Record<ModuleImportance, { label: string; color: string; icon: LucideIcon }> = {
  fondation:  { label: "Fondation indispensable", color: "text-[#4F46E5]", icon: Star },
  recommandé: { label: "Recommandé", color: "text-amber-600", icon: Sparkles },
  avancé:     { label: "Avancé", color: "text-[#8A8A88]", icon: Zap },
};

const INSIGHT_ICONS: Record<InsightType, React.ReactNode> = {
  tip:     <Lightbulb size={13} className="text-[#4F46E5]" />,
  warning: <AlertTriangle size={13} className="text-amber-500" />,
  trap:    <Ban size={13} className="text-red-500" />,
  signal:  <Activity size={13} className="text-emerald-500" />,
};

const INSIGHT_BG: Record<InsightType, string> = {
  tip:     "bg-[#EEF2FF] border-[#E0E7FF]",
  warning: "bg-amber-50/80 border-amber-100",
  trap:    "bg-red-50/80 border-red-100",
  signal:  "bg-emerald-50/80 border-emerald-100",
};

// ── Tabs ──

type Tab = "modules" | "taches" | "validation" | "notes";

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "modules", label: "Modules", icon: <BookOpen size={13} /> },
  { key: "taches", label: "Tâches", icon: <ListChecks size={13} /> },
  { key: "validation", label: "Validation", icon: <ShieldCheck size={13} /> },
  { key: "notes", label: "Notes", icon: <StickyNote size={13} /> },
];

// ── Props ──

interface Props {
  stage: EcomStage;
  onToggleTask: (stageId: string, taskId: string) => void;
  onToggleModule: (stageId: string, moduleId: string) => void;
  onToggleChecklistItem: (stageId: string, clIdx: number, itemIdx: number) => void;
  onUpdateNotes: (stageId: string, notes: string) => void;
  onValidate: (stageId: string) => void;
}

export default function EcomStageDetail({
  stage, onToggleTask, onToggleModule, onToggleChecklistItem,
  onUpdateNotes, onValidate,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("taches");
  const [checklistsOpen, setChecklistsOpen] = useState<Record<number, boolean>>({});
  const [notesSaved, setNotesSaved] = useState(false);
  const notesTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const isLocked = stage.status === "locked";
  const completedTasks = stage.tasks.filter((t) => t.completed).length;
  const totalTasks = stage.tasks.length;
  const completedModules = stage.modules.filter((m) => m.completed).length;
  const totalModules = stage.modules.length;
  const pct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const remainingTasks = totalTasks - completedTasks;

  useEffect(() => {
    setActiveTab("taches");
    setChecklistsOpen({});
  }, [stage.id]);

  const handleNotesChange = useCallback(
    (value: string) => {
      onUpdateNotes(stage.id, value);
      if (notesTimeoutRef.current) clearTimeout(notesTimeoutRef.current);
      setNotesSaved(false);
      notesTimeoutRef.current = setTimeout(() => setNotesSaved(true), 800);
    },
    [stage.id, onUpdateNotes]
  );

  const toggleChecklist = useCallback((idx: number) => {
    setChecklistsOpen((prev) => ({ ...prev, [idx]: !prev[idx] }));
  }, []);

  // ── Locked state ──
  if (isLocked) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white border border-[#E6E6E4] rounded-xl">
        <div className="text-center px-8">
          <div className="w-16 h-16 rounded-2xl bg-[#F5F5F4] flex items-center justify-center mx-auto mb-4 ring-1 ring-[#E6E6E4]">
            <ShieldCheck size={26} className="text-[#C4C4C2]" />
          </div>
          <p className="text-[15px] font-bold text-[#191919] mb-1.5">Étape verrouillée</p>
          <p className="text-[13px] text-[#8A8A88] max-w-xs leading-relaxed">
            Terminez et validez l'étape précédente pour débloquer cette section.
          </p>
          {stage.unlock && (
            <div className="mt-4 inline-flex items-center gap-1.5 text-[11px] text-[#B0B0AE] bg-[#F5F5F4] px-3 py-1.5 rounded-full">
              <Unlock size={11} />
              Débloque : {stage.unlock.unlocks}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      key={stage.id}
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" as const }}
      className="flex-1 flex flex-col min-w-0 min-h-0 bg-white border border-[#E6E6E4] rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
    >
      {/* ── Summary bar ── */}
      <div className="px-5 py-3.5 border-b border-[#F0F0EE] bg-[#FAFAFA]">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] font-bold text-[#4F46E5] uppercase tracking-[0.08em] bg-[#EEF2FF] px-2 py-0.5 rounded">
                Étape {stage.number}
              </span>
              <span className={`text-[9px] font-semibold px-2 py-0.5 rounded ${
                stage.difficulty === "avancé" ? "text-red-600 bg-red-50" :
                stage.difficulty === "intermédiaire" ? "text-amber-600 bg-amber-50" : "text-emerald-600 bg-emerald-50"
              }`}>
                {stage.difficulty.charAt(0).toUpperCase() + stage.difficulty.slice(1)}
              </span>
              <span className="text-[9px] text-[#B0B0AE] flex items-center gap-1">
                <Clock size={9} />
                {stage.estimatedDuration}
              </span>
            </div>
            <h2 className="text-[17px] font-bold text-[#191919] leading-tight">{stage.title}</h2>
            <p className="text-[12px] text-[#5A5A58] mt-0.5">{stage.subtitle}</p>

            {/* Unlock info */}
            <div className="flex items-center gap-3 mt-2.5">
              <div className="flex items-center gap-1.5 text-[10px] text-[#4F46E5] font-medium bg-[#EEF2FF] px-2.5 py-1 rounded-md">
                <Unlock size={10} />
                Débloque : {stage.unlock.unlocks}
              </div>
              {remainingTasks > 0 && (
                <span className="text-[10px] text-[#8A8A88]">
                  {remainingTasks} tâche{remainingTasks > 1 ? "s" : ""} restante{remainingTasks > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>

          {/* Score + progress */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {stage.score && (
              <div className="bg-white rounded-xl px-3.5 py-2.5 text-center border border-[#E6E6E4] shadow-[0_1px_2px_rgba(0,0,0,0.04)] min-w-[90px]">
                <p className="text-[9px] font-bold text-[#4F46E5] uppercase tracking-[0.06em] mb-1">
                  {stage.score.label}
                </p>
                <p className="text-[22px] font-black text-[#191919] leading-none tabular-nums">
                  {stage.score.value}<span className="text-[12px] text-[#B0B0AE] font-semibold">/{stage.score.max}</span>
                </p>
              </div>
            )}
            <div className="text-center min-w-[56px]">
              <div className="relative w-12 h-12 mx-auto">
                <svg viewBox="0 0 48 48" className="w-12 h-12 -rotate-90">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="#F0F0EE" strokeWidth="3" />
                  <motion.circle
                    cx="24" cy="24" r="20"
                    fill="none"
                    stroke={pct === 100 ? "#059669" : "#4F46E5"}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 20}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 20 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 20 * (1 - pct / 100) }}
                    transition={{ duration: 0.8, ease: "easeOut" as const }}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-[#191919]">
                  {pct}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-0 px-4 border-b border-[#F0F0EE] bg-white">
        {TABS.map((tab) => {
          if (tab.key === "validation" && !stage.validation) return null;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex items-center gap-1.5 px-3.5 py-2.5 text-[11px] font-semibold transition-all duration-150 -mb-px cursor-pointer ${
                isActive
                  ? "text-[#4F46E5]"
                  : "text-[#8A8A88] hover:text-[#5A5A58]"
              }`}
            >
              {tab.icon}
              {tab.label}
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-1 right-1 h-[2px] bg-[#4F46E5] rounded-full"
                  transition={{ duration: 0.2 }}
                />
              )}
            </button>
          );
        })}

        {/* Tab meta */}
        <div className="flex-1" />
        <span className="text-[10px] text-[#B0B0AE] pr-1">
          {activeTab === "modules" && `${completedModules}/${totalModules} vus`}
          {activeTab === "taches" && `${completedTasks}/${totalTasks} faites`}
        </span>
      </div>

      {/* ── Tab content ── */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <AnimatePresence mode="wait">

          {/* ── MODULES TAB ── */}
          {activeTab === "modules" && (
            <motion.div
              key="modules"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12 }}
              className="p-3 space-y-1.5"
            >
              {stage.modules.map((mod) => {
                const imp = IMPORTANCE_CONFIG[mod.importance];
                const ImpIcon = imp.icon;
                return (
                  <motion.button
                    key={mod.id}
                    type="button"
                    onClick={() => onToggleModule(stage.id, mod.id)}
                    whileTap={{ scale: 0.99 }}
                    className={`w-full flex items-start gap-3 px-3.5 py-3 rounded-xl border transition-all duration-200 group cursor-pointer ${
                      mod.completed
                        ? "bg-[#FAFAFA] border-[#F0F0EE]"
                        : "bg-white border-[#E6E6E4] hover:border-[#D0D0CE] hover:shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
                    }`}
                  >
                    {/* Check / Play */}
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200 ${
                      mod.completed
                        ? "bg-[#4F46E5] text-white shadow-[0_1px_3px_rgba(79,70,229,0.3)]"
                        : "bg-[#F5F5F4] text-[#B0B0AE] group-hover:bg-[#EEF2FF] group-hover:text-[#4F46E5]"
                    }`}>
                      {mod.completed ? <Check size={13} strokeWidth={2.5} /> : <Play size={11} />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[12px] font-semibold leading-tight ${
                          mod.completed ? "text-[#8A8A88] line-through" : "text-[#191919]"
                        }`}>
                          {mod.title}
                        </span>
                      </div>
                      <p className={`text-[10px] leading-relaxed ${mod.completed ? "text-[#C4C4C2]" : "text-[#8A8A88]"}`}>
                        {mod.benefit}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="flex items-center gap-1 text-[9px] font-medium text-[#B0B0AE]">
                          <Clock size={9} />
                          {mod.duration}
                        </span>
                        <span className={`flex items-center gap-1 text-[9px] font-medium ${imp.color}`}>
                          <ImpIcon size={9} />
                          {imp.label}
                        </span>
                        <span className="text-[9px] font-medium text-[#B0B0AE]">+{mod.xp} XP</span>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          )}

          {/* ── TÂCHES TAB ── */}
          {activeTab === "taches" && (
            <motion.div
              key="taches"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12 }}
              className="p-3"
            >
              {/* Next best action banner */}
              {(() => {
                const nextTask = stage.tasks.find((t) => !t.completed && (t.recommended || t.priority === "blocking" || t.priority === "validation"));
                const fallback = !nextTask ? stage.tasks.find((t) => !t.completed) : null;
                const target = nextTask || fallback;
                if (!target) return null;
                return (
                  <div className="mb-3 flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#EEF2FF] to-[#F0EDFF] border border-[#E0E7FF]">
                    <div className="w-7 h-7 rounded-lg bg-[#4F46E5] flex items-center justify-center flex-shrink-0 shadow-[0_1px_3px_rgba(79,70,229,0.3)]">
                      <ArrowRight size={13} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-bold text-[#4F46E5] uppercase tracking-[0.06em]">Action recommandée</p>
                      <p className="text-[12px] font-semibold text-[#191919] leading-tight">{target.title}</p>
                    </div>
                    <span className="text-[11px] font-semibold text-[#4F46E5] flex-shrink-0">+{target.xp} XP</span>
                  </div>
                );
              })()}

              {/* Tasks list */}
              <div className="space-y-1">
                {stage.tasks.map((task) => {
                  const pri = PRIORITY_STYLES[task.priority];
                  return (
                    <motion.button
                      key={task.id}
                      type="button"
                      onClick={() => onToggleTask(stage.id, task.id)}
                      whileTap={{ scale: 0.99 }}
                      className={`w-full flex items-start gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-150 group cursor-pointer ${
                        task.completed
                          ? "bg-[#FAFAFA]"
                          : "hover:bg-[#FBFBFA]"
                      }`}
                    >
                      {/* Checkbox */}
                      <div className={`w-[18px] h-[18px] rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200 ${
                        task.completed
                          ? "bg-[#059669] text-white shadow-[0_1px_3px_rgba(5,150,105,0.3)]"
                          : "border-[1.5px] border-[#D6D3D1] group-hover:border-[#4F46E5] group-hover:bg-[#EEF2FF]"
                      }`}>
                        {task.completed && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 25 }}
                          >
                            <Check size={11} strokeWidth={3} />
                          </motion.div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 text-left">
                        <span className={`text-[12px] font-medium leading-tight ${
                          task.completed ? "text-[#8A8A88] line-through" : "text-[#191919]"
                        }`}>
                          {task.title}
                        </span>
                        {/* Meta row */}
                        {!task.completed && (
                          <div className="flex items-center gap-2 mt-1">
                            {task.priority !== "normal" && (
                              <span className={`text-[9px] font-semibold px-1.5 py-[1px] rounded ${pri.bg} ${pri.text} border ${pri.border}`}>
                                {pri.label}
                              </span>
                            )}
                            {task.impact === "fort" && (
                              <span className="text-[9px] font-medium text-[#059669] flex items-center gap-0.5">
                                <Zap size={8} />
                                Impact fort
                              </span>
                            )}
                            {task.unlocks && (
                              <span className="text-[9px] text-[#8A8A88] flex items-center gap-0.5">
                                <Unlock size={8} />
                                {task.unlocks}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* XP */}
                      <span className={`text-[10px] font-semibold flex-shrink-0 mt-0.5 tabular-nums ${
                        task.completed ? "text-[#059669]" : "text-[#C4C4C2]"
                      }`}>
                        +{task.xp}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Checklists */}
              {stage.checklists.length > 0 && (
                <div className="mt-3 space-y-2">
                  {stage.checklists.map((cl, clIdx) => {
                    const checkedCount = cl.items.filter((i) => i.checked).length;
                    const clPct = Math.round((checkedCount / cl.items.length) * 100);
                    return (
                      <div key={clIdx} className="border border-[#E6E6E4] rounded-xl overflow-hidden">
                        <button
                          type="button"
                          onClick={() => toggleChecklist(clIdx)}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 bg-[#FAFAFA] hover:bg-[#F5F5F4] transition-colors cursor-pointer"
                        >
                          <ClipboardList size={12} className="text-[#8A8A88]" />
                          <span className="text-[11px] font-semibold text-[#5A5A58] flex-1 text-left">{cl.label}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-[3px] bg-[#F0F0EE] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#059669] rounded-full transition-all duration-300"
                                style={{ width: `${clPct}%` }}
                              />
                            </div>
                            <span className="text-[9px] font-medium text-[#8A8A88] tabular-nums w-7 text-right">
                              {checkedCount}/{cl.items.length}
                            </span>
                          </div>
                          {checklistsOpen[clIdx] ? (
                            <ChevronUp size={11} className="text-[#C4C4C2]" />
                          ) : (
                            <ChevronDown size={11} className="text-[#C4C4C2]" />
                          )}
                        </button>
                        <AnimatePresence>
                          {checklistsOpen[clIdx] && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-3.5 py-2 space-y-0.5">
                                {cl.items.map((item, iIdx) => (
                                  <button
                                    key={iIdx}
                                    type="button"
                                    onClick={() => onToggleChecklistItem(stage.id, clIdx, iIdx)}
                                    className="w-full flex items-center gap-2.5 py-1.5 group cursor-pointer"
                                  >
                                    <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all duration-150 ${
                                      item.checked
                                        ? "bg-[#059669] text-white"
                                        : "border-[1.5px] border-[#D6D3D1] group-hover:border-[#4F46E5]"
                                    }`}>
                                      {item.checked && <Check size={10} strokeWidth={2.5} />}
                                    </div>
                                    <span className={`text-[11px] ${
                                      item.checked ? "text-[#8A8A88] line-through" : "text-[#5A5A58]"
                                    }`}>
                                      {item.text}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* ── VALIDATION TAB ── */}
          {activeTab === "validation" && stage.validation && (
            <motion.div
              key="validation"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12 }}
              className="p-4"
            >
              <div className={`rounded-xl overflow-hidden border-2 ${
                stage.validation.validated
                  ? "border-emerald-200 bg-emerald-50/50"
                  : "border-[#4F46E5]/15 bg-[#FAFAFE]"
              }`}>
                {/* Validation header */}
                <div className={`px-5 py-4 ${
                  stage.validation.validated ? "bg-emerald-50" : "bg-[#EEF2FF]/60"
                }`}>
                  <div className="flex items-start gap-3.5">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      stage.validation.validated
                        ? "bg-emerald-100 shadow-[0_1px_3px_rgba(5,150,105,0.2)]"
                        : "bg-white shadow-[0_1px_3px_rgba(79,70,229,0.15)]"
                    }`}>
                      {stage.validation.validated ? (
                        <motion.div
                          initial={{ scale: 0, rotate: -20 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 400, damping: 15 }}
                        >
                          <Check size={22} className="text-[#059669]" strokeWidth={2.5} />
                        </motion.div>
                      ) : (
                        <ShieldCheck size={22} className="text-[#4F46E5]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-[14px] font-bold ${
                        stage.validation.validated ? "text-[#059669]" : "text-[#191919]"
                      }`}>
                        {stage.validation.validated ? "Validation confirmée" : stage.validation.title}
                      </h3>
                      <p className="text-[12px] text-[#5A5A58] mt-1 leading-relaxed">
                        {stage.validation.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Validation details */}
                {!stage.validation.validated && (
                  <div className="px-5 py-4 space-y-3">
                    {/* What's required */}
                    <div className="flex items-start gap-2.5">
                      <AlertCircle size={13} className="text-[#4F46E5] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold text-[#5A5A58] uppercase tracking-wide mb-0.5">Ce qui est attendu</p>
                        <p className="text-[12px] text-[#191919]">{stage.validation.requirement}</p>
                      </div>
                    </div>

                    {/* What it unlocks */}
                    <div className="flex items-start gap-2.5">
                      <Unlock size={13} className="text-[#059669] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold text-[#5A5A58] uppercase tracking-wide mb-0.5">Ce que ça débloque</p>
                        <p className="text-[12px] text-[#191919]">{stage.validation.unlocksLabel}</p>
                      </div>
                    </div>

                    {/* Missing action */}
                    {stage.validation.missingAction && (
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle size={13} className="text-amber-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-[10px] font-bold text-[#5A5A58] uppercase tracking-wide mb-0.5">Action manquante</p>
                          <p className="text-[12px] text-[#191919]">{stage.validation.missingAction}</p>
                        </div>
                      </div>
                    )}

                    {/* Blocks next */}
                    {stage.validation.blocksNext && (
                      <div className="bg-[#EEF2FF] rounded-lg px-3.5 py-2.5 flex items-center gap-2">
                        <Sparkles size={12} className="text-[#4F46E5]" />
                        <p className="text-[11px] text-[#4F46E5] font-semibold">
                          Validation requise pour continuer — passage à l'étape suivante bloqué
                        </p>
                      </div>
                    )}

                    {/* CTA */}
                    <button
                      type="button"
                      onClick={() => onValidate(stage.id)}
                      className="w-full mt-1 px-5 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] active:bg-[#3730A3] text-white text-[12px] font-semibold rounded-lg transition-all duration-150 cursor-pointer shadow-[0_1px_3px_rgba(79,70,229,0.3)] hover:shadow-[0_2px_6px_rgba(79,70,229,0.35)]"
                    >
                      Marquer comme validé
                    </button>
                  </div>
                )}
              </div>

              {/* Risk callout */}
              {!stage.validation.validated && stage.unlock.riskIfIgnored && (
                <div className="mt-3 flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl bg-amber-50/80 border border-amber-100">
                  <AlertTriangle size={13} className="text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wide mb-0.5">Risque si ignoré</p>
                    <p className="text-[11px] text-amber-800 leading-relaxed">{stage.unlock.riskIfIgnored}</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── NOTES TAB ── */}
          {activeTab === "notes" && (
            <motion.div
              key="notes"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12 }}
              className="flex flex-col flex-1 p-4"
            >
              {/* Hint */}
              <div className="flex items-center gap-2 mb-3 px-1">
                <Lightbulb size={12} className="text-[#B0B0AE]" />
                <span className="text-[10px] text-[#B0B0AE]">
                  {stage.number === 1 && "Notez ici vos idées produit et vos observations de niche"}
                  {stage.number === 2 && "Gardez une trace de vos choix de branding et feedbacks"}
                  {stage.number === 3 && "Suivez vos métriques Ads et vos apprentissages"}
                  {stage.number === 4 && "Documentez vos tests d'optimisation et résultats"}
                  {stage.number === 5 && "Préparez vos processus de délégation et scaling"}
                </span>
              </div>

              <div className="relative flex-1">
                <textarea
                  value={stage.notes}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  placeholder={`Journal d'étape — ${stage.title}\n\nNotez vos observations, questions, idées, résultats...`}
                  className="w-full h-full min-h-[180px] px-4 py-3 bg-white border border-[#E6E6E4] rounded-xl text-[12px] text-[#191919] placeholder:text-[#D6D3D1] resize-none focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/15 focus:border-[#4F46E5]/30 transition-all duration-200 leading-relaxed"
                />
                {/* Footer bar */}
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                  <span className="text-[9px] text-[#D6D3D1] tabular-nums">
                    {stage.notes.length > 0 && `${stage.notes.length} caractères`}
                  </span>
                  <div>
                    {notesSaved ? (
                      <motion.span
                        initial={{ opacity: 0, y: 2 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-1 text-[10px] text-[#059669] font-medium"
                      >
                        <Save size={9} /> Sauvegardé
                      </motion.span>
                    ) : stage.notes.length > 0 ? (
                      <span className="flex items-center gap-1 text-[9px] text-[#D6D3D1]">
                        <Circle size={5} className="fill-current animate-pulse" /> Saisie...
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Insights (shared across non-notes tabs) ── */}
        {activeTab !== "notes" && stage.insights.length > 0 && (
          <div className="px-3 pb-3 space-y-1.5">
            {stage.insights.map((insight, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl border ${INSIGHT_BG[insight.type]} transition-colors duration-200`}
              >
                <div className="mt-0.5 flex-shrink-0">{INSIGHT_ICONS[insight.type]}</div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-[#191919] leading-tight">{insight.title}</p>
                  <p className="text-[10px] text-[#5A5A58] mt-0.5 leading-relaxed">{insight.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
