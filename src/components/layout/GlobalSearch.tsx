"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useGlobalSearch } from "@/lib/hooks/use-global-search";
import {
  getRecentItems,
  saveRecentItem,
  saveRecentSearch,
  getRecentSearches,
  entityConfig,
  statusLabels,
  typeDisplayOrder,
  type SearchResult,
  type EntityType,
} from "@/lib/search-utils";

/* ═══════════════════════════════════════════════════════════
   Entity Icons — SVG inline icons for each type
   ═══════════════════════════════════════════════════════════ */

function EntityIcon({ type, size = 16 }: { type: EntityType; size?: number }) {
  const color = entityConfig[type]?.color ?? "#999";
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  const icons: Record<string, React.ReactNode> = {
    page: (
      <svg {...common}>
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    client: (
      <svg {...common}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
      </svg>
    ),
    order: (
      <svg {...common}>
        <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
        <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
      </svg>
    ),
    task: (
      <svg {...common}>
        <polyline points="9 11 12 14 22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
    invoice: (
      <svg {...common}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    product: (
      <svg {...common}>
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
    project: (
      <svg {...common}>
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    event: (
      <svg {...common}>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    brief: (
      <svg {...common}>
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
    file: (
      <svg {...common}>
        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
        <polyline points="13 2 13 9 20 9" />
      </svg>
    ),
    lead: (
      <svg {...common}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="14" />
        <line x1="22" y1="11" x2="16" y2="11" />
      </svg>
    ),
    note: (
      <svg {...common}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  };

  return icons[type] ?? (
    <svg {...common}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════
   Highlight matched text
   ═══════════════════════════════════════════════════════════ */

function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query || query.length < 2 || !text) return <>{text}</>;

  const normalizedQuery = query
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const normalizedText = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const idx = normalizedText.indexOf(normalizedQuery);
  if (idx === -1) return <>{text}</>;

  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + query.length);
  const after = text.slice(idx + query.length);

  return (
    <>
      {before}
      <mark className="bg-[#EEF2FF] text-[#4F46E5] font-semibold rounded-sm px-0.5 py-0">
        {match}
      </mark>
      {after}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   Status badge
   ═══════════════════════════════════════════════════════════ */

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    new: "bg-blue-50 text-blue-600",
    in_progress: "bg-amber-50 text-amber-600",
    validated: "bg-green-50 text-green-600",
    paid: "bg-emerald-50 text-emerald-600",
    cancelled: "bg-red-50 text-red-500",
    pending: "bg-yellow-50 text-yellow-600",
    overdue: "bg-red-50 text-red-600",
    active: "bg-green-50 text-green-600",
    inactive: "bg-gray-50 text-gray-500",
    todo: "bg-slate-50 text-slate-600",
    done: "bg-emerald-50 text-emerald-600",
    completed: "bg-emerald-50 text-emerald-600",
    delivered: "bg-green-50 text-green-600",
    draft: "bg-gray-50 text-gray-500",
    sent: "bg-blue-50 text-blue-600",
    invoiced: "bg-indigo-50 text-indigo-600",
    archived: "bg-gray-50 text-gray-400",
  };

  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium leading-none ${
        colorMap[status] ?? "bg-gray-50 text-gray-500"
      }`}
    >
      {statusLabels[status] ?? status}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════
   Search Result Item — Rich display with breadcrumbs
   ═══════════════════════════════════════════════════════════ */

function SearchResultItem({
  item,
  query,
  isSelected,
  isTopResult,
  onSelect,
  onHover,
}: {
  item: SearchResult;
  query: string;
  isSelected: boolean;
  isTopResult?: boolean;
  onSelect: () => void;
  onHover: () => void;
}) {
  const config = entityConfig[item.type];

  return (
    <button
      onClick={onSelect}
      onMouseEnter={onHover}
      data-selected={isSelected}
      className={`w-full flex items-center gap-3 px-4 text-left cursor-pointer transition-all duration-150 ${
        isTopResult ? "py-3" : "py-2.5"
      } ${
        isSelected
          ? "bg-[#F3F3F1] border-l-2 border-l-[#4F46E5] pl-[14px]"
          : "hover:bg-[#F7F7F5] border-l-2 border-l-transparent pl-[14px]"
      }`}
    >
      {/* Icon */}
      <div
        className={`${isTopResult ? "w-9 h-9" : "w-8 h-8"} rounded-lg flex items-center justify-center flex-shrink-0`}
        style={{ backgroundColor: config?.bgColor ?? "#F3F4F6" }}
      >
        <EntityIcon type={item.type} size={isTopResult ? 18 : 16} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className={`${isTopResult ? "text-[14px]" : "text-[13px]"} text-[#191919] font-medium truncate`}>
          <HighlightText text={item.title} query={query} />
        </div>

        {/* Subtitle line */}
        {item.subtitle && (
          <div className="text-[11px] text-[#999] truncate mt-0.5">
            <HighlightText text={item.subtitle} query={query} />
          </div>
        )}

        {/* Breadcrumbs */}
        {item.breadcrumbs && item.breadcrumbs.length > 0 && (
          <div className="flex items-center gap-1 mt-0.5">
            {item.breadcrumbs.filter(Boolean).map((crumb, i) => (
              <span key={i} className="text-[10px] text-[#BBB] flex items-center gap-1">
                {i > 0 && (
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#CCC" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                )}
                {crumb}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Right side — badges + metadata */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {item.status && <StatusBadge status={item.status} />}
        {item.amount !== undefined && item.amount > 0 && (
          <span className="text-[11px] text-[#666] font-medium tabular-nums">
            {Number(item.amount).toLocaleString("fr-FR")} &euro;
          </span>
        )}
        {item.date && (
          <span className="text-[10px] text-[#BBB] tabular-nums">
            {formatShortDate(item.date)}
          </span>
        )}
        {/* Entity type badge */}
        <span
          className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wide"
          style={{
            color: config?.color ?? "#999",
            backgroundColor: config?.bgColor ?? "#F3F4F6",
          }}
        >
          {config?.label ?? item.type}
        </span>
      </div>
    </button>
  );
}

function formatShortDate(date: string): string {
  try {
    return new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  } catch {
    return date;
  }
}

/* ═══════════════════════════════════════════════════════════
   Search Section — Grouped results by type
   ═══════════════════════════════════════════════════════════ */

function SearchSection({
  type,
  items,
  query,
  flatResults,
  selectedIndex,
  onSelect,
  onHover,
}: {
  type: EntityType;
  items: SearchResult[];
  query: string;
  flatResults: SearchResult[];
  selectedIndex: number;
  onSelect: (r: SearchResult, position: number) => void;
  onHover: (idx: number) => void;
}) {
  const config = entityConfig[type];

  return (
    <div>
      <div className="px-4 pt-3 pb-1 flex items-center gap-2">
        <span
          className="text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: config?.color ?? "#999" }}
        >
          {config?.labelPlural ?? type}
        </span>
        <span className="text-[10px] text-[#CCC]">{items.length}</span>
      </div>
      {items.map((item) => {
        const idx = flatResults.indexOf(item);
        return (
          <SearchResultItem
            key={`${item.type}-${item.id}`}
            item={item}
            query={query}
            isSelected={idx === selectedIndex}
            onSelect={() => onSelect(item, idx)}
            onHover={() => onHover(idx)}
          />
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Search Trigger Button (for Topbar)
   ═══════════════════════════════════════════════════════════ */

export function SearchTrigger({ onClick }: { onClick: () => void }) {
  const isMac =
    typeof navigator !== "undefined" &&
    /Mac|iPod|iPhone|iPad/.test(navigator.platform ?? "");

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 w-full max-w-[320px] bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#BBB] hover:border-[#D5D5D3] hover:bg-[#F3F3F1] transition-all cursor-text"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#BBB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <span className="flex-1 text-left">Rechercher...</span>
      <kbd className="text-[10px] text-[#BBB] bg-white border border-[#E6E6E4] rounded px-1.5 py-0.5 font-mono">
        {isMac ? "\u2318K" : "Ctrl+K"}
      </kbd>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT — Global Search Modal
   ═══════════════════════════════════════════════════════════ */

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const {
    query,
    setQuery,
    results,
    topResult,
    groupedResults,
    isLoading,
    error,
    resultCount,
    logClick,
  } = useGlobalSearch({ debounceMs: 200, limit: 25 });

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Build flat list ordered by typeDisplayOrder
  const flatResults: SearchResult[] = [];
  for (const type of typeDisplayOrder) {
    if (groupedResults[type]) flatResults.push(...groupedResults[type]);
  }

  // Open/close
  const openModal = useCallback(() => {
    setIsOpen(true);
    setQuery("");
    setSelectedIndex(0);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [setQuery]);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setSelectedIndex(0);
  }, [setQuery]);

  // Cmd+K / Ctrl+K + global Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        isOpen ? closeModal() : openModal();
        return;
      }
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        closeModal();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, openModal, closeModal]);

  // Expose for Topbar
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__openGlobalSearch = openModal;
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).__openGlobalSearch;
    };
  }, [openModal]);

  // Navigate to result
  const navigateTo = useCallback(
    (result: SearchResult, position: number) => {
      saveRecentItem(result);
      if (query.length >= 2) saveRecentSearch(query);
      logClick(result, position);
      closeModal();
      router.push(result.href);
    },
    [router, query, closeModal, logClick]
  );

  // Scroll selected into view
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector("[data-selected='true']");
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  // Keyboard navigation
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      closeModal();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < flatResults.length - 1 ? prev + 1 : 0));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : flatResults.length - 1));
      return;
    }
    if (e.key === "Enter" && flatResults[selectedIndex]) {
      e.preventDefault();
      navigateTo(flatResults[selectedIndex], selectedIndex);
    }
  }

  // Quick access data
  const recentItems = getRecentItems();
  const recentSearches = getRecentSearches();
  const hasQuery = query.length >= 2;
  const showQuickAccess = isOpen && !hasQuery && results.length === 0;
  const showResults = isOpen && flatResults.length > 0;
  const showEmpty = isOpen && hasQuery && flatResults.length === 0 && !isLoading;

  return (
    <>
      <SearchTrigger onClick={openModal} />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] sm:pt-[15vh]"
          >
            {/* Backdrop — clickable to close */}
            <div
              className="absolute inset-0 bg-black/20 backdrop-blur-[2px] cursor-default"
              onClick={closeModal}
              aria-hidden="true"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.12, ease: "easeOut" as const }}
              className="relative w-full max-w-[600px] mx-3 sm:mx-4 bg-white rounded-xl shadow-2xl border border-[#E6E6E4] overflow-hidden"
            >
              {/* ─── Input ─── */}
              <div className="flex items-center border-b border-[#EFEFEF] px-4 gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  role="combobox"
                  aria-expanded={true}
                  aria-haspopup="listbox"
                  aria-label="Recherche globale"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                  onKeyDown={handleKeyDown}
                  placeholder="Rechercher clients, projets, commandes, fichiers..."
                  className="flex-1 bg-transparent py-3.5 text-[14px] text-[#191919] placeholder-[#BBB] focus:outline-none"
                />
                {query && (
                  <button
                    onClick={() => { setQuery(""); inputRef.current?.focus(); }}
                    className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded text-[#BBB] hover:text-[#666] hover:bg-[#F7F7F5] transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
                {isLoading && (
                  <div className="flex-shrink-0 w-4 h-4 border-2 border-[#E6E6E4] border-t-[#4F46E5] rounded-full animate-spin" />
                )}
                {/* Close button */}
                <button
                  onClick={closeModal}
                  aria-label="Fermer la recherche"
                  className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-md text-[#BBB] hover:text-[#666] hover:bg-[#F3F3F1] transition-colors cursor-pointer"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* ─── Results area ─── */}
              <div
                ref={listRef}
                role="listbox"
                aria-label="Résultats de recherche"
                className="max-h-[420px] overflow-y-auto overscroll-contain"
              >
                {/* Loading skeleton */}
                {isLoading && flatResults.length === 0 && (
                  <div className="px-4 py-3 space-y-2.5">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center gap-3 animate-pulse">
                        <div className="w-8 h-8 rounded-lg bg-[#F3F3F1]" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-3.5 rounded bg-[#F3F3F1]" style={{ width: `${100 + i * 20}px` }} />
                          <div className="h-2.5 rounded bg-[#F7F7F5]" style={{ width: `${140 + i * 15}px` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Error state */}
                {error && (
                  <div className="px-4 py-6 text-center">
                    <p className="text-[13px] text-red-500">{error}</p>
                    <p className="text-[11px] text-[#CCC] mt-1">Réessayez dans un instant</p>
                  </div>
                )}

                {/* Quick access */}
                {showQuickAccess && !isLoading && (
                  <div>
                    {/* Recent searches */}
                    {recentSearches.length > 0 && (
                      <div>
                        <div className="px-4 pt-3 pb-1.5">
                          <span className="text-[11px] font-semibold text-[#999] uppercase tracking-wider">
                            Recherches récentes
                          </span>
                        </div>
                        {recentSearches.slice(0, 5).map((s) => (
                          <button
                            key={s}
                            onClick={() => setQuery(s)}
                            className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-[#F7F7F5] transition-all duration-150 cursor-pointer"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#CCC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="1 4 1 10 7 10" />
                              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                            </svg>
                            <span className="text-[13px] text-[#666]">{s}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Recent items */}
                    {recentItems.length > 0 && (
                      <div>
                        <div className="px-4 pt-3 pb-1.5">
                          <span className="text-[11px] font-semibold text-[#999] uppercase tracking-wider">
                            Accès rapide
                          </span>
                        </div>
                        {recentItems.slice(0, 6).map((item, i) => (
                          <SearchResultItem
                            key={item.id}
                            item={item}
                            query=""
                            isSelected={i === selectedIndex}
                            onSelect={() => navigateTo(item, i)}
                            onHover={() => setSelectedIndex(i)}
                          />
                        ))}
                      </div>
                    )}

                    {/* Welcome state */}
                    {recentSearches.length === 0 && recentItems.length === 0 && (
                      <div className="px-4 py-10 text-center">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#DDD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3">
                          <circle cx="11" cy="11" r="8" />
                          <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <p className="text-[13px] text-[#888]">
                          Tapez pour rechercher dans tout Jestly
                        </p>
                        <p className="text-[11px] text-[#BBB] mt-1.5">
                          Clients, projets, commandes, factures, fichiers, briefs...
                        </p>
                        <div className="flex items-center justify-center gap-2 mt-3">
                          <span className="text-[10px] text-[#CCC]">Filtrer par type :</span>
                          <code className="text-[10px] text-[#999] bg-[#F7F7F5] px-1.5 py-0.5 rounded border border-[#EFEFEF]">type:client</code>
                          <code className="text-[10px] text-[#999] bg-[#F7F7F5] px-1.5 py-0.5 rounded border border-[#EFEFEF]">type:projet</code>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ─── Top Result ─── */}
                {showResults && !isLoading && topResult && (
                  <div>
                    <div className="px-4 pt-3 pb-1">
                      <span className="text-[11px] font-semibold text-[#4F46E5] uppercase tracking-wider">
                        Meilleur résultat
                      </span>
                    </div>
                    <SearchResultItem
                      item={topResult}
                      query={query}
                      isSelected={flatResults.indexOf(topResult) === selectedIndex}
                      isTopResult
                      onSelect={() => navigateTo(topResult, flatResults.indexOf(topResult))}
                      onHover={() => setSelectedIndex(flatResults.indexOf(topResult))}
                    />
                    <div className="mx-4 border-t border-[#EFEFEF]" />
                  </div>
                )}

                {/* ─── Grouped results ─── */}
                {showResults && !isLoading && (
                  <div>
                    {typeDisplayOrder.map((type) => {
                      const items = groupedResults[type];
                      if (!items || items.length === 0) return null;
                      // Skip top result's type if only 1 item and it's the top result
                      if (topResult && items.length === 1 && items[0].id === topResult.id) return null;
                      // Filter out top result from its group to avoid duplication
                      const displayItems = topResult
                        ? items.filter((item) => item.id !== topResult.id)
                        : items;
                      if (displayItems.length === 0) return null;

                      return (
                        <SearchSection
                          key={type}
                          type={type}
                          items={displayItems}
                          query={query}
                          flatResults={flatResults}
                          selectedIndex={selectedIndex}
                          onSelect={navigateTo}
                          onHover={setSelectedIndex}
                        />
                      );
                    })}
                  </div>
                )}

                {/* Empty state */}
                {showEmpty && !error && (
                  <div className="px-4 py-10 text-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#DDD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <p className="text-[13px] text-[#888]">
                      Aucun résultat pour &laquo;{" "}
                      <span className="font-medium text-[#555]">{query}</span>
                      {" "}&raquo;
                    </p>
                    <p className="text-[11px] text-[#BBB] mt-1.5 max-w-[360px] mx-auto">
                      Essayez un autre mot-clé ou recherchez par client, projet, commande, produit, facture ou brief.
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-3">
                      <code className="text-[10px] text-[#999] bg-[#F7F7F5] px-1.5 py-0.5 rounded border border-[#EFEFEF]">type:client</code>
                      <code className="text-[10px] text-[#999] bg-[#F7F7F5] px-1.5 py-0.5 rounded border border-[#EFEFEF]">type:produit</code>
                      <code className="text-[10px] text-[#999] bg-[#F7F7F5] px-1.5 py-0.5 rounded border border-[#EFEFEF]">type:brief</code>
                    </div>
                  </div>
                )}
              </div>

              {/* ─── Footer ─── */}
              <div className="px-4 py-2 border-t border-[#EFEFEF] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <kbd className="text-[9px] text-[#BBB] bg-[#F7F7F5] border border-[#E6E6E4] rounded px-1 py-0.5 font-mono">&uarr;</kbd>
                    <kbd className="text-[9px] text-[#BBB] bg-[#F7F7F5] border border-[#E6E6E4] rounded px-1 py-0.5 font-mono">&darr;</kbd>
                    <span className="text-[10px] text-[#CCC] ml-0.5">naviguer</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="text-[9px] text-[#BBB] bg-[#F7F7F5] border border-[#E6E6E4] rounded px-1 py-0.5 font-mono">&crarr;</kbd>
                    <span className="text-[10px] text-[#CCC] ml-0.5">ouvrir</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="text-[9px] text-[#BBB] bg-[#F7F7F5] border border-[#E6E6E4] rounded px-1 py-0.5 font-mono">esc</kbd>
                    <span className="text-[10px] text-[#CCC] ml-0.5">fermer</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {resultCount > 0 && (
                    <span className="text-[10px] text-[#CCC]">
                      {resultCount} résultat{resultCount > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
