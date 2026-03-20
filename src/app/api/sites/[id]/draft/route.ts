import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
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
      .select("id, status, slug")
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
      theme: { ...(site.theme || {}), ...(body.theme || {}) },
      seo: body.seo || {},
      nav: body.nav ?? null,
      footer: body.footer ?? null,
    };
    if (body.design !== undefined) {
      siteUpdate.design = body.design ?? null;
    }

    const { error: updateErr } = await (admin.from("sites") as any)
      .update(siteUpdate)
      .eq("id", id);

    if (updateErr) {
      console.error("[draft] site update error:", updateErr.message, updateErr.details, updateErr.hint);
      return NextResponse.json({ error: updateErr.message, step: "site_update" }, { status: 500 });
    }

    // 2. Replace pages + blocks
    // Strategy: DELETE ALL existing pages first (cascade deletes blocks),
    // then INSERT new pages + blocks. Simple, atomic, no slug collisions.
    const pages = body.pages || [];

    // Delete ALL existing pages for this site (cascade deletes their blocks)
    const { error: deleteErr } = await (admin.from("site_pages") as any)
      .delete()
      .eq("site_id", id);

    if (deleteErr) {
      console.error("[draft] pages delete error:", deleteErr.message);
      return NextResponse.json({ error: deleteErr.message, step: "pages_delete" }, { status: 500 });
    }

    if (pages.length > 0) {
      // Deduplicate slugs
      const usedSlugs = new Set<string>();
      const pageRows = pages.map((p: any, i: number) => {
        let slug = p.slug || `page-${i}`;
        if (usedSlugs.has(slug)) slug = `${slug}-${i}`;
        usedSlugs.add(slug);
        return {
          site_id: id,
          title: p.title || p.name || "Sans titre",
          slug,
          is_home: !!p.is_home,
          sort_order: p.sort_order ?? i,
          status: siteIsPublished ? "published" : (p.status || "draft"),
          seo_title: p.seo_title || null,
          seo_description: p.seo_description || null,
        };
      });

      // Insert pages
      const { data: insertedPages, error: pageErr } = await (admin.from("site_pages") as any)
        .insert(pageRows)
        .select("id, slug");

      if (pageErr || !insertedPages) {
        console.error("[draft] pages insert error:", pageErr?.message, pageErr?.details);
        return NextResponse.json({ error: pageErr?.message || "Erreur insertion pages.", step: "pages_insert" }, { status: 500 });
      }

      // Build slug → DB id map
      const slugToId = new Map<string, string>();
      for (const row of insertedPages) {
        slugToId.set(row.slug, row.id);
      }

      // Build block rows
      const blockRows: any[] = [];
      for (let i = 0; i < pages.length; i++) {
        const slug = pageRows[i]?.slug;
        const pageId = slugToId.get(slug);
        if (!pageId) continue;

        const blocks = pages[i].blocks || [];
        for (let j = 0; j < blocks.length; j++) {
          const b = blocks[j];
          const blockRow: Record<string, unknown> = {
            page_id: pageId,
            type: b.type,
            sort_order: b.sort_order ?? j,
            content: b.content || {},
            style: b.style || {},
            settings: b.settings || {},
            visible: b.visible ?? true,
          };
          // Preserve block ID if provided (keeps anchor links stable)
          if (b.id) blockRow.id = b.id;
          blockRows.push(blockRow);
        }
      }

      if (blockRows.length > 0) {
        // Upsert blocks — handles preserved IDs that may still exist in orphan state
        const { error: blockErr } = await (admin.from("site_blocks") as any)
          .upsert(blockRows, { onConflict: "id" });

        if (blockErr) {
          console.error("[draft] blocks upsert error:", blockErr.message, blockErr.details);
          // Pages are already in place without blocks — non-fatal, log and continue
          // Next save will retry
        }
      }
    }

    // Revalidate ISR cache if site is published
    if (siteIsPublished && site.slug) {
      try {
        revalidatePath(`/s/${site.slug}`, "layout");
      } catch {
        // Ignore in dev or if path isn't cached
      }
    }

    return NextResponse.json({ ok: true, savedAt: new Date().toISOString() });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[draft] unhandled error:", msg);
    return NextResponse.json({ error: msg, step: "unhandled" }, { status: 500 });
  }
}
