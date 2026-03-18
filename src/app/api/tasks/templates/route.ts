import { NextResponse, type NextRequest } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

// GET /api/tasks/templates — list user's templates
export async function GET() {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("task_templates") as any)
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    // Table might not exist yet
    if (error.code === "42P01" || error.code === "PGRST205") {
      return NextResponse.json([]);
    }
    console.error("[task-templates] GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Map snake_case to camelCase
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const templates = (data || []).map((t: any) => ({
    id: t.id,
    isSystem: t.is_system,
    name: t.name,
    description: t.description || "",
    defaultPriority: t.default_priority || "medium",
    tags: t.tags || [],
    subtasks: t.subtasks || [],
    notes: t.notes || "",
    createdAt: t.created_at,
    updatedAt: t.updated_at,
  }));

  return NextResponse.json(templates);
}

// POST /api/tasks/templates — create a new template
export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  const name = String(body.name || "").trim();
  if (!name) {
    return NextResponse.json({ error: "Le nom du modèle est requis" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("task_templates") as any)
    .insert({
      user_id: user.id,
      is_system: false,
      name: name.slice(0, 200),
      description: String(body.description || "").slice(0, 2000),
      default_priority: ["low", "medium", "high", "urgent"].includes(body.defaultPriority as string)
        ? body.defaultPriority
        : "medium",
      tags: Array.isArray(body.tags) ? body.tags.slice(0, 20) : [],
      subtasks: Array.isArray(body.subtasks) ? body.subtasks.slice(0, 50) : [],
      notes: String(body.notes || "").slice(0, 5000),
    })
    .select("*")
    .single();

  if (error) {
    console.error("[task-templates] POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    id: data.id,
    isSystem: data.is_system,
    name: data.name,
    description: data.description,
    defaultPriority: data.default_priority,
    tags: data.tags,
    subtasks: data.subtasks,
    notes: data.notes,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }, { status: 201 });
}

// PATCH /api/tasks/templates — update a template (body must include id)
export async function PATCH(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  const id = body.id as string;
  if (!id) return NextResponse.json({ error: "ID requis" }, { status: 400 });

  const updates: Record<string, unknown> = {};
  if ("name" in body) updates.name = String(body.name).slice(0, 200);
  if ("description" in body) updates.description = String(body.description).slice(0, 2000);
  if ("defaultPriority" in body && ["low", "medium", "high", "urgent"].includes(body.defaultPriority as string)) {
    updates.default_priority = body.defaultPriority;
  }
  if ("tags" in body) updates.tags = Array.isArray(body.tags) ? body.tags.slice(0, 20) : [];
  if ("subtasks" in body) updates.subtasks = Array.isArray(body.subtasks) ? body.subtasks.slice(0, 50) : [];
  if ("notes" in body) updates.notes = String(body.notes).slice(0, 5000);
  updates.updated_at = new Date().toISOString();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("task_templates") as any)
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .eq("is_system", false); // Cannot edit system templates

  if (error) {
    console.error("[task-templates] PATCH error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// DELETE /api/tasks/templates — delete a template (body must include id)
export async function DELETE(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  const id = body.id as string;
  if (!id) return NextResponse.json({ error: "ID requis" }, { status: 400 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("task_templates") as any)
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .eq("is_system", false); // Cannot delete system templates

  if (error) {
    console.error("[task-templates] DELETE error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
