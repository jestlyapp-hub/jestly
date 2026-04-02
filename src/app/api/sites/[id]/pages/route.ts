import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/sites/[id]/pages — list pages for a site
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  // Ownership check
  const { data: site } = await (supabase.from("sites") as any)
    .select("id")
    .eq("id", id)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!site) return NextResponse.json({ error: "Site introuvable" }, { status: 404 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("site_pages") as any)
    .select("*, site_blocks(*)")
    .eq("site_id", id)
    .order("sort_order");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/sites/[id]/pages — create a new page
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  // Ownership check
  const { data: site } = await (supabase.from("sites") as any)
    .select("id")
    .eq("id", id)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!site) return NextResponse.json({ error: "Site introuvable" }, { status: 404 });

  // ── Subscription guard: vérifier quota pages/site ──
  const { checkResourceQuota } = await import("@/lib/subscription-guard");
  const guard = await checkResourceQuota(supabase, user.id, "pages_per_site", { siteId: id });
  if (!guard.allowed) {
    return NextResponse.json(
      { error: guard.error, upgrade: guard.upgrade, quotaExceeded: true },
      { status: 403 },
    );
  }

  const body = await req.json();
  const { slug, title, is_home, sort_order } = body;

  if (!slug || !title) {
    return NextResponse.json({ error: "Le slug et le titre sont requis" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("site_pages") as any)
    .insert({
      site_id: id,
      slug,
      title,
      is_home: is_home || false,
      sort_order: sort_order || 0,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Ce slug de page existe déjà pour ce site" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
