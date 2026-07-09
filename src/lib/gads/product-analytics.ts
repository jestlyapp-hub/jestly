/**
 * Product Analytics (Partie A3) — croise pour chaque produit :
 * ventes Shopify (attribution effective), COGS versionnés, et dépense
 * Google Ads par item (gads_product_daily, mappée via product-mapping).
 *
 * Deux ROAS produit, jamais fondus :
 *  - « déclaré » : conversion_value API ÷ coût (chiffre de Google)
 *  - « croisé » : CA Shopify attribué Google via la résolution unifiée
 *    (mesuré > pixel > MANUEL) ÷ coût. La couche manuelle est incluse : une
 *    vente fantôme qualifiée à la main à Google compte dans le croisé.
 * Les item_id non mappables restent visibles en « Produit inconnu ».
 * Le badge « dépense sans conversion » n'apparaît que si AUCUNE vente n'est
 * attribuée au canal, toutes résolutions confondues (mesuré + pixel + manuel).
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { computeRoas } from "@/lib/ads/roas-engine";
import { parisDay } from "@/lib/paris-time";
import type { DateRange } from "@/lib/ads/types";
import { resolveUnitCost, type ProductCostRow } from "@/lib/costs/engine";
import { deriveMeasuredChannel, resolveUnifiedChannel, type Channel } from "./channels";
import { loadOrdersAndManual, resolveActiveShopifyIntegrationId, SMALL_SAMPLE_THRESHOLD, type PixelResolution, type DbOrderRow } from "./attribution-aggregator";
import type { GadsProductDailyRow } from "./api-sync";
import { buildProductIndex, mapItemToProduct, type ProductIndex } from "./product-mapping";

export type ChannelFilter = Exclude<Channel, "ghost"> | "all";

export interface ProductAdsMetrics {
  spend_cents: number;
  clicks: number;
  impressions: number;
  conversions: number;
  conversion_value_cents: number;
}

export interface ProductAnalyticsRow {
  key: string;
  product_id: string | null;
  title: string;
  image_url: string | null;
  unknown_item: boolean;
  // Ventes (attribution effective, filtre canal appliqué)
  orders_count: number;
  units: number;
  revenue_cents: number;
  revenue_share: number | null;
  nc_revenue_cents: number;
  aov_cents: number | null;
  // Coûts
  cogs_cents: number | null;
  gross_margin_cents: number | null;
  // Attribution Google (croisé = mesuré + pixel)
  google_orders: number;
  google_revenue_cents: number;
  // Ads (API produit) — null = pas de donnée pour ce produit
  ads: ProductAdsMetrics | null;
  roas_declared: number | null;
  roas_crossed: number | null;
  cpa_cents: number | null;
  cpc_cents: number | null;
  wasted_spend: boolean;
  sample_small: boolean;
  /** CA journalier (cents), aligné sur `days` — pour la sparkline. */
  revenue_by_day: number[];
}

export interface ProductAnalytics {
  days: string[];
  rows: ProductAnalyticsRow[];
  /** Budget consommé sans conversion (encart en tête de vue). */
  wasted_spend_cents: number;
  ads_data_available: boolean;
}

// ── Cœur pur (testable) ──────────────────────────────────────────
interface OrderInput {
  created_at: string;
  is_new_customer: boolean;
  measured_channel: Exclude<Channel, "ghost"> | null;
  manual: { channel: Channel; confidence: "sure" | "assumed" | "guessed" | null } | null;
  pixel: PixelResolution | null;
  line_items: Array<{ product_id?: string | null; title?: string | null; quantity?: number | null; price?: number | null; total_discount?: number | null }>;
}

