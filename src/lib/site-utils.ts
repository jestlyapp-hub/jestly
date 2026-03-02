import type { Site, SitePage } from "@/types";

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
 * On localhost / preview: /s/{subdomain}
 * On custom domain (future): empty string
 */
function siteBasePath(site: Site): string {
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
  // Homepage → /s/{subdomain}, subpage → /s/{subdomain}/services
  return slug === "/" ? base : `${base}${slug}`;
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
