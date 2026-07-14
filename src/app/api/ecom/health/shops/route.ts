import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { getShopsHealth } from "@/lib/gads/shops-health";

/**
 * GET /api/ecom/health/shops — fiche de santé par boutique (multi-boutiques).
 * Scopé user_id ; chaque boutique par integration_id. Sert les colonnes de santé
 * du centre de santé ECOM (sync, Google Ads, pixel, mapping %, COGS %, coûts).
 */
export async function GET() {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  try {
    const shops = await getShopsHealth(auth.user.id);
    return NextResponse.json({ shops });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
