import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { getProductAnalytics, type ChannelFilter } from "@/lib/gads/product-analytics";
import { parseRange } from "../../ads/_helpers";

const VALID_FILTERS = new Set(["all", "google_ads", "seo", "pinterest", "other"]);

/**
 * GET /api/ecom/gads/products — Product Analytics complet :
 * ventes/CA/COGS/marge + dépense Ads par produit (gads_product_daily mappée),
 * double ROAS produit (déclaré vs croisé), budget consommé sans conversion.
 */
export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;

  const url = new URL(req.url);
  const range = parseRange(url.searchParams.get("range"), url.searchParams.get("from"), url.searchParams.get("to"));
  const channelParam = url.searchParams.get("channel") ?? "all";
  const channel = (VALID_FILTERS.has(channelParam) ? channelParam : "all") as ChannelFilter;

  try {
    const analytics = await getProductAnalytics(auth.user.id, range, channel);
    return NextResponse.json({ range, channel, ...analytics, computed_at: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
