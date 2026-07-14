/**
 * Fiche de santé PAR BOUTIQUE (multi-boutiques) — « une boutique = une colonne ».
 * Par intégration Shopify du user : état sync Shopify, Google Ads connecté, pixel
 * actif, taux de résolution du mapping produits (item_id ↔ Shopify), couverture
 * COGS, coûts renseignés. Tout scopé par integration_id / user_id (isolation).
 *
 * Le taux de mapping réutilise EXACTEMENT la résolution des vues (buildProductIndex
 * + mapItemToProduct) → le chiffre affiché est celui réellement appliqué.
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { getBlendedBoard } from "@/lib/costs/blended";
import { parisDaysAgo, todayParis } from "@/lib/paris-time";
import { buildProductIndex, mapItemToProduct } from "./product-mapping";

export interface ShopHealthCard {
  integration_id: string;
  name: string;
  shop_domain: string;
  shopify_last_sync: string | null;
  gads_connected: boolean;
  pixel_active: boolean;
  costs_configured: boolean;
  /** Mapping produits item_id ↔ Shopify (pondéré par dépense). */
  mapping: {
    total_items: number;
    resolved_items: number;
    rate: number | null;
    /** Part de la dépense produit couverte par un item_id résolu (0-1). */
    resolved_spend_share: number | null;
  };
  /** Couverture COGS (part des unités vendues avec un coût renseigné, 0-1). */
  cogs_coverage: number | null;
}

export async function getShopsHealth(userId: string): Promise<ShopHealthCard[]> {
  const supabase = createAdminClient();
  const range = { from: parisDaysAgo(30), to: todayParis() };

  const [{ data: integs }, { data: gadsAccounts }, { data: pixelShops }] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("integrations") as any)
      .select("id, shop_domain, last_sync_at, metadata")
      .eq("user_id", userId).eq("provider", "shopify").eq("status", "active"),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("gads_accounts") as any).select("integration_id, is_active").eq("user_id", userId),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("pixel_shops") as any).select("label, is_active").eq("user_id", userId),
  ]);

  const integrations = (integs ?? []) as Array<{ id: string; shop_domain: string; last_sync_at: string | null; metadata: Record<string, unknown> }>;
  const gadsByInteg = new Set(((gadsAccounts ?? []) as Array<{ integration_id: string; is_active: boolean }>).filter((a) => a.is_active).map((a) => a.integration_id));
  const pixelByName = new Map(((pixelShops ?? []) as Array<{ label: string | null; is_active: boolean }>).map((p) => [(p.label ?? "").trim().toLowerCase(), p.is_active]));

  return Promise.all(integrations.map(async (integ): Promise<ShopHealthCard> => {
    const name = String(integ.metadata?.shop_name ?? integ.shop_domain);
    const [{ data: itemRows }, { data: products }, board] = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from("gads_product_daily") as any)
        .select("item_id, cost_cents").eq("integration_id", integ.id)
        .gte("date", range.from).lte("date", range.to),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from("shopify_products") as any)
        .select("shopify_product_id, title, featured_image_url, price_min, variants").eq("integration_id", integ.id),
      getBlendedBoard(userId, range, undefined, { integrationId: integ.id }).catch(() => null),
    ]);

    const index = buildProductIndex((products ?? []) as Parameters<typeof buildProductIndex>[0]);
    // Agrège par item_id (dépense) puis mesure la résolution pondérée.
    const byItem = new Map<string, number>();
    for (const r of (itemRows ?? []) as Array<{ item_id: string; cost_cents: number }>) {
      byItem.set(r.item_id, (byItem.get(r.item_id) ?? 0) + (r.cost_cents ?? 0));
    }
    let resolved = 0, total = 0, resolvedSpend = 0, totalSpend = 0;
    for (const [item, spend] of byItem) {
      total += 1; totalSpend += spend;
      if (mapItemToProduct(item, index)) { resolved += 1; resolvedSpend += spend; }
    }

    const cur = board?.current;
    return {
      integration_id: integ.id,
      name,
      shop_domain: integ.shop_domain,
      shopify_last_sync: integ.last_sync_at,
      gads_connected: gadsByInteg.has(integ.id),
      pixel_active: pixelByName.get(name.trim().toLowerCase()) === true,
      costs_configured: cur?.costs_configured ?? false,
      mapping: {
        total_items: total,
        resolved_items: resolved,
        rate: total > 0 ? Math.round((resolved / total) * 1000) / 1000 : null,
        resolved_spend_share: totalSpend > 0 ? Math.round((resolvedSpend / totalSpend) * 1000) / 1000 : null,
      },
      cogs_coverage: cur && cur.cogs.total_units > 0 ? cur.cogs.coverage : null,
    };
  }));
}
