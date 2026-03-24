import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

// POST /api/orders/board/statuses — create a new status column
export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const body = await req.json();
  const { name, color, view, board_id } = body;

  if (!name) return NextResponse.json({ error: "Le nom est requis" }, { status: 400 });
  const statusView = view === "cash" ? "cash" : "production";

  // Resolve board_id
  let boardId = board_id;
  if (!boardId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: boards } = await (supabase.from("order_boards") as any)
      .select("id")
      .eq("user_id", user.id)
      .eq("is_default", true)
      .limit(1);
    boardId = boards?.[0]?.id;
    if (!boardId) return NextResponse.json({ error: "Aucun tableau trouvé" }, { status: 404 });
  }

  // Get max position for this view
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase.from("order_statuses") as any)
    .select("position")
    .eq("board_id", boardId)
    .eq("view", statusView)
    .order("position", { ascending: false })
    .limit(1);

  const maxPos = existing?.[0]?.position ?? -1;
  const slug = generateSlug(name) + "_" + Date.now().toString(36);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("order_statuses") as any)
    .insert({
      board_id: boardId,
      slug,
      name,
      color: color || "gray",
      view: statusView,
      position: maxPos + 1,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
