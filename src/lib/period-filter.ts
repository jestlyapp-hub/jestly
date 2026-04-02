/**
 * Period Filter — module partagé
 *
 * Fournit les types, helpers et presets pour le filtrage par période.
 * Utilisé par Facturation, Analytics et tout module nécessitant un filtre temporel.
 *
 * Date de référence : bornes inclusives en YYYY-MM-DD, timezone-agnostic.
 */

/* ── Types ── */

export interface PeriodFilter {
  label: string;
  range: { start: string; end: string } | null;
}

export const PERIOD_ALL: PeriodFilter = { label: "Toutes les dates", range: null };

export interface PeriodPreset {
  id: string;
  label: string;
  range: () => { start: string; end: string };
}

/* ── Date helpers ── */

/**
 * Formate une Date locale en YYYY-MM-DD sans conversion UTC.
 * IMPORTANT : ne pas utiliser d.toISOString() qui convertit en UTC
 * et peut décaler la date d'un jour (ex: 1er avril 00h CEST → 31 mars en UTC).
 */
export function toLocalISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const MONTH_NAMES_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
] as const;

export function getMonthName(monthIndex: number): string {
  return MONTH_NAMES_FR[monthIndex];
}

/**
 * Extrait la date YYYY-MM-DD depuis un timestamp ISO sans conversion timezone.
 * Évite le bug où `new Date("2026-03-31T22:15:00Z")` donne avril en CEST.
 */
export function isoDatePart(iso: string | null | undefined): string | null {
  if (!iso) return null;
  return iso.split("T")[0];
}

/**
 * Extrait année et mois (0-indexed) depuis un timestamp ISO, sans timezone locale.
 * Retourne null si pas de date.
 */
export function isoYearMonth(iso: string | null | undefined): { year: number; month: number } | null {
  const d = isoDatePart(iso);
  if (!d) return null;
  const [y, m] = d.split("-").map(Number);
  return { year: y, month: m - 1 };
}

/* ── Presets builders ── */

export function buildShortcutPresets(): PeriodPreset[] {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();
  const dow = now.getDay();
  const weekDiff = dow === 0 ? 6 : dow - 1;

  return [
    { id: "today", label: "Aujourd'hui", range: () => ({ start: toLocalISO(new Date(y, m, d)), end: toLocalISO(new Date(y, m, d)) }) },
    { id: "yesterday", label: "Hier", range: () => ({ start: toLocalISO(new Date(y, m, d - 1)), end: toLocalISO(new Date(y, m, d - 1)) }) },
    { id: "last7", label: "7 derniers jours", range: () => ({ start: toLocalISO(new Date(y, m, d - 6)), end: toLocalISO(new Date(y, m, d)) }) },
    { id: "last30", label: "30 derniers jours", range: () => ({ start: toLocalISO(new Date(y, m, d - 29)), end: toLocalISO(new Date(y, m, d)) }) },
    { id: "this_week", label: "Cette semaine", range: () => ({ start: toLocalISO(new Date(y, m, d - weekDiff)), end: toLocalISO(new Date(y, m, d + (6 - weekDiff))) }) },
    { id: "last_week", label: "Semaine dernière", range: () => ({ start: toLocalISO(new Date(y, m, d - weekDiff - 7)), end: toLocalISO(new Date(y, m, d - weekDiff - 1)) }) },
    { id: "this_month", label: "Ce mois-ci", range: () => ({ start: toLocalISO(new Date(y, m, 1)), end: toLocalISO(new Date(y, m + 1, 0)) }) },
    { id: "last_month", label: "Mois dernier", range: () => ({ start: toLocalISO(new Date(y, m - 1, 1)), end: toLocalISO(new Date(y, m, 0)) }) },
    {
      id: "this_quarter", label: "Ce trimestre",
      range: () => { const q = Math.floor(m / 3); return { start: toLocalISO(new Date(y, q * 3, 1)), end: toLocalISO(new Date(y, q * 3 + 3, 0)) }; },
    },
    {
      id: "last_quarter", label: "Trimestre dernier",
      range: () => { const q = Math.floor(m / 3) - 1; const qy = q < 0 ? y - 1 : y; const qm = q < 0 ? 9 : q * 3; return { start: toLocalISO(new Date(qy, qm, 1)), end: toLocalISO(new Date(qy, qm + 3, 0)) }; },
    },
    { id: "this_year", label: "Cette année", range: () => ({ start: toLocalISO(new Date(y, 0, 1)), end: toLocalISO(new Date(y, 11, 31)) }) },
    { id: "last_year", label: "Année dernière", range: () => ({ start: toLocalISO(new Date(y - 1, 0, 1)), end: toLocalISO(new Date(y - 1, 11, 31)) }) },
  ];
}

export function buildMonthPresets(count = 12): { label: string; year: number; month: number; range: () => { start: string; end: string } }[] {
  const now = new Date();
  const result: { label: string; year: number; month: number; range: () => { start: string; end: string } }[] = [];
  for (let i = 0; i < count; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const yr = date.getFullYear();
    const mo = date.getMonth();
    result.push({
      label: `${MONTH_NAMES_FR[mo]} ${yr}`,
      year: yr,
      month: mo,
      range: () => ({ start: toLocalISO(new Date(yr, mo, 1)), end: toLocalISO(new Date(yr, mo + 1, 0)) }),
    });
  }
  return result;
}

export function buildQuarterPresets(count = 8): { label: string; year: number; quarter: number; range: () => { start: string; end: string } }[] {
  const now = new Date();
  const currentQ = Math.floor(now.getMonth() / 3);
  const result: { label: string; year: number; quarter: number; range: () => { start: string; end: string } }[] = [];
  for (let i = 0; i < count; i++) {
    let q = currentQ - i;
    let yr = now.getFullYear();
    while (q < 0) { q += 4; yr--; }
    const qStart = q * 3;
    result.push({
      label: `T${q + 1} ${yr}`,
      year: yr,
      quarter: q + 1,
      range: () => ({ start: toLocalISO(new Date(yr, qStart, 1)), end: toLocalISO(new Date(yr, qStart + 3, 0)) }),
    });
  }
  return result;
}
