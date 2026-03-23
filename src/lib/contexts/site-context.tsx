"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Site, SitePage, Block, BlockType } from "@/types";
import { normalizeTheme } from "@/lib/theme-utils";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ── Transform DB row → frontend Site ──────────────────────────────
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
      faviconUrl: raw.settings?.faviconUrl,
      maintenanceMode: raw.settings?.maintenanceMode === true || raw.settings?.maintenanceMode === "true",
      socials: raw.settings?.socials || {},
      i18n: raw.settings?.i18n,
    },
    theme: normalizeTheme(raw.theme),
    pages,
    domain: {
      subdomain: raw.slug || "",
      customDomain: raw.custom_domain || undefined,
    },
    seo: {
      globalTitle: raw.seo?.globalTitle || raw.name,
      globalDescription: raw.seo?.globalDescription || "",
      ogImageUrl: raw.seo?.ogImageUrl,
    },
    nav: raw.nav || undefined,
    footer: raw.footer || undefined,
    design: raw.design || undefined,
    status: raw.status === "published" ? "published" : "draft",
    publishedAt: raw.published_at || undefined,
  };
}

/* eslint-enable @typescript-eslint/no-explicit-any */

// ── Types ─────────────────────────────────────────────────────────
export interface UseSiteResult {
  site: Site;
  loading: boolean;
  siteId: string;
  error: string | null;
  mutate: () => Promise<void>;
}

const emptySite: Site = {
  id: "",
  settings: { name: "", description: "", maintenanceMode: false, socials: {} },
  theme: { primaryColor: "#4F46E5", fontFamily: "Inter, sans-serif", borderRadius: "rounded", shadow: "sm" },
  pages: [],
  domain: { subdomain: "" },
  seo: { globalTitle: "", globalDescription: "" },
};

// Module-level cache keyed by siteId
let cachedSite: Site | null = null;
let cachedSiteId: string | null = null;

// ── Context ───────────────────────────────────────────────────────
const SiteContext = createContext<UseSiteResult | null>(null);

/**
 * SiteProvider — receives siteId from the URL, fetches /api/sites/{siteId} directly.
 * No more "get first site" — the siteId is always known from the route.
 */
export function SiteProvider({ siteId, children }: { siteId: string; children: React.ReactNode }) {
  const hasCache = cachedSiteId === siteId && cachedSite;
  const [site, setSite] = useState<Site>(hasCache ? cachedSite! : emptySite);
  const [loading, setLoading] = useState(!hasCache);
  const [error, setError] = useState<string | null>(null);

  const fetchSite = useCallback(async () => {
    // Only show loading spinner if we have NO cached data to display
    if (!(cachedSiteId === siteId && cachedSite)) {
      setLoading(true);
    }
    setError(null);
    try {
      const res = await fetch(`/api/sites/${siteId}`, { cache: "no-store" });
      if (!res.ok) {
        if (res.status === 401) setError("Session expirée, reconnectez-vous.");
        else if (res.status === 404) setError("Site introuvable.");
        else setError(`Erreur serveur (${res.status})`);
        return;
      }
      const raw = await res.json();
      const transformed = transformDbSite(raw);
      setSite(transformed);
      cachedSite = transformed;
      cachedSiteId = siteId;
    } catch {
      setError("Erreur réseau. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  }, [siteId]);

  useEffect(() => {
    fetchSite();
  }, [fetchSite]);

  return (
    <SiteContext.Provider value={{ site, loading, siteId, error, mutate: fetchSite }}>
      {children}
    </SiteContext.Provider>
  );
}

/** Hook principal — lit depuis le SiteContext partagé. */
export function useSiteContext(): UseSiteResult {
  const ctx = useContext(SiteContext);
  if (!ctx) {
    throw new Error("useSiteContext doit être utilisé dans un SiteProvider");
  }
  return ctx;
}
