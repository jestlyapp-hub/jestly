import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { fixAttachmentUrls } from "@/lib/storage-utils";

// GET /api/tasks — list user's tasks
export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const showArchived = req.nextUrl.searchParams.get("archived") === "true";

  // Try with archived_at filter first (requires migration 024)
  // If that column doesn't exist, fall back to a simple query
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from("tasks") as any)
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (showArchived) {
    query = query.not("archived_at", "is", null);
  } else {
    query = query.is("archived_at", null);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[/api/tasks GET]", error.code, error.message);
    return NextResponse.json(
      { error: `Erreur de chargement des tâches : ${error.message}` },
      { status: 500 },
    );
  }

  // Map snake_case DB rows to camelCase for frontend, filter out malformed rows
  const mapped = (data || []).map(mapRowToTask).filter(Boolean);
  return NextResponse.json(mapped);
}

// POST /api/tasks — create a task
export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const body = await req.json();
  const now = new Date().toISOString();

  // Full record with all migration 024 columns
  const fullRecord = {
    user_id: user.id,
    title: body.title || "Sans titre",
    description: body.description || null,
    status: body.status || "todo",
    priority: body.priority || "medium",
    due_date: body.dueDate || null,
    client_id: body.clientId || null,
    client_name: body.clientName || null,
    order_id: body.orderId || null,
    order_title: body.orderTitle || null,
    tags: body.tags || [],
    subtasks: body.subtasks || [],
    attachments: body.attachments || [],
    archived_at: null,
    created_at: now,
    updated_at: now,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("tasks") as any)
    .insert(fullRecord)
    .select()
    .single();

  if (error) {
    console.error("[/api/tasks POST]", error.code, error.message);
    return NextResponse.json(
      { error: `Erreur lors de la création de la tâche : ${error.message}` },
      { status: 500 },
    );
  }

  // 🔔 Notification — tâche avec échéance (fire-and-forget)
  if (data?.due_date) {
    import("@/lib/notifications/triggers").then(({ triggerTaskDue }) =>
      triggerTaskDue({
        userId: user.id,
        taskId: data.id,
        taskTitle: data.title,
        dueDate: data.due_date,
      }).catch(() => {})
    );
  }

  return NextResponse.json(mapRowToTask(data), { status: 201 });
}

// PATCH /api/tasks — update a task
export async function PATCH(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const body = await req.json();
  const { id, ...fields } = body;

  if (!id) {
    return NextResponse.json({ error: "id requis" }, { status: 400 });
  }

  // Map camelCase to snake_case
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const update: Record<string, any> = { updated_at: new Date().toISOString() };
  if (fields.title !== undefined) update.title = fields.title;
  if (fields.description !== undefined) update.description = fields.description;
  if (fields.status !== undefined) update.status = fields.status;
  if (fields.priority !== undefined) update.priority = fields.priority;
  if (fields.dueDate !== undefined) update.due_date = fields.dueDate;
  if (fields.clientId !== undefined) update.client_id = fields.clientId;
  if (fields.clientName !== undefined) update.client_name = fields.clientName;
  if (fields.orderId !== undefined) update.order_id = fields.orderId;
  if (fields.orderTitle !== undefined) update.order_title = fields.orderTitle;
  if (fields.tags !== undefined) update.tags = fields.tags;
  if (fields.subtasks !== undefined) update.subtasks = fields.subtasks;
  if (fields.attachments !== undefined) update.attachments = fields.attachments;

  // Archive: use archived_at timestamp
  if (fields.archived === true) {
    update.archived_at = new Date().toISOString();
  } else if (fields.archived === false) {
    update.archived_at = null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("tasks") as any)
    .update(update)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error(`[/api/tasks PATCH] id=${id}:`, error.code, error.message);
    return NextResponse.json(
      { error: `Erreur lors de la mise à jour : ${error.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json(mapRowToTask(data));
}

// DELETE /api/tasks — delete a task
export async function DELETE(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "id requis" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from("tasks") as any)
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  return NextResponse.json({ ok: true });
}

// ── Mapping helpers ──

// Robust mapper: handles missing columns (pre-migration 024) and malformed data
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRowToTask(row: any) {
  if (!row || typeof row !== "object") {
    console.warn("[/api/tasks] Skipping malformed task row:", row);
    return null;
  }

  // Normalize priority: DB may have "normal" (pre-024) or "medium" (post-024)
  let priority = row.priority || "medium";
  if (priority === "normal") priority = "medium";
  if (!["low", "medium", "high", "urgent"].includes(priority)) priority = "medium";

  // Normalize status
  let status = row.status || "todo";
  if (!["todo", "in_progress", "done", "completed"].includes(status)) status = "todo";

  // Normalize tags/subtasks: might be JSONB array, string, or missing
  let tags: string[] = [];
  if (Array.isArray(row.tags)) tags = row.tags;
  else if (typeof row.tags === "string") {
    try { tags = JSON.parse(row.tags); } catch { tags = []; }
  }

  let subtasks: unknown[] = [];
  if (Array.isArray(row.subtasks)) subtasks = row.subtasks;
  else if (typeof row.subtasks === "string") {
    try { subtasks = JSON.parse(row.subtasks); } catch { subtasks = []; }
  }

  return {
    id: row.id,
    title: row.title || "Sans titre",
    description: row.description || undefined,
    status,
    priority,
    dueDate: row.due_date || undefined,
    clientId: row.client_id || undefined,
    clientName: row.client_name || undefined,
    orderId: row.order_id || undefined,
    orderTitle: row.order_title || undefined,
    tags,
    subtasks,
    attachments: fixAttachmentUrls(Array.isArray(row.attachments) ? row.attachments : []),
    archived: !!row.archived_at,
    archivedAt: row.archived_at || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
