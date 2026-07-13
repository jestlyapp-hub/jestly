/**
 * Détail d'une campagne Google Ads (onglet Campagnes → clic sur une ligne).
 *
 * Réutilise la même résolution unifiée que la liste (campaign-analytics) et le
 * même mapping item_id ↔ produit Shopify que Product Analytics (product-mapping),
 * pour afficher les VRAIS noms + images des produits — jamais un item_id nu.
 *
 * Produits séparés en « diffusés » (l'API renvoie de la diffusion sur la période)
 * et « sans diffusion récente / exclus » (le produit a vendu via la campagne mais
 * ne diffuse plus). Deux insights malins remontés en tête :
 *  - candidat à l'exclusion : dépense sans aucune conversion (Google ni Jestly) ;
 *  - candidat à réactiver : plus de diffusion mais des ventes attribuées.
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { computeRoas } from "@/lib/ads/roas-engine";
import { normalizeCampaignName } from "@/lib/ads/utm-parser";
import { parisDay, todayParis } from "@/lib/paris-time";
import type { DateRange } from "@/lib/ads/types";
import { resolveUnifiedChannel, deriveMeasuredChannel } from "./channels";
import { loadOrdersAndManual, resolveActiveShopifyIntegrationId, SMALL_SAMPLE_THRESHOLD, type DbOrderRow } from "./attribution-aggregator";
import { buildProductIndex, mapItemToProduct, type ProductIndex } from "./product-mapping";
import {
  deriveCampaignStatus, type CampaignMeta, type DisplayCampaignStatus,
} from "./campaign-analytics";

export interface BudgetPoint {
  budget_cents: number;
  observed_at: string;
}

export interface CampaignProductRowOut {
  key: string;
  product_id: string | null;
  title: string;
  image_url: string | null;
  unknown_item: boolean;
  status_in_feed: "active" | "inactive";
  spend_cents: number;
  clicks: number;
  impressions: number;
  google_conversions: number;
  jestly_orders: number;
  jestly_revenue_cents: number;
  roas_jestly: number | null;
  candidate_exclude: boolean;
  candidate_reactivate: boolean;
}

export interface CampaignDailyPoint {
  date: string;
  spend_cents: number;
  jestly_revenue_cents: number;
  /** ROAS Jestly glissant 7 j (SUM/SUM), null si dépense nulle. */
  rolling_roas: number | null;
}

export interface CampaignDetail {
  campaign_id: string;
  name: string;
  status: string;
  status_display: DisplayCampaignStatus;
  channel_type: string | null;
  start_date: string | null;
  end_date: string | null;
  current_budget_cents: number | null;
  bidding_strategy: string | null;
  // KPIs période
  spend_cents: number;
  clicks: number;
  impressions: number;
  ctr: number | null;
  avg_cpc_cents: number | null;
  google_conversions: number;
  google_conversion_value_cents: number;
  roas_google: number | null;
  jestly_orders: number;
  jestly_revenue_cents: number;
  roas_jestly: number | null;
  cpa_cents: number | null;
  be_roas: number | null;
  profitable: boolean | null;
  sample_small: boolean;
  net_profit_cents: number | null;
  // Séries & archives
  timeline: CampaignDailyPoint[];
  budget_history: BudgetPoint[];
  budget_archive_since: string | null;
  // Produits
  products_active: CampaignProductRowOut[];
  products_inactive: CampaignProductRowOut[];
}

interface AdsAgg { spend_cents: number; clicks: number; impressions: number; conversions: number; conversion_value_cents: number; google_title: string | null; }
interface SalesAgg { orders: number; revenue_cents: number; title: string | null; image_url: string | null; product_id: string | null; }

