import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { getCampaignsList } from "@/lib/ads/aggregator";
import type { ProfitStatus } from "@/lib/ads/types";
import { parseRange, parseProviders } from "../_helpers";

export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const url = new URL(req.url);
  const range = parseRange(url.searchParams.get("range"), url.searchParams.get("from"), url.searchParams.get("to"));
  const providers = parseProviders(url.searchParams.get("providers"));
  const status = url.searchParams.get("status") as ProfitStatus | null;
  const sortBy = (url.searchParams.get("sortBy") ?? "spend") as "spend" | "revenue" | "roas" | "orders";
  const sortOrder = (url.searchParams.get("sortOrder") ?? "desc") as "asc" | "desc";
  const search = url.searchParams.get("search") ?? undefined;
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "50", 10), 200);
  const offset = parseInt(url.searchParams.get("offset") ?? "0", 10);

  const result = await getCampaignsList(auth.user.id, {
    range, providers,
    status: status && ["profitable", "warning", "unprofitable", "unmatched"].includes(status) ? status : undefined,
    sortBy, sortOrder, search, limit, offset,
  });
  return NextResponse.json(result);
}
