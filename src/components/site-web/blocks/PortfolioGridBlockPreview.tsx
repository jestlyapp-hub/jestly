"use client";

import { memo, useState, useRef, useEffect } from "react";
import type { PortfolioGridBlockContent, PortfolioCard } from "@/types";
import { getProjectHref } from "@/lib/site-utils";

interface PortfolioProject {
  title: string;
  imageUrl: string;
  category: string;
  description?: string;
  featured?: boolean;
  clientName?: string;
  externalUrl?: string;
  ctaUrl?: string;
  slug?: string;
}

function PortfolioGridBlockPreviewInner({ content, siteSlug }: { content: PortfolioGridBlockContent; siteSlug?: string }) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [liveProjects, setLiveProjects] = useState<PortfolioProject[] | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    timerRef.current = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timerRef.current);
  }, [searchQuery]);

  // Fetch real portfolio projects if useRealProjects flag is set and siteSlug available
  useEffect(() => {
    if (!(content as any).useRealProjects || !siteSlug) return;
    fetch(`/api/public/portfolio?site_slug=${siteSlug}`)
      .then(r => r.ok ? r.json() : [])
      .then((data: any[]) => {
        setLiveProjects(data.map(p => ({
          title: p.title,
          imageUrl: p.coverUrl || "",
          category: p.category || p.type || "",
          description: p.description,
          featured: false,
          clientName: p.clientName,
          externalUrl: p.externalUrl,
        })));
      })
      .catch(() => {});
  }, [(content as any).useRealProjects, siteSlug]);

  // Merge linked projects with manual items
  // Priority: linked_projects > API fetch > manual items
  const linkedItems: PortfolioProject[] | null =
    (content as any).source === "linked_projects" && (content as any).resolvedProjects?.length
      ? ((content as any).resolvedProjects as PortfolioCard[]).map((rp) => ({
          title: rp.title,
          imageUrl: rp.imageUrl || "",
          category: rp.category,
          description: rp.summary,
          result: rp.result,
          slug: rp.slug,
          ctaUrl: rp.ctaUrl,
          featured: false,
        }))
      : null;

  const items = linkedItems ?? liveProjects ?? content.items;
  const cols = content.columns === 2 ? "grid-cols-2" : content.columns === 4 ? "grid-cols-4" : "grid-cols-3";

  const sorted = [...items].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  const afterCategoryFilter = activeFilter ? sorted.filter((item) => item.category === activeFilter) : sorted;
  const filtered = debouncedSearch
    ? afterCategoryFilter.filter((item) =>
        item.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        item.category.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : afterCategoryFilter;

  // Derive categories from items if using real/linked projects
  const categories = linkedItems || liveProjects
    ? [...new Set(items.map(p => p.category).filter(Boolean))]
    : (content.categories || []);

  return (
    <div className="py-4">
      {content.showSearch && (
        <div className="mb-3 relative">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--site-muted, #999)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un projet..."
            className="w-full rounded-lg pl-9 pr-3 py-2 text-[12px] focus:outline-none focus:border-[var(--site-primary)]/30"
            style={{ background: "var(--site-surface, #F7F7F5)", border: "1px solid var(--site-border, #E6E6E4)", color: "var(--site-text, #1A1A1A)" }}
          />
        </div>
      )}

      {content.showFilter && categories.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          <button
            onClick={() => setActiveFilter(null)}
            className="px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors"
            style={activeFilter === null
              ? { background: "var(--site-primary)", color: "var(--btn-text, #fff)" }
              : { background: "var(--site-surface, #F7F7F5)", color: "var(--site-muted, #999)", border: "1px solid var(--site-border, #E6E6E4)" }
            }
          >
            Tous
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(activeFilter === cat ? null : cat)}
              className="px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors"
              style={activeFilter === cat
                ? { background: "var(--site-primary)", color: "var(--btn-text, #fff)" }
                : { background: "var(--site-surface, #F7F7F5)", color: "var(--site-muted, #999)", border: "1px solid var(--site-border, #E6E6E4)" }
              }
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className={`grid ${cols} gap-3`}>
        {filtered.map((item, i) => {
          const link = getProjectHref(item, siteSlug);
          const Wrapper = link ? "a" : "div";

          return (
            <Wrapper
              key={i}
              {...(link ? { href: link.href, target: link.external ? "_blank" : undefined, rel: link.external ? "noopener noreferrer" : undefined } : {})}
              className={`rounded-lg overflow-hidden relative group block${link ? " cursor-pointer transition-shadow hover:shadow-md" : ""}`}
              style={{ border: "1px solid var(--site-border, #E6E6E4)", textDecoration: "none", color: "inherit" }}
            >
              {item.featured && (
                <span className="absolute top-2 right-2 z-10 bg-[var(--site-primary)] text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ color: "var(--btn-text, #fff)" }}>
                  En vedette
                </span>
              )}
              <div className="h-24 overflow-hidden" style={{ background: "linear-gradient(135deg, var(--site-primary-light), var(--site-border))" }}>
                {item.imageUrl && (
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="p-3">
                <div className="text-[12px] font-medium" style={{ color: "var(--site-text, #1A1A1A)" }}>{item.title}</div>
                <div className="text-[10px]" style={{ color: "var(--site-muted, #999)" }}>
                  {item.category}
                  {item.clientName && ` · ${item.clientName}`}
                </div>
                {item.description && (
                  <div className="text-[10px] mt-1 line-clamp-2" style={{ color: "var(--site-muted, #999)" }}>{item.description}</div>
                )}
              </div>
            </Wrapper>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-6 text-[12px]" style={{ color: "var(--site-muted, #999)" }}>Aucun projet trouvé</div>
      )}
    </div>
  );
}

export default memo(PortfolioGridBlockPreviewInner);
