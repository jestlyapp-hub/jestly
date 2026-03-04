/**
 * Subdomain validation & normalization for Jestly sites.
 * Slug format: [a-z0-9-], min 3, max 40, no --, no leading/trailing -.
 */

const RESERVED_SUBDOMAINS = new Set([
  "www", "api", "admin", "app", "assets", "static", "cdn",
  "mail", "blog", "support", "help", "docs", "status",
  "jestly", "dashboard", "billing", "auth",
]);

const SLUG_REGEX = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
const MIN_LENGTH = 3;
const MAX_LENGTH = 40;

export type ValidationResult =
  | { valid: true; normalized: string }
  | { valid: false; error: string; reason: "invalid" | "reserved" | "too_short" | "too_long" };

/** Normalize input: trim, lowercase, collapse spaces to dashes. */
export function normalizeSubdomain(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")       // spaces → dashes
    .replace(/[^a-z0-9-]/g, "") // strip invalid chars
    .replace(/-{2,}/g, "-")     // collapse consecutive dashes
    .replace(/^-+|-+$/g, "");   // strip leading/trailing dashes
}

/** Validate a normalized subdomain string. */
export function validateSubdomain(input: string): ValidationResult {
  const normalized = normalizeSubdomain(input);

  if (normalized.length < MIN_LENGTH) {
    return { valid: false, error: "Le sous-domaine doit contenir au moins 3 caractères.", reason: "too_short" };
  }

  if (normalized.length > MAX_LENGTH) {
    return { valid: false, error: "Le sous-domaine ne peut pas dépasser 40 caractères.", reason: "too_long" };
  }

  if (!SLUG_REGEX.test(normalized)) {
    return {
      valid: false,
      error: "Format invalide. Utilisez uniquement des lettres minuscules, chiffres et tirets.",
      reason: "invalid",
    };
  }

  if (normalized.includes("--")) {
    return { valid: false, error: "Les doubles tirets ne sont pas autorisés.", reason: "invalid" };
  }

  if (RESERVED_SUBDOMAINS.has(normalized)) {
    return { valid: false, error: "Ce sous-domaine est réservé.", reason: "reserved" };
  }

  return { valid: true, normalized };
}

export { RESERVED_SUBDOMAINS };
