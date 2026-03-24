import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

/**
 * POST /api/analytics/track
 * Enregistre un événement produit dans la table product_events.
 * Fire-and-forget côté client — ne doit jamais bloquer l'UI.
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (auth.error) return NextResponse.json({ ok: false }, { status: 401 });

    const { event, properties, page } = await req.json();
    if (!event || typeof event !== "string") {
      return NextResponse.json({ error: "event est requis" }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (auth.supabase.from("product_events") as any).insert({
      user_id: auth.user.id,
      event_name: event.slice(0, 100),
      event_category: "product",
      metadata: { ...(properties || {}), page: page || null },
    });

    return NextResponse.json({ ok: true });
  } catch {
    // Ne jamais échouer — le tracking doit être invisible
    return NextResponse.json({ ok: true });
  }
}
