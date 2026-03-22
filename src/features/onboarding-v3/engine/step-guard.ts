"use client";

import type { GuideStep, EngineStatus } from "../model/guide.types";

// ═══════════════════════════════════════════════════════════════════
// Step Guard V3 — Deterministic, robust, never-blocking
//
// RULES:
// 1. If route already matches → skip ALL navigate actions (strict)
// 2. Every async op checks AbortSignal immediately after
// 3. Structured outcomes: ready | aborted | timed_out
// 4. waitForElement uses MutationObserver + polling + immediate check
// 5. Comprehensive logging at every phase boundary
// ═══════════════════════════════════════════════════════════════════

// ── Types ─────────────────────────────────────────────────────────

export type WaitResult = {
  ok: boolean;
  reason: "found" | "timeout" | "aborted";
  element?: HTMLElement;
};

export type GuardOutcome =
  | { status: "ready"; target: HTMLElement | null }
  | { status: "aborted" }
  | { status: "timed_out"; phase: string };

// ── Constants ─────────────────────────────────────────────────────

const ROUTE_TIMEOUT = 4000;
const DOM_TIMEOUT = 3000;
const POLL_INTERVAL = 200;

const GLOBAL_ROUTES = [
  "/commandes",
  "/dashboard",
  "/clients",
  "/analytics",
  "/produits",
  "/parametres",
];

// ── Logging ───────────────────────────────────────────────────────

function glog(stepId: string, m: string) {
  if (process.env.NODE_ENV === "development")
    console.log(`[Guard ${stepId}] ${m}`);
}

// ═══════════════════════════════════════════════════════════════════
// waitForElement — Robust DOM element waiter
//
// - Resolves IMMEDIATELY if element already present (zero latency)
// - Uses MutationObserver for instant detection of new elements
// - Polls as fallback (covers attribute changes MutationObserver misses)
// - Respects AbortSignal
// - Returns structured { ok, reason, element }
// ═══════════════════════════════════════════════════════════════════

export function waitForElement(
  selector: string,
  options: { timeout: number; signal: AbortSignal },
): Promise<WaitResult> {
  const { timeout, signal } = options;
  const tag = "[waitForElement]";

  // ── Immediate check — zero latency if already present ──────────
  const immediate = document.querySelector<HTMLElement>(selector);
  if (immediate) {
    if (process.env.NODE_ENV === "development")
      console.log(`${tag} found immediately: ${selector}`);
    return Promise.resolve({ ok: true, reason: "found", element: immediate });
  }

  if (signal.aborted) {
    if (process.env.NODE_ENV === "development")
      console.log(`${tag} aborted before start: ${selector}`);
    return Promise.resolve({ ok: false, reason: "aborted" });
  }

  if (process.env.NODE_ENV === "development")
    console.log(`${tag} start: ${selector}`);

  return new Promise<WaitResult>((resolve) => {
    let resolved = false;
    let observer: MutationObserver | null = null;
    let timeoutTimer: ReturnType<typeof setTimeout> | null = null;
    let pollTimer: ReturnType<typeof setInterval> | null = null;

    const cleanup = () => {
      if (observer) {
        observer.disconnect();
        observer = null;
      }
      if (timeoutTimer) {
        clearTimeout(timeoutTimer);
        timeoutTimer = null;
      }
      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
      signal.removeEventListener("abort", onAbort);
    };

    const finish = (result: WaitResult) => {
      if (resolved) return;
      resolved = true;
      cleanup();
      if (process.env.NODE_ENV === "development")
        console.log(`${tag} ${result.reason}: ${selector}`);
      resolve(result);
    };

    const onAbort = () => finish({ ok: false, reason: "aborted" });

    signal.addEventListener("abort", onAbort, { once: true });

    // Timeout
    timeoutTimer = setTimeout(
      () => finish({ ok: false, reason: "timeout" }),
      timeout,
    );

    // MutationObserver for instant detection
    try {
      observer = new MutationObserver(() => {
        const el = document.querySelector<HTMLElement>(selector);
        if (el) finish({ ok: true, reason: "found", element: el });
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
      });
    } catch {
      // MutationObserver unavailable → polling is the fallback
    }

    // Polling fallback (catches attribute changes, etc.)
    pollTimer = setInterval(() => {
      const el = document.querySelector<HTMLElement>(selector);
      if (el) finish({ ok: true, reason: "found", element: el });
    }, POLL_INTERVAL);
  });
}

// ═══════════════════════════════════════════════════════════════════
// ensureStepContext — Main guard function
//
// Phases: ROUTE → PREACTIONS → DOM TARGET
// Each phase checks abort signal before AND after.
// Returns structured GuardOutcome — never throws.
// ═══════════════════════════════════════════════════════════════════

