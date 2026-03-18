import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

// GET — List user's tickets (ordered by updated_at desc)
export async function GET() {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const { data: tickets, error } = await (supabase.from("support_tickets") as any)
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fetch message counts
  const ticketIds = (tickets || []).map((t: any) => t.id);

  let enriched = tickets || [];

  if (ticketIds.length > 0) {
    // Manual count per ticket
    const { data: messages } = await (supabase.from("support_messages") as any)
      .select("ticket_id, created_at")
      .in("ticket_id", ticketIds)
      .order("created_at", { ascending: false });

    const countMap: Record<string, { count: number; last_at: string | null }> = {};
    for (const msg of messages || []) {
      if (!countMap[msg.ticket_id]) {
        countMap[msg.ticket_id] = { count: 0, last_at: msg.created_at };
      }
      countMap[msg.ticket_id].count++;
    }

    enriched = (tickets || []).map((t: any) => ({
      ...t,
      message_count: countMap[t.id]?.count || 0,
      last_message_at: countMap[t.id]?.last_at || null,
    }));
  }

  return NextResponse.json(enriched);
}

// POST — Create a ticket (title + optional first message)
export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const body = await req.json();
  const { title, message } = body;

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return NextResponse.json({ error: "Le titre est requis" }, { status: 400 });
  }

  // Create ticket
  const { data: ticket, error: ticketError } = await (supabase.from("support_tickets") as any)
    .insert({
      user_id: user.id,
      title: title.trim(),
      status: "open",
    })
    .select()
    .single();

  if (ticketError) {
    return NextResponse.json({ error: ticketError.message }, { status: 500 });
  }

  // Create first message if provided
  if (message && typeof message === "string" && message.trim().length > 0) {
    await (supabase.from("support_messages") as any).insert({
      ticket_id: ticket.id,
      sender_id: user.id,
      message: message.trim(),
      is_admin: false,
      sender_type: "user",
    });

    // Update last_message_preview
    await (supabase.from("support_tickets") as any)
      .update({ last_message_preview: message.trim().slice(0, 100), updated_at: new Date().toISOString() })
      .eq("id", ticket.id);
  }

  return NextResponse.json(ticket, { status: 201 });
}
