import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { getGadsAttribution } from "@/lib/gads/aggregator";
import { parseRange } from "../../ads/_helpers";

/**
 * GET /api/ecom/gads/attribution — Vue 3 : qualité de la donnée.
 * Répartition tracked / ghost / unmatched / inconnu, zone d'ombre du CA,
 * ROAS déclaré Google vs ROAS croisé Shopify vs ROAS avec overrides.
 */
export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;

  const url = new URL(req.url);
  const range = parseRange(url.searchParams.get("range"), url.searchParams.get("from"), url.searchParams.get("to"));

  try {
    const attribution = await getGadsAttribution(auth.user.id, range);
    return NextResponse.json({ ...attribution, computed_at: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
