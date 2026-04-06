import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

export interface CalendarCategory {
  id: string;
  name: string;
  color: string;
  icon?: string;
  position: number;
}

/** Catégories par défaut — insérées automatiquement pour les nouveaux utilisateurs */
const DEFAULT_CATEGORIES: { name: string; color: string; position: number }[] = [
  { name: "Appel",      color: "#3B82F6", position: 0 },
  { name: "Session",    color: "#8B5CF6", position: 1 },
  { name: "Contenu",    color: "#06B6D4", position: 2 },
  { name: "Review",     color: "#F59E0B", position: 3 },
  { name: "Livraison",  color: "#10B981", position: 4 },
  { name: "Rappel",     color: "#F97316", position: 5 },
  { name: "Admin",      color: "#64748B", position: 6 },
  { name: "Personnel",  color: "#6366F1", position: 7 },
  { name: "Tâche",      color: "#9333EA", position: 8 },
  { name: "Projet",     color: "#14B8A6", position: 9 },
  { name: "Facture",    color: "#EC4899", position: 10 },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToCategory(row: any): CalendarCategory {
  return {
    id: row.id,
    name: row.name,
    color: row.color || "#6366F1",
    icon: row.icon || undefined,
    position: row.position ?? 0,
  };
}

// ─── GET ───
export async function GET() {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let { data, error } = await (supabase.from("calendar_categories") as any)
    .select("*")
    .eq("user_id", user.id)
    .order("position", { ascending: true });

  if (error) {
    console.error("[calendar/categories GET]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Auto-seed : si l'utilisateur n'a aucune catégorie, insérer les défauts
  if (!data || data.length === 0) {
    const rows = DEFAULT_CATEGORIES.map((c) => ({
      user_id: user.id,
      name: c.name,
      color: c.color,
      position: c.position,
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const seedResult = await (supabase.from("calendar_categories") as any)
      .insert(rows)
      .select();

    if (seedResult.error) {
      console.error("[calendar/categories] Auto-seed failed:", seedResult.error.message);
      return NextResponse.json([], { status: 200 });
    }

    data = seedResult.data;
    console.log(`[calendar/categories] Auto-seeded ${data.length} default categories for user ${user.id}`);
  }

  return NextResponse.json((data || []).map(rowToCategory));
}

// ─── POST ───
export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const body = await req.json();
  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Le nom est requis" }, { status: 400 });
  }

  // Trouver la position max pour mettre la nouvelle catégorie à la fin
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase.from("calendar_categories") as any)
    .select("position")
    .eq("user_id", user.id)
    .order("position", { ascending: false })
    .limit(1);

  const nextPosition = existing && existing.length > 0 ? (existing[0].position ?? 0) + 1 : 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("calendar_categories") as any)
    .insert({
      user_id: user.id,
      name: body.name.trim(),
      color: body.color || "#6366F1",
      icon: body.icon || null,
      position: body.position ?? nextPosition,
    })
    .select()
    .single();

  if (error) {
    console.error("[calendar/categories POST]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(rowToCategory(data), { status: 201 });
}

// ─── PATCH ───
export async function PATCH(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const body = await req.json();
  if (!body.id) {
    return NextResponse.json({ error: "id requis" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates: Record<string, any> = {};
  if (body.name !== undefined) updates.name = body.name.trim();
  if (body.color !== undefined) updates.color = body.color;
  if (body.icon !== undefined) updates.icon = body.icon || null;
  if (body.position !== undefined) updates.position = body.position;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Aucune modification" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("calendar_categories") as any)
    .update(updates)
    .eq("id", body.id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("[calendar/categories PATCH]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(rowToCategory(data));
}

// ─── DELETE ───
export async function DELETE(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const body = await req.json();
  if (!body.id) {
    return NextResponse.json({ error: "id requis" }, { status: 400 });
  }

  // Nettoyer les événements qui utilisent cette catégorie (remettre category_id à null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from("calendar_events") as any)
    .update({ category_id: null, category: "personnel" })
    .eq("category_id", body.id)
    .eq("user_id", user.id);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("calendar_categories") as any)
    .delete()
    .eq("id", body.id)
    .eq("user_id", user.id);

  if (error) {
    console.error("[calendar/categories DELETE]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
