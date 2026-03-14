import type { SupabaseClient } from "@supabase/supabase-js";
import type { CalendarDaySummary, DashboardCalendarMonthData } from "./types";

// ═══════════════════════════════════════
// getDashboardCalendarMonth
// ═══════════════════════════════════════
// Aggregates ALL business data for a given month:
//   - orders (by created_at + deadline)
//   - tasks (by due_date)
//   - calendar_events (by date)
//   - invoices (by due_date)

export async function getDashboardCalendarMonth(
  supabase: SupabaseClient,
  userId: string,
  month: number, // 0-indexed
  year: number,
  todayStr: string
): Promise<DashboardCalendarMonthData> {
  // Month range
  const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const endDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const days: Record<string, CalendarDaySummary> = {};

  const ensureDay = (d: string): CalendarDaySummary => {
    if (!days[d]) {
      days[d] = {
        date: d,
        isToday: d === todayStr,
        tasksCount: 0,
        deadlinesCount: 0,
        ordersCount: 0,
        eventsCount: 0,
        paymentsCount: 0,
        totalCount: 0,
        hasAny: false,
        dominantType: null,
        hasUrgent: false,
      };
    }
    return days[d];
  };

  // ── 1. Orders ──
  // Orders whose created_at falls in this month OR whose deadline falls in this month
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: orders } = await (supabase.from("orders") as any)
    .select("id, status, priority, created_at, deadline, paid_at, amount")
    .eq("user_id", userId)
    .not("status", "in", '("cancelled","refunded")');

  (orders || []).forEach((o: { created_at?: string; deadline?: string; status: string; paid_at?: string; priority?: string }) => {
    // created_at → order dot
    const createdDay = o.created_at?.slice(0, 10);
    if (createdDay && createdDay >= startDate && createdDay <= endDate) {
      ensureDay(createdDay).ordersCount++;
    }

    // deadline → deadline dot
    if (o.deadline) {
      const deadlineDay = typeof o.deadline === "string" ? o.deadline.slice(0, 10) : "";
      if (deadlineDay && deadlineDay >= startDate && deadlineDay <= endDate) {
        const day = ensureDay(deadlineDay);
        day.deadlinesCount++;
        if (o.priority === "urgent" || (deadlineDay < todayStr && !["paid", "delivered"].includes(o.status))) {
          day.hasUrgent = true;
        }
      }
    }

    // paid_at → payment dot
    if (o.paid_at) {
      const paidDay = typeof o.paid_at === "string" ? o.paid_at.slice(0, 10) : "";
      if (paidDay && paidDay >= startDate && paidDay <= endDate) {
        ensureDay(paidDay).paymentsCount++;
      }
    }
  });

  // ── 2. Tasks ──
  // All tasks with due_date in this month (any status — to show completed work too)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: tasks } = await (supabase.from("tasks") as any)
    .select("id, due_date, status, priority")
    .eq("user_id", userId)
    .gte("due_date", startDate)
    .lte("due_date", endDate);

  (tasks || []).forEach((t: { due_date: string; status: string; priority: string }) => {
    if (t.due_date) {
      const day = ensureDay(t.due_date);
      day.tasksCount++;
      if (t.priority === "urgent" || (t.due_date < todayStr && !["done", "completed"].includes(t.status))) {
        day.hasUrgent = true;
      }
    }
  });

  // ── 3. Calendar Events ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: events } = await (supabase.from("calendar_events") as any)
    .select("id, date, priority")
    .eq("user_id", userId)
    .gte("date", startDate)
    .lte("date", endDate);

  (events || []).forEach((e: { date: string; priority?: string }) => {
    if (e.date) {
      const day = ensureDay(e.date);
      day.eventsCount++;
      if (e.priority === "urgent") day.hasUrgent = true;
    }
  });

  // ── 4. Invoices ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: invoices } = await (supabase.from("invoices") as any)
    .select("id, due_date, status, paid_at")
    .eq("user_id", userId)
    .not("status", "eq", "cancelled")
    .gte("due_date", startDate)
    .lte("due_date", endDate);

  (invoices || []).forEach((inv: { due_date?: string; status: string; paid_at?: string }) => {
    if (inv.due_date) {
      const day = ensureDay(inv.due_date);
      // Invoice due = deadline-like, paid invoice = payment
      if (inv.status === "paid") {
        day.paymentsCount++;
      } else {
        day.deadlinesCount++;
        if (inv.status === "overdue") day.hasUrgent = true;
      }
    }
  });

  // ── Compute derived fields ──
  for (const d of Object.values(days)) {
    d.totalCount = d.tasksCount + d.deadlinesCount + d.ordersCount + d.eventsCount + d.paymentsCount;
    d.hasAny = d.totalCount > 0;

    // Dominant type = whatever has the most items
    const counts = [
      { type: "task" as const, n: d.tasksCount },
      { type: "deadline" as const, n: d.deadlinesCount },
      { type: "order" as const, n: d.ordersCount },
      { type: "event" as const, n: d.eventsCount },
      { type: "payment" as const, n: d.paymentsCount },
    ];
    const max = counts.reduce((a, b) => (b.n > a.n ? b : a));
    d.dominantType = max.n > 0 ? max.type : null;
  }

  console.log(`[DASHBOARD:CALENDAR] user=${userId} month=${month + 1}/${year} | orders=${orders?.length ?? 0} tasks=${tasks?.length ?? 0} events=${events?.length ?? 0} invoices=${invoices?.length ?? 0} | active_days=${Object.values(days).filter(d => d.hasAny).length}`);

  return { month, year, days };
}
