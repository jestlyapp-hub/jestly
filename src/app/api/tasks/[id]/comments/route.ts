import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

// GET /api/tasks/[id]/comments — Récupérer tous les commentaires d'une tâche
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const { id } = await params;

  // Verify task ownership first
  const { data: task } = await (supabase.from("tasks") as any)
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!task) {
    return NextResponse.json({ error: "Tâche introuvable" }, { status: 404 });
  }

  const { data, error } = await (supabase.from("task_comments") as any)
    .select("*")
    .eq("task_id", id)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: "Erreur lors de la récupération des commentaires" },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}

// POST /api/tasks/[id]/comments — Ajouter un commentaire
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const { id } = await params;
  const { content } = await req.json();

  if (!content || typeof content !== "string") {
    return NextResponse.json(
      { error: "Le contenu du commentaire est requis" },
      { status: 400 }
    );
  }

  const { data, error } = await (supabase.from("task_comments") as any)
    .insert({ task_id: id, user_id: user.id, content })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Erreur lors de la création du commentaire" },
      { status: 500 }
    );
  }

  // Journal d'activité
  await (supabase.from("task_activity_log") as any).insert({
    task_id: id,
    user_id: user.id,
    activity_type: "comment_added",
    description: content.slice(0, 100),
  });

  return NextResponse.json(data, { status: 201 });
}

// DELETE /api/tasks/[id]/comments — Supprimer un commentaire
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const { id } = await params;
  const { commentId } = await req.json();

  if (!commentId) {
    return NextResponse.json(
      { error: "L'identifiant du commentaire est requis" },
      { status: 400 }
    );
  }

  const { error } = await (supabase.from("task_comments") as any)
    .delete()
    .eq("id", commentId)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json(
      { error: "Erreur lors de la suppression du commentaire" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
