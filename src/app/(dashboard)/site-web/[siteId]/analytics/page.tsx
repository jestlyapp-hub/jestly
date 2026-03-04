"use client";

import { motion } from "framer-motion";
import StatCard from "@/components/ui/StatCard";
import { useApi } from "@/lib/hooks/use-api";
import type { AnalyticsEvent, AnalyticsEventType } from "@/types";

const eventTypeLabels: Record<AnalyticsEventType, string> = {
  page_view: "Page vue",
  click_cta: "Clic CTA",
  form_submit: "Formulaire",
  order_start: "Commande initiée",
  order_complete: "Commande finalisée",
};

const eventTypeColors: Record<AnalyticsEventType, string> = {
  page_view: "#4F46E5",
  click_cta: "#6366F1",
  form_submit: "#8B5CF6",
  order_start: "#F59E0B",
  order_complete: "#10B981",
};

/* eslint-disable @typescript-eslint/no-explicit-any */
function transformEvent(row: any): AnalyticsEvent {
  return {
    id: row.id,
    type: row.event_type || row.type,
    page: row.page_path || row.page || null,
    timestamp: row.created_at || row.timestamp,
    data: row.event_data || row.data || null,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export default function SiteAnalyticsPage() {
  const { data: rawEvents } = useApi<Record<string, unknown>[]>("/api/analytics/summary");
  const allEvents: AnalyticsEvent[] = rawEvents ? rawEvents.map(transformEvent) : [];

  // Group events by type for breakdown
  const typeCounts: Record<string, number> = {};
  for (const evt of allEvents) {
    typeCounts[evt.type] = (typeCounts[evt.type] || 0) + 1;
  }
  const totalEvents = allEvents.length;
  const totalViews = typeCounts["page_view"] ?? 0;
  const totalConversions = typeCounts["order_complete"] ?? 0;

  // Top pages by view count
  const pageCounts: Record<string, number> = {};
  for (const e of allEvents) {
    if (e.page) {
      pageCounts[e.page] = (pageCounts[e.page] || 0) + 1;
    }
  }
  const topPages = Object.entries(pageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([page, count]) => ({ page, count }));
  const maxPageCount = Math.max(...topPages.map((p) => p.count), 1);

  // Conversion rate
  const views = typeCounts["page_view"] ?? 0;
  const conversions = typeCounts["order_complete"] ?? 0;
  const conversionRate = views > 0 ? ((conversions / views) * 100).toFixed(1) : "0";

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
          { label: "Pages vues", value: String(totalViews), change: `${totalEvents} événements total`, positive: true },
          { label: "Conversions", value: String(totalConversions), change: `${conversionRate}% taux`, positive: totalConversions > 0 },
          { label: "Clics CTA", value: String(typeCounts["click_cta"] ?? 0), change: "tous les clics", positive: true },
          { label: "Formulaires", value: String(typeCounts["form_submit"] ?? 0), change: "soumissions", positive: true },
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
        {/* Top pages */}
        <motion.div
          className="lg:col-span-2 bg-white rounded-xl border border-[#E6E6E4] p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <h2 className="text-[14px] font-semibold text-[#191919] mb-4">Pages les plus visitées</h2>
          <div className="space-y-4">
            {topPages.map((p, i) => (
              <div key={p.page}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-[#8A8A88] w-5">{i + 1}.</span>
                    <span className="text-[13px] font-medium text-[#191919]">{p.page}</span>
                  </div>
                  <span className="text-[12px] font-semibold text-[#191919]">{p.count} vues</span>
                </div>
                <div className="w-full bg-[#EFEFEF] rounded-full h-2.5">
                  <div
                    className="bg-[#4F46E5] h-2.5 rounded-full transition-all"
                    style={{ width: `${(p.count / maxPageCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {topPages.length === 0 && (
              <p className="text-sm text-[#8A8A88]">Aucune donnée pour le moment.</p>
            )}
          </div>
        </motion.div>

        {/* Event type breakdown */}
        <motion.div
          className="bg-white rounded-xl border border-[#E6E6E4] p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <h2 className="text-[14px] font-semibold text-[#191919] mb-4">Répartition</h2>
          <div className="space-y-3">
            {(Object.keys(eventTypeLabels) as AnalyticsEventType[]).map((type) => {
              const count = typeCounts[type] ?? 0;
              const pct = totalEvents > 0 ? ((count / totalEvents) * 100).toFixed(0) : "0";
              return (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: eventTypeColors[type] }}
                    />
                    <span className="text-[12px] text-[#5A5A58]">{eventTypeLabels[type]}</span>
                  </div>
                  <span className="text-[12px] font-semibold text-[#191919]">{count} <span className="text-[#8A8A88] font-normal">({pct}%)</span></span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Full events table */}
      <motion.div
        className="bg-white rounded-xl border border-[#E6E6E4] overflow-hidden"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35 }}
      >
        <div className="px-5 py-4 border-b border-[#E6E6E4]">
          <h2 className="text-[14px] font-semibold text-[#191919]">Tous les événements</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#EFEFEF]">
                {["Type", "Page", "Détails", "Date"].map((h) => (
                  <th key={h} className="text-left text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider px-5 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...allEvents].reverse().map((evt) => (
                <tr key={evt.id} className="border-b border-[#F8F8FA] last:border-b-0 hover:bg-[#FBFBFA] transition-colors">
                  <td className="px-5 py-3 text-[12px]">
                    <span
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-white text-[10px] font-semibold"
                      style={{ backgroundColor: eventTypeColors[evt.type] ?? "#999" }}
                    >
                      {eventTypeLabels[evt.type] ?? evt.type}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[12px] font-mono text-[#5A5A58]">{evt.page ?? "-"}</td>
                  <td className="px-5 py-3 text-[12px] text-[#8A8A88]">
                    {evt.data ? Object.entries(evt.data).map(([k, v]) => `${k}: ${v}`).join(", ") : "-"}
                  </td>
                  <td className="px-5 py-3 text-[11px] text-[#8A8A88]">
                    {new Date(evt.timestamp).toLocaleString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
              {allEvents.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-sm text-[#8A8A88]">
                    Aucun événement enregistré.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
