"use client";

import { useEffect } from "react";
import { trackPageView } from "@/lib/analytics";

interface SiteAnalyticsTrackerProps {
  siteId: string;
  pageSlug: string;
}

/**
 * Invisible component that fires a page_view event once on mount.
 * Drop into any public page layout to enable analytics.
 */
export default function SiteAnalyticsTracker({ siteId, pageSlug }: SiteAnalyticsTrackerProps) {
  useEffect(() => {
    trackPageView(siteId, pageSlug);
  }, [siteId, pageSlug]);

  return null;
}
