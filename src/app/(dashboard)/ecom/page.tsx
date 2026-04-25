"use client";

import { useState, useCallback } from "react";
import { ArrowLeft } from "lucide-react";
import { useEcom } from "@/lib/ecom/hooks";
import EcomHeader from "@/components/ecom/EcomHeader";
import EcomTimeline from "@/components/ecom/EcomTimeline";
import EcomStageDetail from "@/components/ecom/EcomStageDetail";
import EcomGamification from "@/components/ecom/EcomGamification";
import EcomPathView from "@/components/ecom/EcomPathView";

export default function EcomPage() {
  const {
    stages,
    badges,
    selectedStage,
    selectedStageId,
    setSelectedStageId,
    progress,
    toggleTask,
    toggleModule,
    toggleChecklistItem,
    updateNotes,
    validateStage,
  } = useEcom();

  const [view, setView] = useState<"path" | "detail">("path");

  const handleSelectStage = useCallback(
    (id: string) => {
      setSelectedStageId(id);
      setView("detail");
    },
    [setSelectedStageId],
  );

  const handleContinue = useCallback(() => {
    setSelectedStageId(progress.currentStageId);
    setView("detail");
  }, [progress.currentStageId, setSelectedStageId]);

  // ── Vue parcours (défaut) ──
  if (view === "path") {
    return (
      <div className="flex flex-col h-[calc(100vh-56px-48px)] min-h-0 -m-6">
        <EcomPathView
          stages={stages}
          progress={progress}
          onSelectStage={handleSelectStage}
        />
      </div>
    );
  }

  // ── Vue détaillée (3 colonnes existantes) ──
  return (
    <div className="flex flex-col h-[calc(100vh-56px-48px)] min-h-0 -m-6">
      <div className="flex flex-col h-full px-5 pt-4 pb-3 gap-3">

        {/* Back to path */}
        <button
          onClick={() => setView("path")}
          className="flex items-center gap-1.5 text-[12px] font-medium text-[#6B7280] hover:text-[#111827] transition-colors w-fit"
        >
          <ArrowLeft size={14} />
          Retour au parcours
        </button>

        {/* Header */}
        <EcomHeader progress={progress} onContinue={handleContinue} />

        {/* 3-column layout */}
        <div className="flex gap-3 flex-1 min-h-0">
          {/* Left — Timeline */}
          <EcomTimeline
            stages={stages}
            selectedStageId={selectedStageId}
            onSelect={setSelectedStageId}
          />

          {/* Center — Stage detail */}
          <div className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden">
            <EcomStageDetail
              stage={selectedStage}
              onToggleTask={toggleTask}
              onToggleModule={toggleModule}
              onToggleChecklistItem={toggleChecklistItem}
              onUpdateNotes={updateNotes}
              onValidate={validateStage}
            />
          </div>

          {/* Right — Gamification */}
          <EcomGamification progress={progress} badges={badges} />
        </div>
      </div>
    </div>
  );
}
