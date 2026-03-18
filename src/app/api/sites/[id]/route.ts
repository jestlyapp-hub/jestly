import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

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
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

// PATCH /api/sites/[id] — update site settings, theme, seo, nav, footer
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const body = await req.json();

  // For JSONB columns, merge with existing data instead of replacing
  const jsonbKeys = new Set(["theme", "settings", "seo", "nav", "footer"]);
  const allowed = ["name", "slug", "theme", "settings", "seo", "nav", "footer", "custom_domain", "is_private"];

  // Fetch current site to merge JSONB fields safely
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: current } = await (supabase.from("sites") as any)
    .select("theme, settings, seo, nav, footer")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();

  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (!(key in body)) continue;
    if (jsonbKeys.has(key) && current?.[key] && typeof body[key] === "object") {
      // Deep merge: preserve existing fields, apply new ones on top
      updates[key] = { ...current[key], ...body[key] };
    } else {
      updates[key] = body[key];
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("sites") as any)
    .update(updates)
    .eq("id", id)
    .eq("owner_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Site not found" }, { status: 404 });

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
