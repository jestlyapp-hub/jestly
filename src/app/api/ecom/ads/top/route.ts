import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { getTopCampaigns } from "@/lib/ads/aggregator";
import { parseRange } from "../_helpers";

export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const url = new URL(req.url);
  const type = (url.searchParams.get("type") ?? "profitable") as "profitable" | "unprofitable";
  const range = parseRange(url.searchParams.get("range"), url.searchParams.get("from"), url.searchParams.get("to"));
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "5", 10), 20);
  const campaigns = await getTopCampaigns(auth.user.id, range, type, limit);
  return NextResponse.json({ type, campaigns });
}
