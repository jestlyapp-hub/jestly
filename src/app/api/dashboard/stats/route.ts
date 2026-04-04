import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { computeOrdersPipelineSummary, isExcludedOrder, getActiveClientsCount } from "@/lib/business-metrics";
import { isOrderOverdue, isActiveProductionStatus, TERMINAL_STATUSES } from "@/lib/notion-colors";

// GET /api/dashboard/stats — complete dashboard data
export async function GET() {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  // ── Parallel queries ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const s = supabase as any;

  const [ordersRes, clientsRes, productsRes, tasksRes, eventsRes] = await Promise.all([
    s.from("orders")
      .select("id, title, amount, status, priority, created_at, deadline, paid_at, client_id, clients(name)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),

    s.from("clients")
      .select("id, created_at", { count: "exact" })
      .eq("user_id", user.id)
      .is("deleted_at", null),

    s.from("products")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", user.id)
      .eq("status", "active"),

    s.from("tasks")
      .select("id, title, status, priority, due_date, client_name")
      .eq("user_id", user.id)
      .is("archived_at", null)
      .limit(200),

    s.from("calendar_events")
      .select("id, title, date, category, priority")
      .eq("user_id", user.id)
      .gte("date", new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10))
      .limit(200),
  ]);

  // Normalize deadline/paid_at to YYYY-MM-DD (DB returns ISO timestamps like "2026-03-15T00:00:00+00:00")
  const orders: { id: string; title: string; amount: number; status: string; priority: string; created_at: string; deadline: string | null; paid_at: string | null; client_id: string | null; clients: { name: string } | null }[] = (ordersRes.data || []).map((o: Record<string, unknown>) => ({
    ...o,
    deadline: typeof o.deadline === "string" ? o.deadline.slice(0, 10) : null,
    paid_at: typeof o.paid_at === "string" ? o.paid_at.slice(0, 10) : null,
  }));
  const clients: { id: string; created_at: string }[] = clientsRes.data || [];
  const tasks: { id: string; title: string; status: string; priority: string; due_date: string | null; client_name: string | null }[] = tasksRes.data || [];
  const events: { id: string; title: string; date: string; category: string; priority: string }[] = eventsRes.data || [];

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  // ── Pipeline Summary (source of truth: business-metrics.ts) ──
  const pipelineSummary = computeOrdersPipelineSummary(orders);

  // ── Order counts by status ──
  const activeOrders = orders.filter((o) => !isExcludedOrder(o.status));
  const pendingOrders = orders.filter((o) => o.status === "new").length;
  const inProgressOrders = orders.filter((o) => ["brief_received", "in_progress", "in_review", "validated"].includes(o.status)).length;
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length;
  const paidOrders = orders.filter((o) => o.status === "paid").length;
  // Overdue = même logique que la page Commandes (isOrderOverdue from notion-colors.ts)
  // Exclut : delivered, invoiced, paid, cancelled, refunded, dispute
  const overdueOrders = orders.filter((o) => isOrderOverdue(o.deadline, o.status)).length;

  // ── Revenue data (6 months) — commandes encaissées (paid + invoiced + delivered) ──
  const REVENUE_STATUSES = ["paid", "invoiced", "delivered"];
  const paidOrdersList = orders.filter((o) => REVENUE_STATUSES.includes(o.status));
  const series: { monthKey: string; monthLabel: string; revenue: number; ordersCount: number; paidOrdersCount: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const monthLabel = d.toLocaleDateString("fr-FR", { month: "short" });
    const monthPaid = paidOrdersList.filter((o) => (o.paid_at || o.created_at).startsWith(monthKey));
    const monthAllActive = activeOrders.filter((o) => o.created_at.startsWith(monthKey));
    series.push({
      monthKey,
      monthLabel,
      revenue: monthPaid.reduce((s, o) => s + Number(o.amount || 0), 0),
      ordersCount: monthAllActive.length,
      paidOrdersCount: monthPaid.length,
    });
  }

  const currentMonthRev = series[series.length - 1]?.revenue ?? 0;
  const prevMonthRev = series[series.length - 2]?.revenue ?? 0;
  const changePercent = prevMonthRev > 0 ? Math.round(((currentMonthRev - prevMonthRev) / prevMonthRev) * 100) : 0;

  // Revenu total encaissé (toutes périodes)
  const totalPaidRevenue = paidOrdersList.reduce((s, o) => s + Number(o.amount || 0), 0);

  const revenueData = {
    series,
    totalRevenue: Math.round(totalPaidRevenue * 100) / 100,
    currentMonthRevenue: currentMonthRev,
    previousMonthRevenue: prevMonthRev,
    changePercent,
  };

  // ── Today data ──
  const todayItems: { id: string; type: string; title: string; subtitle?: string; clientName?: string | null; date: string; status?: string | null; priority?: string | null; isOverdue: boolean; amount?: number | null }[] = [];

  // Today's orders
  for (const o of orders) {
    if (o.created_at.startsWith(todayStr)) {
      todayItems.push({ id: o.id, type: "order", title: o.title || "Commande", clientName: o.clients?.name, date: o.created_at, status: o.status, priority: o.priority, isOverdue: false, amount: o.amount });
    }
  }
  // Today's deadlines
  for (const o of orders) {
    if (o.deadline === todayStr && isActiveProductionStatus(o.status)) {
      todayItems.push({ id: `dl-${o.id}`, type: "deadline", title: o.title || "Échéance", clientName: o.clients?.name, date: o.deadline, status: o.status, isOverdue: false });
    }
  }
  // Today's tasks
  for (const t of tasks) {
    if (t.due_date === todayStr) {
      todayItems.push({ id: t.id, type: "task", title: t.title, clientName: t.client_name, date: t.due_date, status: t.status, priority: t.priority, isOverdue: false });
    }
  }
  // Today's events
  for (const e of events) {
    if (e.date === todayStr) {
      todayItems.push({ id: e.id, type: "event", title: e.title, date: e.date, priority: e.priority, isOverdue: false });
    }
  }

  const overdueItems = orders
    .filter((o) => isOrderOverdue(o.deadline, o.status))
    .map((o) => ({ id: o.id, type: "deadline" as const, title: o.title || "Commande en retard", clientName: o.clients?.name, date: o.deadline!, status: o.status, isOverdue: true }));

  const todayData = {
    date: todayStr,
    items: todayItems,
    overdueItems,
    totalCount: todayItems.length,
    hasAny: todayItems.length > 0,
  };

  // ── Calendar data (current month) ──
  const calendarDays: Record<string, { date: string; isToday: boolean; tasksCount: number; deadlinesCount: number; ordersCount: number; eventsCount: number; paymentsCount: number; totalCount: number; hasAny: boolean; dominantType: string | null; hasUrgent: boolean }> = {};

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const dayTasks = tasks.filter((t) => t.due_date === key).length;
    const dayDeadlines = orders.filter((o) => o.deadline === key).length;
    const dayOrders = orders.filter((o) => o.created_at.startsWith(key)).length;
    const dayEvents = events.filter((e) => e.date === key).length;
    const dayPayments = orders.filter((o) => o.paid_at?.startsWith(key)).length;
    const total = dayTasks + dayDeadlines + dayOrders + dayEvents + dayPayments;
    const hasUrgent = tasks.some((t) => t.due_date === key && t.priority === "urgent") || orders.some((o) => o.deadline === key && o.priority === "urgent");

    let dominantType: string | null = null;
    const counts = [["task", dayTasks], ["deadline", dayDeadlines], ["order", dayOrders], ["event", dayEvents], ["payment", dayPayments]] as [string, number][];
    const max = Math.max(...counts.map(([, c]) => c));
    if (max > 0) dominantType = counts.find(([, c]) => c === max)?.[0] ?? null;

    calendarDays[key] = { date: key, isToday: key === todayStr, tasksCount: dayTasks, deadlinesCount: dayDeadlines, ordersCount: dayOrders, eventsCount: dayEvents, paymentsCount: dayPayments, totalCount: total, hasAny: total > 0, dominantType, hasUrgent };
  }

  const calendarData = { month: now.getMonth(), year: now.getFullYear(), days: calendarDays };

  // ── Upcoming deadlines ──
  // Utilise TERMINAL_STATUSES (source de vérité unique) — exclut les commandes finalisées
  const upcomingDeadlines = orders
    .filter((o) => o.deadline && !TERMINAL_STATUSES.has(o.status))
    .sort((a, b) => (a.deadline! > b.deadline! ? 1 : -1))
    .slice(0, 10)
    .map((o) => ({
      id: o.id,
      title: o.title || "Commande",
      deadline: o.deadline!,
      status: o.status,
      clientName: o.clients?.name ?? null,
      isToday: o.deadline === todayStr,
      isOverdue: o.deadline! < todayStr,
    }));

  // ── Recent orders (10) ──
  const recentOrders = orders.slice(0, 10).map((o) => ({
    id: o.id,
    title: o.title,
    amount: o.amount,
    status: o.status,
    created_at: o.created_at,
    clients: o.clients,
  }));

  // ── Clients stats ──
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const newClientsThisMonth = clients.filter((c) => c.created_at.startsWith(thisMonth)).length;

  // ── Response ──
  return NextResponse.json({
    pipelineSummary,
    totalRevenue: pipelineSummary.totalRevenue,
    monthRevenue: currentMonthRev,
    todayRevenue: todayItems.filter((i) => i.type === "order").reduce((s, i) => s + Number(i.amount || 0), 0),
    revenueChange: changePercent,
    ordersCount: activeOrders.length,
    activeOrdersCount: activeOrders.filter((o) => !["paid", "delivered", "invoiced"].includes(o.status)).length,
    pendingOrders,
    inProgressOrders,
    deliveredOrders,
    paidOrders,
    clientsCount: getActiveClientsCount(orders),
    newClientsThisMonth,
    activeProductsCount: productsRes.count ?? 0,
    revenueData,
    todayData,
    calendarData,
    recentOrders,
    overdueOrders,
    upcomingDeadlines,
  });
}
