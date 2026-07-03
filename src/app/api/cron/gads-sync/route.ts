/**
 * GET /api/cron/gads-sync
 * Cron Vercel (toutes les 6 h) : pull de l'API Google Ads (lecture seule)
 * vers gads_daily, fenêtre glissante 30 jours — Google reconsolide ses
 * chiffres, l'écrasement par clé UNIQUE gère la convergence.
 *
 * Auth : header `Authorization: Bearer ${CRON_SECRET}` (même modèle que
 * pinterest-sync). Si les variables GOOGLE_ADS_* ne sont pas configurées,
 * le cron sort proprement en `skipped` (l'import CSV reste la voie normale).
 *
 * Ciblage user : les credentials env sont mono-compte (LHM). Le user cible
 * est GOOGLE_ADS_USER_ID si défini, sinon l'unique intégration Shopify
 * active — s'il y en a plusieurs, on refuse plutôt que d'écrire les données
 * LHM chez le mauvais utilisateur.
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncFromGoogleAdsApi, isGoogleAdsApiConfigured } from "@/lib/gads/api-sync";

export const maxDuration = 60;

async function resolveTargetUserId(): Promise<string | { error: string }> {
  const explicit = process.env.GOOGLE_ADS_USER_ID;
  if (explicit) return explicit;

  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from("integrations") as any)
    .select("user_id")
    .eq("provider", "shopify")
    .eq("status", "active");
  const userIds = [...new Set(((data ?? []) as Array<{ user_id: string }>).map((r) => r.user_id))];

  if (userIds.length === 1) return userIds[0];
  if (userIds.length === 0) return { error: "Aucune intégration Shopify active pour résoudre le user cible" };
  return { error: `${userIds.length} intégrations Shopify actives — définis GOOGLE_ADS_USER_ID pour lever l'ambiguïté` };
}

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isGoogleAdsApiConfigured()) {
    return NextResponse.json({ ok: true, skipped: true, reason: "GOOGLE_ADS_* non configurées" });
  }

  const target = await resolveTargetUserId();
  if (typeof target !== "string") {
    return NextResponse.json({ ok: false, error: target.error }, { status: 409 });
  }

  try {
    const recap = await syncFromGoogleAdsApi(target, 30);
    return NextResponse.json({
      ok: true,
      user_id: target,
      rows_added: recap.rows_added,
      rows_updated: recap.rows_updated,
      range: recap.range,
      missing_dates: recap.missing_dates,
      synced_at: new Date().toISOString(),
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
