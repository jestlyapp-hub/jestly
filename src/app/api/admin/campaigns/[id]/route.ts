import { NextRequest, NextResponse } from "next/server";
import {
  requireAdmin,
  logAdminAction,
  validateUuid,
  checkAdminRateLimit,
  ADMIN_ACTIONS,
} from "@/lib/admin";

// GET — Campaign detail with full stats
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

  const rateLimitResponse = checkAdminRateLimit(user.id, "campaign_detail", 30);
  if (rateLimitResponse) {
    await logAdminAction(user.id, ADMIN_ACTIONS.RATE_LIMIT_HIT, undefined, { endpoint: "campaign_detail" });
    return rateLimitResponse;
  }

  const supabase = auth.adminClient;

  // ── 1. Fetch campaign ──
  const { data: campaign, error: campaignErr } = await (supabase.from("campaigns") as any)
    .select("*")
    .eq("id", id)
    .single();

  if (campaignErr || !campaign) {
    return NextResponse.json({ error: "Campagne introuvable" }, { status: 404 });
  }

  // ── 2. Parallel fetch: leads, conversions, landing pages, email campaigns, daily stats ──
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    leadsRes,
    signupsRes,
    activationsRes,
    paidRes,
    landingPagesDirectRes,
    landingPagesJoinRes,
    emailCampaignsRes,
    dailyStatsRes,
  ] = await Promise.all([
    // Leads attributed to this campaign (first 50)
    (supabase.from("leads") as any)
      .select("id, name, email, source, status, utm_source, utm_medium, created_at")
      .or(`campaign_id.eq.${id},first_touch_campaign_id.eq.${id},last_touch_campaign_id.eq.${id}`)
      .order("created_at", { ascending: false })
      .limit(50),
    // Signups
    (supabase.from("lead_conversions") as any)
      .select("id, revenue_cents")
      .eq("conversion_type", "signup_completed")
      .or(`first_touch_campaign_id.eq.${id},last_touch_campaign_id.eq.${id}`),
    // Activations
    (supabase.from("lead_conversions") as any)
      .select("id, revenue_cents")
      .eq("conversion_type", "activation")
      .or(`first_touch_campaign_id.eq.${id},last_touch_campaign_id.eq.${id}`),
    // Paid conversions
    (supabase.from("lead_conversions") as any)
      .select("id, revenue_cents")
      .eq("conversion_type", "paid_conversion")
      .or(`first_touch_campaign_id.eq.${id},last_touch_campaign_id.eq.${id}`),
    // Landing pages with direct campaign_id
    (supabase.from("landing_pages") as any)
      .select("id, name, slug, status, created_at")
      .eq("campaign_id", id),
    // Landing pages via join table
    (supabase.from("campaign_landing_pages") as any)
      .select("landing_page_id")
      .eq("campaign_id", id),
    // Email campaigns linked
    (supabase.from("email_campaigns") as any)
      .select("id, name, subject, status, sent_at, total_recipients, total_delivered, total_opened, total_clicked")
      .eq("campaign_id", id)
      .order("created_at", { ascending: false }),
    // Daily stats (last 30 days)
    (supabase.from("campaign_daily_stats") as any)
      .select("*")
      .eq("campaign_id", id)
      .gte("stat_date", thirtyDaysAgo.toISOString().split("T")[0])
      .order("stat_date", { ascending: true }),
  ]);

  // ── 3. Fetch landing pages from join table ──
  let joinLandingPages: any[] = [];
  const joinPageIds = (landingPagesJoinRes.data || []).map((r: any) => r.landing_page_id);
  if (joinPageIds.length > 0) {
    const { data } = await (supabase.from("landing_pages") as any)
      .select("id, name, slug, status, created_at")
      .in("id", joinPageIds);
    joinLandingPages = data || [];
  }

  // Merge and deduplicate landing pages
  const directPages = landingPagesDirectRes.data || [];
  const allPageIds = new Set<string>();
  const allLandingPages: any[] = [];
  for (const page of [...directPages, ...joinLandingPages]) {
    if (!allPageIds.has(page.id)) {
      allPageIds.add(page.id);
      allLandingPages.push(page);
    }
  }

  // ── 4. Compute metrics ──
  const leadsCount = (leadsRes.data || []).length;
  const signupsCount = (signupsRes.data || []).length;
  const activationsCount = (activationsRes.data || []).length;
  const paidCount = (paidRes.data || []).length;
  const revenueCents = (paidRes.data || []).reduce((sum: number, c: any) => sum + (c.revenue_cents || 0), 0);

  const budgetSpent = campaign.budget_spent || 0;
  const cpl = leadsCount > 0 ? budgetSpent / leadsCount : 0;
  const leadToSignupPct = leadsCount > 0 ? (signupsCount / leadsCount) * 100 : 0;
  const leadToPaidPct = leadsCount > 0 ? (paidCount / leadsCount) * 100 : 0;
  const roas = budgetSpent > 0 ? revenueCents / budgetSpent : 0;

  await logAdminAction(user.id, "view_campaign", id);

  return NextResponse.json({
    campaign,
    leads: leadsRes.data || [],
    conversions: {
      signups: signupsCount,
      activations: activationsCount,
      paid: paidCount,
      revenue_cents: revenueCents,
    },
    landing_pages: allLandingPages,
    email_campaigns: emailCampaignsRes.data || [],
    daily_stats: dailyStatsRes.data || [],
    computed: {
      leads_count: leadsCount,
      cpl,
      lead_to_signup_pct: Math.round(leadToSignupPct * 100) / 100,
      lead_to_paid_pct: Math.round(leadToPaidPct * 100) / 100,
      roas: Math.round(roas * 100) / 100,
    },
  });
}

// PATCH — Update campaign
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

  const rateLimitResponse = checkAdminRateLimit(user.id, "campaign_update", 20);
  if (rateLimitResponse) {
    await logAdminAction(user.id, ADMIN_ACTIONS.RATE_LIMIT_HIT, undefined, { endpoint: "campaign_update" });
    return rateLimitResponse;
  }

  const supabase = auth.adminClient;
  const body = await req.json();

  const allowed = [
    "name", "slug", "status", "channel", "objective", "description",
    "budget_planned", "budget_spent", "currency", "start_date", "end_date",
    "owner", "notes", "target_audience", "offer_name", "hook", "main_cta",
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

  const { data, error } = await (supabase.from("campaigns") as any)
    .update(safeUpdates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[admin/campaigns/id] PATCH error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  await logAdminAction(user.id, "update_campaign", id, { fields: Object.keys(safeUpdates) });

  return NextResponse.json({ data });
}

// DELETE — Delete campaign
export async function DELETE(
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

  const rateLimitResponse = checkAdminRateLimit(user.id, "campaign_delete", 10);
  if (rateLimitResponse) {
    await logAdminAction(user.id, ADMIN_ACTIONS.RATE_LIMIT_HIT, undefined, { endpoint: "campaign_delete" });
    return rateLimitResponse;
  }

  const supabase = auth.adminClient;

  const { error } = await (supabase.from("campaigns") as any)
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[admin/campaigns/id] DELETE error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  await logAdminAction(user.id, "delete_campaign", id);

  return NextResponse.json({ success: true });
}
