import { NextResponse, type NextRequest } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

type Ctx = { params: Promise<{ id: string }> };

// ─── POST /api/projects/[id]/items — create item or folder ──
export async function POST(req: NextRequest, ctx: Ctx) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { supabase } = auth;
  const { id: projectId } = await ctx.params;

  // Verify project ownership (RLS handles this but explicit check gives better errors)
  const { data: project, error: projErr } = await (supabase.from("projects") as any)
    .select("id")
    .eq("id", projectId)
    .single();

  if (projErr || !project) {
    return NextResponse.json({ error: "Projet introuvable ou accès refusé" }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  // Handle folder creation
  if (body.itemType === "folder") {
    const { data, error } = await (supabase.from("project_folders") as any)
      .insert({
        project_id: projectId,
        parent_id: body.parentId || null,
        name: String(body.title || "Nouveau dossier").slice(0, 200),
        color: String(body.color || "#8A8A88").slice(0, 20),
        position: body.position ?? 0,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[project-items] folder create error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ id: data.id, type: "folder" }, { status: 201 });
  }

  // Handle other item types
  const ALLOWED_TYPES = ["image", "video", "file", "link", "note", "embed", "reference", "moodboard"];
  const itemType = ALLOWED_TYPES.includes(body.itemType as string) ? body.itemType : "note";

  const { data, error } = await (supabase.from("project_items") as any)
    .insert({
      project_id: projectId,
      folder_id: body.folderId || null,
      item_type: itemType,
      title: String(body.title || "").slice(0, 500),
      description: String(body.description || "").slice(0, 5000),
      content: String(body.content || "").slice(0, 50000),
      url: body.url ? String(body.url).slice(0, 2000) : null,
      file_path: body.filePath || null,
      file_size: body.fileSize || null,
      mime_type: body.mimeType || null,
      thumbnail_url: body.thumbnailUrl || null,
      tags: Array.isArray(body.tags) ? body.tags.slice(0, 20) : [],
      metadata: body.metadata || {},
      position: body.position ?? 0,
      is_pinned: body.isPinned || false,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[project-items] create error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id, type: itemType }, { status: 201 });
}
