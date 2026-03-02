import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/public/sites/[slug] — public site data (for client-side hydration)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: site, error } = await (supabase.from("sites") as any)
    .select("id, slug, name, theme, settings, seo, nav, footer")
    .eq("slug", slug)
    .eq("status", "published")
    .eq("is_private", false)
    .single();

  if (error || !site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  // Get published pages with blocks
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: pages } = await (supabase.from("site_pages") as any)
    .select("id, slug, title, is_home, sort_order, seo_title, seo_description, og_image_url, site_blocks(*)")
    .eq("site_id", site.id)
    .eq("status", "published")
    .order("sort_order");

  return NextResponse.json({
    ...site,
    pages: pages || [],
  }, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
