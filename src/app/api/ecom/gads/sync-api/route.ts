import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { syncGadsAccount, isGoogleAdsApiConfigured } from "@/lib/gads/api-sync";
import { GoogleAdsApiError, isGoogleAdsOwner } from "@/lib/gads/google-ads-client";
import { listGadsAccountsForUser, getGadsAccountForIntegration } from "@/lib/gads/accounts";
import type { GadsImportRecap } from "@/lib/gads/importer";

export const maxDuration = 60;

/**
 * POST /api/ecom/gads/sync-api — pull manuel de l'API Google Ads (lecture
 * seule, GAQL) vers gads_daily. Fenêtre glissante 30 jours, la source fait foi.
 * Body optionnel : { days?: number } (1-90).
 *
 * GARDE-FOU MULTI-TENANT : les credentials Google Ads sont globaux (mono-compte).
 * Seul le propriétaire désigné (GOOGLE_ADS_USER_ID) peut déclencher ce pull —
 * sinon un autre utilisateur ingérerait les données Google Ads du propriétaire
 * dans SON propre compte (fuite d'isolation confirmée en prod).
 */
export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;

  if (!isGoogleAdsOwner(auth.user.id)) {
    return NextResponse.json(
      { error: "La synchronisation depuis l'API Google Ads est réservée au compte propriétaire de la connexion Google Ads. Importe un fichier CSV pour tes propres données." },
      { status: 403 },
    );
  }

  if (!isGoogleAdsApiConfigured()) {
    return NextResponse.json(
      { error: "API Google Ads non configurée (variables GOOGLE_ADS_* manquantes). Utilise l'import CSV en attendant." },
      { status: 503 },
    );
  }

  const body = await req.json().catch(() => ({})) as { days?: number; integration_id?: string };
  const days = typeof body.days === "number" ? body.days : 30;

  try {
    // Boutique ciblée si fournie ; sinon TOUS les comptes du propriétaire.
    const accounts = body.integration_id
      ? [await getGadsAccountForIntegration(auth.user.id, body.integration_id)].filter((a) => a != null)
      : await listGadsAccountsForUser(auth.user.id);

    if (accounts.length === 0) {
      return NextResponse.json(
        { error: "Aucun compte Google Ads connecté pour cette boutique. Connecte-le dans Réglages → Intégrations." },
        { status: 404 },
      );
    }

    const recaps: Array<{ integration_id: string; customer_id: string; recap: GadsImportRecap }> = [];
    for (const account of accounts) {
      const recap = await syncGadsAccount(account!, days);
      recaps.push({ integration_id: account!.integration_id, customer_id: account!.customer_id, recap });
    }
    // Rétro-compat : `recap` = premier compte ; `recaps` = détail par compte.
    return NextResponse.json({ ok: true, source: "google_ads_api", recap: recaps[0]?.recap, recaps });
  } catch (e) {
    const status = e instanceof GoogleAdsApiError && e.status === 401 ? 502 : 500;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }
}
