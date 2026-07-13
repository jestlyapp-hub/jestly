/**
 * Métriques configurables du Dashboard — carte normalisée { value, previous,
 * series } par id de métrique, composée des MOTEURS EXISTANTS (aucune nouvelle
 * règle de calcul → zéro régression) :
 *  - getBlendedBoard : rentabilité (revenue, spend, MER, AOV, NC-ROAS, NCPA,
 *    BE-ROAS, Net Profit/Margin, couverture COGS, commandes, nouveaux clients)
 *    + timeline (sparklines) + qualité (% attribuable).
 *  - getGadsOverview (période courante ET précédente) : métriques Ads (ROAS
 *    Google, clics, impressions, CTR, CPC, CPA, conversions).
 *  - getOrdersAttribution : ROAS Jestly (canal Google attribué) + CA par canal.
 *
 * Donnée absente → available:false (jamais inventée). Delta = vs période
 * précédente quand elle est disponible.
 */
import type { DateRange } from "@/lib/ads/types";
import { getBlendedBoard } from "@/lib/costs/blended";
import { getGadsOverview } from "./aggregator";
import { getOrdersAttribution } from "./attribution-aggregator";
import type { Channel } from "./channels";

export interface MetricValue {
  value: number | null;
  previous: number | null;
  /** Série journalière alignée sur `days` (sparkline), si disponible. */
  series?: number[];
  available: boolean;
}

export interface DashboardMetrics {
  days: string[];
  metrics: Record<string, MetricValue>;
}

/** Période précédente de même longueur, se terminant la veille de `range.from`. */
function previousRangeOf(range: DateRange): DateRange {
  const start = new Date(`${range.from}T00:00:00Z`).getTime();
  const end = new Date(`${range.to}T00:00:00Z`).getTime();
  const lenDays = Math.round((end - start) / 86_400_000) + 1;
  const prevTo = new Date(start - 86_400_000).toISOString().slice(0, 10);
  const prevFrom = new Date(start - lenDays * 86_400_000).toISOString().slice(0, 10);
  return { from: prevFrom, to: prevTo };
}

const div = (a: number, b: number): number | null => (b > 0 ? a / b : null);
const m = (value: number | null, previous: number | null, opts?: { series?: number[]; available?: boolean }): MetricValue => ({
  value,
  previous,
  series: opts?.series,
  available: opts?.available ?? value != null,
});

export interface DashboardMetricsOptions {
  /** Boutique ciblée (sélecteur). Défaut : la boutique principale. */
  integrationId?: string | null;
}

export async function getDashboardMetrics(
  userId: string,
  range: DateRange,
  options?: DashboardMetricsOptions,
): Promise<DashboardMetrics> {
  const prev = previousRangeOf(range);
  const integrationId = options?.integrationId ?? null;

  // Tout est scopé à la BOUTIQUE (integration_id) : une boutique sans compte
  // Google Ads n'a aucune ligne gads → métriques Ads à 0/indisponibles,
  // jamais les chiffres d'une autre boutique.
  const [board, ov, ovPrev, attribution] = await Promise.all([
    getBlendedBoard(userId, range, undefined, { integrationId }),
    getGadsOverview(userId, range, integrationId),
    getGadsOverview(userId, prev, integrationId),
    getOrdersAttribution(userId, range, integrationId).catch(() => null),
  ]);

  const c = board.current;
  const p = board.previous;
  const t = board.timeline;
  const days = t.map((x) => x.date);

  // Séries (sparklines) depuis la timeline blended.
  const sRevenue = t.map((x) => x.revenue_cents);
  const sSpend = t.map((x) => x.spend_cents);
  const sMer = t.map((x) => x.rolling_mer ?? 0);
  const sProfit = c.costs_configured ? t.map((x) => x.net_profit_cents ?? 0) : undefined;

  // Ads dérivés (courant / précédent) — mêmes formules que la vue Ads.
  const ctr = (o: typeof ov) => div(o.clicks, o.impressions);
  const cpc = (o: typeof ov) => div(o.spend_cents, o.clicks);
  const cpa = (o: typeof ov) => div(o.spend_cents, o.conversions); // coût / conversion Google

  // ROAS Jestly (canal Google attribué) + CA par canal.
  const chan = (ch: Exclude<Channel, "ghost">) => attribution?.channels.find((s) => s.channel === ch) ?? null;
  const google = chan("google_ads");
  const caOf = (ch: Exclude<Channel, "ghost">): number | null => {
    const s = chan(ch);
    return s ? s.revenue_effective_cents : null;
  };

  // Panier moyen nouveaux clients.
  const ncAov = (b: typeof c) => (b.new_customers > 0 ? Math.round(b.nc_revenue_cents / b.new_customers) : null);

  const metrics: Record<string, MetricValue> = {
    // ── Acquisition ──
    revenue: m(c.revenue_cents, p.revenue_cents, { series: sRevenue }),
    spend: m(c.spend_cents, p.spend_cents, { series: sSpend }),
    orders: m(c.orders_count, p.orders_count),
    new_customers: m(c.new_customers, p.new_customers),
    aov: m(c.aov_cents, p.aov_cents),
    nc_aov: m(ncAov(c), ncAov(p)),
    clicks: m(ov.clicks, ovPrev.clicks),
    impressions: m(ov.impressions, ovPrev.impressions),
    ctr: m(ctr(ov), ctr(ovPrev)),
    cpc: m(cpc(ov), cpc(ovPrev)),
    conversions: m(ov.conversions, ovPrev.conversions),
    // Taux de conversion (sessions) : les sessions ne sont pas chargées ici →
    // non disponible proprement plutôt qu'inventé.
    conversion_rate: m(null, null, { available: false }),
    // ── Rentabilité ──
    mer: m(c.mer, p.mer, { series: sMer }),
    be_roas: m(c.be_roas, p.be_roas, { available: c.costs_configured && c.be_roas != null }),
    net_profit: m(c.net_profit_cents, p.net_profit_cents, { series: sProfit, available: c.net_profit_cents != null }),
    net_margin: m(c.net_margin, p.net_margin, { available: c.net_margin != null }),
    cogs_coverage: m(c.cogs.total_units > 0 ? c.cogs.coverage : null, null, { available: c.cogs.total_units > 0 }),
    nc_roas: m(c.nc_roas, p.nc_roas),
    ncpa: m(c.ncpa_cents, p.ncpa_cents),
    cpa: m(cpa(ov), cpa(ovPrev)),
    // ── Attribution ──
    roas_google: m(ov.reported_roas, ovPrev.reported_roas),
    roas_jestly: m(google?.roas_with_manual ?? null, null, { available: google?.roas_with_manual != null }),
    attributable_share: m(board.quality.attributable_revenue_share, null, {
      available: board.quality.attributable_revenue_share != null,
    }),
    ca_google: m(caOf("google_ads"), null, { available: caOf("google_ads") != null }),
    ca_seo: m(caOf("seo"), null, { available: caOf("seo") != null }),
    ca_pinterest: m(caOf("pinterest"), null, { available: caOf("pinterest") != null }),
    ca_other: m(caOf("other"), null, { available: caOf("other") != null }),
  };

  return { days, metrics };
}
