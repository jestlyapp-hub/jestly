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

    // 2. Replace pages + blocks (safe: insert new first, delete old only on success)
    // Uses admin client to bypass RLS timing issues on cascading inserts
    const pages = body.pages || [];
    if (pages.length > 0) {
      // Fetch existing page IDs before insert (to delete later on success)
      const { data: existingPages } = await (admin.from("site_pages") as any)
        .select("id")
        .eq("site_id", id);
      const oldPageIds: string[] = (existingPages ?? []).map((p: any) => p.id);

      // Insert pages — deduplicate slugs to avoid unique constraint violation
      // Use temporary suffixed slugs to avoid conflicts with existing pages
      const usedSlugs = new Set<string>();
      const pageRows = pages.map((p: any, i: number) => {
        let slug = p.slug || `page-${i}`;
        if (usedSlugs.has(slug)) {
          slug = `${slug}-${i}`;
        }
        // Suffix with __draft_new to avoid unique constraint with existing pages
        usedSlugs.add(slug);
        return {
          site_id: id,
          title: p.title || p.name || "Sans titre",
          slug: `${slug}__draft_new`,
          _final_slug: slug,
          is_home: !!p.is_home,
          sort_order: p.sort_order ?? i,
          status: siteIsPublished ? "published" : (p.status || "draft"),
          seo_title: p.seo_title || null,
          seo_description: p.seo_description || null,
        };
      });

      // Strip _final_slug before insert (not a DB column)
      const insertRows = pageRows.map(({ _final_slug, ...row }: any) => row);

      let insertedPages: any[] | null = null;

      const { data, error: pageErr } = await (admin.from("site_pages") as any)
        .insert(insertRows)
        .select("id, slug");

      if (pageErr || !data) {
        console.error("[draft] pages insert error:", pageErr?.message, pageErr?.details, "slugs:", insertRows.map((r: any) => r.slug));
        return NextResponse.json({ error: pageErr?.message || "Erreur insertion pages.", step: "pages_insert" }, { status: 500 });
      }

      insertedPages = data!;

      // Build slug → DB id map (insertion order is NOT guaranteed by Supabase)
      const slugToId = new Map<string, string>();
      for (const row of insertedPages!) {
        slugToId.set(row.slug, row.id);
      }

      // Insert blocks for each page — match by temp slug, not by array index
      const blockRows: any[] = [];
      for (let i = 0; i < pages.length; i++) {
        const tempSlug = insertRows[i]?.slug;
        const pageId = slugToId.get(tempSlug);
        if (!pageId) {
          console.error("[draft] missing page id for slug", tempSlug, "available:", [...slugToId.keys()]);
          continue;
        }
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
          // Preserve block ID if provided (keeps navbar anchor links stable)
          if (b.id) blockRow.id = b.id;
          blockRows.push(blockRow);
        }
      }

      if (blockRows.length > 0) {
        // Use upsert to handle blocks that still exist in old pages (same IDs).
        // Old pages are deleted AFTER this step, so blocks with preserved IDs may
        // still exist — upsert avoids "duplicate key violates site_blocks_pkey".
        const { error: blockErr } = await (admin.from("site_blocks") as any)
          .upsert(blockRows, { onConflict: "id" });

        if (blockErr) {
          // Rollback: delete the newly inserted pages (cascade deletes their blocks)
          console.error("[draft] blocks upsert error:", blockErr.message, blockErr.details, "count:", blockRows.length);
          const newPageIds = insertedPages!.map((p: any) => p.id);
          await (admin.from("site_pages") as any).delete().in("id", newPageIds);
          return NextResponse.json({ error: blockErr.message, step: "blocks_upsert" }, { status: 500 });
        }
      }

      // Insert succeeded — now safely delete old pages (cascade deletes old blocks)
      if (oldPageIds.length > 0) {
        const { error: deleteErr } = await (admin.from("site_pages") as any)
          .delete()
          .in("id", oldPageIds);

        if (deleteErr) {
          console.error("[draft] old pages delete error:", deleteErr.message);
          // Non-fatal: new pages are in place, old ones remain as orphans
        }
      }

      // Rename temp slugs to final slugs
      for (let i = 0; i < pageRows.length; i++) {
        const tempSlug = insertRows[i]?.slug;
        const finalSlug = pageRows[i]._final_slug;
        const pageId = slugToId.get(tempSlug);
        if (pageId && tempSlug !== finalSlug) {
          await (admin.from("site_pages") as any)
            .update({ slug: finalSlug })
            .eq("id", pageId);
        }
      }
    } else {
      // No pages in payload — delete all existing pages
      const { error: deleteErr } = await (admin.from("site_pages") as any)
        .delete()
        .eq("site_id", id);

      if (deleteErr) {
        console.error("[draft] pages delete error:", deleteErr.message);
        return NextResponse.json({ error: deleteErr.message, step: "pages_delete" }, { status: 500 });
      }
    }

    // Invalider le cache ISR si le site est publié, pour que les changements
    // soient visibles immédiatement sur le site public
    if (siteIsPublished && site.slug) {
      try {
        revalidatePath(`/s/${site.slug}`, "layout");
      } catch {
        // Ignore en dev ou si le chemin n'est pas en cache
      }
    }

    return NextResponse.json({ ok: true, savedAt: new Date().toISOString() });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[draft] unhandled error:", msg);
    return NextResponse.json({ error: msg, step: "unhandled" }, { status: 500 });
  }
}
