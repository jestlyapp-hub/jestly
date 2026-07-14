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
import { computeRoas, getEcomSettings } from "@/lib/ads/roas-engine";
import { normalizeCampaignName } from "@/lib/ads/utm-parser";
import { parisDay, todayParis } from "@/lib/paris-time";
import type { DateRange } from "@/lib/ads/types";
import { computeBlendedStats, computeOrdersCogs, resolveUnitCost, type ProductCostRow } from "@/lib/costs/engine";
import { resolveUnifiedChannel, deriveMeasuredChannel } from "./channels";
import { loadOrdersAndManual, resolveActiveShopifyIntegrationId, SMALL_SAMPLE_THRESHOLD, type DbOrderRow } from "./attribution-aggregator";
import { buildProductIndex, mapItemToProduct, type ProductIndex } from "./product-mapping";
import {
  deriveCampaignStatus, type CampaignMeta, type DisplayCampaignStatus,
} from "./campaign-analytics";
import type { MetricValue } from "./dashboard-metrics";
import type { Insight } from "./insights";
import {
  computeCampaignTrend, computeCampaignScore, computeBudgetRecommendation, buildCampaignMetrics,
  type CampaignAggregate, type CampaignTrend, type CampaignScore, type BudgetRecommendation,
} from "./campaign-analysis";
import { buildCampaignInsights } from "./campaign-insights";

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
  /** Marge du produit sur la campagne (CA attribué − COGS) — null si coût non renseigné. */
  margin_cents: number | null;
  candidate_exclude: boolean;
  candidate_reactivate: boolean;
}

export interface CampaignDailyPoint {
  date: string;
  spend_cents: number;
  jestly_revenue_cents: number;
  /** ROAS Jestly glissant 7 j (SUM/SUM), null si dépense nulle. */
  rolling_roas: number | null;
  /** Profit net de la campagne ce jour (CA − COGS − frais − dépense), null si coûts non renseignés. */
  net_profit_cents: number | null;
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
  aov_cents: number | null;
  be_roas: number | null;
  profitable: boolean | null;
  sample_small: boolean;
  net_profit_cents: number | null;
  costs_configured: boolean;
  // ── Contexte BOUTIQUE (discret, distinct du verdict campagne) ──
  shop_status: "profitable" | "unprofitable" | "insufficient_data";
  shop_mer: number | null;
  shop_be_roas: number | null;
  shop_costs_configured: boolean;
  /** ROAS Jestly moyen de la boutique sur le canal Google (comparaison). */
  shop_roas_jestly: number | null;
  shop_total_spend_cents: number;
  shop_revenue_cents: number;
  shop_orders: number;
  /** Part de cette campagne dans le budget / les ventes de la boutique. */
  budget_share: number | null;
  sales_share: number | null;
  // ── Analyses ──
  metrics: Record<string, MetricValue>;
  trend: CampaignTrend;
  score: CampaignScore;
  budget_recommendation: BudgetRecommendation;
  insights: Insight[];
  // Séries & archives
  timeline: CampaignDailyPoint[];
  budget_history: BudgetPoint[];
  budget_archive_since: string | null;
  // Produits
  products_active: CampaignProductRowOut[];
  products_inactive: CampaignProductRowOut[];
}

interface AdsAgg { spend_cents: number; clicks: number; impressions: number; conversions: number; conversion_value_cents: number; google_title: string | null; }
interface SalesAgg { orders: number; revenue_cents: number; title: string | null; image_url: string | null; product_id: string | null; units: number; cogs_cents: number; covered_units: number }

