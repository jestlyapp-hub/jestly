import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

// GET — Get ticket detail + all messages + attachments
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;
  const { id } = await params;

  // Fetch ticket with ownership check
  const { data: ticket, error: ticketError } = await (supabase.from("support_tickets") as any)
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (ticketError || !ticket) {
    return NextResponse.json({ error: "Ticket introuvable" }, { status: 404 });
  }

  // Fetch messages
  const { data: messages } = await (supabase.from("support_messages") as any)
    .select("*")
    .eq("ticket_id", id)
    .order("created_at", { ascending: true });

  // Fetch attachments
  const { data: attachments } = await (supabase.from("support_attachments") as any)
    .select("*")
    .eq("ticket_id", id)
    .order("created_at", { ascending: true });

  return NextResponse.json({
    ticket,
    messages: messages || [],
    attachments: attachments || [],
  });
}

// PATCH — Update ticket status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;
  const { id } = await params;

  const body = await req.json();
  const { status } = body;

  const validStatuses = ["open", "in_progress", "resolved", "closed"];
  if (!status || !validStatuses.includes(status)) {
    return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
  }

  // Ownership check
  const { data: existing } = await (supabase.from("support_tickets") as any)
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Ticket introuvable" }, { status: 404 });
  }

  const { data: ticket, error } = await (supabase.from("support_tickets") as any)
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(ticket);
}
