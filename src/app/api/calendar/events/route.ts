import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import type { CalendarEvent, EventCategory, EventPriority } from "@/lib/calendar-utils";

// ─── Auto-migration: create calendar_events table if missing ───

let migrationAttempted = false;

async function ensureCalendarTable(): Promise<boolean> {
  if (migrationAttempted) return true;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const dbPassword = process.env.DATABASE_PASSWORD;
  if (!supabaseUrl || !dbPassword) {
    console.warn("[calendar] Cannot auto-migrate: missing DATABASE_PASSWORD");
    return false;
  }

  const ref = new URL(supabaseUrl).hostname.split(".")[0];

  try {
    // Dynamic import — postgres.js
    const postgres = (await import("postgres")).default;
    const sql = postgres({
      host: `db.${ref}.supabase.co`,
      port: 5432,
      database: "postgres",
      username: "postgres",
      password: dbPassword,
      ssl: "require",
      connect_timeout: 15,
      idle_timeout: 5,
      max: 1,
    });

    try {
      await sql`
        CREATE TABLE IF NOT EXISTS public.calendar_events (
          id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id     uuid        NOT NULL,
          title       text        NOT NULL,
          category    text        NOT NULL DEFAULT 'personnel',
          date        date        NOT NULL,
          start_time  text,
          end_time    text,
          all_day     boolean     NOT NULL DEFAULT true,
          notes       text,
          priority    text        NOT NULL DEFAULT 'medium'
                                  CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
          color       text,
          client_id   uuid,
          client_name text,
          client_email text,
          order_id    uuid,
          created_at  timestamptz NOT NULL DEFAULT now(),
          updated_at  timestamptz NOT NULL DEFAULT now()
        )
      `;

      await sql`CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON public.calendar_events(user_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON public.calendar_events(user_id, date)`;
      await sql`ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY`;

      // Idempotent RLS policies
      await sql.unsafe(`
        DO $$ BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'calendar_events' AND policyname = 'calendar_events_select') THEN
            CREATE POLICY calendar_events_select ON public.calendar_events FOR SELECT USING (user_id = auth.uid());
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'calendar_events' AND policyname = 'calendar_events_insert') THEN
            CREATE POLICY calendar_events_insert ON public.calendar_events FOR INSERT WITH CHECK (user_id = auth.uid());
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'calendar_events' AND policyname = 'calendar_events_update') THEN
            CREATE POLICY calendar_events_update ON public.calendar_events FOR UPDATE USING (user_id = auth.uid());
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'calendar_events' AND policyname = 'calendar_events_delete') THEN
            CREATE POLICY calendar_events_delete ON public.calendar_events FOR DELETE USING (user_id = auth.uid());
          END IF;
        END $$
      `);

      await sql`NOTIFY pgrst, 'reload schema'`;
      console.log("[calendar] Auto-migration: calendar_events table created successfully");
      migrationAttempted = true;
      return true;
    } finally {
      await sql.end();
    }
  } catch (e) {
    console.error("[calendar] Auto-migration failed:", e instanceof Error ? e.message : e);
    migrationAttempted = true; // Don't retry on every request
    return false;
  }
}

// ─── Helpers ───

