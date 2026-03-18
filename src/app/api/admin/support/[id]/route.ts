import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";

// GET — Get ticket + messages + attachments (admin)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const supabase = auth.adminClient;
  const { id } = await params;

  const { data: ticket, error: ticketError } = await (supabase.from("support_tickets") as any)
    .select("*, profiles:user_id(full_name, email)")
    .eq("id", id)
    .single();

  if (ticketError || !ticket) {
    return NextResponse.json({ error: "Ticket introuvable" }, { status: 404 });
  }

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
    ticket: {
      ...ticket,
      user_name: ticket.profiles?.full_name || null,
      user_email: ticket.profiles?.email || null,
    },
    messages: messages || [],
    attachments: attachments || [],
  });
}

// PATCH — Update ticket status (admin)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const supabase = auth.adminClient;
  const { id } = await params;

  const body = await req.json();
  const { status } = body;

  const validStatuses = ["open", "in_progress", "resolved", "closed"];
  if (!status || !validStatuses.includes(status)) {
    return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
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
