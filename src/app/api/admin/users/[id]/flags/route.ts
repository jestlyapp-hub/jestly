import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, logAdminAction, VALID_FLAG_TYPES, validateUuid, checkAdminRateLimit, ADMIN_ACTIONS } from "@/lib/admin";

// POST — Add flag to user
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { id } = await params;

  // Validation du format UUID
  if (!validateUuid(id)) {
    return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
  }

  // Rate limit : 20 requêtes/min
  const rateLimitResponse = checkAdminRateLimit(auth.user.id, "flags_post", 20);
  if (rateLimitResponse) {
    await logAdminAction(auth.user.id, ADMIN_ACTIONS.RATE_LIMIT_HIT, undefined, { endpoint: "flags_post" });
    return rateLimitResponse;
  }

  const body = await req.json();
  const { flag_type, reason } = body;

  if (!flag_type || !VALID_FLAG_TYPES.includes(flag_type)) {
    return NextResponse.json(
      { error: `Type de flag invalide. Types valides : ${VALID_FLAG_TYPES.join(", ")}` },
      { status: 400 },
    );
  }

  const supabase = auth.adminClient;

  const { data, error } = await (supabase.from("admin_account_flags") as any)
    .insert({
      account_id: id,
      flag_type,
      reason: reason || null,
      created_by: auth.user.id,
    })
    .select("id, flag_type, reason, created_at, resolved_at")
    .single();

  if (error) {
    // Unique constraint violation = flag already exists
    if (error.code === "23505") {
      return NextResponse.json({ error: "Ce flag existe deja pour cet utilisateur" }, { status: 409 });
    }
    console.error("[admin/users/flags] POST error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  await logAdminAction(auth.user.id, "add_flag", id, { flag_type, reason });

  return NextResponse.json({ data });
}

// DELETE — Remove flag (set resolved_at)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { id } = await params;

  // Validation du format UUID
  if (!validateUuid(id)) {
    return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
  }

  // Rate limit : 20 requêtes/min
  const rateLimitResponse = checkAdminRateLimit(auth.user.id, "flags_delete", 20);
  if (rateLimitResponse) {
    await logAdminAction(auth.user.id, ADMIN_ACTIONS.RATE_LIMIT_HIT, undefined, { endpoint: "flags_delete" });
    return rateLimitResponse;
  }

  const url = new URL(req.url);
  const flagId = url.searchParams.get("flag_id");

  if (!flagId) {
    return NextResponse.json({ error: "flag_id requis" }, { status: 400 });
  }

  const supabase = auth.adminClient;

  const { data, error } = await (supabase.from("admin_account_flags") as any)
    .update({ resolved_at: new Date().toISOString() })
    .eq("id", flagId)
    .eq("account_id", id)
    .select("id, flag_type, reason, created_at, resolved_at")
    .single();

  if (error) {
    console.error("[admin/users/flags] DELETE error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  await logAdminAction(auth.user.id, "remove_flag", id, { flag_id: flagId, flag_type: data?.flag_type });

  return NextResponse.json({ data });
}
