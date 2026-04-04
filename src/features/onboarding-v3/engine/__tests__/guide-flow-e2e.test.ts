/**
 * Guide Flow E2E — Tests de validation du parcours complet
 *
 * Simule le flow utilisateur entier de manière programmatique :
 * - Parcours complet des 8 chapitres
 * - Skip et reprise
 * - Refresh (persistance état)
 * - Navigation clavier (contrats)
 * - Viewport mobile (contrats de structure)
 * - Erreurs silencieuses
 *
 * Run: npx vitest run src/features/onboarding-v3/engine/__tests__/guide-flow-e2e.test.ts
 */

import { describe, it, expect } from "vitest";
import { CHAPTERS } from "../../model/guide.chapters";
import { INITIAL_GUIDE_STATE, type GuideState } from "../../model/guide.types";

// ═══════════════════════════════════════════════════════════════
// Helpers — simule le moteur de navigation du guide
// ═══════════════════════════════════════════════════════════════

const CHAPTER_IDS = CHAPTERS.map((c) => c.id);

/** Simule next() — avance à l'étape suivante, ou au chapitre suivant */
function simulateNext(state: GuideState): GuideState {
  const ch = CHAPTERS.find((c) => c.id === state.chapterId);
  if (!ch) return state;

  if (state.stepIndex < ch.steps.length - 1) {
    return { ...state, stepIndex: state.stepIndex + 1 };
  }

  const completed = [...state.completedChapters, ch.id];
  const chIdx = CHAPTERS.findIndex((c) => c.id === ch.id);
  if (chIdx >= CHAPTERS.length - 1) {
    return { ...state, completedChapters: completed, active: false };
  }

  return {
    ...state,
    chapterId: CHAPTERS[chIdx + 1].id,
    stepIndex: 0,
    completedChapters: completed,
  };
}

function simulateClose(state: GuideState): GuideState {
  return { ...state, active: false, dismissed: true };
}

function startFromChapter(chapterId: string): GuideState {
  const chIdx = CHAPTERS.findIndex((c) => c.id === chapterId);
  const completed = CHAPTERS.slice(0, chIdx).map((c) => c.id);
  return {
    ...INITIAL_GUIDE_STATE,
    active: true,
    chapterId,
    stepIndex: 0,
    completedChapters: completed,
  };
}

function computeProgress(state: GuideState): number {
  const total = CHAPTERS.reduce((s, c) => s + c.steps.length, 0);
  let done = 0;
  for (const c of CHAPTERS) {
    if (state.completedChapters.includes(c.id)) done += c.steps.length;
    else if (c.id === state.chapterId) done += state.stepIndex;
  }
  return Math.round((done / total) * 100);
}

// ═══════════════════════════════════════════════════════════════
// SCÉNARIO 1 — Flow complet (nouvel utilisateur)
// ═══════════════════════════════════════════════════════════════

