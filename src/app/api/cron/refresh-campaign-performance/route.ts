/**
 * GET /api/cron/refresh-campaign-performance
 * Cron Vercel : recompute campaign_performance_daily des 7 derniers jours
 * pour tous les users ayant au moins une intégration Ads active.
 *
 * Auth via Bearer CRON_SECRET.
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { refreshUserCampaignPerformance } from "@/lib/ads/roas-engine";

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || req.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rows } = await (supabase.from("integrations") as any)
    .select("user_id")
    .in("provider", ["pinterest", "google_ads", "meta_ads", "tiktok_ads"])
    .eq("status", "active");
  const userIds = [...new Set(((rows ?? []) as Array<{ user_id: string }>).map((r) => r.user_id))];

  const results: { user_id: string; ok: boolean; rows_upserted?: number; alerts?: number; error?: string }[] = [];
  for (const userId of userIds) {
    try {
      const r = await refreshUserCampaignPerformance({ userId, daysBack: 7 });
      results.push({ user_id: userId, ok: true, rows_upserted: r.rows_upserted, alerts: r.alerts_generated });
    } catch (err) {
      results.push({ user_id: userId, ok: false, error: (err as Error).message });
    }
  }
  return NextResponse.json({ ok: true, users_processed: userIds.length, results });
}
