import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type Ctx = { params: Promise<{ slug: string }> };

/**
 * GET /api/public/portfolio/[slug]?site=siteSlug
 * Resolves a public portfolio case study by its portfolio_slug.
 */
export async function GET(req: NextRequest, ctx: Ctx) {
  const { slug: portfolioSlug } = await ctx.params;
  const siteSlug = req.nextUrl.searchParams.get("site");

  if (!portfolioSlug) {
    return NextResponse.json({ error: "Slug manquant" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // 1) Resolve the site to get the owner
  let ownerId: string | null = null;
  if (siteSlug) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: site } = await (supabase.from("sites") as any)
      .select("owner_id")
      .eq("slug", siteSlug)
      .eq("status", "published")
      .single();
    ownerId = site?.owner_id ?? null;
  }

  if (!ownerId) {
    return NextResponse.json({ error: "Site introuvable" }, { status: 404 });
  }

  // 2) Find the project by portfolio slug + owner + public visibility
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: project, error } = await (supabase.from("projects") as any)
    .select(`
      id, name, description, project_type, color, status, cover_url, tags,
      is_portfolio, portfolio_description, portfolio_display_title, portfolio_subtitle,
      portfolio_result, portfolio_summary, portfolio_cover_url, portfolio_cover_item_id,
      portfolio_category, portfolio_images, portfolio_external_url, portfolio_slug,
      portfolio_cta_label, portfolio_cta_url, portfolio_featured,
      portfolio_intro_text, portfolio_challenge_text, portfolio_solution_text,
      portfolio_result_text, portfolio_gallery_item_ids,
      portfolio_seo_title, portfolio_seo_description,
      portfolio_visibility,
      clients(name, company),
      project_items!project_items_project_id_fkey(id, item_type, file_path, thumbnail_url, mime_type, title, url)
    `)
    .eq("user_id", ownerId)
    .eq("portfolio_slug", portfolioSlug)
    .eq("is_portfolio", true)
    .eq("portfolio_visibility", "public")
    .single();

  if (error || !project) {
    return NextResponse.json({ error: "Projet introuvable" }, { status: 404 });
  }

  // 3) Resolve gallery items (ordered by portfolio_gallery_item_ids)
  const allItems = project.project_items || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const imageItems = allItems.filter((it: any) => it.item_type === "image" || it.item_type === "video");
  const galleryIds: string[] = project.portfolio_gallery_item_ids || [];

  let gallery: typeof imageItems;
  if (galleryIds.length > 0) {
    // Use explicit selection order
    gallery = galleryIds
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((id: string) => imageItems.find((it: any) => it.id === id))
      .filter(Boolean);
  } else {
    // Fallback: first 8 images
    gallery = imageItems.slice(0, 8);
  }

  // 4) Cover fallback chain
  const coverUrl =
    project.portfolio_cover_url ||
    project.cover_url ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (project.portfolio_cover_item_id ? imageItems.find((it: any) => it.id === project.portfolio_cover_item_id)?.file_path : null) ||
    imageItems[0]?.file_path ||
    null;

  const response = {
    id: project.id,
    title: project.portfolio_display_title || project.name,
    subtitle: project.portfolio_subtitle || null,
    category: project.portfolio_category || project.project_type || null,
    result: project.portfolio_result || null,
    summary: project.portfolio_summary || project.portfolio_description || project.description || null,
    coverUrl,
    introText: project.portfolio_intro_text || null,
    challengeText: project.portfolio_challenge_text || null,
    solutionText: project.portfolio_solution_text || null,
    resultText: project.portfolio_result_text || null,
    ctaLabel: project.portfolio_cta_label || null,
    ctaUrl: project.portfolio_cta_url || null,
    clientName: project.clients?.name || null,
    clientCompany: project.clients?.company || null,
    color: project.color,
    tags: project.tags || [],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gallery: gallery.map((it: any) => ({
      id: it.id,
      type: it.item_type,
      url: it.file_path || it.url || it.thumbnail_url,
      title: it.title || null,
    })),
    seo: {
      title: project.portfolio_seo_title || project.portfolio_display_title || project.name,
      description: project.portfolio_seo_description || project.portfolio_summary || project.portfolio_description || project.description || null,
      ogImage: coverUrl,
    },
  };

  return NextResponse.json(response, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
  });
}
