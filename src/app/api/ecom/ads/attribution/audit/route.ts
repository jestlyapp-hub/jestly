import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseRange } from "../../_helpers";

export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const url = new URL(req.url);
  const method = url.searchParams.get("method"); // utm_campaign_exact | utm_source_prorata | referring_site | unmatched
  const range = parseRange(url.searchParams.get("range"), url.searchParams.get("from"), url.searchParams.get("to"));

  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q = (supabase.from("order_attribution_touches") as any)
    .select("order_id, touch_index, touch_at, provider, campaign_id, campaign_name, utm_source, utm_campaign, attribution_method, attribution_weight, referring_site, landing_path")
    .eq("user_id", auth.user.id)
    .gte("touch_at", range.from + "T00:00:00")
    .lte("touch_at", range.to + "T23:59:59")
    .order("touch_at", { ascending: false })
    .limit(500);
  if (method) q = q.eq("attribution_method", method);
  const { data } = await q;

  // Stats par méthode
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: all } = await (supabase.from("order_attribution_touches") as any)
    .select("attribution_method")
    .eq("user_id", auth.user.id)
    .gte("touch_at", range.from + "T00:00:00")
    .lte("touch_at", range.to + "T23:59:59");
  const counts: Record<string, number> = {};
  for (const t of (all ?? []) as Array<{ attribution_method: string }>) {
    counts[t.attribution_method] = (counts[t.attribution_method] ?? 0) + 1;
  }

  return NextResponse.json({ range, method_filter: method, touches: data ?? [], stats: counts });
}
