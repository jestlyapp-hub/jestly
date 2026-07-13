/**
 * Comptes Google Ads par boutique (gads_accounts).
 *
 * GET  — liste les comptes Google Ads du user (un par boutique).
 * POST — connecte un compte Google Ads à une boutique (customer_id).
 * DELETE ?integration_id= — déconnecte le compte d'une boutique.
 *
 * GARDE-FOU : réservé au PROPRIÉTAIRE du MCC (isGoogleAdsOwner). Les credentials
 * OAuth (refresh token du MCC) sont partagés au niveau serveur ; seul lui peut
 * rattacher des sous-comptes de SON manager. Un autre tenant ne peut pas aspirer
 * les données Ads via ce refresh token.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";
import {
  getGoogleAdsBaseConfig, buildAccountConfig, searchGaql,
  isGoogleAdsOwner, GoogleAdsApiError,
} from "@/lib/gads/google-ads-client";
import { listGadsAccountsForUser } from "@/lib/gads/accounts";
import { resolveShopifyIntegration } from "@/lib/shopify/resolve-integration";

const Body = z.object({
  integration_id: z.string().uuid(),
  customer_id: z.string().transform((s) => s.replace(/-/g, "")).pipe(z.string().regex(/^\d{10}$/, "customer_id = 10 chiffres")),
  login_customer_id: z.string().transform((s) => s.replace(/-/g, "")).pipe(z.string().regex(/^\d{10}$/)).nullish(),
});

export async function GET() {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const accounts = await listGadsAccountsForUser(auth.user.id);
  return NextResponse.json({ accounts, is_owner: isGoogleAdsOwner(auth.user.id) });
}

export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;

  if (!isGoogleAdsOwner(auth.user.id)) {
    return NextResponse.json(
      { error: "La connexion Google Ads est réservée au compte propriétaire du compte manager (MCC)." },
      { status: 403 },
    );
  }

  const base = getGoogleAdsBaseConfig();
  if (!base) {
    return NextResponse.json(
      { error: "Credentials Google Ads non configurés (variables GOOGLE_ADS_* manquantes)." },
      { status: 503 },
    );
  }

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Body invalide" }, { status: 400 });
  }
  const { integration_id, customer_id, login_customer_id } = parsed.data;

  // La boutique doit appartenir au user.
  const resolved = await resolveShopifyIntegration(auth.supabase, auth.user.id, integration_id);
  if (!resolved || resolved.integration.id !== integration_id) {
    return NextResponse.json({ error: "Boutique introuvable." }, { status: 404 });
  }

  // Valide le customer_id : une requête reporting triviale doit passer sous le MCC.
  const cfg = buildAccountConfig(base, { customer_id, login_customer_id });
  let descriptiveName: string | null = null;
  let currency: string | null = null;
  try {
    const rows = await searchGaql<{ customer?: { descriptiveName?: string; currencyCode?: string } }>(
      cfg,
      "SELECT customer.descriptive_name, customer.currency_code FROM customer LIMIT 1",
    );
    descriptiveName = rows[0]?.customer?.descriptiveName ?? null;
    currency = rows[0]?.customer?.currencyCode ?? null;
  } catch (e) {
    const msg = e instanceof GoogleAdsApiError
      ? `Google Ads a refusé ce compte (${e.status ?? "?"}) : vérifie que ${customer_id} est bien un sous-compte de ton MCC. ${e.message.slice(0, 160)}`
      : (e as Error).message;
    return NextResponse.json({ error: msg }, { status: 422 });
  }

  // Upsert du compte (une boutique = un compte).
  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("gads_accounts") as any)
    .upsert(
      {
        user_id: auth.user.id,
        integration_id,
        customer_id,
        login_customer_id: login_customer_id ?? null,
        currency,
        is_active: true,
      },
      { onConflict: "user_id,integration_id" },
    )
    .select("id, integration_id, customer_id, login_customer_id, currency, is_active")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Sync initiale fire-and-forget (la dépense apparaît sans attendre le cron).
  (async () => {
    try {
      const { syncGadsAccount } = await import("@/lib/gads/api-sync");
      await syncGadsAccount({
        id: data.id, user_id: auth.user.id, integration_id, customer_id,
        login_customer_id: login_customer_id ?? null, currency, is_active: true,
      }, 30);
    } catch (e) {
      console.error("[gads/accounts] sync initiale échouée:", (e as Error).message);
    }
  })();

  return NextResponse.json({ ok: true, account: data, shop_name: descriptiveName });
}

export async function DELETE(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const integrationId = new URL(req.url).searchParams.get("integration_id");
  if (!integrationId) return NextResponse.json({ error: "integration_id requis" }, { status: 400 });

  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("gads_accounts") as any)
    .delete()
    .eq("user_id", auth.user.id)
    .eq("integration_id", integrationId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
