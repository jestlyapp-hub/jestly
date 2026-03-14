import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { enrichOrdersWithProducts } from "@/lib/supabase-helpers";

// GET /api/dashboard/stats — enriched dashboard data
// CRITICAL: Uses SAME query as /api/orders (which works on the Commandes page)
export async function GET() {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const monthStartStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, "0")}-01`;

  // ══════════════════════════════════════════════
  // EXACT SAME QUERY as /api/orders GET (which works)
  // ══════════════════════════════════════════════
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rawOrders, error: ordersErr } = await (supabase.from("orders") as any)
    .select("*, clients(name, email, phone), order_brief_responses(order_id)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (ordersErr) {
    console.error("[DASHBOARD] ❌ Orders query FAILED:", ordersErr.message);
    return NextResponse.json({ error: ordersErr.message }, { status: 500 });
  }

  // Enrich with products (same as /api/orders)
  const orders = await enrichOrdersWithProducts(supabase, rawOrders || [], user.id);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rawClients } = await (supabase.from("clients") as any)
    .select("id, name, email, created_at")
    .eq("user_id", user.id);
  const clients = rawClients || [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count: activeProductsCount } = await (supabase.from("products") as any)
    .select("id", { count: "exact", head: true })
    .eq("owner_id", user.id)
    .eq("status", "active");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rawTasks } = await (supabase.from("tasks") as any)
    .select("id, title, status, priority, due_date")
    .eq("user_id", user.id)
    .in("status", ["todo", "in_progress"])
    .order("due_date", { ascending: true })
    .limit(20);
  const tasks = rawTasks || [];

  console.log(`[DASHBOARD] ✅ user=${user.id} | orders=${orders.length} | clients=${clients.length} | tasks=${tasks.length}`);
  if (orders.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sample = orders[0] as any;
    console.log(`[DASHBOARD] sample order: id=${sample.id} amount=${sample.amount} status=${sample.status} created_at=${sample.created_at} client=${sample.clients?.name}`);
  }

  // ── Helpers ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isActive = (o: any) => o.status !== "cancelled" && o.status !== "refunded" && o.status !== "dispute";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const num = (v: any) => Number(v) || 0;

  const activeOrders = orders.filter(isActive);

  // ══════════════════════════════════════════════
  // KPIs
  // ══════════════════════════════════════════════
  const totalRevenue = activeOrders.reduce((s: number, o: { amount: unknown }) => s + num(o.amount), 0);

  // This month — compare created_at string (YYYY-MM format)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const monthOrders = activeOrders.filter((o: any) => o.created_at?.slice(0, 7) === `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
  const monthRevenue = monthOrders.reduce((s: number, o: { amount: unknown }) => s + num(o.amount), 0);

  // Previous month
  const prevMKey = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, "0")}`;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prevMonthOrders = activeOrders.filter((o: any) => o.created_at?.slice(0, 7) === prevMKey);
  const prevMonthRevenue = prevMonthOrders.reduce((s: number, o: { amount: unknown }) => s + num(o.amount), 0);
  const revenueChange = prevMonthRevenue > 0 ? Math.round(((monthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100) : 0;

  // Today
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const todayCreated = activeOrders.filter((o: any) => o.created_at?.slice(0, 10) === todayStr);
  const todayRevenue = todayCreated.reduce((s: number, o: { amount: unknown }) => s + num(o.amount), 0);

  // Status counts
  const statusCounts: Record<string, number> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  orders.forEach((o: any) => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });
  const pendingOrders = (statusCounts["new"] || 0) + (statusCounts["brief_received"] || 0);
  const inProgressOrders = (statusCounts["in_progress"] || 0) + (statusCounts["in_review"] || 0);
  const deliveredOrders = statusCounts["delivered"] || 0;
  const paidOrders = statusCounts["paid"] || 0;

  const newClientsThisMonth = clients.filter((c: { created_at: string }) =>
    c.created_at?.slice(0, 7) === `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  ).length;

  // ══════════════════════════════════════════════
  // MONTHLY REVENUE (6 months)
  // ══════════════════════════════════════════════
  const monthlyRevenue: { month: string; revenue: number; orders: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mOrders = activeOrders.filter((o: any) => o.created_at?.slice(0, 7) === mKey);
    const rev = mOrders.reduce((s: number, o: { amount: unknown }) => s + num(o.amount), 0);
    monthlyRevenue.push({
      month: d.toLocaleDateString("fr-FR", { month: "short" }),
      revenue: Math.round(rev * 100) / 100,
      orders: mOrders.length,
    });
  }

  console.log(`[DASHBOARD] monthlyRevenue:`, monthlyRevenue.map(m => `${m.month}=${m.revenue}€(${m.orders})`).join(" | "));

  // ══════════════════════════════════════════════
  // TODAY — all items for today
  // ══════════════════════════════════════════════
  // Tasks due today or overdue
  const todayTasks = tasks
    .filter((t: { due_date: string | null }) => t.due_date && t.due_date <= todayStr)
    .map((t: { id: string; title: string; priority: string; due_date: string; status: string }) => ({
      id: t.id, type: "task" as const, title: t.title, priority: t.priority,
      date: t.due_date, status: t.status, isOverdue: t.due_date < todayStr,
    }));

  // Deadlines today or overdue
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const todayDeadlines = orders
    .filter((o: { deadline?: string | null; status: string }) => {
      if (!o.deadline) return false;
      const d = typeof o.deadline === "string" ? o.deadline.slice(0, 10) : "";
      return d <= todayStr && !["paid", "delivered", "cancelled", "refunded"].includes(o.status);
    })
    .slice(0, 5)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((o: any) => ({
      id: o.id, type: "deadline" as const, title: o.title, status: o.status,
      clientName: o.clients?.name || null,
      date: typeof o.deadline === "string" ? o.deadline.slice(0, 10) : "",
      isOverdue: typeof o.deadline === "string" && o.deadline.slice(0, 10) < todayStr,
    }));

  // New orders created today
  const todayNewOrders = todayCreated.slice(0, 3).map((o: { id: string; title: string; amount: unknown; status: string; clients?: { name: string } | null }) => ({
    id: o.id, type: "order" as const, title: o.title, amount: num(o.amount),
    status: o.status, clientName: o.clients?.name || null,
  }));

  // Active work (in progress / in review)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activeWorkOrders = orders
    .filter((o: { status: string }) => ["in_progress", "in_review"].includes(o.status))
    .slice(0, 3)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((o: any) => ({
      id: `work-${o.id}`, type: "active_work" as const, title: o.title,
      status: o.status, clientName: o.clients?.name || null,
    }));

  const todayItemsCount = todayTasks.length + todayDeadlines.length + todayNewOrders.length + activeWorkOrders.length;

  // ══════════════════════════════════════════════
  // ALERTS
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

  // ══════════════════════════════════════════════
  // CALENDAR — typed dots per day
  // ══════════════════════════════════════════════
  interface CalDay { tasks: number; deadlines: number; orders: number; events: number }
  const calendarDays: Record<string, CalDay> = {};
  const ensureDay = (d: string): CalDay => {
    if (!calendarDays[d]) calendarDays[d] = { tasks: 0, deadlines: 0, orders: 0, events: 0 };
    return calendarDays[d];
  };

  // Mark order created_at dates AND deadline dates
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  orders.forEach((o: any) => {
    if (["cancelled", "refunded"].includes(o.status)) return;
    const createdDay = o.created_at?.slice(0, 10);
    if (createdDay) ensureDay(createdDay).orders++;
    if (o.deadline) {
      const deadlineDay = typeof o.deadline === "string" ? o.deadline.slice(0, 10) : "";
      if (deadlineDay) ensureDay(deadlineDay).deadlines++;
    }
  });

  // Mark task due dates
  tasks.forEach((t: { due_date: string | null }) => {
    if (t.due_date) ensureDay(t.due_date).tasks++;
  });

  // Recent orders (already enriched with clients + products from the same query)
  const recentOrders = orders.slice(0, 8);

  return NextResponse.json({
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    monthRevenue: Math.round(monthRevenue * 100) / 100,
    todayRevenue: Math.round(todayRevenue * 100) / 100,
    revenueChange,
    ordersCount: orders.length,
    activeOrdersCount: activeOrders.length,
    pendingOrders,
    inProgressOrders,
    deliveredOrders,
    paidOrders,
    clientsCount: clients.length,
    newClientsThisMonth,
    activeProductsCount: activeProductsCount ?? 0,
    monthlyRevenue,
    recentOrders,
    todayTasks,
    todayDeadlines,
    todayNewOrders,
    activeWorkOrders,
    todayItemsCount,
    overdueOrders,
    upcomingDeadlines,
    calendarDays,
  });
}
