import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAuthUser } from "@/lib/api-auth";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/api-error";

/* eslint-disable @typescript-eslint/no-explicit-any */

// POST /api/sites/[id]/publish — publier le site + auto-réserver sous-domaine
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  // 1. Récupérer le site complet
  const { data: site, error: siteError } = await (supabase.from("sites") as any)
    .select("*")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();

  if (siteError || !site) {
    return apiError(404, "Site introuvable.", { route: "/api/sites/[id]/publish", userId: user.id, entityId: id });
  }

  // 2. Récupérer pages + blocs
  const { data: pages, error: pagesError } = await (supabase.from("site_pages") as any)
    .select("*, site_blocks(*)")
    .eq("site_id", id)
    .order("sort_order");

  if (pagesError) {
    return apiError(500, pagesError.message, { route: "/api/sites/[id]/publish", userId: user.id, entityId: id, action: "fetch_pages" });
  }

  // 3. Auto-réserver sous-domaine si absent
  let subdomain = site.slug;
  const needsSubdomain = !subdomain || subdomain.startsWith("site-");

  if (needsSubdomain) {
    const base = (site.name || "mon-site")
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 30) || "mon-site";

    let candidate = base;
    let attempt = 0;
    const maxAttempts = 10;

    while (attempt < maxAttempts) {
      const { data: existing } = await (supabase.from("sites") as any)
        .select("id")
        .eq("slug", candidate)
        .neq("id", id)
        .limit(1)
        .maybeSingle();

      if (!existing) break;
      attempt++;
      candidate = `${base}-${attempt + 1}`;
    }

    if (attempt >= maxAttempts) {
      candidate = `${base}-${Date.now().toString(36).slice(-4)}`;
    }

    subdomain = candidate;
  }

  // 4. Update atomique : status + slug (+ published_at si la colonne existe)
  const now = new Date().toISOString();
  const { error: updateSiteError } = await (supabase.from("sites") as any)
    .update({ status: "published", slug: subdomain })
    .eq("id", id);

  if (updateSiteError) {
    if (updateSiteError.code === "23505") {
      return apiError(409, "Sous-domaine indisponible. Réessayez.", { route: "/api/sites/[id]/publish", userId: user.id, entityId: id });
    }
    return apiError(500, updateSiteError.message, { route: "/api/sites/[id]/publish", userId: user.id, entityId: id, action: "update_site" });
  }

  // Tenter d'écrire published_at (ignore si la colonne n'existe pas)
  await (supabase.from("sites") as any)
    .update({ published_at: now })
    .eq("id", id)
    .then(() => {})
    .catch(() => {});

  // 5. Publier chaque page + créer les snapshots
  const snapshots = [];
  for (const page of pages || []) {
    const { error: pageUpdateError } = await (supabase.from("site_pages") as any)
      .update({ status: "published", published_at: now })
      .eq("id", page.id);

    if (pageUpdateError) {
      console.error(`[publish] page update error for ${page.id}:`, pageUpdateError);
    }

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
    const { error: snapshotError } = await (supabase.from("site_published_snapshots") as any).insert(snapshots);
    if (snapshotError) {
      logger.error("publish_snapshot_failed", { route: "/api/sites/[id]/publish", userId: user.id, entityId: id, error: snapshotError.message } as Record<string, unknown>);
      return apiError(500, "Erreur lors de la sauvegarde des snapshots", { route: "/api/sites/[id]/publish", userId: user.id, entityId: id });
    }
  }

  // 6. Versioning (optionnel — ignore si la table n'existe pas encore)
  let nextVersion = 1;
  try {
    const { data: maxVer } = await (supabase.from("site_versions") as any)
      .select("version")
      .eq("site_id", id)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();

    nextVersion = (maxVer?.version || 0) + 1;

    await (supabase.from("site_versions") as any).insert({
      site_id: id,
      version: nextVersion,
      snapshot: {
        site: { name: site.name, settings: site.settings, theme: site.theme, design: site.design, seo: site.seo, nav: site.nav, footer: site.footer },
        pages: (pages || []).map((p: any) => ({
          title: p.title,
          slug: p.slug,
          is_home: p.is_home,
          blocks: (p.site_blocks || []).map((b: any) => ({
            type: b.type, content: b.content, style: b.style, settings: b.settings, visible: b.visible,
          })),
        })),
      },
    });
  } catch {
    // site_versions n'existe pas encore — on continue sans
    console.log("[publish] site_versions table not available, skipping version snapshot");
  }

  // 7. Invalider le cache ISR des pages publiques pour que les changements
  //    (thème, design, contenu) soient visibles immédiatement
  try {
    revalidatePath(`/s/${subdomain}`, "layout");
  } catch {
    // revalidatePath peut échouer en dev ou si le chemin n'est pas en cache
    console.log("[publish] revalidatePath skipped or failed");
  }

  logger.info("site_published", { userId: user.id, entity: "site", entityId: id, route: "/api/sites/[id]/publish", action: "publish" });

  return NextResponse.json({
    ok: true,
    subdomain,
    url: `https://${process.env.NEXT_PUBLIC_BASE_DOMAIN || "jestly.fr"}/s/${subdomain}`,
    version: nextVersion,
    published_pages: pages?.length || 0,
    published_at: now,
  });
}

// DELETE /api/sites/[id]/publish — dépublier le site
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const { error } = await (supabase.from("sites") as any)
    .update({ status: "draft" })
    .eq("id", id)
    .eq("owner_id", user.id);

  if (error) return apiError(500, error.message, { route: "/api/sites/[id]/publish", userId: user.id, entityId: id, action: "unpublish" });

  logger.info("site_unpublished", { userId: user.id, entity: "site", entityId: id, route: "/api/sites/[id]/publish", action: "unpublish" });
  return NextResponse.json({ ok: true, status: "draft" });
}
