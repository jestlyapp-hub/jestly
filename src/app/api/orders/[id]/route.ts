import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { enrichOrdersWithProducts } from "@/lib/supabase-helpers";

// GET /api/orders/[id]
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = await getAuthUser();
    if (auth.error) return auth.error;
    const { user, supabase } = auth;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from("orders") as any)
      .select("*, clients(name, email, phone, company), order_brief_responses(*), order_files(*)")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error(`[GET /api/orders/${id}]`, error.code, error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }

    const [enriched] = await enrichOrdersWithProducts(supabase, [data], user.id);
    return NextResponse.json(enriched);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[GET /api/orders/:id] fatal:", msg);
    return NextResponse.json({ error: `Server: ${msg}` }, { status: 500 });
  }
}

// PATCH /api/orders/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = await getAuthUser();
    if (auth.error) return auth.error;
    const { user, supabase } = auth;

    const body = await req.json();
    const allowed = ["status", "priority", "deadline", "notes", "paid", "title", "description", "amount", "checklist", "tags", "custom_fields", "client_id", "briefing", "resources", "category", "external_ref", "status_before_paid"];
    const optionalCols = ["checklist", "tags", "custom_fields", "briefing", "resources", "category", "external_ref", "status_before_paid"];

    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) updates[key] = body[key];
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Aucun champ valide à mettre à jour" }, { status: 400 });
    }

    // Update + select WITHOUT products join (PostgREST FK issue)
    const doUpdate = (fields: Record<string, unknown>) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from("orders") as any)
        .update(fields)
        .eq("id", id)
        .eq("user_id", user.id)
        .select("*, clients(name, email, phone)")
        .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let { data, error } = await doUpdate(updates) as { data: any; error: any };

    // If error about missing columns, retry without optional cols
    if (error && (error.message?.includes("schema cache") || error.message?.includes("Could not find"))) {
      const safeUpdates = { ...updates };
      for (const col of optionalCols) delete safeUpdates[col];
      if (Object.keys(safeUpdates).length > 0) {
        ({ data, error } = await doUpdate(safeUpdates));
      } else {
        return NextResponse.json({ error: "Colonnes manquantes. Exécutez: node scripts/migrate.mjs" }, { status: 500 });
      }
    }

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
      }
      if (error.code === "23514" || error.message?.includes("check constraint")) {
        return NextResponse.json(
          { error: "Colonnes manquantes : contrainte invalide. Exécutez: node scripts/migrate.mjs" },
          { status: 409 }
        );
      }
      console.error(`[PATCH /api/orders/${id}]`, error.code, error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const [enriched] = await enrichOrdersWithProducts(supabase, [data], user.id);
    return NextResponse.json(enriched);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[PATCH /api/orders/:id] fatal:", msg);
    return NextResponse.json({ error: `Server: ${msg}` }, { status: 500 });
  }
}
