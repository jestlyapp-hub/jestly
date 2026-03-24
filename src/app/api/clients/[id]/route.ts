import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

// GET /api/clients/[id] — client detail + orders count
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: client, error } = await (supabase.from("clients") as any)
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });

  // Count orders
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count } = await (supabase.from("orders") as any)
    .select("*", { count: "exact", head: true })
    .eq("client_id", id)
    .eq("user_id", user.id);

  return NextResponse.json({ ...client, orders_count: count ?? 0 });
}

// PATCH /api/clients/[id] — update client fields + status management
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const body = await req.json();
  const allowed = [
    "name", "email", "phone", "company", "notes", "tags", "status",
    "website", "address", "source", "language", "timezone", "custom_fields",
  ];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Aucun champ valide à mettre à jour" }, { status: 400 });
  }

  // Handle status transitions for archived_at
  if (updates.status === "archived") {
    updates.archived_at = new Date().toISOString();
  } else if (updates.status === "active") {
    // Fetch current status to check if restoring from archived
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: current } = await (supabase.from("clients") as any)
      .select("status")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (current?.status === "archived") {
      updates.archived_at = null;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("clients") as any)
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Log status_changed event if status was updated
  if ("status" in body) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("client_events") as any).insert({
      client_id: id,
      type: "status_changed",
      payload: { new_status: body.status },
    });
  }

  return NextResponse.json(data);
}

// DELETE /api/clients/[id] — soft delete
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  // Verify ownership
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: client, error: fetchError } = await (supabase.from("clients") as any)
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !client) {
    return NextResponse.json({ error: "Client introuvable" }, { status: 404 });
  }

  // Count dependencies
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count: ordersCount } = await (supabase.from("orders") as any)
    .select("*", { count: "exact", head: true })
    .eq("client_id", id)
    .eq("user_id", user.id);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count: invoicesCount } = await (supabase.from("invoices") as any)
    .select("*", { count: "exact", head: true })
    .eq("client_id", id);

  // Soft delete
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateError } = await (supabase.from("clients") as any)
    .update({ status: "deleted", deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Log deletion event
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from("client_events") as any).insert({
    client_id: id,
    type: "client_deleted",
    payload: { orders: ordersCount ?? 0, invoices: invoicesCount ?? 0 },
  });

  return NextResponse.json({
    ok: true,
    dependencies: {
      orders: ordersCount ?? 0,
      invoices: invoicesCount ?? 0,
    },
  });
}
