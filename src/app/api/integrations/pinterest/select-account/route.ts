/**
 * POST /api/integrations/pinterest/select-account
 * Body : { ad_account_id, ad_account_name? }
 *
 * Finalise la connexion Pinterest :
 *  - met external_account_id sur la ligne integrations
 *  - déclenche runFullSync (90j) en background fire-and-forget
 *
 * Le frontend poll ensuite /api/integrations/pinterest/status pour suivre la progression.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { runFullSync } from "@/lib/pinterest/sync";
import { z } from "zod";

const Body = z.object({
  ad_account_id: z.string().min(1),
  ad_account_name: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Body invalide" }, { status: 400 });
  }
  const { ad_account_id, ad_account_name } = parsed.data;

  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: integration } = await (supabase.from("integrations") as any)
    .select("id")
    .eq("user_id", auth.user.id)
    .eq("provider", "pinterest")
    .maybeSingle();

  if (!integration) {
    return NextResponse.json({ error: "Aucune intégration Pinterest" }, { status: 404 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateErr } = await (supabase.from("integrations") as any)
    .update({
      external_account_id: ad_account_id,
      external_account_name: ad_account_name ?? null,
      status: "active",
    })
    .eq("id", integration.id);
  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  // Sync initial en background (90j) — fire-and-forget
  runFullSync({ id: integration.id }, ad_account_id)
    .catch((e) => {
      console.error("[pinterest/select-account] initial sync failed:", e);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from("integrations") as any)
        .update({ status: "error", last_error: (e as Error).message })
        .eq("id", integration.id)
        .then(() => undefined);
    });

  return NextResponse.json({ ok: true, integration_id: integration.id, ad_account_id });
}
