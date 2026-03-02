"use client";

import { motion } from "framer-motion";
import StatCard from "@/components/ui/StatCard";
import { revenueData, ordersChartData } from "@/lib/mock-data";
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

export default function AnalyticsPage() {
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Revenu total (6 mois)", value: "20 000 \u20ac", change: "+22 %", positive: true },
          { label: "Commandes totales", value: "152", change: "+18 %", positive: true },
          { label: "Panier moyen", value: "132 \u20ac", change: "+5 %", positive: true },
          { label: "Clients totaux", value: "38", change: "+12", positive: true },
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue chart */}
        <motion.div
          className="bg-white rounded-xl border border-[#E6E8F0] p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <h2 className="text-[14px] font-semibold text-[#1A1A1A] mb-6">
            Évolution des revenus
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6a18f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6a18f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F5" vertical={false} />
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
                  border: "1px solid #E6E8F0",
                  borderRadius: "8px",
                  fontSize: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                }}
                formatter={(value: number | undefined) => [`${value ?? 0} \u20ac`, "Revenu"]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#6a18f1"
                strokeWidth={2}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Orders chart */}
        <motion.div
          className="bg-white rounded-xl border border-[#E6E8F0] p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <h2 className="text-[14px] font-semibold text-[#1A1A1A] mb-6">
            Commandes par mois
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={ordersChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F5" vertical={false} />
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
                  border: "1px solid #E6E8F0",
                  borderRadius: "8px",
                  fontSize: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                }}
              />
              <Bar dataKey="orders" fill="#6a18f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
