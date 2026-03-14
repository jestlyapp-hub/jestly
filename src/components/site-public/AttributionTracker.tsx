"use client";

import { useEffect, useRef } from "react";
import { recordTouch, captureTouches } from "@/lib/attribution";

/**
 * Invisible component that captures attribution data (UTM params, referrer,
 * click IDs) and records a "page_view" touch on mount.
 * Drop alongside SiteAnalyticsTracker in any public page layout.
 *
 * - Reads attribution from window.location (no props needed)
 * - Fires only once per page load (useRef guard for React strict mode)
 * - Renders nothing
 */
export default function AttributionTracker() {
  const hasFired = useRef(false);

  useEffect(() => {
    if (hasFired.current) return;
    hasFired.current = true;

    // Capture first/last touch in localStorage
    captureTouches();

    // Record a pageview touch (fire-and-forget POST)
    recordTouch("pageview");
  }, []);

  return null;
}
