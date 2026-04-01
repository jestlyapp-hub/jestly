import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

const MAX_SIZE = 10 * 1024 * 1024; // 10 Mo
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

// POST /api/tasks/attachments — Upload une image pour tâche/sous-tâche
export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { supabase, user } = auth;
  const userId = user.id;

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "Fichier trop volumineux (max 10 Mo)" },
      { status: 400 },
    );
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Format non supporté. Formats acceptés : JPG, PNG, WebP, GIF" },
      { status: 400 },
    );
  }

  const ext = file.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10) || "jpg";
  const storagePath = `tasks/${userId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from("order-uploads")
    .upload(storagePath, file, { contentType: file.type });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: urlData } = supabase.storage
    .from("order-uploads")
    .getPublicUrl(storagePath);

  return NextResponse.json({
    url: urlData.publicUrl,
    fileName: file.name,
    mimeType: file.type,
    size: file.size,
    storagePath,
  });
}

// DELETE /api/tasks/attachments — Supprime un fichier du storage
export async function DELETE(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { supabase, user } = auth;
  const userId = user.id;

  const { storagePath } = await req.json();

  if (!storagePath || typeof storagePath !== "string") {
    return NextResponse.json({ error: "storagePath requis" }, { status: 400 });
  }

  // Sécurité : vérifier que le path appartient à l'utilisateur
  if (!storagePath.startsWith(`tasks/${userId}/`)) {
    return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
  }

  const { error } = await supabase.storage
    .from("order-uploads")
    .remove([storagePath]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
