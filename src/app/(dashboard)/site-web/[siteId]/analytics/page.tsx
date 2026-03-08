"use client";

import { motion } from "framer-motion";
import StatCard from "@/components/ui/StatCard";
import { useApi } from "@/lib/hooks/use-api";

interface AnalyticsSummary {
  totalRevenue: number;
  totalOrders: number;
  clientCount: number;
  avgBasket: number;
  months: { month: string; revenue: number; orders: number }[];
}

export default function SiteAnalyticsPage() {
  const { data } = useApi<AnalyticsSummary>("/api/analytics/summary");

  const totalRevenue = data?.totalRevenue ?? 0;
  const totalOrders = data?.totalOrders ?? 0;
  const clientCount = data?.clientCount ?? 0;
  const avgBasket = data?.avgBasket ?? 0;
  const months = data?.months ?? [];

  const maxRevenue = Math.max(...months.map((m) => m.revenue), 1);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.h1
        className="text-xl font-bold text-[#191919] mb-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        Analytics du site
      </motion.h1>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Revenus", value: `${totalRevenue} €`, change: `${totalOrders} commandes`, positive: true },
          { label: "Commandes", value: String(totalOrders), change: `${avgBasket} € panier moyen`, positive: totalOrders > 0 },
          { label: "Clients", value: String(clientCount), change: "clients enregistrés", positive: true },
          { label: "Panier moyen", value: `${avgBasket} €`, change: "par commande", positive: true },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
          >
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue chart */}
        <motion.div
          className="lg:col-span-2 bg-white rounded-xl border border-[#E6E6E4] p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <h2 className="text-[14px] font-semibold text-[#191919] mb-4">Revenus mensuels</h2>
          <div className="space-y-4">
            {months.map((m) => (
              <div key={m.month}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[13px] font-medium text-[#191919] capitalize">{m.month}</span>
                  <span className="text-[12px] font-semibold text-[#191919]">{m.revenue} € <span className="text-[#8A8A88] font-normal">({m.orders} cmd)</span></span>
                </div>
                <div className="w-full bg-[#EFEFEF] rounded-full h-2.5">
                  <div
                    className="bg-[#4F46E5] h-2.5 rounded-full transition-all"
                    style={{ width: `${(m.revenue / maxRevenue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {months.length === 0 && (
              <p className="text-sm text-[#8A8A88]">Aucune donnée pour le moment.</p>
            )}
          </div>
        </motion.div>

        {/* Summary card */}
        <motion.div
          className="bg-white rounded-xl border border-[#E6E6E4] p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <h2 className="text-[14px] font-semibold text-[#191919] mb-4">Résumé</h2>
          <div className="space-y-4">
            {[
              { label: "Revenus totaux", value: `${totalRevenue} €`, color: "#4F46E5" },
              { label: "Commandes totales", value: String(totalOrders), color: "#6366F1" },
              { label: "Clients", value: String(clientCount), color: "#8B5CF6" },
              { label: "Panier moyen", value: `${avgBasket} €`, color: "#10B981" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[12px] text-[#5A5A58]">{item.label}</span>
                </div>
                <span className="text-[12px] font-semibold text-[#191919]">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
