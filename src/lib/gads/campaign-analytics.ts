/**
 * Campaign Analytics — le grain campagne de l'onglet « Campagnes ».
 *
 * Croise, PAR CAMPAGNE Google Ads :
 *  - la dépense + métriques Google (gads_campaign_daily, SUM/SUM période) ;
 *  - le CA Shopify RÉSOLU à cette campagne via la résolution unifiée
 *    (natif > pixel > manuel), rattaché par utm_campaign ↔ nom/id de campagne ;
 *  - la couche manuelle campagne (gads_manual_overrides.campaign_name).
 *
 * Deux ROAS jamais fondus, comme partout dans le module :
 *  - ROAS Google (déclaré) : conversion_value Google ÷ dépense.
 *  - ROAS Jestly (croisé) : CA Shopify réel attribué à la campagne ÷ dépense.
 *
 * Garde-fou d'honnêteté : le rattachement commande → campagne dépend d'un
 * utm_campaign exploitable. Le CA Google Ads qui ne peut être rattaché à AUCUNE
 * campagne précise (clic gclid sans utm_campaign) est compté à part
 * (`attribution_coverage.unmatched_cents`) — jamais réparti arbitrairement.
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { computeRoas } from "@/lib/ads/roas-engine";
import { normalizeCampaignName } from "@/lib/ads/utm-parser";
import { todayParis } from "@/lib/paris-time";
import type { DateRange } from "@/lib/ads/types";
import { resolveUnifiedChannel, deriveMeasuredChannel, type Channel } from "./channels";
import { loadOrdersAndManual, SMALL_SAMPLE_THRESHOLD, type PixelResolution, type DbOrderRow } from "./attribution-aggregator";

export type CampaignStatusFilter = "all" | "active" | "paused" | "ended";
export type RentabilityFilter = "all" | "profitable" | "loss";
/** Statut d'affichage dérivé (chip coloré), constant dans l'UI. */
export type DisplayCampaignStatus = "active" | "paused" | "ended";

export interface CampaignMeta {
  campaign_id: string;
  name: string;
  status: string;
  channel_type: string | null;
  start_date: string | null;
  end_date: string | null;
  current_budget_cents: number | null;
  bidding_strategy: string | null;
  last_seen_at: string;
}

export interface CampaignDailyMetric {
  campaign_id: string;
  date: string;
  cost_cents: number;
  clicks: number;
  impressions: number;
  conversions: number;
  conversion_value_cents: number;
}

export interface ManualOverrideRow {
  campaign_name: string | null;
  revenue_cents: number;
  orders_count: number;
}

export interface CampaignRow {
  campaign_id: string;
  name: string;
  status: string;
  status_display: DisplayCampaignStatus;
  channel_type: string | null;
  start_date: string | null;
  end_date: string | null;
  current_budget_cents: number | null;
  bidding_strategy: string | null;
  // ── Google (SUM/SUM période) ──
  spend_cents: number;
  clicks: number;
  impressions: number;
  ctr: number | null;
  avg_cpc_cents: number | null;
  google_conversions: number;
  google_conversion_value_cents: number;
  roas_google: number | null;
  // ── Jestly (résolution unifiée + rattachement campagne) ──
  jestly_orders: number;
  /** CA total attribué à la campagne = mesuré (utm) + rattachements manuels + overrides. */
  jestly_revenue_cents: number;
  /** CA rattaché AUTOMATIQUEMENT (utm_campaign mesuré) — jamais fondu avec le manuel. */
  jestly_measured_revenue_cents: number;
  /** CA rattaché À LA MAIN (rattachement campagne par commande + overrides campagne). */
  jestly_manual_revenue_cents: number;
  roas_jestly: number | null;
  /** ROAS Jestly « mesuré seul » (utm), sans les rattachements manuels. */
  roas_jestly_measured: number | null;
  cpa_cents: number | null;
  // ── Rentabilité ──
  profitable: boolean | null;
  sample_small: boolean;
  has_activity: boolean;
  /** Dépense journalière (cents), alignée sur `days` — pour la sparkline. */
  spend_by_day: number[];
}

export interface CampaignAnalytics {
  days: string[];
  rows: CampaignRow[];
  be_roas: number | null;
  totals: {
    spend_cents: number;
    jestly_revenue_cents: number;
    jestly_orders: number;
    google_conversion_value_cents: number;
    roas_jestly_blended: number | null;
    roas_google_blended: number | null;
  };
  /** Honnêteté sur le rattachement commande → campagne (au grain commande). */
  attribution_coverage: {
    google_revenue_cents: number;
    matched_to_campaign_cents: number;
    /** Dont rattaché automatiquement (utm_campaign mesuré). */
    matched_measured_cents: number;
    /** Dont rattaché à la main (rattachement campagne par commande). */
    matched_manual_cents: number;
    unmatched_cents: number;
  };
}

