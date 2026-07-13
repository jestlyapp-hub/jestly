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
 * Multi-comptes : les credentials OAuth env sont partagés (même MCC). Le cron
 * itère sur CHAQUE compte Google Ads connecté (gads_accounts, un par boutique)
 * et pull sa dépense/campagnes avec son propre customer_id, scopée à sa boutique.
 * Fini le « user cible unique » : chaque boutique reçoit ses propres données.
 */
import { NextRequest, NextResponse } from "next/server";
import { syncAllGadsAccounts, isGoogleAdsApiConfigured } from "@/lib/gads/api-sync";

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isGoogleAdsApiConfigured()) {
    return NextResponse.json({ ok: true, skipped: true, reason: "GOOGLE_ADS_* non configurées" });
  }

  try {
    const results = await syncAllGadsAccounts(30);
    return NextResponse.json({
      ok: true,
      accounts: results.length,
      results: results.map((r) => ({
        integration_id: r.integration_id,
        customer_id: r.customer_id,
        ok: r.ok,
        rows_added: r.recap?.rows_added ?? null,
        rows_updated: r.recap?.rows_updated ?? null,
        campaigns: r.recap?.campaigns ?? null,
        error: r.error ?? null,
      })),
      synced_at: new Date().toISOString(),
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
