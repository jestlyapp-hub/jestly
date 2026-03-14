import type { SupabaseClient } from "@supabase/supabase-js";
import type { TodayItem, DashboardTodayData } from "./types";

// ═══════════════════════════════════════
// getDashboardToday
// ═══════════════════════════════════════
// Aggregates ALL business items for today:
//   - tasks due today or overdue
//   - orders with deadline today or overdue (not completed)
//   - orders created today (new business)
//   - calendar events today
//   - invoices due today or overdue
//   - active work (in_progress / in_review)

export async function getDashboardToday(
  supabase: SupabaseClient,
  userId: string,
  todayStr: string
): Promise<DashboardTodayData> {
  const items: TodayItem[] = [];
  const overdueItems: TodayItem[] = [];

  // ── 1. Tasks due today or overdue (not completed) ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: tasks } = await (supabase.from("tasks") as any)
    .select("id, title, status, priority, due_date")
    .eq("user_id", userId)
    .in("status", ["todo", "in_progress"])
    .lte("due_date", todayStr)
    .order("due_date", { ascending: true });

  (tasks || []).forEach((t: { id: string; title: string; status: string; priority: string; due_date: string }) => {
    const isOverdue = t.due_date < todayStr;
    const item: TodayItem = {
      id: t.id,
      type: "task",
      title: t.title,
      date: t.due_date,
      status: t.status,
      priority: t.priority as TodayItem["priority"],
      isOverdue,
    };
    if (isOverdue) overdueItems.push(item);
    else items.push(item);
  });

  // ── 2. Order deadlines today or overdue ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: deadlineOrders } = await (supabase.from("orders") as any)
    .select("id, title, status, priority, deadline, amount, clients(name)")
    .eq("user_id", userId)
    .not("status", "in", '("paid","delivered","cancelled","refunded")')
    .not("deadline", "is", null)
    .lte("deadline", todayStr + "T23:59:59Z")
    .order("deadline", { ascending: true });

  (deadlineOrders || []).forEach((o: { id: string; title: string; status: string; priority?: string; deadline: string; amount?: number; clients?: { name: string } | null }) => {
    const deadlineDay = typeof o.deadline === "string" ? o.deadline.slice(0, 10) : "";
    const isOverdue = deadlineDay < todayStr;
    const item: TodayItem = {
      id: `deadline-${o.id}`,
      type: "deadline",
      title: o.title,
      clientName: o.clients?.name || null,
      date: deadlineDay,
      status: o.status,
      priority: (o.priority as TodayItem["priority"]) || null,
      isOverdue,
      amount: Number(o.amount) || null,
    };
    if (isOverdue) overdueItems.push(item);
    else items.push(item);
  });

  // ── 3. New orders created today ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: newOrders } = await (supabase.from("orders") as any)
    .select("id, title, status, amount, created_at, clients(name)")
    .eq("user_id", userId)
    .gte("created_at", todayStr + "T00:00:00Z")
    .lte("created_at", todayStr + "T23:59:59Z")
    .not("status", "in", '("cancelled","refunded")')
    .order("created_at", { ascending: false })
    .limit(5);

  (newOrders || []).forEach((o: { id: string; title: string; status: string; amount?: number; created_at: string; clients?: { name: string } | null }) => {
    // Avoid duplicate if already in deadlines
    if (overdueItems.some(i => i.id === `deadline-${o.id}`) || items.some(i => i.id === `deadline-${o.id}`)) return;
    items.push({
      id: `order-${o.id}`,
      type: "order",
      title: o.title,
      subtitle: "Nouvelle commande",
      clientName: o.clients?.name || null,
      date: todayStr,
      status: o.status,
      isOverdue: false,
      amount: Number(o.amount) || null,
    });
  });

  // ── 4. Calendar events today ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: events } = await (supabase.from("calendar_events") as any)
    .select("id, title, date, start_time, end_time, category, priority, client_name")
    .eq("user_id", userId)
    .eq("date", todayStr)
    .order("start_time", { ascending: true });

  (events || []).forEach((e: { id: string; title: string; date: string; start_time?: string; end_time?: string; category?: string; priority?: string; client_name?: string }) => {
    items.push({
      id: `event-${e.id}`,
      type: "event",
      title: e.title,
      subtitle: e.category || undefined,
      clientName: e.client_name || null,
      date: e.date,
      timeLabel: e.start_time ? (e.end_time ? `${e.start_time} - ${e.end_time}` : e.start_time) : null,
      priority: (e.priority as TodayItem["priority"]) || null,
      isOverdue: false,
    });
  });

  // ── 5. Invoices due today or overdue ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: invoices } = await (supabase.from("invoices") as any)
    .select("id, invoice_number, total, status, due_date, clients(name)")
    .eq("user_id", userId)
    .in("status", ["sent", "overdue"])
    .lte("due_date", todayStr)
    .order("due_date", { ascending: true });

  (invoices || []).forEach((inv: { id: string; invoice_number: string; total?: number; status: string; due_date: string; clients?: { name: string } | null }) => {
    const isOverdue = inv.due_date < todayStr;
    const item: TodayItem = {
      id: `invoice-${inv.id}`,
      type: "invoice",
      title: `Facture ${inv.invoice_number}`,
      clientName: inv.clients?.name || null,
      date: inv.due_date,
      status: inv.status,
      isOverdue,
      amount: Number(inv.total) || null,
    };
    if (isOverdue) overdueItems.push(item);
    else items.push(item);
  });

  // ── 6. Active work orders (in_progress / in_review) — always show ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: activeOrders } = await (supabase.from("orders") as any)
    .select("id, title, status, clients(name)")
    .eq("user_id", userId)
    .in("status", ["in_progress", "in_review"])
    .order("updated_at", { ascending: false })
    .limit(5);

  (activeOrders || []).forEach((o: { id: string; title: string; status: string; clients?: { name: string } | null }) => {
    // Avoid duplicates
    const existingIds = [...items, ...overdueItems].map(i => i.id);
    if (existingIds.includes(`order-${o.id}`) || existingIds.includes(`deadline-${o.id}`)) return;
    items.push({
      id: `active-${o.id}`,
      type: "order",
      title: o.title,
      subtitle: o.status === "in_review" ? "En révision" : "En cours",
      clientName: o.clients?.name || null,
      date: todayStr,
      status: o.status,
      isOverdue: false,
    });
  });

  // Sort: overdue by date asc, then items by priority
  overdueItems.sort((a, b) => a.date.localeCompare(b.date));

  const totalCount = items.length + overdueItems.length;

  console.log(`[DASHBOARD:TODAY] user=${userId} date=${todayStr} | tasks=${tasks?.length ?? 0} deadlines=${deadlineOrders?.length ?? 0} newOrders=${newOrders?.length ?? 0} events=${events?.length ?? 0} invoices=${invoices?.length ?? 0} active=${activeOrders?.length ?? 0} | total=${totalCount}`);

  return {
    date: todayStr,
    items,
    overdueItems,
    totalCount,
    hasAny: totalCount > 0,
  };
}
