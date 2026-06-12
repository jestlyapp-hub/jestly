import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { getOverviewKpis } from "@/lib/ads/aggregator";
import { computeRoas } from "@/lib/ads/roas-engine";
import { formatCurrency, formatNumberFr, formatRoas, formatPercentDelta } from "@/lib/ads/formatters";
import { parseRange, parseProviders } from "../_helpers";

export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;

  const url = new URL(req.url);
  const range = parseRange(url.searchParams.get("range"), url.searchParams.get("from"), url.searchParams.get("to"));
  const providers = parseProviders(url.searchParams.get("providers"));

  const current = await getOverviewKpis(auth.user.id, range, providers);

  // Période précédente pour deltas
  const fromDate = new Date(range.from);
  const toDate = new Date(range.to);
  const durationMs = toDate.getTime() - fromDate.getTime();
  const prevTo = new Date(fromDate.getTime() - 24 * 3600 * 1000);
  const prevFrom = new Date(prevTo.getTime() - durationMs);
  const previous = await getOverviewKpis(auth.user.id, {
    from: prevFrom.toISOString().slice(0, 10),
    to: prevTo.toISOString().slice(0, 10),
  }, providers);

  const deltaPct = (cur: number, prev: number): number | null => {
    if (prev === 0) return cur === 0 ? 0 : null;
    return Math.round(((cur - prev) / prev) * 1000) / 10;
  };

  return NextResponse.json({
    range: current.range,
    kpis: {
      spend: {
        value_cents: current.spend_cents,
        formatted: formatCurrency(current.spend_cents),
        delta_percent: deltaPct(current.spend_cents, previous.spend_cents),
      },
      revenue: {
        value_cents: current.revenue_cents,
        formatted: formatCurrency(current.revenue_cents),
        delta_percent: deltaPct(current.revenue_cents, previous.revenue_cents),
      },
      roas: {
        value: current.global_roas,
        formatted: formatRoas(current.global_roas),
        delta_percent: deltaPct(current.global_roas ?? 0, previous.global_roas ?? 0),
        // Statut de période (seuils des settings + garde-fou volume), plus de seuils en dur
        status: current.global_status,
      },
      orders: {
        value: current.orders,
        formatted: formatNumberFr(current.orders),
        delta_percent: deltaPct(current.orders, previous.orders),
      },
      cpc: {
        value_cents: current.avg_cpc_cents,
        formatted: current.avg_cpc_cents != null ? formatCurrency(current.avg_cpc_cents) : "—",
        delta_percent: deltaPct(current.avg_cpc_cents ?? 0, previous.avg_cpc_cents ?? 0),
      },
      cpa: {
        value_cents: current.avg_cpa_cents,
        formatted: current.avg_cpa_cents != null ? formatCurrency(current.avg_cpa_cents) : "—",
        delta_percent: deltaPct(current.avg_cpa_cents ?? 0, previous.avg_cpa_cents ?? 0),
      },
    },
    campaigns_by_status: {
      profitable: current.profitable_campaigns,
      warning: current.warning_campaigns,
      unprofitable: current.unprofitable_campaigns,
      insufficient: current.insufficient_campaigns,
      total: current.total_campaigns,
    },
    providers: providers ?? ["pinterest", "google_ads", "meta_ads", "tiktok_ads"],
    computed_at: new Date().toISOString(),
  });
}
