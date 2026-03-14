import { getAttributionForLead } from "./attribution";

/**
 * Shared lead capture context passed to form blocks in public site rendering.
 * When present, form blocks become functional and submit to /api/public/leads.
 */
export interface LeadCaptureContext {
  siteId: string;
  pagePath: string;
  blockType: string;
}

/**
 * Submit a lead to the unified ingestion pipeline.
 * Automatically includes UTM/referrer/anonymous_id attribution fields.
 */
export async function submitLead(
  ctx: LeadCaptureContext,
  data: {
    email: string;
    name?: string;
    phone?: string;
    company?: string;
    message?: string;
    fields?: Record<string, string | number | boolean | null>;
    source: string;
  }
): Promise<{ ok: boolean; id?: string; error?: string }> {
  try {
    // Gather attribution data from client-side storage & current URL
    const attribution = getAttributionForLead();

    const res = await fetch("/api/public/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        site_id: ctx.siteId,
        page_path: ctx.pagePath,
        block_type: ctx.blockType,
        source: data.source,
        email: data.email,
        name: data.name || null,
        phone: data.phone || null,
        company: data.company || null,
        message: data.message || null,
        fields: data.fields || {},
        // Attribution fields
        utm_source: attribution.utm_source,
        utm_medium: attribution.utm_medium,
        utm_campaign: attribution.utm_campaign,
        utm_content: attribution.utm_content,
        utm_term: attribution.utm_term,
        referrer: attribution.referrer,
        anonymous_id: attribution.anonymous_id,
        first_touch_source: attribution.first_touch_source,
        last_touch_source: attribution.last_touch_source,
      }),
    });
    const json = await res.json();
    if (!res.ok) return { ok: false, error: json.error || "Erreur serveur" };
    return { ok: true, id: json.id };
  } catch {
    return { ok: false, error: "Erreur réseau" };
  }
}
