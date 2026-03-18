import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "application/pdf",
];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

// POST — Upload attachment to a support ticket
export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const ticketId = formData.get("ticket_id") as string | null;

  if (!file) {
    return NextResponse.json({ error: "Fichier requis" }, { status: 400 });
  }

  if (!ticketId) {
    return NextResponse.json({ error: "ticket_id requis" }, { status: 400 });
  }

  // Validate file size
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "Le fichier dépasse la limite de 10 Mo" },
      { status: 400 }
    );
  }

  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Type de fichier non autorisé. Formats acceptés : PNG, JPEG, WebP, GIF, PDF" },
      { status: 400 }
    );
  }

  // Ownership check
  const { data: ticket } = await (supabase.from("support_tickets") as any)
    .select("id")
    .eq("id", ticketId)
    .eq("user_id", user.id)
    .single();

  if (!ticket) {
    return NextResponse.json({ error: "Ticket introuvable" }, { status: 404 });
  }

  // Generate unique path
  const uuid = crypto.randomUUID();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filePath = `${ticketId}/${uuid}_${safeName}`;

  // Upload to Supabase Storage
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: uploadError } = await supabase.storage
    .from("support-attachments")
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json(
      { error: "Erreur lors de l'upload : " + uploadError.message },
      { status: 500 }
    );
  }

  // Insert record in support_attachments
  const { data: attachment, error: insertError } = await (supabase.from("support_attachments") as any)
    .insert({
      ticket_id: ticketId,
      file_name: file.name,
      file_path: filePath,
      file_type: file.type,
      file_size: file.size,
      uploaded_by: user.id,
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json(
      { error: "Erreur lors de l'enregistrement : " + insertError.message },
      { status: 500 }
    );
  }

  // Generate signed URL (1h)
  const { data: signedData } = await supabase.storage
    .from("support-attachments")
    .createSignedUrl(filePath, 3600);

  return NextResponse.json(
    {
      id: attachment.id,
      file_name: attachment.file_name,
      file_path: attachment.file_path,
      file_type: attachment.file_type,
      file_size: attachment.file_size,
      url: signedData?.signedUrl || null,
    },
    { status: 201 }
  );
}
