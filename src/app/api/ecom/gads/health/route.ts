import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { extractJestlySid } from "@/lib/pixel/matcher";

/**
 * GET /api/ecom/gads/health — Centre de santé des données (refonte, carte
 * blanche D). « Est-ce que ma machine tourne ? » en un écran : état des syncs,
 * sessions pixel 24 h, commandes étiquetées par le cart attribute, matching,
 * taux de réponse survey.
 */
export async function GET() {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const userId = auth.user.id;
  const supabase = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: integ } = await (supabase.from("integrations") as any)
    .select("id, last_sync_at")
    .eq("user_id", userId)
    .eq("provider", "shopify")
    .eq("status", "active")
    .maybeSingle();

  const since30d = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
  const since24h = new Date(Date.now() - 24 * 3600 * 1000).toISOString();

  const [syncState, gadsLast, gadsProductLast, shops, recentOrders, matches, ppsCount] = await Promise.all([
    integ
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? (supabase.from("shopify_sync_state") as any)
          .select("last_orders_sync_at, last_analytics_sync_at")
          .eq("integration_id", integ.id)
          .maybeSingle()
          .then(({ data }: { data: { last_orders_sync_at: string | null } | null }) => data)
      : Promise.resolve(null),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("gads_daily") as any)
      .select("imported_at, date")
      .eq("user_id", userId)
      .order("imported_at", { ascending: false })
      .limit(1)
      .then(({ data }: { data: Array<{ imported_at: string; date: string }> | null }) => data?.[0] ?? null),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("gads_product_daily") as any)
      .select("imported_at")
      .eq("user_id", userId)
      .order("imported_at", { ascending: false })
      .limit(1)
      .then(({ data }: { data: Array<{ imported_at: string }> | null }) => data?.[0] ?? null),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("pixel_shops") as any)
      .select("id, shop_domain, label, is_active")
      .eq("user_id", userId)
      .then(({ data }: { data: Array<{ id: string; shop_domain: string; label: string | null; is_active: boolean }> | null }) => data ?? []),
    integ
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? (supabase.from("shopify_orders") as any)
          .select("shopify_order_id, note_attributes")
          .eq("integration_id", integ.id)
          .gte("created_at", since30d)
          .then(({ data }: { data: Array<{ shopify_order_id: string; note_attributes: Array<{ key?: string; value?: string | null }> | null }> | null }) => data ?? [])
      : Promise.resolve([]),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("pixel_order_attribution") as any)
      .select("match_method")
      .gte("matched_at", since30d)
      .then(({ data }: { data: Array<{ match_method: string }> | null }) => data ?? []),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("pps_responses") as any)
      .select("id")
      .gte("answered_at", since30d)
      .then(({ data }: { data: Array<{ id: string }> | null }) => (data ?? []).length),
  ]);

  // Sessions pixel des dernières 24 h, par boutique
  const shopHealth = await Promise.all(
    (shops as Array<{ id: string; shop_domain: string; label: string | null; is_active: boolean }>).map(async (s) => {
      const [{ data: recent }, { data: last }] = await Promise.all([
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase.from("pixel_sessions") as any)
          .select("id")
          .eq("shop_id", s.id)
          .gte("last_seen_at", since24h),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase.from("pixel_sessions") as any)
          .select("last_seen_at")
          .eq("shop_id", s.id)
          .order("last_seen_at", { ascending: false })
          .limit(1),
      ]);
      return {
        label: s.label ?? s.shop_domain,
        is_active: s.is_active,
        sessions_24h: (recent ?? []).length,
        last_session_at: (last as Array<{ last_seen_at: string }> | null)?.[0]?.last_seen_at ?? null,
      };
    }),
  );

  const taggedOrders = (recentOrders as Array<{ note_attributes: Array<{ key?: string; value?: string | null }> | null }>)
    .filter((o) => extractJestlySid(o.note_attributes) != null).length;
  const matchCounts = { cart_attribute: 0, time_proximity: 0 };
  for (const m of matches as Array<{ match_method: string }>) {
    if (m.match_method === "cart_attribute") matchCounts.cart_attribute += 1;
    else if (m.match_method === "time_proximity") matchCounts.time_proximity += 1;
  }

  return NextResponse.json({
    syncs: {
      shopify_last: (syncState as { last_orders_sync_at?: string | null } | null)?.last_orders_sync_at ?? integ?.last_sync_at ?? null,
      shopify_cadence: "toutes les 4 h (GitHub Actions)",
      gads_last: gadsLast?.imported_at ?? null,
      gads_latest_date: gadsLast?.date ?? null,
      gads_product_last: gadsProductLast?.imported_at ?? null,
      gads_cadence: "toutes les 6 h 15 (GitHub Actions)",
    },
    pixel: { shops: shopHealth },
    matching: {
      orders_30d: (recentOrders as unknown[]).length,
      tagged_orders_30d: taggedOrders,
      cart_attribute_30d: matchCounts.cart_attribute,
      time_proximity_30d: matchCounts.time_proximity,
    },
    survey: {
      responses_30d: ppsCount,
      response_rate: (recentOrders as unknown[]).length > 0
        ? Math.round(((ppsCount as number) / (recentOrders as unknown[]).length) * 1000) / 1000
        : null,
    },
    computed_at: new Date().toISOString(),
  });
}
