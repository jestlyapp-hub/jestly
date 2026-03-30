import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

// PATCH /api/orders/reorder — batch update sort_position for drag-and-drop
export async function PATCH(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  let body: { items?: { id: string; sort_position: number }[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "items[] requis" }, { status: 400 });
  }

  const errors: string[] = [];

  for (const item of body.items) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("orders") as any)
      .update({ sort_position: item.sort_position })
      .eq("id", item.id)
      .eq("user_id", user.id);

    if (error) {
      // If column doesn't exist yet, skip silently (migration 056 not applied)
      if (error.message?.includes("sort_position")) {
        console.warn("[orders-reorder] sort_position column missing — Run migration 056.");
        return NextResponse.json({ ok: false, error: "Colonne sort_position manquante. Lancez : node scripts/migrate.mjs" }, { status: 409 });
      }
      errors.push(`${item.id}: ${error.message}`);
    }
  }

  if (errors.length > 0) {
    console.error("[orders-reorder] errors:", errors);
    return NextResponse.json({ ok: false, errors }, { status: 207 });
  }

  return NextResponse.json({ ok: true });
}
