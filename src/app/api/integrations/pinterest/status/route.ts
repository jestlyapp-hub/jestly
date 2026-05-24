/**
 * GET /api/integrations/pinterest/status
 * État de l'intégration Pinterest pour le frontend (poll pendant initial sync).
 */
import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;

  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: integration } = await (supabase.from("integrations") as any)
    .select("id, status, external_account_id, external_account_name, last_sync_at, last_error, metadata")
    .eq("user_id", auth.user.id)
    .eq("provider", "pinterest")
    .maybeSingle();

  if (!integration) {
    return NextResponse.json({ connected: false });
  }

  // Compte les items en cache pour afficher la progression
  const [campaignsRes, adGroupsRes, adsRes, metricsRes, accountsRes] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("pinterest_campaigns") as any).select("id", { count: "exact", head: true }).eq("integration_id", integration.id),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("pinterest_ad_groups") as any).select("id", { count: "exact", head: true }).eq("integration_id", integration.id),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("pinterest_ads") as any).select("id", { count: "exact", head: true }).eq("integration_id", integration.id),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("pinterest_metrics_daily") as any).select("id", { count: "exact", head: true }).eq("integration_id", integration.id),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("pinterest_ad_accounts") as any).select("id", { count: "exact", head: true }).eq("integration_id", integration.id),
  ]);

  return NextResponse.json({
    connected: true,
    integration: {
      id: integration.id,
      status: integration.status,
      external_account_id: integration.external_account_id,
      external_account_name: integration.external_account_name,
      last_sync_at: integration.last_sync_at,
      last_error: integration.last_error,
    },
    counts: {
      ad_accounts: accountsRes.count ?? 0,
      campaigns: campaignsRes.count ?? 0,
      ad_groups: adGroupsRes.count ?? 0,
      ads: adsRes.count ?? 0,
      metrics_rows: metricsRes.count ?? 0,
    },
    requires_ad_account_selection: integration.status === "active" && !integration.external_account_id,
  });
}
