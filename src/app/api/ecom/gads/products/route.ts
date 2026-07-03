import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { getProductsBreakdown } from "@/lib/gads/attribution-aggregator";
import type { Channel } from "@/lib/gads/channels";
import { parseRange } from "../../ads/_helpers";

const VALID_FILTERS = new Set(["all", "google_ads", "seo", "pinterest", "other"]);

/**
 * GET /api/ecom/gads/products — ventilation du CA par produit et par canal
 * (attribution effective : les choix manuels priment sur le mesuré).
 * Garde-fou volume : moins de 5 ventes = échantillon faible, marqué tel quel.
 */
export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;

  const url = new URL(req.url);
  const range = parseRange(url.searchParams.get("range"), url.searchParams.get("from"), url.searchParams.get("to"));
  const channelParam = url.searchParams.get("channel") ?? "all";
  const channel = (VALID_FILTERS.has(channelParam) ? channelParam : "all") as Exclude<Channel, "ghost"> | "all";

  try {
    const products = await getProductsBreakdown(auth.user.id, range, channel);
    return NextResponse.json({ range, channel, products, computed_at: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
