import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { getUnattributedGoogleOrders } from "@/lib/gads/campaign-analytics";
import { parseRange } from "../../ads/_helpers";

/**
 * GET /api/ecom/campaigns/unattributed — commandes résolues Google Ads mais
 * rattachées à AUCUNE campagne, pour le panneau « Rattacher des ventes » du
 * détail campagne. Scopée par la session (isolation multi-tenant).
 */
export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;

  const url = new URL(req.url);
  const range = parseRange(url.searchParams.get("range"), url.searchParams.get("from"), url.searchParams.get("to"));

  try {
    const orders = await getUnattributedGoogleOrders(auth.user.id, range);
    return NextResponse.json({ range, orders, count: orders.length });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
