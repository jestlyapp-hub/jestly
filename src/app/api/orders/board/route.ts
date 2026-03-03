import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import {
  DEFAULT_PRODUCTION_STATUSES,
  DEFAULT_CASH_STATUSES,
  LEGACY_SEEDED_KEYS,
  SYSTEM_COLUMNS,
} from "@/lib/kanban-config";

// GET /api/orders/board — board + statuses grouped by view + fields
// Resilient: returns defaults if workflow tables aren't available in PostgREST cache
export async function GET() {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  // Default response if tables aren't ready
  const defaultResponse = {
    board: { id: "default", name: "Board principal" },
    statuses: {
      production: DEFAULT_PRODUCTION_STATUSES.map((s, i) => ({ id: `default-${i}`, board_id: "default", ...s, is_archived: false, created_at: new Date().toISOString() })),
      cash: DEFAULT_CASH_STATUSES.map((s, i) => ({ id: `default-cash-${i}`, board_id: "default", ...s, is_archived: false, created_at: new Date().toISOString() })),
    },
    fields: [],
  };

  try {
    // 1. Find or create default board
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let { data: boards, error: boardErr } = await (supabase.from("order_boards") as any)
      .select("*")
      .eq("user_id", user.id)
      .eq("is_default", true)
      .limit(1);

    if (boardErr) {
      console.warn("[board] order_boards query failed, returning defaults:", boardErr.message);
      return NextResponse.json(defaultResponse);
    }

    let board = boards?.[0];

    if (!board) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: created, error: createErr } = await (supabase.from("order_boards") as any)
        .insert({ user_id: user.id, name: "Board principal", is_default: true })
        .select("*")
        .single();
      if (createErr) {
        console.warn("[board] order_boards insert failed, returning defaults:", createErr.message);
        return NextResponse.json(defaultResponse);
      }
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

    if (statusErr) {
      console.warn("[board] order_statuses query failed, returning defaults:", statusErr.message);
      return NextResponse.json(defaultResponse);
    }

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
      if (seedErr) {
        console.warn("[board] order_statuses seed failed:", seedErr.message);
        return NextResponse.json(defaultResponse);
      }
      allStatuses = seeded;
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

    if (fieldsErr) {
      console.warn("[board] order_fields query failed:", fieldsErr.message);
      fields = [];
    }

    // Seed system columns that don't exist yet (one-time per user)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingKeys = new Set((fields ?? []).map((f: any) => f.key));
    const missingSystem = SYSTEM_COLUMNS.filter((col) => !existingKeys.has(col.key));
    if (missingSystem.length > 0) {
      try {
        const inserts = missingSystem.map((col) => ({
          user_id: user.id,
          key: col.key,
          label: col.label,
          field_type: col.field_type,
          options: [],
          is_required: true,
          is_visible_on_card: false,
          is_system: true,
          config: ("config" in col ? col.config : {}) ?? {},
          position: col.position,
        }));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: seeded } = await (supabase.from("order_fields") as any)
          .insert(inserts)
          .select("*");
        if (seeded) fields = [...(fields ?? []), ...seeded];
      } catch {
        // is_system/config columns may not exist pre-migration — skip
      }
    }

    // Force legacy seeded fields to hidden (defense-in-depth even if migration 013 not applied)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cleanFields = (fields ?? []).map((f: any) => {
      if (LEGACY_SEEDED_KEYS.has(f.key) && !f.is_system) {
        return { ...f, config: { ...(f.config ?? {}), hidden: true } };
      }
      return f;
    });

    return NextResponse.json({
      board: { id: boardId, name: board.name },
      statuses: { production, cash },
      fields: cleanFields,
    });
  } catch (err) {
    console.error("[board] Unexpected error:", err);
    return NextResponse.json(defaultResponse);
  }
}
