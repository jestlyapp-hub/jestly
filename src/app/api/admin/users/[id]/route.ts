import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, logAdminAction, validateUuid, checkAdminRateLimit, ADMIN_ACTIONS } from "@/lib/admin";

// GET /api/admin/users/:id — Full 360 user profile + aggregated data
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

  // Rate limit : 30 requêtes/min
  const rateLimitResponse = checkAdminRateLimit(auth.user.id, "view_account", 30);
  if (rateLimitResponse) {
    await logAdminAction(auth.user.id, ADMIN_ACTIONS.RATE_LIMIT_HIT, undefined, { endpoint: "view_account" });
    return rateLimitResponse;
  }

  const supabase = auth.adminClient;

  // Log this view
  await logAdminAction(auth.user.id, "view_account", id);

  // ── 1. Profile ──────────────────────────────────────────────────
  const { data: profile, error: profileErr } = await (supabase.from("profiles") as any)
    .select(
      "id, email, full_name, business_name, avatar_url, plan, subdomain, created_at, updated_at, phone, role, locale, timezone, settings",
    )
    .eq("id", id)
    .single();

  if (profileErr || !profile) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  // ── 2. All stat queries + recent data in parallel ───────────────
  const [
    ordersRes,
    clientsRes,
    productsRes,
    sitesRes,
    projectsRes,
    tasksRes,
    leadsRes,
    recentOrdersRes,
    recentClientsRes,
    allProductsRes,
    allSitesRes,
    recentProjectsRes,
    notesRes,
    flagsRes,
    healthRes,
  ] = await Promise.all([
    // Counts
    (supabase.from("orders") as any)
      .select("id", { count: "exact", head: true })
      .eq("user_id", id),
    (supabase.from("clients") as any)
      .select("id", { count: "exact", head: true })
      .eq("user_id", id),
    (supabase.from("products") as any)
      .select("id", { count: "exact", head: true })
      .eq("owner_id", id),
    (supabase.from("sites") as any)
      .select("id", { count: "exact", head: true })
      .eq("owner_id", id),
    (supabase.from("projects") as any)
      .select("id", { count: "exact", head: true })
      .eq("user_id", id),
    (supabase.from("tasks") as any)
      .select("id", { count: "exact", head: true })
      .eq("user_id", id),
    (supabase.from("leads") as any)
      .select("id, site_id")
      .order("created_at", { ascending: false }),

    // Recent orders (last 20) with product + client info
    (supabase.from("orders") as any)
      .select("id, amount, status, created_at, title, product_id, client_id")
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .limit(20),

    // Recent clients (last 20)
    (supabase.from("clients") as any)
      .select("id, name, email, created_at, total_revenue")
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .limit(20),

    // All products
    (supabase.from("products") as any)
      .select("id, name, price_cents, status, created_at")
      .eq("owner_id", id)
      .order("created_at", { ascending: false }),

    // All sites
    (supabase.from("sites") as any)
      .select("id, name, slug, status, created_at")
      .eq("owner_id", id)
      .order("created_at", { ascending: false }),

    // Recent projects (last 20)
    (supabase.from("projects") as any)
      .select("id, name, status, created_at")
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .limit(20),

    // Admin notes
    (supabase.from("admin_account_notes") as any)
      .select("id, content, tags, is_pinned, created_at")
      .eq("account_id", id)
      .order("created_at", { ascending: false }),

    // Admin flags (active only)
    (supabase.from("admin_account_flags") as any)
      .select("id, flag_type, reason, created_at, resolved_at")
      .eq("account_id", id)
      .is("resolved_at", null),

    // Health score snapshot
    (supabase.from("account_health_snapshots") as any)
      .select("score, tier, signals, computed_at")
      .eq("account_id", id)
      .maybeSingle(),
  ]);

  // ── 3. Revenue calculation ──────────────────────────────────────
  const paidStatuses = ["paid", "delivered", "invoiced"];
  let totalRevenue = 0;
  const recentOrders = (recentOrdersRes.data || []).map((o: any) => {
    if (paidStatuses.includes(o.status)) {
      totalRevenue += o.amount || 0;
    }
    return o;
  });

  // Recalculate total revenue from all orders (not just last 20)
  const { data: allOrders } = await (supabase.from("orders") as any)
    .select("amount, status")
    .eq("user_id", id);

  totalRevenue = 0;
  if (allOrders) {
    for (const o of allOrders) {
      if (paidStatuses.includes(o.status)) {
        totalRevenue += o.amount || 0;
      }
    }
  }

  // ── 4. Count leads that belong to this user's sites ─────────────
  const userSiteIds = (allSitesRes.data || []).map((s: any) => s.id);
  let leadCount = 0;
  if (leadsRes.data && userSiteIds.length > 0) {
    leadCount = leadsRes.data.filter((l: any) => userSiteIds.includes(l.site_id)).length;
  }

  // ── 5. Enrich orders with product/client names ──────────────────
  const productIds = [...new Set(recentOrders.map((o: any) => o.product_id).filter(Boolean))];
  const clientIds = [...new Set(recentOrders.map((o: any) => o.client_id).filter(Boolean))];

  let productMap: Record<string, string> = {};
  let clientMap: Record<string, string> = {};

  if (productIds.length > 0) {
    const { data: prods } = await (supabase.from("products") as any)
      .select("id, name")
      .in("id", productIds);
    if (prods) {
      for (const p of prods) productMap[p.id] = p.name;
    }
  }

  if (clientIds.length > 0) {
    const { data: cls } = await (supabase.from("clients") as any)
      .select("id, name")
      .in("id", clientIds);
    if (cls) {
      for (const c of cls) clientMap[c.id] = c.name;
    }
  }

  const enrichedOrders = recentOrders.map((o: any) => ({
    id: o.id,
    amount: o.amount,
    status: o.status,
    created_at: o.created_at,
    product_name: productMap[o.product_id] || o.title || null,
    client_name: clientMap[o.client_id] || null,
  }));

  // ── 6. Count sales per product ──────────────────────────────────
  const salesCountMap: Record<string, number> = {};
  if (allOrders) {
    for (const o of allOrders) {
      if (o.product_id) {
        salesCountMap[o.product_id] = (salesCountMap[o.product_id] || 0) + 1;
      }
    }
  }

  const products = (allProductsRes.data || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    price_cents: p.price_cents,
    status: p.status,
    sales_count: salesCountMap[p.id] || 0,
    created_at: p.created_at,
  }));

  const sites = (allSitesRes.data || []).map((s: any) => ({
    id: s.id,
    name: s.name,
    subdomain: s.slug,
    published: s.status === "published",
    created_at: s.created_at,
  }));

  // ── 7. Build response ──────────────────────────────────────────
  // Extract onboarding data from settings, then strip settings from profile response
  const onboarding = profile.settings?.onboarding || {};
  const { settings: _settings, ...profileClean } = profile;

  return NextResponse.json({
    profile: profileClean,
    onboarding: {
      completed: onboarding.completed === true,
      discovery_source: onboarding.discovery_source || null,
      freelance_type: onboarding.freelance_type || null,
      freelance_experience: onboarding.freelance_experience || null,
      client_volume: onboarding.client_volume || null,
      main_goal: onboarding.main_goal || null,
      wants_tips: onboarding.wants_tips ?? null,
    },
    stats: {
      order_count: ordersRes.count || 0,
      total_revenue: totalRevenue,
      client_count: clientsRes.count || 0,
      product_count: productsRes.count || 0,
      site_count: sitesRes.count || 0,
      project_count: projectsRes.count || 0,
      task_count: tasksRes.count || 0,
      lead_count: leadCount,
    },
    recent_orders: enrichedOrders,
    recent_clients: recentClientsRes.data || [],
    products,
    sites,
    projects: recentProjectsRes.data || [],
    admin_notes: notesRes.data || [],
    admin_flags: flagsRes.data || [],
    health: healthRes.data
      ? {
          score: healthRes.data.score,
          tier: healthRes.data.tier,
          signals: healthRes.data.signals,
          computed_at: healthRes.data.computed_at,
        }
      : null,
  });
}
