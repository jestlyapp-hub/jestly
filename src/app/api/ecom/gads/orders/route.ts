import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { getOrdersAttribution } from "@/lib/gads/attribution-aggregator";
import { requestedIntegrationId } from "@/lib/shopify/resolve-integration";
import { parseRange } from "../../ads/_helpers";

/**
 * GET /api/ecom/gads/orders — commandes de la période avec leur traçabilité
 * réelle, leur canal mesuré, leur attribution manuelle éventuelle, et les
 * stats par canal (double ROAS mesuré vs avec manuelles).
 */
export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;

  const url = new URL(req.url);
  const range = parseRange(url.searchParams.get("range"), url.searchParams.get("from"), url.searchParams.get("to"));

  try {
    const result = await getOrdersAttribution(auth.user.id, range, requestedIntegrationId(url));
    return NextResponse.json({ range, ...result, computed_at: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
