// ═══════════════════════════════════════════════════════════════════
// Cockpit Abonnements — Helpers métier
// Calculs, scores, projections, insights
// ═══════════════════════════════════════════════════════════════════

import type {
  Subscription,
  SubscriptionCategory,
  BillingFrequency,
} from "@/types/subscription";

// ── Calcul mensuel unifié ────────────────────────────────────────

const FREQUENCY_DIVISOR: Record<BillingFrequency, number> = {
  monthly: 1,
  quarterly: 3,
  yearly: 12,
};

/** Montant mensuel équivalent en centimes */
export function monthlyAmountCents(sub: Subscription): number {
  return Math.round(sub.amount_cents / FREQUENCY_DIVISOR[sub.billing_frequency]);
}

/** Montant mensuel en euros */
export function monthlyAmount(sub: Subscription): number {
  return monthlyAmountCents(sub) / 100;
}

/** Montant annuel en euros */
export function yearlyAmount(sub: Subscription): number {
  return monthlyAmount(sub) * 12;
}

// ── Prochain prélèvement ─────────────────────────────────────────

/** Calcule la prochaine date de prélèvement */
export function nextBillingDate(sub: Subscription, from = new Date()): Date {
  const day = Math.min(sub.billing_day, 28); // Safe for all months
  const year = from.getFullYear();
  const month = from.getMonth();

  // This month
  let next = new Date(year, month, day);
  if (next <= from) {
    // Next period based on frequency
    if (sub.billing_frequency === "monthly") {
      next = new Date(year, month + 1, day);
    } else if (sub.billing_frequency === "quarterly") {
      next = new Date(year, month + 3, day);
    } else {
      next = new Date(year + 1, month, day);
    }
  }
  return next;
}

