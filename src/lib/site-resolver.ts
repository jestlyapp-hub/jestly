import type { Site, SitePage, Block, BlockType } from "@/types";
import { createClient } from "@/lib/supabase/server";
import { mockSite } from "@/lib/mock-data";

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

function transformDbBlockToFrontend(dbBlock: any): Block {
  return {
    id: dbBlock.id,
    type: dbBlock.type as BlockType,
    content: dbBlock.content || {},
    style: dbBlock.style || {},
    settings: dbBlock.settings || {},
    visible: dbBlock.visible ?? true,
  } as Block;
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
      .select("id, slug, name, theme, settings, seo, nav, footer, custom_domain")
      .eq("slug", slug)
      .eq("status", "published")
      .eq("is_private", false)
      .single();

    if (error || !dbSite) {
      // Fallback to mock for development
      if (mockSite.domain.subdomain === slug) return mockSite;
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
    // Fallback to mock if Supabase is not available
    if (mockSite.domain.subdomain === slug) return mockSite;
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
      .select("id, slug, name, theme, settings, seo, nav, footer, custom_domain")
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

