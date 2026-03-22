// ═══════════════════════════════════════════════════════════════════
// Frustration Detection — Understands the user, not just talks to them
//
// Tracks signals of user struggle and adapts guidance accordingly.
// Purely additive — no existing contract modified.
//
// Signals:
// - Time on step (slow = potentially confused)
// - Retries / repeated step visits
// - Timeout hits
// - Close + reopen guide
//
// Score: 0 (smooth) → 10 (very frustrated)
// At high scores, the guide can simplify its messaging.
// ═══════════════════════════════════════════════════════════════════

const FRUSTRATION_KEY = "jestly_guide_frustration";

export interface FrustrationState {
  score: number; // 0-10
  stepRetries: Record<string, number>; // stepId → retry count
  stepDurations: Record<string, number>; // stepId → last duration ms
  timeouts: number; // total timeouts hit
  closedCount: number; // times the guide was closed
  lastStepId: string | null;
  recentSmoothSteps: number; // consecutive steps without issues
}

const INITIAL: FrustrationState = {
  score: 0,
  stepRetries: {},
  stepDurations: {},
  timeouts: 0,
  closedCount: 0,
  lastStepId: null,
  recentSmoothSteps: 0,
};

// ── Thresholds ───────────────────────────────────────────────────

const SLOW_STEP_MS = 30_000; // 30s on a step = potentially confused
const VERY_SLOW_STEP_MS = 60_000; // 60s = likely stuck
const MAX_RETRIES_BEFORE_FRUSTRATED = 2;

// ── State management ─────────────────────────────────────────────

let state: FrustrationState = INITIAL;

function load(): FrustrationState {
  if (typeof window === "undefined") return INITIAL;
  try {
    const raw = localStorage.getItem(FRUSTRATION_KEY);
    return raw ? { ...INITIAL, ...JSON.parse(raw) } : INITIAL;
  } catch {
    return INITIAL;
  }
}

function save() {
  try {
    localStorage.setItem(FRUSTRATION_KEY, JSON.stringify(state));
  } catch {}
}

function recalcScore() {
  let s = 0;

  // Timeouts add frustration
  s += Math.min(state.timeouts * 2, 4);

  // Retries on any step
  const maxRetries = Math.max(0, ...Object.values(state.stepRetries));
  if (maxRetries >= MAX_RETRIES_BEFORE_FRUSTRATED) s += 2;
  if (maxRetries >= 4) s += 2;

  // Closed guide multiple times
  if (state.closedCount >= 2) s += 1;
  if (state.closedCount >= 4) s += 1;

  // Momentum decay: consecutive smooth steps reduce frustration
  if (state.recentSmoothSteps >= 3) s -= 1;
  if (state.recentSmoothSteps >= 5) s -= 1;

  state.score = Math.min(10, Math.max(0, s));
}

// ── Public API ───────────────────────────────────────────────────

export function initFrustration() {
  state = load();
}

export function getFrustrationState(): FrustrationState {
  return { ...state };
}

export function getFrustrationScore(): number {
  return state.score;
}

/**
 * Is the user frustrated enough that we should simplify guidance?
 * Returns true when score >= 5.
 */
export function isUserFrustrated(): boolean {
  return state.score >= 5;
}

/**
 * Call when a step completes. Records duration and detects slow steps.
 */
export function recordStepComplete(stepId: string, durationMs: number) {
  state.stepDurations[stepId] = durationMs;

  // Track smooth momentum: if step completed quickly without retries, it's smooth
  const stepRetries = state.stepRetries[stepId] ?? 0;
  if (durationMs < SLOW_STEP_MS && stepRetries === 0) {
    state.recentSmoothSteps += 1;
  } else {
    state.recentSmoothSteps = 0; // Reset on any struggle
  }

  state.lastStepId = stepId;
  recalcScore();
  save();

  if (process.env.NODE_ENV === "development" && durationMs > SLOW_STEP_MS) {
    console.log(
      `[Frustration] step ${stepId}: ${Math.round(durationMs / 1000)}s (${durationMs > VERY_SLOW_STEP_MS ? "VERY SLOW" : "slow"})`,
    );
  }
}

/**
 * Call when a step is visited again (retry / re-entry).
 */
export function recordStepRetry(stepId: string) {
  state.stepRetries[stepId] = (state.stepRetries[stepId] ?? 0) + 1;
  state.recentSmoothSteps = 0; // Reset momentum on retry
  recalcScore();
  save();

  if (process.env.NODE_ENV === "development") {
    console.log(
      `[Frustration] step ${stepId}: retry #${state.stepRetries[stepId]} — score=${state.score}`,
    );
  }
}

/**
 * Call when a timeout is hit.
 */
export function recordTimeout(stepId: string) {
  state.timeouts += 1;
  state.stepRetries[stepId] = (state.stepRetries[stepId] ?? 0) + 1;
  state.recentSmoothSteps = 0; // Reset momentum on timeout
  recalcScore();
  save();

  if (process.env.NODE_ENV === "development") {
    console.log(
      `[Frustration] timeout on ${stepId} — total timeouts=${state.timeouts}, score=${state.score}`,
    );
  }
}

/**
 * Call when the guide is closed by the user.
 */
export function recordGuideClosed() {
  state.closedCount += 1;
  recalcScore();
  save();
}

/**
 * Reset frustration (e.g., when guide is reset).
 */
export function resetFrustration() {
  state = { ...INITIAL };
  save();
}
