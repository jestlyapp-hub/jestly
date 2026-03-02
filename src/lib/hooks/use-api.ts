"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  mutate: () => void;
}

/**
 * Lightweight data fetching hook (no SWR/React Query dependency).
 * Fetches on mount and provides a mutate function to refetch.
 * When the API is unavailable (401/403/404/500), silently returns null
 * so pages can fallback to mock data during development.
 */
export function useApi<T>(url: string | null, fallback?: T): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    if (!url) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(url);
      if (!res.ok) {
        // Silently swallow auth/server errors — pages fallback to mock data
        if (fallback !== undefined && mountedRef.current) {
          setData(fallback);
        }
        return;
      }
      const json = await res.json();
      if (mountedRef.current) {
        setData(json);
      }
    } catch {
      // Network error or fetch failure — use fallback if available
      if (fallback !== undefined && mountedRef.current) {
        setData(fallback);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [url, fallback]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    return () => { mountedRef.current = false; };
  }, [fetchData]);

  return { data, loading, error, mutate: fetchData };
}

/**
 * Helper to perform a mutation (POST/PATCH/DELETE) and return the result.
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
