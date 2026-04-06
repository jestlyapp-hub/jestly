import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { enrichOrdersWithProducts } from "@/lib/supabase-helpers";
import { fixOrderFileUrls } from "@/lib/storage-utils";

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

    // Normaliser les file_url (signed URLs expirées → public URLs)
    if (Array.isArray(data.order_files)) {
      data.order_files = fixOrderFileUrls(data.order_files);
    }

    const [enriched] = await enrichOrdersWithProducts(supabase, [data], user.id);
    return NextResponse.json(enriched);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[GET /api/orders/:id] fatal:", msg);
    return NextResponse.json({ error: `Server: ${msg}` }, { status: 500 });
  }
}

// DELETE /api/orders/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = await getAuthUser();
    if (auth.error) return auth.error;
    const { user, supabase } = auth;

    // Vérifier que la commande existe et appartient à l'utilisateur
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: order, error: findErr } = await (supabase.from("orders") as any)
      .select("id, title")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (findErr) {
      console.error(`[DELETE /api/orders/${id}] find:`, findErr.message);
      return NextResponse.json({ error: findErr.message }, { status: 500 });
    }
    if (!order) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }

    // Détacher les FK bloquantes (invoices, tasks) — ON DELETE RESTRICT implicite
    // On SET NULL avant de supprimer pour éviter les erreurs de contrainte
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("invoices") as any)
      .update({ order_id: null })
      .eq("order_id", id);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("tasks") as any)
      .update({ order_id: null })
      .eq("order_id", id);

    // Supprimer la commande
    // Les FK CASCADE suppriment automatiquement : order_items, order_submissions, order_brief_responses, order_files
    // Les FK SET NULL détachent automatiquement : billing_items, projects, events
    // Le trigger fn_orders_on_delete nettoie : search_documents
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: delErr } = await (supabase.from("orders") as any)
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (delErr) {
      console.error(`[DELETE /api/orders/${id}]`, delErr.code, delErr.message);
      if (delErr.code === "23503") {
        return NextResponse.json(
          { error: "Impossible de supprimer : des données liées empêchent la suppression. Détachez-les d'abord." },
          { status: 409 },
        );
      }
      return NextResponse.json({ error: delErr.message }, { status: 500 });
    }

    console.log(`[DELETE /api/orders/${id}] ✓ Commande "${order.title}" supprimée`);
    return NextResponse.json({ success: true, id, title: order.title });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[DELETE /api/orders/:id] fatal:", msg);
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

    // 🔔 Notifications — commande livrée + suggestion facturation (fire-and-forget)
    if (body.status === "delivered") {
      import("@/lib/notifications/triggers").then(({ triggerOrderDelivered, triggerInvoiceSuggestion }) => {
        const p = {
          userId: user.id,
          orderId: id,
          orderTitle: data.title ?? "Commande",
          clientName: data.clients?.name,
        };
        triggerOrderDelivered(p).catch(() => {});
        triggerInvoiceSuggestion(p).catch(() => {});
      });
    }

    const [enriched] = await enrichOrdersWithProducts(supabase, [data], user.id);
    return NextResponse.json(enriched);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[PATCH /api/orders/:id] fatal:", msg);
    return NextResponse.json({ error: `Server: ${msg}` }, { status: 500 });
  }
}
