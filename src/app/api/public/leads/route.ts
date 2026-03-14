import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/* eslint-disable @typescript-eslint/no-explicit-any */

// POST /api/public/leads — unified lead ingestion endpoint
// Accepts leads from all site surfaces: forms, newsletter, checkout, quote requests, etc.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    site_id, name, email, phone, company, source, message, fields,
    page_path, block_type, block_label,
    utm_source, utm_medium, utm_campaign, utm_content, utm_term,
    referrer, anonymous_id, first_touch_source, last_touch_source,
    product_name, amount,
    create_order, field_mappings,
  } = body as {
    site_id?: string;
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    source?: string;
    message?: string;
    fields?: Record<string, string | number | boolean | null>;
    page_path?: string;
    block_type?: string;
    block_label?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
    referrer?: string;
    anonymous_id?: string;
    first_touch_source?: string;
    last_touch_source?: string;
    product_name?: string;
    amount?: number;
    create_order?: boolean;
    field_mappings?: Record<string, string>;
  };

  if (!site_id || !email) {
    return NextResponse.json({ error: "site_id and email are required" }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const supabase = await createClient();

  // Build lead row with all enrichment fields
  const leadRow: Record<string, unknown> = {
    site_id,
    email,
    name: name || null,
    phone: phone || null,
    company: company || null,
    source: source || "contact-form",
    status: "new",
    message: message || null,
    fields: fields || {},
    page_path: page_path || null,
    block_type: block_type || null,
    block_label: block_label || null,
    utm_source: utm_source || null,
    utm_medium: utm_medium || null,
    utm_campaign: utm_campaign || null,
    utm_content: utm_content || null,
    utm_term: utm_term || null,
    referrer: referrer || null,
    anonymous_id: anonymous_id || null,
    first_touch_source: first_touch_source || null,
    last_touch_source: last_touch_source || null,
    product_name: product_name || null,
    amount: amount ?? null,
  };

  const { data: leadData, error: leadErr } = await (supabase.from("leads") as any)
    .insert(leadRow)
    .select()
    .single();

  if (leadErr) {
    return NextResponse.json({ error: leadErr.message }, { status: 500 });
  }

  // Link any existing attribution touches with same anonymous_id to this lead
  if (anonymous_id) {
    await (supabase.from("lead_attribution_touches") as any)
      .update({ lead_id: leadData.id })
      .eq("anonymous_id", anonymous_id)
      .is("lead_id", null);
  }

  // If createOrder mode: also create client + order via fn_upsert_client + order insert
  let orderId: string | null = null;
  if (create_order) {
    const { data: site } = await (supabase.from("sites") as any)
      .select("owner_id")
      .eq("id", site_id)
      .single();

    if (site?.owner_id) {
      const ownerId = site.owner_id;

      const { data: clientResult } = await (supabase as any).rpc("fn_upsert_client", {
        p_user_id: ownerId,
        p_name: name || "Inconnu",
        p_email: email,
        p_phone: phone || null,
      });

      const clientId = clientResult;

      if (clientId) {
        const orderData: Record<string, unknown> = {
          user_id: ownerId,
          client_id: clientId,
          title: `Demande via formulaire`,
          description: message || null,
          amount: 0,
          status: "new",
          priority: "normal",
          paid: false,
        };

        if (field_mappings && fields) {
          for (const [label, mapTo] of Object.entries(field_mappings)) {
            const val = fields[label];
            if (val === undefined || val === null || val === "") continue;
            if (mapTo === "briefing") orderData.briefing = String(val);
            else if (mapTo === "deadline") orderData.deadline = String(val);
            else if (mapTo === "category") orderData.category = String(val);
            else if (mapTo === "notes") orderData.notes = String(val);
            else if (mapTo === "resources") {
              const url = String(val);
              if (url.startsWith("http")) {
                orderData.resources = JSON.stringify([{ id: crypto.randomUUID(), type: "url", label: label, url }]);
              }
            }
          }
        }

        const { data: orderRow, error: orderErr } = await (supabase.from("orders") as any)
          .insert(orderData)
          .select("id")
          .single();

        if (!orderErr && orderRow) {
          orderId = orderRow.id;
        }
      }
    }
  }

  return NextResponse.json({ ok: true, id: leadData.id, order_id: orderId });
}
