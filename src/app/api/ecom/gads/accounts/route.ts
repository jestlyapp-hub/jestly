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

type ValidationOk = { descriptiveName: string | null; currency: string | null; effectiveLoginCustomerId: string | null };
type ValidationErr = { error: string };

/**
 * Valide un compte Google Ads par une requête reporting triviale, en résolvant
 * le bon chemin d'accès. Ordre des tentatives :
 *  1. le login demandé (ou le MCC par défaut) — cas d'un sous-compte du MCC ;
 *  2. sur refus de PERMISSION (403 : le compte n'est pas sous ce MCC), repli en
 *     ACCÈS DIRECT (login-customer-id = le compte), valable si l'OAuth y a un
 *     accès direct (compte hors MCC mais partagé au même utilisateur Google).
 * Renvoie le login_customer_id EFFECTIF (null = MCC par défaut, sinon la valeur
 * qui a fonctionné) pour que la sync emprunte exactement le même chemin.
 */
async function validateGadsAccount(
  base: NonNullable<ReturnType<typeof getGoogleAdsBaseConfig>>,
  customerId: string,
  requestedLogin: string | null,
): Promise<ValidationOk | ValidationErr> {
  const candidates: (string | null)[] = [requestedLogin];
  const firstEffective = requestedLogin ?? base.loginCustomerId;
  if (firstEffective !== customerId) candidates.push(customerId); // repli accès direct
  let lastErr: unknown = null;
  for (const login of candidates) {
    try {
      const cfg = buildAccountConfig(base, { customer_id: customerId, login_customer_id: login });
      const rows = await searchGaql<{ customer?: { descriptiveName?: string; currencyCode?: string } }>(
        cfg,
        "SELECT customer.descriptive_name, customer.currency_code FROM customer LIMIT 1",
      );
      return {
        descriptiveName: rows[0]?.customer?.descriptiveName ?? null,
        currency: rows[0]?.customer?.currencyCode ?? null,
        effectiveLoginCustomerId: login,
      };
    } catch (e) {
      lastErr = e;
      // On ne tente le repli en accès direct que sur un refus de permission.
      if (!(e instanceof GoogleAdsApiError) || e.status !== 403) break;
    }
  }
  const msg = lastErr instanceof GoogleAdsApiError
    ? `Google Ads a refusé ce compte (${lastErr.status ?? "?"}) : vérifie que ${customerId} est accessible par ton compte Google — soit comme sous-compte de ton MCC, soit en accès direct. ${lastErr.message.slice(0, 160)}`
    : (lastErr as Error)?.message ?? "Validation du compte échouée.";
  return { error: msg };
}

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

  // Valide le compte. On tente d'abord via le MCC (ou le login demandé) ; si
  // Google refuse pour permission (403 : le compte n'est PAS sous ce MCC) alors
  // que l'OAuth y a un accès DIRECT, on réessaie en accès direct
  // (login-customer-id = le compte lui-même). Le login_customer_id EFFECTIF —
  // celui qui a fonctionné — est stocké et réutilisé tel quel par la sync.
  const validation = await validateGadsAccount(base, customer_id, login_customer_id ?? null);
  if ("error" in validation) {
    return NextResponse.json({ error: validation.error }, { status: 422 });
  }
  const { descriptiveName, currency, effectiveLoginCustomerId } = validation;

  // Upsert du compte (une boutique = un compte).
  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("gads_accounts") as any)
    .upsert(
      {
        user_id: auth.user.id,
        integration_id,
        customer_id,
        login_customer_id: effectiveLoginCustomerId,
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
        login_customer_id: effectiveLoginCustomerId, currency, is_active: true,
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
