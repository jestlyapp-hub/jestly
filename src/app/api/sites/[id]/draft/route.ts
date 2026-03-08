import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";

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

  // Use admin client for write operations (bypasses RLS timing issues)
  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch {
    // Fallback to user client if service role key is missing
    admin = supabase as any;
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide." }, { status: 400 });
  }

  try {
    // Verify ownership + get current status (using user client for auth check)
    const { data: site, error: siteErr } = await (supabase.from("sites") as any)
      .select("id, status")
      .eq("id", id)
      .eq("owner_id", user.id)
      .single();

    if (siteErr || !site) {
      console.error("[draft] site not found:", siteErr?.message);
      return NextResponse.json({ error: "Site introuvable." }, { status: 404 });
    }

    const siteIsPublished = site.status === "published";

    // 1. Update site metadata (only known JSONB columns)
    const siteUpdate: Record<string, unknown> = {
      name: body.name || "Mon site",
      settings: body.settings || {},
      theme: body.theme || {},
      seo: body.seo || {},
      nav: body.nav ?? null,
      footer: body.footer ?? null,
    };
    // Only send design if it's present in the payload (avoid null → error on older schemas)
    if (body.design !== undefined) {
      siteUpdate.design = body.design ?? null;
    }

    const { error: updateErr } = await (admin.from("sites") as any)
      .update(siteUpdate)
      .eq("id", id);

    if (updateErr) {
      console.error("[draft] site update error:", updateErr.message, updateErr.details, updateErr.hint, "payload keys:", Object.keys(siteUpdate));
      return NextResponse.json({ error: updateErr.message, step: "site_update" }, { status: 500 });
    }

    // 2. Replace pages + blocks (V1: delete all, re-insert)
    // Uses admin client to bypass RLS timing issues on cascading inserts
    const { error: deleteErr } = await (admin.from("site_pages") as any)
      .delete()
      .eq("site_id", id);

    if (deleteErr) {
      console.error("[draft] pages delete error:", deleteErr.message);
      return NextResponse.json({ error: deleteErr.message, step: "pages_delete" }, { status: 500 });
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

      const { data: insertedPages, error: pageErr } = await (admin.from("site_pages") as any)
        .insert(pageRows)
        .select("id, slug");

      if (pageErr || !insertedPages) {
        console.error("[draft] pages insert error:", pageErr?.message, pageErr?.details, "slugs:", pageRows.map((r: any) => r.slug));
        return NextResponse.json({ error: pageErr?.message || "Erreur insertion pages.", step: "pages_insert" }, { status: 500 });
      }

      // Build slug → DB id map (insertion order is NOT guaranteed by Supabase)
      const slugToId = new Map<string, string>();
      for (const row of insertedPages) {
        slugToId.set(row.slug, row.id);
      }

      // Insert blocks for each page — match by slug, not by array index
      const blockRows: any[] = [];
      for (let i = 0; i < pages.length; i++) {
        const pageSlug = pageRows[i]?.slug;
        const pageId = slugToId.get(pageSlug);
        if (!pageId) {
          console.error("[draft] missing page id for slug", pageSlug, "available:", [...slugToId.keys()]);
          continue;
        }
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
        const { error: blockErr } = await (admin.from("site_blocks") as any)
          .insert(blockRows);

        if (blockErr) {
          console.error("[draft] blocks insert error:", blockErr.message, blockErr.details, "count:", blockRows.length);
          return NextResponse.json({ error: blockErr.message, step: "blocks_insert" }, { status: 500 });
        }
      }
    }

    return NextResponse.json({ ok: true, savedAt: new Date().toISOString() });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[draft] unhandled error:", msg);
    return NextResponse.json({ error: msg, step: "unhandled" }, { status: 500 });
  }
}
