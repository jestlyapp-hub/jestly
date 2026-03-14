/**
 * Client-side attribution capture library.
 * Reads UTM params, referrer, click IDs, and manages first/last touch storage.
 * Only runs client-side — all functions are safe to call from SSR (they return defaults).
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AttributionData {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  referrer: string | null;
  gclid: string | null;
  fbclid: string | null;
  ttclid: string | null;
  landing_path: string;
  anonymous_id: string;
  session_id: string;
  device_type: string;
  browser: string;
}

export interface TouchData {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  referrer: string | null;
  gclid: string | null;
  fbclid: string | null;
  ttclid: string | null;
  landing_path: string;
  timestamp: string;
}

export interface LeadAttributionFields {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  referrer: string | null;
  anonymous_id: string;
  first_touch_source: string | null;
  last_touch_source: string | null;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ANON_ID_KEY = "jestly_anon_id";
const FIRST_TOUCH_KEY = "jestly_first_touch";
const LAST_TOUCH_KEY = "jestly_last_touch";
const SESSION_ID_KEY = "jestly_session_id";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function getParam(key: string): string | null {
  if (!isBrowser()) return null;
  const url = new URL(window.location.href);
  return url.searchParams.get(key) || null;
}

function detectDeviceType(): string {
  if (!isBrowser()) return "desktop";
  const ua = navigator.userAgent.toLowerCase();
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "tablet";
  if (/mobile|iphone|ipod|android.*mobile|windows phone|blackberry/i.test(ua)) return "mobile";
  return "desktop";
}

function detectBrowser(): string {
  if (!isBrowser()) return "unknown";
  const ua = navigator.userAgent;
  if (ua.includes("Firefox/")) return "firefox";
  if (ua.includes("Edg/")) return "edge";
  if (ua.includes("OPR/") || ua.includes("Opera/")) return "opera";
  if (ua.includes("Chrome/") && !ua.includes("Edg/")) return "chrome";
  if (ua.includes("Safari/") && !ua.includes("Chrome/")) return "safari";
  return "other";
}

// ---------------------------------------------------------------------------
// ID management
// ---------------------------------------------------------------------------

function getOrCreateAnonymousId(): string {
  if (!isBrowser()) return "";
  let id = localStorage.getItem(ANON_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(ANON_ID_KEY, id);
  }
  return id;
}

function getOrCreateSessionId(): string {
  if (!isBrowser()) return "";
  let id = sessionStorage.getItem(SESSION_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_ID_KEY, id);
  }
  return id;
}

// ---------------------------------------------------------------------------
// Touch data helpers
// ---------------------------------------------------------------------------

function buildCurrentTouch(): TouchData {
  return {
    utm_source: getParam("utm_source"),
    utm_medium: getParam("utm_medium"),
    utm_campaign: getParam("utm_campaign"),
    utm_content: getParam("utm_content"),
    utm_term: getParam("utm_term"),
    referrer: (isBrowser() && document.referrer) ? document.referrer : null,
    gclid: getParam("gclid"),
    fbclid: getParam("fbclid"),
    ttclid: getParam("ttclid"),
    landing_path: isBrowser() ? window.location.pathname : "/",
    timestamp: new Date().toISOString(),
  };
}

/** Returns true if the touch has any meaningful attribution signal. */
function hasTouchSignal(touch: TouchData): boolean {
  return !!(
    touch.utm_source ||
    touch.utm_medium ||
    touch.utm_campaign ||
    touch.utm_content ||
    touch.utm_term ||
    touch.referrer ||
    touch.gclid ||
    touch.fbclid ||
    touch.ttclid
  );
}

// ---------------------------------------------------------------------------
// First / Last touch storage
// ---------------------------------------------------------------------------

/**
 * Capture first touch (set once, never overwritten) and last touch (updated
 * on every visit that carries UTM params or a referrer).
 * Call this on every page load / navigation.
 */
export function captureTouches(): void {
  if (!isBrowser()) return;

  const touch = buildCurrentTouch();

  // First touch: only set if not already stored
  if (!localStorage.getItem(FIRST_TOUCH_KEY) && hasTouchSignal(touch)) {
    localStorage.setItem(FIRST_TOUCH_KEY, JSON.stringify(touch));
  }

  // Last touch: update only when there is a real signal (skip direct visits with no params)
  if (hasTouchSignal(touch)) {
    localStorage.setItem(LAST_TOUCH_KEY, JSON.stringify(touch));
  }
}

export function getFirstTouch(): TouchData | null {
  if (!isBrowser()) return null;
  const raw = localStorage.getItem(FIRST_TOUCH_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TouchData;
  } catch {
    return null;
  }
}

export function getLastTouch(): TouchData | null {
  if (!isBrowser()) return null;
  const raw = localStorage.getItem(LAST_TOUCH_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TouchData;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// getAttribution — reads from current URL, not stored data
// ---------------------------------------------------------------------------

export function getAttribution(): AttributionData {
  return {
    utm_source: getParam("utm_source"),
    utm_medium: getParam("utm_medium"),
    utm_campaign: getParam("utm_campaign"),
    utm_content: getParam("utm_content"),
    utm_term: getParam("utm_term"),
    referrer: (isBrowser() && document.referrer) ? document.referrer : null,
    gclid: getParam("gclid"),
    fbclid: getParam("fbclid"),
    ttclid: getParam("ttclid"),
    landing_path: isBrowser() ? window.location.pathname : "/",
    anonymous_id: getOrCreateAnonymousId(),
    session_id: getOrCreateSessionId(),
    device_type: detectDeviceType(),
    browser: detectBrowser(),
  };
}

// ---------------------------------------------------------------------------
// getAttributionForLead — fields to include when creating a lead
// ---------------------------------------------------------------------------

export function getAttributionForLead(): LeadAttributionFields {
  const current = getAttribution();
  const first = getFirstTouch();
  const last = getLastTouch();

  return {
    utm_source: current.utm_source,
    utm_medium: current.utm_medium,
    utm_campaign: current.utm_campaign,
    utm_content: current.utm_content,
    utm_term: current.utm_term,
    referrer: current.referrer,
    anonymous_id: current.anonymous_id,
    first_touch_source: first?.utm_source || first?.referrer || null,
    last_touch_source: last?.utm_source || last?.referrer || null,
  };
}

// ---------------------------------------------------------------------------
// recordTouch — fire-and-forget POST to /api/public/attribution
// ---------------------------------------------------------------------------

export function recordTouch(
  touchType: "pageview" | "form_view" | "cta_click" | "form_submit" | "checkout_start" | "other",
  landingPath?: string
): void {
  if (!isBrowser()) return;

  const attr = getAttribution();
  const payload = JSON.stringify({
    utm_source: attr.utm_source,
    utm_medium: attr.utm_medium,
    utm_campaign: attr.utm_campaign,
    utm_content: attr.utm_content,
    utm_term: attr.utm_term,
    referrer: attr.referrer,
    gclid: attr.gclid,
    fbclid: attr.fbclid,
    ttclid: attr.ttclid,
    landing_path: landingPath || attr.landing_path,
    anonymous_id: attr.anonymous_id,
    session_id: attr.session_id,
    device_type: attr.device_type,
    browser: attr.browser,
    touch_type: touchType,
  });

  // Prefer sendBeacon for fire-and-forget (survives page unload)
  if (navigator.sendBeacon) {
    const blob = new Blob([payload], { type: "application/json" });
    navigator.sendBeacon("/api/public/attribution", blob);
  } else {
    fetch("/api/public/attribution", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {
      // Fire-and-forget: silently ignore errors
    });
  }
}
