import type { AnalyticsEventType } from "@/types";

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
