/**
 * Attribution manuelle par commande — agrégats pour les vues Commandes et Produits.
 *
 * Garde-fou n°1 : DEUX ROAS par canal, jamais fusionnés —
 *   « mesuré » (données captées uniquement) vs « avec attributions manuelles »
 *   (les hypothèses de Gabriel priment), avec l'écart affiché.
 * Garde-fou n°2 : volume affiché partout — moins de 5 ventes = échantillon
 *   faible, ROAS non significatif.
 * Aucune dépense inventée : seul Google Ads a un coût saisi (gads_daily) ;
 * les autres canaux sont marqués « dépense non renseignée » (spend null).
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { computeRoas } from "@/lib/ads/roas-engine";
import type { DateRange } from "@/lib/ads/types";
import { filterRealOrders } from "@/lib/shopify/test-orders-filter";
import { parisDayStartUtcIso, parisNextDayStartUtcIso } from "@/lib/paris-time";
import { deriveMeasuredChannel, resolveEffectiveChannel, type Channel, type ManualConfidence } from "./channels";

export const SMALL_SAMPLE_THRESHOLD = 5;

// ── Types exposés ────────────────────────────────────────────────
export interface PixelResolution {
  resolved_source: "google_ads" | "seo" | "pinterest" | "direct" | "other";
  match_method: "cart_attribute" | "time_proximity";
  confidence: number;
}

export interface AttributionOrderRow {
  order_id: string;
  name: string | null;
  created_at: string;
  total_cents: number;
  products: string[];
  email: string | null;
  financial_status: string | null;
  fulfillment_status: string | null;
  tracking_status: "tracked" | "ghost" | "unmatched" | null;
  measured_channel: Exclude<Channel, "ghost"> | null;
  manual: { channel: Channel; confidence: ManualConfidence | null; note: string | null } | null;
  /** Source récupérée par le pixel Jestly — toujours distincte du natif Shopify. */
  pixel: PixelResolution | null;
  effective_channel: Exclude<Channel, "ghost"> | null;
}

export interface ChannelStats {
  channel: Exclude<Channel, "ghost">;
  /** null = dépense non renseignée pour ce canal (jamais inventée). */
  spend_cents: number | null;
  orders_measured: number;
  revenue_measured_cents: number;
  orders_effective: number;
  revenue_effective_cents: number;
  /** Ventes effectives qui n'existent que par un choix manuel. */
  orders_from_manual: number;
  /** Ventes ajoutées par le pixel Jestly (mesuré inconnu, pixel résolu). */
  orders_from_pixel: number;
  revenue_with_pixel_cents: number;
  roas_measured: number | null;
  /** 3e ligne : mesuré + sources récupérées par le pixel (jamais fondu). */
  roas_with_pixel: number | null;
  roas_with_manual: number | null;
  /** Écart du ROAS avec manuelles vs mesuré, en % (null si incalculable). */
  delta_percent: number | null;
  sample_small: boolean;
}

export interface ProductChannelSplit {
  orders: number;
  revenue_cents: number;
}

export interface ProductRow {
  product_id: string | null;
  title: string;
  orders_count: number;
  units: number;
  revenue_cents: number;
  by_channel: Partial<Record<Exclude<Channel, "ghost"> | "unattributed", ProductChannelSplit>>;
  sample_small: boolean;
}

// ── Cœur pur (testable sans DB) ──────────────────────────────────
interface OrderLike {
  total_cents: number;
  measured_channel: Exclude<Channel, "ghost"> | null;
  manual: { channel: Channel; confidence: ManualConfidence | null } | null;
  pixel?: PixelResolution | null;
}

const NON_GHOST_CHANNELS: Array<Exclude<Channel, "ghost">> = ["google_ads", "seo", "pinterest", "other"];

export function computeChannelStats(
  orders: OrderLike[],
  spendByChannel: Partial<Record<Exclude<Channel, "ghost">, number>>,
): ChannelStats[] {
  return NON_GHOST_CHANNELS.map((channel) => {
    let ordersMeasured = 0, revenueMeasured = 0;
    let ordersEffective = 0, revenueEffective = 0, ordersFromManual = 0;
    let ordersFromPixel = 0, revenueWithPixel = 0;

    for (const o of orders) {
      if (o.measured_channel === channel) {
        ordersMeasured += 1;
        revenueMeasured += o.total_cents;
        revenueWithPixel += o.total_cents;
      } else if (o.measured_channel == null && o.pixel?.resolved_source === channel) {
        // Le pixel ne remplace JAMAIS une mesure Shopify : il ne fait que
        // combler les commandes dont la source mesurée est inconnue.
        ordersFromPixel += 1;
        revenueWithPixel += o.total_cents;
      }
      const effective = resolveEffectiveChannel(o.measured_channel, o.manual);
      if (effective === channel) {
        ordersEffective += 1;
        revenueEffective += o.total_cents;
        // « manuelle » = la vente n'est sur ce canal que par le choix manuel.
        if (o.manual && o.manual.channel === channel && o.measured_channel !== channel) ordersFromManual += 1;
      }
    }

    const spend = spendByChannel[channel] ?? null;
    const roasMeasured = spend != null ? computeRoas(revenueMeasured, spend) : null;
    const roasWithPixel = spend != null ? computeRoas(revenueWithPixel, spend) : null;
    const roasWithManual = spend != null ? computeRoas(revenueEffective, spend) : null;
    const delta = roasMeasured != null && roasWithManual != null && roasMeasured > 0
      ? Math.round(((roasWithManual - roasMeasured) / roasMeasured) * 1000) / 10
      : null;

    return {
      channel,
      spend_cents: spend,
      orders_measured: ordersMeasured,
      revenue_measured_cents: revenueMeasured,
      orders_effective: ordersEffective,
      revenue_effective_cents: revenueEffective,
      orders_from_manual: ordersFromManual,
      orders_from_pixel: ordersFromPixel,
      revenue_with_pixel_cents: revenueWithPixel,
      roas_measured: roasMeasured,
      roas_with_pixel: roasWithPixel,
      roas_with_manual: roasWithManual,
      delta_percent: delta,
      sample_small: ordersEffective < SMALL_SAMPLE_THRESHOLD,
    };
  });
}

