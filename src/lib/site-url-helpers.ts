/**
 * Helpers centralisés pour la résolution d'URLs de sites.
 *
 * RÈGLE FONDAMENTALE :
 * - Un site BROUILLON n'a PAS d'URL publique ouvrable.
 * - Un site PUBLIÉ a une URL publique via /s/{slug} ou custom domain.
 * - La preview privée passe par le builder (/site-web/{id}/createur).
 */

const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN || "jestly.fr";

// ── Types ────────────────────────────────────────────────────────

export interface SiteUrlInput {
  id: string;
  slug: string;
  status: "draft" | "published";
  custom_domain?: string | null;
}

// ── Statut ───────────────────────────────────────────────────────

/** Vérifie si un site est publié et accessible publiquement. */
export function isSitePublished(site: SiteUrlInput): boolean {
  return site.status === "published";
}

/** Vérifie si on peut ouvrir l'URL publique d'un site. */
export function canOpenPublicSite(site: SiteUrlInput): boolean {
  return isSitePublished(site) && !!site.slug;
}

// ── URLs ─────────────────────────────────────────────────────────

/**
 * URL publique complète (avec https://).
 * Retourne `null` si le site n'est pas publié — empêche toute
 * construction naïve d'URL publique pour un brouillon.
 */
export function getSitePublicUrl(site: SiteUrlInput): string | null {
  if (!isSitePublished(site)) return null;
  if (site.custom_domain) return `https://${site.custom_domain}`;
  if (!site.slug) return null;
  return `https://${BASE_DOMAIN}/s/${site.slug}`;
}

/**
 * URL d'affichage (sans https://) pour montrer sous le nom du site.
 * Pour un brouillon : retourne un texte explicite, jamais une fausse URL.
 */
export function getSiteDisplayUrl(site: SiteUrlInput): string {
  if (!isSitePublished(site)) return "Brouillon — non publié";
  if (site.custom_domain) return site.custom_domain;
  if (!site.slug) return "";
  return `${BASE_DOMAIN}/s/${site.slug}`;
}

/**
 * URL de preview pour les miniatures / iframes.
 * - Site publié → URL publique relative (/s/{slug})
 * - Site brouillon → null (pas de preview iframe possible)
 */
export function getSitePreviewUrl(site: SiteUrlInput): string | null {
  if (!isSitePublished(site)) return null;
  if (!site.slug) return null;
  return `/s/${site.slug}`;
}

/**
 * URL de l'éditeur / builder pour un site (toujours disponible).
 */
export function getSiteEditorUrl(site: SiteUrlInput): string {
  return `/site-web/${site.id}/createur`;
}

/**
 * URL de gestion d'un site (toujours disponible).
 */
export function getSiteManageUrl(site: SiteUrlInput): string {
  return `/site-web/${site.id}`;
}