// ── Cœur pur (testable sans DB) ──────────────────────────────────
export interface CampaignOrderInput {
  created_at: string;
  total_cents: number;
  measured_channel: Exclude<Channel, "ghost"> | null;
  manual: { channel: Channel } | null;
  pixel: PixelResolution | null;
  utm_campaign: string | null;
  /** Rattachement manuel à une campagne (id Google) — couche campagne. */
  manual_campaign_id?: string | null;
}

/** Statut d'affichage : REMOVED ou fin passée → terminée ; sinon actif/pausé. */
export function deriveCampaignStatus(meta: { status: string; end_date: string | null }, today: string): DisplayCampaignStatus {
  if (meta.status === "REMOVED") return "ended";
  if (meta.end_date && meta.end_date < today) return "ended";
  if (meta.status === "PAUSED") return "paused";
  return "active";
}

function emptyRow(meta: CampaignMeta, today: string, dayCount: number): CampaignRow {
  return {
    campaign_id: meta.campaign_id,
    name: meta.name,
    status: meta.status,
    status_display: deriveCampaignStatus(meta, today),
    channel_type: meta.channel_type,
    start_date: meta.start_date,
    end_date: meta.end_date,
    current_budget_cents: meta.current_budget_cents,
    bidding_strategy: meta.bidding_strategy,
    spend_cents: 0, clicks: 0, impressions: 0, ctr: null, avg_cpc_cents: null,
    google_conversions: 0, google_conversion_value_cents: 0, roas_google: null,
    jestly_orders: 0, jestly_revenue_cents: 0, jestly_measured_revenue_cents: 0, jestly_manual_revenue_cents: 0,
    roas_jestly: null, roas_jestly_measured: null, cpa_cents: null, profitable: null, sample_small: true,
    has_activity: false, spend_by_day: new Array(dayCount).fill(0),
  };
}

