import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AdsProvider } from "@/lib/ads/types";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { id } = await ctx.params;
  const url = new URL(req.url);
  const provider = (url.searchParams.get("provider") ?? "pinterest") as AdsProvider;

  const supabase = createAdminClient();
  if (provider !== "pinterest") return NextResponse.json({ ads: [] });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: integ } = await (supabase.from("integrations") as any)
    .select("id").eq("user_id", auth.user.id).eq("provider", "pinterest").eq("status", "active").maybeSingle();
  if (!integ) return NextResponse.json({ ads: [] });

  // ad_groups → ads de cette campagne
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: groups } = await (supabase.from("pinterest_ad_groups") as any)
    .select("pinterest_ad_group_id, name, status, budget_in_micro_currency")
    .eq("integration_id", integ.id)
    .eq("campaign_id", id);

  const groupIds = (groups ?? []).map((g: { pinterest_ad_group_id: string }) => g.pinterest_ad_group_id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: ads } = groupIds.length > 0 ? await (supabase.from("pinterest_ads") as any)
    .select("pinterest_ad_id, ad_group_id, name, status, pin_id, click_tracking_url")
    .eq("integration_id", integ.id)
    .in("ad_group_id", groupIds) : { data: [] };

  return NextResponse.json({
    ad_groups: groups ?? [],
    ads: ads ?? [],
  });
}
