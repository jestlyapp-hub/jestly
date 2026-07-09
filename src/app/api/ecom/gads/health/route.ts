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

  const [syncState, gadsLast, gadsMaxDate, gadsProductLast, shops, recentOrders] = await Promise.all([
    integ
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? (supabase.from("shopify_sync_state") as any)
          .select("last_orders_sync_at, last_analytics_sync_at")
          .eq("integration_id", integ.id)
          .maybeSingle()
          .then(({ data }: { data: { last_orders_sync_at: string | null } | null }) => data)
      : Promise.resolve(null),
    // Fraîcheur = MAX(imported_at) : quand la dernière écriture a-t-elle eu lieu.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("gads_daily") as any)
      .select("imported_at")
      .eq("user_id", userId)
      .order("imported_at", { ascending: false })
      .limit(1)
      .then(({ data }: { data: Array<{ imported_at: string }> | null }) => data?.[0] ?? null),
    // Couverture = MAX(date) : jusqu'à quel jour les données remontent. Requête
    // distincte car tout le batch de 30 j partage le même imported_at — trier par
    // imported_at renvoie une ligne au date arbitraire, pas la plus récente.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("gads_daily") as any)
      .select("date")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(1)
      .then(({ data }: { data: Array<{ date: string }> | null }) => data?.[0]?.date ?? null),
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
          .select("shopify_order_id, created_at, note_attributes")
          .eq("integration_id", integ.id)
          .gte("created_at", since30d)
          .then(({ data }: { data: Array<{ shopify_order_id: string; created_at: string; note_attributes: Array<{ key?: string; value?: string | null }> | null }> | null }) => data ?? [])
      : Promise.resolve([]),
  ]);

  // GARDE-FOU MULTI-TENANT : pixel_order_attribution et pps_responses (service_role,
  // RLS bypassée) DOIVENT être scopées aux boutiques pixel de l'utilisateur —
  // sinon les compteurs matching/survey agrègent TOUS les tenants. shop_id ∈ ses shops.
  const shopIds = (shops as Array<{ id: string }>).map((s) => s.id);
  const [matches, ppsCount] = shopIds.length === 0
    ? [[] as Array<{ match_method: string }>, 0]
    : await Promise.all([
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase.from("pixel_order_attribution") as any)
          .select("match_method")
          .in("shop_id", shopIds)
          .gte("matched_at", since30d)
          .then(({ data }: { data: Array<{ match_method: string }> | null }) => data ?? []),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase.from("pps_responses") as any)
          .select("id")
          .in("shop_id", shopIds)
          .gte("answered_at", since30d)
          .then(({ data }: { data: Array<{ id: string }> | null }) => (data ?? []).length),
      ]);

  // Sessions pixel des dernières 24 h + première session (par boutique)
  const shopHealth = await Promise.all(
    (shops as Array<{ id: string; shop_domain: string; label: string | null; is_active: boolean }>).map(async (s) => {
      const [{ data: recent }, { data: last }, { data: first }] = await Promise.all([
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
        // Première session jamais captée : borne à partir de laquelle une
        // commande PEUT porter l'attribut de panier du pixel.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase.from("pixel_sessions") as any)
          .select("first_seen_at")
          .eq("shop_id", s.id)
          .order("first_seen_at", { ascending: true })
          .limit(1),
      ]);
      return {
        label: s.label ?? s.shop_domain,
        is_active: s.is_active,
        sessions_24h: (recent ?? []).length,
        last_session_at: (last as Array<{ last_seen_at: string }> | null)?.[0]?.last_seen_at ?? null,
        first_session_at: (first as Array<{ first_seen_at: string }> | null)?.[0]?.first_seen_at ?? null,
      };
    }),
  );

  // Borne globale « pixel actif depuis » = la plus ancienne session, toutes
  // boutiques confondues. Le matching ne s'évalue que sur les commandes
  // postérieures (une commande antérieure NE PEUT PAS porter l'attribut).
  const pixelActiveSince = shopHealth
    .map((s) => s.first_session_at)
    .filter((d): d is string => d != null)
    .sort()[0] ?? null;

  // Le ratio d'attribut de panier ne compte QUE les commandes postérieures à la
  // pose du pixel — sinon « 0/12 » alarme à tort alors que les 12 commandes sont
  // simplement antérieures au pixel.
  const allRecentOrders = recentOrders as Array<{ created_at: string; note_attributes: Array<{ key?: string; value?: string | null }> | null }>;
  const eligibleOrders = pixelActiveSince
    ? allRecentOrders.filter((o) => o.created_at >= pixelActiveSince)
    : [];
  const taggedOrders = eligibleOrders.filter((o) => extractJestlySid(o.note_attributes) != null).length;
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
      gads_latest_date: (gadsMaxDate as string | null) ?? null,
      gads_product_last: gadsProductLast?.imported_at ?? null,
      gads_cadence: "toutes les 6 h 15 (GitHub Actions)",
    },
    pixel: { shops: shopHealth, active_since: pixelActiveSince },
    matching: {
      orders_30d: (recentOrders as unknown[]).length,
      // Dénominateur = commandes postérieures au pixel (les seules éligibles).
      eligible_orders_30d: eligibleOrders.length,
      tagged_orders_30d: taggedOrders,
      pixel_active_since: pixelActiveSince,
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
