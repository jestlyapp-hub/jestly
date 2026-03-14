import { NextRequest, NextResponse } from "next/server";
import {
  requireAdmin,
  logAdminAction,
  validateUuid,
  checkAdminRateLimit,
  ADMIN_ACTIONS,
} from "@/lib/admin";

// GET — List notes for a lead
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { id } = await params;

  if (!validateUuid(id)) {
    return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
  }

  const supabase = auth.adminClient;

  const { data, error } = await (supabase.from("lead_notes") as any)
    .select("*")
    .eq("lead_id", id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[admin/leads/notes] GET error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  return NextResponse.json({ data: data || [] });
}

// POST — Add note to a lead
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { user } = auth;

  const { id } = await params;

  if (!validateUuid(id)) {
    return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
  }

  const rateLimitResponse = checkAdminRateLimit(user.id, "lead_notes_post", 20);
  if (rateLimitResponse) {
    await logAdminAction(user.id, ADMIN_ACTIONS.RATE_LIMIT_HIT, undefined, { endpoint: "lead_notes_post" });
    return rateLimitResponse;
  }

  const body = await req.json();
  const { content } = body;

  if (!content || typeof content !== "string" || !content.trim()) {
    return NextResponse.json({ error: "Contenu requis" }, { status: 400 });
  }

  const supabase = auth.adminClient;

  // ── 1. Insert note ──
  const { data, error } = await (supabase.from("lead_notes") as any)
    .insert({
      lead_id: id,
      author_id: user.id,
      content: content.trim(),
    })
    .select()
    .single();

  if (error) {
    console.error("[admin/leads/notes] POST error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  // ── 2. Log activity ──
  await (supabase.from("lead_activity_log") as any).insert({
    lead_id: id,
    activity_type: "note_added",
    description: `Note ajoutée`,
    actor_id: user.id,
    metadata: { note_id: data.id },
  });

  await logAdminAction(user.id, "add_lead_note", id, { note_id: data.id });

  return NextResponse.json({ data });
}
