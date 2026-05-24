/**
 * POST /api/integrations/pinterest/sync — déclenche un delta sync manuel.
 */
import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { runDeltaSync } from "@/lib/pinterest/sync";

export const maxDuration = 60;

export async function POST() {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;

  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: integration } = await (supabase.from("integrations") as any)
    .select("id, external_account_id, last_sync_at")
    .eq("user_id", auth.user.id)
    .eq("provider", "pinterest")
    .eq("status", "active")
    .maybeSingle();

  if (!integration) {
    return NextResponse.json({ error: "Aucune intégration Pinterest active" }, { status: 404 });
  }
  if (!integration.external_account_id) {
    return NextResponse.json({ error: "Ad account non sélectionné" }, { status: 400 });
  }

  try {
    const result = await runDeltaSync({
      id: integration.id,
      external_account_id: integration.external_account_id,
      last_sync_at: integration.last_sync_at,
    });
    return NextResponse.json({ ok: true, ...result, synced_at: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
