import { NextRequest, NextResponse } from "next/server";
import {
  requireAdmin,
  logAdminAction,
  validateUuid,
  checkAdminRateLimit,
  ADMIN_ACTIONS,
} from "@/lib/admin";

// GET — Lead detail with attribution, notes, activity, conversions
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { user } = auth;

  const { id } = await params;

  if (!validateUuid(id)) {
    return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
  }

  const rateLimitResponse = checkAdminRateLimit(user.id, "lead_detail", 30);
  if (rateLimitResponse) {
    await logAdminAction(user.id, ADMIN_ACTIONS.RATE_LIMIT_HIT, undefined, { endpoint: "lead_detail" });
    return rateLimitResponse;
  }

  const supabase = auth.adminClient;

  // ── 1. Fetch lead ──
  const { data: lead, error: leadErr } = await (supabase.from("leads") as any)
    .select("*")
    .eq("id", id)
    .single();

  if (leadErr || !lead) {
    return NextResponse.json({ error: "Lead introuvable" }, { status: 404 });
  }

  // ── 2. Parallel fetch: attribution, notes, activity, conversions ──
  const [touchesRes, notesRes, activityRes, conversionsRes] = await Promise.all([
    (supabase.from("lead_attribution_touches") as any)
      .select("*")
      .eq("lead_id", id)
      .order("touched_at", { ascending: true }),
    (supabase.from("lead_notes") as any)
      .select("*")
      .eq("lead_id", id)
      .order("created_at", { ascending: false }),
    (supabase.from("lead_activity_log") as any)
      .select("*")
      .eq("lead_id", id)
      .order("created_at", { ascending: false })
      .limit(100),
    (supabase.from("lead_conversions") as any)
      .select("*")
      .eq("lead_id", id)
      .order("created_at", { ascending: false }),
  ]);

  await logAdminAction(user.id, "view_lead", id);

  return NextResponse.json({
    lead,
    attribution_touches: touchesRes.data || [],
    notes: notesRes.data || [],
    activity_log: activityRes.data || [],
    conversions: conversionsRes.data || [],
  });
}

// PATCH — Update lead (status, owner, tags, quality_tier, notes, score)
export async function PATCH(
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

  const rateLimitResponse = checkAdminRateLimit(user.id, "lead_update", 20);
  if (rateLimitResponse) {
    await logAdminAction(user.id, ADMIN_ACTIONS.RATE_LIMIT_HIT, undefined, { endpoint: "lead_update" });
    return rateLimitResponse;
  }

  const supabase = auth.adminClient;
  const body = await req.json();

  // ── 1. Fetch current lead for change detection ──
  const { data: currentLead } = await (supabase.from("leads") as any)
    .select("status, owner, tags")
    .eq("id", id)
    .single();

  if (!currentLead) {
    return NextResponse.json({ error: "Lead introuvable" }, { status: 404 });
  }

  const allowed = ["status", "owner", "tags", "quality_tier", "notes", "score"];
  const safeUpdates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) {
      safeUpdates[key] = body[key];
    }
  }

  if (Object.keys(safeUpdates).length === 0) {
    return NextResponse.json({ error: "Aucun champ à mettre à jour" }, { status: 400 });
  }

  // ── 2. Update lead ──
  const { data, error } = await (supabase.from("leads") as any)
    .update(safeUpdates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[admin/leads/id] PATCH error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  // ── 3. Log activity for specific changes ──
  const activityInserts: any[] = [];

  if ("status" in body && body.status !== currentLead.status) {
    activityInserts.push({
      lead_id: id,
      activity_type: "status_change",
      description: `Statut changé de "${currentLead.status || "none"}" à "${body.status}"`,
      actor_id: user.id,
      metadata: { old_status: currentLead.status, new_status: body.status },
    });
  }

  if ("owner" in body && body.owner !== currentLead.owner) {
    activityInserts.push({
      lead_id: id,
      activity_type: "owner_change",
      description: `Owner changé de "${currentLead.owner || "none"}" à "${body.owner}"`,
      actor_id: user.id,
      metadata: { old_owner: currentLead.owner, new_owner: body.owner },
    });
  }

  if ("tags" in body) {
    const oldTags = currentLead.tags || [];
    const newTags = body.tags || [];
    const added = newTags.filter((t: string) => !oldTags.includes(t));
    const removed = oldTags.filter((t: string) => !newTags.includes(t));
    if (added.length > 0 || removed.length > 0) {
      activityInserts.push({
        lead_id: id,
        activity_type: "tags_change",
        description: `Tags modifiés${added.length > 0 ? ` +${added.join(",")}` : ""}${removed.length > 0 ? ` -${removed.join(",")}` : ""}`,
        actor_id: user.id,
        metadata: { added, removed },
      });
    }
  }

  if (activityInserts.length > 0) {
    await (supabase.from("lead_activity_log") as any).insert(activityInserts);
  }

  await logAdminAction(user.id, "update_lead", id, { fields: Object.keys(safeUpdates) });

  return NextResponse.json({ data });
}
