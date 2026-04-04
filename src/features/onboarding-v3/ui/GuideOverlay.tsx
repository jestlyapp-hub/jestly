"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGuide } from "../engine/guide-engine";
import {
  ArrowRight,
  Lightbulb,
  Loader2,
  AlertCircle,
  Clock,
  RotateCcw,
  X,
} from "lucide-react";
import { computeCoachmarkPosition } from "./coachmark-position";
import { getStepCopy, getGuideExperienceMode } from "../missions/adaptive";
import { useScrollLock } from "./use-modal-behavior";

const PADDING = 8;
const BORDER_RADIUS = 12;

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export default function GuideOverlay() {
  const {
    isReady,
    isActive,
    step,
    chapter,
    engineStatus,
    state,
    progress,
    chapterIndex,
    totalChapters,
    next,
    close,
    start,
  } = useGuide();
  const [spot, setSpot] = useState<Rect | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  // ── Spotlight tracking ──────────────────────────────────────
  const updateSpot = useCallback(() => {
    if (!step?.target?.selector) {
      setSpot(null);
      return;
    }
    const el = document.querySelector(step.target.selector);
    if (!el) {
      setSpot(null);
      return;
    }
    const r = el.getBoundingClientRect();
    setSpot({
      top: r.top - PADDING,
      left: r.left - PADDING,
      width: r.width + PADDING * 2,
      height: r.height + PADDING * 2,
    });
  }, [step?.target?.selector]);

  useEffect(() => {
    if (!isReady || !step?.target?.selector) {
      setSpot(null);
      return;
    }
    updateSpot();
    intervalRef.current = setInterval(updateSpot, 500);
    window.addEventListener("scroll", updateSpot, true);
    window.addEventListener("resize", updateSpot);
    return () => {
      clearInterval(intervalRef.current);
      window.removeEventListener("scroll", updateSpot, true);
      window.removeEventListener("resize", updateSpot);
    };
  }, [isReady, step?.target?.selector, updateSpot]);

  // Z-index boost
  useEffect(() => {
    if (!isReady || !step?.target?.selector || !spot) return;
    const el = document.querySelector(step.target.selector) as HTMLElement | null;
    if (!el) return;
    const prev = { pos: el.style.position, z: el.style.zIndex };
    if (getComputedStyle(el).position === "static")
      el.style.position = "relative";
    el.style.zIndex = "81";
    return () => {
      el.style.position = prev.pos;
      el.style.zIndex = prev.z;
    };
  }, [isReady, spot, step?.target?.selector]);

  // Click validation
  useEffect(() => {
    if (!isReady || !step || step.completeWhen.type !== "click") return;
    const sel = step.completeWhen.selector;
    const handler = (e: MouseEvent) => {
      const el = document.querySelector(sel);
      const t = e.target as Element;
      if (el && (el === t || el.contains(t))) setTimeout(next, 200);
    };
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, [isReady, step, next]);

  // ── Custom validator polling ─────────────────────────────────
  // CRITICAL: Uses isActive, NOT isReady.
  // The validator polls independently of the guard's status.
  // The guard prepares context (navigation, DOM).
  // The validator checks actual state (products displayed, site published).
  // These are SEPARATE concerns — a timed_out guard must NOT block validation.
  const [validatorTimedOut, setValidatorTimedOut] = useState(false);
  const [validatorSatisfied, setValidatorSatisfied] = useState(false);
  const validatorLastRunRef = useRef<number>(0);

  // Derive step identity for effect deps (avoid object reference issues)
  const customValidatorKey = step?.completeWhen.type === "custom" ? step.completeWhen.key : null;
  const customPollMs = step?.completeWhen.type === "custom" ? (step.completeWhen.pollMs ?? 1000) : 1000;
  const customTimeoutMs = step?.completeWhen.type === "custom" ? (step.completeWhen.timeoutMs ?? 120000) : 120000;

  useEffect(() => {
    // Reset states when step changes
    setValidatorTimedOut(false);
    setValidatorSatisfied(false);

    // DECOUPLED: run on isActive, NOT isReady
    if (!isActive || !step || !customValidatorKey) return;

    let cancelled = false;
    const startTime = Date.now();
    const log = (m: string) => {
      if (process.env.NODE_ENV === "development")
        console.log(`[Onboarding] ${step.id}: ${m}`);
    };

    log("validation start");

    const poll = async () => {
      if (cancelled) return;
      try {
        const { runValidator } = await import("../missions/validators");
        const result = await runValidator(customValidatorKey);
        validatorLastRunRef.current = Date.now();

        if (cancelled) return;

        if (result.valid) {
          log(`completionSatisfied=true (${result.message || "valid"})`);
          log("completing step");
          setValidatorSatisfied(true);
          next();
          return;
        }
      } catch (e) {
        log(`validation error: ${e}`);
      }

      // Check timeout — but ALWAYS do a final validation before giving up
      if (Date.now() - startTime > customTimeoutMs) {
        log("timeout check — running final validation");
        try {
          const { runValidator } = await import("../missions/validators");
          const finalResult = await runValidator(customValidatorKey);
          if (cancelled) return;
          if (finalResult.valid) {
            log("final completionSatisfied=true — completing instead of timeout");
            setValidatorSatisfied(true);
            next();
            return;
          }
          log("final completionSatisfied=false — marking timed_out");
        } catch {}
        if (!cancelled) setValidatorTimedOut(true);
        return;
      }

      if (!cancelled) setTimeout(poll, customPollMs);
    };

    // Auto-setup GuideBridge actions based on the validator key
    if (customValidatorKey === "product_displayed" || customValidatorKey === "has_product_block") {
      // Ensure product block exists + select it
      window.dispatchEvent(
        new CustomEvent("jestly-guide", { detail: { action: "ensure-product-block" } }),
      );
      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent("jestly-guide", { detail: { action: "select-product-block" } }),
        );
      }, 300);
      // Also ensure a product exists (create demo if needed)
      window.dispatchEvent(
        new CustomEvent("jestly-guide", { detail: { action: "ensure-demo-product" } }),
      );
    }
    if (customValidatorKey === "block_or_library_open" || customValidatorKey === "block_or_vente_selected") {
      // Ensure demo product exists early
      window.dispatchEvent(
        new CustomEvent("jestly-guide", { detail: { action: "ensure-demo-product" } }),
      );
    }

    // Start polling immediately (no unnecessary delay)
    const startTimer = setTimeout(poll, 200);

    return () => {
      cancelled = true;
      clearTimeout(startTimer);
    };
  }, [isActive, step?.id, customValidatorKey, customPollMs, customTimeoutMs, next]);

  // ── Scroll lock quand overlay bloquant est actif ──
  const isBlockingOverlay = isActive && !!step && step.nonBlocking !== true;
  useScrollLock(isBlockingOverlay);

  if (!isActive) return null;

  // ── For custom validator steps: guard status is SECONDARY ──────
  // The validator polls independently. If the guard times out but the
  // validator is still running, show the tooltip (not the timeout modal).
  const isCustomStep = !!customValidatorKey;

  // ── Preparing / Loading states ─────────────────────────────────
  // For custom validator steps, only show loading briefly (don't block)
  if (
    !isCustomStep && (
      engineStatus === "preparing" ||
      engineStatus === "navigating" ||
      engineStatus === "running_preactions" ||
      engineStatus === "waiting_dom"
    )
  ) {
    return <LoadingOverlay engineStatus={engineStatus} onSkip={next} onClose={close} />;
  }

  // ── Timed out ──────────────────────────────────────────────────
  // For custom validator steps: skip guard timeout modal — validator is in charge
  if (engineStatus === "timed_out" && !isCustomStep) {
    return (
      <div className="fixed inset-0 z-[80] bg-black/30 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl px-6 py-5 shadow-xl max-w-sm mx-4 relative"
        >
          <button
            onClick={close}
            className="absolute top-2 right-2 p-1 rounded-lg text-[#CCCCCC] hover:text-[#8A8A88] hover:bg-[#F7F7F5] transition-all cursor-pointer"
          >
            <X size={14} />
          </button>
          <div className="flex items-center gap-3 mb-3">
            <Clock size={20} className="text-amber-500 flex-shrink-0" />
            <p className="text-[14px] font-semibold text-[#191919]">
              Délai dépassé
            </p>
          </div>
          <p className="text-[12px] text-[#8A8A88] mb-4">
            {state.errorMessage ||
              "Impossible de préparer cette étape dans le temps imparti."}
          </p>
          <div className="flex gap-2">
            <button
              onClick={next}
              className="text-[12px] font-medium text-[#4F46E5] hover:underline cursor-pointer flex items-center gap-1"
            >
              <ArrowRight size={12} /> Passer cette étape
            </button>
            <button
              onClick={() => {
                // Retry: reset guard tracking and restart current step
                start();
              }}
              className="text-[12px] font-medium text-[#8A8A88] hover:underline cursor-pointer flex items-center gap-1 ml-auto"
            >
              <RotateCcw size={12} /> Réessayer
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Error — skip for custom steps (validator handles it) ──────
  if (engineStatus === "error" && !isCustomStep) {
    return (
      <div className="fixed inset-0 z-[80] bg-black/30 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl px-6 py-5 shadow-xl max-w-sm mx-4 relative"
        >
          <button
            onClick={close}
            className="absolute top-2 right-2 p-1 rounded-lg text-[#CCCCCC] hover:text-[#8A8A88] hover:bg-[#F7F7F5] transition-all cursor-pointer"
          >
            <X size={14} />
          </button>
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
            <p className="text-[14px] font-semibold text-[#191919]">
              Erreur de préparation
            </p>
          </div>
          <p className="text-[12px] text-[#8A8A88] mb-4">
            {state.errorMessage ||
              "Impossible de préparer cette étape."}
          </p>
          <div className="flex gap-2">
            <button
              onClick={next}
              className="text-[12px] font-medium text-[#4F46E5] hover:underline cursor-pointer flex items-center gap-1"
            >
              <ArrowRight size={12} /> Passer cette étape
            </button>
            <button
              onClick={close}
              className="text-[12px] text-[#8A8A88] hover:underline cursor-pointer ml-auto"
            >
              Fermer
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Idle: guard hasn't run yet — brief flash, no overlay ──────
  // For custom validator steps: show tooltip even if guard isn't ready
  // (the validator polls independently of guard status)
  const showTooltip = isCustomStep ? (isActive && !!step) : isReady;
  if (!showTooltip || !step) return null;

  const hasSpot = !!spot;
  const needsBlock = step.completeWhen.type === "acknowledge";
  const tone = step.tone ?? "neutral";
  const isNonBlocking = step.nonBlocking === true;

  // ── Adaptive copy: adjust text based on frustration level ─────
  const adaptedCopy = getStepCopy(
    step.id,
    step.title,
    step.body,
    step.why,
    step.ctaLabel,
  );
  const displayTitle = adaptedCopy.title;
  const displayBody = adaptedCopy.body;
  const displayWhy = adaptedCopy.why;
  const displayCtaLabel = adaptedCopy.ctaLabel;

  // ── NON-BLOCKING MODE ──────────────────────────────────────
  // For steps like template selection: compact banner at top,
  // NO dark overlay, page fully interactive.
  if (isNonBlocking) {
    return (
      <motion.div
        key={step.id}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.25 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-[85] pointer-events-auto"
        style={{ width: "min(420px, calc(100vw - 32px))" }}
      >
        <div role="dialog" aria-label={`Guide Jestly : ${step.title}`} aria-live="polite" className="bg-white rounded-2xl border border-[#E6E6E4] shadow-xl shadow-black/8 px-5 py-4 relative">
          <button
            onClick={close}
            aria-label="Fermer le guide"
            className="absolute top-3 right-3 p-1 rounded-lg text-[#CCCCCC] hover:text-[#8A8A88] hover:bg-[#F7F7F5] transition-all cursor-pointer z-10"
            title="Fermer le guide"
          >
            <X size={14} />
          </button>
          <div className="mb-2 pr-8 flex items-center gap-2">
            {chapter && (
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{ color: chapter.color, backgroundColor: `${chapter.color}15` }}
              >
                {chapter.icon} {chapter.title}
              </span>
            )}
            {chapterIndex >= 0 && (
              <span className="text-[9px] font-medium text-[#B0B0AE]">
                {chapterIndex + 1}/{totalChapters}
              </span>
            )}
          </div>
          <h3 className="text-[14px] font-bold text-[#191919] mb-1 pr-8">{displayTitle}</h3>
          <p className="text-[12px] text-[#5A5A58] leading-relaxed whitespace-pre-line">{displayBody}</p>
          {displayWhy && (
            <p className="text-[11px] text-[#8A8A88] mt-1">{displayWhy}</p>
          )}
          {step.completeWhen.type === "custom" && !validatorTimedOut && (
            <div className="mt-2 flex items-center gap-1.5">
              <Loader2 size={11} className="text-[#4F46E5] animate-spin" />
              <span className="text-[11px] text-[#4F46E5] font-medium">
                {customValidatorKey === "product_displayed"
                  ? "Cliquez sur le produit dans la liste."
                  : customValidatorKey === "site_exists"
                    ? "Choisissez un template ci-dessous."
                    : customValidatorKey === "site_published"
                      ? "Cliquez sur Publier."
                      : "En attente de votre action…"}
              </span>
            </div>
          )}
          {validatorTimedOut && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[11px] text-red-500">Impossible de détecter l&apos;action.</span>
              <button onClick={next} className="text-[11px] font-medium text-[#4F46E5] hover:underline cursor-pointer">Passer</button>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[80]"
        style={{ pointerEvents: "none" }}
      >
        {hasSpot ? (
          <FourPanel spot={spot} />
        ) : (
          <div
            className="w-full h-full"
            style={{
              backgroundColor: "rgba(0,0,0,0.45)",
              pointerEvents: needsBlock ? "auto" : "none",
            }}
          />
        )}
      </div>

      {/* Spotlight ring — premium glow animation */}
      {hasSpot && (
        <motion.div
          className="fixed z-[80] pointer-events-none"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{
            top: spot.top,
            left: spot.left,
            width: spot.width,
            height: spot.height,
            transition: "top 250ms ease, left 250ms ease, width 250ms ease, height 250ms ease",
          }}
        >
          {/* Border ring with smooth glow cycle */}
          <div
            className={`absolute inset-0 border-2 ${
              step?.completeWhen.type === "custom"
                ? "border-amber-400"
                : "border-[#4F46E5]"
            }`}
            style={{
              borderRadius: BORDER_RADIUS,
              animation: "guide-spotlight-pulse 2s ease-in-out infinite",
            }}
          />
          {/* Outer glow */}
          <div
            className="absolute -inset-1"
            style={{
              borderRadius: BORDER_RADIUS + 2,
              boxShadow: step?.completeWhen.type === "custom"
                ? "0 0 24px 6px rgba(245,158,11,0.2)"
                : "0 0 20px 4px rgba(79,70,229,0.12)",
              animation: "guide-glow-breathe 2s ease-in-out infinite",
            }}
          />
          {/* Keyframes defined in globals.css (guide-spotlight-pulse, guide-glow-breathe) */}
        </motion.div>
      )}

      {/* Tooltip — positioned by coachmark engine */}
      <CoachmarkCard
        key={step.id}
        spot={spot}
        preferredPlacement={step.target?.placement ?? step.placement ?? "center"}
      >
          <div
            role="dialog"
            aria-label={`Guide Jestly : ${step.title}`}
            aria-live="polite"
            className={`bg-white rounded-2xl border shadow-2xl shadow-black/10 overflow-hidden relative ${
              tone === "success"
                ? "border-emerald-200"
                : tone === "warning"
                  ? "border-amber-200"
                  : "border-[#E6E6E4]"
            }`}
          >
            {/* Close button */}
            <button
              onClick={close}
              aria-label="Fermer le guide"
              className="absolute top-3 right-3 p-1 rounded-lg text-[#CCCCCC] hover:text-[#8A8A88] hover:bg-[#F7F7F5] transition-all cursor-pointer z-10"
              title="Fermer le guide"
            >
              <X size={14} />
            </button>
            {chapter && (
              <div className="px-5 pt-4 pb-0 pr-10">
                <span
                  className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{
                    color: chapter.color,
                    backgroundColor: `${chapter.color}15`,
                  }}
                >
                  {chapter.icon} {chapter.title}
                </span>
              </div>
            )}
            <div className="px-5 pt-3 pb-4 pr-10">
              <h3 className="text-[15px] font-bold text-[#191919] mb-1.5">
                {displayTitle}
              </h3>
              <p className="text-[13px] text-[#5A5A58] leading-relaxed whitespace-pre-line">
                {displayBody}
              </p>
              {displayWhy && (
                <div className="mt-3 flex gap-2.5 p-3 rounded-xl bg-[#FFF7ED] border border-amber-100">
                  <Lightbulb
                    size={14}
                    className="text-amber-500 flex-shrink-0 mt-0.5"
                  />
                  <p className="text-[11px] text-amber-800 leading-relaxed whitespace-pre-line">
                    {displayWhy}
                  </p>
                </div>
              )}
            </div>
            <div className="px-5 pb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {chapterIndex >= 0 && (
                  <span className="text-[10px] font-semibold text-[#B0B0AE]">
                    Section {chapterIndex + 1}/{totalChapters}
                  </span>
                )}
                {chapter && (
                  <span className="text-[10px] text-[#D0D0CE]">
                    — étape {chapter.steps.indexOf(step) + 1}/{chapter.steps.length}
                  </span>
                )}
              </div>
              {step.completeWhen.type === "acknowledge" && (
                <button
                  onClick={next}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4F46E5] text-white text-[13px] font-semibold shadow-sm hover:bg-[#4338CA] active:scale-[0.98] transition-all cursor-pointer"
                >
                  {displayCtaLabel || "Suivant"} <ArrowRight size={14} />
                </button>
              )}
              {step.completeWhen.type === "click" && (
                <span className="text-[11px] text-[#4F46E5] font-medium animate-pulse">
                  Cliquez sur l&apos;élément en surbrillance
                </span>
              )}
              {step.completeWhen.type === "custom" && !validatorTimedOut && (
                <span className="text-[11px] text-[#4F46E5] font-medium animate-pulse flex items-center gap-1">
                  <Loader2 size={11} className="animate-spin" />
                  {customValidatorKey === "product_displayed"
                    ? "Cliquez sur le produit dans la liste."
                    : customValidatorKey === "site_published"
                      ? "Cliquez sur Publier."
                      : "En attente de votre action…"}
                </span>
              )}
              {step.completeWhen.type === "custom" && validatorTimedOut && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-red-500 font-medium">
                    Impossible de détecter l&apos;action.
                  </span>
                  <button onClick={next} className="text-[11px] font-medium text-[#4F46E5] hover:underline cursor-pointer">
                    Passer
                  </button>
                </div>
              )}
            </div>
          </div>
      </CoachmarkCard>
    </>
  );
}

