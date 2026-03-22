// ═══════════════════════════════════════════════════════════════════
// Onboarding Prerequisites — Central source of truth
//
// RULES:
// 1. Every chapter has EXPLICIT prerequisites
// 2. A chapter NEVER starts if prerequisites are not met
// 3. If prerequisites fail, the engine REDIRECTS to the chapter
//    that creates the missing resource
// 4. Timeouts are NOT used as navigation — only as safety nets
//
// This file is the SINGLE source of truth for:
// - What each chapter needs to run
// - What the current onboarding context looks like
// - Which chapter can start given the context
// - Where to redirect if a chapter can't start
// ═══════════════════════════════════════════════════════════════════

import type { AccountState, GuideChapter } from "../model/guide.types";

// ── Onboarding Context ───────────────────────────────────────────

export interface OnboardingContext {
  siteExists: boolean;
  siteId: string | null;
  builderReady: boolean;
  productExists: boolean;
  hasProductBlock: boolean;
  sitePublished: boolean;
}

/**
 * Build the onboarding context from accountState + live bridge data.
 * Uses accountState (API-based) as primary source.
 * Augments with GuideBridge DOM data when available (live builder state).
 * This ensures blocks added in the builder are detected immediately,
 * even before the next accountState refresh.
 */
export function buildContext(account: AccountState): OnboardingContext {
  // Read live bridge data (only available on builder pages)
  const bridge =
    typeof document !== "undefined"
      ? document.getElementById("guide-bridge-state")
      : null;
  const bridgeHasBlock = bridge?.dataset.hasProductBlock === "true";
  const bridgeProductCount = Number(bridge?.dataset.displayedProductCount || "0");

  return {
    siteExists: account.hasSite,
    siteId: account.siteId,
    builderReady: account.hasSite && !!account.siteId,
    productExists: account.hasProducts,
    // Merge: accountState OR live bridge (bridge is more up-to-date for blocks)
    hasProductBlock: account.hasProductBlocks || bridgeHasBlock,
    sitePublished: account.sitePublished,
  };
}

// ── Prerequisites per chapter ────────────────────────────────────
// Each key is a chapter id. Value is an array of context keys that must be true.
// Empty array = no prerequisites (can always start).

export const CHAPTER_PREREQUISITES: Record<string, (keyof OnboardingContext)[]> = {
  create_site: [],
  site:        ["siteExists"],
  brief:       ["siteExists"],
  product:     ["siteExists"],
  builder:     ["siteExists", "productExists"],
  publish:     ["siteExists"],
  orders:      ["siteExists"],
  clients:     ["siteExists"],
};

// ── Redirect map ─────────────────────────────────────────────────
// When a prerequisite is missing, which chapter creates it?

const PREREQUISITE_RESOLVER: Record<string, string> = {
  siteExists:    "create_site",
  builderReady:  "create_site",
  productExists: "product",
};

// ── Functions ────────────────────────────────────────────────────

/**
 * Check if a chapter can start given the current context.
 * Returns { canStart, missing } where missing is the list of unmet prerequisites.
 */
export function canStartChapter(
  chapterId: string,
  context: OnboardingContext,
): { canStart: boolean; missing: string[] } {
  const prereqs = CHAPTER_PREREQUISITES[chapterId] ?? [];
  const missing = prereqs.filter((key) => !context[key]);
  return { canStart: missing.length === 0, missing };
}

/**
 * Find the first chapter in order that:
 * 1. Is NOT in completedChapters
 * 2. Has all prerequisites satisfied
 */
export function findFirstValidChapter(
  chapters: GuideChapter[],
  completedChapters: string[],
  context: OnboardingContext,
): GuideChapter | null {
  for (const ch of chapters) {
    if (completedChapters.includes(ch.id)) continue;
    const { canStart } = canStartChapter(ch.id, context);
    if (canStart) return ch;
  }
  return null;
}

/**
 * When a chapter can't start, find the chapter that resolves
 * the first missing prerequisite.
 */
export function resolveRedirectChapter(
  targetChapterId: string,
  context: OnboardingContext,
  chapters: GuideChapter[],
): GuideChapter | null {
  const { canStart, missing } = canStartChapter(targetChapterId, context);
  if (canStart) return null; // No redirect needed

  // Find the chapter that creates the first missing prerequisite
  for (const prereq of missing) {
    const redirectId = PREREQUISITE_RESOLVER[prereq];
    if (redirectId) {
      const ch = chapters.find((c) => c.id === redirectId);
      if (ch) return ch;
    }
  }

  // Fallback: go to the very first chapter
  return chapters[0] ?? null;
}

/**
 * Build a list of chapters that should be pre-marked as completed
 * based on the current context (for "Resume guide" / smart start).
 */
export function resolveCompletedChapters(
  chapters: GuideChapter[],
  startChapter: GuideChapter,
): string[] {
  const completed: string[] = [];
  for (const ch of chapters) {
    if (ch.id === startChapter.id) break;
    completed.push(ch.id);
  }
  return completed;
}

// ═══════════════════════════════════════════════════════════════════
// Auto-repair — Silent state correction
//
// Called during periodic refresh. Detects and fixes inconsistencies
// between the guide state and the real account state.
// NEVER breaks the flow — only corrects silently.
// ═══════════════════════════════════════════════════════════════════

export interface RepairResult {
  repaired: boolean;
  fixes: string[];
}

/**
 * Detect and suggest fixes for inconsistent guide state.
 * Does NOT mutate state — returns what should be fixed.
 * The caller (guide-engine) applies fixes if needed.
 */
export function detectStateInconsistencies(
  guideChapterId: string | null,
  guideActive: boolean,
  context: OnboardingContext,
  chapters: GuideChapter[],
): RepairResult {
  const fixes: string[] = [];

  if (!guideActive || !guideChapterId) return { repaired: false, fixes };

  // Check: is the current chapter's prerequisites still valid?
  const { canStart, missing } = canStartChapter(guideChapterId, context);
  if (!canStart) {
    fixes.push(
      `chapter "${guideChapterId}" has unmet prerequisites: [${missing.join(", ")}]`,
    );
  }

  // Check: does the current chapter still exist?
  const chapterExists = chapters.some((c) => c.id === guideChapterId);
  if (!chapterExists) {
    fixes.push(`chapter "${guideChapterId}" no longer exists in CHAPTERS`);
  }

  return { repaired: fixes.length > 0, fixes };
}
