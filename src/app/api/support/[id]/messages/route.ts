import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

// POST — Add a message to a ticket
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;
  const { id } = await params;

  const body = await req.json();
  const { message } = body;

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return NextResponse.json({ error: "Le message est requis" }, { status: 400 });
  }

  // Ownership check
  const { data: ticket } = await (supabase.from("support_tickets") as any)
    .select("id, status")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!ticket) {
    return NextResponse.json({ error: "Ticket introuvable" }, { status: 404 });
  }

  const trimmedMessage = message.trim();

  // Insert message
  const { data: msg, error: msgError } = await (supabase.from("support_messages") as any)
    .insert({
      ticket_id: id,
      sender_id: user.id,
      message: trimmedMessage,
      is_admin: false,
      sender_type: "user",
    })
    .select()
    .single();

  if (msgError) {
    return NextResponse.json({ error: msgError.message }, { status: 500 });
  }

  // Build ticket update
  const ticketUpdate: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
    last_message_preview: trimmedMessage.slice(0, 100),
  };

  // Auto-reopen if resolved
  if (ticket.status === "resolved") {
    ticketUpdate.status = "open";
  }

  await (supabase.from("support_tickets") as any)
    .update(ticketUpdate)
    .eq("id", id);

  return NextResponse.json(msg, { status: 201 });
}