interface LineItemLike {
  product_id?: string | null;
  title?: string | null;
  quantity?: number | null;
  price?: number | null;          // euros (unitaire)
  total_discount?: number | null; // euros
}

interface OrderWithLines extends OrderLike {
  line_items: LineItemLike[];
}

export function computeProductBreakdown(
  orders: OrderWithLines[],
  channelFilter?: Exclude<Channel, "ghost"> | "all",
): ProductRow[] {
  const byProduct = new Map<string, ProductRow>();

  for (const o of orders) {
    const effective = resolveEffectiveChannel(o.measured_channel, o.manual);
    if (channelFilter && channelFilter !== "all" && effective !== channelFilter) continue;
    const bucket: Exclude<Channel, "ghost"> | "unattributed" = effective ?? "unattributed";

    for (const li of o.line_items ?? []) {
      const title = li.title?.trim() || "(produit sans titre)";
      const key = li.product_id ?? `title:${title}`;
      const qty = Number(li.quantity ?? 0);
      const lineCents = Math.max(0, Math.round((Number(li.price ?? 0) * qty - Number(li.total_discount ?? 0)) * 100));

      const row = byProduct.get(key) ?? {
        product_id: li.product_id ?? null,
        title,
        orders_count: 0,
        units: 0,
        revenue_cents: 0,
        by_channel: {},
        sample_small: true,
      };
      row.orders_count += 1;
      row.units += qty;
      row.revenue_cents += lineCents;
      const split = row.by_channel[bucket] ?? { orders: 0, revenue_cents: 0 };
      split.orders += 1;
      split.revenue_cents += lineCents;
      row.by_channel[bucket] = split;
      byProduct.set(key, row);
    }
  }

  const rows = [...byProduct.values()];
  for (const r of rows) r.sample_small = r.orders_count < SMALL_SAMPLE_THRESHOLD;
  return rows.sort((a, b) => b.revenue_cents - a.revenue_cents);
}

// ── Chargement DB + composition ──────────────────────────────────
export interface DbOrderRow {
  id: string;
  name: string | null;
  total_price: number | null;
  customer_id?: string | null;
  email?: string | null;
  financial_status?: string | null;
  fulfillment_status?: string | null;
  created_at: string;
  tracking_status: "tracked" | "ghost" | "unmatched" | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  referring_site: string | null;
  landing_site: string | null;
  line_items: LineItemLike[] | null;
}

interface DbManualRow {
  order_id: string;
  channel: Channel;
  confidence: ManualConfidence | null;
  note: string | null;
}


interface DbPixelRow {
  order_id: string;
  resolved_source: PixelResolution["resolved_source"];
  match_method: PixelResolution["match_method"];
  confidence: number;
}

/**
 * Résout l'intégration Shopify active de l'utilisateur. GARDE-FOU MULTI-TENANT :
 * toute lecture service_role (qui bypasse le RLS) DOIT être scopée par cet
 * integration_id — jamais lire shopify_products/shopify_orders sans ce filtre,
 * sous peine d'exposer le catalogue et les commandes des autres boutiques.
 * Renvoie null si l'utilisateur n'a pas d'intégration active.
 */
export async function resolveActiveShopifyIntegrationId(userId: string): Promise<string | null> {
  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: integ } = await (supabase.from("integrations") as any)
    .select("id")
    .eq("user_id", userId)
    .eq("provider", "shopify")
    .eq("status", "active")
    .maybeSingle();
  return integ?.id ?? null;
}

