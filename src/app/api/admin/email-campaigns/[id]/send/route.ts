import { NextRequest, NextResponse } from "next/server";
import {
  requireAdmin,
  logAdminAction,
  validateUuid,
  checkAdminRateLimit,
  ADMIN_ACTIONS,
} from "@/lib/admin";

// POST — Send email campaign
export async function POST(
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

  const rateLimitResponse = checkAdminRateLimit(user.id, "email_campaign_send", 5);
  if (rateLimitResponse) {
    await logAdminAction(user.id, ADMIN_ACTIONS.RATE_LIMIT_HIT, undefined, { endpoint: "email_campaign_send" });
    return rateLimitResponse;
  }

  const supabase = auth.adminClient;

  // ── 1. Fetch the email campaign ──
  const { data: campaign, error: fetchErr } = await (supabase.from("email_campaigns") as any)
    .select("*")
    .eq("id", id)
    .single();

  if (fetchErr || !campaign) {
    return NextResponse.json({ error: "Email campaign introuvable" }, { status: 404 });
  }

  if (campaign.status === "sent") {
    return NextResponse.json({ error: "Cette campagne a déjà été envoyée" }, { status: 400 });
  }

  // ── 2. Build recipient list based on audience_type ──
  let recipientEmails: string[] = [];

  switch (campaign.audience_type) {
    case "all_leads": {
      const { data: leads } = await (supabase.from("leads") as any)
        .select("email")
        .not("email", "is", null);
      recipientEmails = Array.from(new Set((leads || []).map((l: any) => l.email as string).filter(Boolean)));
      break;
    }

    case "campaign_leads": {
      const campaignId = campaign.campaign_id;
      if (campaignId) {
        const { data: leads } = await (supabase.from("leads") as any)
          .select("email")
          .or(`campaign_id.eq.${campaignId},first_touch_campaign_id.eq.${campaignId},last_touch_campaign_id.eq.${campaignId}`)
          .not("email", "is", null);
        recipientEmails = Array.from(new Set((leads || []).map((l: any) => l.email as string).filter(Boolean)));
      }
      break;
    }

    case "waitlist": {
      const { data: entries } = await (supabase.from("waitlist") as any)
        .select("email")
        .not("email", "is", null);
      recipientEmails = Array.from(new Set((entries || []).map((e: any) => e.email as string).filter(Boolean)));
      break;
    }

    case "custom_filter": {
      // Use audience_filter JSON to build query
      const filter = campaign.audience_filter || {};
      let query = (supabase.from("leads") as any).select("email").not("email", "is", null);

      if (filter.status) {
        query = query.eq("status", filter.status);
      }
      if (filter.source) {
        query = query.eq("source", filter.source);
      }
      if (filter.tags && Array.isArray(filter.tags) && filter.tags.length > 0) {
        query = query.overlaps("tags", filter.tags);
      }

      const { data: leads } = await query;
      recipientEmails = Array.from(new Set((leads || []).map((l: any) => l.email as string).filter(Boolean)));
      break;
    }

    default: {
      // Fallback: no recipients if audience_type not recognized
      break;
    }
  }

  // ── 3. Insert recipients ──
  if (recipientEmails.length > 0) {
    const recipientRows = recipientEmails.map((email) => ({
      email_campaign_id: id,
      recipient_email: email,
      status: "pending",
    }));

    // Insert in batches of 500
    for (let i = 0; i < recipientRows.length; i += 500) {
      const batch = recipientRows.slice(i, i + 500);
      await (supabase.from("email_campaign_recipients") as any).insert(batch);
    }
  }

  // ── 4. Update campaign status ──
  const { data: updated, error: updateErr } = await (supabase.from("email_campaigns") as any)
    .update({
      status: "sent",
      sent_at: new Date().toISOString(),
      total_recipients: recipientEmails.length,
      // DO NOT fake delivery/open/click stats — leave at 0
    })
    .eq("id", id)
    .select()
    .single();

  if (updateErr) {
    console.error("[admin/email-campaigns/send] update error:", updateErr);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  await logAdminAction(user.id, "send_email_campaign", id, {
    total_recipients: recipientEmails.length,
    audience_type: campaign.audience_type,
  });

  return NextResponse.json({
    data: updated,
    total_recipients: recipientEmails.length,
  });
}
