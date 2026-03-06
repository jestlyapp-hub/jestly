import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/* eslint-disable @typescript-eslint/no-explicit-any */

// POST /api/public/leads — submit a lead from a public site form
// Also supports createOrder mode: creates client + order + maps fields
export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    site_id, name, email, phone, source, message, fields,
    create_order, field_mappings,
  } = body as {
    site_id?: string;
    name?: string;
    email?: string;
    phone?: string;
    source?: string;
    message?: string;
    fields?: Record<string, string | number | boolean | null>;
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

  // Always create the lead
  const { data: leadData, error: leadErr } = await (supabase.from("leads") as any)
    .insert({
      site_id,
      email,
      name: name || null,
      phone: phone || null,
      source: source || "contact-form",
      message: message || null,
      fields: fields || {},
    })
    .select()
    .single();

  if (leadErr) {
    return NextResponse.json({ error: leadErr.message }, { status: 500 });
  }

  // If createOrder mode: also create client + order via fn_upsert_client + order insert
  let orderId: string | null = null;
  if (create_order) {
    // Find site owner to create order under their account
    const { data: site } = await (supabase.from("sites") as any)
      .select("owner_id")
      .eq("id", site_id)
      .single();

    if (site?.owner_id) {
      const ownerId = site.owner_id;

      // Upsert client
      const { data: clientResult } = await (supabase as any).rpc("fn_upsert_client", {
        p_user_id: ownerId,
        p_name: name || "Inconnu",
        p_email: email,
        p_phone: phone || null,
      });

      const clientId = clientResult;

      if (clientId) {
        // Build order fields from mappings
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

        // Apply field mappings: briefing, deadline, category, notes, resources
        if (field_mappings && fields) {
          for (const [label, mapTo] of Object.entries(field_mappings)) {
            const val = fields[label];
            if (val === undefined || val === null || val === "") continue;
            if (mapTo === "briefing") orderData.briefing = String(val);
            else if (mapTo === "deadline") orderData.deadline = String(val);
            else if (mapTo === "category") orderData.category = String(val);
            else if (mapTo === "notes") orderData.notes = String(val);
            else if (mapTo === "resources") {
              // Store as resource item
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
