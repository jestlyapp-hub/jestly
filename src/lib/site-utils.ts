import type { Site, SitePage, Block, NavLink, FooterLink } from "@/types";

const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN || "jestly.fr";

/**
 * Get the canonical public URL for a site.
 * This is the SINGLE source of truth for site URLs.
 *
 * Format: https://jestly.fr/s/{slug}
 * (or custom domain if configured and verified)
 */
export function getSitePublicUrl(slug: string, customDomain?: string): string {
  if (customDomain) return `https://${customDomain}`;
  if (!slug) return "";
  return `https://${BASE_DOMAIN}/s/${slug}`;
}

/**
 * Get the display URL (without https://) for a site.
 */
export function getSiteDisplayUrl(slug: string, customDomain?: string): string {
  if (customDomain) return customDomain;
  if (!slug) return "";
  return `${BASE_DOMAIN}/s/${slug}`;
}

/**
 * Find a published page by its path within a site.
 * "/" → homepage (is_home or slug "/"), "/services" → services page.
 */
export function getPageByPath(site: Site, path: string): SitePage | null {
  const normalizedPath = path === "" ? "/" : path.startsWith("/") ? path : `/${path}`;

  const page = site.pages.find(
    (p) => p.slug === normalizedPath && p.status === "published"
  );

  return page ?? null;
}

/**
 * Get the base path for a site.
 * On subdomain (cinema.jestly.fr): "" (empty — paths are relative to root)
 * On localhost / preview: "/s/{subdomain}"
 */
function siteBasePath(site: Site): string {
  if (site.basePath !== undefined) return site.basePath;
  return `/s/${site.domain.subdomain}`;
}

/**
 * Resolve pageId to a full navigable href for internal links (nav, footer, CTA).
 * Prepends /s/{subdomain} so links work correctly on the public site.
 */
export function resolvePageSlug(site: Site, pageId: string): string {
  const page = site.pages.find((p) => p.id === pageId);
  const slug = page?.slug ?? "/";
  const base = siteBasePath(site);
  // Homepage → "/" (subdomain) or "/s/{slug}" (dev), subpage → "/services" or "/s/{slug}/services"
  if (slug === "/") return base || "/";
  return `${base}${slug}`;
}

/**
 * Resolve a Link object to an actual href.
 * Handles all link types: internal_page, external_url, product, anchor, email, phone, checkout, booking.
 */
export function resolveLink(
  link: { type: string; value: string; openInNewTab?: boolean } | undefined,
  site: Site
): string | null {
  if (!link || link.type === "none" || !link.value) return null;

  const base = siteBasePath(site);

  switch (link.type) {
    case "internal_page":
      return resolvePageSlug(site, link.value);
    case "external_url":
      return link.value;
    case "product":
      return `${base}/order/${link.value}`;
    case "anchor":
      return link.value.startsWith("#") ? link.value : `#${link.value}`;
    case "email":
      return `mailto:${link.value}`;
    case "phone":
      return `tel:${link.value}`;
    case "checkout":
      return `${base}/order/${link.value}`;
    case "booking":
      return link.value; // Calendly or external booking URL
    default:
      return link.value;
  }
}

/**
 * Resolve a NavLink to a full href, supporting blockId scroll-to targets.
 * If blockId is set, appends #block-{blockId} to the page URL.
 */
export function resolveNavLinkHref(
  link: { pageId?: string; url?: string; blockId?: string },
  site: Site
): string {
  // External URL takes precedence if no pageId
  if (!link.pageId && link.url) return link.url;

  // Internal page with optional block anchor
  if (link.pageId) {
    const base = resolvePageSlug(site, link.pageId);
    if (link.blockId === "__top") return `${base}#top`;
    if (link.blockId) return `${base}#block-${link.blockId}`;
    return base;
  }

  // "Top of page" shortcut on current page
  if (link.blockId === "__top") return "#top";

  // Block anchor on current page (no pageId, just blockId)
  if (link.blockId) return `#block-${link.blockId}`;

  return "#";
}

