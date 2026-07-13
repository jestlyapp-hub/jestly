import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDashboardMetrics } from "@/lib/gads/dashboard-metrics";
import { resolveShopifyIntegration, requestedIntegrationId } from "@/lib/shopify/resolve-integration";
import { parseRange } from "../../ads/_helpers";

/**
 * GET /api/ecom/dashboard/metrics — carte de métriques configurables du
 * Dashboard (KPI cards + colonnes Vue journalière). Scopée par la session.
 */
export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;

  const url = new URL(req.url);
  const range = parseRange(url.searchParams.get("range"), url.searchParams.get("from"), url.searchParams.get("to"));

  try {
    const supabase = createAdminClient();
    const resolved = await resolveShopifyIntegration(supabase, auth.user.id, requestedIntegrationId(url));
    const data = await getDashboardMetrics(auth.user.id, range, {
      integrationId: resolved?.integration.id ?? null,
      includeAds: resolved?.isPrimary ?? true,
    });
    return NextResponse.json({ range, ...data, computed_at: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