/** Nombre de jours avant le prochain prélèvement */
export function daysUntilBilling(sub: Subscription, from = new Date()): number {
  const next = nextBillingDate(sub, from);
  const diff = next.getTime() - from.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/** True si prélèvement dans < N jours */
export function isUrgent(sub: Subscription, thresholdDays = 3): boolean {
  return sub.status === "active" && daysUntilBilling(sub) <= thresholdDays;
}

// ── Totaux ───────────────────────────────────────────────────────

export interface SubscriptionTotals {
  monthlyTotal: number;
  yearlyTotal: number;
  deductibleMonthly: number;
  deductibleYearly: number;
  activeCount: number;
  pausedCount: number;
  toCancelCount: number;
}

export function computeTotals(subs: Subscription[]): SubscriptionTotals {
  const active = subs.filter((s) => s.status === "active");
  return {
    monthlyTotal: active.reduce((sum, s) => sum + monthlyAmount(s), 0),
    yearlyTotal: active.reduce((sum, s) => sum + yearlyAmount(s), 0),
    deductibleMonthly: active.filter((s) => s.is_tax_deductible).reduce((sum, s) => sum + monthlyAmount(s), 0),
    deductibleYearly: active.filter((s) => s.is_tax_deductible).reduce((sum, s) => sum + yearlyAmount(s), 0),
    activeCount: active.length,
    pausedCount: subs.filter((s) => s.status === "paused").length,
    toCancelCount: subs.filter((s) => s.status === "to_cancel").length,
  };
}

// ── Répartition par catégorie ────────────────────────────────────

export interface CategoryBreakdown {
  category: SubscriptionCategory;
  monthlyTotal: number;
  count: number;
  percentage: number;
}

export function categoryBreakdown(subs: Subscription[]): CategoryBreakdown[] {
  const active = subs.filter((s) => s.status === "active");
  const totalMonthly = active.reduce((sum, s) => sum + monthlyAmount(s), 0);
  const map = new Map<SubscriptionCategory, { total: number; count: number }>();

  for (const s of active) {
    const prev = map.get(s.category) || { total: 0, count: 0 };
    map.set(s.category, { total: prev.total + monthlyAmount(s), count: prev.count + 1 });
  }

  return Array.from(map.entries())
    .map(([category, { total, count }]) => ({
      category,
      monthlyTotal: total,
      count,
      percentage: totalMonthly > 0 ? Math.round((total / totalMonthly) * 100) : 0,
    }))
    .sort((a, b) => b.monthlyTotal - a.monthlyTotal);
}

// ── Score de santé (0-100) ───────────────────────────────────────

export function healthScore(sub: Subscription): number {
  let score = 100;

  // Pénalité coût (> 50€/mois = -20, > 100€ = -40)
  const monthly = monthlyAmount(sub);
  if (monthly > 100) score -= 40;
  else if (monthly > 50) score -= 20;
  else if (monthly > 20) score -= 10;

  // Pénalité utilisation
  if (sub.last_used_at) {
    const daysSinceUse = Math.floor((Date.now() - new Date(sub.last_used_at).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceUse > 90) score -= 40;
    else if (daysSinceUse > 60) score -= 30;
    else if (daysSinceUse > 30) score -= 20;
    else if (daysSinceUse > 14) score -= 10;
  } else {
    // Jamais utilisé => -25
    score -= 25;
  }

  // Bonus déductible
  if (sub.is_tax_deductible) score += 10;

  // Pénalité statut
  if (sub.status === "to_cancel") score -= 15;
  if (sub.status === "paused") score -= 10;

  return Math.max(0, Math.min(100, score));
}

/** True si abonnement semble dormant (> 30j sans usage) */
export function isDormant(sub: Subscription): boolean {
  if (!sub.last_used_at) return true;
  const days = Math.floor((Date.now() - new Date(sub.last_used_at).getTime()) / (1000 * 60 * 60 * 24));
  return days > 30;
}

// ── Coût en temps de travail ─────────────────────────────────────

/** Nombre de jours de travail que représente l'abonnement */
export function costInWorkDays(sub: Subscription, dailyRate = 300): number {
  return Math.round((monthlyAmount(sub) / dailyRate) * 100) / 100;
}

// ── Projection 12 mois ──────────────────────────────────────────

export interface MonthProjection {
  month: string; // "2026-05"
  label: string; // "Mai 2026"
  total: number;
  count: number;
  items: { name: string; amount: number; isRenewal: boolean }[];
}

const MONTH_NAMES = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

export function project12Months(subs: Subscription[], from = new Date()): MonthProjection[] {
  const active = subs.filter((s) => s.status === "active");
  const result: MonthProjection[] = [];

  for (let i = 0; i < 12; i++) {
    const date = new Date(from.getFullYear(), from.getMonth() + i, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
    const items: MonthProjection["items"] = [];

    for (const sub of active) {
      let amount = 0;
      let isRenewal = false;

      if (sub.billing_frequency === "monthly") {
        amount = sub.amount_cents / 100;
      } else if (sub.billing_frequency === "quarterly") {
        // Every 3 months from billing_day
        const monthOffset = (date.getMonth() - (from.getMonth())) % 3;
        if (monthOffset === 0 || (i > 0 && monthOffset === 0)) {
          amount = sub.amount_cents / 100;
          isRenewal = true;
        }
      } else if (sub.billing_frequency === "yearly") {
        // Once a year on billing month
        const billingMonth = new Date(sub.created_at).getMonth();
        if (date.getMonth() === billingMonth) {
          amount = sub.amount_cents / 100;
          isRenewal = true;
        }
      }

      if (amount > 0) {
        items.push({ name: sub.name, amount, isRenewal });
      }
    }

    result.push({
      month: key,
      label,
      total: items.reduce((s, it) => s + it.amount, 0),
      count: items.length,
      items,
    });
  }

  return result;
}

// ── Heatmap mensuelle ────────────────────────────────────────────

export type HeatmapLevel = "low" | "medium" | "high" | "danger";

export function getHeatmapLevel(amount: number, average: number): HeatmapLevel {
  if (amount === 0) return "low";
  const ratio = amount / average;
  if (ratio > 1.5) return "danger";
  if (ratio > 1.1) return "high";
  if (ratio > 0.7) return "medium";
  return "low";
}

// ── Insights intelligents ────────────────────────────────────────

export interface Insight {
  id: string;
  type: "warning" | "info" | "tip";
  title: string;
  message: string;
}

export function generateInsights(subs: Subscription[], monthlyRevenue = 0): Insight[] {
  const insights: Insight[] = [];
  const active = subs.filter((s) => s.status === "active");
  const totals = computeTotals(subs);

  // Impact CA
  if (monthlyRevenue > 0) {
    const ratio = Math.round((totals.monthlyTotal / monthlyRevenue) * 100);
    if (ratio > 30) {
      insights.push({
        id: "ca_impact",
        type: "warning",
        title: "Abonnements gourmands",
        message: `Tes abonnements représentent ${ratio}% de ton CA mensuel. C'est au-dessus de la moyenne (15-20%).`,
      });
    }
  }

  // Abonnements dormants
  const dormants = active.filter(isDormant);
  if (dormants.length > 0) {
    const savings = dormants.reduce((s, d) => s + monthlyAmount(d), 0);
    insights.push({
      id: "dormant",
      type: "warning",
      title: `${dormants.length} abonnement${dormants.length > 1 ? "s" : ""} dormant${dormants.length > 1 ? "s" : ""}`,
      message: `${dormants.map((d) => d.name).join(", ")} — économie potentielle de ${savings.toFixed(0)}€/mois.`,
    });
  }

  // Doublons catégorie
  const catCounts = new Map<string, string[]>();
  for (const s of active) {
    const names = catCounts.get(s.category) || [];
    names.push(s.name);
    catCounts.set(s.category, names);
  }
  for (const [cat, names] of catCounts) {
    if (names.length >= 3 && cat !== "other") {
      insights.push({
        id: `dup_${cat}`,
        type: "tip",
        title: `${names.length} outils ${cat} similaires`,
        message: `Tu utilises ${names.join(", ")}. Vérifie si tu as besoin de tous.`,
      });
    }
  }

  // Renouvellements annuels proches (< 60 jours)
  const yearlySoon = active
    .filter((s) => s.billing_frequency === "yearly" && daysUntilBilling(s) < 60);
  for (const s of yearlySoon) {
    insights.push({
      id: `renewal_${s.id}`,
      type: "info",
      title: `Renouvellement annuel imminent`,
      message: `${s.name} (${(s.amount_cents / 100).toFixed(0)}€) se renouvelle dans ${daysUntilBilling(s)} jours.`,
    });
  }

  // À résilier oubliés
  const toCancel = subs.filter((s) => s.status === "to_cancel");
  if (toCancel.length > 0) {
    insights.push({
      id: "to_cancel",
      type: "warning",
      title: `${toCancel.length} résiliation${toCancel.length > 1 ? "s" : ""} en attente`,
      message: `N'oublie pas de résilier : ${toCancel.map((s) => s.name).join(", ")}.`,
    });
  }

  return insights;
}

// ── Export CSV ────────────────────────────────────────────────────

export function exportCsv(subs: Subscription[]): string {
  const BOM = "\uFEFF";
  const SEP = ";";
  const headers = ["Nom", "Montant", "Fréquence", "Catégorie", "Déductible", "Mensuel équivalent", "Annuel total", "Statut"];
  const rows = subs.map((s) => [
    s.name,
    `${(s.amount_cents / 100).toFixed(2)}€`,
    s.billing_frequency,
    s.category,
    s.is_tax_deductible ? "Oui" : "Non",
    `${monthlyAmount(s).toFixed(2)}€`,
    `${yearlyAmount(s).toFixed(2)}€`,
    s.status,
  ]);

  return BOM + [headers, ...rows].map((r) => r.join(SEP)).join("\n");
}

// ── Simulateur d'économies ───────────────────────────────────────

export function simulateSavings(subs: Subscription[], removeIds: string[]): {
  currentMonthly: number;
  newMonthly: number;
  savings: number;
  yearlySavings: number;
} {
  const active = subs.filter((s) => s.status === "active");
  const currentMonthly = active.reduce((sum, s) => sum + monthlyAmount(s), 0);
  const remaining = active.filter((s) => !removeIds.includes(s.id));
  const newMonthly = remaining.reduce((sum, s) => sum + monthlyAmount(s), 0);
  const savings = currentMonthly - newMonthly;

  return { currentMonthly, newMonthly, savings, yearlySavings: savings * 12 };
}