export function computeProductAnalytics(input: {
  orders: OrderInput[];
  itemRows: GadsProductDailyRow[];
  index: ProductIndex;
  costs: ProductCostRow[];
  range: DateRange;
  channelFilter: ChannelFilter;
}): ProductAnalytics {
  const { orders, itemRows, index, costs, range, channelFilter } = input;

  const days: string[] = [];
  for (let t = new Date(`${range.from}T00:00:00Z`).getTime(); t <= new Date(`${range.to}T00:00:00Z`).getTime(); t += 86_400_000) {
    days.push(new Date(t).toISOString().slice(0, 10));
  }
  const dayIndex = new Map(days.map((d, i) => [d, i]));

  const rows = new Map<string, ProductAnalyticsRow>();
  const getRow = (key: string, init: Partial<ProductAnalyticsRow>): ProductAnalyticsRow => {
    let row = rows.get(key);
    if (!row) {
      row = {
        key, product_id: null, title: "(produit sans titre)", image_url: null, unknown_item: false,
        orders_count: 0, units: 0, revenue_cents: 0, revenue_share: null, nc_revenue_cents: 0, aov_cents: null,
        cogs_cents: null, gross_margin_cents: null,
        google_orders: 0, google_revenue_cents: 0,
        ads: null, roas_declared: null, roas_crossed: null, cpa_cents: null, cpc_cents: null,
        wasted_spend: false, sample_small: true, revenue_by_day: days.map(() => 0),
        ...init,
      };
      rows.set(key, row);
    }
    return row;
  };

  // ── Côté ventes ────────────────────────────────────────────────
  const coveredUnits = new Map<string, number>();
  for (const o of orders) {
    // Canal résolu = même vérité unifiée que partout : natif > pixel > MANUEL.
    // Sans cette couche manuelle, une vente fantôme attribuée à la main à Google
    // n'entrait pas dans le CA croisé (ROAS croisé 0.00×) ni dans les ventes du
    // canal (faux badge « dépense sans conversion »). Cas Stockholm/Honfleur.
    const resolved = resolveUnifiedChannel({
      measured: o.measured_channel,
      pixel: o.pixel,
      manual: o.manual,
    });
    if (channelFilter !== "all" && resolved !== channelFilter) continue;
    const isGoogle = resolved === "google_ads";
    const day = parisDay(o.created_at);

    for (const li of o.line_items ?? []) {
      const qty = Number(li.quantity ?? 0);
      if (qty <= 0) continue;
      const lineCents = Math.max(0, Math.round((Number(li.price ?? 0) * qty - Number(li.total_discount ?? 0)) * 100));
      const pid = li.product_id ?? null;
      const ref = pid ? index.byProductId.get(pid) : null;
      const key = pid ?? `title:${li.title ?? "?"}`;
      const row = getRow(key, {
        product_id: pid,
        title: ref?.title ?? li.title?.trim() ?? "(produit sans titre)",
        image_url: ref?.image_url ?? null,
      });
      row.orders_count += 1;
      row.units += qty;
      row.revenue_cents += lineCents;
      if (o.is_new_customer) row.nc_revenue_cents += lineCents;
      if (isGoogle) {
        row.google_orders += 1;
        row.google_revenue_cents += lineCents;
      }
      const di = dayIndex.get(day);
      if (di != null) row.revenue_by_day[di] += lineCents;

      const unit = resolveUnitCost(costs, pid, o.created_at);
      if (unit != null) {
        row.cogs_cents = (row.cogs_cents ?? 0) + unit * qty;
        coveredUnits.set(key, (coveredUnits.get(key) ?? 0) + qty);
      }
    }
  }

  // ── Côté Ads (item × jour → produit) ───────────────────────────
  const adsByKey = new Map<string, ProductAdsMetrics>();
  for (const r of itemRows) {
    const ref = mapItemToProduct(r.item_id, index);
    const key = ref ? ref.shopify_product_id : `unknown:${r.item_id}`;
    if (!ref) {
      getRow(key, {
        title: `Produit inconnu (${r.item_id})`,
        unknown_item: true,
      });
    } else {
      getRow(key, { product_id: ref.shopify_product_id, title: ref.title, image_url: ref.image_url });
    }
    const m = adsByKey.get(key) ?? { spend_cents: 0, clicks: 0, impressions: 0, conversions: 0, conversion_value_cents: 0 };
    m.spend_cents += r.cost_cents;
    m.clicks += r.clicks;
    m.impressions += r.impressions;
    m.conversions = Math.round((m.conversions + r.conversions) * 100) / 100;
    m.conversion_value_cents += r.conversion_value_cents;
    adsByKey.set(key, m);
  }

  // ── Finalisation ───────────────────────────────────────────────
  const totalRevenue = [...rows.values()].reduce((s, r) => s + r.revenue_cents, 0);
  let wastedTotal = 0;
  for (const row of rows.values()) {
    const ads = adsByKey.get(row.key) ?? null;
    row.ads = ads;
    row.revenue_share = totalRevenue > 0 ? Math.round((row.revenue_cents / totalRevenue) * 1000) / 1000 : null;
    row.aov_cents = row.orders_count > 0 ? Math.round(row.revenue_cents / row.orders_count) : null;
    row.gross_margin_cents = row.cogs_cents != null ? row.revenue_cents - row.cogs_cents : null;
    row.sample_small = row.orders_count < SMALL_SAMPLE_THRESHOLD;
    if (ads) {
      row.roas_declared = computeRoas(ads.conversion_value_cents, ads.spend_cents);
      row.roas_crossed = computeRoas(row.google_revenue_cents, ads.spend_cents);
      row.cpa_cents = row.google_orders > 0 && ads.spend_cents > 0 ? Math.round(ads.spend_cents / row.google_orders) : null;
      row.cpc_cents = ads.clicks > 0 ? Math.round(ads.spend_cents / ads.clicks) : null;
      row.wasted_spend = ads.spend_cents > 0 && ads.conversions === 0 && row.google_orders === 0;
      if (row.wasted_spend) wastedTotal += ads.spend_cents;
    }
  }

  const sorted = [...rows.values()].sort((a, b) => {
    // Les produits qui brûlent du budget sans convertir remontent en premier.
    if (a.wasted_spend !== b.wasted_spend) return a.wasted_spend ? -1 : 1;
    return (b.ads?.spend_cents ?? 0) - (a.ads?.spend_cents ?? 0) || b.revenue_cents - a.revenue_cents;
  });

  return {
    days,
    rows: sorted,
    wasted_spend_cents: wastedTotal,
    ads_data_available: itemRows.length > 0,
  };
}

