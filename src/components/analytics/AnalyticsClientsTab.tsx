"use client";

import { motion } from "framer-motion";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
} from "recharts";
import { Users, UserPlus, UserCheck, Repeat, Percent, Award } from "lucide-react";
import type { AnalyticsData } from "./analytics-types";
import { PIE_COLORS, TOOLTIP_STYLE, fmt, fmtEur, fmtDate } from "./analytics-types";
import { KPICard, Section, EmptyState } from "./AnalyticsShared";

interface ClientsTabProps {
  data: AnalyticsData;
}

export default function AnalyticsClientsTab({ data }: ClientsTabProps) {
  const { kpis, hasPreviousPeriod } = data;
  const ch = (v: number) => hasPreviousPeriod ? v : null;

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard label="Nouveaux clients" value={fmt(data.customerAnalytics?.newCustomers ?? 0)} change={ch(data.customerAnalytics?.newCustomersChange ?? 0)} icon={UserPlus} index={0} />
        <KPICard label="Clients récurrents" value={fmt(data.customerAnalytics?.returningCustomers ?? 0)} change={null} icon={UserCheck} index={1} />
        <KPICard label="Taux de récurrence" value={`${kpis.returningRate}%`} change={null} icon={Repeat} index={2} />
        <KPICard label="Clients actifs" value={fmt(kpis.activeClients)} change={ch(kpis.clientsChange)} icon={Users} index={3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Section title="Segments clients" icon={Users} delay={0.2}>
          {(data.customerAnalytics?.segments || []).length === 0 ? (
            <EmptyState message="Aucun segment" />
          ) : (
            <div className="space-y-4">
              {(data.customerAnalytics?.segments || []).map((seg, i) => {
                const totalClients = (data.customerAnalytics?.segments || []).reduce((s, sg) => s + sg.count, 0);
                const pct = totalClients > 0 ? Math.round((seg.count / totalClients) * 100) : 0;
                return (
                  <div key={seg.segment}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                        <span className="text-[12px] font-medium text-[#1A1A1A]">{seg.segment}</span>
                      </div>
                      <span className="text-[11px] text-[#999]">{seg.count} clients · {fmtEur(seg.revenue)}</span>
                    </div>
                    <div className="h-2 bg-[#F0F0EE] rounded-full overflow-hidden">
                      <motion.div className="h-full rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: i * 0.1 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Section>

        <Section title="Revenu par segment" icon={Percent} delay={0.25}>
          {(data.customerAnalytics?.segments || []).every((s) => s.revenue === 0) ? (
            <EmptyState message="Aucune donnée" />
          ) : (
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={data.customerAnalytics?.segments || []} dataKey="revenue" nameKey="segment" cx="50%" cy="50%" outerRadius={80} innerRadius={50} paddingAngle={2}>
                    {(data.customerAnalytics?.segments || []).map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number | undefined) => [fmtEur(v ?? 0)]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Section>
      </div>

      <Section title="Meilleurs clients" icon={Award} delay={0.3}>
        {data.topClients.length === 0 ? (
          <EmptyState message="Aucun client sur cette période" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F0F0EE]">
                  <th className="text-left text-[11px] uppercase tracking-wider font-semibold text-[#999] pb-3 px-2">#</th>
                  <th className="text-left text-[11px] uppercase tracking-wider font-semibold text-[#999] pb-3 px-2">Client</th>
                  <th className="text-left text-[11px] uppercase tracking-wider font-semibold text-[#999] pb-3 px-2">Revenu</th>
                  <th className="text-left text-[11px] uppercase tracking-wider font-semibold text-[#999] pb-3 px-2">Commandes</th>
                  <th className="text-left text-[11px] uppercase tracking-wider font-semibold text-[#999] pb-3 px-2">Dernier achat</th>
                </tr>
              </thead>
              <tbody>
                {data.topClients.map((c, i) => (
                  <motion.tr key={c.email} className="border-b border-[#F7F7F5] hover:bg-[#FAFAFF] transition-colors" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.03 }}>
                    <td className="py-3 px-2">
                      {i < 3 ? (
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 0 ? "bg-amber-100 text-amber-600" : i === 1 ? "bg-gray-100 text-gray-600" : "bg-orange-50 text-orange-500"}`}>{i + 1}</div>
                      ) : (
                        <span className="text-[12px] text-[#999] pl-1.5">{i + 1}</span>
                      )}
                    </td>
                    <td className="py-3 px-2">
                      <div className="text-[13px] font-medium text-[#1A1A1A]">{c.name}</div>
                      <div className="text-[11px] text-[#999]">{c.email}</div>
                    </td>
                    <td className="py-3 px-2 text-[13px] font-semibold text-[#1A1A1A]">{fmtEur(c.revenue)}</td>
                    <td className="py-3 px-2 text-[13px] text-[#666]">{c.orders}</td>
                    <td className="py-3 px-2 text-[12px] text-[#999]">{fmtDate(c.lastPurchase)}</td>
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
