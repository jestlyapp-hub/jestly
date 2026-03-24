import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ---------------------------------------------------------------------------
// Simple in-memory rate limiter (per IP, max 100 touches/minute)
// ---------------------------------------------------------------------------

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }

  entry.count += 1;
  return entry.count > 100;
}

// Cleanup stale entries every 5 minutes to avoid memory leak
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now > entry.resetAt) rateLimitMap.delete(ip);
  }
}, 5 * 60_000);

// ---------------------------------------------------------------------------
// Valid touch types
// ---------------------------------------------------------------------------

const VALID_TOUCH_TYPES = new Set([
  "pageview",
  "form_view",
  "cta_click",
  "form_submit",
  "checkout_start",
  "other",
]);

// ---------------------------------------------------------------------------
// POST /api/public/attribution — record an attribution touch
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  // Rate limit by IP
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Trop de requêtes, veuillez réessayer plus tard" },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    utm_term,
    referrer,
    landing_path,
    gclid,
    fbclid,
    ttclid,
    anonymous_id,
    session_id,
    device_type,
    browser,
    touch_type,
    lead_id,
  } = body as {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
    referrer?: string;
    landing_path?: string;
    gclid?: string;
    fbclid?: string;
    ttclid?: string;
    anonymous_id?: string;
    session_id?: string;
    device_type?: string;
    browser?: string;
    touch_type?: string;
    lead_id?: string;
  };

  // Validate required fields
  if (!anonymous_id) {
    return NextResponse.json(
      { error: "anonymous_id est requis" },
      { status: 400 }
    );
  }

  if (!touch_type || !VALID_TOUCH_TYPES.has(touch_type)) {
    return NextResponse.json(
      { error: "touch_type must be one of: pageview, form_view, cta_click, form_submit, checkout_start, other" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  // ---------------------------------------------------------------------------
  // Resolve campaign_id from utm_campaign slug (best-effort)
  // ---------------------------------------------------------------------------

  let campaign_id: string | null = null;
  if (utm_campaign) {
    const { data: campaign } = await (supabase.from("campaigns") as any)
      .select("id")
      .eq("slug", utm_campaign)
      .maybeSingle();

    if (campaign?.id) {
      campaign_id = campaign.id;
    }
  }

  // ---------------------------------------------------------------------------
  // Resolve or upsert landing_page_id (best-effort)
  // ---------------------------------------------------------------------------

  let landing_page_id: string | null = null;
  if (landing_path) {
    // Try to find existing landing page
    const { data: existingPage } = await (supabase.from("landing_pages") as any)
      .select("id")
      .eq("page_path", landing_path)
      .maybeSingle();

    if (existingPage?.id) {
      landing_page_id = existingPage.id;
    } else {
      // Insert if not found
      const { data: newPage } = await (supabase.from("landing_pages") as any)
        .insert({ page_path: landing_path })
        .select("id")
        .single();

      if (newPage?.id) {
        landing_page_id = newPage.id;
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Insert the attribution touch
  // ---------------------------------------------------------------------------

  const touchRow: Record<string, unknown> = {
    anonymous_id,
    session_id: session_id || null,
    touch_type,
    utm_source: utm_source || null,
    utm_medium: utm_medium || null,
    utm_campaign: utm_campaign || null,
    utm_content: utm_content || null,
    utm_term: utm_term || null,
    referrer: referrer || null,
    gclid: gclid || null,
    fbclid: fbclid || null,
    ttclid: ttclid || null,
    landing_path: landing_path || null,
    device_type: device_type || null,
    browser: browser || null,
    campaign_id,
    landing_page_id,
    lead_id: lead_id || null,
    ip_hash: ip !== "unknown" ? ip : null,
  };

  const { error: insertErr } = await (supabase.from("lead_attribution_touches") as any)
    .insert(touchRow);

  if (insertErr) {
    console.error("[attribution] insert error:", insertErr.message);
    return NextResponse.json({ error: "Failed to record touch" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
