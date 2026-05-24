/**
 * GET /api/integrations/pinterest/ad-accounts
 * Liste les ad accounts Pinterest de l'user via cache + refresh live si vide.
 * Utilisé par SelectAdAccountModal après OAuth.
 */
import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncAdAccounts } from "@/lib/pinterest/sync";
import { listAdAccounts } from "@/lib/pinterest/queries";
import { PinterestApiError } from "@/lib/pinterest/client";

export async function GET() {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;

  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: integration } = await (supabase.from("integrations") as any)
    .select("id, status, external_account_id")
    .eq("user_id", auth.user.id)
    .eq("provider", "pinterest")
    .maybeSingle();

  if (!integration) {
    return NextResponse.json({ error: "Aucune intégration Pinterest" }, { status: 404 });
  }

  // Refresh live (les ad accounts changent rarement, mais on rafraîchit pour être propre)
  try {
    await syncAdAccounts({ id: integration.id });
  } catch (err) {
    if (err instanceof PinterestApiError && (err.status === 401 || err.status === 403)) {
      return NextResponse.json(
        { error: "Pinterest API non accessible (Trial pending ou token révoqué)", code: err.status },
        { status: err.status },
      );
    }
    // En cas d'erreur, on lit le cache au lieu de bloquer.
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: accounts } = await (supabase.from("pinterest_ad_accounts") as any)
    .select("pinterest_ad_account_id, name, country, currency")
    .eq("integration_id", integration.id)
    .order("name");

  // Fallback : si le cache est encore vide après sync (très rare), on tente live direct
  if (!accounts || accounts.length === 0) {
    try {
      const live = await listAdAccounts({ id: integration.id });
      return NextResponse.json({
        accounts: live.map((a) => ({
          pinterest_ad_account_id: String(a.id),
          name: String(a.name ?? "Ad account"),
          country: a.country ?? null,
          currency: a.currency ?? null,
        })),
        selected_ad_account_id: integration.external_account_id ?? null,
      });
    } catch {
      return NextResponse.json({ accounts: [], selected_ad_account_id: integration.external_account_id ?? null });
    }
  }

  return NextResponse.json({
    accounts,
    selected_ad_account_id: integration.external_account_id ?? null,
  });
}