// ── Chargement DB ────────────────────────────────────────────────
export async function getProductAnalytics(
  userId: string,
  range: DateRange,
  channelFilter: ChannelFilter = "all",
): Promise<ProductAnalytics> {
  const supabase = createAdminClient();

  // GARDE-FOU MULTI-TENANT : le service_role bypasse le RLS, donc shopify_products
  // et shopify_orders DOIVENT être filtrés par l'intégration de l'utilisateur.
  // Sans intégration, aucune donnée boutique (jamais le catalogue d'autrui).
  const integrationId = await resolveActiveShopifyIntegrationId(userId);

  const [{ orders, manualByOrder, pixelByOrder }, itemRows, products, costs, firstOrders] = await Promise.all([
    loadOrdersAndManual(userId, range),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("gads_product_daily") as any)
      .select("item_id, date, cost_cents, clicks, impressions, conversions, conversion_value_cents")
      .eq("user_id", userId)
      .gte("date", range.from)
      .lte("date", range.to)
      .then(({ data }: { data: GadsProductDailyRow[] | null }) => data ?? []),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    integrationId
      ? (supabase.from("shopify_products") as any)
          .select("shopify_product_id, title, featured_image_url, price_min, variants")
          .eq("integration_id", integrationId)
          .then(({ data }: { data: Parameters<typeof buildProductIndex>[0] | null }) => data ?? [])
      : Promise.resolve([]),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("ecom_product_costs") as any)
      .select("shopify_product_id, unit_cost_cents, effective_from")
      .eq("user_id", userId)
      .then(({ data }: { data: ProductCostRow[] | null }) => data ?? []),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    integrationId
      ? (supabase.from("shopify_orders") as any)
          .select("customer_id, created_at")
          .eq("integration_id", integrationId)
          .is("cancelled_at", null)
          .not("customer_id", "is", null)
          .then(({ data }: { data: Array<{ customer_id: string; created_at: string }> | null }) => data ?? [])
      : Promise.resolve([]),
  ]);

  const firstOrderAt = new Map<string, string>();
  for (const r of firstOrders as Array<{ customer_id: string; created_at: string }>) {
    const cur = firstOrderAt.get(r.customer_id);
    if (!cur || r.created_at < cur) firstOrderAt.set(r.customer_id, r.created_at);
  }

  const orderInputs: OrderInput[] = (orders as DbOrderRow[]).map((o) => {
    const manual = manualByOrder.get(o.id);
    const first = o.customer_id ? firstOrderAt.get(o.customer_id) : undefined;
    return {
      created_at: o.created_at,
      is_new_customer: !o.customer_id || first == null || o.created_at <= first,
      measured_channel: deriveMeasuredChannel(o),
      manual: manual ? { channel: manual.channel, confidence: manual.confidence } : null,
      pixel: pixelByOrder.get(o.id) ?? null,
      line_items: o.line_items ?? [],
    };
  });

  return computeProductAnalytics({
    orders: orderInputs,
    itemRows: itemRows as GadsProductDailyRow[],
    index: buildProductIndex(products as Parameters<typeof buildProductIndex>[0]),
    costs: costs as ProductCostRow[],
    range,
    channelFilter,
  });
}
