/**
 * CAC (coût d'acquisition client) et métriques dérivées.
 * Fonctions pures, montants en centimes.
 */

/** CAC = dépense publicitaire / nouveaux clients. null si aucun nouveau client. */
export function computeCAC(adSpendCents: number, newCustomers: number): number | null {
  if (newCustomers <= 0) return null;
  return Math.round(adSpendCents / newCustomers);
}

/** Ratio LTV:CAC. null si CAC nul ou inconnu. */
export function computeLtvCacRatio(ltvCents: number, cacCents: number | null): number | null {
  if (cacCents === null || cacCents <= 0) return null;
  return Math.round((ltvCents / cacCents) * 100) / 100;
}

/**
 * Délai de récupération du CAC, en mois.
 * `monthlyContributionCents` = marge de contribution mensuelle par client.
 * null si la contribution est nulle ou négative (CAC jamais récupéré).
 */
export function computeCacPaybackMonths(
  cacCents: number | null,
  monthlyContributionCents: number,
): number | null {
  if (cacCents === null || cacCents <= 0) return 0;
  if (monthlyContributionCents <= 0) return null;
  return Math.round((cacCents / monthlyContributionCents) * 10) / 10;
}
