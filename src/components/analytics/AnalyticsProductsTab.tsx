"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { Package, Percent, BarChart3, ChevronDown, Star } from "lucide-react";
import type { AnalyticsData } from "./analytics-types";
import { PIE_COLORS, TOOLTIP_STYLE, fmt, fmtEur } from "./analytics-types";
import { Section, EmptyState } from "./AnalyticsShared";

interface ProductsTabProps {
  data: AnalyticsData;
}

export default function AnalyticsProductsTab({ data }: ProductsTabProps) {
  const [productSort, setProductSort] = useState<"revenue" | "orders" | "refundRate">("revenue");

  const sortedProducts = useMemo(() => {
    if (!data?.productPerformance) return [];
    return [...data.productPerformance].sort((a, b) => {
      if (productSort === "orders") return b.orders - a.orders;
      if (productSort === "refundRate") return b.refundRate - a.refundRate;
      return b.revenue - a.revenue;
    });
  }, [data?.productPerformance, productSort]);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Section title="Revenu par produit" icon={Package} delay={0.2}>
          {sortedProducts.length === 0 ? (
            <EmptyState message={data?.productsLinked === false ? "Commandes non reliées à des produits" : "Aucun produit vendu"} />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={sortedProducts.slice(0, 8)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#EFEFEF" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "#999" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${fmt(v)} €`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#666" }} axisLine={false} tickLine={false} width={120} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number | undefined) => [fmtEur(v ?? 0), "Revenu"]} />
                <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                  {sortedProducts.slice(0, 8).map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Section>

        <Section title="Part de revenu" icon={Percent} delay={0.25}>
          {sortedProducts.length === 0 ? (
            <EmptyState message={data?.productsLinked === false ? "Commandes non reliées à des produits" : "Aucun produit vendu"} />
          ) : (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={220}>
                <PieChart>
                  <Pie data={sortedProducts.slice(0, 6)} dataKey="revenue" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={50} paddingAngle={2}>
                    {sortedProducts.slice(0, 6).map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number | undefined) => [fmtEur(v ?? 0)]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {sortedProducts.slice(0, 6).map((p, i) => (
                  <div key={p.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-[11px] text-[#666] flex-1 truncate">{p.name}</span>
                    <span className="text-[11px] font-semibold text-[#1A1A1A]">{p.revenueShare}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Section>
      </div>

      <Section title="Performance des produits" icon={BarChart3} delay={0.3}>
        {sortedProducts.length === 0 ? (
          <EmptyState message={data?.productsLinked === false ? "Commandes non reliées à des produits" : "Aucun produit vendu sur cette période"} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F0F0EE]">
                  {[
                    { key: "name", label: "Produit", sortable: false },
                    { key: "revenue", label: "Revenu", sortable: true },
                    { key: "orders", label: "Commandes", sortable: true },
                    { key: "avgPrice", label: "Prix moyen", sortable: false },
                    { key: "revenueShare", label: "Part CA", sortable: false },
                    { key: "refundRate", label: "Remboursements", sortable: true },
                  ].map((col) => (
                    <th key={col.key} className={`text-left text-[11px] uppercase tracking-wider font-semibold text-[#999] pb-3 px-2 ${col.sortable ? "cursor-pointer hover:text-[#4F46E5]" : ""}`} onClick={() => col.sortable && setProductSort(col.key as typeof productSort)}>
                      <span className="flex items-center gap-1">
                        {col.label}
                        {col.sortable && productSort === col.key && <ChevronDown size={11} />}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedProducts.map((p, i) => (
                  <motion.tr key={p.name} className="border-b border-[#F7F7F5] hover:bg-[#FAFAFF] transition-colors" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.03 }}>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        {i === 0 && <Star size={12} className="text-amber-500" />}
                        <span className="text-[13px] font-medium text-[#1A1A1A]">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-[13px] font-semibold text-[#1A1A1A]">{fmtEur(p.revenue)}</td>
                    <td className="py-3 px-2 text-[13px] text-[#666]">{p.orders}</td>
                    <td className="py-3 px-2 text-[13px] text-[#666]">{fmtEur(p.avgPrice)}</td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-[#F0F0EE] rounded-full overflow-hidden">
                          <div className="h-full bg-[#4F46E5] rounded-full" style={{ width: `${p.revenueShare}%` }} />
                        </div>
                        <span className="text-[11px] text-[#999]">{p.revenueShare}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span className={`text-[12px] font-medium ${p.refundRate > 5 ? "text-red-500" : "text-emerald-600"}`}>{p.refundRate}%</span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </>
  );
}
