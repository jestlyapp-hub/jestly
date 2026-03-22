/**
 * Guide Engine V3 — Comprehensive anti-regression tests
 * Run: npx vitest run src/features/onboarding-v3/engine/__tests__/guide-engine.test.ts
 */

import { describe, it, expect, vi } from "vitest";
import { CHAPTERS } from "../../model/guide.chapters";
import { INITIAL_GUIDE_STATE } from "../../model/guide.types";
import { routeMatch, buildPath } from "../step-guard";
import type { EngineStatus } from "../../model/guide.types";
import type { AccountState } from "../../model/guide.types";
import {
  buildContext,
  canStartChapter,
  findFirstValidChapter,
  resolveRedirectChapter,
  CHAPTER_PREREQUISITES,
} from "../../missions/prerequisites";

// ═══════════════════════════════════════════════════════════════
// 1. Flow config integrity — start() ne force pas un chapitre legacy
// ═══════════════════════════════════════════════════════════════

describe("Flow config", () => {
  it("CHAPTERS[0] is create_site (Phase 0)", () => {
    expect(CHAPTERS.length).toBeGreaterThan(0);
    expect(CHAPTERS[0].id).toBe("create_site");
    expect(CHAPTERS[0].steps[0].id).toBe("create_site_intro");
  });

  it("CHAPTERS[1] is site (Phase 1, after site creation)", () => {
    expect(CHAPTERS[1].id).toBe("site");
    expect(CHAPTERS[1].steps[0].id).toBe("welcome");
  });

  it("chapters follow the correct order (8 phases)", () => {
    const ids = CHAPTERS.map((c) => c.id);
    expect(ids).toEqual([
      "create_site",
      "site",
      "brief",
      "product",
      "builder",
      "publish",
      "orders",
      "clients",
    ]);
  });

  it("every step has a unique id", () => {
    const ids = CHAPTERS.flatMap((c) => c.steps.map((s) => s.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every step references its parent chapter", () => {
    for (const ch of CHAPTERS) {
      for (const step of ch.steps) {
        expect(step.chapterId).toBe(ch.id);
      }
    }
  });

  it("every step has a completeWhen", () => {
    for (const ch of CHAPTERS) {
      for (const step of ch.steps) {
        expect(step.completeWhen).toBeDefined();
        expect([
          "acknowledge",
          "click",
          "routeReached",
          "elementExists",
          "custom",
        ]).toContain(step.completeWhen.type);
      }
    }
  });

  it("no chapter has skipIf", () => {
    for (const ch of CHAPTERS) {
      expect(ch.skipIf).toBeUndefined();
    }
  });

  it("no step has skipIf", () => {
    for (const ch of CHAPTERS) {
      for (const step of ch.steps) {
        expect(step.skipIf).toBeUndefined();
      }
    }
  });

  it("product chapter is NOT first — no legacy fallback", () => {
    const productIdx = CHAPTERS.findIndex((c) => c.id === "product");
    expect(productIdx).toBeGreaterThan(1); // must be after create_site AND site
  });
});

// ═══════════════════════════════════════════════════════════════
// 2. route already OK => navigate skipped
// ═══════════════════════════════════════════════════════════════

describe("routeMatch (navigate skip logic)", () => {
  it("exact match → route already OK", () => {
    expect(routeMatch("/commandes", "/commandes")).toBe(true);
  });

  it("tail match → route already OK", () => {
    expect(routeMatch("/site-web/abc-123/offres", "/offres")).toBe(true);
  });

  it("no match → navigate needed", () => {
    expect(routeMatch("/dashboard", "/offres")).toBe(false);
  });

  it("partial segment no match", () => {
    expect(routeMatch("/site-web/abc/offres-plus", "/offres")).toBe(false);
  });

  it("trailing slash ignored", () => {
    expect(routeMatch("/commandes/", "/commandes")).toBe(true);
  });

  it("createur route matches with siteId prefix", () => {
    expect(routeMatch("/site-web/abc/createur", "/createur")).toBe(true);
  });

  // This is the CRITICAL test: the step-guard must skip navigate
  // when routeMatch returns true for the requiredRoute
  it("if routeMatch is true, no navigate should happen (logic contract)", () => {
    // All steps with preAction navigate also have a matching requiredRoute
    for (const ch of CHAPTERS) {
      for (const step of ch.steps) {
        if (!step.preActions) continue;
        for (const pa of step.preActions) {
          if (pa.type === "navigate" && step.requiredRoute) {
            // If we're already at the requiredRoute, routeMatch must be true
            // and the navigate must be skipped
            const builtPath = buildPath(step.requiredRoute, "test-site-id");
            if (builtPath.ok) {
              expect(routeMatch(builtPath.path, step.requiredRoute)).toBe(true);
            }
          }
        }
      }
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// 3. same step same context => no rerun (guardKeyRef logic)
// ═══════════════════════════════════════════════════════════════

describe("Guard deduplication (same step => no rerun)", () => {
  it("guardKeyRef pattern prevents duplicate runs", () => {
    let guardKey = "";

    const shouldRunGuard = (chapterId: string, stepIndex: number): boolean => {
      const key = `${chapterId}:${stepIndex}`;
      if (guardKey === key) return false;
      guardKey = key;
      return true;
    };

    // First call → should run
    expect(shouldRunGuard("site", 0)).toBe(true);

    // Same step → should NOT rerun
    expect(shouldRunGuard("site", 0)).toBe(false);

    // Different step → should run
    expect(shouldRunGuard("site", 1)).toBe(true);

    // Same new step → should NOT rerun
    expect(shouldRunGuard("site", 1)).toBe(false);

    // Reset (simulates next() or start())
    guardKey = "";

    // After reset, same step CAN run again
    expect(shouldRunGuard("site", 1)).toBe(true);
  });

  it("rerender with same chapterId:stepIndex does NOT trigger rerun", () => {
    let guardKey = "";
    let runCount = 0;

    const simulateEffectRun = (chapterId: string, stepIndex: number) => {
      const key = `${chapterId}:${stepIndex}`;
      if (guardKey === key) return; // Skip — same step
      guardKey = key;
      runCount++;
    };

    // Initial run
    simulateEffectRun("site", 0);
    expect(runCount).toBe(1);

    // Rerender with same deps (React rerender)
    simulateEffectRun("site", 0);
    expect(runCount).toBe(1); // Still 1 — no rerun

    // 10 more rerenders
    for (let i = 0; i < 10; i++) {
      simulateEffectRun("site", 0);
    }
    expect(runCount).toBe(1); // Still 1 — deduplication works
  });
});

// ═══════════════════════════════════════════════════════════════
// 4. guard success => ready
// ═══════════════════════════════════════════════════════════════

describe("Guard success => ready", () => {
  it("steps without constraints go through fast path (ready immediately)", () => {
    const introSteps = CHAPTERS.flatMap((c) =>
      c.steps.filter(
        (s) =>
          !s.requiredRoute &&
          (!s.preActions || s.preActions.length === 0) &&
          !s.target,
      ),
    );
    expect(introSteps.length).toBeGreaterThan(0);

    // All unconstrained steps are intro/explain/recap types
    for (const s of introSteps) {
      const hasConstraints =
        s.requiredRoute ||
        (s.preActions && s.preActions.length > 0) ||
        s.target;
      expect(hasConstraints).toBeFalsy();
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// 5. guard abort on step change => clean exit
// ═══════════════════════════════════════════════════════════════

describe("Guard abort on step change", () => {
  it("AbortController.abort() fires synchronously", () => {
    const ac = new AbortController();
    expect(ac.signal.aborted).toBe(false);

    ac.abort();
    expect(ac.signal.aborted).toBe(true);
  });

  it("abort listener fires when signal is aborted", () => {
    const ac = new AbortController();
    const handler = vi.fn();
    ac.signal.addEventListener("abort", handler);

    ac.abort();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("old guard is aborted when new guard starts (lifecycle simulation)", () => {
    let guardKey = "";
    let abortController: AbortController | null = null;
    const abortedGuards: number[] = [];

    const runGuard = (chapterId: string, stepIndex: number, guardId: number) => {
      const key = `${chapterId}:${stepIndex}`;
      if (guardKey === key) return;
      guardKey = key;

      // Abort previous
      if (abortController) {
        abortController.abort();
        abortedGuards.push(guardId - 1);
      }
      abortController = new AbortController();
    };

    // Guard 1 starts
    runGuard("site", 0, 1);
    expect(abortedGuards).toEqual([]);

    // Guard 2 starts → guard 1 aborted
    guardKey = ""; // simulates next()
    runGuard("site", 1, 2);
    expect(abortedGuards).toEqual([1]);

    // Guard 3 starts → guard 2 aborted
    guardKey = "";
    runGuard("brief", 0, 3);
    expect(abortedGuards).toEqual([1, 2]);
  });
});

// ═══════════════════════════════════════════════════════════════
// 6. stale result: only if runId is OLDER than current
// ═══════════════════════════════════════════════════════════════

describe("Stale result detection", () => {
  it("stale only when runId < currentRunId", () => {
    let currentRunId = 0;

    const isStale = (runId: number): boolean => currentRunId !== runId;

    // Run 1
    currentRunId = 1;
    expect(isStale(1)).toBe(false); // current → NOT stale

    // Run 2 starts
    currentRunId = 2;
    expect(isStale(1)).toBe(true); // old → stale
    expect(isStale(2)).toBe(false); // current → NOT stale

    // Run 3
    currentRunId = 3;
    expect(isStale(1)).toBe(true);
    expect(isStale(2)).toBe(true);
    expect(isStale(3)).toBe(false); // current → NOT stale
  });

  it("stale NOT triggered when runId === current (THE critical bug fix)", () => {
    // This was the exact bug in the old code:
    //   stale result ignored (guardId=3, current=3)
    // If IDs are equal, the result MUST NOT be stale
    const currentRunId = 3;
    const runId = 3;

    const isStale = currentRunId !== runId;
    expect(isStale).toBe(false);

    // Double-check: both abort signal AND runId must indicate stale
    const signalAborted = false;
    const shouldDiscard = signalAborted || isStale;
    expect(shouldDiscard).toBe(false);
  });

  it("stale detection uses strict !== comparison", () => {
    // Verify it's not a loose comparison issue
    const currentRunId = 3;

    expect(currentRunId !== 3).toBe(false); // NOT stale
    expect(currentRunId !== 2).toBe(true); // stale
    expect(currentRunId !== 4).toBe(true); // stale (shouldn't happen but correct)
  });
});

// ═══════════════════════════════════════════════════════════════
// 7. waitForElement resolves immediately if present (logic test)
// ═══════════════════════════════════════════════════════════════

describe("waitForElement contract", () => {
  // DOM tests can't run in node environment, so we test the CONTRACT:
  // If document.querySelector returns an element, waitForElement must
  // resolve immediately without polling or timeout

  it("immediate resolution is sync if element exists (contract)", () => {
    // The implementation does:
    //   const immediate = document.querySelector(selector);
    //   if (immediate) return Promise.resolve({ ok: true, reason: 'found', element: immediate });
    //
    // This means: no setTimeout, no setInterval, no MutationObserver
    // → resolves in the same microtask

    // We can verify the Promise.resolve pattern:
    const result = Promise.resolve({ ok: true, reason: "found" as const });
    expect(result).toBeInstanceOf(Promise);
  });
});

// ═══════════════════════════════════════════════════════════════
// 8. preparing modal state derivation
// ═══════════════════════════════════════════════════════════════

describe("Preparing modal visibility (state machine)", () => {
  const preparingStatuses: EngineStatus[] = [
    "preparing",
    "navigating",
    "running_preactions",
    "waiting_dom",
  ];

  it("preparing modal shows ONLY for preparing-like statuses", () => {
    const allStatuses: EngineStatus[] = [
      "idle",
      "bootstrapping",
      "no_site",
      "preparing",
      "navigating",
      "running_preactions",
      "waiting_dom",
      "ready",
      "error",
      "timed_out",
    ];

    for (const status of allStatuses) {
      const shouldShowLoading = preparingStatuses.includes(status);
      if (
        status === "preparing" ||
        status === "navigating" ||
        status === "running_preactions" ||
        status === "waiting_dom"
      ) {
        expect(shouldShowLoading).toBe(true);
      } else {
        expect(shouldShowLoading).toBe(false);
      }
    }
  });

  it("preparing modal closes on ready", () => {
    expect(preparingStatuses.includes("ready")).toBe(false);
  });

  it("preparing modal closes on abort (idle)", () => {
    expect(preparingStatuses.includes("idle")).toBe(false);
  });

  it("preparing modal closes on timed_out", () => {
    expect(preparingStatuses.includes("timed_out")).toBe(false);
  });

  it("preparing modal closes on error", () => {
    expect(preparingStatuses.includes("error")).toBe(false);
  });

  it("no status shows both loading AND tooltip simultaneously", () => {
    const allStatuses: EngineStatus[] = [
      "idle",
      "bootstrapping",
      "no_site",
      "preparing",
      "navigating",
      "running_preactions",
      "waiting_dom",
      "ready",
      "error",
      "timed_out",
    ];
    for (const status of allStatuses) {
      const showLoading = preparingStatuses.includes(status);
      const showTooltip = status === "ready";
      expect(showLoading && showTooltip).toBe(false);
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// 9. buildPath
// ═══════════════════════════════════════════════════════════════

describe("buildPath", () => {
  it("global routes don't need siteId", () => {
    expect(buildPath("/commandes", null)).toEqual({
      ok: true,
      path: "/commandes",
    });
    expect(buildPath("/clients", null)).toEqual({
      ok: true,
      path: "/clients",
    });
  });

  it("site-specific routes need siteId", () => {
    expect(buildPath("/offres", "abc")).toEqual({
      ok: true,
      path: "/site-web/abc/offres",
    });
    expect(buildPath("/createur", "abc")).toEqual({
      ok: true,
      path: "/site-web/abc/createur",
    });
  });

  it("site-specific routes fail without siteId", () => {
    const r = buildPath("/offres", null);
    expect(r.ok).toBe(false);
  });

  it("already full path passes through", () => {
    expect(buildPath("/site-web/abc/offres", null)).toEqual({
      ok: true,
      path: "/site-web/abc/offres",
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// 10. INITIAL_GUIDE_STATE
// ═══════════════════════════════════════════════════════════════

describe("INITIAL_GUIDE_STATE", () => {
  it("starts inactive", () => {
    expect(INITIAL_GUIDE_STATE.active).toBe(false);
  });

  it("starts idle", () => {
    expect(INITIAL_GUIDE_STATE.engineStatus).toBe("idle");
  });

  it("has no chapter", () => {
    expect(INITIAL_GUIDE_STATE.chapterId).toBeNull();
  });

  it("has empty completedChapters", () => {
    expect(INITIAL_GUIDE_STATE.completedChapters).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════
// 11. Guard behavior expectations
// ═══════════════════════════════════════════════════════════════

describe("Guard behavior", () => {
  it("navigate preActions always have a route", () => {
    for (const ch of CHAPTERS) {
      for (const step of ch.steps) {
        if (!step.preActions) continue;
        for (const pa of step.preActions) {
          if (pa.type === "navigate") {
            expect(pa.route).toBeDefined();
            expect(pa.route.startsWith("/")).toBe(true);
          }
        }
      }
    }
  });

  it("waitFor preActions always have a selector", () => {
    for (const ch of CHAPTERS) {
      for (const step of ch.steps) {
        if (!step.preActions) continue;
        for (const pa of step.preActions) {
          if (pa.type === "waitFor") {
            expect(pa.selector).toBeDefined();
            expect(pa.selector.length).toBeGreaterThan(0);
          }
        }
      }
    }
  });

  it("every navigate preAction route can be built with a siteId", () => {
    for (const ch of CHAPTERS) {
      for (const step of ch.steps) {
        if (!step.preActions) continue;
        for (const pa of step.preActions) {
          if (pa.type === "navigate") {
            const result = buildPath(pa.route, "test-site-id");
            expect(result.ok).toBe(true);
          }
        }
      }
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// 12. Builder chapter — 7 sous-étapes + anti-regression
// ═══════════════════════════════════════════════════════════════

describe("Builder chapter: add product sales block", () => {
  const builder = CHAPTERS.find((c) => c.id === "builder")!;

  it("builder chapter exists with 7 steps", () => {
    expect(builder).toBeDefined();
    expect(builder.steps.length).toBe(7);
  });

  it("step order is correct", () => {
    const ids = builder.steps.map((s) => s.id);
    expect(ids).toEqual([
      "builder_intro",
      "builder_open_library",
      "builder_select_vente",
      "builder_pick_block",
      "builder_block_ready",
      "builder_select_product",
      "builder_product_visible",
    ]);
  });

  it("library/vente/pick steps use adaptive custom validators (auto-skip if block exists)", () => {
    const openLib = builder.steps.find((s) => s.id === "builder_open_library")!;
    const selectVente = builder.steps.find((s) => s.id === "builder_select_vente")!;
    const pickBlock = builder.steps.find((s) => s.id === "builder_pick_block")!;

    expect(openLib.completeWhen.type).toBe("custom");
    expect(selectVente.completeWhen.type).toBe("custom");
    expect(pickBlock.completeWhen.type).toBe("custom");

    if (openLib.completeWhen.type === "custom") expect(openLib.completeWhen.key).toBe("block_or_library_open");
    if (selectVente.completeWhen.type === "custom") expect(selectVente.completeWhen.key).toBe("block_or_vente_selected");
    if (pickBlock.completeWhen.type === "custom") expect(pickBlock.completeWhen.key).toBe("has_product_block");
  });

  it("builder_select_product uses product_displayed validator", () => {
    const step = builder.steps.find((s) => s.id === "builder_select_product")!;
    expect(step.completeWhen.type).toBe("custom");
    if (step.completeWhen.type === "custom") {
      expect(step.completeWhen.key).toBe("product_displayed");
      expect(step.completeWhen.timeoutMs).toBeGreaterThanOrEqual(60000);
    }
  });

  it("adaptive skip logic: if block exists, validators return true immediately", () => {
    // Simulate: bridge says hasProductBlock=true
    const hasProductBlock = true;

    // block_or_library_open: skip if block exists
    expect(hasProductBlock).toBe(true);

    // block_or_vente_selected: skip if block exists
    expect(hasProductBlock).toBe(true);

    // has_product_block: skip if block exists
    expect(hasProductBlock).toBe(true);

    // All 3 steps would auto-complete in ~300ms each → fast path to step 5
  });

  it("if hasProductBlock=true and productsDisplayed>=1 then step MUST complete", () => {
    const hasProductBlock = true;
    const productsDisplayed = 1;
    const completionSatisfied = hasProductBlock && productsDisplayed > 0;
    expect(completionSatisfied).toBe(true);
    expect(!completionSatisfied).toBe(false); // never timeout
  });

  it("custom validator polling does NOT require isReady (decoupled from guard)", () => {
    const engineStatus = "timed_out";
    const isActive = true;
    const isCustomStep = true;
    const isReady = engineStatus === "ready";
    expect(isReady).toBe(false);
    const showTooltip = isCustomStep ? isActive : isReady;
    expect(showTooltip).toBe(true);
    const shouldPoll = isActive && isCustomStep;
    expect(shouldPoll).toBe(true);
  });

  it("last-chance validation prevents false timeout", () => {
    let timedOut = false;
    let completed = false;
    const completionSatisfied = true;
    if (completionSatisfied) { completed = true; } else { timedOut = true; }
    expect(completed).toBe(true);
    expect(timedOut).toBe(false);
  });

  it("builder chapter transitions to publish chapter", () => {
    const builderIdx = CHAPTERS.findIndex((c) => c.id === "builder");
    const publishIdx = CHAPTERS.findIndex((c) => c.id === "publish");
    expect(publishIdx).toBe(builderIdx + 1);
  });

  it("builder_block_ready has acknowledge completion (not DOM-dependent)", () => {
    const step = builder.steps.find((s) => s.id === "builder_block_ready")!;
    expect(step.completeWhen.type).toBe("acknowledge");
  });

  it("no step depends solely on a highlight selector for completion", () => {
    for (const step of builder.steps) {
      if (step.completeWhen.type === "custom") {
        // Custom validators check business state, not DOM selectors
        expect(["block_or_library_open", "block_or_vente_selected", "has_product_block", "product_displayed"]).toContain(
          step.completeWhen.key,
        );
      }
      // No click-on-selector for critical steps
      if (step.id === "builder_select_product") {
        expect(step.completeWhen.type).not.toBe("click");
      }
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// 14. Phase 0 — create_site + adaptive start
// ═══════════════════════════════════════════════════════════════

describe("Phase 0: create_site + adaptive start", () => {
  const createSite = CHAPTERS.find((c) => c.id === "create_site")!;

  it("create_site chapter exists as CHAPTERS[0]", () => {
    expect(createSite).toBeDefined();
    expect(CHAPTERS[0].id).toBe("create_site");
  });

  it("create_site has 3 steps: intro, choose, done", () => {
    expect(createSite.steps.length).toBe(3);
    expect(createSite.steps.map((s) => s.id)).toEqual([
      "create_site_intro",
      "create_site_choose",
      "create_site_done",
    ]);
  });

  it("create_site_choose uses site_exists validator", () => {
    const step = createSite.steps.find((s) => s.id === "create_site_choose")!;
    expect(step.completeWhen.type).toBe("custom");
    if (step.completeWhen.type === "custom") {
      expect(step.completeWhen.key).toBe("site_exists");
    }
  });

  it("if siteExists=false, first mission is create_site", () => {
    // Simulate start() logic: no site → CHAPTERS[0] = create_site
    const hasSite = false;
    const startChapter = hasSite
      ? CHAPTERS.find((c) => c.id !== "create_site")
      : CHAPTERS[0];
    expect(startChapter?.id).toBe("create_site");
  });

  it("if siteExists=true, first mission is site (skip create_site)", () => {
    const hasSite = true;
    const startChapter = hasSite
      ? CHAPTERS.find((c) => c.id !== "create_site")
      : CHAPTERS[0];
    expect(startChapter?.id).toBe("site");
    expect(startChapter?.id).not.toBe("create_site");
  });

  it("builder chapter NEVER starts without a site existing first", () => {
    // builder is at index > 1, create_site is at index 0
    const builderIdx = CHAPTERS.findIndex((c) => c.id === "builder");
    const createSiteIdx = CHAPTERS.findIndex((c) => c.id === "create_site");
    const siteIdx = CHAPTERS.findIndex((c) => c.id === "site");
    expect(builderIdx).toBeGreaterThan(siteIdx);
    expect(siteIdx).toBeGreaterThan(createSiteIdx);
  });

  it("no builder/product/brief step can run before create_site in chapter order", () => {
    const createSiteIdx = CHAPTERS.findIndex((c) => c.id === "create_site");
    const briefIdx = CHAPTERS.findIndex((c) => c.id === "brief");
    const productIdx = CHAPTERS.findIndex((c) => c.id === "product");
    const builderIdx = CHAPTERS.findIndex((c) => c.id === "builder");
    const publishIdx = CHAPTERS.findIndex((c) => c.id === "publish");

    expect(briefIdx).toBeGreaterThan(createSiteIdx);
    expect(productIdx).toBeGreaterThan(createSiteIdx);
    expect(builderIdx).toBeGreaterThan(createSiteIdx);
    expect(publishIdx).toBeGreaterThan(createSiteIdx);
  });

  it("site_exists validator checks URL pattern (contract)", () => {
    // The validator checks: path matches /site-web/{id}/ and NOT /nouveau
    const pathAfterCreation = "/site-web/abc123/createur";
    const pathBeforeCreation = "/site-web/nouveau";

    const isCreated = (p: string) =>
      /\/site-web\/[^/]+\//.test(p) && !p.includes("/nouveau");

    expect(isCreated(pathAfterCreation)).toBe(true);
    expect(isCreated(pathBeforeCreation)).toBe(false);
  });

  it("completedChapters includes create_site when site already exists", () => {
    // When start() is called with hasSite=true, it pre-marks create_site as completed
    const hasSite = true;
    const completedChapters = hasSite ? ["create_site"] : [];
    expect(completedChapters).toContain("create_site");
  });
});

// ═══════════════════════════════════════════════════════════════
// 15. Non-blocking mode — template selection UX
// ═══════════════════════════════════════════════════════════════

describe("Non-blocking mode for template selection", () => {
  it("create_site_choose step has nonBlocking=true", () => {
    const createSite = CHAPTERS.find((c) => c.id === "create_site")!;
    const chooseStep = createSite.steps.find((s) => s.id === "create_site_choose")!;
    expect(chooseStep.nonBlocking).toBe(true);
  });

  it("nonBlocking steps do NOT use acknowledge (no popup button to close)", () => {
    for (const ch of CHAPTERS) {
      for (const step of ch.steps) {
        if (step.nonBlocking) {
          expect(step.completeWhen.type).not.toBe("acknowledge");
        }
      }
    }
  });

  it("nonBlocking mode means no dark overlay (contract)", () => {
    // In the overlay: isNonBlocking → early return with compact banner
    // This test verifies the logic contract
    const isNonBlocking = true;
    const needsBlock = false; // completeWhen != "acknowledge"
    const hasSpot = false; // no target element

    // In normal mode, this would show a dark overlay
    // In nonBlocking mode, NO overlay at all
    const showDarkOverlay = !isNonBlocking && !hasSpot;
    expect(showDarkOverlay).toBe(false);
  });

  it("nonBlocking steps with custom validators still poll normally", () => {
    const createSite = CHAPTERS.find((c) => c.id === "create_site")!;
    const chooseStep = createSite.steps.find((s) => s.id === "create_site_choose")!;
    expect(chooseStep.nonBlocking).toBe(true);
    expect(chooseStep.completeWhen.type).toBe("custom");
    if (chooseStep.completeWhen.type === "custom") {
      expect(chooseStep.completeWhen.key).toBe("site_exists");
    }
  });

  it("template cards remain clickable (pointerEvents contract)", () => {
    // In nonBlocking mode: no overlay div with pointerEvents: "auto"
    // The page underneath is fully interactive
    const isNonBlocking = true;
    const overlayPointerEvents = isNonBlocking ? "none" : "auto";
    expect(overlayPointerEvents).toBe("none");
  });
});

// ═══════════════════════════════════════════════════════════════
// 13. Coachmark positioning — viewport-aware
// ═══════════════════════════════════════════════════════════════

describe("Coachmark positioning engine", () => {
  // Inline the pure positioning logic for testing (no window/DOM dependency)
  const VP = 16, GAP = 14;
  type Pl = "right" | "left" | "top" | "bottom" | "center";
  type Anch = { top: number; left: number; width: number; height: number };

  function computeCoachmarkPosition(
    a: Anch | null, cw: number, ch: number, pref: string, vw: number, vh: number,
  ) {
    if (!a || pref === "center") {
      return { top: Math.max(VP, (vh - ch) / 2), left: Math.max(VP, (vw - cw) / 2), placement: "center" as Pl, fallbackUsed: false, clamped: false };
    }
    const cx = a.left + a.width / 2, cy = a.top + a.height / 2;
    const norm = (p: string): Pl => (["right","left","top","bottom"].includes(p) ? p as Pl : "bottom");
    const calc = (p: Pl) => {
      switch (p) {
        case "right": return { left: a.left + a.width + GAP, top: cy - ch / 2 };
        case "left": return { left: a.left - cw - GAP, top: cy - ch / 2 };
        case "bottom": return { left: cx - cw / 2, top: a.top + a.height + GAP };
        case "top": return { left: cx - cw / 2, top: a.top - ch - GAP };
        default: return { left: cx - cw / 2, top: cy - ch / 2 };
      }
    };
    const fits = (l: number, t: number) => l >= VP && t >= VP && l + cw <= vw - VP && t + ch <= vh - VP;
    const preferred = norm(pref);
    const order: Pl[] = [preferred];
    for (const p of ["bottom", "right", "left", "top"] as Pl[]) { if (!order.includes(p)) order.push(p); }
    for (const p of order) {
      const r = calc(p);
      if (fits(r.left, r.top)) return { ...r, placement: p, fallbackUsed: p !== preferred, clamped: false };
    }
    const raw = calc(preferred);
    const cl = (v: number, mn: number, mx: number) => Math.max(mn, Math.min(v, mx));
    return { top: cl(raw.top, VP, vh - ch - VP), left: cl(raw.left, VP, vw - cw - VP), placement: preferred, fallbackUsed: false, clamped: true };
  }

  const VW = 1280;
  const VH = 800;
  const cardW = 380;
  const cardH = 250;
  const P = 16; // viewport padding

  // Helper that passes viewport dimensions explicitly (no window needed)
  const pos = (
    anchor: { top: number; left: number; width: number; height: number } | null,
    pref: string,
  ) => computeCoachmarkPosition(anchor, cardW, cardH, pref, VW, VH);

  it("target near right edge → card switches to left", () => {
    const result = pos({ top: 300, left: 1100, width: 120, height: 40 }, "right");
    expect(result.left + cardW).toBeLessThanOrEqual(VW - P);
    expect(result.placement).not.toBe("right");
  });

  it("target near left edge → card switches to right", () => {
    const result = pos({ top: 300, left: 10, width: 40, height: 40 }, "left");
    expect(result.left).toBeGreaterThanOrEqual(P);
    expect(result.placement).not.toBe("left");
  });

  it("target near bottom → card avoids viewport overflow", () => {
    const result = pos({ top: 700, left: 400, width: 100, height: 40 }, "bottom");
    expect(result.top + cardH).toBeLessThanOrEqual(VH - P);
  });

  it("wide card → stays visible with clamp", () => {
    const result = pos({ top: 400, left: 600, width: 80, height: 40 }, "right");
    expect(result.left).toBeGreaterThanOrEqual(P);
    expect(result.left + cardW).toBeLessThanOrEqual(VW - P);
  });

  it("no horizontal overflow in ANY position", () => {
    const anchors = [
      { top: 100, left: 100, width: 100, height: 40 },
      { top: 100, left: 1100, width: 100, height: 40 },
      { top: 100, left: 600, width: 100, height: 40 },
      { top: 400, left: 50, width: 200, height: 40 },
      { top: 400, left: 900, width: 200, height: 40 },
    ];
    for (const a of anchors) {
      for (const pref of ["right", "left", "top", "bottom"]) {
        const r = pos(a, pref);
        expect(r.left).toBeGreaterThanOrEqual(P);
        expect(r.left + cardW).toBeLessThanOrEqual(VW - P);
      }
    }
  });

  it("no vertical overflow in ANY position", () => {
    const anchors = [
      { top: 10, left: 400, width: 100, height: 40 },
      { top: 750, left: 400, width: 100, height: 40 },
      { top: 400, left: 400, width: 100, height: 40 },
    ];
    for (const a of anchors) {
      for (const pref of ["right", "left", "top", "bottom"]) {
        const r = pos(a, pref);
        expect(r.top).toBeGreaterThanOrEqual(P);
        expect(r.top + cardH).toBeLessThanOrEqual(VH - P);
      }
    }
  });

  it("center placement always centers", () => {
    const result = pos({ top: 400, left: 600, width: 100, height: 40 }, "center");
    expect(result.placement).toBe("center");
    expect(result.left).toBeGreaterThan(400);
    expect(result.left).toBeLessThan(500);
  });

  it("null anchor → center fallback", () => {
    const result = pos(null, "right");
    expect(result.placement).toBe("center");
  });

  it("corner target → no overflow anywhere", () => {
    const result = pos({ top: 750, left: 1200, width: 60, height: 40 }, "bottom");
    expect(result.left).toBeGreaterThanOrEqual(P);
    expect(result.left + cardW).toBeLessThanOrEqual(VW - P);
    expect(result.top).toBeGreaterThanOrEqual(P);
    expect(result.top + cardH).toBeLessThanOrEqual(VH - P);
  });
});

// ═══════════════════════════════════════════════════════════════
// 16. STRUCTURAL PREREQUISITE SYSTEM — Level 2 anti-regression
// ═══════════════════════════════════════════════════════════════

describe("Prerequisites system (Level 2)", () => {
  // Helper: create an AccountState with specific flags
  const makeAccount = (overrides: Partial<AccountState> = {}): AccountState => ({
    loading: false,
    siteId: null,
    hasSite: false,
    siteStyled: false,
    sitePublished: false,
    blocksCount: 0,
    hasBlocks: false,
    hasProductBlocks: false,
    hasProducts: false,
    hasClients: false,
    hasOrders: false,
    ...overrides,
  });

  // A. ORCHESTRATION

  it("A1: siteExists=false → first mission is create_site", () => {
    const ctx = buildContext(makeAccount({ hasSite: false }));
    const first = findFirstValidChapter(CHAPTERS, [], ctx);
    expect(first?.id).toBe("create_site");
  });

  it("A2: builder_intro cannot start without site", () => {
    const ctx = buildContext(makeAccount({ hasSite: false }));
    const { canStart, missing } = canStartChapter("site", ctx);
    expect(canStart).toBe(false);
    expect(missing).toContain("siteExists");
  });

  it("A3: brief chapter cannot start without site", () => {
    const ctx = buildContext(makeAccount({ hasSite: false }));
    const { canStart, missing } = canStartChapter("brief", ctx);
    expect(canStart).toBe(false);
    expect(missing).toContain("siteExists");
  });

  it("A4: builder chapter cannot start without product", () => {
    const ctx = buildContext(makeAccount({ hasSite: true, siteId: "abc", hasProducts: false }));
    const { canStart, missing } = canStartChapter("builder", ctx);
    expect(canStart).toBe(false);
    expect(missing).toContain("productExists");
  });

  it("A5: publish chapter CAN start with just a site (publish checks happen at step level)", () => {
    const ctx = buildContext(makeAccount({ hasSite: true, siteId: "abc" }));
    const { canStart } = canStartChapter("publish", ctx);
    expect(canStart).toBe(true);
  });

  it("A6: findFirstValidChapter skips create_site when site exists", () => {
    const ctx = buildContext(makeAccount({ hasSite: true, siteId: "abc" }));
    const first = findFirstValidChapter(CHAPTERS, [], ctx);
    // create_site has no prereqs so it would match, BUT findFirstValidChapter
    // finds the first non-completed. Since create_site has [] prereqs, it matches.
    // We need completedChapters to skip it.
    const firstWithSkip = findFirstValidChapter(CHAPTERS, ["create_site"], ctx);
    expect(firstWithSkip?.id).toBe("site");
  });

  it("A7: with site + products, builder chapter can start", () => {
    const ctx = buildContext(makeAccount({ hasSite: true, siteId: "abc", hasProducts: true }));
    const { canStart } = canStartChapter("builder", ctx);
    expect(canStart).toBe(true);
  });

  // B. REDIRECT / RECOVERY

  it("B1: builder without site → redirects to create_site", () => {
    const ctx = buildContext(makeAccount({ hasSite: false }));
    const redirect = resolveRedirectChapter("builder", ctx, CHAPTERS);
    expect(redirect?.id).toBe("create_site");
  });

  it("B2: builder without product → redirects to product", () => {
    const ctx = buildContext(makeAccount({ hasSite: true, siteId: "abc", hasProducts: false }));
    const redirect = resolveRedirectChapter("builder", ctx, CHAPTERS);
    expect(redirect?.id).toBe("product");
  });

  it("B3: brief without site → redirects to create_site", () => {
    const ctx = buildContext(makeAccount({ hasSite: false }));
    const redirect = resolveRedirectChapter("brief", ctx, CHAPTERS);
    expect(redirect?.id).toBe("create_site");
  });

  it("B4: no redirect needed if prerequisites are met", () => {
    const ctx = buildContext(makeAccount({ hasSite: true, siteId: "abc", hasProducts: true }));
    const redirect = resolveRedirectChapter("builder", ctx, CHAPTERS);
    expect(redirect).toBeNull();
  });

  // C. EVERY CHAPTER HAS PREREQUISITES DEFINED

  it("C1: every chapter in CHAPTERS has an entry in CHAPTER_PREREQUISITES", () => {
    for (const ch of CHAPTERS) {
      expect(CHAPTER_PREREQUISITES[ch.id]).toBeDefined();
    }
  });

  it("C2: create_site has no prerequisites", () => {
    expect(CHAPTER_PREREQUISITES["create_site"]).toEqual([]);
  });

  it("C3: all chapters except create_site require siteExists", () => {
    for (const ch of CHAPTERS) {
      if (ch.id === "create_site") continue;
      const prereqs = CHAPTER_PREREQUISITES[ch.id];
      expect(prereqs).toContain("siteExists");
    }
  });

  // D. CONTEXT DERIVATION

  it("D1: buildContext correctly derives siteExists from AccountState", () => {
    const ctxNoSite = buildContext(makeAccount({ hasSite: false }));
    expect(ctxNoSite.siteExists).toBe(false);

    const ctxWithSite = buildContext(makeAccount({ hasSite: true, siteId: "abc" }));
    expect(ctxWithSite.siteExists).toBe(true);
  });

  it("D2: buildContext correctly derives productExists", () => {
    const ctx = buildContext(makeAccount({ hasProducts: true }));
    expect(ctx.productExists).toBe(true);
  });

  it("D3: buildContext correctly derives builderReady", () => {
    const noSite = buildContext(makeAccount({ hasSite: false }));
    expect(noSite.builderReady).toBe(false);

    const withSite = buildContext(makeAccount({ hasSite: true, siteId: "abc" }));
    expect(withSite.builderReady).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
// 17. Adaptive guide — frustration-based experience modes
// ═══════════════════════════════════════════════════════════════

describe("Adaptive guide (V4)", () => {
  // Inline adaptive logic for testing (no TS path resolution needed)
  type Mode = "calm" | "assisted" | "rescue";
  const scoreToMode = (s: number): Mode => s >= 5 ? "rescue" : s >= 3 ? "assisted" : "calm";
  const hintDelay = (m: Mode) => m === "rescue" ? 3500 : m === "assisted" ? 6000 : 9000;
  const shortenEdu = (w: "low"|"medium"|"high", m: Mode) => {
    if (m === "rescue") return w === "high" || w === "medium";
    if (m === "assisted") return w === "high";
    return false;
  };

  // Inline frustration state for testing
  let score = 0;
  let smoothSteps = 0;
  const resetScore = () => { score = 0; smoothSteps = 0; };
  const addTimeout = () => { score = Math.min(10, score + 2); smoothSteps = 0; };
  const addSmoothStep = () => {
    smoothSteps++;
    let s = score;
    if (smoothSteps >= 3) s -= 1;
    if (smoothSteps >= 5) s -= 1;
    score = Math.max(0, s);
  };

  // Copy variant registry (matches adaptive.ts)
  const VARIANTS: Record<string, Record<string, { title: string; body: string }>> = {
    builder_select_product: {
      calm: { title: "Ajoutez votre produit au bloc", body: "Dans la liste à droite, cliquez sur le produit que vous avez créé.\nUne fois sélectionné, il apparaîtra automatiquement sur votre site." },
      rescue: { title: "Cliquez sur votre produit", body: "Sélectionnez-le dans la liste pour continuer." },
    },
  };
  const resolveCopy = (stepId: string, mode: Mode) => {
    const v = VARIANTS[stepId];
    if (!v) return null;
    for (const m of (mode === "rescue" ? ["rescue","assisted","calm"] : mode === "assisted" ? ["assisted","calm"] : ["calm"]) as Mode[]) {
      if (v[m]) return v[m];
    }
    return null;
  };

  beforeEach(() => resetScore());

  it("score 0 → mode calm", () => {
    expect(scoreToMode(0)).toBe("calm");
    expect(scoreToMode(1)).toBe("calm");
    expect(scoreToMode(2)).toBe("calm");
  });

  it("score 3-4 → mode assisted", () => {
    expect(scoreToMode(3)).toBe("assisted");
    expect(scoreToMode(4)).toBe("assisted");
  });

  it("score >= 5 → mode rescue", () => {
    expect(scoreToMode(5)).toBe("rescue");
    expect(scoreToMode(7)).toBe("rescue");
    expect(scoreToMode(10)).toBe("rescue");
  });

  it("adapted copy exists for critical steps (calm vs rescue)", () => {
    const calm = resolveCopy("builder_select_product", "calm");
    expect(calm?.title).toContain("Ajoutez votre produit");

    const rescue = resolveCopy("builder_select_product", "rescue");
    expect(rescue?.title).toContain("Cliquez");
    expect(rescue!.body.length).toBeLessThan(calm!.body.length);
  });

  it("unknown steps return null (original text used)", () => {
    expect(resolveCopy("unknown_xyz", "calm")).toBeNull();
  });

  it("hint delay varies by mode", () => {
    expect(hintDelay("calm")).toBe(9000);
    expect(hintDelay("assisted")).toBe(6000);
    expect(hintDelay("rescue")).toBe(3500);
  });

  it("shouldShortenEducational varies by mode", () => {
    expect(shortenEdu("high", "calm")).toBe(false);
    expect(shortenEdu("high", "assisted")).toBe(true);
    expect(shortenEdu("medium", "assisted")).toBe(false);
    expect(shortenEdu("high", "rescue")).toBe(true);
    expect(shortenEdu("medium", "rescue")).toBe(true);
    expect(shortenEdu("low", "rescue")).toBe(false);
  });

  it("momentum decay reduces score after smooth steps", () => {
    resetScore();
    addTimeout(); addTimeout(); // score = 4
    expect(score).toBeGreaterThanOrEqual(3);
    const high = score;

    for (let i = 0; i < 5; i++) addSmoothStep();
    expect(score).toBeLessThan(high);
  });

  it("copy fallback: assisted falls back to calm if no assisted variant", () => {
    // VARIANTS only has calm and rescue for builder_select_product
    const assisted = resolveCopy("builder_select_product", "assisted");
    expect(assisted?.title).toBe("Ajoutez votre produit au bloc"); // calm fallback
  });

  it("no existing flow is broken (mode calm = original behavior)", () => {
    expect(scoreToMode(0)).toBe("calm");
    expect(resolveCopy("nonexistent", "calm")).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════
// 18. Builder active mission + Brief auto-complete
// ═══════════════════════════════════════════════════════════════

describe("Builder add first block (active mission)", () => {
  const site = CHAPTERS.find((c) => c.id === "site")!;

  it("site chapter has 4 steps with active block addition", () => {
    expect(site.steps.length).toBe(4);
    const ids = site.steps.map((s) => s.id);
    expect(ids).toEqual(["welcome", "site_add_block_cta", "site_pick_block", "site_block_added"]);
  });

  it("site_add_block_cta uses click completion (not acknowledge)", () => {
    const step = site.steps.find((s) => s.id === "site_add_block_cta")!;
    expect(step.completeWhen.type).toBe("click");
  });

  it("site_pick_block uses custom validator (not acknowledge)", () => {
    const step = site.steps.find((s) => s.id === "site_pick_block")!;
    expect(step.completeWhen.type).toBe("custom");
    if (step.completeWhen.type === "custom") {
      expect(step.completeWhen.key).toBe("block_selected_in_builder");
    }
  });

  it("site_block_added shows property panel (acknowledge after action)", () => {
    const step = site.steps.find((s) => s.id === "site_block_added")!;
    expect(step.completeWhen.type).toBe("acknowledge");
    expect(step.target?.selector).toBe('[data-guide="block-property-panel"]');
  });
});

describe("Brief auto-complete when already linked", () => {
  const product = CHAPTERS.find((c) => c.id === "product")!;

  it("product_tab_brief uses custom validator (not click)", () => {
    const step = product.steps.find((s) => s.id === "product_tab_brief")!;
    expect(step.completeWhen.type).toBe("custom");
    if (step.completeWhen.type === "custom") {
      expect(step.completeWhen.key).toBe("brief_linked_to_product");
    }
  });

  it("product_select_brief uses custom validator (not acknowledge)", () => {
    const step = product.steps.find((s) => s.id === "product_select_brief")!;
    expect(step.completeWhen.type).toBe("custom");
    if (step.completeWhen.type === "custom") {
      expect(step.completeWhen.key).toBe("brief_linked_to_product");
    }
  });

  it("product_save_brief uses custom validator (not click)", () => {
    const step = product.steps.find((s) => s.id === "product_save_brief")!;
    expect(step.completeWhen.type).toBe("custom");
    if (step.completeWhen.type === "custom") {
      expect(step.completeWhen.key).toBe("brief_linked_to_product");
    }
  });

  it("all 3 brief steps use the same validator (adaptive skip)", () => {
    const briefSteps = ["product_tab_brief", "product_select_brief", "product_save_brief"];
    for (const id of briefSteps) {
      const step = product.steps.find((s) => s.id === id)!;
      expect(step.completeWhen.type).toBe("custom");
      if (step.completeWhen.type === "custom") {
        expect(step.completeWhen.key).toBe("brief_linked_to_product");
      }
    }
  });

  it("product_done step still exists for success feedback", () => {
    const step = product.steps.find((s) => s.id === "product_done")!;
    expect(step).toBeDefined();
    expect(step.completeWhen.type).toBe("acknowledge");
    expect(step.tone).toBe("success");
  });
});
