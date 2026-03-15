import type { Site, SitePage, Block, BlockType } from "@/types";
import { createClient } from "@/lib/supabase/server";
import { migrateBlockLinks } from "@/lib/links";

// Re-export pure utilities so server-side callers can still import from this module
export { getPageByPath, resolvePageSlug, resolveLink } from "@/lib/site-utils";

// ──────────────────────────────────────────────
// DB → Frontend Transformers
// ──────────────────────────────────────────────

/* eslint-disable @typescript-eslint/no-explicit-any */

function transformDbSiteToFrontend(dbSite: any, dbPages: any[]): Site {
  return {
    id: dbSite.id,
    settings: {
      name: dbSite.name,
      description: dbSite.settings?.description || "",
      logoUrl: dbSite.settings?.logoUrl,
      maintenanceMode: dbSite.settings?.maintenanceMode || false,
      socials: dbSite.settings?.socials || {},
      i18n: dbSite.settings?.i18n,
    },
    theme: {
      primaryColor: dbSite.theme?.primaryColor || "#4F46E5",
      fontFamily: dbSite.theme?.fontFamily || "Inter, sans-serif",
      borderRadius: dbSite.theme?.borderRadius || "rounded",
      shadow: dbSite.theme?.shadow || "sm",
    },
    pages: (dbPages || [])
      .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((p: any) => transformDbPageToFrontend(p)),
    domain: {
      subdomain: dbSite.slug,
      customDomain: dbSite.custom_domain || undefined,
    },
    seo: {
      globalTitle: dbSite.seo?.globalTitle || dbSite.name,
      globalDescription: dbSite.seo?.globalDescription || "",
      ogImageUrl: dbSite.seo?.ogImageUrl,
    },
    nav: dbSite.nav || undefined,
    footer: dbSite.footer || undefined,
    design: dbSite.design || undefined,
  };
}

function transformDbPageToFrontend(dbPage: any): SitePage {
  const blocks = (dbPage.site_blocks || [])
    .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((b: any) => transformDbBlockToFrontend(b));

  return {
    id: dbPage.id,
    name: dbPage.title,
    slug: dbPage.is_home ? "/" : `/${dbPage.slug}`,
    status: dbPage.status as SitePage["status"],
    blocks,
    seoTitle: dbPage.seo_title || undefined,
    seoDescription: dbPage.seo_description || undefined,
    ogImageUrl: dbPage.og_image_url || undefined,
  };
}

/** Block types that represent portfolio/projects sections */
const PORTFOLIO_BLOCK_TYPES: string[] = [
  "portfolio-grid", "portfolio-masonry", "projects-grid-cases",
  "projects-horizontal", "project-before-after", "project-timeline",
  "project-masonry-wall",
];

/** Block types that represent sale/product sections */
const SALE_BLOCK_TYPES: string[] = [
  "product-featured-card", "products-3card-shop", "product-bundle-compare",
  "product-benefits-mockup", "pricing-table", "pricing-3tier-saas",
  "pricing-custom-quote", "pricing-mini-faq", "services-premium",
  "services-3card-premium", "services-icon-grid", "services-process-offers",
  "comparison-table",
];

/** Block types that capture leads via forms */
const FORM_BLOCK_TYPES: string[] = [
  "custom-form", "contact-form", "contact-premium", "form-contact-simple",
  "form-quote-request", "form-newsletter-lead", "newsletter", "lead-magnet",
];

/**
 * Migrate block content to ensure new data-binding fields have sensible defaults.
 * This runs at read time so existing blocks in the DB are forward-compatible
 * without requiring a SQL migration.
 */
function migrateBlockDataBindings(block: Block): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c = block.content as any;

  // Portfolio blocks: default source = "manual"
  if (PORTFOLIO_BLOCK_TYPES.includes(block.type) && c.source === undefined) {
    c.source = "manual";
  }

  // Sale blocks without mode: default to "manual"
  if (SALE_BLOCK_TYPES.includes(block.type) && c.mode === undefined) {
    c.mode = "manual";
  }

  // Form blocks: ensure saveAsLead defaults to true
  if (FORM_BLOCK_TYPES.includes(block.type) && c.saveAsLead === undefined) {
    c.saveAsLead = true;
  }
}

function transformDbBlockToFrontend(dbBlock: any): Block {
  const block = {
    id: dbBlock.id,
    type: dbBlock.type as BlockType,
    content: dbBlock.content ? { ...dbBlock.content } : {},
    style: dbBlock.style || {},
    settings: dbBlock.settings || {},
    visible: dbBlock.visible ?? true,
  } as Block;

  // Migrate old link fields → blockLink at read time
  migrateBlockLinks(block);

  // Ensure new data-binding fields have defaults for backward compat
  migrateBlockDataBindings(block);

  return block;
}

/* eslint-enable @typescript-eslint/no-explicit-any */

// ──────────────────────────────────────────────
// Site Resolver
// ──────────────────────────────────────────────

/**
 * Resolve a site by its subdomain slug.
 * Returns the full site with pages and blocks.
 * Falls back to mockSite for dev if no DB match.
 */
export async function getSiteBySlug(slug: string): Promise<Site | null> {
  try {
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: dbSite, error } = await (supabase.from("sites") as any)
      .select("id, slug, name, theme, settings, seo, nav, footer, design, custom_domain")
      .eq("slug", slug)
      .eq("status", "published")
      .eq("is_private", false)
      .single();

    if (error || !dbSite) {
      return null;
    }

    // Get published pages with blocks
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: dbPages } = await (supabase.from("site_pages") as any)
      .select("id, slug, title, is_home, sort_order, status, seo_title, seo_description, og_image_url, site_blocks(*)")
      .eq("site_id", dbSite.id)
      .eq("status", "published")
      .order("sort_order");

    return transformDbSiteToFrontend(dbSite, dbPages || []);
  } catch {
    return null;
  }
}

/**
 * Resolve a site by custom domain.
 */
export async function getSiteByCustomDomain(domain: string): Promise<Site | null> {
  try {
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: dbSite, error } = await (supabase.from("sites") as any)
      .select("id, slug, name, theme, settings, seo, nav, footer, design, custom_domain")
      .eq("custom_domain", domain)
      .eq("status", "published")
      .eq("is_private", false)
      .single();

    if (error || !dbSite) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: dbPages } = await (supabase.from("site_pages") as any)
      .select("id, slug, title, is_home, sort_order, status, seo_title, seo_description, og_image_url, site_blocks(*)")
      .eq("site_id", dbSite.id)
      .eq("status", "published")
      .order("sort_order");

    return transformDbSiteToFrontend(dbSite, dbPages || []);
  } catch {
    return null;
  }
}

