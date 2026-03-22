"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import type {
  GuideState,
  GuideStep,
  GuideChapter,
  AccountState,
  EngineStatus,
} from "../model/guide.types";
import { INITIAL_GUIDE_STATE } from "../model/guide.types";
import { CHAPTERS } from "../model/guide.chapters";
import { ensureStepContext } from "./step-guard";
import type { GuardOutcome } from "./step-guard";
import { useAccountState } from "../model/guide.account-state";
import {
  buildContext,
  canStartChapter,
  findFirstValidChapter,
  detectStateInconsistencies,
  type OnboardingContext,
  resolveRedirectChapter,
  resolveCompletedChapters,
} from "../missions/prerequisites";

// ═══════════════════════════════════════════════════════════════════
// Guide Engine V3 — Deterministic, no infinite loops
//
// CRITICAL INVARIANTS:
// 1. Step guard runs ONCE per (chapterId, stepIndex) pair
//    It is NOT re-triggered by its own state changes
// 2. Guard uses a stable AbortController stored in a ref
//    Only replaced when step identity changes
// 3. start() always begins at CHAPTERS[0] step 0
// 4. No accountState in any effect dependency
// 5. Persisted state is validated against current CHAPTERS
// 6. Guard has safety timeout — never blocks forever
// 7. Abort never leaves engineStatus stuck in preparing
// ═══════════════════════════════════════════════════════════════════

const KEY = "jestly_guide_v3";

// ── Analytics + Frustration — step timing ────────────────────────
let stepStartTime = 0;
function trackStepTiming(stepId: string, chapterId: string, durationMs: number) {
  try {
    const { trackProductEvent } = require("@/lib/product-events");
    trackProductEvent(`onboarding.step.${stepId}`, "onboarding", {
      chapter: chapterId,
      duration_ms: durationMs,
    });
  } catch {}
  // Also record for frustration detection
  try {
    const { recordStepComplete } = require("../missions/frustration");
    recordStepComplete(stepId, durationMs);
  } catch {}
}

const log = (m: string) => {
  if (process.env.NODE_ENV === "development")
    console.log(`[GuideV3] ${m}`);
};

// Safety timeout for guards — if a guard takes longer, force error
const GUARD_SAFETY_TIMEOUT = 8000;

// ── Persistence ─────────────────────────────────────────────────

function loadState(): GuideState {
  if (typeof window === "undefined") return INITIAL_GUIDE_STATE;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return INITIAL_GUIDE_STATE;
    const p = JSON.parse(raw);

    // ── Validate persisted chapterId against current CHAPTERS ──
    const chapterId = p.chapterId ?? null;
    if (chapterId !== null) {
      const ch = CHAPTERS.find((c) => c.id === chapterId);
      if (!ch) {
        log(
          `loadState: invalid persisted chapterId="${chapterId}" — reset to default`,
        );
        return INITIAL_GUIDE_STATE;
      }
      // Validate stepIndex bounds
      const stepIndex = typeof p.stepIndex === "number" ? p.stepIndex : 0;
      if (stepIndex < 0 || stepIndex >= ch.steps.length) {
        log(
          `loadState: invalid persisted stepIndex=${stepIndex} for chapter="${chapterId}" — reset stepIndex to 0`,
        );
        return {
          ...INITIAL_GUIDE_STATE,
          active: false,
          chapterId,
          stepIndex: 0,
          completedChapters: Array.isArray(p.completedChapters)
            ? p.completedChapters.filter((id: string) =>
                CHAPTERS.some((c) => c.id === id),
              )
            : [],
          dismissed: p.dismissed ?? false,
        };
      }
    }

    // Validate completedChapters — remove any that don't exist
    const completedChapters = Array.isArray(p.completedChapters)
      ? p.completedChapters.filter((id: string) =>
          CHAPTERS.some((c) => c.id === id),
        )
      : [];

    return {
      ...INITIAL_GUIDE_STATE,
      // NEVER restore active — user must explicitly click "Guide Jestly"
      active: false,
      chapterId,
      stepIndex: p.stepIndex ?? 0,
      completedChapters,
      dismissed: p.dismissed ?? false,
    };
  } catch {
    return INITIAL_GUIDE_STATE;
  }
}

