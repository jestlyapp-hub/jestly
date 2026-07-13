import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { getCampaignAnalytics } from "@/lib/gads/campaign-analytics";
import { requestedIntegrationId } from "@/lib/shopify/resolve-integration";
import { parseRange } from "../../ads/_helpers";

/**
 * GET /api/ecom/campaigns/compare?ids=a,b,c — sous-ensemble de la liste pour la
 * comparaison côte à côte (2 à 4 campagnes). Réutilise le même calcul que la
 * liste (une seule vérité), puis filtre aux ids demandés.
 */
export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;

  const url = new URL(req.url);
  const range = parseRange(url.searchParams.get("range"), url.searchParams.get("from"), url.searchParams.get("to"));
  const ids = (url.searchParams.get("ids") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  if (ids.length < 2) {
    return NextResponse.json({ error: "Sélectionne au moins 2 campagnes à comparer." }, { status: 400 });
  }

  try {
    const analytics = await getCampaignAnalytics(auth.user.id, range, requestedIntegrationId(url));
    const wanted = new Set(ids.slice(0, 4));
    const rows = analytics.rows.filter((r) => wanted.has(r.campaign_id));
    return NextResponse.json({ range, be_roas: analytics.be_roas, days: analytics.days, rows });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
