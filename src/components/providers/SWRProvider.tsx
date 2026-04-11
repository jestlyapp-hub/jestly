"use client";

import { SWRConfig } from "swr";
import type { ReactNode } from "react";

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
 * Provider SWR global — cache intelligent pour navigation instantanée.
 *
 * - dedupingInterval: 10s → évite les refetch identiques
 * - revalidateOnFocus: false → pas de refetch quand on revient sur l'onglet
 * - revalidateOnReconnect: true → refetch après perte réseau
 * - keepPreviousData: true → affiche les données stale pendant le refetch
 * - focusThrottleInterval: 30s → throttle les refetch focus
 */
export default function SWRProvider({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        dedupingInterval: 10_000,
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        keepPreviousData: true,
        focusThrottleInterval: 30_000,
        errorRetryCount: 2,
        onErrorRetry: (error, _key, _config, revalidate, { retryCount }) => {
          if (retryCount >= 2) return;
          if (error?.status >= 400 && error?.status < 500) return;
          setTimeout(() => revalidate({ retryCount }), 3000);
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}
