import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { syncFromGoogleAdsApi, isGoogleAdsApiConfigured } from "@/lib/gads/api-sync";
import { GoogleAdsApiError } from "@/lib/gads/google-ads-client";

export const maxDuration = 60;

/**
 * POST /api/ecom/gads/sync-api — pull manuel de l'API Google Ads (lecture
 * seule, GAQL) vers gads_daily. Fenêtre glissante 30 jours, la source fait foi.
 * Body optionnel : { days?: number } (1-90).
 */
export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;

  if (!isGoogleAdsApiConfigured()) {
    return NextResponse.json(
      { error: "API Google Ads non configurée (variables GOOGLE_ADS_* manquantes). Utilise l'import CSV en attendant." },
      { status: 503 },
    );
  }

  const body = await req.json().catch(() => ({})) as { days?: number };
  const days = typeof body.days === "number" ? body.days : 30;

  try {
    const recap = await syncFromGoogleAdsApi(auth.user.id, days);
    return NextResponse.json({ ok: true, source: "google_ads_api", recap });
  } catch (e) {
    const status = e instanceof GoogleAdsApiError && e.status === 401 ? 502 : 500;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }
}
