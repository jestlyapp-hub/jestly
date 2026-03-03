import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

// PATCH /api/orders/board/fields/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  // Use select("*") — resilient whether is_system column exists or not
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase.from("order_fields") as any)
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  const body = await req.json();
  // Base allowed fields (always exist on order_fields)
  const allowed = ["label", "field_type", "options", "is_required", "is_visible_on_card", "position"];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  // config column only exists if migration 012 was applied
  if ("config" in body) updates.config = body.config;

  // System columns: cannot change field_type or key
  if (existing?.is_system) {
    delete updates.field_type;
    delete updates.key;
  }

  // Block reserved labels for custom columns
  if (updates.label && !existing?.is_system) {
    const BASE_LABELS = new Set(["Titre", "Client", "Prix", "Statut", "Deadline", "Date"]);
    if (BASE_LABELS.has(String(updates.label).trim())) {
      return NextResponse.json({ error: "Ce nom est reserve (colonne de base)" }, { status: 400 });
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(existing);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let { data, error } = await (supabase.from("order_fields") as any)
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .single();

  // If config column doesn't exist, retry without it
  if (error?.message?.includes("config")) {
    delete updates.config;
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(existing);
    }
    ({ data, error } = await (supabase.from("order_fields") as any)
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select("*")
      .single());
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE /api/orders/board/fields/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  // Use select("*") — resilient whether is_system column exists or not
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: field } = await (supabase.from("order_fields") as any)
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (field?.is_system) {
    return NextResponse.json({ error: "Les colonnes systeme ne peuvent pas etre supprimees" }, { status: 403 });
  }

  // Cascade: strip custom field key from all orders (RPC may not exist pre-migration 012)
  if (field?.key) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.rpc as any)("strip_custom_field_key", {
        p_user_id: user.id,
        p_key: field.key,
      });
    } catch {
      // RPC not available — cascade cleanup skipped (values stay orphaned in custom_fields JSONB)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("order_fields") as any)
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
