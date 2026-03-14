import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/events — Ingestion événements produit (authentifié, fire-and-forget)
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Ignore silencieusement si non authentifié (ne pas casser la page)
    if (!user) return NextResponse.json({ ok: true });

    const body = await req.json();
    const { event_name, event_category, metadata } = body;

    // Validation minimale
    if (!event_name || typeof event_name !== "string") {
      return NextResponse.json({ ok: true }); // Silent fail
    }

    const validCategories = [
      "auth", "onboarding", "site", "order", "client",
      "product", "project", "billing", "search", "settings",
    ];
    const category = validCategories.includes(event_category) ? event_category : "auth";

    // Insert via le client supabase de l'user (RLS: l'user peut insérer ses propres events)
    await (supabase.from("product_events") as any).insert({
      user_id: user.id,
      event_name: event_name.slice(0, 100),
      event_category: category,
      metadata: metadata || {},
    });

    return NextResponse.json({ ok: true });
  } catch {
    // Ne jamais échouer — le tracking doit être invisible
    return NextResponse.json({ ok: true });
  }
}