// ── CoachmarkCard — smart viewport-aware positioning ─────────────

function CoachmarkCard({
  spot,
  preferredPlacement,
  children,
}: {
  spot: Rect | null;
  preferredPlacement: string;
  children: React.ReactNode;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  // Recalculate position when spot, card size, or viewport changes
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const recalc = () => {
      const cr = card.getBoundingClientRect();
      const result = computeCoachmarkPosition(
        spot,
        cr.width || 380,
        cr.height || 200,
        preferredPlacement,
      );
      setPos({ top: result.top, left: result.left });

      if (process.env.NODE_ENV === "development") {
        card.dataset.placement = result.placement;
        card.dataset.fallback = String(result.fallbackUsed);
        card.dataset.clamped = String(result.clamped);
      }
    };

    // Initial calc with rAF to avoid flicker
    requestAnimationFrame(recalc);

    // Recalc on resize + scroll
    window.addEventListener("resize", recalc);
    window.addEventListener("scroll", recalc, true);

    // ResizeObserver for card content changes
    let ro: ResizeObserver | null = null;
    try {
      ro = new ResizeObserver(recalc);
      ro.observe(card);
    } catch {}

    return () => {
      window.removeEventListener("resize", recalc);
      window.removeEventListener("scroll", recalc, true);
      ro?.disconnect();
    };
  }, [spot, preferredPlacement]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
        className="fixed z-[85] max-h-[calc(100vh-32px)] overflow-y-auto"
        style={{
          width: "min(380px, calc(100vw - 32px))",
          top: pos?.top ?? "50%",
          left: pos?.left ?? "50%",
          pointerEvents: "auto",
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// ── Loading overlay — derives visibility from engineStatus only ───

function LoadingOverlay({
  engineStatus,
  onSkip,
  onClose,
}: {
  engineStatus: string;
  onSkip: () => void;
  onClose: () => void;
}) {
  const [showSkip, setShowSkip] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShowSkip(true), 3000);
    return () => clearTimeout(t);
  }, []);

  const statusLabel =
    engineStatus === "navigating"
      ? "Navigation en cours…"
      : engineStatus === "running_preactions"
        ? "Préparation de la page…"
        : engineStatus === "waiting_dom"
          ? "Recherche de l\u2019élément…"
          : "Préparation…";

  return (
    <div className="fixed inset-0 z-[80] bg-black/30 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl px-6 py-5 shadow-xl max-w-sm mx-4 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 rounded-lg text-[#CCCCCC] hover:text-[#8A8A88] hover:bg-[#F7F7F5] transition-all cursor-pointer"
        >
          <X size={14} />
        </button>
        <div className="flex items-center gap-3">
          <Loader2
            size={20}
            className="text-[#4F46E5] animate-spin flex-shrink-0"
          />
          <div>
            <p className="text-[14px] font-semibold text-[#191919]">
              {statusLabel}
            </p>
          </div>
        </div>
        {showSkip && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mt-3 pt-3 border-t border-[#E6E6E4]"
          >
            <button
              onClick={onSkip}
              className="text-[12px] font-medium text-[#4F46E5] hover:underline cursor-pointer flex items-center gap-1"
            >
              <RotateCcw size={12} /> Passer cette étape
            </button>
            <button
              onClick={onClose}
              className="text-[12px] text-[#8A8A88] hover:underline cursor-pointer ml-auto"
            >
              Fermer
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

function FourPanel({ spot }: { spot: Rect }) {
  const b = "rgba(0,0,0,0.45)";
  const t = "all 250ms ease";
  const s: React.CSSProperties = {
    position: "absolute",
    backgroundColor: b,
    pointerEvents: "auto",
    transition: t,
  };
  const r = spot.left + spot.width;
  const bt = spot.top + spot.height;
  return (
    <>
      <div
        style={{
          ...s,
          top: 0,
          left: 0,
          right: 0,
          height: Math.max(0, spot.top),
        }}
      />
      <div style={{ ...s, top: bt, left: 0, right: 0, bottom: 0 }} />
      <div
        style={{
          ...s,
          top: spot.top,
          left: 0,
          width: Math.max(0, spot.left),
          height: spot.height,
        }}
      />
      <div
        style={{ ...s, top: spot.top, left: r, right: 0, height: spot.height }}
      />
    </>
  );
}
