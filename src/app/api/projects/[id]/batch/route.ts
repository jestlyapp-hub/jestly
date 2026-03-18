import { NextResponse, type NextRequest } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

type Ctx = { params: Promise<{ id: string }> };

// POST /api/projects/[id]/batch — batch operations on items
export async function POST(req: NextRequest, ctx: Ctx) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;
  const { id: projectId } = await ctx.params;

  let body: { action: string; itemIds: string[]; folderId?: string | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  const { action, itemIds, folderId } = body;

  if (!Array.isArray(itemIds) || itemIds.length === 0) {
    return NextResponse.json({ error: "Aucun élément sélectionné" }, { status: 400 });
  }

  if (itemIds.length > 100) {
    return NextResponse.json({ error: "Maximum 100 éléments par opération" }, { status: 400 });
  }

  // Verify project ownership
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: project } = await (supabase.from("projects") as any)
    .select("id")
    .eq("id", projectId)
    .single();

  if (!project) {
    return NextResponse.json({ error: "Projet introuvable" }, { status: 404 });
  }

  switch (action) {
    case "delete": {
      // Fetch file_paths before deletion for storage cleanup
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: items } = await (supabase.from("project_items") as any)
        .select("file_path")
        .in("id", itemIds)
        .eq("project_id", projectId);

      // Delete DB rows
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from("project_items") as any)
        .delete()
        .in("id", itemIds)
        .eq("project_id", projectId);

      if (error) {
        console.error("[project-batch] delete error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Cleanup storage files
      if (items && items.length > 0) {
        const pathPrefix = `${user.id}/projects/${projectId}/`;
        const pathsToRemove = items
          .map((i: { file_path: string | null }) => i.file_path)
          .filter((p: string | null): p is string => !!p && p.startsWith(pathPrefix));

        if (pathsToRemove.length > 0) {
          const { error: storageErr } = await supabase.storage
            .from("order-uploads")
            .remove(pathsToRemove);
          if (storageErr) {
            console.warn("[project-batch] storage cleanup failed (non-fatal):", storageErr.message);
          }
        }
      }

      return NextResponse.json({ ok: true, deleted: itemIds.length });
    }

    case "move": {
      // Validate target folder belongs to this project
      if (folderId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: folder } = await (supabase.from("project_folders") as any)
          .select("id")
          .eq("id", folderId)
          .eq("project_id", projectId)
          .maybeSingle();
        if (!folder) {
          return NextResponse.json({ error: "Dossier cible introuvable dans ce projet" }, { status: 400 });
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from("project_items") as any)
        .update({ folder_id: folderId || null })
        .in("id", itemIds)
        .eq("project_id", projectId);

      if (error) {
        console.error("[project-batch] move error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ ok: true, moved: itemIds.length });
    }

    case "pin": {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from("project_items") as any)
        .update({ is_pinned: true })
        .in("id", itemIds)
        .eq("project_id", projectId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ ok: true });
    }

    case "unpin": {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from("project_items") as any)
        .update({ is_pinned: false })
        .in("id", itemIds)
        .eq("project_id", projectId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ ok: true });
    }

    default:
      return NextResponse.json({ error: `Action inconnue: ${action}` }, { status: 400 });
  }
}
