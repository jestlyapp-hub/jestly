/**
 * Filtrage des commandes de test / internes à exclure des analytics.
 *
 * Pour Lhorlogemurale en V1 : #1001 = test product 0€, #1002/#1004/#1005 = Gabriel
 * teste sa propre boutique. Vraies commandes clients : #1003, #1006, #1007, #1008, #1009.
 *
 * La liste peut être surchargée via env var `EXCLUDED_ORDER_NAMES=#1001,#1002,#1004,#1005`.
 * Le filtre est appliqué dans les analytics (KPIs, top produits, revenue timeline),
 * MAIS pas dans la liste détaillée /ecom/orders (qui affiche tout avec badge "Test").
 */

const DEFAULT_EXCLUDED = ["#1001", "#1002", "#1004", "#1005"];

function getExcludedNames(): Set<string> {
  const env = process.env.EXCLUDED_ORDER_NAMES;
  if (env) {
    return new Set(env.split(",").map((s) => s.trim()).filter(Boolean));
  }
  return new Set(DEFAULT_EXCLUDED);
}

/** Retourne true si la commande doit être incluse dans les analytics. */
export function isRealOrder(order: { name?: string | null }): boolean {
  const excluded = getExcludedNames();
  return !excluded.has(order.name ?? "");
}

/** Filtre un array d'ordres pour ne garder que les vraies. */
export function filterRealOrders<T extends { name?: string | null }>(orders: T[]): T[] {
  const excluded = getExcludedNames();
  return orders.filter((o) => !excluded.has(o.name ?? ""));
}

/** Liste exposée pour le badge "Test" dans l'UI. */
export function isTestOrder(order: { name?: string | null }): boolean {
  return getExcludedNames().has(order.name ?? "");
}

export function getExcludedOrderNames(): string[] {
  return [...getExcludedNames()];
}