// ── Cœur pur des produits (testable) ─────────────────────────────
export function computeCampaignProducts(input: {
  productItemRows: Array<{ item_id: string; product_title: string | null; cost_cents: number; clicks: number; impressions: number; conversions: number; conversion_value_cents: number }>;
  matchedOrders: Array<{ created_at?: string; line_items: Array<{ product_id?: string | null; title?: string | null; quantity?: number | null; price?: number | null; total_discount?: number | null }> }>;
  index: ProductIndex;
  /** Coûts produit versionnés (COGS) — pour la marge par produit. Optionnel. */
  costs?: ProductCostRow[];
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

  const costs = input.costs;
  const sales = new Map<string, SalesAgg>();
  for (const o of input.matchedOrders) {
    for (const li of o.line_items ?? []) {
      const qty = Number(li.quantity ?? 0);
      if (qty <= 0) continue;
      const pid = li.product_id ?? null;
      const ref = pid ? input.index.byProductId.get(pid) : null;
      const key = pid ?? `title:${li.title ?? "?"}`;
      const lineCents = Math.max(0, Math.round((Number(li.price ?? 0) * qty - Number(li.total_discount ?? 0)) * 100));
      const s = sales.get(key) ?? { orders: 0, revenue_cents: 0, title: ref?.title ?? li.title?.trim() ?? null, image_url: ref?.image_url ?? null, product_id: pid, units: 0, cogs_cents: 0, covered_units: 0 };
      s.orders += 1;
      s.revenue_cents += lineCents;
      s.units += qty;
      // COGS versionné (marge honnête) : ne compte que si le coût est renseigné
      // pour la date de la commande ; sinon on marque des unités non couvertes.
      if (costs && o.created_at) {
        const unit = resolveUnitCost(costs, pid, o.created_at);
        if (unit != null) { s.cogs_cents += unit * qty; s.covered_units += qty; }
      }
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
    // Marge = CA attribué − COGS, uniquement si TOUTES les unités vendues ont un
    // coût renseigné (sinon « non disponible » : jamais une marge optimiste).
    const marginCents = costs && s && s.units > 0 && s.covered_units === s.units
      ? jestlyRevenue - s.cogs_cents
      : null;
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
      margin_cents: marginCents,
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

/**
 * Série journalière + ROAS glissant 7 j (SUM/SUM sur la fenêtre). Le profit net
 * du jour (optionnel) = marge des commandes du jour (CA − COGS − frais) − dépense
 * du jour ; null si coûts non renseignés (jamais un profit optimiste inventé).
 */
export function computeCampaignTimeline(
  days: string[],
  spendByDay: Map<string, number>,
  revenueByDay: Map<string, number>,
  opts?: { marginByDay: Map<string, number>; costsConfigured: boolean },
): CampaignDailyPoint[] {
  return days.map((date, i) => {
    let winSpend = 0, winRev = 0;
    for (let j = Math.max(0, i - 6); j <= i; j++) {
      winSpend += spendByDay.get(days[j]) ?? 0;
      winRev += revenueByDay.get(days[j]) ?? 0;
    }
    const spend = spendByDay.get(date) ?? 0;
    return {
      date,
      spend_cents: spend,
      jestly_revenue_cents: revenueByDay.get(date) ?? 0,
      rolling_roas: computeRoas(winRev, winSpend),
      net_profit_cents: opts?.costsConfigured ? (opts.marginByDay.get(date) ?? 0) - spend : null,
    };
  });
}

// ── Chargement DB ────────────────────────────────────────────────
interface DailyRow { date: string; cost_cents: number; clicks: number; impressions: number; conversions: number; conversion_value_cents: number }

/** Période précédente de même longueur, se terminant la veille de `range.from`. */
function previousRangeOf(range: DateRange): DateRange {
  const start = new Date(`${range.from}T00:00:00Z`).getTime();
  const end = new Date(`${range.to}T00:00:00Z`).getTime();
  const lenDays = Math.round((end - start) / 86_400_000) + 1;
  return {
    from: new Date(start - lenDays * 86_400_000).toISOString().slice(0, 10),
    to: new Date(start - 86_400_000).toISOString().slice(0, 10),
  };
}

export async function getCampaignDetail(userId: string, campaignId: string, range: DateRange, requestedIntegrationId?: string | null): Promise<CampaignDetail | null> {
  const supabase = createAdminClient();
  const { getBlendedBoard } = await import("@/lib/costs/blended");

  // GARDE-FOU MULTI-TENANT + multi-boutiques : scoper par l'intégration ciblée
  // (sélecteur) ou la principale. Toutes les tables gads/shopify filtrées dessus.
  const integrationId = await resolveActiveShopifyIntegrationId(userId, requestedIntegrationId);
  const integId = integrationId ?? "";

  // Période précédente pour les deltas KPI. Commandes & daily chargées sur l'UNION
  // [prev.from … range.to] en une passe, puis partitionnées par jour de Paris.
  const prev = previousRangeOf(range);
  const unionRange: DateRange = { from: prev.from, to: range.to };

  const [{ orders, manualByOrder, pixelByOrder }, allCampaigns, dailyRows, productRows, budgetRows, products, board, costRows, settings] = await Promise.all([
    loadOrdersAndManual(userId, unionRange, integId),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("gads_campaigns") as any)
      .select("campaign_id, name, status, channel_type, start_date, end_date, current_budget_cents, bidding_strategy, last_seen_at")
      .eq("integration_id", integId)
      .then(({ data }: { data: CampaignMeta[] | null }) => data ?? []),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("gads_campaign_daily") as any)
      .select("date, cost_cents, clicks, impressions, conversions, conversion_value_cents")
      .eq("integration_id", integId).eq("campaign_id", campaignId)
      .gte("date", unionRange.from).lte("date", unionRange.to)
      .then(({ data }: { data: DailyRow[] | null }) => data ?? []),
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
    // Coûts produit versionnés (COGS) — net profit campagne + marge produit.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("ecom_product_costs") as any)
      .select("shopify_product_id, unit_cost_cents, effective_from")
      .eq("user_id", userId)
      .then(({ data }: { data: ProductCostRow[] | null }) => data ?? []),
    getEcomSettings(userId),
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

  const inRange = (day: string, r: DateRange) => day >= r.from && day <= r.to;

  // ── Résolution canal + campagne, partitionnée courant / précédent ──
  const matchedCur: DbOrderRow[] = [];
  const matchedPrev: DbOrderRow[] = [];
  const revenueByDay = new Map<string, number>();
  // CA Google attribué de la BOUTIQUE (courant) → ROAS Jestly moyen boutique.
  let shopGoogleRevenueCur = 0;
  for (const o of orders as DbOrderRow[]) {
    const m = manualByOrder.get(o.id);
    const resolved = resolveUnifiedChannel({
      measured: deriveMeasuredChannel(o),
      pixel: pixelByOrder.get(o.id) ?? null,
      manual: m ? { channel: m.channel } : null,
    });
    if (resolved !== "google_ads") continue;
    const day = parisDay(o.created_at);
    const cents = Math.round((o.total_price ?? 0) * 100);
    if (inRange(day, range)) shopGoogleRevenueCur += cents;
    // Résolution CAMPAGNE : utm_campaign mesuré prioritaire, sinon rattachement manuel.
    const measuredCid = resolveCampaignId(o.utm_campaign);
    const manualCid = m?.campaign_id && idSet.has(m.campaign_id) ? m.campaign_id : null;
    if ((measuredCid ?? manualCid) !== campaignId) continue;
    if (inRange(day, range)) {
      matchedCur.push(o);
      revenueByDay.set(day, (revenueByDay.get(day) ?? 0) + cents);
    } else if (inRange(day, prev)) {
      matchedPrev.push(o);
    }
  }

  // ── Métriques Google, partitionnées + sparkline dépense (courant) ──
  const dailyCur: DailyRow[] = [], dailyPrev: DailyRow[] = [];
  const spendByDay = new Map<string, number>();
  for (const d of dailyRows as DailyRow[]) {
    if (inRange(d.date, range)) { dailyCur.push(d); spendByDay.set(d.date, (spendByDay.get(d.date) ?? 0) + d.cost_cents); }
    else if (inRange(d.date, prev)) dailyPrev.push(d);
  }

  const days: string[] = [];
  for (let t = new Date(`${range.from}T00:00:00Z`).getTime(); t <= new Date(`${range.to}T00:00:00Z`).getTime(); t += 86_400_000) {
    days.push(new Date(t).toISOString().slice(0, 10));
  }

  // ── Agrégat KPI campagne (réutilisable courant / précédent) ──
  const fees = {
    shipping_cost_cents: settings.shipping_cost_cents ?? 0,
    payment_fee_percent: settings.payment_fee_percent ?? 0,
    payment_fee_fixed_cents: settings.payment_fee_fixed_cents ?? 0,
    packaging_cost_cents: settings.packaging_cost_cents ?? 0,
  };
  const noFirstOrder = new Map<string, string>();
  const aggregate = (matched: DbOrderRow[], daily: DailyRow[], r: DateRange): CampaignAggregate => {
    let spend = 0, clicks = 0, impressions = 0, conv = 0, convValue = 0;
    for (const d of daily) {
      spend += d.cost_cents; clicks += d.clicks; impressions += d.impressions;
      conv = Math.round((conv + d.conversions) * 100) / 100; convValue += d.conversion_value_cents;
    }
    const jRevenue = matched.reduce((s, o) => s + Math.round((o.total_price ?? 0) * 100), 0);
    const jOrders = matched.length;
    // Net profit campagne : moteur COGS existant, dépenses récurrentes EXCLUES
    // (non imputables à une campagne). null si coûts non renseignés.
    const stats = computeBlendedStats({
      orders: matched.map((o) => ({ total_cents: Math.round((o.total_price ?? 0) * 100), customer_id: o.customer_id ?? null, created_at: o.created_at, line_items: o.line_items ?? [] })),
      spend_cents: spend, costs: costRows as ProductCostRow[], fees, expenses: [], range: r, firstOrderAtByCustomer: noFirstOrder,
    });
    return {
      spend_cents: spend, clicks, impressions,
      ctr: impressions > 0 ? Math.round((clicks / impressions) * 100000) / 1000 : null,
      avg_cpc_cents: clicks > 0 ? Math.round(spend / clicks) : null,
      google_conversions: conv, google_conversion_value_cents: convValue,
      roas_google: computeRoas(convValue, spend),
      jestly_orders: jOrders, jestly_revenue_cents: jRevenue,
      roas_jestly: computeRoas(jRevenue, spend),
      cpa_cents: jOrders > 0 && spend > 0 ? Math.round(spend / jOrders) : null,
      aov_cents: jOrders > 0 ? Math.round(jRevenue / jOrders) : null,
      net_profit_cents: stats.net_profit_cents,
    };
  };

  const cur = aggregate(matchedCur, dailyCur, range);
  const prevAgg = aggregate(matchedPrev, dailyPrev, prev);

  const beRoas = board?.current?.be_roas ?? null;
  const roasJestly = cur.roas_jestly;
  const sampleSmall = cur.jestly_orders < SMALL_SAMPLE_THRESHOLD;

  // ── Contexte boutique (discret) + parts ──
  const shopTotalSpend = board?.current?.spend_cents ?? 0;
  const shopRevenue = board?.current?.revenue_cents ?? 0;
  const shopOrders = board?.current?.orders_count ?? 0;
  const shopRoasJestly = computeRoas(shopGoogleRevenueCur, shopTotalSpend);

  // ── Produits (avec marge si coûts saisis) ──
  const index = buildProductIndex(products as Parameters<typeof buildProductIndex>[0]);
  const { active, inactive } = computeCampaignProducts({
    productItemRows: productRows as Parameters<typeof computeCampaignProducts>[0]["productItemRows"],
    matchedOrders: matchedCur.map((o) => ({ created_at: o.created_at, line_items: o.line_items ?? [] })),
    index,
    costs: costRows as ProductCostRow[],
  });

  // Marge variable par jour (CA − COGS − frais par commande, hors dépense) pour
  // le profit net journalier du graphe. Même base que le net profit période.
  const costsConfigured = board?.current?.costs_configured ?? false;
  const marginByDay = new Map<string, number>();
  if (costsConfigured) {
    for (const o of matchedCur) {
      const day = parisDay(o.created_at);
      const rev = Math.round((o.total_price ?? 0) * 100);
      const cogs = computeOrdersCogs([{ total_cents: rev, customer_id: o.customer_id ?? null, created_at: o.created_at, line_items: o.line_items ?? [] }], costRows as ProductCostRow[]).cogs_cents;
      const orderFees = fees.shipping_cost_cents + fees.payment_fee_fixed_cents + fees.packaging_cost_cents + Math.round(rev * (fees.payment_fee_percent / 100));
      marginByDay.set(day, (marginByDay.get(day) ?? 0) + (rev - cogs - orderFees));
    }
  }

  const timeline = computeCampaignTimeline(days, spendByDay, revenueByDay, { marginByDay, costsConfigured });
  const trend = computeCampaignTrend(timeline);
  const score = computeCampaignScore({ roas_jestly: roasJestly, be_roas: beRoas, jestly_orders: cur.jestly_orders, points: timeline });
  const budgetRecommendation = computeBudgetRecommendation({
    roas_jestly: roasJestly, be_roas: beRoas, spend_cents: cur.spend_cents, jestly_orders: cur.jestly_orders, sample_small: sampleSmall,
  });
  const metrics = buildCampaignMetrics(cur, prevAgg, timeline, {
    shop_total_spend_cents: shopTotalSpend, shop_revenue_cents: shopRevenue, shop_orders: shopOrders,
  });
  const insights = buildCampaignInsights({
    roas_jestly: roasJestly, be_roas: beRoas, spend_cents: cur.spend_cents,
    products_active: active, products_inactive: inactive, trend, recommendation: budgetRecommendation,
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
    spend_cents: cur.spend_cents,
    clicks: cur.clicks, impressions: cur.impressions,
    ctr: cur.ctr,
    avg_cpc_cents: cur.avg_cpc_cents,
    google_conversions: cur.google_conversions,
    google_conversion_value_cents: cur.google_conversion_value_cents,
    roas_google: cur.roas_google,
    jestly_orders: cur.jestly_orders,
    jestly_revenue_cents: cur.jestly_revenue_cents,
    roas_jestly: roasJestly,
    cpa_cents: cur.cpa_cents,
    aov_cents: cur.aov_cents,
    be_roas: beRoas,
    profitable: beRoas != null && roasJestly != null ? roasJestly >= beRoas : null,
    sample_small: sampleSmall,
    net_profit_cents: cur.net_profit_cents,
    costs_configured: board?.current?.costs_configured ?? false,
    shop_status: board?.current?.status ?? "insufficient_data",
    shop_mer: board?.current?.mer ?? null,
    shop_be_roas: beRoas,
    shop_costs_configured: board?.current?.costs_configured ?? false,
    shop_roas_jestly: shopRoasJestly,
    shop_total_spend_cents: shopTotalSpend,
    shop_revenue_cents: shopRevenue,
    shop_orders: shopOrders,
    budget_share: shopTotalSpend > 0 ? cur.spend_cents / shopTotalSpend : null,
    sales_share: shopRevenue > 0 ? cur.jestly_revenue_cents / shopRevenue : null,
    metrics,
    trend,
    score,
    budget_recommendation: budgetRecommendation,
    insights,
    timeline,
    budget_history: budgetHistory,
    budget_archive_since: budgetHistory.length > 0 ? budgetHistory[0].observed_at : null,
    products_active: active,
    products_inactive: inactive,
  };
}
