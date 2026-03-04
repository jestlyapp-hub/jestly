import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

/* eslint-disable @typescript-eslint/no-explicit-any */

// POST /api/sites/[id]/draft — autosave: replace snapshot (pages+blocks)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide." }, { status: 400 });
  }

  // Verify ownership + get current status
  const { data: site, error: siteErr } = await (supabase.from("sites") as any)
    .select("id, status")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();

  if (siteErr || !site) {
    return NextResponse.json({ error: "Site introuvable." }, { status: 404 });
  }

  const siteIsPublished = site.status === "published";

  // 1. Update site metadata
  const { error: updateErr } = await (supabase.from("sites") as any)
    .update({
      name: body.name || "Mon site",
      settings: body.settings || {},
      theme: body.theme || {},
      seo: body.seo || {},
      nav: body.nav ?? null,
      footer: body.footer ?? null,
    })
    .eq("id", id);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  // 2. Replace pages + blocks (V1: delete all, re-insert)
  const { error: deleteErr } = await (supabase.from("site_pages") as any)
    .delete()
    .eq("site_id", id);

  if (deleteErr) {
    return NextResponse.json({ error: deleteErr.message }, { status: 500 });
  }

  const pages = body.pages || [];
  if (pages.length > 0) {
    // Insert pages
    const pageRows = pages.map((p: any, i: number) => ({
      site_id: id,
      title: p.title || p.name || "Sans titre",
      slug: p.slug || `page-${i}`,
      is_home: !!p.is_home,
      sort_order: p.sort_order ?? i,
      status: siteIsPublished ? "published" : (p.status || "draft"),
      seo_title: p.seo_title || null,
      seo_description: p.seo_description || null,
    }));

    const { data: insertedPages, error: pageErr } = await (supabase.from("site_pages") as any)
      .insert(pageRows)
      .select("id");

    if (pageErr || !insertedPages) {
      return NextResponse.json({ error: pageErr?.message || "Erreur insertion pages." }, { status: 500 });
    }

    // Insert blocks for each page
    const blockRows: any[] = [];
    for (let i = 0; i < pages.length; i++) {
      const pageId = insertedPages[i].id;
      const blocks = pages[i].blocks || [];
      for (let j = 0; j < blocks.length; j++) {
        const b = blocks[j];
        blockRows.push({
          page_id: pageId,
          type: b.type,
          sort_order: b.sort_order ?? j,
          content: b.content || {},
          style: b.style || {},
          settings: b.settings || {},
          visible: b.visible ?? true,
        });
      }
    }

    if (blockRows.length > 0) {
      const { error: blockErr } = await (supabase.from("site_blocks") as any)
        .insert(blockRows);

      if (blockErr) {
        return NextResponse.json({ error: blockErr.message }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ ok: true, savedAt: new Date().toISOString() });
}
