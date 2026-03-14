import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, logAdminAction, validateUuid, checkAdminRateLimit, ADMIN_ACTIONS } from "@/lib/admin";

// GET — List all admin notes for this user
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { id } = await params;

  // Validation du format UUID
  if (!validateUuid(id)) {
    return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
  }

  const supabase = auth.adminClient;

  const { data, error } = await (supabase.from("admin_account_notes") as any)
    .select("id, content, tags, is_pinned, created_at, updated_at")
    .eq("account_id", id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[admin/users/notes] GET error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  return NextResponse.json({ data: data || [] });
}

// POST — Add admin note about this user
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
  const rateLimitResponse = checkAdminRateLimit(auth.user.id, "notes_post", 20);
  if (rateLimitResponse) {
    await logAdminAction(auth.user.id, ADMIN_ACTIONS.RATE_LIMIT_HIT, undefined, { endpoint: "notes_post" });
    return rateLimitResponse;
  }

  const body = await req.json();
  const { content, tags } = body;

  if (!content || typeof content !== "string" || !content.trim()) {
    return NextResponse.json({ error: "Contenu requis" }, { status: 400 });
  }

  const supabase = auth.adminClient;

  const { data, error } = await (supabase.from("admin_account_notes") as any)
    .insert({
      account_id: id,
      author_id: auth.user.id,
      content: content.trim(),
      tags: Array.isArray(tags) ? tags : [],
    })
    .select("id, content, tags, is_pinned, created_at")
    .single();

  if (error) {
    console.error("[admin/users/notes] POST error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  await logAdminAction(auth.user.id, "add_note", id, { note_id: data.id });

  return NextResponse.json({ data });
}

// PATCH — Toggle pin on a note
export async function PATCH(
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

  const body = await req.json();
  const { note_id, is_pinned } = body;

  if (!note_id) {
    return NextResponse.json({ error: "note_id requis" }, { status: 400 });
  }

  const supabase = auth.adminClient;

  const { data, error } = await (supabase.from("admin_account_notes") as any)
    .update({ is_pinned: !!is_pinned })
    .eq("id", note_id)
    .eq("account_id", id)
    .select("id, content, tags, is_pinned, created_at")
    .single();

  if (error) {
    console.error("[admin/users/notes] PATCH error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  await logAdminAction(auth.user.id, "toggle_pin_note", id, { note_id, is_pinned });

  return NextResponse.json({ data });
}
