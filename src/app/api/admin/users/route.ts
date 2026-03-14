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

// GET — List all user profiles with aggregated stats (admin only)
export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { user } = auth;

  // Rate limit : 30 requêtes/min
  const rateLimitResponse = checkAdminRateLimit(user.id, "users_list", 30);
  if (rateLimitResponse) {
    await logAdminAction(user.id, ADMIN_ACTIONS.RATE_LIMIT_HIT, undefined, { endpoint: "users_list" });
    return rateLimitResponse;
  }

  const supabase = auth.adminClient;
  const url = new URL(req.url);

  const search = url.searchParams.get("search") || "";
  const plan = url.searchParams.get("plan") || "all";
  const sort = validateSort(url.searchParams.get("sort") || "created_at", ["created_at", "full_name", "email"]);
  const order = url.searchParams.get("order") || "desc";
  const { limit, offset } = validatePagination({
    limit: url.searchParams.get("limit") || "50",
    offset: url.searchParams.get("offset") || "0",
  });

  // ── Step 1: Fetch profiles with filters + pagination ──
  let query = (supabase.from("profiles") as any).select(
    "id, email, full_name, business_name, avatar_url, plan, subdomain, created_at, updated_at",
    { count: "exact" },
  );

  if (search) {
    const safe = escapeIlike(sanitizeSearchTerm(search));
    query = query.or(
      `email.ilike.%${safe}%,full_name.ilike.%${safe}%,business_name.ilike.%${safe}%`,
    );
  }

  if (plan && plan !== "all") {
    query = query.eq("plan", plan);
  }

  // Sort (validé par validateSort ci-dessus)
  query = query.order(sort, { ascending: order === "asc" });
  query = query.range(offset, offset + limit - 1);

  const { data: profiles, count, error } = await query;

  if (error) {
    console.error("[admin/users] GET profiles error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ data: [], total: count || 0 });
  }

  // ── Step 2: Batch-fetch stats + health pour tous les IDs ──
  const ids = profiles.map((p: any) => p.id);

  // Lancer toutes les requêtes de stats en parallèle
  const [ordersRes, clientsRes, productsRes, sitesRes, projectsRes, healthRes] =
    await Promise.all([
      // Orders: count + sum(amount) for paid statuses + max(created_at)
      (supabase.from("orders") as any)
        .select("user_id, amount, status, created_at")
        .in("user_id", ids),

      (supabase.from("clients") as any)
        .select("user_id")
        .in("user_id", ids),

      (supabase.from("products") as any)
        .select("owner_id")
        .in("owner_id", ids),

      (supabase.from("sites") as any)
        .select("owner_id")
        .in("owner_id", ids),

      (supabase.from("projects") as any)
        .select("user_id")
        .in("user_id", ids),

      // Health snapshots
      (supabase.from("account_health_snapshots") as any)
        .select("account_id, score, tier")
        .in("account_id", ids),
    ]);

  // Build stats map per user
  const statsMap: Record<
    string,
    {
      order_count: number;
      total_revenue: number;
      client_count: number;
      product_count: number;
      site_count: number;
      project_count: number;
      last_order_at: string | null;
    }
  > = {};

  // Initialize all
  for (const id of ids) {
    statsMap[id] = {
      order_count: 0,
      total_revenue: 0,
      client_count: 0,
      product_count: 0,
      site_count: 0,
      project_count: 0,
      last_order_at: null,
    };
  }

  // Orders
  const paidStatuses = ["paid", "delivered", "invoiced"];
  if (ordersRes.data) {
    for (const o of ordersRes.data) {
      const s = statsMap[o.user_id];
      if (!s) continue;
      s.order_count++;
      if (paidStatuses.includes(o.status)) {
        s.total_revenue += o.amount || 0;
      }
      if (!s.last_order_at || o.created_at > s.last_order_at) {
        s.last_order_at = o.created_at;
      }
    }
  }

  // Clients
  if (clientsRes.data) {
    for (const c of clientsRes.data) {
      const s = statsMap[c.user_id];
      if (s) s.client_count++;
    }
  }

  // Products
  if (productsRes.data) {
    for (const p of productsRes.data) {
      const s = statsMap[p.owner_id];
      if (s) s.product_count++;
    }
  }

  // Sites
  if (sitesRes.data) {
    for (const si of sitesRes.data) {
      const s = statsMap[si.owner_id];
      if (s) s.site_count++;
    }
  }

  // Projects
  if (projectsRes.data) {
    for (const pr of projectsRes.data) {
      const s = statsMap[pr.user_id];
      if (s) s.project_count++;
    }
  }

  // Health scores par utilisateur
  const healthMap: Record<string, { score: number; tier: string }> = {};
  if (healthRes.data) {
    for (const h of healthRes.data) {
      healthMap[h.account_id] = { score: h.score, tier: h.tier };
    }
  }

  // ── Step 3: Merge profiles + stats + health ──
  const data = profiles.map((p: any) => ({
    ...p,
    ...(statsMap[p.id] || {
      order_count: 0,
      total_revenue: 0,
      client_count: 0,
      product_count: 0,
      site_count: 0,
      project_count: 0,
      last_order_at: null,
    }),
    health_score: healthMap[p.id]?.score ?? null,
    health_tier: healthMap[p.id]?.tier ?? null,
  }));

  return NextResponse.json({ data, total: count || 0 });
}
