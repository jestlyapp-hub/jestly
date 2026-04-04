"use client";

import { useState, useEffect, useRef } from "react";
import { useGuide } from "../engine/guide-engine";
import { buildContext, canStartChapter, CHAPTER_PREREQUISITES } from "../missions/prerequisites";
import { getFrustrationScore, isUserFrustrated, getFrustrationState } from "../missions/frustration";
import { getGuideExperienceMode, getAdaptiveHintDelay } from "../missions/adaptive";

// ═══════════════════════════════════════════════════════════════════
// Guide Debug Panel — Level 2
//
// Shows prerequisites, missing context, validation status,
// and everything needed to diagnose any blocking issue instantly.
// ═══════════════════════════════════════════════════════════════════

export default function GuideDebugPanel() {
  const { state, step, chapter, engineStatus, isActive, isDone, account } = useGuide();
  const [bridgeState, setBridgeState] = useState({
    displayedProductCount: "0",
    hasProductBlock: "false",
  });
  const [completionSatisfied, setCompletionSatisfied] = useState(false);
  const [lastValidationRun, setLastValidationRun] = useState<string>("—");
  const [timeoutReason, setTimeoutReason] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  // Poll GuideBridge state + run validator
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    const check = async () => {
      const el = document.getElementById("guide-bridge-state");
      if (el) {
        setBridgeState({
          displayedProductCount: el.dataset.displayedProductCount || "0",
          hasProductBlock: el.dataset.hasProductBlock || "false",
        });
      }

      if (step?.completeWhen.type === "custom") {
        try {
          const { runValidator } = await import("../missions/validators");
          const result = await runValidator(step.completeWhen.key);
          setCompletionSatisfied(result.valid);
          setLastValidationRun(new Date().toLocaleTimeString());

          if (engineStatus === "timed_out" && result.valid) {
            setTimeoutReason("FALSE TIMEOUT — completion is satisfied!");
          } else if (engineStatus === "timed_out") {
            setTimeoutReason("Guard timed out, validator not satisfied");
          } else {
            setTimeoutReason(null);
          }
        } catch {
          setCompletionSatisfied(false);
        }
      } else {
        setCompletionSatisfied(false);
        setTimeoutReason(null);
      }
    };

    check();
    intervalRef.current = setInterval(check, 1000);
    return () => clearInterval(intervalRef.current);
  }, [step, engineStatus]);

  if (process.env.NODE_ENV !== "development") return null;
  if (!isActive && !isDone) return null;

  // ── Compute prerequisite info ──────────────────────────────────
  const context = buildContext(account);
  const currentChapterId = chapter?.id ?? "—";
  const prereqCheck = currentChapterId !== "—"
    ? canStartChapter(currentChapterId, context)
    : { canStart: false, missing: ["no_chapter"] };
  const prereqs = CHAPTER_PREREQUISITES[currentChapterId] ?? [];

  const publishBtn = typeof document !== "undefined"
    ? (document.querySelector('[data-guide="publish-site"]') || document.querySelector('[data-testid="publish-site"]'))
    : null;
  const isPublished = publishBtn?.textContent?.includes("Publié") ?? false;

  const missionCanCompleteNow =
    completionSatisfied && step?.completeWhen.type === "custom";
  const missionCanStartNow = prereqCheck.canStart;

  return (
    <div className="fixed bottom-4 left-4 z-[100] bg-gray-900 text-gray-100 rounded-xl shadow-2xl text-[11px] font-mono max-w-xs overflow-hidden max-h-[calc(100vh-32px)] overflow-y-auto">
      <div className="px-3 py-2 bg-gray-800 flex items-center justify-between border-b border-gray-700 sticky top-0">
        <span className="font-bold text-[10px] uppercase tracking-wider text-gray-400">
          Guide Debug v2
        </span>
        <span className={`w-2 h-2 rounded-full ${isActive ? "bg-green-400" : isDone ? "bg-blue-400" : "bg-gray-500"}`} />
      </div>
      <div className="px-3 py-2 space-y-1">
        {/* Mission */}
        <Section label="Mission" />
        <Row label="currentMission" value={currentChapterId} />
        <Row label="step" value={step?.id ?? "—"} />
        <Row label="engineStatus" value={engineStatus} color={
          engineStatus === "ready" ? "text-green-400" :
          engineStatus === "error" || engineStatus === "timed_out" ? "text-red-400" :
          engineStatus === "preparing" || engineStatus === "navigating" ? "text-amber-400" :
          "text-gray-400"
        } />

        {/* Prerequisites */}
        <Section label="Prérequis" />
        <Row label="missionCanStartNow" value={String(missionCanStartNow)} color={missionCanStartNow ? "text-green-400" : "text-red-400"} />
        <Row label="prerequisites" value={prereqs.length > 0 ? prereqs.join(", ") : "aucun"} />
        {prereqCheck.missing.length > 0 && (
          <Row label="missingPrerequisites" value={prereqCheck.missing.join(", ")} color="text-red-400 font-bold" />
        )}

        {/* Context */}
        <Section label="Contexte" />
        <Row label="siteExists" value={String(context.siteExists)} color={context.siteExists ? "text-green-400" : "text-red-400"} />
        <Row label="siteId" value={context.siteId ?? "—"} />
        <Row label="builderReady" value={String(context.builderReady)} />
        <Row label="productExists" value={String(context.productExists)} />
        <Row label="hasProductBlock" value={bridgeState.hasProductBlock} />
        <Row label="productsDisplayed" value={bridgeState.displayedProductCount} />
        <Row label="sitePublished" value={String(isPublished)} />

        {/* Frustration */}
        <Section label="Frustration" />
        <Row label="frustrationScore" value={`${getFrustrationScore()}/10`} color={
          getFrustrationScore() >= 5 ? "text-red-400 font-bold" :
          getFrustrationScore() >= 3 ? "text-amber-400" :
          "text-green-400"
        } />
        <Row label="isUserFrustrated" value={String(isUserFrustrated())} color={isUserFrustrated() ? "text-red-400" : "text-green-400"} />
        <Row label="experienceMode" value={getGuideExperienceMode()} color={
          getGuideExperienceMode() === "rescue" ? "text-red-400 font-bold" :
          getGuideExperienceMode() === "assisted" ? "text-amber-400" :
          "text-green-400"
        } />
        <Row label="adaptiveHintDelay" value={`${getAdaptiveHintDelay()}ms`} />
        <Row label="recentSmoothSteps" value={String(getFrustrationState().recentSmoothSteps)} />

        {/* Validation */}
        <Section label="Validation" />
        <Row label="completionSatisfied" value={String(completionSatisfied)} color={completionSatisfied ? "text-green-400" : "text-red-400"} />
        <Row label="missionCanCompleteNow" value={String(!!missionCanCompleteNow)} color={missionCanCompleteNow ? "text-green-400 font-bold" : "text-gray-400"} />
        <Row label="lastValidationRunAt" value={lastValidationRun} />
        {timeoutReason && (
          <Row label="timeoutReason" value={timeoutReason} color="text-red-400" />
        )}

        {/* UI */}
        <Section label="UI" />
        <Row label="highlightTarget" value={step?.target?.selector ?? "—"} />
        <Row label="nonBlocking" value={String(step?.nonBlocking ?? false)} />
        <Row label="completeWhen" value={
          step?.completeWhen.type === "custom"
            ? `custom:${step.completeWhen.key}`
            : step?.completeWhen.type ?? "—"
        } />
        <Row label="isDone" value={String(isDone)} />
      </div>
    </div>
  );
}

function Section({ label }: { label: string }) {
  return (
    <div className="border-t border-gray-700 mt-1 pt-1">
      <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500">{label}</span>
    </div>
  );
}

function Row({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-gray-500 truncate">{label}</span>
      <span className={`truncate max-w-[140px] ${color || "text-gray-200"}`}>{value}</span>
    </div>
  );
}
