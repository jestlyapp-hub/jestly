import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

// Helper: verify the status belongs to a board owned by the user
async function verifyOwnership(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  statusId: string,
  userId: string
): Promise<{ boardId: string } | null> {
  const { data: status } = await supabase
    .from("order_statuses")
    .select("board_id")
    .eq("id", statusId)
    .single();

  if (!status) return null;

  const { data: board } = await supabase
    .from("order_boards")
    .select("id")
    .eq("id", status.board_id)
    .eq("user_id", userId)
    .single();

  return board ? { boardId: board.id } : null;
}

// PATCH /api/orders/board/statuses/[id] — update a status
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const ownership = await verifyOwnership(supabase, id, user.id);
  if (!ownership) return NextResponse.json({ error: "not found" }, { status: 404 });

  const body = await req.json();
  const allowed = ["name", "color", "view", "is_archived", "position"];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("order_statuses") as any)
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE /api/orders/board/statuses/[id] — archive a status
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const ownership = await verifyOwnership(supabase, id, user.id);
  if (!ownership) return NextResponse.json({ error: "not found" }, { status: 404 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("order_statuses") as any)
    .update({ is_archived: true })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
