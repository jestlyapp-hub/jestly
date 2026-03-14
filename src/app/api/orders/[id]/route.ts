import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

// GET /api/orders/[id]
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = await getAuthUser();
    if (auth.error) return auth.error;
    const { user, supabase } = auth;

    // maybeSingle: returns null if 0 rows (no throw), errors only on real DB issues
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from("orders") as any)
      .select("*, clients(name, email, phone, company), products(name, price_cents), order_brief_responses(*), order_files(*)")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error(`[GET /api/orders/${id}]`, error.code, error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(data);
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
    const allowed = ["status", "priority", "deadline", "notes", "paid", "title", "description", "amount", "checklist", "tags", "custom_fields", "client_id", "briefing", "resources", "category", "external_ref"];
    // Columns that might not exist yet (require migrations)
    const optionalCols = ["checklist", "tags", "custom_fields", "briefing", "resources", "category", "external_ref"];

    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) updates[key] = body[key];
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    // Single query: update + select in one roundtrip.
    // Guarantees the returned row IS the updated row (no stale re-fetch).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const doUpdate = (fields: Record<string, unknown>) =>
      (supabase.from("orders") as any)
        .update(fields)
        .eq("id", id)
        .eq("user_id", user.id)
        .select("*, clients(name, email, phone), products(name)")
        .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let { data, error } = await doUpdate(updates) as { data: any; error: any };

    // If error is about missing columns (migration not applied), retry without optional cols
    if (error && (error.message?.includes("schema cache") || error.message?.includes("Could not find"))) {
      const safeUpdates = { ...updates };
      for (const col of optionalCols) delete safeUpdates[col];
      if (Object.keys(safeUpdates).length > 0) {
        ({ data, error } = await doUpdate(safeUpdates));
      } else {
        console.error(`[PATCH /api/orders/${id}] missing columns — run: node scripts/migrate.mjs`);
        return NextResponse.json({ error: "Colonnes manquantes. Exécutez: node scripts/migrate.mjs" }, { status: 500 });
      }
    }

    if (error) {
      // PGRST116 = 0 rows matched → order not found or not owned by user
      if (error.code === "PGRST116") {
        console.error(`[PATCH /api/orders/${id}] not found or not owned`);
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }
      // Check constraint violation → migration not applied (e.g. status 'paid' not allowed yet)
      if (error.code === "23514" || error.message?.includes("check constraint")) {
        console.error(`[PATCH /api/orders/${id}] check constraint violation — run: node scripts/migrate.mjs`);
        return NextResponse.json(
          { error: "Colonnes manquantes : contrainte invalide. Exécutez: node scripts/migrate.mjs" },
          { status: 409 }
        );
      }
      console.error(`[PATCH /api/orders/${id}]`, error.code, error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[PATCH /api/orders/:id] fatal:", msg);
    return NextResponse.json({ error: `Server: ${msg}` }, { status: 500 });
  }
}