/**
 * Infer destinationType from existing NavLink fields (backward compat).
 * Works for both NavLink and FooterLink.
 */
export function inferDestinationType(
  link: { pageId?: string; url?: string; blockId?: string; destinationType?: string }
): "section" | "page" | "external" {
  if (link.destinationType === "section" || link.destinationType === "page" || link.destinationType === "external") {
    return link.destinationType;
  }
  if (link.url && !link.pageId) return "external";
  if (link.blockId && !link.pageId) return "section";
  if (link.pageId && !link.blockId) return "page";
  if (link.pageId && link.blockId) return "section";
  return "section";
}

/**
 * Get a human-readable label for a block (type name + title if available).
 */
export function getBlockLabel(block: Block): string {
  const typeLabel = block.type
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  // Try to extract a title from common content fields
  const c = block.content as unknown as Record<string, unknown>;
  const title = c.title || c.heading || c.name || c.label;
  if (title && typeof title === "string" && title.length > 0) {
    const short = title.length > 30 ? title.slice(0, 30) + "..." : title;
    return `${typeLabel} — ${short}`;
  }

  return typeLabel;
}

/* ─── NavLink / FooterLink Validation ─── */

export type LinkValidationStatus = "valid" | "warning" | "error";

export interface LinkValidation {
  status: LinkValidationStatus;
  message?: string;
}

/**
 * Validate a NavLink or FooterLink against available pages and blocks.
 * Returns validation status + user-facing message.
 */
export function validateNavLink(
  link: NavLink | FooterLink,
  pages: SitePage[],
  currentPageBlocks: Block[],
): LinkValidation {
  const destType = inferDestinationType(link as NavLink);

  switch (destType) {
    case "section": {
      if (!link.blockId) {
        return { status: "warning", message: "Aucune section choisie" };
      }
      if (link.blockId === "__top") {
        return { status: "valid" };
      }
      const visibleBlocks = currentPageBlocks.filter(b => b.visible);
      const found = visibleBlocks.some(b => b.id === link.blockId);
      if (!found) {
        // Also check hidden blocks to differentiate "deleted" vs "hidden"
        const inAllBlocks = currentPageBlocks.some(b => b.id === link.blockId);
        if (inAllBlocks) {
          return { status: "warning", message: "Cette section est masquée" };
        }
        return { status: "error", message: "Cette section n'existe plus" };
      }
      return { status: "valid" };
    }

    case "page": {
      if (!link.pageId) {
        return { status: "warning", message: "Aucune page choisie" };
      }
      const pageExists = pages.some(p => p.id === link.pageId);
      if (!pageExists) {
        return { status: "error", message: "Cette page n'existe plus" };
      }
      return { status: "valid" };
    }

    case "external": {
      const url = (link as NavLink).url || "";
      if (!url) {
        return { status: "warning", message: "URL non renseignée" };
      }
      if (!url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("mailto:") && !url.startsWith("tel:")) {
        return { status: "warning", message: "L'URL doit commencer par https://, mailto: ou tel:" };
      }
      return { status: "valid" };
    }

    default:
      return { status: "valid" };
  }
}

/**
 * Get a human-readable description of the link destination (for UI summary).
 */
export function getNavLinkDestinationLabel(
  link: NavLink | FooterLink,
  pages: SitePage[],
  currentPageBlocks: Block[],
): string {
  const destType = inferDestinationType(link as NavLink);

  switch (destType) {
    case "section": {
      if (!link.blockId) return "Aucune section";
      if (link.blockId === "__top") return "Haut de page";
      const block = currentPageBlocks.find(b => b.id === link.blockId);
      return block ? getBlockLabel(block) : "Section introuvable";
    }
    case "page": {
      if (!link.pageId) return "Aucune page";
      const page = pages.find(p => p.id === link.pageId);
      return page ? page.name : "Page introuvable";
    }
    case "external": {
      const url = (link as NavLink).url || "";
      if (!url) return "Aucune URL";
      try {
        return new URL(url).hostname;
      } catch {
        return url.slice(0, 30);
      }
    }
    default:
      return "";
  }
}
