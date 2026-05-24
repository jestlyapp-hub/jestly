import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { getCampaignDetail } from "@/lib/ads/aggregator";
import type { AdsProvider } from "@/lib/ads/types";
import { parseRange } from "../../_helpers";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { id } = await ctx.params;
  const url = new URL(req.url);
  const provider = (url.searchParams.get("provider") ?? "pinterest") as AdsProvider;
  const range = parseRange(url.searchParams.get("range"), url.searchParams.get("from"), url.searchParams.get("to"));
  const detail = await getCampaignDetail(auth.user.id, id, provider, range);
  return NextResponse.json({ range, ...detail });
}
