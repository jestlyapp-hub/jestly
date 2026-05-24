import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ order_id: string }> }) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { order_id } = await ctx.params;

  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: touches } = await (supabase.from("order_attribution_touches") as any)
    .select("*")
    .eq("user_id", auth.user.id)
    .eq("order_id", order_id)
    .order("touch_index");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: integs } = await (supabase.from("integrations") as any)
    .select("id").eq("user_id", auth.user.id).eq("provider", "shopify").eq("status", "active");
  const integIds = (integs ?? []).map((i: { id: string }) => i.id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: orderRow } = integIds.length > 0
    ? await (supabase.from("shopify_orders") as any)
        .select("id, name, created_at, total_price, currency, email, landing_site, referring_site, source_name, utm_source, utm_medium, utm_campaign, utm_content")
        .in("integration_id", integIds)
        .eq("shopify_order_id", order_id)
        .maybeSingle()
    : { data: null };

  return NextResponse.json({ order: orderRow, touches: touches ?? [] });
}
