import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { getGadsTimeline } from "@/lib/gads/aggregator";
import { parseRange } from "../../ads/_helpers";

/**
 * GET /api/ecom/gads/timeline — Vue 2 : Détail temporel jour par jour.
 * day_roas est INDICATIF (jamais décisionnel) ; rolling_roas = lissé 7 jours ;
 * is_gap marque les trous de données Ads.
 */
export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;

  const url = new URL(req.url);
  const range = parseRange(url.searchParams.get("range"), url.searchParams.get("from"), url.searchParams.get("to"));

  try {
    const points = await getGadsTimeline(auth.user.id, range);
    return NextResponse.json({ range, points, computed_at: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
