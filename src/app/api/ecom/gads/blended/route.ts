import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { getBlendedBoard } from "@/lib/costs/blended";
import { parseRange } from "../../ads/_helpers";

/**
 * GET /api/ecom/gads/blended — Blended Stats Board (Vue d'ensemble).
 * MER, NC-ROAS, NCPA, AOV, BE-ROAS, Net Profit + période précédente,
 * timeline Revenue/Spend/Net Profit, bandeau qualité de donnée.
 */
export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;

  const url = new URL(req.url);
  const range = parseRange(url.searchParams.get("range"), url.searchParams.get("from"), url.searchParams.get("to"));

  try {
    const board = await getBlendedBoard(auth.user.id, range);
    return NextResponse.json({ ...board, computed_at: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
