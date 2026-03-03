"use client";

import { useApi } from "@/lib/hooks/use-api";
import StatCard from "@/components/ui/StatCard";
import BadgeStatus from "@/components/ui/BadgeStatus";
import ClientRevenueChart from "./ClientRevenueChart";
import type { ClientDetail, ClientRevenueMonth } from "@/types";

interface Props {
  client: ClientDetail;
}

interface RevenueData {
  months: ClientRevenueMonth[];
  totalPaid: number;
  totalUnpaid: number;
  averageOrderValue: number;
}

interface OrderRow {
  id: string;
  title: string;
  amount: number;
  status: string;
  created_at: string;
  services?: { title: string } | null;
}

interface OrdersData {
  orders: OrderRow[];
  total: number;
}

export default function ClientOverviewTab({ client }: Props) {
  const { data: revenue } = useApi<RevenueData>(`/api/clients/${client.id}/revenue?months=12`);
  const { data: ordersData } = useApi<OrdersData>(`/api/clients/${client.id}/orders?limit=5`);

  const recentOrders = ordersData?.orders || [];

  // Top products from recent orders
  const productCounts: Record<string, number> = {};
  for (const o of recentOrders) {
    const name = o.services?.title || o.title;
    productCounts[name] = (productCounts[name] || 0) + 1;
  }
  const topProducts = Object.entries(productCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Revenu total" value={`${client.totalRevenue}€`} />
        <StatCard label="Commandes" value={String(client.ordersCount)} />
        <StatCard
          label="Panier moyen"
          value={revenue ? `${Math.round(revenue.averageOrderValue)}€` : "—"}
        />
        <StatCard
          label="Impayé"
          value={revenue ? `${revenue.totalUnpaid}€` : "—"}
          positive={!revenue?.totalUnpaid}
        />
      </div>

      {/* Revenue Chart */}
      {revenue && <ClientRevenueChart months={revenue.months} />}

      {/* Recent Orders + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent orders */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E6E6E4] p-5">
          <h3 className="text-[13px] font-semibold text-[#1A1A1A] mb-3">Commandes récentes</h3>
          {recentOrders.length === 0 ? (
            <p className="text-[13px] text-[#BBB] py-4 text-center">Aucune commande.</p>
          ) : (
            <div className="space-y-0">
              {recentOrders.map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between py-2.5 border-b border-[#EFEFEF] last:border-b-0"
                >
                  <div>
                    <span className="text-[13px] font-medium text-[#1A1A1A]">
                      {o.services?.title || o.title}
                    </span>
                    <span className="text-[11px] text-[#999] ml-2">
                      {new Date(o.created_at).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[13px] font-medium text-[#1A1A1A]">{o.amount}€</span>
                    <BadgeStatus status={o.status as "new"} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top products */}
        <div className="bg-white rounded-xl border border-[#E6E6E4] p-5">
          <h3 className="text-[13px] font-semibold text-[#1A1A1A] mb-3">Top produits</h3>
          {topProducts.length === 0 ? (
            <p className="text-[13px] text-[#BBB] py-4 text-center">Aucun produit.</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map(([name, count]) => (
                <div key={name} className="flex items-center justify-between">
                  <span className="text-[13px] text-[#1A1A1A] truncate">{name}</span>
                  <span className="text-[12px] text-[#999] shrink-0 ml-2">{count}x</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
