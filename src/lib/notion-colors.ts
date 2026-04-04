/**
 * Notion-style color palette — deterministic per-entity coloring.
 *
 * 10 pastel colors, each with bg / text / border / dot classes.
 * Hash any string (client name, ID) → always get the same color.
 */

export interface NotionColor {
  bg: string;
  text: string;
  border: string;
  dot: string;
}

const PALETTE: NotionColor[] = [
  { bg: "bg-violet-50",  text: "text-violet-700",  border: "border-violet-200",  dot: "bg-violet-400" },
  { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",    dot: "bg-blue-400" },
  { bg: "bg-cyan-50",    text: "text-cyan-700",    border: "border-cyan-200",    dot: "bg-cyan-400" },
  { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-400" },
  { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   dot: "bg-amber-400" },
  { bg: "bg-orange-50",  text: "text-orange-700",  border: "border-orange-200",  dot: "bg-orange-400" },
  { bg: "bg-rose-50",    text: "text-rose-700",    border: "border-rose-200",    dot: "bg-rose-400" },
  { bg: "bg-pink-50",    text: "text-pink-700",    border: "border-pink-200",    dot: "bg-pink-400" },
  { bg: "bg-indigo-50",  text: "text-indigo-700",  border: "border-indigo-200",  dot: "bg-indigo-400" },
  { bg: "bg-teal-50",    text: "text-teal-700",    border: "border-teal-200",    dot: "bg-teal-400" },
];

/** Simple hash → stable index into palette */
function hashStr(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** Get a deterministic Notion-style color for any string (client name, ID, etc.) */
export function getNotionColor(key: string): NotionColor {
  return PALETTE[hashStr(key) % PALETTE.length];
}

/* ─── Status-specific colors (Notion style: pastel bg + subtle border) ─── */

export const STATUS_COLORS: Record<string, NotionColor> = {
  new:         { bg: "bg-rose-50",    text: "text-rose-600",    border: "border-rose-200",    dot: "bg-rose-400" },
  in_progress: { bg: "bg-blue-50",    text: "text-blue-600",    border: "border-blue-200",    dot: "bg-blue-400" },
  delivered:   { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200", dot: "bg-emerald-400" },
  paid:        { bg: "bg-amber-50",   text: "text-amber-600",   border: "border-amber-200",   dot: "bg-amber-400" },
};

/** Fallback for unknown statuses */
const DEFAULT_STATUS: NotionColor = {
  bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200", dot: "bg-gray-400",
};

export function getStatusColor(status: string): NotionColor {
  return STATUS_COLORS[status] ?? DEFAULT_STATUS;
}

/* ─── Date formatting ─── */

/** Format ISO date string to "3 mars 2026" style */
export function formatDateFR(iso: string | undefined | null): string | null {
  if (!iso) return null;
  try {
    const d = new Date(iso + (iso.includes("T") ? "" : "T00:00:00"));
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return null;
  }
}

/** Is this deadline in the past? (date-only check, no status awareness) */
export function isOverdue(iso: string | undefined | null): boolean {
  if (!iso) return false;
  try {
    const d = new Date(iso + (iso.includes("T") ? "" : "T00:00:00"));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d < today;
  } catch {
    return false;
  }
}

/**
 * Statuts terminés — une commande dans ces statuts ne peut plus être "en retard"
 * car elle a quitté le flux opérationnel de production.
 */
export const TERMINAL_STATUSES = new Set(["delivered", "invoiced", "paid", "cancelled", "refunded", "dispute"]);

/** Is this order status still in active production (not yet delivered/completed)? */
export function isActiveProductionStatus(status: string): boolean {
  return !TERMINAL_STATUSES.has(status);
}

/**
 * Is this order operationally overdue?
 * True only if: deadline is past AND status is still in active production.
 */
export function isOrderOverdue(deadline: string | undefined | null, status: string): boolean {
  return isOverdue(deadline) && isActiveProductionStatus(status);
}
