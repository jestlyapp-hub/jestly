// ── ECOM Path — Positions, tracé & progression ──────────────

import type { EcomStage } from "./types";

// ── ViewBox proportionné (2.5:1 ≈ ratio écran desktop) ──
export const SVG_VIEWBOX = "0 0 250 100";

// ── Positions des 5 nodes (% du conteneur, inchangé) ──
export const NODE_POSITIONS = [
  { x: 18, y: 82 },
  { x: 82, y: 64 },
  { x: 18, y: 46 },
  { x: 82, y: 28 },
  { x: 50, y: 9 },
] as const;

// ── Tracé serpentin dans l'espace 250×100 (proportionné) ──
// Chaque point % → x * 2.5, y inchangé
export const PATH_D =
  "M 45,82 C 110,82 140,64 205,64 C 140,64 110,46 45,46 C 110,46 140,28 205,28 C 170,28 140,9 125,9";

// ── Direction d'extension des cartes ──
export const NODE_ALIGN: ("right" | "left" | "center")[] = [
  "right", "left", "right", "left", "center",
];

// ── Micro-milestones ──
export interface PathMilestone {
  x: number;
  y: number;
  label: string;
  segment: number;
  t: number;
}

export const PATH_MILESTONES: PathMilestone[] = [
  { x: 38, y: 77, label: "Structure juridique créée", segment: 0, t: 0.28 },
  { x: 62, y: 69, label: "Niche validée", segment: 0, t: 0.68 },
  { x: 62, y: 58, label: "Boutique prête", segment: 1, t: 0.3 },
  { x: 38, y: 51, label: "Conformité validée", segment: 1, t: 0.7 },
  { x: 38, y: 40, label: "Tracking opérationnel", segment: 2, t: 0.3 },
  { x: 62, y: 32, label: "Premières ventes", segment: 2, t: 0.7 },
  { x: 73, y: 21, label: "Stratégie email activée", segment: 3, t: 0.35 },
  { x: 59, y: 13, label: "Scaling multi-canal", segment: 3, t: 0.72 },
];

// ── Progression (0 → 1) ──
export function computePathProgress(stages: EcomStage[]): number {
  let p = 0;
  for (let i = 0; i < Math.min(stages.length - 1, 4); i++) {
    const s = stages[i];
    const done = s.tasks.filter((t) => t.completed).length;
    const total = s.tasks.length;
    if (s.status === "completed" || s.status === "validated") p += 0.25;
    else if (s.status === "in_progress" || s.status === "pending_validation")
      p += 0.25 * (total > 0 ? done / total : 0);
  }
  return Math.min(p, 1);
}

export function isMilestoneReached(segment: number, t: number, progress: number): boolean {
  return progress >= (segment + t) / 4;
}

export function getStageCompletion(stage: EcomStage): number {
  const done = stage.tasks.filter((t) => t.completed).length;
  return stage.tasks.length > 0 ? Math.round((done / stage.tasks.length) * 100) : 0;
}
