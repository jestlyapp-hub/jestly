import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/sites/[id] — get full site with pages and blocks
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("sites") as any)
    .select("*, site_pages(*, site_blocks(*))")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Site introuvable" }, { status: 404 });
  }

  // No-cache headers to prevent stale reads after PATCH
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Pragma": "no-cache",
    },
  });
}

// ── Allowed top-level scalar columns ──
const SCALAR_KEYS = new Set(["name", "slug", "custom_domain", "is_private"]);

// ── JSONB columns that are FULLY REPLACED (frontend sends complete objects) ──
const REPLACE_JSONB_KEYS = new Set(["settings", "nav", "footer"]);

// ── JSONB columns that are SHALLOW MERGED (may be modified from multiple UIs) ──
const MERGE_JSONB_KEYS = new Set(["theme", "seo"]);

const ALL_ALLOWED = new Set([...SCALAR_KEYS, ...REPLACE_JSONB_KEYS, ...MERGE_JSONB_KEYS]);

// PATCH /api/sites/[id] — update site settings, theme, seo, nav, footer
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  // Use service role client to bypass potential RLS/JWT timing issues
  // Ownership is still verified via .eq("owner_id", user.id)
  let adminClient;
  try { adminClient = createAdminClient(); } catch { /* fallback to user client */ }
  const dbClient = adminClient ?? supabase;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }

  // Build the updates object
  const updates: Record<string, unknown> = {};

  // 1. Scalar keys — direct replacement
  for (const key of SCALAR_KEYS) {
    if (key in body) {
      updates[key] = body[key];
    }
  }

  // 2. JSONB keys that should be fully replaced (settings, nav, footer)
  for (const key of REPLACE_JSONB_KEYS) {
    if (key in body && body[key] != null) {
      updates[key] = body[key];
    }
  }

  // 3. JSONB keys that should be merged (theme, seo)
  const needsMerge = [...MERGE_JSONB_KEYS].filter((k) => k in body && typeof body[k] === "object");
  if (needsMerge.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: current, error: fetchError } = await (dbClient.from("sites") as any)
      .select(needsMerge.join(", "))
      .eq("id", id)
      .eq("owner_id", user.id)
      .single();

    if (fetchError) {
      console.error("[PATCH /api/sites] Erreur lecture site pour merge:", fetchError.message);
      return NextResponse.json({ error: "Site introuvable ou accès refusé" }, { status: 404 });
    }

    for (const key of needsMerge) {
      if (current?.[key] && typeof current[key] === "object") {
        updates[key] = { ...current[key], ...(body[key] as object) };
      } else {
        updates[key] = body[key];
      }
    }
  }

  // Filter out any keys not in the allowed list
  for (const key of Object.keys(updates)) {
    if (!ALL_ALLOWED.has(key)) {
      delete updates[key];
    }
  }

  if (Object.keys(updates).length === 0) {
    console.error("[PATCH /api/sites] Aucun champ valide. body keys:", Object.keys(body));
    return NextResponse.json({ error: "Aucun champ valide à mettre à jour" }, { status: 400 });
  }

  console.log("[PATCH /api/sites]", id, "user:", user.id, "update keys:", Object.keys(updates));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (dbClient.from("sites") as any)
    .update(updates)
    .eq("id", id)
    .eq("owner_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("[PATCH /api/sites] Erreur Supabase update:", error.message, error.details, error.code);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    console.error("[PATCH /api/sites] Aucune ligne mise à jour (site introuvable ou RLS)");
    return NextResponse.json({ error: "Site introuvable ou accès refusé" }, { status: 404 });
  }

  console.log("[PATCH /api/sites] OK. settings:", JSON.stringify(data.settings).slice(0, 200));
  return NextResponse.json(data);
}

// DELETE /api/sites/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("sites") as any)
    .delete()
    .eq("id", id)
    .eq("owner_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
