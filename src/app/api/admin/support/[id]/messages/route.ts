import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";

// POST — Admin reply to a ticket (is_admin: true)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { user } = auth;
  const supabase = auth.adminClient;
  const { id } = await params;

  const body = await req.json();
  const { message } = body;

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return NextResponse.json({ error: "Le message est requis" }, { status: 400 });
  }

  // Verify ticket exists
  const { data: ticket } = await (supabase.from("support_tickets") as any)
    .select("id")
    .eq("id", id)
    .single();

  if (!ticket) {
    return NextResponse.json({ error: "Ticket introuvable" }, { status: 404 });
  }

  const trimmedMessage = message.trim();

  // Insert admin message
  const { data: msg, error: msgError } = await (supabase.from("support_messages") as any)
    .insert({
      ticket_id: id,
      sender_id: user.id,
      message: trimmedMessage,
      is_admin: true,
      sender_type: "admin",
    })
    .select()
    .single();

  if (msgError) {
    return NextResponse.json({ error: msgError.message }, { status: 500 });
  }

  // Update ticket: last_message_preview + status logic
  // Set status to in_progress if currently open
  await (supabase.from("support_tickets") as any)
    .update({
      updated_at: new Date().toISOString(),
      status: "in_progress",
      last_message_preview: trimmedMessage.slice(0, 100),
    })
    .eq("id", id)
    .eq("status", "open");

  // Always update updated_at + preview regardless of status
  await (supabase.from("support_tickets") as any)
    .update({
      updated_at: new Date().toISOString(),
      last_message_preview: trimmedMessage.slice(0, 100),
    })
    .eq("id", id);

  return NextResponse.json(msg, { status: 201 });
}
