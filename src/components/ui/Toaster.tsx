"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useToasts, type Toast, type ToastVariant } from "@/lib/hooks/use-toast";

/* ─── Variant config ─── */
const VARIANT_STYLES: Record<ToastVariant, { bg: string; border: string; icon: string; progress: string }> = {
  success: {
    bg: "bg-white/85",
    border: "border-emerald-200/60",
    icon: "text-emerald-500",
    progress: "bg-emerald-400",
  },
  error: {
    bg: "bg-white/85",
    border: "border-red-200/60",
    icon: "text-red-500",
    progress: "bg-red-400",
  },
  warning: {
    bg: "bg-white/85",
    border: "border-amber-200/60",
    icon: "text-amber-500",
    progress: "bg-amber-400",
  },
  info: {
    bg: "bg-white/85",
    border: "border-blue-200/60",
    icon: "text-blue-500",
    progress: "bg-blue-400",
  },
};

/* ─── Icons per variant (inline SVG, 18px) ─── */
function ToastIcon({ variant }: { variant: ToastVariant }) {
  const cls = `w-[18px] h-[18px] flex-shrink-0 ${VARIANT_STYLES[variant].icon}`;
  switch (variant) {
    case "success":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      );
    case "error":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" strokeWidth="2" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      );
    case "warning":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeWidth="2" />
        </svg>
      );
    case "info":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" strokeWidth="2" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      );
  }
}

/* ─── Progress bar with pause support ─── */
function ProgressBar({ toast: t }: { toast: Toast }) {
  const style = VARIANT_STYLES[t.variant];
  if (t.duration <= 0) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-b-xl overflow-hidden bg-black/[0.04]">
      <motion.div
        className={`h-full ${style.progress} origin-left`}
        initial={{ scaleX: 1 }}
        animate={{ scaleX: t.pausedAt ? undefined : 0 }}
        transition={t.pausedAt ? { duration: 0 } : {
          duration: (t.remaining ?? t.duration) / 1000,
          ease: "linear",
        }}
        style={t.pausedAt && t.remaining ? { scaleX: t.remaining / t.duration } : undefined}
      />
    </div>
  );
}

/* ─── Single toast item ─── */
function ToastItem({ t, onDismiss, onPause, onResume }: {
  t: Toast;
  onDismiss: (id: string) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
}) {
  const style = VARIANT_STYLES[t.variant];
  const ariaLive = t.variant === "error" ? "assertive" as const : "polite" as const;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ type: "spring", damping: 25, stiffness: 350 }}
      onMouseEnter={() => onPause(t.id)}
      onMouseLeave={() => onResume(t.id)}
      role="status"
      aria-live={ariaLive}
      className={`
        pointer-events-auto relative w-[360px] max-w-[calc(100vw-2rem)]
        ${style.bg} backdrop-blur-xl
        border ${style.border}
        rounded-xl shadow-lg shadow-black/[0.08]
        overflow-hidden cursor-default
      `}
    >
      <div className="flex items-start gap-3 px-4 py-3.5">
        <div className="mt-0.5">
          <ToastIcon variant={t.variant} />
        </div>
        <div className="flex-1 min-w-0">
          {t.title && (
            <p className="text-[13px] font-semibold text-[#191919] leading-tight mb-0.5">
              {t.title}
            </p>
          )}
          <p className="text-[13px] text-[#5A5A58] leading-snug">
            {t.message}
          </p>
        </div>
        <button
          onClick={() => onDismiss(t.id)}
          className="mt-0.5 p-0.5 rounded-md hover:bg-black/[0.05] transition-colors cursor-pointer flex-shrink-0 group"
          aria-label="Fermer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8A8A88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-[#5A5A58] transition-colors">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <ProgressBar toast={t} />
    </motion.div>
  );
}

/* ─── Toaster container (mount once in layout) ─── */
export default function Toaster() {
  const { toasts, dismiss, pause, resume } = useToasts();

  return (
    <div
      aria-label="Notifications"
      className="fixed top-4 right-4 z-[9999] pointer-events-none flex flex-col gap-2.5 items-end"
    >
      <AnimatePresence initial={false} mode="popLayout">
        {toasts.map((t) => (
          <ToastItem
            key={t.id}
            t={t}
            onDismiss={dismiss}
            onPause={pause}
            onResume={resume}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
