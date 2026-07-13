import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { getCampaignDetail } from "@/lib/gads/campaign-detail";
import { requestedIntegrationId } from "@/lib/shopify/resolve-integration";
import { parseRange } from "../../ads/_helpers";

/**
 * GET /api/ecom/campaigns/[id] — détail d'une campagne : KPIs période, série
 * dépense/CA/ROAS glissant, historique de budget archivé (gads_budget_history),
 * et produits (diffusés vs sans diffusion) avec vrais noms Shopify + insights
 * produit (candidats à exclure / à réactiver).
 */
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;

  const { id } = await ctx.params;
  const url = new URL(req.url);
  const range = parseRange(url.searchParams.get("range"), url.searchParams.get("from"), url.searchParams.get("to"));

  try {
    const detail = await getCampaignDetail(auth.user.id, id, range, requestedIntegrationId(url));
    if (!detail) {
      return NextResponse.json({ error: "Campagne introuvable" }, { status: 404 });
    }
    return NextResponse.json({ range, ...detail, computed_at: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