// ── Cœur pur des produits (testable) ─────────────────────────────
export function computeCampaignProducts(input: {
  productItemRows: Array<{ item_id: string; product_title: string | null; cost_cents: number; clicks: number; impressions: number; conversions: number; conversion_value_cents: number }>;
  matchedOrders: Array<{ line_items: Array<{ product_id?: string | null; title?: string | null; quantity?: number | null; price?: number | null; total_discount?: number | null }> }>;
  index: ProductIndex;
}): { active: CampaignProductRowOut[]; inactive: CampaignProductRowOut[] } {
  const ads = new Map<string, AdsAgg>();
  for (const r of input.productItemRows) {
    const ref = mapItemToProduct(r.item_id, input.index);
    const key = ref ? ref.shopify_product_id : `unknown:${r.item_id}`;
    const a = ads.get(key) ?? { spend_cents: 0, clicks: 0, impressions: 0, conversions: 0, conversion_value_cents: 0, google_title: r.product_title };
    a.spend_cents += r.cost_cents;
    a.clicks += r.clicks;
    a.impressions += r.impressions;
    a.conversions = Math.round((a.conversions + r.conversions) * 100) / 100;
    a.conversion_value_cents += r.conversion_value_cents;
    if (!a.google_title && r.product_title) a.google_title = r.product_title;
    ads.set(key, a);
  }

  const sales = new Map<string, SalesAgg>();
  for (const o of input.matchedOrders) {
    for (const li of o.line_items ?? []) {
      const qty = Number(li.quantity ?? 0);
      if (qty <= 0) continue;
      const pid = li.product_id ?? null;
      const ref = pid ? input.index.byProductId.get(pid) : null;
      const key = pid ?? `title:${li.title ?? "?"}`;
      const lineCents = Math.max(0, Math.round((Number(li.price ?? 0) * qty - Number(li.total_discount ?? 0)) * 100));
      const s = sales.get(key) ?? { orders: 0, revenue_cents: 0, title: ref?.title ?? li.title?.trim() ?? null, image_url: ref?.image_url ?? null, product_id: pid };
      s.orders += 1;
      s.revenue_cents += lineCents;
      sales.set(key, s);
    }
  }

  const keys = new Set<string>([...ads.keys(), ...sales.keys()]);
  const rows: CampaignProductRowOut[] = [];
  for (const key of keys) {
    const a = ads.get(key);
    const s = sales.get(key);
    const ref = key.startsWith("unknown:") || key.startsWith("title:") ? null : input.index.byProductId.get(key.replace(/^title:/, ""));
    const unknown = key.startsWith("unknown:");
    const title = ref?.title
      ?? s?.title
      ?? a?.google_title
      ?? (unknown ? `Produit inconnu (${key.slice("unknown:".length)})` : "(produit sans titre)");
    const hasDelivery = (a?.spend_cents ?? 0) > 0 || (a?.impressions ?? 0) > 0;
    const jestlyOrders = s?.orders ?? 0;
    const jestlyRevenue = s?.revenue_cents ?? 0;
    const spend = a?.spend_cents ?? 0;
    const googleConv = a?.conversions ?? 0;
    rows.push({
      key,
      product_id: ref?.shopify_product_id ?? s?.product_id ?? null,
      title,
      image_url: ref?.image_url ?? s?.image_url ?? null,
      unknown_item: unknown,
      status_in_feed: hasDelivery ? "active" : "inactive",
      spend_cents: spend,
      clicks: a?.clicks ?? 0,
      impressions: a?.impressions ?? 0,
      google_conversions: googleConv,
      jestly_orders: jestlyOrders,
      jestly_revenue_cents: jestlyRevenue,
      roas_jestly: computeRoas(jestlyRevenue, spend),
      // Brûle du budget sans AUCUNE conversion (Google ni Jestly) → exclure.
      candidate_exclude: spend > 0 && googleConv === 0 && jestlyOrders === 0,
      // Ne diffuse plus mais a vendu via la campagne → réactiver.
      candidate_reactivate: !hasDelivery && jestlyOrders > 0,
    });
  }

  const active = rows.filter((r) => r.status_in_feed === "active").sort((a, b) => {
    if (a.candidate_exclude !== b.candidate_exclude) return a.candidate_exclude ? -1 : 1;
    return b.spend_cents - a.spend_cents || b.jestly_revenue_cents - a.jestly_revenue_cents;
  });
  const inactive = rows.filter((r) => r.status_in_feed === "inactive").sort((a, b) => {
    if (a.candidate_reactivate !== b.candidate_reactivate) return a.candidate_reactivate ? -1 : 1;
    return b.jestly_revenue_cents - a.jestly_revenue_cents;
  });
  return { active, inactive };
}

