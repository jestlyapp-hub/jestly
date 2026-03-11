import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// GET /api/public/portfolio?user_id=xxx — public portfolio projects
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("user_id");
  const siteSlug = url.searchParams.get("site_slug");

  if (!userId && !siteSlug) {
    return NextResponse.json({ error: "user_id ou site_slug requis" }, { status: 400 });
  }

  let targetUserId = userId;

  // Resolve user_id from site slug if needed
  if (!targetUserId && siteSlug) {
    const { data: site } = await (supabaseAdmin.from("sites") as any)
      .select("user_id")
      .eq("slug", siteSlug)
      .single();

    if (!site) {
      return NextResponse.json({ error: "Site introuvable" }, { status: 404 });
    }
    targetUserId = site.user_id;
  }

  // Fetch portfolio-visible projects with safe public fields only
  const { data, error } = await (supabaseAdmin.from("projects") as any)
    .select("id, name, description, project_type, color, status, tags, cover_url, is_portfolio, portfolio_description, portfolio_images, portfolio_category, portfolio_external_url, clients(name, company), created_at")
    .eq("user_id", targetUserId)
    .eq("is_portfolio", true)
    .neq("status", "archived")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("[public-portfolio] error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  // Map to safe public format — never expose internal data
  const projects = (data ?? []).map((p: any) => ({
    id: p.id,
    title: p.name,
    description: p.portfolio_description || p.description || "",
    type: p.project_type,
    color: p.color,
    status: p.status,
    tags: p.tags || [],
    coverUrl: p.cover_url,
    images: p.portfolio_images || [],
    category: p.portfolio_category || "",
    externalUrl: p.portfolio_external_url,
    clientName: p.clients?.name || null,
    clientCompany: p.clients?.company || null,
    createdAt: p.created_at,
  }));

  return NextResponse.json(projects, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
  });
}
