"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApi } from "@/lib/hooks/use-api";
import { toast } from "@/lib/hooks/use-toast";
import type { ExportData } from "@/lib/analytics/export-utils";
import { downloadCsv, downloadPdf, downloadPng } from "@/lib/analytics/export-utils";
import AnalyticsExportReport from "@/components/analytics/AnalyticsExportReport";
import {
  TrendingUp,
  BarChart3,
  Users,
  Download,
  RefreshCw,
  AlertCircle,
  Package,
  FileText,
  Image,
} from "lucide-react";

// ── Extracted components ──
import type { AnalyticsData } from "@/components/analytics/analytics-types";
import { RANGES } from "@/components/analytics/analytics-types";
import { CardSkeleton } from "@/components/analytics/AnalyticsShared";
import dynamic from "next/dynamic";

const AnalyticsOverviewTab = dynamic(() => import("@/components/analytics/AnalyticsOverviewTab"), { ssr: false, loading: () => <div className="grid grid-cols-2 gap-4">{Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}</div> });
const AnalyticsProductsTab = dynamic(() => import("@/components/analytics/AnalyticsProductsTab"), { ssr: false });
const AnalyticsClientsTab = dynamic(() => import("@/components/analytics/AnalyticsClientsTab"), { ssr: false });
const AnalyticsGrowthTab = dynamic(() => import("@/components/analytics/AnalyticsGrowthTab"), { ssr: false });

// ── TABS config ──
const TABS = [
  { key: "overview", label: "Vue d'ensemble", icon: BarChart3 },
  { key: "products", label: "Produits", icon: Package },
  { key: "customers", label: "Clients", icon: Users },
  { key: "growth", label: "Croissance", icon: TrendingUp },
];

