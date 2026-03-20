import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

/* eslint-disable @typescript-eslint/no-explicit-any */

const checkLimit = rateLimit("public-leads", 10);

// ── Auto-migration: ensure leads table has columns from migration 025 ──
let migrationDone = false;
async function ensureLeadsColumns(): Promise<boolean> {
  if (migrationDone) return true;
  const dbPassword = process.env.DATABASE_PASSWORD;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!dbPassword || !supabaseUrl) return false;
  const ref = new URL(supabaseUrl).hostname.split(".")[0];
  try {
    const postgres = (await import("postgres")).default;
    const sql = postgres({ host: `db.${ref}.supabase.co`, port: 5432, database: "postgres", username: "postgres", password: dbPassword, ssl: "require", connect_timeout: 15, idle_timeout: 5, max: 1 });
    try {
      await sql`ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS company TEXT`;
      await sql`ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'new'`;
      await sql`ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS page_path TEXT`;
      await sql`ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS block_type TEXT`;
      await sql`ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS block_label TEXT`;
      await sql`ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS utm_source TEXT`;
      await sql`ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS utm_medium TEXT`;
      await sql`ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS utm_campaign TEXT`;
      await sql`ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS referrer TEXT`;
      await sql`ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS product_name TEXT`;
      await sql`ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS amount NUMERIC`;
      await sql`ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS notes TEXT`;
      await sql`CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads(source)`;
      await sql`NOTIFY pgrst, 'reload schema'`;
      console.log("[LEADS] ✅ Auto-migration: leads columns ensured");
      migrationDone = true;
      return true;
    } finally { await sql.end(); }
  } catch (e) {
    console.error("[LEADS] Auto-migration failed:", e instanceof Error ? e.message : e);
    migrationDone = true;
    return false;
  }
}

// POST /api/public/leads — unified lead ingestion endpoint
// Accepts leads from all site surfaces: forms, newsletter, checkout, quote requests, etc.
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (!checkLimit(ip)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

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

  // ── Build enriched fields object (stores everything safely in JSONB) ──
  const enrichedFields: Record<string, unknown> = { ...(fields || {}) };
  if (page_path) enrichedFields._page_path = page_path;
  if (block_type) enrichedFields._block_type = block_type;
  if (block_label) enrichedFields._block_label = block_label;
  if (company) enrichedFields._company = company;
  if (utm_source) enrichedFields._utm_source = utm_source;
  if (utm_medium) enrichedFields._utm_medium = utm_medium;
  if (utm_campaign) enrichedFields._utm_campaign = utm_campaign;
  if (utm_content) enrichedFields._utm_content = utm_content;
  if (utm_term) enrichedFields._utm_term = utm_term;
  if (referrer) enrichedFields._referrer = referrer;
  if (anonymous_id) enrichedFields._anonymous_id = anonymous_id;
  if (first_touch_source) enrichedFields._first_touch_source = first_touch_source;
  if (last_touch_source) enrichedFields._last_touch_source = last_touch_source;
  if (product_name) enrichedFields._product_name = product_name;
  if (amount != null && amount !== 0) enrichedFields._amount = amount;


  // Full lead row with all columns
  const fullRow: Record<string, unknown> = {
    site_id,
    email,
    name: name || null,
    phone: phone || null,
    company: company || null,
    source: source || "contact-form",
    status: "new",
    message: message || null,
    fields: enrichedFields,
    page_path: page_path || null,
    block_type: block_type || null,
    block_label: block_label || null,
    utm_source: utm_source || null,
    utm_medium: utm_medium || null,
    utm_campaign: utm_campaign || null,
    referrer: referrer || null,
    product_name: product_name || null,
    amount: amount ?? null,
  };

  // Try insert
  let { data: leadData, error: leadErr } = await (supabase.from("leads") as any)
    .insert(fullRow).select().single();

  // If trigger/column error → auto-migrate and retry
  if (leadErr && (leadErr.code === "42703" || leadErr.message?.includes("schema cache") || leadErr.message?.includes("has no field"))) {
    console.warn("[LEADS] Column missing, running auto-migration...", leadErr.message);
    const migrated = await ensureLeadsColumns();
    if (migrated) {
      // Wait for PostgREST schema cache reload
      await new Promise(r => setTimeout(r, 2000));
      const retry = await (supabase.from("leads") as any).insert(fullRow).select().single();
      leadData = retry.data;
      leadErr = retry.error;
      if (leadErr) {
        // Last resort: try without PostgREST (direct insert without .select)
        console.warn("[LEADS] Retry still failed, trying without select...", leadErr.message);
        const { error: lastErr } = await (supabase.from("leads") as any).insert(fullRow);
        if (!lastErr) {
          return NextResponse.json({ ok: true, id: null, order_id: null });
        }
        leadErr = lastErr;
      }
    }
  }

  if (leadErr) {
    console.error("[LEADS] ❌ Insert failed:", leadErr.message, leadErr.code);
    return NextResponse.json({ error: "Erreur lors de l'enregistrement" }, { status: 500 });
  }

  console.log("[LEADS] ✅ Lead created:", leadData?.id);

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
