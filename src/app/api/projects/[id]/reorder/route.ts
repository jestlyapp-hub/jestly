import { NextResponse, type NextRequest } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

type Ctx = { params: Promise<{ id: string }> };

// PATCH /api/projects/[id]/reorder — batch update positions
export async function PATCH(req: NextRequest, ctx: Ctx) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { supabase } = auth;
  const { id: projectId } = await ctx.params;

  let body: { items?: { id: string; position: number; folderId?: string | null }[]; folders?: { id: string; position: number }[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  // Verify project ownership
  const { data: project } = await (supabase.from("projects") as any)
    .select("id")
    .eq("id", projectId)
    .single();

  if (!project) {
    return NextResponse.json({ error: "Projet introuvable" }, { status: 404 });
  }

  const errors: string[] = [];

  // Update item positions
  if (body.items && Array.isArray(body.items)) {
    for (const item of body.items) {
      const updates: Record<string, unknown> = { position: item.position };
      if (item.folderId !== undefined) updates.folder_id = item.folderId;

      const { error } = await (supabase.from("project_items") as any)
        .update(updates)
        .eq("id", item.id)
        .eq("project_id", projectId);

      if (error) errors.push(`item ${item.id}: ${error.message}`);
    }
  }

  // Update folder positions
  if (body.folders && Array.isArray(body.folders)) {
    for (const folder of body.folders) {
      const { error } = await (supabase.from("project_folders") as any)
        .update({ position: folder.position })
        .eq("id", folder.id)
        .eq("project_id", projectId);

      if (error) errors.push(`folder ${folder.id}: ${error.message}`);
    }
  }

  if (errors.length > 0) {
    console.error("[project-reorder] errors:", errors);
    return NextResponse.json({ ok: false, errors }, { status: 207 });
  }

  return NextResponse.json({ ok: true });
}
