import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { getTimeline } from "@/lib/ads/aggregator";
import { parseRange, parseProviders } from "../_helpers";

export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const url = new URL(req.url);
  const range = parseRange(url.searchParams.get("range"), url.searchParams.get("from"), url.searchParams.get("to"));
  const providers = parseProviders(url.searchParams.get("providers"));
  const points = await getTimeline(auth.user.id, range, providers);
  return NextResponse.json({ range, points });
}
