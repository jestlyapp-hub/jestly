import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { enrichOrdersWithProducts } from "@/lib/supabase-helpers";
import { getDashboardCalendarMonth } from "@/lib/dashboard/calendar";
import { getDashboardToday } from "@/lib/dashboard/today";
import { getDashboardRevenueSeries } from "@/lib/dashboard/revenue";

// GET /api/dashboard/stats — enriched dashboard data
export async function GET() {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  // ══════════════════════════════════════════════
  // PARALLEL: Core data + new dashboard modules
  // ══════════════════════════════════════════════
  const [
    ordersResult,
    clientsResult,
    productsResult,
    calendarData,
    todayData,
    revenueData,
  ] = await Promise.all([
    // Orders (same query as /api/orders)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("orders") as any)
      .select("*, clients(name, email, phone), order_brief_responses(order_id)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    // Clients
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("clients") as any)
      .select("id, name, email, created_at")
      .eq("user_id", user.id),
    // Products count
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("products") as any)
      .select("id", { count: "exact", head: true })
      .eq("owner_id", user.id)
      .eq("status", "active"),
    // Calendar (current month)
    getDashboardCalendarMonth(supabase, user.id, now.getMonth(), now.getFullYear(), todayStr),
    // Today widget
    getDashboardToday(supabase, user.id, todayStr),
    // Revenue 6 months
    getDashboardRevenueSeries(supabase, user.id, 6),
  ]);

  if (ordersResult.error) {
    console.error("[DASHBOARD] ❌ Orders query FAILED:", ordersResult.error.message);
    return NextResponse.json({ error: ordersResult.error.message }, { status: 500 });
  }

  // Enrich with products
  const orders = await enrichOrdersWithProducts(supabase, ordersResult.data || [], user.id);
  const clients = clientsResult.data || [];

  // ── Helpers ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isActive = (o: any) => o.status !== "cancelled" && o.status !== "refunded" && o.status !== "dispute";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const num = (v: any) => Number(v) || 0;
  const activeOrders = orders.filter(isActive);

  // ══════════════════════════════════════════════
  // KPIs (kept for header cards)
  // ══════════════════════════════════════════════
  // Status counts
  const statusCounts: Record<string, number> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  orders.forEach((o: any) => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });
  const pendingOrders = (statusCounts["new"] || 0) + (statusCounts["brief_received"] || 0);
  const inProgressOrders = (statusCounts["in_progress"] || 0) + (statusCounts["in_review"] || 0);
  const deliveredOrders = statusCounts["delivered"] || 0;
  const paidOrders = statusCounts["paid"] || 0;

  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const newClientsThisMonth = clients.filter((c: { created_at: string }) =>
    c.created_at?.slice(0, 7) === currentMonth
  ).length;

  // Today revenue (orders created today — for KPI card)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const todayCreated = activeOrders.filter((o: any) => o.created_at?.slice(0, 10) === todayStr);
  const todayRevenue = todayCreated.reduce((s: number, o: { amount: unknown }) => s + num(o.amount), 0);

  // ══════════════════════════════════════════════
  // OVERDUE count (for alert banner)
  // ══════════════════════════════════════════════
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const overdueOrders = orders.filter((o: any) => {
    if (!o.deadline) return false;
    const d = typeof o.deadline === "string" ? o.deadline.slice(0, 10) : "";
    return d < todayStr && !["paid", "delivered", "cancelled", "refunded"].includes(o.status);
  }).length;

  // ══════════════════════════════════════════════
  // UPCOMING DEADLINES (next 14 days)
  // ══════════════════════════════════════════════
  const in14Days = new Date(now.getTime() + 14 * 86400000).toISOString().slice(0, 10);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const upcomingDeadlines = orders
    .filter((o: { deadline?: string | null; status: string }) => {
      if (!o.deadline) return false;
      const d = typeof o.deadline === "string" ? o.deadline.slice(0, 10) : "";
      return d >= todayStr && d <= in14Days && !["paid", "cancelled", "refunded"].includes(o.status);
    })
    .slice(0, 6)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((o: any) => ({
      id: o.id, title: o.title,
      deadline: typeof o.deadline === "string" ? o.deadline.slice(0, 10) : "",
      status: o.status, clientName: o.clients?.name || null,
      isToday: typeof o.deadline === "string" && o.deadline.slice(0, 10) === todayStr,
      isOverdue: typeof o.deadline === "string" && o.deadline.slice(0, 10) < todayStr,
    }));

  // Recent orders
  const recentOrders = orders.slice(0, 8);

  console.log(`[DASHBOARD] ✅ user=${user.id} | orders=${orders.length} clients=${clients.length} | today=${todayData.totalCount} items | revenue=${revenueData.totalRevenue}€ | calendar=${Object.values(calendarData.days).filter(d => d.hasAny).length} active days`);

  return NextResponse.json({
    // KPIs
    totalRevenue: revenueData.totalRevenue,
    monthRevenue: revenueData.currentMonthRevenue,
    todayRevenue: Math.round(todayRevenue * 100) / 100,
    revenueChange: revenueData.changePercent,
    ordersCount: orders.length,
    activeOrdersCount: activeOrders.length,
    pendingOrders,
    inProgressOrders,
    deliveredOrders,
    paidOrders,
    clientsCount: clients.length,
    newClientsThisMonth,
    activeProductsCount: productsResult.count ?? 0,
    // Revenue series (NEW — real data)
    revenueData,
    // Today widget (NEW — real aggregation)
    todayData,
    // Calendar (NEW — enriched with all sources)
    calendarData,
    // Legacy fields kept for compatibility
    recentOrders,
    overdueOrders,
    upcomingDeadlines,
  });
}
