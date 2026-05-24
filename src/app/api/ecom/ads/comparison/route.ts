import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { getCampaignDetail } from "@/lib/ads/aggregator";
import type { AdsProvider } from "@/lib/ads/types";
import { parseRange } from "../_helpers";

export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const url = new URL(req.url);
  const ids = (url.searchParams.get("campaign_ids") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const provider = (url.searchParams.get("provider") ?? "pinterest") as AdsProvider;
  if (ids.length < 2) return NextResponse.json({ error: "Au moins 2 campaign_ids requis" }, { status: 400 });
  if (ids.length > 5) return NextResponse.json({ error: "Max 5 campagnes comparables" }, { status: 400 });
  const range = parseRange(url.searchParams.get("range"), url.searchParams.get("from"), url.searchParams.get("to"));
  const details = await Promise.all(ids.map((id) => getCampaignDetail(auth.user.id, id, provider, range)));
  return NextResponse.json({ range, campaigns: details });
}
