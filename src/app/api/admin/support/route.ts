import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";

// GET — List ALL tickets (admin only, with user info)
export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const supabase = auth.adminClient;

  const url = new URL(req.url);
  const status = url.searchParams.get("status") || "all";

  // Build query
  let query = (supabase.from("support_tickets") as any)
    .select("*, profiles:user_id(full_name, email)")
    .order("updated_at", { ascending: false });

  if (status !== "all") {
    const validStatuses = ["open", "in_progress", "resolved", "closed"];
    if (validStatuses.includes(status)) {
      query = query.eq("status", status);
    }
  }

  const { data: tickets, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fetch message counts
  const ticketIds = (tickets || []).map((t: any) => t.id);
  let enriched = tickets || [];

  if (ticketIds.length > 0) {
    const { data: messages } = await (supabase.from("support_messages") as any)
      .select("ticket_id")
      .in("ticket_id", ticketIds);

    const countMap: Record<string, number> = {};
    for (const msg of messages || []) {
      countMap[msg.ticket_id] = (countMap[msg.ticket_id] || 0) + 1;
    }

    enriched = (tickets || []).map((t: any) => ({
      ...t,
      message_count: countMap[t.id] || 0,
      user_name: t.profiles?.full_name || null,
      user_email: t.profiles?.email || null,
    }));
  }

  return NextResponse.json(enriched);
}
