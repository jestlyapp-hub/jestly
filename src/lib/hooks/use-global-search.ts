"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  searchPages,
  parseSearchQuery,
  type SearchResult,
  type EntityType,
} from "@/lib/search-utils";

interface UseGlobalSearchOptions {
  debounceMs?: number;
  limit?: number;
}

interface UseGlobalSearchReturn {
  query: string;
  setQuery: (q: string) => void;
  results: SearchResult[];
  topResult: SearchResult | null;
  groupedResults: Record<string, SearchResult[]>;
  isLoading: boolean;
  error: string | null;
  resultCount: number;
  entityFilter: EntityType | undefined;
  /** Log a search click for analytics */
  logClick: (result: SearchResult, position: number) => void;
}

export function useGlobalSearch(
  opts: UseGlobalSearchOptions = {}
): UseGlobalSearchReturn {
  const { debounceMs = 200, limit = 25 } = opts;

  const [query, setQueryRaw] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entityFilter, setEntityFilter] = useState<EntityType | undefined>();

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const startTimeRef = useRef<number>(0);

  const setQuery = useCallback((q: string) => {
    setQueryRaw(q);
  }, []);

  // Search effect
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query || query.length < 2) {
      setResults([]);
      setIsLoading(false);
      setError(null);
      setEntityFilter(undefined);
      return;
    }

    // Parse query for entity filter
    const parsed = parseSearchQuery(query);
    setEntityFilter(parsed.entityFilter);

    setIsLoading(true);
    setError(null);

    debounceRef.current = setTimeout(async () => {
      // Abort previous
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      startTimeRef.current = performance.now();

      try {
        // Build URL with entity filter
        let url = `/api/search?q=${encodeURIComponent(query)}&limit=${limit}`;
        if (parsed.entityFilter) {
          url += `&type=${parsed.entityFilter}`;
        }

        const res = await fetch(url, { signal: controller.signal });

        if (!res.ok) {
          throw new Error(`Search failed: ${res.status}`);
        }

        const data = await res.json();

        if (!controller.signal.aborted) {
          // Merge page results at the top
          const pageResults = searchPages(query).slice(0, 3);
          const apiResults: SearchResult[] = data.results || [];
          const combined = [...pageResults, ...apiResults];

          setResults(combined);
          setIsLoading(false);

          // Log search for analytics (fire & forget)
          const duration = Math.round(performance.now() - startTimeRef.current);
          logSearch(query, combined.length, duration);
        }
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        if (!controller.signal.aborted) {
          setError("Erreur de recherche");
          setResults([]);
          setIsLoading(false);
        }
      }
    }, debounceMs);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, debounceMs, limit]);

  // Derive top result
  const topResult = results.length > 0 && results[0].score && results[0].score > 20
    ? results[0]
    : null;

  // Group results by type
  const groupedResults = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    if (!acc[r.type]) acc[r.type] = [];
    acc[r.type].push(r);
    return acc;
  }, {});

  // Log click for analytics
  const logClick = useCallback(
    (result: SearchResult, position: number) => {
      try {
        fetch("/api/search/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query,
            clicked_id: result.id,
            clicked_type: result.type,
            clicked_position: position,
          }),
        }).catch(() => {});
      } catch {
        // Silently fail
      }
    },
    [query]
  );

  return {
    query,
    setQuery,
    results,
    topResult,
    groupedResults,
    isLoading,
    error,
    resultCount: results.length,
    entityFilter,
    logClick,
  };
}

/* ─── Fire-and-forget search log ─── */
function logSearch(query: string, resultCount: number, durationMs: number) {
  try {
    fetch("/api/search/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, result_count: resultCount, duration_ms: durationMs }),
    }).catch(() => {});
  } catch {
    // Silently fail
  }
}