export async function loadOrdersAndManual(userId: string, range: DateRange): Promise<{
  orders: DbOrderRow[];
  manualByOrder: Map<string, DbManualRow>;
  pixelByOrder: Map<string, PixelResolution>;
}> {
  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: integ } = await (supabase.from("integrations") as any)
    .select("id")
    .eq("user_id", userId)
    .eq("provider", "shopify")
    .eq("status", "active")
    .maybeSingle();
  if (!integ) return { orders: [], manualByOrder: new Map(), pixelByOrder: new Map() };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("shopify_orders") as any)
    .select("id, name, total_price, customer_id, email, financial_status, fulfillment_status, created_at, tracking_status, utm_source, utm_medium, utm_campaign, referring_site, landing_site, line_items")
    .eq("integration_id", integ.id)
    .is("cancelled_at", null)
    .gte("created_at", parisDayStartUtcIso(range.from))
    .lt("created_at", parisNextDayStartUtcIso(range.to))
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Lecture shopify_orders échouée : ${error.message}`);
  const orders = filterRealOrders((data ?? []) as DbOrderRow[]);

  const manualByOrder = new Map<string, DbManualRow>();
  const pixelByOrder = new Map<string, PixelResolution>();
  if (orders.length > 0) {
    const orderIds = orders.map((o) => o.id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: manual, error: manualError } = await (supabase.from("order_manual_attribution") as any)
      .select("order_id, channel, confidence, note")
      .eq("user_id", userId)
      .in("order_id", orderIds);
    if (manualError) throw new Error(`Lecture order_manual_attribution échouée : ${manualError.message}`);
    for (const m of (manual ?? []) as DbManualRow[]) manualByOrder.set(m.order_id, m);

    // Sources récupérées par le pixel first-party (tables 097, jamais fondues).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: pixel, error: pixelError } = await (supabase.from("pixel_order_attribution") as any)
      .select("order_id, resolved_source, match_method, confidence")
      .in("order_id", orderIds);
    if (pixelError) throw new Error(`Lecture pixel_order_attribution échouée : ${pixelError.message}`);
    for (const p of (pixel ?? []) as DbPixelRow[]) {
      pixelByOrder.set(p.order_id, {
        resolved_source: p.resolved_source,
        match_method: p.match_method,
        confidence: Number(p.confidence),
      });
    }
  }
  return { orders, manualByOrder, pixelByOrder };
}

async function loadGadsSpend(userId: string, range: DateRange): Promise<number> {
  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("gads_daily") as any)
    .select("cost_cents")
    .eq("user_id", userId)
    .gte("date", range.from)
    .lte("date", range.to);
  if (error) throw new Error(`Lecture gads_daily échouée : ${error.message}`);
  return ((data ?? []) as Array<{ cost_cents: number }>).reduce((s, r) => s + r.cost_cents, 0);
}

function toAttributionRow(
  o: DbOrderRow,
  manual: DbManualRow | undefined,
  pixel: PixelResolution | undefined,
): AttributionOrderRow {
  const measured = deriveMeasuredChannel(o);
  const manualObj = manual
    ? { channel: manual.channel, confidence: manual.confidence, note: manual.note }
    : null;
  return {
    order_id: o.id,
    name: o.name,
    created_at: o.created_at,
    total_cents: Math.round((o.total_price ?? 0) * 100),
    products: (o.line_items ?? []).map((li) => li.title?.trim() || "(produit sans titre)"),
    email: o.email ?? null,
    financial_status: o.financial_status ?? null,
    fulfillment_status: o.fulfillment_status ?? null,
    tracking_status: o.tracking_status,
    measured_channel: measured,
    manual: manualObj,
    pixel: pixel ?? null,
    effective_channel: resolveEffectiveChannel(measured, manualObj),
  };
}

/** Vue Commandes : lignes + stats par canal (triple ROAS). */
export async function getOrdersAttribution(userId: string, range: DateRange): Promise<{
  orders: AttributionOrderRow[];
  channels: ChannelStats[];
}> {
  const [{ orders, manualByOrder, pixelByOrder }, gadsSpend] = await Promise.all([
    loadOrdersAndManual(userId, range),
    loadGadsSpend(userId, range),
  ]);

  const rows = orders.map((o) => toAttributionRow(o, manualByOrder.get(o.id), pixelByOrder.get(o.id)));
  const channels = computeChannelStats(
    rows.map((r) => ({
      total_cents: r.total_cents,
      measured_channel: r.measured_channel,
      manual: r.manual,
      pixel: r.pixel,
    })),
    // Seul Google Ads a une dépense saisie — jamais de coût inventé ailleurs.
    { google_ads: gadsSpend },
  );
  return { orders: rows, channels };
}

/** Vue Produits : ventilation par produit et canal (attribution effective). */
export async function getProductsBreakdown(
  userId: string,
  range: DateRange,
  channelFilter?: Exclude<Channel, "ghost"> | "all",
): Promise<ProductRow[]> {
  const { orders, manualByOrder } = await loadOrdersAndManual(userId, range);
  // La vue Produits reste sur mesuré + manuel : le pixel n'y est pas fondu.
  return computeProductBreakdown(
    orders.map((o) => {
      const manual = manualByOrder.get(o.id);
      return {
        total_cents: Math.round((o.total_price ?? 0) * 100),
        measured_channel: deriveMeasuredChannel(o),
        manual: manual ? { channel: manual.channel, confidence: manual.confidence } : null,
        line_items: o.line_items ?? [],
      };
    }),
    channelFilter,
  );
}
