import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

// PUT /api/orders/board/statuses/reorder — reorder statuses
export async function PUT(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const { ids } = await req.json();
  if (!Array.isArray(ids)) return NextResponse.json({ error: "ids array required" }, { status: 400 });

  // Find user's default board to verify ownership
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: boards } = await (supabase.from("order_boards") as any)
    .select("id")
    .eq("user_id", user.id)
    .eq("is_default", true)
    .limit(1);

  const boardId = boards?.[0]?.id;
  if (!boardId) return NextResponse.json({ error: "no board found" }, { status: 404 });

  // Update each status position (only those belonging to this board)
  for (let i = 0; i < ids.length; i++) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("order_statuses") as any)
      .update({ position: i })
      .eq("id", ids[i])
      .eq("board_id", boardId);
  }

  return NextResponse.json({ ok: true });
}