export function computeCampaignAnalytics(input: {
  campaigns: CampaignMeta[];
  daily: CampaignDailyMetric[];
  orders: CampaignOrderInput[];
  manualOverrides: ManualOverrideRow[];
  range: DateRange;
  be_roas: number | null;
  today: string;
}): CampaignAnalytics {
  const { campaigns, daily, orders, manualOverrides, range, be_roas, today } = input;

  const days: string[] = [];
  for (let t = new Date(`${range.from}T00:00:00Z`).getTime(); t <= new Date(`${range.to}T00:00:00Z`).getTime(); t += 86_400_000) {
    days.push(new Date(t).toISOString().slice(0, 10));
  }
  const dayIndex = new Map(days.map((d, i) => [d, i]));

  const rows = new Map<string, CampaignRow>();
  for (const meta of campaigns) rows.set(meta.campaign_id, emptyRow(meta, today, days.length));

  // ── Métriques Google (par jour → SUM période + sparkline) ──
  for (const d of daily) {
    const row = rows.get(d.campaign_id);
    if (!row) continue; // métrique sans méta campagne connue → ignorée proprement
    row.spend_cents += d.cost_cents;
    row.clicks += d.clicks;
    row.impressions += d.impressions;
    row.google_conversions = Math.round((row.google_conversions + d.conversions) * 100) / 100;
    row.google_conversion_value_cents += d.conversion_value_cents;
    const di = dayIndex.get(d.date);
    if (di != null) row.spend_by_day[di] += d.cost_cents;
  }

  // ── Résolveur nom/id de campagne → campaign_id ──
  // En cas de collision de nom normalisé, on préfère la campagne la plus
  // dépensière sur la période (même règle que le matcher Pinterest).
  const byNormName = new Map<string, string>();
  const spendById = new Map<string, number>();
  for (const row of rows.values()) spendById.set(row.campaign_id, row.spend_cents);
  const idSet = new Set(rows.keys());
  for (const meta of campaigns) {
    const norm = normalizeCampaignName(meta.name);
    const existing = byNormName.get(norm);
    if (!existing || (spendById.get(meta.campaign_id) ?? 0) > (spendById.get(existing) ?? 0)) {
      byNormName.set(norm, meta.campaign_id);
    }
  }
  const resolveCampaignId = (utmCampaign: string | null): string | null => {
    if (!utmCampaign) return null;
    const raw = utmCampaign.trim();
    if (idSet.has(raw)) return raw; // utm_campaign = campaign_id numérique
    return byNormName.get(normalizeCampaignName(raw)) ?? null;
  };

  // ── CA Jestly par campagne : résolution CAMPAGNE (parallèle à la résolution
  // de canal). Hiérarchie : 1) utm_campaign mesuré → 2) rattachement manuel à
  // une campagne (couche ajoutée) → sinon la vente reste au niveau canal.
  // On ne rattache une campagne QUE pour les commandes résolues Google Ads.
  let googleRevenue = 0, matchedRevenue = 0, measuredMatched = 0, manualMatched = 0;
  for (const o of orders) {
    const resolved = resolveUnifiedChannel({ measured: o.measured_channel, pixel: o.pixel, manual: o.manual });
    if (resolved !== "google_ads") continue;
    googleRevenue += o.total_cents;

    const measuredCid = resolveCampaignId(o.utm_campaign);
    const manualCid = o.manual_campaign_id && idSet.has(o.manual_campaign_id) ? o.manual_campaign_id : null;
    const cid = measuredCid ?? manualCid; // mesuré prioritaire, manuel en secours
    if (!cid || !rows.has(cid)) continue;

    const row = rows.get(cid)!;
    row.jestly_orders += 1;
    row.jestly_revenue_cents += o.total_cents;
    matchedRevenue += o.total_cents;
    if (measuredCid) {
      row.jestly_measured_revenue_cents += o.total_cents;
      measuredMatched += o.total_cents;
    } else {
      row.jestly_manual_revenue_cents += o.total_cents;
      manualMatched += o.total_cents;
    }
  }

  // ── Couche manuelle « bulk » (gads_manual_overrides.campaign_name) ──
  // CA crédité à la main à Google Ads, éventuellement tagué d'une campagne.
  // Non compté dans la couverture au grain commande (c'est un ajout de CA hors
  // commande), mais compté dans le CA/ROAS de la campagne comme manuel.
  for (const ov of manualOverrides) {
    const cid = resolveCampaignId(ov.campaign_name);
    if (cid && rows.has(cid)) {
      const row = rows.get(cid)!;
      row.jestly_orders += ov.orders_count;
      row.jestly_revenue_cents += ov.revenue_cents;
      row.jestly_manual_revenue_cents += ov.revenue_cents;
    }
  }

  // ── Finalisation ──
  for (const row of rows.values()) {
    row.ctr = row.impressions > 0 ? Math.round((row.clicks / row.impressions) * 100000) / 1000 : null; // %
    row.avg_cpc_cents = row.clicks > 0 ? Math.round(row.spend_cents / row.clicks) : null;
    row.roas_google = computeRoas(row.google_conversion_value_cents, row.spend_cents);
    row.roas_jestly = computeRoas(row.jestly_revenue_cents, row.spend_cents);
    row.roas_jestly_measured = computeRoas(row.jestly_measured_revenue_cents, row.spend_cents);
    row.cpa_cents = row.jestly_orders > 0 && row.spend_cents > 0 ? Math.round(row.spend_cents / row.jestly_orders) : null;
    row.sample_small = row.jestly_orders < SMALL_SAMPLE_THRESHOLD;
    row.has_activity = row.spend_cents > 0 || row.impressions > 0;
    // Rentable = ROAS Jestly ≥ seuil de rentabilité (BE-ROAS). Incalculable si
    // pas de seuil (coûts non renseignés) ou pas de dépense → null (jamais faux).
    row.profitable = be_roas != null && row.roas_jestly != null ? row.roas_jestly >= be_roas : null;
  }

  const sorted = [...rows.values()].sort((a, b) => {
    // Tri par défaut : ROAS Jestly décroissant (les plus rentables en haut),
    // campagnes sans dépense reléguées en bas.
    if (a.has_activity !== b.has_activity) return a.has_activity ? -1 : 1;
    const ra = a.roas_jestly ?? -1, rb = b.roas_jestly ?? -1;
    if (rb !== ra) return rb - ra;
    return b.spend_cents - a.spend_cents;
  });

  const totalSpend = sorted.reduce((s, r) => s + r.spend_cents, 0);
  const totalRevenue = sorted.reduce((s, r) => s + r.jestly_revenue_cents, 0);
  const totalConvValue = sorted.reduce((s, r) => s + r.google_conversion_value_cents, 0);
  const totalOrders = sorted.reduce((s, r) => s + r.jestly_orders, 0);

  return {
    days,
    rows: sorted,
    be_roas,
    totals: {
      spend_cents: totalSpend,
      jestly_revenue_cents: totalRevenue,
      jestly_orders: totalOrders,
      google_conversion_value_cents: totalConvValue,
      roas_jestly_blended: computeRoas(totalRevenue, totalSpend),
      roas_google_blended: computeRoas(totalConvValue, totalSpend),
    },
    attribution_coverage: {
      google_revenue_cents: googleRevenue,
      matched_to_campaign_cents: matchedRevenue,
      matched_measured_cents: measuredMatched,
      matched_manual_cents: manualMatched,
      unmatched_cents: Math.max(0, googleRevenue - matchedRevenue),
    },
  };
}

