import { NextRequest, NextResponse } from "next/server";
import {
  requireAdmin,
  logAdminAction,
  validateUuid,
  checkAdminRateLimit,
  ADMIN_ACTIONS,
} from "@/lib/admin";

// GET — Email campaign detail
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

  const { data: campaign, error } = await (supabase.from("email_campaigns") as any)
    .select("*")
    .eq("id", id)
    .single();

  if (error || !campaign) {
    return NextResponse.json({ error: "Email campaign introuvable" }, { status: 404 });
  }

  // Fetch recipients stats
  const { data: recipients, count: recipientCount } = await (supabase.from("email_campaign_recipients") as any)
    .select("id, email, status, sent_at, delivered_at, opened_at, clicked_at", { count: "exact" })
    .eq("email_campaign_id", id)
    .order("created_at", { ascending: false })
    .limit(100);

  return NextResponse.json({
    data: campaign,
    recipients: recipients || [],
    recipient_count: recipientCount || 0,
  });
}

// PATCH — Update email campaign
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

  const rateLimitResponse = checkAdminRateLimit(user.id, "email_campaign_update", 20);
  if (rateLimitResponse) {
    await logAdminAction(user.id, ADMIN_ACTIONS.RATE_LIMIT_HIT, undefined, { endpoint: "email_campaign_update" });
    return rateLimitResponse;
  }

  const supabase = auth.adminClient;
  const body = await req.json();

  const allowed = [
    "name", "subject", "preview_text", "sender_name", "sender_email",
    "campaign_id", "audience_type", "audience_filter", "template_key",
    "html_content", "scheduled_at", "notes", "status",
  ];

  const safeUpdates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) {
      safeUpdates[key] = body[key];
    }
  }

  if (Object.keys(safeUpdates).length === 0) {
    return NextResponse.json({ error: "Aucun champ à mettre à jour" }, { status: 400 });
  }

  const { data, error } = await (supabase.from("email_campaigns") as any)
    .update(safeUpdates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[admin/email-campaigns/id] PATCH error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  await logAdminAction(user.id, "update_email_campaign", id, { fields: Object.keys(safeUpdates) });

  return NextResponse.json({ data });
}
