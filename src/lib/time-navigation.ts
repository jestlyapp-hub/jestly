// ═══════════════════════════════════════════════════════════
// TIME NAVIGATION — Pilotage temporel des commandes
//
// Date de pilotage : deadline (prioritaire) || created_at (fallback)
// Granularités : day, week, month, quarter, year
// Semaines FR : lundi → dimanche
// ═══════════════════════════════════════════════════════════

import type { Order } from "@/types";

// ── Types ──

export type TimeGranularity = "day" | "week" | "month" | "quarter" | "year";

export interface TimeWindow {
  start: Date;
  end: Date;
}

// ── Constantes ──

const GRANULARITY_LABELS: Record<TimeGranularity, string> = {
  day: "Jour",
  week: "Semaine",
  month: "Mois",
  quarter: "Trimestre",
  year: "Année",
};

export { GRANULARITY_LABELS };

const MONTH_NAMES = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

const GRANULARITIES: TimeGranularity[] = ["day", "week", "month", "quarter", "year"];
export { GRANULARITIES };

// ── Date de pilotage ──

/**
 * Retourne la date de pilotage d'une commande.
 * Priorité : deadline > date (created_at).
 * Retourne un objet Date en heure locale (minuit).
 */
export function getOrderPilotDate(order: Pick<Order, "deadline" | "date">): Date {
  const iso = order.deadline || order.date;
  return parseLocalDate(iso);
}

/**
 * Parse une date ISO (YYYY-MM-DD ou avec T) en Date locale à minuit.
 * Évite les décalages UTC en forçant T00:00:00 sans timezone.
 */
function parseLocalDate(iso: string): Date {
  const clean = iso.slice(0, 10); // YYYY-MM-DD
  const [y, m, d] = clean.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// ── Fenêtre temporelle ──

/**
 * Calcule la fenêtre [start, end) pour une granularité et une date de référence.
 * `end` est exclusif (premier instant de la période suivante).
 */
export function getTimeWindow(granularity: TimeGranularity, ref: Date): TimeWindow {
  const y = ref.getFullYear();
  const m = ref.getMonth();
  const d = ref.getDate();

  switch (granularity) {
    case "day":
      return {
        start: new Date(y, m, d),
        end: new Date(y, m, d + 1),
      };

    case "week": {
      // Semaine FR : lundi (1) → dimanche (0)
      const dow = ref.getDay(); // 0=dim, 1=lun, ..., 6=sam
      const mondayOffset = dow === 0 ? -6 : 1 - dow;
      const monday = new Date(y, m, d + mondayOffset);
      const nextMonday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 7);
      return { start: monday, end: nextMonday };
    }

    case "month":
      return {
        start: new Date(y, m, 1),
        end: new Date(y, m + 1, 1),
      };

    case "quarter": {
      const q = Math.floor(m / 3);
      return {
        start: new Date(y, q * 3, 1),
        end: new Date(y, q * 3 + 3, 1),
      };
    }

    case "year":
      return {
        start: new Date(y, 0, 1),
        end: new Date(y + 1, 0, 1),
      };
  }
}

/**
 * Vérifie si une date tombe dans une fenêtre temporelle [start, end).
 */
export function isDateInWindow(date: Date, window: TimeWindow): boolean {
  return date >= window.start && date < window.end;
}

// ── Navigation ──

/**
 * Navigue vers la période précédente ou suivante.
 */
export function navigatePeriod(
  granularity: TimeGranularity,
  ref: Date,
  direction: "prev" | "next",
): Date {
  const delta = direction === "next" ? 1 : -1;
  const y = ref.getFullYear();
  const m = ref.getMonth();
  const d = ref.getDate();

  switch (granularity) {
    case "day":
      return new Date(y, m, d + delta);
    case "week":
      return new Date(y, m, d + delta * 7);
    case "month":
      return new Date(y, m + delta, 1);
    case "quarter":
      return new Date(y, m + delta * 3, 1);
    case "year":
      return new Date(y + delta, 0, 1);
  }
}

/**
 * Retourne la date de référence pour la période courante (aujourd'hui).
 */
export function getCurrentPeriodRef(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * Vérifie si la période de référence correspond à la période actuelle.
 */
export function isCurrentPeriod(granularity: TimeGranularity, ref: Date): boolean {
  const now = getCurrentPeriodRef();
  const currentWindow = getTimeWindow(granularity, now);
  const refWindow = getTimeWindow(granularity, ref);
  return currentWindow.start.getTime() === refWindow.start.getTime();
}

// ── Libellés FR ──

/**
 * Formate le libellé de la période affichée en français.
 * Ex: "Aujourd'hui", "Semaine du 18 au 24 mars 2026", "Mars 2026", "T2 2026", "2026"
 */
export function formatPeriodLabel(granularity: TimeGranularity, ref: Date): string {
  const window = getTimeWindow(granularity, ref);

  switch (granularity) {
    case "day": {
      if (isCurrentPeriod("day", ref)) return "Aujourd'hui";
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (
        ref.getDate() === yesterday.getDate() &&
        ref.getMonth() === yesterday.getMonth() &&
        ref.getFullYear() === yesterday.getFullYear()
      ) {
        return "Hier";
      }
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      if (
        ref.getDate() === tomorrow.getDate() &&
        ref.getMonth() === tomorrow.getMonth() &&
        ref.getFullYear() === tomorrow.getFullYear()
      ) {
        return "Demain";
      }
      return `${ref.getDate()} ${MONTH_NAMES[ref.getMonth()]} ${ref.getFullYear()}`;
    }

    case "week": {
      const start = window.start;
      const end = new Date(window.end.getTime() - 1); // dimanche
      const sameMonth = start.getMonth() === end.getMonth();
      if (sameMonth) {
        return `Semaine du ${start.getDate()} au ${end.getDate()} ${MONTH_NAMES[start.getMonth()]} ${start.getFullYear()}`;
      }
      const sameYear = start.getFullYear() === end.getFullYear();
      if (sameYear) {
        return `Semaine du ${start.getDate()} ${MONTH_NAMES[start.getMonth()]} au ${end.getDate()} ${MONTH_NAMES[end.getMonth()]} ${start.getFullYear()}`;
      }
      return `Semaine du ${start.getDate()} ${MONTH_NAMES[start.getMonth()]} ${start.getFullYear()} au ${end.getDate()} ${MONTH_NAMES[end.getMonth()]} ${end.getFullYear()}`;
    }

    case "month": {
      const name = MONTH_NAMES[ref.getMonth()];
      // Capitalize first letter
      return `${name.charAt(0).toUpperCase() + name.slice(1)} ${ref.getFullYear()}`;
    }

    case "quarter": {
      const q = Math.floor(ref.getMonth() / 3) + 1;
      return `T${q} ${ref.getFullYear()}`;
    }

    case "year":
      return `${ref.getFullYear()}`;
  }
}

// ── Filtrage ──

/**
 * Filtre une liste de commandes selon une fenêtre temporelle,
 * en utilisant la date de pilotage de chaque commande.
 */
export function filterOrdersByPeriod<T extends Pick<Order, "deadline" | "date">>(
  orders: T[],
  window: TimeWindow,
): T[] {
  return orders.filter((order) => {
    const pilotDate = getOrderPilotDate(order);
    return isDateInWindow(pilotDate, window);
  });
}
