/**
 * GET /api/cron/pinterest-sync
 * Cron Vercel : delta sync de toutes les intégrations Pinterest actives qui
 * ont un external_account_id sélectionné.
 *
 * Auth : header `Authorization: Bearer ${CRON_SECRET}`.
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { runDeltaSync } from "@/lib/pinterest/sync";

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rows } = await (supabase.from("integrations") as any)
    .select("id, external_account_id, last_sync_at")
    .eq("provider", "pinterest")
    .eq("status", "active")
    .not("external_account_id", "is", null);

  const results: { integration_id: string; ok: boolean; error?: string }[] = [];
  for (const r of (rows ?? []) as Array<{ id: string; external_account_id: string; last_sync_at: string | null }>) {
    try {
      await runDeltaSync({ id: r.id, external_account_id: r.external_account_id, last_sync_at: r.last_sync_at });
      results.push({ integration_id: r.id, ok: true });
    } catch (err) {
      results.push({ integration_id: r.id, ok: false, error: (err as Error).message });
    }
  }

  return NextResponse.json({ ok: true, results, synced_at: new Date().toISOString() });
}
