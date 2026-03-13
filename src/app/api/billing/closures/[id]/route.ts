import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

// PATCH /api/billing/closures/[id] — reopen or update closure
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const body = await req.json();
  const updates: Record<string, unknown> = {};

  if (body.status === "reopened") {
    updates.status = "reopened";
    updates.reopened_at = new Date().toISOString();
  } else if (body.status === "closed") {
    updates.status = "closed";
    updates.closed_at = new Date().toISOString();
    updates.reopened_at = null;
  }

  if (body.notes !== undefined) updates.notes = body.notes;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("billing_period_closures") as any)
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
