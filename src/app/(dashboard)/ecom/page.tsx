"use client";

import { useApi } from "@/lib/hooks/use-api";
import { useDateRange } from "@/lib/hooks/use-date-range";
import DashboardHeader from "@/components/ecom/DashboardHeader";
import KpiCard from "@/components/ecom/KpiCard";
import RevenueTimeline from "@/components/ecom/RevenueTimeline";
import SourcesDonut from "@/components/ecom/SourcesDonut";
import TopProductsTable from "@/components/ecom/TopProductsTable";
import RecentOrdersTable from "@/components/ecom/RecentOrdersTable";
import Funnel from "@/components/ecom/Funnel";
import GeographyList from "@/components/ecom/GeographyList";
import AlertsPanel from "@/components/ecom/AlertsPanel";
import PerformanceAdsZone from "@/components/ecom/PerformanceAdsZone";
import { formatCurrency, formatNumber, computeVariation } from "@/lib/shopify/formatters";

interface DashboardData {
  current: {
    range: { from: string; to: string };
    kpis: { gross_sales: number; orders: number; aov: number; sessions: number; conversion_rate: number };
    timeline: { date: string; gross_sales: number; orders: number }[];
  };
  previous?: {
    kpis: { gross_sales: number; orders: number; aov: number; sessions: number; conversion_rate: number };
    timeline: { date: string; gross_sales: number; orders: number }[];
  };
  top_products: { id: string; title: string; image_url: string | null; units: number; revenue: number }[];
  recent_orders: Array<{
    id: string; name: string; created_at: string; total_price: number; currency: string;
    email: string | null; financial_status: string | null; fulfillment_status: string | null; source: string | null;
  }>;
  sources: { source: string; revenue: number; sessions?: number }[];
  funnel: { sessions: number; cart: number; checkout: number; purchase: number };
  countries: { country: string; revenue: number; orders: number }[];
  alerts: { low_stock: { product_id: string; title: string; inventory: number }[]; pending_fulfillment: number; failed_webhooks: number };
}

interface SyncStateResponse {
  integration: { metadata: { shop_name?: string }; shop_domain: string; last_sync_at: string | null };
}

export default function EcomDashboardPage() {
  const dr = useDateRange();
  const { data: syncState } = useApi<SyncStateResponse>("/api/integrations/shopify/sync-state");
  const range = dr.range;
  const query = range
    ? `?from=${range.from}&to=${range.to}${dr.compare ? "&compare=1" : ""}`
    : "";
  const { data, loading, mutate } = useApi<DashboardData>(`/api/ecom/dashboard${query}`);

  const shopName = syncState?.integration?.metadata?.shop_name ?? syncState?.integration?.shop_domain ?? "Boutique";
  const lastSync = syncState?.integration?.last_sync_at ?? null;

  const k = data?.current.kpis;
  const pk = data?.previous?.kpis;

  return (
    <div>
      <DashboardHeader
        shopName={shopName}
        lastSyncAt={lastSync}
        filter={dr.filter}
        onFilterChange={dr.setFilter}
        compare={dr.compare}
        onCompareChange={dr.setCompare}
        onRefresh={() => mutate()}
      />

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <KpiCard
          label="Chiffre d'affaires"
          value={formatCurrency(k?.gross_sales ?? 0)}
          variation={pk ? computeVariation(k?.gross_sales ?? 0, pk.gross_sales) : null}
          sparkline={data?.current.timeline.map((t) => ({ date: t.date, value: t.gross_sales }))}
          loading={loading}
        />
        <KpiCard
          label="Commandes"
          value={formatNumber(k?.orders ?? 0)}
          variation={pk ? computeVariation(k?.orders ?? 0, pk.orders) : null}
          sparkline={data?.current.timeline.map((t) => ({ date: t.date, value: t.orders }))}
          loading={loading}
        />
        <KpiCard
          label="Panier moyen"
          value={formatCurrency(k?.aov ?? 0)}
          variation={pk ? computeVariation(k?.aov ?? 0, pk.aov) : null}
          loading={loading}
        />
        <KpiCard
          label="Taux conversion"
          value={`${(k?.conversion_rate ?? 0).toFixed(2)} %`}
          variation={pk ? computeVariation(k?.conversion_rate ?? 0, pk.conversion_rate) : null}
          loading={loading}
        />
        <KpiCard
          label="Sessions"
          value={formatNumber(k?.sessions ?? 0)}
          variation={pk ? computeVariation(k?.sessions ?? 0, pk.sessions) : null}
          loading={loading}
        />
      </div>

      {/* Row 1 : Revenue timeline + Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-6">
        <div className="lg:col-span-2">
          {data && <RevenueTimeline data={data.current.timeline} comparison={data.previous?.timeline} />}
        </div>
        <div>
          {data && <SourcesDonut data={data.sources} />}
        </div>
      </div>

      {/* Row 2 : Top produits + Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-6">
        <div className="lg:col-span-2">
          {data && <TopProductsTable data={data.top_products} />}
        </div>
        <div>
          {data && <Funnel data={data.funnel} />}
        </div>
      </div>

      {/* Row 3 : Commandes récentes + Géographie + Alertes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2">
          {data && <RecentOrdersTable data={data.recent_orders} />}
        </div>
        <div className="space-y-3">
          {data && <GeographyList data={data.countries} />}
          {data && <AlertsPanel alerts={data.alerts} />}
        </div>
      </div>

      {/* Row 4 : Performance Ads (zone dédiée, après "Commandes récentes") */}
      <div className="mt-6">
        <PerformanceAdsZone />
      </div>
    </div>
  );
}