function isTableMissingError(error: { code?: string; message?: string }): boolean {
  const msg = (error.message || "").toLowerCase();
  return (
    error.code === "42P01" ||
    msg.includes("does not exist") ||
    msg.includes("could not find the table") ||
    msg.includes("schema cache")
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToEvent(row: any): CalendarEvent {
  return {
    id: row.id,
    title: row.title || "Sans titre",
    category: (row.category || "personnel") as EventCategory,
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
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildInsertPayload(userId: string, body: any) {
  return {
    user_id: userId,
    title: body.title,
    category: body.category,
    date: body.date,
    start_time: body.startTime || null,
    end_time: body.endTime || null,
    all_day: body.allDay ?? (!body.startTime),
    notes: body.notes || null,
    priority: body.priority || "medium",
    color: body.color || null,
    client_id: body.clientId || null,
    client_name: body.clientName || null,
    client_email: body.clientEmail || null,
    order_id: body.orderId || null,
  };
}

// ─── GET ───

export async function GET() {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  let manualEvents: CalendarEvent[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let result = await (supabase.from("calendar_events") as any)
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: true });

  // If table missing → auto-migrate and retry
  if (result.error && isTableMissingError(result.error)) {
    console.warn("[calendar GET] Table missing, attempting auto-migration...");
    const migrated = await ensureCalendarTable();
    if (migrated) {
      // Wait for PostgREST schema cache to refresh, then retry (up to 2 attempts)
      for (const delay of [2000, 3000]) {
        await new Promise((r) => setTimeout(r, delay));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        result = await (supabase.from("calendar_events") as any)
          .select("*")
          .eq("user_id", user.id)
          .order("date", { ascending: true });
        if (!result.error) break;
        console.warn(`[calendar GET] Retry after ${delay}ms still failed:`, result.error.message);
      }
    }
  }

  if (result.error) {
    console.warn("[calendar GET] calendar_events query failed:", result.error.code, result.error.message);
  } else if (result.data) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    manualEvents = result.data.map((row: any) => rowToEvent(row));
  }

  // Fetch orders
  let orderEvents: CalendarEvent[] = [];
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let ordersResult = await (supabase.from("orders") as any)
      .select("id, title, deadline, status, amount, priority, notes, created_at, clients(name, email), products(name)")
      .eq("user_id", user.id);

    if (ordersResult.error || !ordersResult.data) {
      ordersResult = await (supabase.from("orders") as any)
        .select("id, title, deadline, status, amount, priority, notes, created_at, clients(name, email), products(name)")
        .eq("user_id", user.id);
    }

    if (ordersResult.error || !ordersResult.data) {
      ordersResult = await (supabase.from("orders") as any)
        .select("id, title, deadline, status, amount, priority, notes, created_at")
        .eq("user_id", user.id);
    }

    if (ordersResult.data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      orderEvents = ordersResult.data.filter((o: any) => o.deadline || o.created_at).map((o: any) => {
        const hasDeadline = !!o.deadline;
        const rawDate = hasDeadline ? o.deadline : o.created_at;
        const eventDate = typeof rawDate === "string"
          ? rawDate.substring(0, 10)
          : new Date(rawDate).toISOString().substring(0, 10);

        const productName = o.products?.name || o.products?.name || o.title || "Commande";
        const clientName = o.clients?.name || "Client";

        return {
          id: `order-${o.id}`,
          title: hasDeadline ? `${productName} — ${clientName}` : `Commande: ${productName} — ${clientName}`,
          category: "deadline" as EventCategory,
          date: eventDate,
          allDay: true,
          notes: o.notes || undefined,
          priority: o.priority === "urgent" ? "urgent" : o.priority === "high" ? "high" : "medium",
          source: "order" as const,
          orderId: o.id,
          orderStatus: o.status,
          orderPrice: o.amount,
          clientName: o.clients?.name,
          clientEmail: o.clients?.email,
          productName,
        } as CalendarEvent;
      });
    }
  } catch {
    // No orders table
  }

  return NextResponse.json([...manualEvents, ...orderEvents]);
}

// ─── POST ───

export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const body = await req.json();

  if (!body.title || !body.date || !body.category) {
    return NextResponse.json(
      { error: "title, date et category sont requis", code: "VALIDATION" },
      { status: 400 }
    );
  }

  const payload = buildInsertPayload(user.id, body);
  console.log("[calendar POST] Inserting event:", { title: payload.title, date: payload.date, category: payload.category, allDay: payload.all_day });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let result = await (supabase.from("calendar_events") as any)
    .insert(payload)
    .select()
    .single();

  // If table missing → auto-migrate and retry
  if (result.error && isTableMissingError(result.error)) {
    console.warn("[calendar POST] Table missing, attempting auto-migration...");
    const migrated = await ensureCalendarTable();
    if (migrated) {
      // Wait for PostgREST schema cache to refresh, then retry (up to 2 attempts)
      for (const delay of [2000, 3000]) {
        await new Promise((r) => setTimeout(r, delay));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        result = await (supabase.from("calendar_events") as any)
          .insert(payload)
          .select()
          .single();
        if (!result.error) break;
        console.warn(`[calendar POST] Retry after ${delay}ms still failed:`, result.error.message);
      }
    }
  }

  if (result.error) {
    console.error("[calendar POST] Insert failed:", result.error.code, result.error.message);
    const isTableError = isTableMissingError(result.error);
    return NextResponse.json(
      {
        error: isTableError
          ? "Table calendar_events introuvable. La migration automatique a echoue. Executez la migration 023 manuellement dans Supabase SQL Editor."
          : `Impossible de creer l'evenement: ${result.error.message}`,
        code: isTableError ? "TABLE_MISSING" : "INSERT_FAILED",
        detail: result.error.message,
      },
      { status: 500 }
    );
  }

  console.log("[calendar POST] Event created:", result.data.id);
  return NextResponse.json(rowToEvent(result.data), { status: 201 });
}

// ─── PATCH ───

export async function PATCH(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const body = await req.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing event id", code: "VALIDATION" }, { status: 400 });
  }

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
    return NextResponse.json({ error: "No updates provided", code: "VALIDATION" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("calendar_events") as any)
    .update(dbUpdates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("[calendar PATCH] Update failed:", error.code, error.message);
    return NextResponse.json(
      { error: `Impossible de modifier l'evenement: ${error.message}`, code: "UPDATE_FAILED" },
      { status: 500 }
    );
  }

  return NextResponse.json(rowToEvent(data));
}

// ─── DELETE ───

export async function DELETE(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const body = await req.json();
  const { id } = body;
  if (!id) return NextResponse.json({ error: "Missing event id", code: "VALIDATION" }, { status: 400 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("calendar_events") as any)
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("[calendar DELETE] Delete failed:", error.code, error.message);
    return NextResponse.json(
      { error: `Impossible de supprimer l'evenement: ${error.message}`, code: "DELETE_FAILED" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
