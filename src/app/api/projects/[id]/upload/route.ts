import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = new Set([
  "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
  "application/pdf",
  "video/mp4", "video/quicktime",
  "application/zip", "application/x-zip-compressed",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain", "text/csv",
  "application/json",
  "font/ttf", "font/otf", "font/woff", "font/woff2",
]);

type Ctx = { params: Promise<{ id: string }> };

// POST /api/projects/[id]/upload — upload asset to project
export async function POST(req: NextRequest, ctx: Ctx) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;
  const { id: projectId } = await ctx.params;

  // Verify project ownership
  const { data: project, error: projErr } = await (supabase.from("projects") as any)
    .select("id")
    .eq("id", projectId)
    .single();

  if (projErr) {
    if (projErr.code === "PGRST205" || projErr.code === "42P01") {
      return NextResponse.json({ error: "Table 'projects' manquante. Exécutez la migration.", errorType: "migration" }, { status: 503 });
    }
    if (projErr.code === "PGRST116") {
      return NextResponse.json({ error: "Projet introuvable", errorType: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ error: projErr.message || "Erreur serveur", errorType: "database" }, { status: 500 });
  }
  if (!project) {
    return NextResponse.json({ error: "Projet introuvable", errorType: "not_found" }, { status: 404 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Fichier trop volumineux (max 10Mo)" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: `Type de fichier non autorisé: ${file.type}` }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10) || "bin";
  const storagePath = `${user.id}/projects/${projectId}/${crypto.randomUUID()}.${ext}`;

  // Upload to order-uploads bucket (shared bucket)
  const { error: uploadErr } = await supabase.storage
    .from("order-uploads")
    .upload(storagePath, file, { contentType: file.type });

  if (uploadErr) {
    console.error("[project-upload] upload error:", uploadErr);
    return NextResponse.json({ error: uploadErr.message }, { status: 500 });
  }

  const { data: urlData } = supabase.storage
    .from("order-uploads")
    .getPublicUrl(storagePath);

  return NextResponse.json({
    url: urlData.publicUrl,
    path: storagePath,
    name: file.name,
    size: file.size,
    type: file.type,
  });
}

// DELETE /api/projects/[id]/upload — delete asset from storage
export async function DELETE(req: NextRequest, ctx: Ctx) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;
  const { id: projectId } = await ctx.params;

  let body: { path: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  // Security: ensure path belongs to this user/project
  if (!body.path?.startsWith(`${user.id}/projects/${projectId}/`)) {
    return NextResponse.json({ error: "Chemin non autorisé" }, { status: 403 });
  }

  const { error } = await supabase.storage
    .from("order-uploads")
    .remove([body.path]);

  if (error) {
    console.error("[project-upload] delete error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