// ═══════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════
export default function AnalyticsPage() {
  const [range, setRange] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const exportLockRef = useRef(false);
  const exportReportRef = useRef<HTMLDivElement>(null);

  const apiUrl = `/api/analytics/advanced?range=${range}`;
  const { data, loading, error, mutate } = useApi<AnalyticsData>(apiUrl);

  // ── Refresh handler ──
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await mutate();
      toast.success("Analytics actualisés");
    } catch {
      toast.error("Erreur lors du rafraîchissement");
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, mutate]);

  // ── Export data (memoized) ──
  const exportData = useMemo((): ExportData | null => {
    if (!data) return null;
    return {
      range,
      kpis: {
        totalRevenue: data.kpis.totalRevenue,
        netProfit: data.kpis.netProfit,
        totalOrders: data.kpis.totalOrders,
        conversionRate: data.kpis.conversionRate,
        avgOrderValue: data.kpis.avgOrderValue,
        returningRate: data.kpis.returningRate,
        refundRate: data.kpis.refundRate,
        activeClients: data.kpis.activeClients,
        revenueChange: data.kpis.revenueChange,
        profitChange: data.kpis.profitChange,
        ordersChange: data.kpis.ordersChange,
        conversionChange: data.kpis.conversionChange,
        aovChange: data.kpis.aovChange,
        clientsChange: data.kpis.clientsChange,
      },
      pipeline: data.pipelineSummary,
      timeSeries: data.timeSeries.map((p) => ({ label: p.label, revenue: p.revenue, orders: p.orders })),
      topProducts: (data.productPerformance || []).map((p) => ({
        name: p.name, revenue: p.revenue, orders: p.orders,
        avgPrice: p.avgPrice, revenueShare: p.revenueShare,
      })),
      topClients: (data.topClients || []).map((c) => ({
        name: c.name, email: c.email, revenue: c.revenue, orders: c.orders,
      })),
      customerAnalytics: data.customerAnalytics || { newCustomers: 0, returningCustomers: 0, segments: [] },
      monthlyGrowth: (data.monthlyGrowth || []).map((m) => ({
        month: m.month, revenue: m.revenue, orders: m.orders, revenueGrowth: m.revenueGrowth,
      })),
      forecast: data.forecast || { nextMonth: 0, trend: "stable", confidence: 0 },
      bestMonth: data.bestMonth || null,
      worstMonth: data.worstMonth || null,
      insights: data.insights || [],
      revenueByDay: data.revenueByDay || [],
    };
  }, [data, range]);

  // ── Export handlers ──
  const handleExport = useCallback(async (format: "csv" | "pdf" | "png") => {
    if (exportLockRef.current || !data) return;
    exportLockRef.current = true;
    setIsExporting(format);
    setShowExportMenu(false);
    try {
      if (!exportData) throw new Error("Pas de données");
      if (format === "csv") {
        downloadCsv(exportData);
      } else {
        const node = exportReportRef.current;
        if (!node) throw new Error("Export report non monté");
        if (format === "pdf") await downloadPdf(node, range);
        else await downloadPng(node, range);
      }
      toast.success(`Export ${format.toUpperCase()} généré`);
    } catch (err) {
      toast.error(`Erreur export ${format.toUpperCase()}`);
      console.error("[EXPORT]", err);
    } finally {
      setIsExporting(null);
      exportLockRef.current = false;
    }
  }, [data, exportData, range]);

  // Build sparkline data from time series
  const sparkData = useMemo(() => {
    if (!data?.timeSeries) return [];
    return data.timeSeries.map((p) => p.revenue);
  }, [data?.timeSeries]);

  const orderSparkData = useMemo(() => {
    if (!data?.timeSeries) return [];
    return data.timeSeries.map((p) => p.orders);
  }, [data?.timeSeries]);

  // ── LOADING STATE ──
  if (loading && !data) {
    return (
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 w-40 bg-[#F7F7F5] rounded-lg animate-pulse" />
          <div className="h-9 w-64 bg-[#F7F7F5] rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <CardSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2"><CardSkeleton h="h-[380px]" /></div>
          <CardSkeleton h="h-[380px]" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CardSkeleton h="h-[300px]" />
          <CardSkeleton h="h-[300px]" />
        </div>
      </div>
    );
  }

  // ── ERROR STATE ──
  if (error) {
    return (
      <div className="max-w-[1200px] mx-auto flex flex-col items-center justify-center py-24">
        <AlertCircle size={40} className="text-red-400 mb-4" />
        <p className="text-[14px] text-[#1A1A1A] font-medium mb-1">Erreur de chargement</p>
        <p className="text-[13px] text-[#999] mb-4">{error}</p>
        <button onClick={mutate} className="text-[13px] text-[#4F46E5] hover:underline cursor-pointer">Réessayer</button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="max-w-[1200px] mx-auto pb-12">
      {/* ═══ HEADER ═══ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Analytics</h1>
          <p className="text-[13px] text-[#999] mt-0.5">Vue complète de ton activité</p>
        </motion.div>

        <motion.div className="flex items-center gap-2" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <div className="flex items-center gap-1 bg-white border border-[#E6E6E4] rounded-lg p-0.5">
            {RANGES.map((r) => (
              <button key={r.key} onClick={() => setRange(r.key)} className={`px-3 py-1.5 text-[11px] font-medium rounded-md transition-all cursor-pointer ${range === r.key ? "bg-[#4F46E5] text-white shadow-sm" : "text-[#666] hover:text-[#1A1A1A] hover:bg-[#F7F7F5]"}`}>
                {r.label}
              </button>
            ))}
          </div>

          <button onClick={handleRefresh} disabled={isRefreshing} className={`p-2 rounded-lg transition-all cursor-pointer ${isRefreshing ? "text-[#4F46E5] bg-[#F7F7F5]" : "text-[#999] hover:text-[#4F46E5] hover:bg-[#F7F7F5]"}`} title="Rafraîchir">
            <RefreshCw size={15} className={isRefreshing ? "animate-spin" : ""} />
          </button>

          <div className="relative">
            <button onClick={() => setShowExportMenu(!showExportMenu)} className="p-2 text-[#999] hover:text-[#4F46E5] hover:bg-[#F7F7F5] rounded-lg transition-all cursor-pointer" title="Exporter">
              <Download size={15} />
            </button>
            <AnimatePresence>
              {showExportMenu && (
                <motion.div className="absolute right-0 top-10 bg-white border border-[#E6E6E4] rounded-xl shadow-lg p-1 z-50 min-w-[140px]" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>
                  {([
                    { label: "CSV", format: "csv" as const, icon: FileText },
                    { label: "PDF", format: "pdf" as const, icon: FileText },
                    { label: "PNG", format: "png" as const, icon: Image },
                  ]).map((opt) => (
                    <button key={opt.label} disabled={isExporting !== null} className="flex items-center gap-2 w-full px-3 py-2 text-[12px] text-[#666] hover:bg-[#F7F7F5] rounded-lg cursor-pointer disabled:opacity-50" onClick={() => handleExport(opt.format)}>
                      <opt.icon size={14} className={isExporting === opt.format ? "animate-pulse" : ""} />
                      {isExporting === opt.format ? "Génération..." : `Exporter ${opt.label}`}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* ═══ TABS ═══ */}
      <motion.div className="flex items-center gap-1 mb-6 border-b border-[#E6E6E4]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
        {TABS.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-medium border-b-2 transition-all cursor-pointer -mb-px ${activeTab === tab.key ? "border-[#4F46E5] text-[#4F46E5]" : "border-transparent text-[#999] hover:text-[#666]"}`}>
            <tab.icon size={15} strokeWidth={1.8} />
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* ═══ TAB CONTENT ═══ */}
      {activeTab === "overview" && (
        <AnalyticsOverviewTab data={data} sparkData={sparkData} orderSparkData={orderSparkData} range={range} />
      )}
      {activeTab === "products" && (
        <AnalyticsProductsTab data={data} />
      )}
      {activeTab === "customers" && (
        <AnalyticsClientsTab data={data} />
      )}
      {activeTab === "growth" && (
        <AnalyticsGrowthTab data={data} />
      )}

      {/* ═══ EXPORT REPORT — mounted offscreen ═══ */}
      {exportData && (
        <div style={{ position: "fixed", left: -9999, top: 0, width: 794, overflow: "visible", pointerEvents: "none", zIndex: -9999 }}>
          <AnalyticsExportReport ref={exportReportRef} data={exportData} />
        </div>
      )}
    </div>
  );
}
