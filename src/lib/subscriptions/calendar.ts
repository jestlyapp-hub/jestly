// ═══════════════════════════════════════════════════════════════════
// Cockpit Abonnements — Logique calendrier mensuel
// Génération matrice, occurrences, intensité, stats
// ═══════════════════════════════════════════════════════════════════

import type { Subscription } from "@/types/subscription";

// ── Types ────────────────────────────────────────────────────────

export interface CalendarEvent {
  subscription: Subscription;
  date: Date;
  amount: number; // euros
  isRenewal: boolean; // true si quarterly/yearly (pas mensuel)
}

export interface CalendarDay {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
  totalAmount: number;
  intensity: DayIntensity;
}

export type DayIntensity = "none" | "low" | "medium" | "high" | "danger";

export interface CalendarWeek {
  days: CalendarDay[];
  weekTotal: number;
  weekEventCount: number;
}

export interface MonthStats {
  monthTotal: number;
  monthDeductible: number;
  chargeCount: number;
  busiestWeekIndex: number;
  busiestWeekTotal: number;
  nextCharge: CalendarEvent | null;
  daysUntilNext: number;
  avgWeekly: number;
  workDaysCost: number;
  insights: string[];
}

// ── Normalise billing_day pour un mois donné ─────────────────────

function normalizeBillingDay(billingDay: number, year: number, month: number): number {
  const lastDay = new Date(year, month + 1, 0).getDate();
  return Math.min(billingDay, lastDay);
}

// ── Occurrences d'un abonnement pour un mois ─────────────────────

export function getSubscriptionOccurrencesForMonth(
  sub: Subscription,
  year: number,
  month: number, // 0-indexed
): CalendarEvent[] {
  if (sub.status === "cancelled") return [];

  const events: CalendarEvent[] = [];
  const amount = sub.amount_cents / 100;

  if (sub.billing_frequency === "monthly") {
    const day = normalizeBillingDay(sub.billing_day, year, month);
    events.push({
      subscription: sub,
      date: new Date(year, month, day),
      amount,
      isRenewal: false,
    });
  } else if (sub.billing_frequency === "quarterly") {
    // Utilise billing_anchor_date pour déterminer les mois exacts
    const anchor = sub.billing_anchor_date
      ? new Date(sub.billing_anchor_date)
      : new Date(sub.created_at);
    const anchorMonth = anchor.getMonth();
    // Mois d'occurrence: anchorMonth, anchorMonth+3, anchorMonth+6, anchorMonth+9
    const diff = ((month - anchorMonth) % 3 + 3) % 3;
    if (diff === 0) {
      const day = normalizeBillingDay(sub.billing_day, year, month);
      events.push({
        subscription: sub,
        date: new Date(year, month, day),
        amount,
        isRenewal: true,
      });
    }
  } else if (sub.billing_frequency === "yearly") {
    const anchor = sub.billing_anchor_date
      ? new Date(sub.billing_anchor_date)
      : new Date(sub.created_at);
    if (anchor.getMonth() === month) {
      const day = normalizeBillingDay(sub.billing_day, year, month);
      events.push({
        subscription: sub,
        date: new Date(year, month, day),
        amount,
        isRenewal: true,
      });
    }
  }

  return events;
}

// ── Tous les événements d'un mois ────────────────────────────────

export function getAllEventsForMonth(
  subs: Subscription[],
  year: number,
  month: number,
): Map<string, CalendarEvent[]> {
  const map = new Map<string, CalendarEvent[]>();

  for (const sub of subs) {
    const events = getSubscriptionOccurrencesForMonth(sub, year, month);
    for (const ev of events) {
      const key = `${ev.date.getFullYear()}-${String(ev.date.getMonth() + 1).padStart(2, "0")}-${String(ev.date.getDate()).padStart(2, "0")}`;
      const existing = map.get(key) || [];
      existing.push(ev);
      map.set(key, existing);
    }
  }

  return map;
}

// ── Intensité financière d'un jour ───────────────────────────────

export function getDayIntensity(totalAmount: number, monthAvgDaily: number): DayIntensity {
  if (totalAmount === 0) return "none";
  if (monthAvgDaily <= 0) return "low";
  const ratio = totalAmount / monthAvgDaily;
  if (ratio >= 3) return "danger";
  if (ratio >= 2) return "high";
  if (ratio >= 1) return "medium";
  return "low";
}

// ── Matrice calendrier mensuel ───────────────────────────────────

