import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/sites/[id]/publish — publish all pages + create snapshots
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 1. Get the site
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: site, error: siteError } = await (supabase.from("sites") as any)
    .select("id, owner_id")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();

  if (siteError || !site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  // 2. Get all pages with their blocks
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: pages, error: pagesError } = await (supabase.from("site_pages") as any)
    .select("*, site_blocks(*)")
    .eq("site_id", id)
    .order("sort_order");

  if (pagesError) {
    return NextResponse.json({ error: pagesError.message }, { status: 500 });
  }

  // 3. Update site status to published
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateSiteError } = await (supabase.from("sites") as any)
    .update({ status: "published" })
    .eq("id", id);

  if (updateSiteError) {
    return NextResponse.json({ error: updateSiteError.message }, { status: 500 });
  }

  // 4. Publish each page and create snapshots
  const snapshots = [];
  for (const page of pages || []) {
    // Mark page as published
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("site_pages") as any)
      .update({ status: "published", published_at: new Date().toISOString() })
      .eq("id", page.id);

    // Create immutable snapshot
    snapshots.push({
      site_id: id,
      page_id: page.id,
      snapshot: {
        page: {
          id: page.id,
          slug: page.slug,
          title: page.title,
          is_home: page.is_home,
          seo_title: page.seo_title,
          seo_description: page.seo_description,
          og_image_url: page.og_image_url,
        },
        blocks: (page.site_blocks || []).map((b: Record<string, unknown>) => ({
          id: b.id,
          type: b.type,
          sort_order: b.sort_order,
          content: b.content,
          style: b.style,
          settings: b.settings,
          visible: b.visible,
        })),
      },
    });
  }

  if (snapshots.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: snapError } = await (supabase.from("site_published_snapshots") as any)
      .insert(snapshots);

    if (snapError) {
      return NextResponse.json({ error: snapError.message }, { status: 500 });
    }
  }

  return NextResponse.json({
    ok: true,
    published_pages: pages?.length || 0,
    published_at: new Date().toISOString(),
  });
}

// DELETE /api/sites/[id]/publish — unpublish site
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("sites") as any)
    .update({ status: "draft" })
    .eq("id", id)
    .eq("owner_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, status: "draft" });
}
