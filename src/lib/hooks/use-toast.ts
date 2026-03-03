/**
 * Global toast notification system.
 *
 * Module-level store (no React Context needed). Works from anywhere:
 *   import { toast } from "@/lib/hooks/use-toast";
 *   toast.success("Done!");
 *   toast.error("Oops", { title: "Erreur serveur" });
 *
 * React hook for subscribing to the list:
 *   const { toasts, dismiss } = useToasts();
 */
import { useSyncExternalStore } from "react";

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  variant: ToastVariant;
  message: string;
  title?: string;
  duration: number;        // ms — 0 = manual dismiss only
  createdAt: number;       // Date.now()
  pausedAt?: number;       // set while hovered
  remaining?: number;      // ms left when paused
}

/* ─── Internal state ─── */
let toasts: Toast[] = [];
let nextId = 0;
const MAX_VISIBLE = 3;
const listeners = new Set<() => void>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();

function emit() { listeners.forEach((l) => l()); }

function getSnapshot() { return toasts; }
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

/* ─── Duration defaults ─── */
const DEFAULT_DURATION: Record<ToastVariant, number> = {
  success: 3500,
  info: 4500,
  warning: 6000,
  error: 0,   // manual dismiss
};

/* ─── Core functions ─── */
function scheduleRemoval(id: string, ms: number) {
  clearTimer(id);
  if (ms <= 0) return;
  timers.set(id, setTimeout(() => dismiss(id), ms));
}

function clearTimer(id: string) {
  const t = timers.get(id);
  if (t) { clearTimeout(t); timers.delete(id); }
}

function push(variant: ToastVariant, message: string, opts?: { title?: string; duration?: number; id?: string }) {
  const id = opts?.id ?? `toast-${++nextId}`;
  const duration = opts?.duration ?? DEFAULT_DURATION[variant];

  // Deduplicate by id
  if (opts?.id) {
    const existing = toasts.find((t) => t.id === id);
    if (existing) {
      // Update message + reset timer
      toasts = toasts.map((t) =>
        t.id === id ? { ...t, message, title: opts.title ?? t.title, createdAt: Date.now(), duration } : t
      );
      scheduleRemoval(id, duration);
      emit();
      return id;
    }
  }

  const t: Toast = { id, variant, message, title: opts?.title, duration, createdAt: Date.now() };
  toasts = [t, ...toasts];

  // Evict oldest beyond max
  if (toasts.length > MAX_VISIBLE) {
    const evicted = toasts.slice(MAX_VISIBLE);
    toasts = toasts.slice(0, MAX_VISIBLE);
    evicted.forEach((e) => clearTimer(e.id));
  }

  scheduleRemoval(id, duration);
  emit();
  return id;
}

export function dismiss(id: string) {
  clearTimer(id);
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

export function pauseToast(id: string) {
  const t = toasts.find((x) => x.id === id);
  if (!t || t.duration <= 0) return;
  clearTimer(id);
  const elapsed = Date.now() - t.createdAt;
  const remaining = Math.max(t.duration - elapsed, 500);
  toasts = toasts.map((x) => x.id === id ? { ...x, pausedAt: Date.now(), remaining } : x);
  emit();
}

export function resumeToast(id: string) {
  const t = toasts.find((x) => x.id === id);
  if (!t || !t.pausedAt) return;
  const remaining = t.remaining ?? t.duration;
  toasts = toasts.map((x) =>
    x.id === id ? { ...x, pausedAt: undefined, remaining: undefined, createdAt: Date.now() - (t.duration - remaining), duration: t.duration } : x
  );
  scheduleRemoval(id, remaining);
  emit();
}

/* ─── Public API ─── */
export const toast = {
  success: (message: string, opts?: { title?: string; duration?: number; id?: string }) =>
    push("success", message, opts),
  error: (message: string, opts?: { title?: string; duration?: number; id?: string }) =>
    push("error", message, opts),
  warning: (message: string, opts?: { title?: string; duration?: number; id?: string }) =>
    push("warning", message, opts),
  info: (message: string, opts?: { title?: string; duration?: number; id?: string }) =>
    push("info", message, opts),
  dismiss,
};

/* ─── React hook ─── */
export function useToasts() {
  const list = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return { toasts: list, dismiss, pause: pauseToast, resume: resumeToast };
}
