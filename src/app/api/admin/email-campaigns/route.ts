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

// GET — List email campaigns
export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { user } = auth;

  const rateLimitResponse = checkAdminRateLimit(user.id, "email_campaigns_list", 30);
  if (rateLimitResponse) {
    await logAdminAction(user.id, ADMIN_ACTIONS.RATE_LIMIT_HIT, undefined, { endpoint: "email_campaigns_list" });
    return rateLimitResponse;
  }

  const supabase = auth.adminClient;
  const url = new URL(req.url);

  const search = url.searchParams.get("search") || "";
  const status = url.searchParams.get("status") || "";
  const campaignId = url.searchParams.get("campaign_id") || "";
  const sort = validateSort(url.searchParams.get("sort") || "created_at", [
    "created_at",
    "name",
    "subject",
    "sent_at",
    "total_recipients",
  ]);
  const order = url.searchParams.get("order") || "desc";
  const { limit, offset } = validatePagination({
    limit: url.searchParams.get("limit") || "50",
    offset: url.searchParams.get("offset") || "0",
  });

  let query = (supabase.from("email_campaigns") as any).select("*", { count: "exact" });

  if (search) {
    const safe = escapeIlike(sanitizeSearchTerm(search));
    query = query.or(
      `name.ilike.%${safe}%,subject.ilike.%${safe}%`,
    );
  }

  if (status) {
    query = query.eq("status", status);
  }

  if (campaignId) {
    query = query.eq("campaign_id", campaignId);
  }

  query = query.order(sort, { ascending: order === "asc" });
  query = query.range(offset, offset + limit - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error("[admin/email-campaigns] GET error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  return NextResponse.json({
    data: data || [],
    total: count || 0,
  });
}

// POST — Create email campaign
export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { user } = auth;

  const rateLimitResponse = checkAdminRateLimit(user.id, "email_campaigns_create", 20);
  if (rateLimitResponse) {
    await logAdminAction(user.id, ADMIN_ACTIONS.RATE_LIMIT_HIT, undefined, { endpoint: "email_campaigns_create" });
    return rateLimitResponse;
  }

  const supabase = auth.adminClient;
  const body = await req.json();

  if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
    return NextResponse.json({ error: "name requis" }, { status: 400 });
  }

  if (!body.subject || typeof body.subject !== "string" || !body.subject.trim()) {
    return NextResponse.json({ error: "subject requis" }, { status: 400 });
  }

  const allowed = [
    "name", "subject", "preview_text", "sender_name", "sender_email",
    "campaign_id", "audience_type", "audience_filter", "template_key",
    "html_content", "scheduled_at", "notes",
  ];

  const insertData: Record<string, unknown> = { status: "draft" };
  for (const key of allowed) {
    if (key in body) {
      insertData[key] = body[key];
    }
  }

  const { data, error } = await (supabase.from("email_campaigns") as any)
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error("[admin/email-campaigns] POST error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  await logAdminAction(user.id, "create_email_campaign", data.id, { name: body.name });

  return NextResponse.json({ data });
}
