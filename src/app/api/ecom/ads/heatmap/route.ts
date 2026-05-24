import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { getHeatmap } from "@/lib/ads/aggregator";
import { parseRange } from "../_helpers";

export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const url = new URL(req.url);
  const metric = (url.searchParams.get("metric") ?? "orders") as "roas" | "spend" | "revenue" | "orders";
  const range = parseRange(url.searchParams.get("range"), url.searchParams.get("from"), url.searchParams.get("to"));
  const cells = await getHeatmap(auth.user.id, range, metric);
  return NextResponse.json({ range, metric, cells });
}
