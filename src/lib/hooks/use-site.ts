"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Site, SitePage, Block, BlockType } from "@/types";

/* eslint-disable @typescript-eslint/no-explicit-any */

function transformDbSite(raw: any): Site {
  const pages: SitePage[] = (raw.site_pages || [])
    .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((p: any): SitePage => ({
      id: p.id,
      name: p.title,
      slug: p.is_home ? "/" : `/${p.slug}`,
      status: p.status as SitePage["status"],
      blocks: (p.site_blocks || [])
        .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .map((b: any): Block => ({
          id: b.id,
          type: b.type as BlockType,
          content: b.content || {},
          style: b.style || {},
          settings: b.settings || {},
          visible: b.visible ?? true,
        } as Block)),
      seoTitle: p.seo_title || undefined,
      seoDescription: p.seo_description || undefined,
      ogImageUrl: p.og_image_url || undefined,
    }));

  return {
    id: raw.id,
    settings: {
      name: raw.name,
      description: raw.settings?.description || "",
      logoUrl: raw.settings?.logoUrl,
      maintenanceMode: raw.settings?.maintenanceMode || false,
      socials: raw.settings?.socials || {},
      i18n: raw.settings?.i18n,
    },
    theme: {
      primaryColor: raw.theme?.primaryColor || "#4F46E5",
      fontFamily: raw.theme?.fontFamily || "Inter, sans-serif",
      borderRadius: raw.theme?.borderRadius || "rounded",
      shadow: raw.theme?.shadow || "sm",
    },
    pages,
    domain: {
      subdomain: raw.slug,
      customDomain: raw.custom_domain || undefined,
    },
    seo: {
      globalTitle: raw.seo?.globalTitle || raw.name,
      globalDescription: raw.seo?.globalDescription || "",
      ogImageUrl: raw.seo?.ogImageUrl,
    },
    nav: raw.nav || undefined,
    footer: raw.footer || undefined,
  };
}

/* eslint-enable @typescript-eslint/no-explicit-any */

interface UseSiteResult {
  site: Site;
  loading: boolean;
  siteId: string | null;
  mutate: () => void;
}

const emptySite: Site = {
  id: "",
  settings: { name: "", description: "", maintenanceMode: false, socials: {} },
  theme: { primaryColor: "#4F46E5", fontFamily: "Inter, sans-serif", borderRadius: "rounded", shadow: "sm" },
  pages: [],
  domain: { subdomain: "" },
  seo: { globalTitle: "", globalDescription: "" },
};

/**
 * Hook to fetch the current user's site from the API.
 */
export function useSite(): UseSiteResult {
  const [site, setSite] = useState<Site>(emptySite);
  const [siteId, setSiteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const fetchSite = useCallback(async () => {
    setLoading(true);
    try {
      const listRes = await fetch("/api/sites");
      if (!listRes.ok) {
        if (mountedRef.current) setLoading(false);
        return;
      }
      const sites = await listRes.json();
      if (!Array.isArray(sites) || sites.length === 0) {
        if (mountedRef.current) setLoading(false);
        return;
      }

      const id = sites[0].id;
      if (mountedRef.current) setSiteId(id);

      const fullRes = await fetch(`/api/sites/${id}`);
      if (!fullRes.ok) {
        if (mountedRef.current) setLoading(false);
        return;
      }
      const raw = await fullRes.json();
      if (mountedRef.current) {
        setSite(transformDbSite(raw));
      }
    } catch {
      // Keep emptySite as fallback
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchSite();
    return () => { mountedRef.current = false; };
  }, [fetchSite]);

  return { site, loading, siteId, mutate: fetchSite };
}
