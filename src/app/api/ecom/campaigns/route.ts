import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { getCampaignAnalytics, computeCampaignInsights } from "@/lib/gads/campaign-analytics";
import { requestedIntegrationId } from "@/lib/shopify/resolve-integration";
import { parseRange } from "../ads/_helpers";

/**
 * GET /api/ecom/campaigns — liste des campagnes Google Ads (actives, en pause,
 * terminées) avec métriques Google + ROAS Jestly croisé (résolution unifiée),
 * totaux blended, couverture d'attribution et insights automatiques (règles).
 */
export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;

  const url = new URL(req.url);
  const range = parseRange(url.searchParams.get("range"), url.searchParams.get("from"), url.searchParams.get("to"));

  try {
    const analytics = await getCampaignAnalytics(auth.user.id, range, requestedIntegrationId(url));
    const insights = computeCampaignInsights(analytics);
    return NextResponse.json({ range, ...analytics, insights, computed_at: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
