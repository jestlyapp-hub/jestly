import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

// GET /api/clients/[id]/events?limit=50
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const limit = Math.min(100, Number(req.nextUrl.searchParams.get("limit") || "50"));

  // Fetch explicit events
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: events } = await (supabase.from("client_events") as any)
    .select("*")
    .eq("client_id", id)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  // Fetch orders for synthetic events
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: orders } = await (supabase.from("orders") as any)
    .select("id, title, amount, status, created_at")
    .eq("client_id", id)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  // Build synthetic order_created events
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const syntheticEvents = (orders || []).map((o: any) => ({
    id: `order-${o.id}`,
    client_id: id,
    type: "order_created",
    payload: {
      order_id: o.id,
      title: o.title,
      amount: Number(o.amount),
      status: o.status,
    },
    created_at: o.created_at,
  }));

  // Merge and sort by date desc
  const allEvents = [...(events || []), ...syntheticEvents]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);

  return NextResponse.json(allEvents);
}
