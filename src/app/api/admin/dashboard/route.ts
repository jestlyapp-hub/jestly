import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const sb = auth.adminClient;

  // ── Aggregate counts ───────────────────────────────────────────
  const [
    profilesRes,
    ordersRes,
    revenueRes,
    productsRes,
    clientsRes,
    sitesRes,
    waitlistRes,
    leadsRes,
    projectsRes,
  ] = await Promise.all([
    (sb.from("profiles") as any).select("id", { count: "exact", head: true }),
    (sb.from("orders") as any).select("id", { count: "exact", head: true }),
    (sb.from("orders") as any)
      .select("amount")
      .in("status", ["paid", "delivered", "invoiced"]),
    (sb.from("products") as any).select("id", { count: "exact", head: true }),
    (sb.from("clients") as any).select("id", { count: "exact", head: true }),
    (sb.from("sites") as any).select("id", { count: "exact", head: true }),
    (sb.from("waitlist") as any).select("id", { count: "exact", head: true }),
    (sb.from("leads") as any).select("id", { count: "exact", head: true }),
    (sb.from("projects") as any).select("id", { count: "exact", head: true }),
  ]);

  const total_revenue = (revenueRes.data || []).reduce(
    (sum: number, o: { amount: number | null }) => sum + (o.amount || 0),
    0,
  );

  // ── Time-based counts (this week / this month) ─────────────────
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    usersWeekRes,
    usersMonthRes,
    ordersWeekRes,
    ordersMonthRes,
    revenueWeekRes,
    revenueMonthRes,
  ] = await Promise.all([
    (sb.from("profiles") as any)
      .select("id", { count: "exact", head: true })
      .gte("created_at", weekAgo),
    (sb.from("profiles") as any)
      .select("id", { count: "exact", head: true })
      .gte("created_at", monthAgo),
    (sb.from("orders") as any)
      .select("id", { count: "exact", head: true })
      .gte("created_at", weekAgo),
    (sb.from("orders") as any)
      .select("id", { count: "exact", head: true })
      .gte("created_at", monthAgo),
    (sb.from("orders") as any)
      .select("amount")
      .in("status", ["paid", "delivered", "invoiced"])
      .gte("created_at", weekAgo),
    (sb.from("orders") as any)
      .select("amount")
      .in("status", ["paid", "delivered", "invoiced"])
      .gte("created_at", monthAgo),
  ]);

  const revenue_this_week = (revenueWeekRes.data || []).reduce(
    (s: number, o: { amount: number | null }) => s + (o.amount || 0),
    0,
  );
  const revenue_this_month = (revenueMonthRes.data || []).reduce(
    (s: number, o: { amount: number | null }) => s + (o.amount || 0),
    0,
  );

  // ── Recent signups ─────────────────────────────────────────────
  const { data: recent_signups } = await (sb.from("profiles") as any)
    .select("id, email, full_name, plan, created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  // ── Recent orders (with product + client names) ────────────────
  const { data: recent_orders_raw } = await (sb.from("orders") as any)
    .select("id, amount, status, created_at, product_id, client_id")
    .order("created_at", { ascending: false })
    .limit(10);

  // Resolve product & client names
  const recent_orders = await Promise.all(
    (recent_orders_raw || []).map(async (o: any) => {
      let product_name = null;
      let client_name = null;

      if (o.product_id) {
        const { data: p } = await (sb.from("products") as any)
          .select("name")
          .eq("id", o.product_id)
          .single();
        product_name = p?.name || null;
      }
      if (o.client_id) {
        const { data: c } = await (sb.from("clients") as any)
          .select("name")
          .eq("id", o.client_id)
          .single();
        client_name = c?.name || null;
      }

      return {
        id: o.id,
        amount: o.amount,
        status: o.status,
        created_at: o.created_at,
        product_name,
        client_name,
      };
    }),
  );

  // ── Daily signups (30 days) ────────────────────────────────────
  const { data: signups30 } = await (sb.from("profiles") as any)
    .select("created_at")
    .gte("created_at", monthAgo)
    .order("created_at", { ascending: true });

  const daily_signups_30d = buildDailyCounts(signups30 || [], 30);

  // ── Daily orders (30 days) ─────────────────────────────────────
  const { data: orders30 } = await (sb.from("orders") as any)
    .select("created_at")
    .gte("created_at", monthAgo)
    .order("created_at", { ascending: true });

  const daily_orders_30d = buildDailyCounts(orders30 || [], 30);

  // ── Top users by order count ───────────────────────────────────
  const { data: allOrders } = await (sb.from("orders") as any).select("owner_id");

  const userOrderCounts: Record<string, number> = {};
  (allOrders || []).forEach((o: { owner_id: string }) => {
    if (o.owner_id) userOrderCounts[o.owner_id] = (userOrderCounts[o.owner_id] || 0) + 1;
  });

  const topUserIds = Object.entries(userOrderCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const top_users_by_orders = await Promise.all(
    topUserIds.map(async ([uid, count]) => {
      const { data: profile } = await (sb.from("profiles") as any)
        .select("email, full_name")
        .eq("id", uid)
        .single();
      return {
        user_id: uid,
        email: profile?.email || "—",
        full_name: profile?.full_name || null,
        order_count: count,
      };
    }),
  );

  // ── Waitlist conversion ────────────────────────────────────────
  const { count: wl_invited } = await (sb.from("waitlist") as any)
    .select("id", { count: "exact", head: true })
    .eq("status", "invited");

  const { count: wl_active } = await (sb.from("waitlist") as any)
    .select("id", { count: "exact", head: true })
    .eq("status", "active");

  // ── Response ───────────────────────────────────────────────────
  return NextResponse.json({
    total_users: profilesRes.count ?? 0,
    total_orders: ordersRes.count ?? 0,
    total_revenue,
    total_products: productsRes.count ?? 0,
    total_clients: clientsRes.count ?? 0,
    total_sites: sitesRes.count ?? 0,
    total_waitlist: waitlistRes.count ?? 0,
    total_leads: leadsRes.count ?? 0,
    total_projects: projectsRes.count ?? 0,
    users_this_week: usersWeekRes.count ?? 0,
    users_this_month: usersMonthRes.count ?? 0,
    orders_this_week: ordersWeekRes.count ?? 0,
    orders_this_month: ordersMonthRes.count ?? 0,
    revenue_this_week,
    revenue_this_month,
    recent_signups: recent_signups || [],
    recent_orders,
    daily_signups_30d,
    daily_orders_30d,
    top_users_by_orders,
    waitlist_conversion: {
      total: waitlistRes.count ?? 0,
      invited: wl_invited ?? 0,
      active: wl_active ?? 0,
    },
  });
}

// ── Helper: build array of { date, count } for last N days ────────
function buildDailyCounts(
  rows: { created_at: string }[],
  days: number,
): { date: string; count: number }[] {
  const now = new Date();
  const map: Record<string, number> = {};

  // Initialize all days to 0
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    map[key] = 0;
  }

  // Count rows per day
  rows.forEach((r) => {
    const key = r.created_at.slice(0, 10);
    if (map[key] !== undefined) map[key]++;
  });

  return Object.entries(map).map(([date, count]) => ({ date, count }));
}
