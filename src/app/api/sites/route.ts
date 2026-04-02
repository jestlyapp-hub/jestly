import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

// GET /api/sites — list user's sites
export async function GET() {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  // Try with page count join first, fallback without if schema cache issue
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let { data, error } = await (supabase.from("sites") as any)
    .select("id, slug, name, status, theme, settings, seo, nav, custom_domain, is_private, created_at, updated_at, site_pages(id)")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    // Fallback: query without join
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fallback = await (supabase.from("sites") as any)
      .select("id, slug, name, status, theme, settings, seo, nav, custom_domain, is_private, created_at, updated_at")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    if (fallback.error) return NextResponse.json({ error: fallback.error.message }, { status: 500 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return NextResponse.json((fallback.data || []).map((s: any) => ({ ...s, pages_count: 0 })));
  }

  // Enrich with page count
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const enriched = (data || []).map((s: any) => ({
    ...s,
    pages_count: Array.isArray(s.site_pages) ? s.site_pages.length : 0,
    site_pages: undefined,
  }));

  return NextResponse.json(enriched);
}

// POST /api/sites — create a new site
export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  // ── Subscription guard: vérifier quota sites ──
  const { checkResourceQuota } = await import("@/lib/subscription-guard");
  const guard = await checkResourceQuota(supabase, user.id, "sites");
  if (!guard.allowed) {
    return NextResponse.json(
      { error: guard.error, upgrade: guard.upgrade, quotaExceeded: true },
      { status: 403 },
    );
  }

  const body = await req.json();
  const { slug, name, theme, settings, seo } = body;

  if (!slug || !name) {
    return NextResponse.json({ error: "Le slug et le nom sont requis" }, { status: 400 });
  }

  // Validate slug format
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(slug)) {
    return NextResponse.json({ error: "Format de slug invalide" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("sites") as any)
    .insert({
      owner_id: user.id,
      slug,
      name,
      theme: theme || {},
      settings: settings || {},
      seo: seo || {},
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Cette adresse est déjà utilisée. Choisissez un autre slug." }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
