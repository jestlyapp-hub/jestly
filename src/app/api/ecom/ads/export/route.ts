import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseRange, parseProviders } from "../_helpers";

export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const url = new URL(req.url);
  const range = parseRange(url.searchParams.get("range"), url.searchParams.get("from"), url.searchParams.get("to"));
  const providers = parseProviders(url.searchParams.get("providers"));

  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q = (supabase.from("campaign_performance_daily") as any)
    .select("date, provider, campaign_name, ads_spend_cents, ads_impressions, ads_clicks, ads_conversions, shopify_revenue_cents, shopify_orders_count, real_roas, profit_status")
    .eq("user_id", auth.user.id)
    .gte("date", range.from)
    .lte("date", range.to)
    .order("date", { ascending: false });
  if (providers) q = q.in("provider", providers);
  const { data: rows } = await q;

  const headers = ["date", "provider", "campaign", "spend_eur", "impressions", "clicks", "ads_conversions", "shopify_revenue_eur", "shopify_orders", "real_roas", "status"];
  const escape = (v: unknown): string => {
    if (v == null) return "";
    const s = String(v).replace(/"/g, '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
  };
  const lines = [headers.join(",")];
  for (const r of (rows ?? []) as Array<Record<string, unknown>>) {
    lines.push([
      r.date,
      r.provider,
      r.campaign_name,
      ((Number(r.ads_spend_cents ?? 0)) / 100).toFixed(2),
      r.ads_impressions ?? 0,
      r.ads_clicks ?? 0,
      r.ads_conversions ?? 0,
      ((Number(r.shopify_revenue_cents ?? 0)) / 100).toFixed(2),
      r.shopify_orders_count ?? 0,
      r.real_roas != null ? Number(r.real_roas).toFixed(4) : "",
      r.profit_status ?? "",
    ].map(escape).join(","));
  }
  const csv = "﻿" + lines.join("\n");
  const filename = `ads-perf-${range.from}_${range.to}.csv`;
  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
