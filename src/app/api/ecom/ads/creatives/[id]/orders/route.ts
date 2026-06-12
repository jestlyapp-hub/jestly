import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseRange } from "../../../_helpers";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { id } = await ctx.params;
  const url = new URL(req.url);
  const range = parseRange(url.searchParams.get("range"), url.searchParams.get("from"), url.searchParams.get("to"));

  const supabase = createAdminClient();
  // Touchpoints au grain ad : matchés en utm_content_exact, ad_id porté par metadata
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: touches } = await (supabase.from("order_attribution_touches") as any)
    .select("order_id, attribution_method, attribution_weight, touch_at, provider, campaign_name, metadata")
    .eq("user_id", auth.user.id)
    .eq("metadata->>ad_id", id)
    .gte("touch_at", range.from + "T00:00:00")
    .lte("touch_at", range.to + "T23:59:59");

  const orderIds = [...new Set(((touches ?? []) as Array<{ order_id: string }>).map((t) => t.order_id))];
  if (orderIds.length === 0) {
    return NextResponse.json({ orders: [] });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: integs } = await (supabase.from("integrations") as any)
    .select("id").eq("user_id", auth.user.id).eq("provider", "shopify").eq("status", "active");
  const integIds = (integs ?? []).map((i: { id: string }) => i.id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: orders } = await (supabase.from("shopify_orders") as any)
    .select("id, name, shopify_order_id, created_at, total_price, currency, email, financial_status")
    .in("integration_id", integIds)
    .in("shopify_order_id", orderIds);

  const touchByOrder = new Map<string, { method: string; weight: number }>();
  for (const t of (touches ?? []) as Array<{ order_id: string; attribution_method: string; attribution_weight: number }>) {
    touchByOrder.set(t.order_id, { method: t.attribution_method, weight: t.attribution_weight });
  }

  const enriched = ((orders ?? []) as Array<Record<string, unknown>>).map((o) => ({
    id: o.id, name: o.name, created_at: o.created_at,
    total_price: Number(o.total_price ?? 0), currency: o.currency, email: o.email,
    financial_status: o.financial_status,
    attribution_method: touchByOrder.get(o.shopify_order_id as string)?.method ?? null,
    attribution_weight: touchByOrder.get(o.shopify_order_id as string)?.weight ?? null,
  })).sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));

  return NextResponse.json({ orders: enriched });
}
