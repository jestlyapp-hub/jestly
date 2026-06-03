/**
 * Moteur LTV / cohortes.
 *
 * Une cohorte regroupe les clients par mois de leur PREMIÈRE commande.
 * La LTV à N jours est la valeur cumulée moyenne par client dans les N jours
 * suivant sa première commande. Le repeat rate à N jours est la part des clients
 * ayant passé au moins 2 commandes dans cette fenêtre.
 *
 * Fonctions pures sur une liste de commandes (aucune dépendance base de données).
 */

export interface OrderForLtv {
  customer_id: string;
  created_at: string; // ISO 8601
  total_cents: number;
}

export interface CohortMetrics {
  cohort_month: string; // YYYY-MM-01
  n_customers: number;
  ltv_30d_cents: number;
  ltv_60d_cents: number;
  ltv_90d_cents: number;
  ltv_180d_cents: number;
  ltv_365d_cents: number;
  repeat_rate_30d: number; // 0..1
  repeat_rate_90d: number; // 0..1
}

const HORIZONS = [30, 60, 90, 180, 365] as const;

function monthKey(iso: string): string {
  // YYYY-MM-01 en UTC pour stabilité indépendamment du fuseau d'exécution.
  return `${iso.slice(0, 7)}-01`;
}

export function computeCohorts(orders: OrderForLtv[]): CohortMetrics[] {
  // 1. Regroupe les commandes par client et trie chronologiquement.
  const byCustomer = new Map<string, OrderForLtv[]>();
  for (const o of orders) {
    const list = byCustomer.get(o.customer_id) ?? [];
    list.push(o);
    byCustomer.set(o.customer_id, list);
  }

  interface Acc {
    n: number;
    ltv: Record<number, number>; // horizon -> somme cumulée
    repeat30: number;
    repeat90: number;
  }
  const cohorts = new Map<string, Acc>();

  for (const [, list] of byCustomer) {
    list.sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at));
    const first = list[0]!;
    const firstAt = Date.parse(first.created_at);
    const key = monthKey(first.created_at);

    const acc =
      cohorts.get(key) ??
      ({ n: 0, ltv: { 30: 0, 60: 0, 90: 0, 180: 0, 365: 0 }, repeat30: 0, repeat90: 0 } as Acc);
    acc.n += 1;

    let ordersWithin30 = 0;
    let ordersWithin90 = 0;
    for (const o of list) {
      const deltaDays = (Date.parse(o.created_at) - firstAt) / 86_400_000;
      for (const h of HORIZONS) {
        if (deltaDays <= h) acc.ltv[h]! += o.total_cents;
      }
      if (deltaDays <= 30) ordersWithin30 += 1;
      if (deltaDays <= 90) ordersWithin90 += 1;
    }
    if (ordersWithin30 >= 2) acc.repeat30 += 1;
    if (ordersWithin90 >= 2) acc.repeat90 += 1;

    cohorts.set(key, acc);
  }

  // 2. Moyennes par client + tri chronologique des cohortes.
  return [...cohorts.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([cohort_month, acc]) => ({
      cohort_month,
      n_customers: acc.n,
      ltv_30d_cents: Math.round(acc.ltv[30]! / acc.n),
      ltv_60d_cents: Math.round(acc.ltv[60]! / acc.n),
      ltv_90d_cents: Math.round(acc.ltv[90]! / acc.n),
      ltv_180d_cents: Math.round(acc.ltv[180]! / acc.n),
      ltv_365d_cents: Math.round(acc.ltv[365]! / acc.n),
      repeat_rate_30d: Math.round((acc.repeat30 / acc.n) * 10000) / 10000,
      repeat_rate_90d: Math.round((acc.repeat90 / acc.n) * 10000) / 10000,
    }));
}
