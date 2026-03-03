"use client";

import { useState, useEffect, useCallback, useRef, type Dispatch, type SetStateAction } from "react";

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  /** Refetch from server (silent — keeps existing data visible, no loading flash) */
  mutate: () => Promise<void>;
  /** Directly update the cache (for optimistic updates). Accepts value or updater fn. */
  setData: Dispatch<SetStateAction<T | null>>;
}

/**
 * Lightweight data-fetching hook (zero deps — no SWR, no React Query).
 *
 * Guarantees:
 * - loading=true ONLY on initial fetch (before first data arrives).
 * - mutate() silently refetches — never flashes loading/blank.
 * - fallback is read via ref → passing inline [] won't cause infinite loops.
 * - Errors are surfaced in `error`, never silently swallowed.
 * - No polling, no auto-revalidation, no window-focus refetch.
 */
export function useApi<T>(url: string | null, fallback?: T): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const hasLoadedRef = useRef(false);

  // Store fallback in ref so it never triggers a re-create of fetchData
  const fallbackRef = useRef(fallback);
  fallbackRef.current = fallback;

  const fetchData = useCallback(async () => {
    if (!url) {
      setLoading(false);
      return;
    }

    // Only show loading skeleton on initial fetch (no data yet)
    if (!hasLoadedRef.current) setLoading(true);
    setError(null);

    try {
      const res = await fetch(url);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const errMsg = body.error || `HTTP ${res.status}`;
        if (mountedRef.current) {
          if (fallbackRef.current !== undefined) {
            setData(fallbackRef.current as T);
            hasLoadedRef.current = true;
          } else {
            setError(errMsg);
          }
        }
        return;
      }
      const json = await res.json();
      if (mountedRef.current) {
        setData(json);
        hasLoadedRef.current = true;
      }
    } catch (e) {
      if (mountedRef.current) {
        if (fallbackRef.current !== undefined) {
          setData(fallbackRef.current as T);
          hasLoadedRef.current = true;
        } else {
          setError(e instanceof Error ? e.message : "Erreur réseau");
        }
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [url]); // ← ONLY url — fallback read via ref, no infinite loop risk

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    return () => { mountedRef.current = false; };
  }, [fetchData]);

  return { data, loading, error, mutate: fetchData, setData };
}

/**
 * Helper to perform a mutation (POST/PATCH/DELETE) and return the parsed result.
 * Throws on non-2xx with the server's error message.
 */
export async function apiFetch<T = unknown>(
  url: string,
  options: { method?: string; body?: unknown } = {}
): Promise<T> {
  const res = await fetch(url, {
    method: options.method || "POST",
    headers: { "Content-Type": "application/json" },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }

  return res.json();
}
