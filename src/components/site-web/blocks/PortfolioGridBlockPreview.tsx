"use client";

import { memo, useState, useRef, useEffect } from "react";
import type { PortfolioGridBlockContent } from "@/types";

function PortfolioGridBlockPreviewInner({ content }: { content: PortfolioGridBlockContent }) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    timerRef.current = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timerRef.current);
  }, [searchQuery]);

  const cols = content.columns === 2 ? "grid-cols-2" : content.columns === 4 ? "grid-cols-4" : "grid-cols-3";

  // Sort: featured items first
  const sorted = [...content.items].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  // Filter by category
  const afterCategoryFilter = activeFilter
    ? sorted.filter((item) => item.category === activeFilter)
    : sorted;

  // Filter by search
  const filtered = debouncedSearch
    ? afterCategoryFilter.filter((item) =>
        item.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        item.category.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : afterCategoryFilter;

  return (
    <div className="py-4">
      {/* Search bar */}
      {content.showSearch && (
        <div className="mb-3 relative">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un projet..."
            className="w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg pl-9 pr-3 py-2 text-[12px] text-[#1A1A1A] focus:outline-none focus:border-[var(--site-primary)]/30"
          />
        </div>
      )}

      {/* Category filter bar */}
      {content.showFilter && content.categories && content.categories.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          <button
            onClick={() => setActiveFilter(null)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
              activeFilter === null ? "bg-[var(--site-primary)] text-white" : "bg-[#F7F7F5] text-[#999] border border-[#E6E6E4]"
            }`}
          >
            Tous
          </button>
          {content.categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(activeFilter === cat ? null : cat)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                activeFilter === cat ? "bg-[var(--site-primary)] text-white" : "bg-[#F7F7F5] text-[#999] border border-[#E6E6E4]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className={`grid ${cols} gap-3`}>
        {filtered.map((item, i) => (
          <div key={i} className="rounded-lg overflow-hidden border border-[#E6E6E4] relative">
            {item.featured && (
              <span className="absolute top-2 right-2 z-10 bg-[var(--site-primary)] text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                En vedette
              </span>
            )}
            <div className="h-24 bg-gradient-to-br from-[var(--site-primary-light)] to-[#E6E6E4]" />
            <div className="p-3">
              <div className="text-[12px] font-medium text-[#1A1A1A]">{item.title}</div>
              <div className="text-[10px] text-[#999]">{item.category}</div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-6 text-[12px] text-[#999]">Aucun projet trouvé</div>
      )}
    </div>
  );
}

export default memo(PortfolioGridBlockPreviewInner);
