import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getBlendedBoard } from "@/lib/costs/blended";
import { resolveShopifyIntegration, requestedIntegrationId } from "@/lib/shopify/resolve-integration";
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
  // Période de comparaison libre (toggle « Comparer ») — défaut : période précédente.
  const cfrom = url.searchParams.get("cfrom");
  const cto = url.searchParams.get("cto");
  const compare = cfrom && cto && /^\d{4}-\d{2}-\d{2}$/.test(cfrom) && /^\d{4}-\d{2}-\d{2}$/.test(cto)
    ? { from: cfrom, to: cto }
    : undefined;

  try {
    // Boutique ciblée (sélecteur) ou principale. La dépense Google Ads est
    // scopée à la boutique (gads_daily.integration_id) : chaque boutique voit
    // SA dépense (son customer_id), jamais celle d'une autre.
    const supabase = createAdminClient();
    const resolved = await resolveShopifyIntegration(supabase, auth.user.id, requestedIntegrationId(url));
    const board = await getBlendedBoard(auth.user.id, range, compare, {
      integrationId: resolved?.integration.id ?? null,
    });
    return NextResponse.json({ ...board, computed_at: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
