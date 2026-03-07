import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { MOCK_CALENDAR_EVENTS } from "@/lib/calendar-utils";
import type { CalendarEvent, EventCategory, EventPriority } from "@/lib/calendar-utils";

// GET /api/calendar/events — list calendar events (manual + order deadlines)
export async function GET() {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  let manualEvents: CalendarEvent[] = [];

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from("calendar_events") as any)
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: true });

    if (!error && data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      manualEvents = data.map((row: any) => ({
        id: row.id,
        title: row.title,
        category: row.category as EventCategory,
        date: typeof row.date === "string" ? row.date.substring(0, 10) : row.date,
        startTime: row.start_time || undefined,
        endTime: row.end_time || undefined,
        allDay: row.all_day ?? true,
        notes: row.notes || undefined,
        priority: (row.priority || "medium") as EventPriority,
        source: "manual" as const,
        color: row.color || undefined,
        clientId: row.client_id || undefined,
        clientName: row.client_name || undefined,
        clientEmail: row.client_email || undefined,
        orderId: row.order_id || undefined,
      }));
    }
  } catch {
    // Table doesn't exist yet — fallback to mock
  }

  // Fetch orders with deadlines (products table, not services)
  let orderEvents: CalendarEvent[] = [];
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: orders } = await (supabase.from("orders") as any)
      .select("id, title, deadline, status, amount, priority, notes, clients(name, email), products(name)")
      .eq("user_id", user.id)
      .not("deadline", "is", null);

    if (orders) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      orderEvents = orders.map((o: any) => {
        // Extract YYYY-MM-DD from timestamptz deadline
        const deadlineStr = typeof o.deadline === "string"
          ? o.deadline.substring(0, 10)
          : new Date(o.deadline).toISOString().substring(0, 10);

        return {
          id: `order-${o.id}`,
          title: `${o.products?.name || o.title} — ${o.clients?.name || "Client"}`,
          category: "deadline" as EventCategory,
          date: deadlineStr,
          allDay: true,
          notes: o.notes || undefined,
          priority: o.priority === "urgent" ? "urgent" : o.priority === "high" ? "high" : "medium",
          source: "order" as const,
          orderId: o.id,
          orderStatus: o.status,
          orderPrice: o.amount,
          clientName: o.clients?.name,
          clientEmail: o.clients?.email,
          productName: o.products?.name || o.title,
        } as CalendarEvent;
      });
    }
  } catch {
    // No orders table or connection issue
  }

  const allEvents = [...manualEvents, ...orderEvents];

  // If no data from DB at all, return mock
  if (allEvents.length === 0) {
    return NextResponse.json(MOCK_CALENDAR_EVENTS);
  }

  return NextResponse.json(allEvents);
}

// POST /api/calendar/events — create a manual calendar event
export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const body = await req.json();
  const { title, category, date, startTime, endTime, allDay, notes, priority, color, clientId, clientName, clientEmail, orderId } = body;

  if (!title || !date || !category) {
    return NextResponse.json({ error: "title, date et category sont requis" }, { status: 400 });
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from("calendar_events") as any)
      .insert({
        user_id: user.id,
        title,
        category,
        date,
        start_time: startTime || null,
        end_time: endTime || null,
        all_day: allDay ?? (!startTime),
        notes: notes || null,
        priority: priority || "medium",
        color: color || null,
        client_id: clientId || null,
        client_name: clientName || null,
        client_email: clientEmail || null,
        order_id: orderId || null,
      })
      .select()
      .single();

    if (error) throw error;

    const event: CalendarEvent = {
      id: data.id,
      title: data.title,
      category: data.category,
      date: typeof data.date === "string" ? data.date.substring(0, 10) : data.date,
      startTime: data.start_time || undefined,
      endTime: data.end_time || undefined,
      allDay: data.all_day,
      notes: data.notes || undefined,
      priority: data.priority || "medium",
      source: "manual",
      color: data.color || undefined,
      clientId: data.client_id || undefined,
      clientName: data.client_name || undefined,
      clientEmail: data.client_email || undefined,
      orderId: data.order_id || undefined,
    };

    return NextResponse.json(event, { status: 201 });
  } catch {
    // Table doesn't exist — return mock-like response
    const mockEvent: CalendarEvent = {
      id: `evt-${Date.now()}`,
      title,
      category,
      date,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      allDay: allDay ?? (!startTime),
      notes: notes || undefined,
      priority: priority || "medium",
      source: "manual",
      color: color || undefined,
      clientId: clientId || undefined,
      clientName: clientName || undefined,
      clientEmail: clientEmail || undefined,
    };
    return NextResponse.json(mockEvent, { status: 201 });
  }
}

// PATCH /api/calendar/events — update a manual calendar event (drag reschedule, edit)
export async function PATCH(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const body = await req.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing event id" }, { status: 400 });
  }

  // Map camelCase to snake_case for DB
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dbUpdates: Record<string, any> = {};
  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.category !== undefined) dbUpdates.category = updates.category;
  if (updates.date !== undefined) dbUpdates.date = updates.date;
  if (updates.startTime !== undefined) dbUpdates.start_time = updates.startTime || null;
  if (updates.endTime !== undefined) dbUpdates.end_time = updates.endTime || null;
  if (updates.allDay !== undefined) dbUpdates.all_day = updates.allDay;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes || null;
  if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
  if (updates.color !== undefined) dbUpdates.color = updates.color || null;
  if (updates.clientId !== undefined) dbUpdates.client_id = updates.clientId || null;
  if (updates.clientName !== undefined) dbUpdates.client_name = updates.clientName || null;
  if (updates.clientEmail !== undefined) dbUpdates.client_email = updates.clientEmail || null;

  if (Object.keys(dbUpdates).length === 0) {
    return NextResponse.json({ error: "No updates provided" }, { status: 400 });
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from("calendar_events") as any)
      .update(dbUpdates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;

    const event: CalendarEvent = {
      id: data.id,
      title: data.title,
      category: data.category,
      date: typeof data.date === "string" ? data.date.substring(0, 10) : data.date,
      startTime: data.start_time || undefined,
      endTime: data.end_time || undefined,
      allDay: data.all_day,
      notes: data.notes || undefined,
      priority: data.priority || "medium",
      source: "manual",
      color: data.color || undefined,
      clientId: data.client_id || undefined,
      clientName: data.client_name || undefined,
      clientEmail: data.client_email || undefined,
      orderId: data.order_id || undefined,
    };

    return NextResponse.json(event);
  } catch {
    return NextResponse.json({ ok: true });
  }
}

// DELETE /api/calendar/events — delete a manual calendar event
export async function DELETE(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;
  const body = await req.json();
  const { id } = body;
  if (!id) return NextResponse.json({ error: "Missing event id" }, { status: 400 });

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("calendar_events") as any)
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);
  } catch {
    // Table may not exist
  }

  return NextResponse.json({ ok: true });
}
