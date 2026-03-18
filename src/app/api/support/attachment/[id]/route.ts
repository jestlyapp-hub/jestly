import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

// GET — Get a signed URL for an attachment
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;
  const { id } = await params;

  // Fetch attachment
  const { data: attachment, error } = await (supabase.from("support_attachments") as any)
    .select("*, support_tickets!inner(user_id)")
    .eq("id", id)
    .single();

  if (error || !attachment) {
    return NextResponse.json({ error: "Pièce jointe introuvable" }, { status: 404 });
  }

  // Ownership check: user owns the ticket OR is admin (admin check via email)
  const isOwner = attachment.support_tickets?.user_id === user.id;
  const isAdmin = user.email?.toLowerCase() === "jestlyapp@gmail.com";

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
  }

  // Generate signed URL (1h)
  const { data: signedData, error: signError } = await supabase.storage
    .from("support-attachments")
    .createSignedUrl(attachment.file_path, 3600);

  if (signError || !signedData?.signedUrl) {
    return NextResponse.json(
      { error: "Erreur lors de la génération de l'URL" },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: signedData.signedUrl });
}