// ── Insights automatiques (règles, pas d'IA) ─────────────────────
export interface CampaignInsight {
  campaign_id: string;
  campaign_name: string;
  nature: "opportunity" | "loss" | "data";
  message: string;
  impact_cents: number | null;
}

/**
 * Insights déterministes sur les campagnes actives, dans l'esprit d'une Change
 * History croisée au CA réel. Trois règles simples et honnêtes :
 *  - opportunité : ROAS Jestly nettement au-dessus du seuil + volume → plus de budget ;
 *  - perte : campagne active sous le seuil de rentabilité → surveiller / réduire ;
 *  - donnée : dépense sans aucune conversion (Google ni Jestly) → exclure / mettre en pause.
 * `be_roas` null (coûts non renseignés) ⇒ pas de verdict rentabilité, seulement
 * le gaspillage pur (0 conversion) est signalé.
 */
export function computeCampaignInsights(a: CampaignAnalytics, limit = 6): CampaignInsight[] {
  const out: CampaignInsight[] = [];
  const be = a.be_roas;
  for (const r of a.rows) {
    // Insights actionnables : seules les campagnes actives (pas les terminées ni
    // en pause, sur lesquelles il n'y a rien à ajuster maintenant).
    if (r.status_display !== "active") continue;
    if (!r.has_activity) continue;

    // Gaspillage : dépense réelle, aucune conversion nulle part.
    if (r.spend_cents > 0 && r.jestly_orders === 0 && r.google_conversions === 0) {
      out.push({
        campaign_id: r.campaign_id, campaign_name: r.name, nature: "data",
        message: `« ${r.name} » : dépense sans aucune conversion (Google ni Jestly) — candidate à la mise en pause.`,
        impact_cents: r.spend_cents,
      });
      continue;
    }
    if (be == null || r.roas_jestly == null) continue;

    // Opportunité : bien au-dessus du seuil + volume significatif.
    if (r.roas_jestly >= be * 1.3 && r.jestly_orders >= SMALL_SAMPLE_THRESHOLD) {
      out.push({
        campaign_id: r.campaign_id, campaign_name: r.name, nature: "opportunity",
        message: `« ${r.name} » : ROAS Jestly ${r.roas_jestly.toFixed(2)}× > seuil ${be.toFixed(2)}× — candidate à plus de budget.`,
        impact_cents: null,
      });
      continue;
    }
    // Perte : campagne active sous le seuil de rentabilité.
    if (r.spend_cents > 0 && r.roas_jestly < be) {
      out.push({
        campaign_id: r.campaign_id, campaign_name: r.name, nature: "loss",
        message: `« ${r.name} » : ROAS Jestly ${r.roas_jestly.toFixed(2)}× < seuil ${be.toFixed(2)}× — active mais en perte, à surveiller.`,
        impact_cents: r.spend_cents,
      });
    }
  }
  // Pertes/gaspillage (à impact) d'abord, par montant décroissant ; puis opportunités.
  const weight = (n: CampaignInsight["nature"]) => (n === "opportunity" ? 1 : 0);
  return out
    .sort((x, y) => weight(x.nature) - weight(y.nature) || (y.impact_cents ?? 0) - (x.impact_cents ?? 0))
    .slice(0, limit);
}

// ── Chargement DB ────────────────────────────────────────────────
function toOrderInput(
  o: DbOrderRow,
  manual: { channel: Channel } | null,
  pixel: PixelResolution | null,
  manualCampaignId: string | null,
): CampaignOrderInput {
  return {
    created_at: o.created_at,
    total_cents: Math.round((o.total_price ?? 0) * 100),
    measured_channel: deriveMeasuredChannel(o),
    manual,
    pixel,
    utm_campaign: o.utm_campaign,
    manual_campaign_id: manualCampaignId,
  };
}