/** Série journalière + ROAS glissant 7 j (SUM/SUM sur la fenêtre). */
export function computeCampaignTimeline(
  days: string[],
  spendByDay: Map<string, number>,
  revenueByDay: Map<string, number>,
): CampaignDailyPoint[] {
  return days.map((date, i) => {
    let winSpend = 0, winRev = 0;
    for (let j = Math.max(0, i - 6); j <= i; j++) {
      winSpend += spendByDay.get(days[j]) ?? 0;
      winRev += revenueByDay.get(days[j]) ?? 0;
    }
    return {
      date,
      spend_cents: spendByDay.get(date) ?? 0,
      jestly_revenue_cents: revenueByDay.get(date) ?? 0,
      rolling_roas: computeRoas(winRev, winSpend),
    };
  });
}

// ── Chargement DB ────────────────────────────────────────────────
export async function getCampaignDetail(userId: string, campaignId: string, range: DateRange, requestedIntegrationId?: string | null): Promise<CampaignDetail | null> {
  const supabase = createAdminClient();
  const { getBlendedBoard } = await import("@/lib/costs/blended");

  // GARDE-FOU MULTI-TENANT + multi-boutiques : scoper par l'intégration ciblée
  // (sélecteur) ou la principale. Toutes les tables gads/shopify filtrées dessus.
  const integrationId = await resolveActiveShopifyIntegrationId(userId, requestedIntegrationId);
  const integId = integrationId ?? "";

  const [{ orders, manualByOrder, pixelByOrder }, allCampaigns, dailyRows, productRows, budgetRows, products, board] = await Promise.all([
    loadOrdersAndManual(userId, range, integId),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("gads_campaigns") as any)
      .select("campaign_id, name, status, channel_type, start_date, end_date, current_budget_cents, bidding_strategy, last_seen_at")
      .eq("integration_id", integId)
      .then(({ data }: { data: CampaignMeta[] | null }) => data ?? []),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("gads_campaign_daily") as any)
      .select("date, cost_cents, clicks, impressions, conversions, conversion_value_cents")
      .eq("integration_id", integId).eq("campaign_id", campaignId)
      .gte("date", range.from).lte("date", range.to)
      .then(({ data }: { data: Array<{ date: string; cost_cents: number; clicks: number; impressions: number; conversions: number; conversion_value_cents: number }> | null }) => data ?? []),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("gads_campaign_products") as any)
      .select("item_id, product_title, cost_cents, clicks, impressions, conversions, conversion_value_cents")
      .eq("integration_id", integId).eq("campaign_id", campaignId)
      .gte("date", range.from).lte("date", range.to)
      .then(({ data }: { data: Array<{ item_id: string; product_title: string | null; cost_cents: number; clicks: number; impressions: number; conversions: number; conversion_value_cents: number }> | null }) => data ?? []),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("gads_budget_history") as any)
      .select("budget_cents, observed_at")
      .eq("integration_id", integId).eq("campaign_id", campaignId)
      .order("observed_at", { ascending: true })
      .then(({ data }: { data: BudgetPoint[] | null }) => data ?? []),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    integrationId
      ? (supabase.from("shopify_products") as any)
          .select("shopify_product_id, title, featured_image_url, price_min, variants")
          .eq("integration_id", integrationId)
          .then(({ data }: { data: Parameters<typeof buildProductIndex>[0] | null }) => data ?? [])
      : Promise.resolve([]),
    getBlendedBoard(userId, range, undefined, { integrationId: integId || null }).catch(() => null),
  ]);

  const metas = allCampaigns as CampaignMeta[];
  const meta = metas.find((c) => c.campaign_id === campaignId);
  if (!meta) return null;

  // Résolveur nom/id → campaign_id (identique à la liste).
  const idSet = new Set(metas.map((c) => c.campaign_id));
  const byNormName = new Map<string, string>();
  for (const c of metas) {
    const norm = normalizeCampaignName(c.name);
    if (!byNormName.has(norm)) byNormName.set(norm, c.campaign_id);
  }
  const resolveCampaignId = (utm: string | null): string | null => {
    if (!utm) return null;
    const raw = utm.trim();
    if (idSet.has(raw)) return raw;
    return byNormName.get(normalizeCampaignName(raw)) ?? null;
  };

  // Commandes résolues Google Ads ET rattachées à CETTE campagne.
  const matched: DbOrderRow[] = [];
  const revenueByDay = new Map<string, number>();
  for (const o of orders as DbOrderRow[]) {
    const m = manualByOrder.get(o.id);
    const resolved = resolveUnifiedChannel({
      measured: deriveMeasuredChannel(o),
      pixel: pixelByOrder.get(o.id) ?? null,
      manual: m ? { channel: m.channel } : null,
    });
    if (resolved !== "google_ads") continue;
    // Résolution CAMPAGNE : utm_campaign mesuré prioritaire, sinon rattachement
    // manuel à une campagne (couche campagne, même règle que la liste).
    const measuredCid = resolveCampaignId(o.utm_campaign);
    const manualCid = m?.campaign_id && idSet.has(m.campaign_id) ? m.campaign_id : null;
    if ((measuredCid ?? manualCid) !== campaignId) continue;
    matched.push(o);
    const day = parisDay(o.created_at);
    revenueByDay.set(day, (revenueByDay.get(day) ?? 0) + Math.round((o.total_price ?? 0) * 100));
  }

  // Agrégats Google période + sparkline dépense.
  let spend = 0, clicks = 0, impressions = 0, googleConv = 0, googleConvValue = 0;
  const spendByDay = new Map<string, number>();
  for (const d of dailyRows as Array<{ date: string; cost_cents: number; clicks: number; impressions: number; conversions: number; conversion_value_cents: number }>) {
    spend += d.cost_cents; clicks += d.clicks; impressions += d.impressions;
    googleConv = Math.round((googleConv + d.conversions) * 100) / 100;
    googleConvValue += d.conversion_value_cents;
    spendByDay.set(d.date, (spendByDay.get(d.date) ?? 0) + d.cost_cents);
  }

  const days: string[] = [];
  for (let t = new Date(`${range.from}T00:00:00Z`).getTime(); t <= new Date(`${range.to}T00:00:00Z`).getTime(); t += 86_400_000) {
    days.push(new Date(t).toISOString().slice(0, 10));
  }

  // Le détail reste sur les commandes réelles rattachées à la campagne ; les
  // overrides manuels globaux (gads_manual_overrides) sont comptés dans la liste.
  const jestlyRevenue = matched.reduce((s, o) => s + Math.round((o.total_price ?? 0) * 100), 0);
  const jestlyOrders = matched.length;
  const roasJestly = computeRoas(jestlyRevenue, spend);
  const beRoas = board?.current?.be_roas ?? null;

  const index = buildProductIndex(products as Parameters<typeof buildProductIndex>[0]);
  const { active, inactive } = computeCampaignProducts({
    productItemRows: productRows as Parameters<typeof computeCampaignProducts>[0]["productItemRows"],
    matchedOrders: matched.map((o) => ({ line_items: o.line_items ?? [] })),
    index,
  });

  const budgetHistory = budgetRows as BudgetPoint[];

  return {
    campaign_id: meta.campaign_id,
    name: meta.name,
    status: meta.status,
    status_display: deriveCampaignStatus(meta, todayParis()),
    channel_type: meta.channel_type,
    start_date: meta.start_date,
    end_date: meta.end_date,
    current_budget_cents: meta.current_budget_cents,
    bidding_strategy: meta.bidding_strategy,
    spend_cents: spend,
    clicks, impressions,
    ctr: impressions > 0 ? Math.round((clicks / impressions) * 100000) / 1000 : null,
    avg_cpc_cents: clicks > 0 ? Math.round(spend / clicks) : null,
    google_conversions: googleConv,
    google_conversion_value_cents: googleConvValue,
    roas_google: computeRoas(googleConvValue, spend),
    jestly_orders: jestlyOrders,
    jestly_revenue_cents: jestlyRevenue,
    roas_jestly: roasJestly,
    cpa_cents: jestlyOrders > 0 && spend > 0 ? Math.round(spend / jestlyOrders) : null,
    be_roas: beRoas,
    profitable: beRoas != null && roasJestly != null ? roasJestly >= beRoas : null,
    sample_small: jestlyOrders < SMALL_SAMPLE_THRESHOLD,
    net_profit_cents: null,
    timeline: computeCampaignTimeline(days, spendByDay, revenueByDay),
    budget_history: budgetHistory,
    budget_archive_since: budgetHistory.length > 0 ? budgetHistory[0].observed_at : null,
    products_active: active,
    products_inactive: inactive,
  };
}
