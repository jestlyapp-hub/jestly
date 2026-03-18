import { NextResponse, type NextRequest } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

type Ctx = { params: Promise<{ id: string; itemId: string }> };

// ─── PATCH — update item or folder ──────────────────────────
export async function PATCH(req: NextRequest, ctx: Ctx) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { supabase } = auth;
  const { id: projectId, itemId } = await ctx.params;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  // Handle folder update
  if (body._type === "folder") {
    const updates: Record<string, unknown> = {};
    if ("name" in body) updates.name = String(body.name).slice(0, 200);
    if ("color" in body) updates.color = String(body.color).slice(0, 20);
    if ("position" in body) updates.position = body.position;
    if ("parentId" in body) updates.parent_id = body.parentId || null;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Aucun champ à modifier" }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("project_folders") as any)
      .update(updates)
      .eq("id", itemId)
      .eq("project_id", projectId);

    if (error) {
      console.error("[project-items] folder update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  // Item update — validate folderId belongs to same project
  if ("folderId" in body && body.folderId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: folder } = await (supabase.from("project_folders") as any)
      .select("id")
      .eq("id", body.folderId)
      .eq("project_id", projectId)
      .maybeSingle();
    if (!folder) {
      return NextResponse.json({ error: "Dossier cible introuvable dans ce projet" }, { status: 400 });
    }
  }

  const allowed: Record<string, string> = {
    title: "title",
    description: "description",
    content: "content",
    url: "url",
    thumbnailUrl: "thumbnail_url",
    tags: "tags",
    folderId: "folder_id",
    position: "position",
    metadata: "metadata",
    isPinned: "is_pinned",
    itemType: "item_type",
  };

  const updates: Record<string, unknown> = {};
  for (const [key, col] of Object.entries(allowed)) {
    if (key in body) updates[col] = body[key];
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Aucun champ à modifier" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("project_items") as any)
    .update(updates)
    .eq("id", itemId)
    .eq("project_id", projectId);

  if (error) {
    console.error("[project-items] update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// ─── DELETE — delete item or folder (with storage cleanup) ───
export async function DELETE(req: NextRequest, ctx: Ctx) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;
  const { id: projectId, itemId } = await ctx.params;

  const url = new URL(req.url);
  const isFolder = url.searchParams.get("type") === "folder";

  if (isFolder) {
    // Before deleting folder, collect file_paths of child items for storage cleanup
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: childItems } = await (supabase.from("project_items") as any)
      .select("file_path")
      .eq("folder_id", itemId)
      .eq("project_id", projectId);

    // Delete folder (cascade: child items get folder_id = NULL via ON DELETE SET NULL)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("project_folders") as any)
      .delete()
      .eq("id", itemId)
      .eq("project_id", projectId);

    if (error) {
      console.error("[project-items] folder delete error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Note: child items are NOT deleted (ON DELETE SET NULL), just unlinked.
    // Storage files remain attached to the items which are now at root.
    return NextResponse.json({ ok: true });
  }

  // Item delete — fetch file_path first for storage cleanup
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: item } = await (supabase.from("project_items") as any)
    .select("file_path")
    .eq("id", itemId)
    .eq("project_id", projectId)
    .maybeSingle();

  // Delete DB row
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("project_items") as any)
    .delete()
    .eq("id", itemId)
    .eq("project_id", projectId);

  if (error) {
    console.error("[project-items] delete error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Cleanup storage file if exists
  if (item?.file_path) {
    const storagePath = item.file_path;
    // Verify path belongs to this user/project
    if (storagePath.startsWith(`${user.id}/projects/${projectId}/`)) {
      const { error: storageErr } = await supabase.storage
        .from("order-uploads")
        .remove([storagePath]);
      if (storageErr) {
        console.warn("[project-items] storage cleanup failed (non-fatal):", storageErr.message);
      }
    }
  }

  return NextResponse.json({ ok: true });
}
