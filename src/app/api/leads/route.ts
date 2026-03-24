import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ── Auto-migration: ensure leads columns from migration 025 exist ──
let leadsMigrationDone = false;
async function ensureLeadsColumns(): Promise<boolean> {
  if (leadsMigrationDone) return true;
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
      await sql`NOTIFY pgrst, 'reload schema'`;
      console.log("[LEADS] ✅ Auto-migration: leads columns ensured (PATCH route)");
      leadsMigrationDone = true;
      return true;
    } finally { await sql.end(); }
  } catch (e) {
    console.error("[LEADS] Auto-migration failed:", e instanceof Error ? e.message : e);
    leadsMigrationDone = true;
    return false;
  }
}

// GET /api/leads — list leads for the authenticated user's sites
export async function GET() {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const { data: sites } = await (supabase.from("sites") as any)
    .select("id")
    .eq("owner_id", user.id);

  if (!sites || sites.length === 0) {
    return NextResponse.json([]);
  }

  const siteIds = sites.map((s: { id: string }) => s.id);

  const { data, error } = await (supabase.from("leads") as any)
    .select("*")
    .in("site_id", siteIds)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

// PATCH /api/leads — update lead status or notes
export async function PATCH(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const body = await req.json();
  const { id, status, notes } = body as { id?: string; status?: string; notes?: string };

  if (!id) {
    return NextResponse.json({ error: "id est requis" }, { status: 400 });
  }

  // Verify ownership: lead must belong to user's site
  const { data: sites } = await (supabase.from("sites") as any)
    .select("id")
    .eq("owner_id", user.id);

  if (!sites || sites.length === 0) {
    return NextResponse.json({ error: "Aucun site trouvé" }, { status: 403 });
  }

  const siteIds = sites.map((s: { id: string }) => s.id);

  const updates: Record<string, unknown> = {};
  if (status) updates.status = status;
  if (notes !== undefined) updates.notes = notes;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Rien à mettre à jour" }, { status: 400 });
  }

  // First verify the lead exists and belongs to user's sites
  const { data: existingLead } = await (supabase.from("leads") as any)
    .select("id, site_id")
    .eq("id", id)
    .maybeSingle();

  console.log("[LEADS PATCH] Lead lookup:", existingLead ? `found, site_id=${existingLead.site_id}` : "NOT FOUND", "| User siteIds:", siteIds);

  if (!existingLead) {
    return NextResponse.json({ error: "Lead introuvable" }, { status: 404 });
  }
  if (!siteIds.includes(existingLead.site_id)) {
    return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
  }

  // Use admin client to bypass RLS for UPDATE (ownership already verified above)
  const admin = createAdminClient();

  let { data, error } = await (admin.from("leads") as any)
    .update(updates)
    .eq("id", id)
    .select();

  // If trigger/column error → auto-migrate and retry
  if (error && (error.code === "42703" || error.message?.includes("has no field") || error.message?.includes("schema cache"))) {
    console.warn("[LEADS PATCH] Column missing, running auto-migration...", error.message);
    const migrated = await ensureLeadsColumns();
    if (migrated) {
      await new Promise(r => setTimeout(r, 2000));
      const retry = await (admin.from("leads") as any)
        .update(updates).eq("id", id).select();
      data = retry.data;
      error = retry.error;
    }
  }

  if (error) {
    console.error("[LEADS PATCH] ❌ Update failed:", error.message, error.code);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const updated = Array.isArray(data) ? data[0] : data;
  if (!updated) {
    console.warn("[LEADS PATCH] No rows matched — lead id:", id);
    return NextResponse.json({ error: "Lead introuvable" }, { status: 404 });
  }

  console.log("[LEADS PATCH] ✅ Updated lead:", id, updates);
  return NextResponse.json(updated);
}
