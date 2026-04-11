"use client";

import useSWR, { type KeyedMutator } from "swr";
import { useCallback, useRef, type Dispatch, type SetStateAction } from "react";

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  /** true when a fetch is in progress (initial or revalidation) */
  validating: boolean;
  error: string | null;
  /** Refetch from server (silent — keeps existing data visible, no loading flash) */
  mutate: () => Promise<void>;
  /** Directly update the cache (for optimistic updates). Accepts value or updater fn. */
  setData: Dispatch<SetStateAction<T | null>>;
}

// Fetcher global défini dans SWRProvider — fallback local pour usage hors provider
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err: Error & { status?: number } = new Error(body.error || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
};

/**
 * Data-fetching hook backed by SWR for caching, deduplication, and stale-while-revalidate.
 *
 * Drop-in replacement for the previous hand-rolled hook — same public API:
 * - `data`: fetched payload (or fallback / null).
 * - `loading`: true ONLY on initial fetch (before first data arrives).
 * - `error`: string message on failure (null otherwise).
 * - `mutate()`: silently refetch — keeps existing data visible, no loading flash.
 * - `setData(value | updaterFn)`: optimistic cache update, same Dispatch<SetStateAction> signature.
 *
 * SWR guarantees:
 * - Request deduplication (5 s window — multiple components sharing the same URL won't double-fetch).
 * - Stale-while-revalidate caching across navigations.
 * - No auto-revalidation on window focus (opt-out to match previous behaviour).
 */
export function useApi<T>(url: string | null, fallback?: T): UseApiResult<T> {
  // Store fallback in ref so it never triggers SWR key changes
  const fallbackRef = useRef(fallback);
  fallbackRef.current = fallback;

  const {
    data: swrData,
    error: swrError,
    isLoading,
    isValidating,
    mutate: swrMutate,
  } = useSWR<T>(
    url, // null key → SWR won't fetch (same as previous url guard)
    fetcher,
    {
      fallbackData: fallback as T | undefined,
      // Le reste hérite du SWRProvider global (dedupingInterval, keepPreviousData, etc.)
    },
  );

  // ── Derived state matching the previous API ──

  const data: T | null = swrData ?? (fallback as T) ?? null;
  const loading = isLoading && data === null;
  const error: string | null = swrError
    ? (swrError instanceof Error ? swrError.message : "Erreur")
    : null;

  // ── mutate() → silent refetch (no loading flash, keeps stale data visible) ──

  const mutate = useCallback(async () => {
    // revalidate: true → refetch from server; populateCache not needed (SWR handles it)
    await swrMutate();
  }, [swrMutate]);

  // ── setData() → optimistic cache update with Dispatch<SetStateAction<T | null>> signature ──
  // Supports both direct value and updater fn: setData(newVal) or setData(prev => ...)

  const setData: Dispatch<SetStateAction<T | null>> = useCallback(
    (valueOrUpdater) => {
      if (typeof valueOrUpdater === "function") {
        const updater = valueOrUpdater as (prev: T | null) => T | null;
        swrMutate(
          (current) => {
            const result = updater(current ?? null);
            return result as T | undefined;
          },
          { revalidate: false },
        );
      } else {
        swrMutate(valueOrUpdater as T | undefined, { revalidate: false });
      }
    },
    [swrMutate],
  );

  return { data, loading, validating: isValidating, error, mutate, setData };
}

/**
 * Helper to perform a mutation (POST/PATCH/DELETE) and return the parsed result.
 * Throws on non-2xx with the server's error message.
 */
export async function apiFetch<T = unknown>(
  url: string,
  options: { method?: string; body?: unknown } = {}
): Promise<T> {
  const method = options.method || (options.body ? "POST" : "GET");
  const headers: Record<string, string> = {};
  if (options.body) headers["Content-Type"] = "application/json";
  const res = await fetch(url, {
    method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = body.error || `HTTP ${res.status}`;
    if (process.env.NODE_ENV === "development") {
      console.error(`[apiFetch] ${method} ${url} → ${res.status}`, body);
    }
    throw new Error(msg);
  }

  return res.json();
}
