/**
 * POST /api/integrations/pinterest/disconnect
 * Révoque les tokens et passe l'intégration en disconnected.
 * Optionnellement : wipe_cache=true → delete CASCADE de l'intégration.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { oauthManager } from "@/lib/oauth/manager";

export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;

  const body = await req.json().catch(() => ({}));
  const wipeCache = body?.wipe_cache === true;

  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: integration } = await (supabase.from("integrations") as any)
    .select("id")
    .eq("user_id", auth.user.id)
    .eq("provider", "pinterest")
    .maybeSingle();
  if (!integration) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  if (wipeCache) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("integrations") as any).delete().eq("id", integration.id);
  } else {
    await oauthManager.revoke(integration.id);
  }

  return NextResponse.json({ ok: true });
}
