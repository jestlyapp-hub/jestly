import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = new Set([
  "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
  "image/x-icon", "image/vnd.microsoft.icon",
  "application/pdf",
  "video/mp4", "video/quicktime",
]);

// POST /api/upload — upload file to order-uploads bucket (authenticated only)
export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { supabase } = auth;

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
  }

  const ext = file.name.split(".").pop() || "bin";
  const safeName = ext.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10) || "bin";
  const path = `${crypto.randomUUID()}.${safeName}`;

  const { error } = await supabase.storage
    .from("order-uploads")
    .upload(path, file, { contentType: file.type });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: urlData } = supabase.storage
    .from("order-uploads")
    .getPublicUrl(path);

  return NextResponse.json({
    url: urlData.publicUrl,
    name: file.name,
    size: file.size,
  });
}
