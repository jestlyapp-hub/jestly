"use client";

import { motion } from "framer-motion";
import StatCard from "@/components/ui/StatCard";
import { useApi } from "@/lib/hooks/use-api";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface AnalyticsSummary {
  totalRevenue: number;
  totalOrders: number;
  clientCount: number;
  avgBasket: number;
  months: { month: string; revenue: number; orders: number }[];
}

const emptyAnalytics: AnalyticsSummary = {
  totalRevenue: 0,
  totalOrders: 0,
  clientCount: 0,
  avgBasket: 0,
  months: [],
};

export default function AnalyticsPage() {
  const { data: apiData, loading } = useApi<AnalyticsSummary>("/api/analytics/summary");
  const data = apiData || (loading ? null : emptyAnalytics);

  const stats = data
    ? [
        { label: "Revenu total (6 mois)", value: `${data.totalRevenue.toLocaleString()} \u20ac`, change: "", positive: true },
        { label: "Commandes totales", value: String(data.totalOrders), change: "", positive: true },
        { label: "Panier moyen", value: `${data.avgBasket} \u20ac`, change: "", positive: true },
        { label: "Clients totaux", value: String(data.clientCount), change: "", positive: true },
      ]
    : [];

  const revenueData = data?.months || [];
  const ordersChartData = data?.months || [];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.h1
        className="text-2xl font-bold text-[#1A1A1A] mb-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        Analytics
      </motion.h1>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-white rounded-xl border border-[#E6E6E4] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
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
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue chart */}
        <motion.div
          className="bg-white rounded-xl border border-[#E6E6E4] p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <h2 className="text-[14px] font-semibold text-[#1A1A1A] mb-6">
            Évolution des revenus
          </h2>
          {loading ? (
            <div className="h-[240px] bg-[#F7F7F5] rounded-lg animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EFEFEF" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#999" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#999" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `${v} \u20ac`}
                />
                <Tooltip
                  contentStyle={{
                    background: "#fff",
                    border: "1px solid #E6E6E4",
                    borderRadius: "8px",
                    fontSize: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                  }}
                  formatter={(value: number | undefined) => [`${value ?? 0} \u20ac`, "Revenu"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#4F46E5"
                  strokeWidth={2}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Orders chart */}
        <motion.div
          className="bg-white rounded-xl border border-[#E6E6E4] p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <h2 className="text-[14px] font-semibold text-[#1A1A1A] mb-6">
            Commandes par mois
          </h2>
          {loading ? (
            <div className="h-[240px] bg-[#F7F7F5] rounded-lg animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={ordersChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EFEFEF" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#999" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#999" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#fff",
                    border: "1px solid #E6E6E4",
                    borderRadius: "8px",
                    fontSize: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                  }}
                />
                <Bar dataKey="orders" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>
    </div>
  );
}
