/**
 * Objectif mensuel (refonte ECOM, carte blanche C) — calculs purs.
 * Jauge : réalisé vs objectif vs prorata du mois écoulé (au sens de Paris).
 */
import { parisDay } from "@/lib/paris-time";

export interface GoalProgress {
  realized_cents: number;
  goal_cents: number;
  /** Progression réelle (0-1, non plafonnée). */
  progress: number;
  /** Où on « devrait » en être au prorata des jours écoulés (0-1). */
  prorata: number;
  /** En avance (réalisé ≥ prorata de l'objectif) ? */
  ahead: boolean;
}

export function computeGoalProgress(
  realizedCents: number,
  goalCents: number,
  dayOfMonth: number,
  daysInMonth: number,
): GoalProgress | null {
  if (goalCents <= 0) return null;
  const prorata = Math.min(1, dayOfMonth / daysInMonth);
  const progress = realizedCents / goalCents;
  return {
    realized_cents: realizedCents,
    goal_cents: goalCents,
    progress,
    prorata,
    ahead: progress >= prorata,
  };
}

/** Bornes du mois en cours (Paris) : { from: 1er du mois, to: aujourd'hui }. */
export function currentMonthRange(now: Date = new Date()): { from: string; to: string; dayOfMonth: number; daysInMonth: number } {
  const today = parisDay(now); // YYYY-MM-DD
  const [y, m, d] = today.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return {
    from: `${today.slice(0, 8)}01`,
    to: today,
    dayOfMonth: d,
    daysInMonth,
  };
}
