import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/events — Ingestion événements produit (authentifié, fire-and-forget)
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Non authentifié : réponse explicite (pas de faux succès)
    if (!user) return NextResponse.json({ ok: false, tracked: false, reason: "unauthenticated" }, { status: 401 });

    const body = await req.json();
    const { event_name, event_category, metadata } = body;

    // Validation minimale
    if (!event_name || typeof event_name !== "string") {
      return NextResponse.json({ ok: false, tracked: false, reason: "invalid_event_name" }, { status: 400 });
    }

    const validCategories = [
      "auth", "onboarding", "site", "order", "client",
      "product", "project", "billing", "search", "settings",
    ];
    const category = validCategories.includes(event_category) ? event_category : "auth";

    // Insert via le client supabase de l'user (RLS: l'user peut insérer ses propres events)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("product_events") as any).insert({
      user_id: user.id,
      event_name: event_name.slice(0, 100),
      event_category: category,
      metadata: metadata || {},
    });

    if (error) {
      console.error("[/api/events] insert error:", error.message);
      return NextResponse.json({ ok: false, tracked: false, reason: "db_error" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, tracked: true });
  } catch (err) {
    console.error("[/api/events] unexpected error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ ok: false, tracked: false, reason: "unexpected_error" }, { status: 500 });
  }
}
