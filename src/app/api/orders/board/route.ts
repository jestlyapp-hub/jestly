import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import {
  DEFAULT_PRODUCTION_STATUSES,
  DEFAULT_CASH_STATUSES,
  DEFAULT_FIELDS,
} from "@/lib/kanban-config";

// GET /api/orders/board — board + statuses grouped by view + fields
export async function GET() {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  // 1. Find or create default board
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let { data: boards, error: boardErr } = await (supabase.from("order_boards") as any)
    .select("*")
    .eq("user_id", user.id)
    .eq("is_default", true)
    .limit(1);

  if (boardErr) return NextResponse.json({ error: boardErr.message }, { status: 500 });

  let board = boards?.[0];

  if (!board) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: created, error: createErr } = await (supabase.from("order_boards") as any)
      .insert({ user_id: user.id, name: "Board principal", is_default: true })
      .select("*")
      .single();
    if (createErr) return NextResponse.json({ error: createErr.message }, { status: 500 });
    board = created;
  }

  const boardId = board.id;

  // 2. Load all statuses for this board (not archived)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let { data: allStatuses, error: statusErr } = await (supabase.from("order_statuses") as any)
    .select("*")
    .eq("board_id", boardId)
    .eq("is_archived", false)
    .order("position");

  if (statusErr) return NextResponse.json({ error: statusErr.message }, { status: 500 });

  // Seed if no statuses exist at all
  if (!allStatuses || allStatuses.length === 0) {
    const inserts = [
      ...DEFAULT_PRODUCTION_STATUSES.map((s) => ({ board_id: boardId, ...s })),
      ...DEFAULT_CASH_STATUSES.map((s) => ({ board_id: boardId, ...s })),
    ];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: seeded, error: seedErr } = await (supabase.from("order_statuses") as any)
      .insert(inserts)
      .select("*");
    if (seedErr) return NextResponse.json({ error: seedErr.message }, { status: 500 });
    allStatuses = seeded;

    // Map existing orders to new status_id by slug
    if (allStatuses && allStatuses.length > 0) {
      for (const st of allStatuses) {
        if (!st.slug) continue;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from("orders") as any)
          .update({ status_id: st.id })
          .eq("user_id", user.id)
          .eq("status", st.slug)
          .is("status_id", null);
      }
    }
  }

  // Group by view
  const production = (allStatuses ?? [])
    .filter((s: { view: string }) => s.view === "production")
    .sort((a: { position: number }, b: { position: number }) => a.position - b.position);
  const cash = (allStatuses ?? [])
    .filter((s: { view: string }) => s.view === "cash")
    .sort((a: { position: number }, b: { position: number }) => a.position - b.position);

  // 3. Load fields
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let { data: fields, error: fieldsErr } = await (supabase.from("order_fields") as any)
    .select("*")
    .eq("user_id", user.id)
    .order("position");

  if (fieldsErr) return NextResponse.json({ error: fieldsErr.message }, { status: 500 });

  // Seed default fields if none
  if (!fields || fields.length === 0) {
    const fieldInserts = DEFAULT_FIELDS.map((f) => ({
      user_id: user.id,
      key: f.key,
      label: f.label,
      field_type: f.field_type,
      options: (f as Record<string, unknown>).options || [],
      is_required: false,
      is_visible_on_card: (f as Record<string, unknown>).is_visible_on_card ?? false,
      position: f.position,
    }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: seededFields, error: seedFieldErr } = await (supabase.from("order_fields") as any)
      .insert(fieldInserts)
      .select("*");
    if (seedFieldErr) return NextResponse.json({ error: seedFieldErr.message }, { status: 500 });
    fields = seededFields;
  }

  return NextResponse.json({
    board: { id: boardId, name: board.name },
    statuses: { production, cash },
    fields: fields ?? [],
  });
}
