"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  getQuickAccessItems,
  entityConfig,
  statusLabels,
  type SearchResult,
} from "@/lib/search-utils";

/* ─── Icons by entity type ─── */

function EntityIcon({ type }: { type: SearchResult["type"] }) {
  const color = entityConfig[type].color;
  const common = {
    width: 15,
    height: 15,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (type) {
    case "client":
      return (
        <svg {...common}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
        </svg>
      );
    case "order":
      return (
        <svg {...common}>
          <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
          <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
        </svg>
      );
    case "task":
      return (
        <svg {...common}>
          <polyline points="9 11 12 14 22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      );
    case "invoice":
      return (
        <svg {...common}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      );
    case "product":
      return (
        <svg {...common}>
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      );
  }
}

/* ─── Highlight matched text ─── */

function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query || query.length < 2) return <>{text}</>;

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
      <span className="bg-[#EEF2FF] text-[#4F46E5] font-semibold rounded-sm px-0.5">
        {match}
      </span>
      {after}
    </>
  );
}

/* ─── Status badge ─── */

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
    todo: "bg-slate-50 text-slate-600",
    done: "bg-emerald-50 text-emerald-600",
    delivered: "bg-green-50 text-green-600",
  };

  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
        colorMap[status] ?? "bg-gray-50 text-gray-500"
      }`}
    >
      {statusLabels[status] ?? status}
    </span>
  );
}

/* ─── Main component ─── */

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const router = useRouter();

  // Group results by type
  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    if (!acc[r.type]) acc[r.type] = [];
    acc[r.type].push(r);
    return acc;
  }, {});

  // Flat list for arrow navigation
  const flatResults = results;

  // Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search function
  const performSearch = useCallback(async (q: string) => {
    if (!q || q.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Search via real API — DB is the source of truth
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
        setSelectedIndex(0);
        setIsLoading(false);
        return;
      }
    } catch {
      // API failed
    }

    // API unavailable — show empty results
    setResults([]);
    setIsLoading(false);
  }, []);

  // Debounced search on query change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query || query.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    debounceRef.current = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, performSearch]);

  // Navigate to result
  const navigateTo = useCallback(
    (result: SearchResult) => {
      setIsOpen(false);
      setQuery("");
      setResults([]);
      router.push(result.href);
    },
    [router]
  );

  // Keyboard navigation
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < flatResults.length - 1 ? prev + 1 : 0
      );
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : flatResults.length - 1
      );
      return;
    }

    if (e.key === "Enter" && flatResults[selectedIndex]) {
      e.preventDefault();
      navigateTo(flatResults[selectedIndex]);
    }
  }

  // Quick access when no query
  const quickAccess = getQuickAccessItems();
  const showQuickAccess = isOpen && (!query || query.length < 2) && results.length === 0;
  const showResults = isOpen && results.length > 0;
  const showEmpty = isOpen && query.length >= 2 && results.length === 0 && !isLoading;
  const showDropdown = showQuickAccess || showResults || showEmpty || (isOpen && isLoading);

  // Render grouped results
  const typeOrder: SearchResult["type"][] = [
    "client",
    "order",
    "task",
    "invoice",
    "product",
  ];

  // Detect platform for keyboard shortcut hint
  const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform ?? "");

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input */}
      <div className="relative w-full">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#999"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          aria-label="Recherche globale"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Rechercher..."
          className="w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg pl-10 pr-14 py-2 text-[13px] text-[#1A1A1A] placeholder-[#BBB] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#BBB] bg-white border border-[#E6E6E4] rounded px-1.5 py-0.5 font-mono pointer-events-none">
          {isMac ? "\u2318K" : "Ctrl+K"}
        </kbd>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            role="listbox"
            aria-label="Resultats de recherche"
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E6E6E4] rounded-xl shadow-lg max-h-96 overflow-y-auto z-50"
          >
            {/* Loading state */}
            {isLoading && (
              <div className="px-4 py-6 text-center">
                <div className="inline-block w-5 h-5 border-2 border-[#E6E6E4] border-t-[#4F46E5] rounded-full animate-spin" />
                <p className="text-[12px] text-[#999] mt-2">Recherche en cours...</p>
              </div>
            )}

            {/* Quick access */}
            {showQuickAccess && !isLoading && (
              <div>
                <div className="px-4 pt-3 pb-1.5">
                  <span className="text-[11px] font-semibold text-[#999] uppercase tracking-wider">
                    Acces rapide
                  </span>
                </div>
                {quickAccess.map((item, i) => (
                  <button
                    key={item.id}
                    onClick={() => navigateTo(item)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      i === selectedIndex
                        ? "bg-[#F7F7F5]"
                        : "hover:bg-[#FBFBFA]"
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: entityConfig[item.type].bgColor }}
                    >
                      <EntityIcon type={item.type} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] text-[#1A1A1A] font-medium truncate">
                        {item.title}
                      </div>
                      {item.subtitle && (
                        <div className="text-[11px] text-[#999] truncate">
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                    <span
                      className="text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0"
                      style={{
                        color: entityConfig[item.type].color,
                        backgroundColor: entityConfig[item.type].bgColor,
                      }}
                    >
                      {entityConfig[item.type].label}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Grouped results */}
            {showResults &&
              !isLoading &&
              typeOrder.map((type) => {
                const items = grouped[type];
                if (!items || items.length === 0) return null;
                return (
                  <div key={type}>
                    <div className="px-4 pt-3 pb-1.5 flex items-center gap-2">
                      <span
                        className="text-[11px] font-semibold uppercase tracking-wider"
                        style={{ color: entityConfig[type].color }}
                      >
                        {entityConfig[type].label}s
                      </span>
                      <span className="text-[10px] text-[#CCC]">
                        {items.length}
                      </span>
                    </div>
                    {items.map((item) => {
                      const idx = flatResults.indexOf(item);
                      return (
                        <button
                          key={item.id}
                          onClick={() => navigateTo(item)}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                            idx === selectedIndex
                              ? "bg-[#F7F7F5]"
                              : "hover:bg-[#FBFBFA]"
                          }`}
                        >
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{
                              backgroundColor: entityConfig[item.type].bgColor,
                            }}
                          >
                            <EntityIcon type={item.type} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] text-[#1A1A1A] font-medium truncate">
                              <HighlightText text={item.title} query={query} />
                            </div>
                            {item.subtitle && (
                              <div className="text-[11px] text-[#999] truncate">
                                <HighlightText
                                  text={item.subtitle}
                                  query={query}
                                />
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {item.status && <StatusBadge status={item.status} />}
                            {item.amount !== undefined && (
                              <span className="text-[11px] text-[#666] font-medium tabular-nums">
                                {item.amount.toLocaleString("fr-FR")} &euro;
                              </span>
                            )}
                            {item.date && (
                              <span className="text-[10px] text-[#BBB]">
                                {item.date}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })}

            {/* Empty state */}
            {showEmpty && (
              <div className="px-4 py-8 text-center">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#DDD"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mx-auto mb-2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <p className="text-[13px] text-[#999]">
                  Aucun resultat pour &laquo;{" "}
                  <span className="font-medium text-[#666]">{query}</span>{" "}
                  &raquo;
                </p>
                <p className="text-[11px] text-[#CCC] mt-1">
                  Essayez un autre terme de recherche
                </p>
              </div>
            )}

            {/* Footer hint */}
            {(showResults || showQuickAccess) && !isLoading && (
              <div className="px-4 py-2 border-t border-[#EFEFEF] flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <kbd className="text-[9px] text-[#BBB] bg-[#F7F7F5] border border-[#E6E6E4] rounded px-1 py-0.5 font-mono">
                    &uarr;
                  </kbd>
                  <kbd className="text-[9px] text-[#BBB] bg-[#F7F7F5] border border-[#E6E6E4] rounded px-1 py-0.5 font-mono">
                    &darr;
                  </kbd>
                  <span className="text-[10px] text-[#CCC] ml-0.5">
                    naviguer
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="text-[9px] text-[#BBB] bg-[#F7F7F5] border border-[#E6E6E4] rounded px-1 py-0.5 font-mono">
                    &crarr;
                  </kbd>
                  <span className="text-[10px] text-[#CCC] ml-0.5">
                    ouvrir
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="text-[9px] text-[#BBB] bg-[#F7F7F5] border border-[#E6E6E4] rounded px-1 py-0.5 font-mono">
                    esc
                  </kbd>
                  <span className="text-[10px] text-[#CCC] ml-0.5">
                    fermer
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
