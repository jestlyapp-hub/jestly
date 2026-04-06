/**
 * Helpers de validation centralisés — utilisables partout (API, admin, public).
 * Source de vérité unique pour la validation des inputs.
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Valide le format UUID v4. */
export function isValidUuid(id: unknown): id is string {
  return typeof id === "string" && UUID_REGEX.test(id);
}

/** Valide un slug (lettres minuscules, chiffres, tirets). */
export function isValidSlug(slug: unknown): slug is string {
  return typeof slug === "string" && /^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(slug) && slug.length <= 60;
}

/** Nettoie un terme de recherche (trim, longueur max). */
export function sanitizeSearch(term: string, maxLength = 200): string {
  return term.trim().slice(0, maxLength);
}

/** Échappe les caractères spéciaux PostgREST ilike. */
export function escapeIlike(input: string): string {
  return input.replace(/[%_\\]/g, "\\$&");
}

/** Valide et borne les paramètres de pagination. */
export function parsePagination(
  params: { limit?: string | null; offset?: string | null },
  maxLimit = 200,
): { limit: number; offset: number } {
  const limit = Math.min(Math.max(parseInt(params.limit || "50") || 50, 1), maxLimit);
  const offset = Math.max(parseInt(params.offset || "0") || 0, 0);
  return { limit, offset };
}

/** Valide un champ de tri contre une whitelist. */
export function parseSort(sort: string, allowed: string[]): string {
  return allowed.includes(sort) ? sort : allowed[0];
}
