import type { AnalyticsEventType } from "@/types";
import { mockAnalyticsEvents } from "@/lib/mock-data";

/**
 * Client-side analytics tracker for public sites.
 * Sends events to /api/public/analytics via beacon (non-blocking).
 * Falls back to fetch if sendBeacon is unavailable.
 */
export function trackEvent(
  type: AnalyticsEventType,
  data?: Record<string, string>,
  siteId?: string,
) {
  const payload = {
    site_id: siteId ?? "unknown",
    type,
    page: typeof window !== "undefined" ? window.location.pathname : undefined,
    data: data ?? {},
  };

  if (process.env.NODE_ENV === "development") {
    console.log("[Analytics]", type, payload);
  }

  // Fire-and-forget: use sendBeacon for reliability, fallback to fetch
  const body = JSON.stringify(payload);
  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    navigator.sendBeacon("/api/public/analytics", new Blob([body], { type: "application/json" }));
  } else if (typeof fetch !== "undefined") {
    fetch("/api/public/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  }
}

/**
 * Track a page view — called once per page load on public sites.
 */
export function trackPageView(siteId: string, pageSlug?: string) {
  trackEvent("page_view", { page_slug: pageSlug ?? "/" }, siteId);
}

/**
 * Track a CTA click — called when user clicks a button/link on public site.
 */
export function trackCtaClick(siteId: string, label: string, blockId?: string) {
  trackEvent("click_cta", { label, block_id: blockId ?? "" }, siteId);
}

/**
 * Track a form submission — called on contact/newsletter/lead forms.
 */
export function trackFormSubmit(siteId: string, formType: string) {
  trackEvent("form_submit", { form_type: formType }, siteId);
}

/**
 * Track order start — when user opens the order page.
 */
export function trackOrderStart(siteId: string, productSlug: string) {
  trackEvent("order_start", { product_slug: productSlug }, siteId);
}

// ═══════════════════════════════════════════════
// Server-side summary (for dashboard, uses mock for now)
// ═══════════════════════════════════════════════

export function getAnalyticsSummary() {
  const events = mockAnalyticsEvents;

  const totalViews = events.filter((e) => e.type === "page_view").length;
  const totalConversions = events.filter((e) => e.type === "order_complete").length;

  // Top pages by view count
  const pageCounts: Record<string, number> = {};
  for (const e of events) {
    if (e.page) {
      pageCounts[e.page] = (pageCounts[e.page] || 0) + 1;
    }
  }
  const topPages = Object.entries(pageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([page, count]) => ({ page, count }));

  const recentEvents = events.slice(-5).reverse();

  return { totalViews, totalConversions, topPages, recentEvents };
}
