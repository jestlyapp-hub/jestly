import { NextRequest, NextResponse } from "next/server";
import {
  requireAdmin,
  logAdminAction,
  escapeIlike,
  sanitizeSearchTerm,
  validateSort,
  validatePagination,
  checkAdminRateLimit,
  ADMIN_ACTIONS,
} from "@/lib/admin";

// ── Helpers ────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// GET — List campaigns with stats + KPIs
export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { user } = auth;

  const rateLimitResponse = checkAdminRateLimit(user.id, "campaigns_list", 30);
  if (rateLimitResponse) {
    await logAdminAction(user.id, ADMIN_ACTIONS.RATE_LIMIT_HIT, undefined, { endpoint: "campaigns_list" });
    return rateLimitResponse;
  }

  const supabase = auth.adminClient;
  const url = new URL(req.url);

  const search = url.searchParams.get("search") || "";
  const status = url.searchParams.get("status") || "";
  const channel = url.searchParams.get("channel") || "";
  const sort = validateSort(url.searchParams.get("sort") || "created_at", [
    "created_at",
    "name",
    "budget_spent",
    "start_date",
  ]);
  const order = url.searchParams.get("order") || "desc";
  const { limit, offset } = validatePagination({
    limit: url.searchParams.get("limit") || "50",
    offset: url.searchParams.get("offset") || "0",
  });

  // ── Build query ──
  let query = (supabase.from("campaigns") as any).select("*", { count: "exact" });

  if (search) {
    const safe = escapeIlike(sanitizeSearchTerm(search));
    query = query.or(
      `name.ilike.%${safe}%,slug.ilike.%${safe}%,description.ilike.%${safe}%`,
    );
  }

  if (status) {
    query = query.eq("status", status);
  }

  if (channel) {
    query = query.eq("channel", channel);
  }

  query = query.order(sort, { ascending: order === "asc" });
  query = query.range(offset, offset + limit - 1);

  const { data: campaigns, count, error } = await query;

  if (error) {
    console.error("[admin/campaigns] GET error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  const campaignList = campaigns || [];
  const campaignIds = campaignList.map((c: any) => c.id);

  // ── Batch fetch stats for returned campaigns ──
  let statsMap: Record<string, { leads_count: number; signups_count: number; paid_count: number; revenue_cents: number }> = {};

  if (campaignIds.length > 0) {
    const [leadsRes, signupsRes, paidRes] = await Promise.all([
      // Leads count per campaign (first_touch, last_touch, or campaign_id)
      (supabase.from("leads") as any)
        .select("id, campaign_id, first_touch_campaign_id, last_touch_campaign_id")
        .or(
          `campaign_id.in.(${campaignIds.join(",")}),first_touch_campaign_id.in.(${campaignIds.join(",")}),last_touch_campaign_id.in.(${campaignIds.join(",")})`,
        ),
      // Signups per campaign
      (supabase.from("lead_conversions") as any)
        .select("id, first_touch_campaign_id, last_touch_campaign_id, revenue_cents")
        .eq("conversion_type", "signup_completed")
        .or(
          `first_touch_campaign_id.in.(${campaignIds.join(",")}),last_touch_campaign_id.in.(${campaignIds.join(",")})`,
        ),
      // Paid conversions per campaign
      (supabase.from("lead_conversions") as any)
        .select("id, first_touch_campaign_id, last_touch_campaign_id, revenue_cents")
        .eq("conversion_type", "paid_conversion")
        .or(
          `first_touch_campaign_id.in.(${campaignIds.join(",")}),last_touch_campaign_id.in.(${campaignIds.join(",")})`,
        ),
    ]);

    // Initialize stats
    for (const cid of campaignIds) {
      statsMap[cid] = { leads_count: 0, signups_count: 0, paid_count: 0, revenue_cents: 0 };
    }

    // Count leads per campaign
    if (leadsRes.data) {
      for (const lead of leadsRes.data) {
        const touchedCampaigns = new Set<string>();
        if (lead.campaign_id && campaignIds.includes(lead.campaign_id)) touchedCampaigns.add(lead.campaign_id);
        if (lead.first_touch_campaign_id && campaignIds.includes(lead.first_touch_campaign_id)) touchedCampaigns.add(lead.first_touch_campaign_id);
        if (lead.last_touch_campaign_id && campaignIds.includes(lead.last_touch_campaign_id)) touchedCampaigns.add(lead.last_touch_campaign_id);
        for (const cid of touchedCampaigns) {
          statsMap[cid].leads_count++;
        }
      }
    }

    // Count signups per campaign
    if (signupsRes.data) {
      for (const conv of signupsRes.data) {
        const touchedCampaigns = new Set<string>();
        if (conv.first_touch_campaign_id && campaignIds.includes(conv.first_touch_campaign_id)) touchedCampaigns.add(conv.first_touch_campaign_id);
        if (conv.last_touch_campaign_id && campaignIds.includes(conv.last_touch_campaign_id)) touchedCampaigns.add(conv.last_touch_campaign_id);
        for (const cid of touchedCampaigns) {
          statsMap[cid].signups_count++;
        }
      }
    }

    // Count paid + revenue per campaign
    if (paidRes.data) {
      for (const conv of paidRes.data) {
        const touchedCampaigns = new Set<string>();
        if (conv.first_touch_campaign_id && campaignIds.includes(conv.first_touch_campaign_id)) touchedCampaigns.add(conv.first_touch_campaign_id);
        if (conv.last_touch_campaign_id && campaignIds.includes(conv.last_touch_campaign_id)) touchedCampaigns.add(conv.last_touch_campaign_id);
        for (const cid of touchedCampaigns) {
          statsMap[cid].paid_count++;
          statsMap[cid].revenue_cents += conv.revenue_cents || 0;
        }
      }
    }
  }

  // Merge stats into campaign data
  const enrichedCampaigns = campaignList.map((c: any) => ({
    ...c,
    ...(statsMap[c.id] || { leads_count: 0, signups_count: 0, paid_count: 0, revenue_cents: 0 }),
  }));

  // ── KPIs ──
  const [totalRes, activeRes, activeBudgetRes, totalLeadsRes] = await Promise.all([
    (supabase.from("campaigns") as any)
      .select("id", { count: "exact", head: true }),
    (supabase.from("campaigns") as any)
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    (supabase.from("campaigns") as any)
      .select("budget_spent")
      .eq("status", "active"),
    (supabase.from("leads") as any)
      .select("id", { count: "exact", head: true })
      .not("campaign_id", "is", null),
  ]);

  const totalBudgetSpent = (activeBudgetRes.data || []).reduce(
    (sum: number, c: any) => sum + (c.budget_spent || 0),
    0,
  );

  return NextResponse.json({
    data: enrichedCampaigns,
    total: count || 0,
    kpis: {
      total_campaigns: totalRes.count || 0,
      active_campaigns: activeRes.count || 0,
      total_budget_spent: totalBudgetSpent,
      total_leads: totalLeadsRes.count || 0,
    },
  });
}

// POST — Create campaign
export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { user } = auth;

  const rateLimitResponse = checkAdminRateLimit(user.id, "campaigns_create", 20);
  if (rateLimitResponse) {
    await logAdminAction(user.id, ADMIN_ACTIONS.RATE_LIMIT_HIT, undefined, { endpoint: "campaigns_create" });
    return rateLimitResponse;
  }

  const supabase = auth.adminClient;
  const body = await req.json();

  // Validate required fields
  if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
    return NextResponse.json({ error: "name requis" }, { status: 400 });
  }

  // Auto-generate slug from name if not provided
  let slug = body.slug ? slugify(body.slug) : slugify(body.name);

  // Check slug uniqueness
  const { data: existing } = await (supabase.from("campaigns") as any)
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existing) {
    // Append timestamp to make unique
    slug = `${slug}-${Date.now()}`;
  }

  const allowed = [
    "name", "status", "channel", "objective", "description",
    "budget_planned", "budget_spent", "currency", "start_date", "end_date",
    "owner", "notes", "target_audience", "offer_name", "hook", "main_cta",
  ];

  const insertData: Record<string, unknown> = { slug };
  for (const key of allowed) {
    if (key in body) {
      insertData[key] = body[key];
    }
  }

  const { data, error } = await (supabase.from("campaigns") as any)
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error("[admin/campaigns] POST error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  await logAdminAction(user.id, "create_campaign", data.id, { name: body.name, slug });

  return NextResponse.json({ data });
}
