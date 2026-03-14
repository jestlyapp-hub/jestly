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

// GET — List all leads across the platform (admin only)
export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { user } = auth;

  // Rate limit : 30 requêtes/min
  const rateLimitResponse = checkAdminRateLimit(user.id, "leads_list", 30);
  if (rateLimitResponse) {
    await logAdminAction(user.id, ADMIN_ACTIONS.RATE_LIMIT_HIT, undefined, { endpoint: "leads_list" });
    return rateLimitResponse;
  }

  const supabase = auth.adminClient;
  const url = new URL(req.url);

  const search = url.searchParams.get("search") || "";
  const status = url.searchParams.get("status") || "";
  const source = url.searchParams.get("source") || "";
  const sort = validateSort(url.searchParams.get("sort") || "created_at", ["created_at", "name", "email", "amount", "score", "updated_at"]);
  const order = url.searchParams.get("order") || "desc";
  const { limit, offset } = validatePagination({
    limit: url.searchParams.get("limit") || "50",
    offset: url.searchParams.get("offset") || "0",
  });

  // ── Build query ──
  // Filters
  const qualityTier = url.searchParams.get("quality_tier") || "";
  const campaignId = url.searchParams.get("campaign_id") || "";
  const ownerFilter = url.searchParams.get("owner") || "";

  let query = (supabase.from("leads") as any).select(
    "id, site_id, name, email, phone, company, message, source, status, page_path, block_type, utm_source, utm_medium, utm_campaign, utm_content, utm_term, referrer, product_name, amount, notes, score, tags, owner, quality_tier, campaign_id, first_touch_campaign_id, last_touch_campaign_id, first_touch_source, last_touch_source, landing_page_id, anonymous_id, converted_to_user_id, converted_to_user_at, converted_to_paid_at, last_activity_at, created_at, updated_at",
    { count: "exact" },
  );

  // Search across name, email, company, message
  if (search) {
    const safe = escapeIlike(sanitizeSearchTerm(search));
    query = query.or(
      `name.ilike.%${safe}%,email.ilike.%${safe}%,company.ilike.%${safe}%,message.ilike.%${safe}%`,
    );
  }

  // Filter by status
  if (status) {
    query = query.eq("status", status);
  }

  // Filter by source
  if (source) {
    query = query.eq("source", source);
  }

  // Filter by quality tier
  if (qualityTier) {
    query = query.eq("quality_tier", qualityTier);
  }

  // Filter by campaign
  if (campaignId) {
    query = query.or(
      `campaign_id.eq.${campaignId},first_touch_campaign_id.eq.${campaignId},last_touch_campaign_id.eq.${campaignId}`,
    );
  }

  // Filter by owner
  if (ownerFilter) {
    const safeOwner = escapeIlike(sanitizeSearchTerm(ownerFilter));
    query = query.ilike("owner", `%${safeOwner}%`);
  }

  // Sort (validé par validateSort ci-dessus)
  query = query.order(sort, { ascending: order === "asc" });
  query = query.range(offset, offset + limit - 1);

  const { data: leads, count, error } = await query;

  if (error) {
    console.error("[admin/leads] GET error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  // ── Compute KPIs from a separate lightweight query ──
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [weekRes, monthRes, totalRes, qualifiedRes, convertedRes, avgScoreRes] = await Promise.all([
    (supabase.from("leads") as any)
      .select("id", { count: "exact", head: true })
      .gte("created_at", startOfWeek.toISOString()),
    (supabase.from("leads") as any)
      .select("id", { count: "exact", head: true })
      .gte("created_at", startOfMonth.toISOString()),
    (supabase.from("leads") as any)
      .select("id", { count: "exact", head: true }),
    (supabase.from("leads") as any)
      .select("id", { count: "exact", head: true })
      .eq("status", "qualified"),
    (supabase.from("leads") as any)
      .select("id", { count: "exact", head: true })
      .not("converted_to_user_id", "is", null),
    (supabase.from("leads") as any)
      .select("score")
      .not("score", "is", null)
      .gt("score", 0),
  ]);

  const totalCount = totalRes.count || 0;
  const scores = (avgScoreRes.data || []).map((r: any) => r.score as number);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length) : 0;

  return NextResponse.json({
    data: leads || [],
    total: count || 0,
    kpis: {
      total: totalCount,
      this_week: weekRes.count || 0,
      this_month: monthRes.count || 0,
      avg_score: avgScore,
      qualified_pct: totalCount > 0 ? Math.round(((qualifiedRes.count || 0) / totalCount) * 100) : 0,
      converted_pct: totalCount > 0 ? Math.round(((convertedRes.count || 0) / totalCount) * 100) : 0,
    },
  });
}
