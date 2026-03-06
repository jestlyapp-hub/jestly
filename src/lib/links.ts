import type { Site } from "@/types";
import { resolvePageSlug } from "@/lib/site-utils";

/* ─── BlockLink Types ─── */

export type BlockLinkType = "none" | "internal" | "external" | "product";

export type BlockLink =
  | { type: "none" }
  | { type: "internal"; pageId: string; anchor?: string }
  | { type: "external"; url: string; newTab: boolean }
  | { type: "product"; productId: string; mode: "page" | "checkout"; briefTemplateId?: string };

/* ─── Normalize ─── */

export function normalizeLink(raw: unknown): BlockLink {
  if (!raw || typeof raw !== "object") return { type: "none" };
  const obj = raw as Record<string, unknown>;

  switch (obj.type) {
    case "internal":
      return { type: "internal", pageId: String(obj.pageId ?? ""), anchor: obj.anchor ? String(obj.anchor) : undefined };
    case "external":
      return { type: "external", url: String(obj.url ?? ""), newTab: obj.newTab !== false };
    case "product":
      return { type: "product", productId: String(obj.productId ?? ""), mode: obj.mode === "page" ? "page" : "checkout", briefTemplateId: obj.briefTemplateId ? String(obj.briefTemplateId) : undefined };
    default:
      return { type: "none" };
  }
}

/* ─── Migrate old Link → BlockLink ─── */

export function migrateOldLink(old: { type: string; value: string } | undefined): BlockLink {
  if (!old || old.type === "none" || !old.value) return { type: "none" };

  switch (old.type) {
    case "internal_page":
      return { type: "internal", pageId: old.value };
    case "external_url":
      return { type: "external", url: old.value, newTab: true };
    case "product":
    case "checkout":
      return { type: "product", productId: old.value, mode: "checkout" };
    case "anchor":
      return { type: "internal", pageId: "", anchor: old.value.replace(/^#/, "") };
    default:
      return { type: "external", url: old.value, newTab: true };
  }
}

/* ─── Migrate legacy ctaLink string → BlockLink ─── */

export function migrateLegacyCtaLink(ctaLink: string | undefined): BlockLink {
  if (!ctaLink || ctaLink === "#") return { type: "none" };
  if (ctaLink.startsWith("#")) return { type: "internal", pageId: "", anchor: ctaLink.replace(/^#/, "") };
  if (ctaLink.startsWith("http")) return { type: "external", url: ctaLink, newTab: true };
  return { type: "none" };
}

/* ─── Resolve BlockLink → href string ─── */

export function resolveBlockLink(
  link: BlockLink,
  site: Site,
  productSlugMap?: Map<string, string>,
): string | null {
  switch (link.type) {
    case "none":
      return null;
    case "internal": {
      if (!link.pageId && link.anchor) return `#${link.anchor}`;
      const base = link.pageId ? resolvePageSlug(site, link.pageId) : "";
      return link.anchor ? `${base}#${link.anchor}` : base || null;
    }
    case "external":
      return link.url || null;
    case "product": {
      if (!link.productId) return null;
      const basePath = `/s/${site.domain.subdomain}`;
      const slug = productSlugMap?.get(link.productId) || link.productId;
      if (link.mode === "page") {
        return `${basePath}/p/${slug}`;
      }
      const orderUrl = `${basePath}/order/${slug}`;
      if (link.briefTemplateId) {
        return `${orderUrl}?brief=${link.briefTemplateId}`;
      }
      return orderUrl;
    }
    default:
      return null;
  }
}

/* ─── Get props for <a> tag ─── */

export function getBlockLinkProps(
  link: BlockLink,
  site: Site,
  productSlugMap?: Map<string, string>,
): { href: string; target?: string; rel?: string } | null {
  const href = resolveBlockLink(link, site, productSlugMap);
  if (!href) return null;

  if (link.type === "external" && link.newTab) {
    return { href, target: "_blank", rel: "noopener noreferrer" };
  }

  return { href };
}

/* ─── Migrate block content fields at load time ─── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function migrateBlockLinks(block: { type: string; content: any }): void {
  const c = block.content;
  if (!c) return;

  switch (block.type) {
    case "hero":
      if (!c.blockLink) {
        c.blockLink = c.link ? migrateOldLink(c.link) : migrateLegacyCtaLink(c.ctaLink);
      }
      break;

    case "centered-cta":
      if (!c.blockLink) {
        if (c.productId) {
          c.blockLink = { type: "product", productId: c.productId, mode: "checkout" };
        } else if (c.link) {
          c.blockLink = migrateOldLink(c.link);
        } else {
          c.blockLink = migrateLegacyCtaLink(c.ctaLink);
        }
      }
      break;

    case "cta-premium":
      if (!c.primaryBlockLink) {
        c.primaryBlockLink = c.primaryLink ? migrateOldLink(c.primaryLink) : { type: "none" };
      }
      if (!c.secondaryBlockLink) {
        c.secondaryBlockLink = c.secondaryLink ? migrateOldLink(c.secondaryLink) : { type: "none" };
      }
      break;

    case "video-text-split":
      if (!c.blockLink) {
        c.blockLink = c.link ? migrateOldLink(c.link) : { type: "none" };
      }
      break;

    case "availability-banner":
      if (!c.blockLink) {
        c.blockLink = c.ctaLink && typeof c.ctaLink === "object"
          ? migrateOldLink(c.ctaLink)
          : { type: "none" };
      }
      break;
  }
}
