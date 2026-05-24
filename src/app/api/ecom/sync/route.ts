/**
 * POST /api/ecom/sync — déclenche un delta sync manuel pour l'user actuel.
 * GET  /api/ecom/sync — déclenche un delta sync pour TOUTES les intégrations actives (Vercel Cron).
 *
 * Cron Vercel : configuré dans vercel.json — appelle GET avec header `Authorization: Bearer ${CRON_SECRET}`.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getActiveShopifyIntegration, decryptIntegration } from "@/lib/shopify/integration";
import { deltaSync } from "@/lib/shopify/sync";
import type { IntegrationRow } from "@/lib/shopify/types";

export const maxDuration = 60;

// ── Manuel (user-triggered) ──────────────────────────────────────
export async function POST() {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;

  const integration = await getActiveShopifyIntegration(auth.user.id);
  if (!integration) {
    return NextResponse.json({ error: "Aucune intégration Shopify active" }, { status: 404 });
  }

  try {
    await deltaSync(integration);
    return NextResponse.json({ ok: true, synced_at: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// ── Cron (toutes les 5 min via Vercel Cron) ──────────────────────
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rows } = await (supabase.from("integrations") as any)
    .select("*")
    .eq("provider", "shopify")
    .eq("status", "active");

  const results: { integration_id: string; ok: boolean; error?: string }[] = [];
  for (const row of (rows ?? []) as IntegrationRow[]) {
    try {
      const integration = decryptIntegration(row);
      await deltaSync(integration);
      results.push({ integration_id: row.id, ok: true });
    } catch (err) {
      results.push({ integration_id: row.id, ok: false, error: (err as Error).message });
    }
  }

  return NextResponse.json({ ok: true, results });
}