export async function getCampaignAnalytics(userId: string, range: DateRange): Promise<CampaignAnalytics> {
  const supabase = createAdminClient();
  const { getBlendedBoard } = await import("@/lib/costs/blended");

  const [{ orders, manualByOrder, pixelByOrder }, campaigns, daily, overrides, board] = await Promise.all([
    loadOrdersAndManual(userId, range),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("gads_campaigns") as any)
      .select("campaign_id, name, status, channel_type, start_date, end_date, current_budget_cents, bidding_strategy, last_seen_at")
      .eq("user_id", userId)
      .then(({ data }: { data: CampaignMeta[] | null }) => data ?? []),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("gads_campaign_daily") as any)
      .select("campaign_id, date, cost_cents, clicks, impressions, conversions, conversion_value_cents")
      .eq("user_id", userId)
      .gte("date", range.from)
      .lte("date", range.to)
      .then(({ data }: { data: CampaignDailyMetric[] | null }) => data ?? []),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("gads_manual_overrides") as any)
      .select("campaign_name, revenue_cents, orders_count")
      .eq("user_id", userId)
      .gte("date", range.from)
      .lte("date", range.to)
      .then(({ data }: { data: ManualOverrideRow[] | null }) => data ?? []),
    getBlendedBoard(userId, range).catch(() => null),
  ]);

  const orderInputs: CampaignOrderInput[] = (orders as DbOrderRow[]).map((o) => {
    const m = manualByOrder.get(o.id);
    return toOrderInput(o, m ? { channel: m.channel } : null, pixelByOrder.get(o.id) ?? null, m?.campaign_id ?? null);
  });

  return computeCampaignAnalytics({
    campaigns: campaigns as CampaignMeta[],
    daily: daily as CampaignDailyMetric[],
    orders: orderInputs,
    manualOverrides: overrides as ManualOverrideRow[],
    range,
    be_roas: board?.current?.be_roas ?? null,
    today: todayParis(),
  });
}

// ── Commandes Google Ads rattachables (sans campagne) ────────────
export interface AttachableOrder {
  order_id: string;
  name: string | null;
  created_at: string;
  total_cents: number;
  products: string[];
  /** Origine de la résolution canal Google Ads : mesuré / pixel / manuel. */
  origin: "measured" | "pixel" | "manual";
}

/**
 * Commandes résolues Google Ads (mesuré > pixel > manuel) qui ne sont rattachées
 * à AUCUNE campagne (ni utm_campaign exploitable, ni rattachement manuel) — les
 * candidates du panneau « Rattacher des ventes » du détail campagne.
 * Scopée par user_id (isolation) via loadOrdersAndManual.
 */
export async function getUnattributedGoogleOrders(userId: string, range: DateRange): Promise<AttachableOrder[]> {
  const supabase = createAdminClient();
  const [{ orders, manualByOrder, pixelByOrder }, campaigns] = await Promise.all([
    loadOrdersAndManual(userId, range),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("gads_campaigns") as any)
      .select("campaign_id, name")
      .eq("user_id", userId)
      .then(({ data }: { data: Array<{ campaign_id: string; name: string }> | null }) => data ?? []),
  ]);

  const idSet = new Set((campaigns as Array<{ campaign_id: string }>).map((c) => c.campaign_id));
  const byNormName = new Map<string, string>();
  for (const c of campaigns as Array<{ campaign_id: string; name: string }>) {
    const norm = normalizeCampaignName(c.name);
    if (!byNormName.has(norm)) byNormName.set(norm, c.campaign_id);
  }
  const resolveCid = (utm: string | null): string | null => {
    if (!utm) return null;
    const raw = utm.trim();
    if (idSet.has(raw)) return raw;
    return byNormName.get(normalizeCampaignName(raw)) ?? null;
  };

  const out: AttachableOrder[] = [];
  for (const o of orders as DbOrderRow[]) {
    const m = manualByOrder.get(o.id);
    const pixel = pixelByOrder.get(o.id) ?? null;
    const measured = deriveMeasuredChannel(o);
    const resolved = resolveUnifiedChannel({ measured, pixel, manual: m ? { channel: m.channel } : null });
    if (resolved !== "google_ads") continue;
    // Déjà rattachée à une campagne (mesurée ou manuelle) → pas candidate.
    if (resolveCid(o.utm_campaign)) continue;
    if (m?.campaign_id && idSet.has(m.campaign_id)) continue;

    const origin: AttachableOrder["origin"] = measured === "google_ads"
      ? "measured"
      : pixel?.resolved_source === "google_ads" ? "pixel" : "manual";
    out.push({
      order_id: o.id,
      name: o.name,
      created_at: o.created_at,
      total_cents: Math.round((o.total_price ?? 0) * 100),
      products: (o.line_items ?? []).map((li) => li.title?.trim() || "(produit sans titre)").slice(0, 4),
      origin,
    });
  }
  // Les plus récentes d'abord (les plus faciles à qualifier de mémoire).
  return out.sort((a, b) => b.created_at.localeCompare(a.created_at));
}