export function getMonthCalendarMatrix(
  year: number,
  month: number, // 0-indexed
  eventsByDate: Map<string, CalendarEvent[]>,
  monthAvgDaily: number,
): CalendarWeek[] {
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Lundi = 0, Dimanche = 6 (ISO)
  let startDow = firstDay.getDay() - 1; // getDay: 0=Sun → -1, 1=Mon → 0, etc.
  if (startDow < 0) startDow = 6; // Dimanche → 6

  // Start from the Monday before (or on) the 1st
  const startDate = new Date(year, month, 1 - startDow);

  const weeks: CalendarWeek[] = [];
  let current = new Date(startDate);

  // Generate 5 or 6 weeks
  while (current <= lastDay || weeks.length < 5) {
    const days: CalendarDay[] = [];
    let weekTotal = 0;
    let weekEventCount = 0;

    for (let d = 0; d < 7; d++) {
      const dateKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}-${String(current.getDate()).padStart(2, "0")}`;
      const events = eventsByDate.get(dateKey) || [];
      const totalAmount = events.reduce((s, e) => s + e.amount, 0);

      days.push({
        date: new Date(current),
        dayOfMonth: current.getDate(),
        isCurrentMonth: current.getMonth() === month,
        isToday: dateKey === todayKey,
        events,
        totalAmount,
        intensity: getDayIntensity(totalAmount, monthAvgDaily),
      });

      if (current.getMonth() === month) {
        weekTotal += totalAmount;
        weekEventCount += events.length;
      }

      current.setDate(current.getDate() + 1);
    }

    weeks.push({ days, weekTotal, weekEventCount });

    // Stop if we've covered the whole month
    if (current.getMonth() !== month && weeks.length >= 5) break;
    if (weeks.length >= 6) break;
  }

  return weeks;
}

// ── Stats du mois ────────────────────────────────────────────────

export function getMonthlyStats(
  weeks: CalendarWeek[],
  eventsByDate: Map<string, CalendarEvent[]>,
  dailyRate = 300,
): MonthStats {
  let monthTotal = 0;
  let monthDeductible = 0;
  let chargeCount = 0;
  const allEvents: CalendarEvent[] = [];

  for (const [, events] of eventsByDate) {
    for (const ev of events) {
      monthTotal += ev.amount;
      chargeCount++;
      allEvents.push(ev);
      if (ev.subscription.is_tax_deductible) monthDeductible += ev.amount;
    }
  }

  // Busiest week
  let busiestWeekIndex = 0;
  let busiestWeekTotal = 0;
  weeks.forEach((w, i) => {
    if (w.weekTotal > busiestWeekTotal) {
      busiestWeekTotal = w.weekTotal;
      busiestWeekIndex = i;
    }
  });

  // Next charge
  const now = new Date();
  const futureEvents = allEvents
    .filter((e) => e.date >= now)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
  const nextCharge = futureEvents[0] || null;
  const daysUntilNext = nextCharge
    ? Math.ceil((nextCharge.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : -1;

  const avgWeekly = weeks.length > 0 ? monthTotal / weeks.length : 0;
  const workDaysCost = dailyRate > 0 ? Math.round((monthTotal / dailyRate) * 10) / 10 : 0;

  // Insights
  const insights: string[] = [];

  // Day concentration
  const dayTotals = Array.from(eventsByDate.entries())
    .map(([, evts]) => evts.reduce((s, e) => s + e.amount, 0))
    .filter((t) => t > 0);
  if (dayTotals.length > 0 && monthTotal > 0) {
    const maxDay = Math.max(...dayTotals);
    const maxPct = Math.round((maxDay / monthTotal) * 100);
    if (maxPct > 25) {
      insights.push(`Un seul jour concentre ${maxPct}% des dépenses du mois`);
    }
  }

  // Cluster detection
  if (futureEvents.length >= 3) {
    let cluster = 1;
    for (let i = 1; i < futureEvents.length; i++) {
      const gap = (futureEvents[i].date.getTime() - futureEvents[i - 1].date.getTime()) / (1000 * 60 * 60 * 24);
      if (gap <= 3) cluster++;
      else cluster = 1;
      if (cluster >= 3) {
        insights.push(`${cluster} prélèvements en moins de 4 jours`);
        break;
      }
    }
  }

  // Busiest week ratio
  if (avgWeekly > 0 && busiestWeekTotal > avgWeekly * 1.8) {
    const ratio = Math.round((busiestWeekTotal / avgWeekly) * 10) / 10;
    insights.push(`Semaine la plus chargée : ${ratio}x la moyenne`);
  }

  return {
    monthTotal,
    monthDeductible,
    chargeCount,
    busiestWeekIndex,
    busiestWeekTotal,
    nextCharge,
    daysUntilNext,
    avgWeekly,
    workDaysCost,
    insights,
  };
}

// ── Date key helper ──────────────────────────────────────────────

export function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
