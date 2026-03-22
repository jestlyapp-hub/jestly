// ═══════════════════════════════════════════════════════════════════
// ONBOARDING V3 — Types
// Principe : SHOW DON'T TELL. Strict context. Real objects.
// ═══════════════════════════════════════════════════════════════════

// ── Step kinds ──────────────────────────────────────────────────

export type StepKind =
  | "intro"       // Quick context-setter (1-2 sentences)
  | "navigate"    // Auto-navigate to correct page
  | "show"        // Spotlight a real element + explain
  | "explain"     // Educational overlay (center card)
  | "action"      // User must do something
  | "recap"       // Summary of what was accomplished
  | "checkpoint"; // Validate real account state before continuing

export type Placement = "top" | "bottom" | "left" | "right" | "center";
export type Tone = "neutral" | "info" | "action" | "success" | "warning";

// ── Route matching ──────────────────────────────────────────────

/** Route fragment — matched against end of pathname */
export type RoutePattern = string;

// ── PreActions ──────────────────────────────────────────────────

export type PreAction =
  | { type: "navigate"; route: RoutePattern }
  | { type: "scrollTo"; selector: string; block?: ScrollLogicalPosition }
  | { type: "click"; selector: string }
  | { type: "waitFor"; selector: string; timeout?: number }
  | { type: "waitVisible"; selector: string; timeout?: number }
  | { type: "delay"; ms: number };

// ── Complete rules ──────────────────────────────────────────────

export type CompleteRule =
  | { type: "acknowledge" }
  | { type: "click"; selector: string }
  | { type: "routeReached"; route: RoutePattern }
  | { type: "elementExists"; selector: string }
  | { type: "custom"; key: string; pollMs?: number; timeoutMs?: number };

// ── Account state ───────────────────────────────────────────────

export interface AccountState {
  loading: boolean;
  siteId: string | null;
  hasSite: boolean;
  siteStyled: boolean;
  sitePublished: boolean;
  blocksCount: number;
  hasBlocks: boolean;
  hasProductBlocks: boolean;
  hasProducts: boolean;
  hasClients: boolean;
  hasOrders: boolean;
}

// ── Target ──────────────────────────────────────────────────────

export interface StepTarget {
  selector: string;
  placement: Placement;
  spotlightPadding?: number;
}

// ── Step ────────────────────────────────────────────────────────

export interface GuideStep {
  id: string;
  chapterId: string;
  title: string;
  body: string;
  why?: string;
  kind: StepKind;
  tone?: Tone;

  /** Route that must be active for this step to render */
  requiredRoute?: RoutePattern;

  /** Tooltip placement when no target (defaults to center) */
  placement?: Placement;

  /** Element to spotlight */
  target?: StepTarget;

  /** Actions executed BEFORE showing the tooltip */
  preActions?: PreAction[];

  /** How this step completes */
  completeWhen: CompleteRule;
  ctaLabel?: string;

  /** Skip if account already satisfies this */
  skipIf?: (a: AccountState) => boolean;
  skipMessage?: string;

  /** True = educational, replays even if action done */
  educational?: boolean;

  /** True = non-blocking mode: no dark overlay, compact top banner.
   *  Use for steps where the user must interact with the page freely
   *  (e.g., choosing a template, selecting from a gallery). */
  nonBlocking?: boolean;
}

// ── Chapter ─────────────────────────────────────────────────────

export interface GuideChapter {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  steps: GuideStep[];
  skipIf?: (a: AccountState) => boolean;
  skipMessage?: string;
}

// ── Engine state ────────────────────────────────────────────────

export type EngineStatus =
  | "idle"
  | "bootstrapping"
  | "no_site"
  | "preparing"
  | "navigating"
  | "running_preactions"
  | "waiting_dom"
  | "ready"
  | "error"
  | "timed_out";

export interface GuideState {
  active: boolean;
  chapterId: string | null;
  stepIndex: number;
  completedChapters: string[];
  dismissed: boolean;
  engineStatus: EngineStatus;
  errorMessage: string | null;
}

export const INITIAL_GUIDE_STATE: GuideState = {
  active: false,
  chapterId: null,
  stepIndex: 0,
  completedChapters: [],
  dismissed: false,
  engineStatus: "idle",
  errorMessage: null,
};