function saveState(s: GuideState) {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        chapterId: s.chapterId,
        stepIndex: s.stepIndex,
        completedChapters: s.completedChapters,
        dismissed: s.dismissed,
      }),
    );
  } catch {}
}

// ── Helpers ──────────────────────────────────────────────────────

const getCh = (id: string) => CHAPTERS.find((c) => c.id === id) ?? null;

// ── Context ─────────────────────────────────────────────────────

interface Ctx {
  state: GuideState;
  account: AccountState;
  step: GuideStep | null;
  chapter: GuideChapter | null;
  progress: number;
  isReady: boolean;
  isActive: boolean;
  isDone: boolean;
  engineStatus: EngineStatus;
  start: () => void;
  startChapter: (id: string) => void;
  next: () => void;
  close: () => void;
  reset: () => void;
  refresh: () => void;
}
const GuideCtx = createContext<Ctx | null>(null);

export function GuideProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GuideState>(INITIAL_GUIDE_STATE);
  const [hydrated, setHydrated] = useState(false);
  const { accountState, refreshAccountState } = useAccountState();
  const router = useRouter();
  const pathname = usePathname();

  // Stable refs for async access
  const accountRef = useRef(accountState);
  accountRef.current = accountState;
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  // Guard tracking — prevents re-runs on same step
  const guardKeyRef = useRef(""); // "chapterId:stepIndex"
  const abortRef = useRef<AbortController | null>(null);
  const guardRunIdRef = useRef(0); // Monotonic counter for logging & stale detection

  // ── Hydrate ───────────────────────────────────────────────────
  useEffect(() => {
    // Init frustration tracking
    try { require("../missions/frustration").initFrustration(); } catch {}

    const loaded = loadState();
    log(
      `hydrate → chapterId=${loaded.chapterId}, stepIndex=${loaded.stepIndex}, dismissed=${loaded.dismissed}`,
    );
    setState(loaded);
    setHydrated(true);
  }, []);

  // ── Save ──────────────────────────────────────────────────────
  useEffect(() => {
    if (hydrated) saveState(state);
  }, [state, hydrated]);

  // ── Periodic account state refresh + auto-repair ────────────
  // Ensures products/briefs/blocks created DURING the guide are detected.
  // Also runs silent auto-repair to detect state inconsistencies.
  useEffect(() => {
    if (!hydrated || !state.active) return;
    const interval = setInterval(() => {
      refreshAccountState();

      // Auto-repair: detect inconsistencies silently
      const context = buildContext(accountRef.current);
      const repair = detectStateInconsistencies(
        state.chapterId,
        state.active,
        context,
        CHAPTERS,
      );
      if (repair.repaired) {
        for (const fix of repair.fixes) {
          log(`auto-repair: ${fix}`);
        }
        // The guard effect's prerequisite check will handle the redirect
        // We just log here — no forced state change from the interval
      }
    }, 5000);
    // Also refresh immediately when the guide activates
    refreshAccountState();
    return () => clearInterval(interval);
  }, [hydrated, state.active, state.chapterId, refreshAccountState]);

  // ═══════════════════════════════════════════════════════════════
  // STEP GUARD — runs when (chapterId, stepIndex) changes
  //
  // Dependencies: ONLY step identity + hydrated + active.
  // engineStatus is NOT a dependency (we set it, not read it).
  // accountState is NOT a dependency (read from ref).
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!hydrated || !state.active || !state.chapterId) return;

    const ch = getCh(state.chapterId);
    if (!ch) return;
    const step = ch.steps[state.stepIndex];
    if (!step) return;

    // ── PREREQUISITE CHECK — structural safety ──────────────────
    // A chapter MUST NOT run if its prerequisites are not satisfied.
    // If prerequisites fail, redirect to the chapter that resolves them.
    const context = buildContext(accountRef.current);
    const { canStart, missing } = canStartChapter(state.chapterId, context);

    if (!canStart) {
      log(
        `guard ${step.id}: PREREQUISITES NOT MET — missing: [${missing.join(", ")}]`,
      );
      const redirect = resolveRedirectChapter(
        state.chapterId,
        context,
        CHAPTERS,
      );
      if (redirect && redirect.id !== state.chapterId) {
        log(`guard ${step.id}: redirecting to chapter=${redirect.id}`);
        guardKeyRef.current = ""; // Allow re-run after redirect
        setState((p) => ({
          ...p,
          chapterId: redirect.id,
          stepIndex: 0,
          engineStatus: "idle",
          errorMessage: null,
        }));
      } else {
        log(`guard ${step.id}: no redirect available, setting error`);
        setState((p) => ({
          ...p,
          engineStatus: "error",
          errorMessage: `Prérequis manquants : ${missing.join(", ")}`,
        }));
      }
      return;
    }

    // ── Prevent re-run on same step ─────────────────────────────
    const key = `${state.chapterId}:${state.stepIndex}`;
    if (guardKeyRef.current === key) {
      log(`guard ${step.id}: skip rerun (same step/context)`);
      return;
    }
    guardKeyRef.current = key;

    // ── Abort previous guard ────────────────────────────────────
    if (abortRef.current) {
      abortRef.current.abort();
      log("guard: abort previous (step changed)");
    }
    const ac = new AbortController();
    abortRef.current = ac;
    const runId = ++guardRunIdRef.current;
    log(
      `guard ${step.id}: start (runId=${runId}, key=${key})`,
    );

    // ── Fast path: no constraints → ready immediately ───────────
    const hasConstraints =
      step.requiredRoute ||
      (step.preActions && step.preActions.length > 0) ||
      step.target;

    if (!hasConstraints) {
      log(`guard ${step.id}: ✓ ready (no constraints, runId=${runId})`);
      setState((p) => ({ ...p, engineStatus: "ready", errorMessage: null }));
      return;
    }

    // ── Async path ──────────────────────────────────────────────
    log(`guard ${step.id}: preparing... (runId=${runId})`);
    setState((p) => ({ ...p, engineStatus: "preparing", errorMessage: null }));

    const siteId = accountRef.current.siteId;
    const currentPathname = pathnameRef.current ?? "";

    // ── Safety timeout — prevents infinite preparing ────────────
    // For steps with custom validators, use a much longer timeout:
    // the validator has its own timeout and polls independently of the guard.
    // The guard just needs enough time to navigate + find DOM.
    const isCustomValidatorStep = step.completeWhen.type === "custom";
    const effectiveSafetyTimeout = isCustomValidatorStep
      ? Math.max(
          GUARD_SAFETY_TIMEOUT,
          (step.completeWhen.type === "custom" ? (step.completeWhen.timeoutMs ?? 120000) : 0) + 5000,
        )
      : GUARD_SAFETY_TIMEOUT;

    const safetyTimer = setTimeout(() => {
      if (!ac.signal.aborted) {
        log(
          `guard ${step.id}: SAFETY TIMEOUT (${effectiveSafetyTimeout}ms, runId=${runId})`,
        );
        ac.abort();
        setState((p) => ({
          ...p,
          engineStatus: "timed_out",
          errorMessage: "Délai de préparation dépassé.",
        }));
      }
    }, effectiveSafetyTimeout);

    ensureStepContext(
      step,
      currentPathname,
      (p) => router.push(p),
      siteId,
      (status) => {
        // Only update if this guard is still the active one
        if (ac.signal.aborted) return;
        if (guardRunIdRef.current !== runId) return;
        setState((p) => ({ ...p, engineStatus: status }));
      },
      ac.signal,
    ).then((outcome: GuardOutcome) => {
      clearTimeout(safetyTimer);

      // ── Stale detection: both signal AND runId must match ────
      if (ac.signal.aborted) {
        log(
          `guard ${step.id}: aborted (runId=${runId}, currentRunId=${guardRunIdRef.current})`,
        );
        // Don't set engineStatus — either a new guard or close() handles it
        return;
      }
      if (guardRunIdRef.current !== runId) {
        log(
          `guard ${step.id}: stale ignored (runId=${runId}, currentRunId=${guardRunIdRef.current})`,
        );
        return;
      }

      // ── Handle structured outcome ─────────────────────────────
      switch (outcome.status) {
        case "ready":
          log(`guard ${step.id}: ✓ ready (runId=${runId})`);
          setState((p) => ({
            ...p,
            engineStatus: "ready",
            errorMessage: null,
          }));
          break;

        case "aborted":
          // Guard was aborted internally (signal checked inside ensureStepContext)
          // but our signal might not be aborted yet (edge case: abort during resolve)
          log(`guard ${step.id}: aborted internally (runId=${runId})`);
          // Don't leave in preparing — set idle if nothing else took over
          if (guardRunIdRef.current === runId) {
            setState((p) => {
              // Only reset if still in a preparing-like state
              if (
                p.engineStatus === "preparing" ||
                p.engineStatus === "navigating" ||
                p.engineStatus === "running_preactions" ||
                p.engineStatus === "waiting_dom"
              ) {
                return { ...p, engineStatus: "idle", errorMessage: null };
              }
              return p;
            });
          }
          break;

        case "timed_out":
          log(
            `guard ${step.id}: timed out (phase=${outcome.phase}, runId=${runId})`,
          );
          setState((p) => ({
            ...p,
            engineStatus: "timed_out",
            errorMessage: `Délai dépassé lors de : ${outcome.phase}`,
          }));
          break;
      }
    });

    // Cleanup: don't abort here — React Strict Mode would kill the guard
    // Abort is handled above when guardKeyRef changes, or by close()/start()
    return () => {
      clearTimeout(safetyTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.chapterId, state.stepIndex, state.active, hydrated]);

  // ═══════════════════════════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════════════════════════

  const start = useCallback(() => {
    // Reset guard tracking
    guardKeyRef.current = "";
    abortRef.current?.abort();
    abortRef.current = null;

    const account = accountRef.current;
    const context = buildContext(account);

    // ── PREREQUISITE-BASED START ────────────────────────────────
    // Find the first chapter whose prerequisites are satisfied
    // and that hasn't been "implicitly completed" by context.
    const firstValid = findFirstValidChapter(CHAPTERS, [], context);
    if (!firstValid) {
      log("start: no valid chapter found — all prerequisites unmet");
      return;
    }

    // Pre-mark earlier chapters as completed
    const completed = resolveCompletedChapters(CHAPTERS, firstValid);

    log(
      `start → context: siteExists=${context.siteExists}, productExists=${context.productExists}`,
    );
    log(
      `start → resolved chapter=${firstValid.id} step=0 (${firstValid.steps[0]?.id}), skipped=[${completed.join(",")}]`,
    );

    setState({
      active: true,
      chapterId: firstValid.id,
      stepIndex: 0,
      completedChapters: completed,
      dismissed: false,
      engineStatus: "idle",
      errorMessage: null,
    });
  }, []);

  const startChapter = useCallback((id: string) => {
    const ch = getCh(id);
    if (!ch) {
      log(`startChapter: invalid chapter="${id}" — ignored`);
      return;
    }
    guardKeyRef.current = "";
    abortRef.current?.abort();
    abortRef.current = null;
    log(`startChapter → ${id} step=0 (${ch.steps[0]?.id})`);
    setState((p) => ({
      ...p,
      active: true,
      dismissed: false,
      chapterId: id,
      stepIndex: 0,
      engineStatus: "idle",
      errorMessage: null,
    }));
  }, []);

  const next = useCallback(() => {
    // Reset guard tracking so the new step's guard can run
    guardKeyRef.current = "";

    // ── Analytics: track step duration ──────────────────────────
    if (stepStartTime > 0) {
      const duration = Date.now() - stepStartTime;
      const ch = state.chapterId ? getCh(state.chapterId) : null;
      const currentStep = ch?.steps[state.stepIndex];
      if (currentStep && ch) {
        log(`step ${currentStep.id}: completed in ${duration}ms`);
        trackStepTiming(currentStep.id, ch.id, duration);
      }
    }
    stepStartTime = Date.now();

    // Refresh account state on EVERY step change
    refreshAccountState();

    setState((prev) => {
      if (!prev.active || !prev.chapterId) return prev;
      const ch = getCh(prev.chapterId);
      if (!ch) return prev;

      const nextIdx = prev.stepIndex + 1;

      if (nextIdx < ch.steps.length) {
        log(`next → ${ch.id} step=${nextIdx} (${ch.steps[nextIdx].id})`);
        return {
          ...prev,
          stepIndex: nextIdx,
          engineStatus: "idle" as EngineStatus,
          errorMessage: null,
        };
      }

      // Chapter complete — refresh account state for prerequisite checks
      log(`next → chapter ${ch.id} complete, refreshing account state`);
      // Schedule async refresh (doesn't block setState)
      setTimeout(() => refreshAccountState(), 100);

      const done = prev.completedChapters.includes(ch.id)
        ? prev.completedChapters
        : [...prev.completedChapters, ch.id];

      // Find next chapter (the guard will validate prerequisites)
      let nextChId: string | null = null;
      for (const c of CHAPTERS) {
        if (!done.includes(c.id)) {
          nextChId = c.id;
          break;
        }
      }

      if (!nextChId) {
        log("guide complete ✓");
        return {
          ...prev,
          completedChapters: done,
          active: false,
          chapterId: null,
          stepIndex: 0,
          engineStatus: "idle" as EngineStatus,
          errorMessage: null,
        };
      }

      const nextCh = getCh(nextChId);
      log(`next → chapter=${nextChId} step=0 (${nextCh?.steps[0]?.id})`);
      return {
        ...prev,
        completedChapters: done,
        chapterId: nextChId,
        stepIndex: 0,
        engineStatus: "idle" as EngineStatus,
        errorMessage: null,
      };
    });
  }, [refreshAccountState]);

  const close = useCallback(() => {
    log("close");
    guardKeyRef.current = "";
    abortRef.current?.abort();
    abortRef.current = null;
    // Track frustration: user closed the guide
    try { require("../missions/frustration").recordGuideClosed(); } catch {}
    setState((p) => ({
      ...p,
      active: false,
      dismissed: true,
      engineStatus: "idle",
      errorMessage: null,
    }));
  }, []);

  const reset = useCallback(() => {
    log("reset");
    guardKeyRef.current = "";
    abortRef.current?.abort();
    abortRef.current = null;
    const fresh = { ...INITIAL_GUIDE_STATE };
    setState(fresh);
    saveState(fresh);
  }, []);

  // ── Computed ──────────────────────────────────────────────────
  const chapter = state.chapterId ? getCh(state.chapterId) : null;
  const step = chapter?.steps[state.stepIndex] ?? null;

  const total = CHAPTERS.reduce((s, c) => s + c.steps.length, 0);
  let doneCount = 0;
  for (const c of CHAPTERS) {
    if (state.completedChapters.includes(c.id)) doneCount += c.steps.length;
    else if (c.id === state.chapterId) doneCount += state.stepIndex;
  }
  const progress = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  const isReady =
    hydrated && state.active && !!step && state.engineStatus === "ready";
  const isActive = hydrated && state.active;
  const isDone = state.completedChapters.length === CHAPTERS.length;

  return (
    <GuideCtx.Provider
      value={{
        state,
        account: accountState,
        step,
        chapter,
        progress,
        isReady,
        isActive,
        isDone,
        engineStatus: state.engineStatus,
        start,
        startChapter,
        next,
        close,
        reset,
        refresh: refreshAccountState,
      }}
    >
      {children}
    </GuideCtx.Provider>
  );
}

export function useGuide() {
  const c = useContext(GuideCtx);
  if (!c) throw new Error("useGuide requires GuideProvider");
  return c;
}
