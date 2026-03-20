"use client";

import { useCallback } from "react";
import { usePathname } from "next/navigation";

/**
 * Hook léger de product analytics.
 * Envoie un événement à /api/analytics/track en fire-and-forget (pas de blocage UI).
 *
 * Usage :
 *   const track = useTrack();
 *   track("order_created", { amount: 150 });
 */
export function useTrack() {
  const pathname = usePathname();

  const track = useCallback(
    (eventName: string, properties?: Record<string, unknown>) => {
      // Fire and forget — ne bloque jamais l'UI
      fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: eventName, properties, page: pathname }),
      }).catch(() => {}); // Silent fail
    },
    [pathname],
  );

  return track;
}
