import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

/**
 * GET /api/projects/portfolio — List user's projects for portfolio picker
 * Returns lightweight project data with portfolio fields and first image
 */
export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const onlyPortfolio = req.nextUrl.searchParams.get("portfolio") === "true";
  const ids = req.nextUrl.searchParams.get("ids"); // comma-separated

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from("projects") as any)
    .select(`
      id, name, description, project_type, color, status, cover_url, tags,
      is_portfolio, portfolio_description, portfolio_display_title, portfolio_subtitle,
      portfolio_result, portfolio_summary, portfolio_cover_url, portfolio_cover_item_id,
      portfolio_category, portfolio_images, portfolio_external_url, portfolio_slug,
      portfolio_cta_label, portfolio_cta_url, portfolio_featured, portfolio_display_order,
      portfolio_visibility,
      clients(name),
      project_items!project_items_project_id_fkey(id, file_path, thumbnail_url, mime_type, item_type)
    `)
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (onlyPortfolio) {
    query = query.eq("is_portfolio", true);
  }

  if (ids) {
    query = query.in("id", ids.split(",").map((s: string) => s.trim()));
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Map to clean response with first image fallback
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const projects = (data || []).map((p: any) => {
    // Find first image from items for cover fallback
    const imageItems = (p.project_items || [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((it: any) => it.item_type === "image")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((it: any) => it.file_path || it.thumbnail_url)
      .filter(Boolean);

    return {
      id: p.id,
      name: p.name,
      description: p.description,
      projectType: p.project_type,
      color: p.color,
      status: p.status,
      coverUrl: p.cover_url,
      tags: p.tags || [],
      clientName: p.clients?.name ?? null,
      isPortfolio: p.is_portfolio,
      itemImages: imageItems.slice(0, 5),
      // Portfolio profile fields
      portfolio: {
        displayTitle: p.portfolio_display_title,
        subtitle: p.portfolio_subtitle,
        result: p.portfolio_result,
        summary: p.portfolio_summary,
        coverUrl: p.portfolio_cover_url,
        coverItemId: p.portfolio_cover_item_id,
        category: p.portfolio_category,
        images: p.portfolio_images || [],
        externalUrl: p.portfolio_external_url,
        slug: p.portfolio_slug,
        ctaLabel: p.portfolio_cta_label,
        ctaUrl: p.portfolio_cta_url,
        featured: p.portfolio_featured || false,
        displayOrder: p.portfolio_display_order || 0,
        visibility: p.portfolio_visibility || "draft",
        description: p.portfolio_description,
      },
    };
  });

  return NextResponse.json(projects);
}
