import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

// POST /api/tasks/from-order — generate tasks from an order
export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const body = await req.json();
  const { orderId, orderTitle, clientId, clientName, tasks: taskTitles } = body;

  if (!orderId || !taskTitles || !Array.isArray(taskTitles) || taskTitles.length === 0) {
    return NextResponse.json(
      { error: "orderId et tasks (array de titres) sont requis" },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  const records = taskTitles.map((title: string, i: number) => ({
    user_id: user.id,
    title: title || `Tache ${i + 1}`,
    description: null,
    status: "todo",
    priority: "medium",
    due_date: null,
    client_id: clientId || null,
    client_name: clientName || null,
    order_id: orderId,
    order_title: orderTitle || null,
    tags: ["commande"],
    subtasks: [],
    archived_at: null,
    created_at: now,
    updated_at: now,
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("tasks") as any)
    .insert(records)
    .select();

  if (error) {
    console.error("[/api/tasks/from-order] Insert error:", error.message);
    return NextResponse.json(
      { error: "Erreur lors de la creation des taches" },
      { status: 500 }
    );
  }

  // Map to camelCase
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapped = (data || []).map((row: any) => ({
    id: row.id,
    title: row.title,
    description: row.description || undefined,
    status: row.status,
    priority: row.priority === "normal" ? "medium" : row.priority,
    dueDate: row.due_date || undefined,
    clientId: row.client_id || undefined,
    clientName: row.client_name || undefined,
    orderId: row.order_id || undefined,
    orderTitle: row.order_title || undefined,
    tags: row.tags || [],
    subtasks: row.subtasks || [],
    archived: !!row.archived_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  return NextResponse.json(mapped, { status: 201 });
}
