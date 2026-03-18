import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

// POST /api/clients/bulk — bulk actions (archive, restore, delete)
export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const body = await req.json();
  const { action, ids } = body as { action: string; ids: string[] };

  if (!action || !Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json(
      { error: "Missing action or ids" },
      { status: 400 }
    );
  }

  const validActions = ["archive", "restore", "delete"];
  if (!validActions.includes(action)) {
    return NextResponse.json(
      { error: `Invalid action. Must be one of: ${validActions.join(", ")}` },
      { status: 400 }
    );
  }

  let updated = 0;

  if (action === "archive") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from("clients") as any)
      .update({
        status: "archived",
        archived_at: new Date().toISOString(),
      })
      .in("id", ids)
      .eq("user_id", user.id)
      .eq("status", "active")
      .select("id");

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    updated = data?.length ?? 0;
  } else if (action === "restore") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from("clients") as any)
      .update({
        status: "active",
        archived_at: null,
      })
      .in("id", ids)
      .eq("user_id", user.id)
      .eq("status", "archived")
      .select("id");

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    updated = data?.length ?? 0;
  } else if (action === "delete") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from("clients") as any)
      .update({
        status: "deleted",
        deleted_at: new Date().toISOString(),
      })
      .in("id", ids)
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .select("id");

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    updated = data?.length ?? 0;
  }

  return NextResponse.json({ updated });
}