export async function ensureStepContext(
  step: GuideStep,
  pathname: string,
  push: (path: string) => void,
  siteId: string | null,
  onStatus: (s: EngineStatus) => void,
  signal: AbortSignal,
): Promise<GuardOutcome> {
  const id = step.id;

  try {
    // ── Phase 1: ROUTE — navigate ONLY if not already there ──────
    if (step.requiredRoute) {
      const routeOk = routeMatch(pathname, step.requiredRoute);

      if (routeOk) {
        glog(id, "route already OK — navigate skipped");
      } else {
        const built = buildPath(step.requiredRoute, siteId);
        if (built.ok) {
          glog(id, `navigating → ${built.path}`);
          onStatus("navigating");
          push(built.path);

          const arrived = await abortableWait(
            () => routeMatch(location.pathname, step.requiredRoute!),
            ROUTE_TIMEOUT,
            signal,
          );

          if (signal.aborted) return { status: "aborted" };
          if (!arrived) {
            glog(id, `route timeout → ${step.requiredRoute}`);
            return { status: "timed_out", phase: "navigate" };
          }

          await abortableSleep(300, signal);
        } else {
          glog(id, `nav skip (${built.reason})`);
        }
      }
    }

    if (signal.aborted) return { status: "aborted" };

    // ── Phase 2: PREACTIONS — skip navigate if route already OK ──
    if (step.preActions?.length) {
      onStatus("running_preactions");

      for (const pa of step.preActions) {
        if (signal.aborted) return { status: "aborted" };

        // STRICT RULE: skip navigate preActions if already at target route
        // Check against the preAction's OWN route, not step.requiredRoute
        if (pa.type === "navigate") {
          if (routeMatch(location.pathname, pa.route)) {
            glog(id, `preAction navigate skipped (already at ${pa.route})`);
            continue;
          }
        }

        glog(id, `preAction: ${pa.type}`);
        await runPreAction(pa, push, siteId, signal);
      }
    }

    if (signal.aborted) return { status: "aborted" };

    // ── Phase 3: DOM TARGET — best effort ────────────────────────
    let target: HTMLElement | null = null;

    if (step.target?.selector) {
      onStatus("waiting_dom");
      glog(id, `waiting DOM: ${step.target.selector}`);

      const result = await waitForElement(step.target.selector, {
        timeout: DOM_TIMEOUT,
        signal,
      });

      if (result.reason === "aborted") return { status: "aborted" };

      if (result.ok && result.element) {
        target = result.element;
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        await abortableSleep(200, signal);
        glog(id, "DOM found ✓");
      } else {
        glog(id, `DOM not found (${result.reason}) — no spotlight`);
      }
    }

    if (signal.aborted) return { status: "aborted" };

    glog(id, "✓ ready");
    return { status: "ready", target };
  } catch (e) {
    if (signal.aborted) {
      glog(id, "⊘ aborted (exception)");
      return { status: "aborted" };
    }
    glog(id, `⚠ error: ${e}`);
    // Best effort: show tooltip without spotlight
    return { status: "ready", target: null };
  }
}

// ═══════════════════════════════════════════════════════════════════
// Route helpers
// ═══════════════════════════════════════════════════════════════════

export function routeMatch(pathname: string, required: string): boolean {
  const clean = pathname.replace(/\/+$/, "");
  const req = required.replace(/\/+$/, "");
  if (clean === req) return true;
  const segs = clean.split("/").filter(Boolean);
  const reqSegs = req.split("/").filter(Boolean);
  if (reqSegs.length > segs.length) return false;
  return reqSegs.every(
    (s, i) => segs[segs.length - reqSegs.length + i] === s,
  );
}

export function buildPath(
  fragment: string,
  siteId: string | null,
): { ok: true; path: string } | { ok: false; reason: string } {
  if (GLOBAL_ROUTES.some((r) => fragment.startsWith(r)))
    return { ok: true, path: fragment };
  if (fragment.startsWith("/site-web/")) return { ok: true, path: fragment };
  if (!siteId) return { ok: false, reason: `No siteId for "${fragment}"` };
  return { ok: true, path: `/site-web/${siteId}${fragment}` };
}

// ═══════════════════════════════════════════════════════════════════
// PreAction runner — best-effort, respects AbortSignal
// ═══════════════════════════════════════════════════════════════════

async function runPreAction(
  pa: import("../model/guide.types").PreAction,
  push: (p: string) => void,
  siteId: string | null,
  signal: AbortSignal,
): Promise<void> {
  if (signal.aborted) return;
  try {
    switch (pa.type) {
      case "navigate": {
        const r = buildPath(pa.route, siteId);
        if (!r.ok) return;
        // Double-check: skip if already there
        if (routeMatch(location.pathname, pa.route)) return;
        push(r.path);
        await abortableWait(
          () => routeMatch(location.pathname, pa.route),
          ROUTE_TIMEOUT,
          signal,
        );
        return;
      }
      case "scrollTo": {
        const result = await waitForElement(pa.selector, {
          timeout: 1500,
          signal,
        });
        if (result.ok && result.element) {
          result.element.scrollIntoView({
            behavior: "smooth",
            block: pa.block ?? "center",
          });
          await abortableSleep(200, signal);
        }
        return;
      }
      case "click": {
        const result = await waitForElement(pa.selector, {
          timeout: DOM_TIMEOUT,
          signal,
        });
        if (result.ok && result.element) {
          result.element.click();
          await abortableSleep(200, signal);
        }
        return;
      }
      case "waitFor": {
        await waitForElement(pa.selector, {
          timeout: pa.timeout ?? DOM_TIMEOUT,
          signal,
        });
        return;
      }
      case "waitVisible": {
        await waitForElement(pa.selector, {
          timeout: pa.timeout ?? DOM_TIMEOUT,
          signal,
        });
        return;
      }
      case "delay": {
        await abortableSleep(pa.ms, signal);
        return;
      }
    }
  } catch {
    // best-effort, never throw
  }
}

// ═══════════════════════════════════════════════════════════════════
// Abortable async helpers
// ═══════════════════════════════════════════════════════════════════

function abortableSleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal.aborted) {
      resolve();
      return;
    }
    const t = setTimeout(resolve, ms);
    signal.addEventListener("abort", () => { clearTimeout(t); resolve(); }, {
      once: true,
    });
  });
}

async function abortableWait(
  check: () => boolean,
  timeout: number,
  signal: AbortSignal,
): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (signal.aborted) return false;
    if (check()) return true;
    await abortableSleep(POLL_INTERVAL, signal);
  }
  return false;
}