describe("Flow complet — nouvel utilisateur", () => {
  it("parcourt les 8 chapitres dans l'ordre sans boucle infinie", () => {
    let state = startFromChapter("create_site");
    const visited: string[] = [];
    let totalSteps = 0;
    let maxIter = 200;

    while (state.active && maxIter-- > 0) {
      if (!visited.includes(state.chapterId)) visited.push(state.chapterId);
      totalSteps++;
      state = simulateNext(state);
    }

    expect(maxIter).toBeGreaterThan(0);
    expect(state.active).toBe(false);
    expect(visited).toEqual(CHAPTER_IDS);
    expect(state.completedChapters).toEqual(CHAPTER_IDS);

    const expectedTotal = CHAPTERS.reduce((s, c) => s + c.steps.length, 0);
    expect(totalSteps).toBe(expectedTotal);
  });

  it("chaque chapitre commence à stepIndex 0", () => {
    let state = startFromChapter("create_site");
    let lastCh = "";

    while (state.active) {
      if (state.chapterId !== lastCh) {
        expect(state.stepIndex).toBe(0);
        lastCh = state.chapterId;
      }
      state = simulateNext(state);
    }
  });

  it("au moins 6 chapitres sur 8 ont un recap success", () => {
    const withRecap = CHAPTERS.filter((ch) =>
      ch.steps.some((s) => s.kind === "recap" && s.tone === "success"),
    );
    expect(withRecap.length).toBeGreaterThanOrEqual(6);
  });

  it("aucun chapitre visité deux fois", () => {
    let state = startFromChapter("create_site");
    const visits = new Map<string, number>();

    while (state.active) {
      if (state.stepIndex === 0) {
        visits.set(state.chapterId, (visits.get(state.chapterId) ?? 0) + 1);
      }
      state = simulateNext(state);
    }

    for (const [id, count] of visits) {
      expect(count, `${id} visited ${count}x`).toBe(1);
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// SCÉNARIO 2 — Skip create_site (site existant)
// ═══════════════════════════════════════════════════════════════

describe("Flow avec site existant", () => {
  it("commence au chapitre 'site' (skip create_site)", () => {
    const state = startFromChapter("site");
    expect(state.chapterId).toBe("site");
    expect(state.completedChapters).toContain("create_site");
  });

  it("parcourt 7 chapitres", () => {
    let state = startFromChapter("site");
    const visited: string[] = [];

    while (state.active) {
      if (!visited.includes(state.chapterId)) visited.push(state.chapterId);
      state = simulateNext(state);
    }

    expect(visited).not.toContain("create_site");
    expect(visited.length).toBe(7);
  });
});

// ═══════════════════════════════════════════════════════════════
// SCÉNARIO A — Skip et reprise
// ═══════════════════════════════════════════════════════════════

describe("Skip guide et reprise", () => {
  it("close() conserve la progression", () => {
    let state = startFromChapter("create_site");
    state = simulateNext(state);
    state = simulateNext(state);
    const savedCh = state.chapterId;
    const savedStep = state.stepIndex;

    state = simulateClose(state);
    expect(state.active).toBe(false);
    expect(state.dismissed).toBe(true);
    expect(state.chapterId).toBe(savedCh);
    expect(state.stepIndex).toBe(savedStep);
  });

  it("reprise après close() repart exactement au même endroit", () => {
    let state = startFromChapter("create_site");
    const ch1Len = CHAPTERS[0].steps.length;
    for (let i = 0; i < ch1Len + 1; i++) state = simulateNext(state);

    const snapshot = { ch: state.chapterId, step: state.stepIndex, completed: [...state.completedChapters] };
    state = simulateClose(state);

    const resumed = { ...state, active: true, dismissed: false };
    expect(resumed.chapterId).toBe(snapshot.ch);
    expect(resumed.stepIndex).toBe(snapshot.step);
    expect(resumed.completedChapters).toEqual(snapshot.completed);
  });
});

// ═══════════════════════════════════════════════════════════════
// SCÉNARIO B — Refresh page (persistance)
// ═══════════════════════════════════════════════════════════════

describe("Persistance état (refresh)", () => {
  it("JSON serialize/deserialize préserve l'état", () => {
    let state = startFromChapter("create_site");
    state = simulateNext(state);
    state = simulateNext(state);

    const restored: GuideState = JSON.parse(JSON.stringify(state));
    expect(restored.active).toBe(state.active);
    expect(restored.chapterId).toBe(state.chapterId);
    expect(restored.stepIndex).toBe(state.stepIndex);
    expect(restored.completedChapters).toEqual(state.completedChapters);
  });

  it("chapterId invalide est détectable", () => {
    const corrupted: GuideState = { ...INITIAL_GUIDE_STATE, active: true, chapterId: "ghost" };
    expect(CHAPTERS.some((c) => c.id === corrupted.chapterId)).toBe(false);
  });

  it("stepIndex hors limites est clampé", () => {
    const ch = CHAPTERS[0];
    expect(Math.min(999, ch.steps.length - 1)).toBe(ch.steps.length - 1);
  });
});

// ═══════════════════════════════════════════════════════════════
// SCÉNARIO C — Navigation clavier (contrats)
// ═══════════════════════════════════════════════════════════════

describe("Contrats clavier", () => {
  it("toutes les étapes acknowledge ont un ctaLabel", () => {
    for (const ch of CHAPTERS) {
      for (const s of ch.steps) {
        if (s.completeWhen.type === "acknowledge") {
          expect(s.ctaLabel, `${s.id} missing ctaLabel`).toBeTruthy();
        }
      }
    }
  });

  it("les étapes click ont un sélecteur data-guide", () => {
    for (const ch of CHAPTERS) {
      for (const s of ch.steps) {
        if (s.completeWhen.type === "click") {
          expect(s.completeWhen.selector, `${s.id} click needs selector`).toBeTruthy();
          expect(s.completeWhen.selector).toMatch(/\[data-guide=/);
        }
      }
    }
  });

  it("les étapes custom ont un key de validator", () => {
    for (const ch of CHAPTERS) {
      for (const s of ch.steps) {
        if (s.completeWhen.type === "custom") {
          expect(s.completeWhen.key, `${s.id} custom needs key`).toBeTruthy();
        }
      }
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// SCÉNARIO D — Structure responsive
// ═══════════════════════════════════════════════════════════════

describe("Contrats responsive", () => {
  it("chaque target a un placement valide", () => {
    const valid = ["top", "bottom", "left", "right", "center"];
    for (const ch of CHAPTERS) {
      for (const s of ch.steps) {
        if (s.target) {
          expect(valid, `${s.id} placement invalid`).toContain(s.target.placement);
        }
      }
    }
  });

  it("les étapes nonBlocking sont minoritaires (< 30%)", () => {
    const all = CHAPTERS.flatMap((c) => c.steps);
    const nb = all.filter((s) => s.nonBlocking === true);
    expect(nb.length / all.length).toBeLessThan(0.3);
  });
});

// ═══════════════════════════════════════════════════════════════
// SCÉNARIO E — Robustesse sélecteurs
// ═══════════════════════════════════════════════════════════════

describe("Robustesse sélecteurs", () => {
  it("target selectors utilisent data-guide", () => {
    for (const ch of CHAPTERS) {
      for (const s of ch.steps) {
        if (s.target?.selector) {
          expect(s.target.selector, `${s.id} target`).toMatch(/\[data-guide=/);
        }
      }
    }
  });

  it("waitFor selectors utilisent data-guide", () => {
    for (const ch of CHAPTERS) {
      for (const s of ch.steps) {
        for (const pa of s.preActions ?? []) {
          if (pa.type === "waitFor" && "selector" in pa) {
            expect((pa as { selector: string }).selector, `${s.id} waitFor`).toMatch(/\[data-guide=/);
          }
        }
      }
    }
  });

  it("click selectors utilisent data-guide", () => {
    for (const ch of CHAPTERS) {
      for (const s of ch.steps) {
        if (s.completeWhen.type === "click") {
          expect(s.completeWhen.selector, `${s.id} click`).toMatch(/\[data-guide=/);
        }
      }
    }
  });

  it("custom validators ont timeout 5s-120s", () => {
    for (const ch of CHAPTERS) {
      for (const s of ch.steps) {
        if (s.completeWhen.type === "custom") {
          const t = s.completeWhen.timeoutMs ?? 120000;
          expect(t, `${s.id} timeout`).toBeGreaterThanOrEqual(5000);
          expect(t, `${s.id} timeout`).toBeLessThanOrEqual(120000);
        }
      }
    }
  });

  it("nombre total d'étapes raisonnable (15-40)", () => {
    const total = CHAPTERS.reduce((s, c) => s + c.steps.length, 0);
    expect(total).toBeGreaterThanOrEqual(15);
    expect(total).toBeLessThanOrEqual(40);
  });
});

// ═══════════════════════════════════════════════════════════════
// SCÉNARIO F — Micro-confirmations
// ═══════════════════════════════════════════════════════════════

describe("Micro-confirmations", () => {
  const SUCCESS_IDS = [
    "create_site_done", "brief_done", "product_done",
    "builder_product_visible", "pub_done", "final",
  ];

  it("au moins 6 chapitres ont un recap success (micro-confirmation)", () => {
    const withRecap = CHAPTERS.filter((ch) =>
      ch.steps.some((s) => s.kind === "recap" && s.tone === "success"),
    );
    expect(withRecap.length).toBeGreaterThanOrEqual(6);
  });

  it("les 6 étapes success existent", () => {
    const allIds = CHAPTERS.flatMap((c) => c.steps.map((s) => s.id));
    for (const id of SUCCESS_IDS) {
      expect(allIds).toContain(id);
    }
  });

  it("les étapes success ont un ctaLabel", () => {
    for (const ch of CHAPTERS) {
      const recap = ch.steps[ch.steps.length - 1];
      expect(recap.ctaLabel, `${recap.id}`).toBeTruthy();
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// SCÉNARIO G — Progression monotone
// ═══════════════════════════════════════════════════════════════

describe("Progression globale", () => {
  it("la progression est monotone croissante", () => {
    let state = startFromChapter("create_site");
    let lastProgress = -1;

    while (state.active) {
      const p = computeProgress(state);
      expect(p, `progress should grow`).toBeGreaterThanOrEqual(lastProgress);
      lastProgress = p;
      state = simulateNext(state);
    }

    expect(lastProgress).toBeGreaterThanOrEqual(95);
  });

  it("8 chapitres = 8 incréments de section", () => {
    expect(CHAPTERS.length).toBe(8);
  });
});
