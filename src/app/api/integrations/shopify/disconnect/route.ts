/**
 * POST /api/integrations/shopify/disconnect
 * Body : { integration_id }
 * Marque l'intégration comme 'disconnected' et supprime le cache.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const Body = z.object({
  integration_id: z.string().uuid(),
  wipe_cache: z.boolean().optional().default(true),
});

export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Body invalide" }, { status: 400 });

  const { integration_id, wipe_cache } = parsed.data;
  const supabase = createAdminClient();

  // Vérifier ownership
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: integration } = await (supabase.from("integrations") as any)
    .select("id, user_id")
    .eq("id", integration_id)
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (!integration) return NextResponse.json({ error: "Intégration introuvable" }, { status: 404 });

  if (wipe_cache) {
    // ON DELETE CASCADE supprime sessions, orders, products, customers, analytics, webhook_events, sync_state
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("integrations") as any).delete().eq("id", integration_id);
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("integrations") as any)
      .update({ status: "disconnected" })
      .eq("id", integration_id);
  }

  return NextResponse.json({ ok: true });
}
