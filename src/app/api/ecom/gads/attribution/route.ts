import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { getAttributionBoard } from "@/lib/gads/attribution-board";
import { requestedIntegrationId } from "@/lib/shopify/resolve-integration";
import { parseRange } from "../../ads/_helpers";

/**
 * GET /api/ecom/gads/attribution — Attribution Board.
 * Hiérarchie stricte par commande (pixel → natif → manuel → survey → ghost),
 * résolutions first-click ET last-click (le toggle est côté client),
 * triple ROAS Google, bloc survey.
 */
export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;

  const url = new URL(req.url);
  const range = parseRange(url.searchParams.get("range"), url.searchParams.get("from"), url.searchParams.get("to"));

  try {
    const board = await getAttributionBoard(auth.user.id, range, requestedIntegrationId(url));
    return NextResponse.json({ range, ...board, computed_at: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
