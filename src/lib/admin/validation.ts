// ── Helpers de validation pour les routes admin ─────────────────────

/**
 * Echappe les caractères spéciaux pour les requêtes PostgREST ilike.
 */
export function escapeIlike(input: string): string {
  return input.replace(/[%_\\]/g, "\\$&");
}

/**
 * Valide le format UUID.
 */
export function validateUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    id,
  );
}

/**
 * Valide un champ de tri contre une whitelist.
 * Retourne le premier élément autorisé si le tri demandé n'est pas valide.
 */
export function validateSort(sort: string, allowed: string[]): string {
  return allowed.includes(sort) ? sort : allowed[0];
}

/**
 * Valide et borne les paramètres de pagination.
 * Limite entre 1 et 200, offset >= 0.
 */
export function validatePagination(params: {
  limit?: string;
  offset?: string;
}): { limit: number; offset: number } {
  const limit = Math.min(
    Math.max(parseInt(params.limit || "50") || 50, 1),
    200,
  );
  const offset = Math.max(parseInt(params.offset || "0") || 0, 0);
  return { limit, offset };
}

/**
 * Nettoie un terme de recherche (supprime les espaces superflus, limite la longueur).
 */
export function sanitizeSearchTerm(term: string): string {
  return term.trim().slice(0, 200);
}
