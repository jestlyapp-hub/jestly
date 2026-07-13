import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { getGadsOverview } from "@/lib/gads/aggregator";
import { requestedIntegrationId } from "@/lib/shopify/resolve-integration";
import { parseRange } from "../../ads/_helpers";

/**
 * GET /api/ecom/gads/overview — Vue 1 : Pilotage.
 * KPIs de période (dépense CSV, CA Shopify, ROAS SUM/SUM, traçabilité)
 * + alerte dates manquantes.
 */
export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;

  const url = new URL(req.url);
  const range = parseRange(url.searchParams.get("range"), url.searchParams.get("from"), url.searchParams.get("to"));

  try {
    const overview = await getGadsOverview(auth.user.id, range, requestedIntegrationId(url));
    return NextResponse.json({ ...overview, computed_at: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
