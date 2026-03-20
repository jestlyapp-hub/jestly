"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApi, apiFetch } from "@/lib/hooks/use-api";
import type { BillingItemStatus, Order } from "@/types";
import { isOrderDelivered, billingToOrderStatus } from "@/lib/billing-utils";
import { orderRecordToOrder } from "@/lib/adapters";
import OrderDrawer from "@/components/commandes/OrderDrawer";
import type { BillingAction } from "@/components/commandes/OrderDrawer";
import {
  Plus,
  TrendingUp,
  CheckCircle2,
  Download,
  Users,
  Search,
  Sparkles,
  X,
  LayoutList,
  User,
  Calendar,
  AlertCircle,
  Receipt,
  Filter,
  RotateCcw,
  Tag,
  History,
  ChevronDown,
  ClipboardCheck,
  Wrench,
  Wallet,
  Repeat,
  Archive,
  FileText,
  FileDown,
} from "lucide-react";

// ── Extracted components ──
import type {
  PipelineItem,
  BillingStatusKey,
  TabKey,
  ViewMode,
  PeriodKey,
  ExportMeta,
  HealthData,
  HealthSuggestion,
} from "@/components/facturation/facturation-types";
import {
  billingTransitions,
  tabs,
  periodOptions,
  getPeriodRange,
  formatEur,
} from "@/components/facturation/facturation-types";
import { downloadCsv, downloadPdf } from "@/components/facturation/billing-export";
import { KpiCard, EmptyState, SummaryBar } from "@/components/facturation/BillingKpiCards";
import { ItemRow, GroupedView } from "@/components/facturation/BillingTable";
import BillingHealthPanel from "@/components/facturation/BillingHealthCheck";
import DetailDrawer from "@/components/facturation/BillingDetailDrawer";
import ManualItemDrawer from "@/components/facturation/BillingDrawer";
import MonthlyCloseDrawer from "@/components/facturation/PeriodClosureSection";
import ExportsDrawer from "@/components/facturation/ExportsDrawer";
import ArchivesDrawer from "@/components/facturation/ArchivesDrawer";

/* ══════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════════════════════════════ */

export default function FacturationPage() {
  /* ── Data ── */
  const { data: rawPipeline, loading: loadingItems, error: pipelineError, mutate: mutatePipeline } = useApi<PipelineItem[]>("/api/billing/pipeline");
  const { data: rawClients } = useApi<{ id: string; name: string }[]>("/api/clients");
  const { data: health, mutate: mutateHealth } = useApi<HealthData>("/api/billing/health");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: dbExports, mutate: mutateExports } = useApi<any[]>("/api/billing/exports");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: dbClosures, mutate: mutateClosures } = useApi<any[]>("/api/billing/closures");
  const clients = rawClients || [];

  const items: PipelineItem[] = useMemo(() => rawPipeline || [], [rawPipeline]);

  // ── DEBUG: trace pipeline data flow ──
  useEffect(() => {
    console.group("[Facturation DEBUG]");
    console.log("rawPipeline:", rawPipeline);
    console.log("pipelineError:", pipelineError);
    console.log("items count:", items.length);
    if (items.length > 0) {
      console.table(items.map(i => ({
        id: i.id.slice(0, 8),
        title: i.title,
        type: i.type,
        orderStatus: i.orderStatus,
        billingStatus: i.billingStatus,
        amount: i.amount,
      })));
    }
    console.groupEnd();
  }, [rawPipeline, pipelineError, items]);

  /* ── Pipeline stats (computed client-side from pipeline data) ── */
  const pipelineStats = useMemo(() => {
    const s = { total: 0, inProgress: 0, inProgressCount: 0, ready: 0, readyCount: 0, invoiced: 0, invoicedCount: 0, paid: 0, paidCount: 0, clientIds: new Set<string>(), count: 0 };
    for (const item of items) {
      s.count++;
      s.total += item.amount;
      if (item.clientId) s.clientIds.add(item.clientId);
      switch (item.billingStatus) {
        case "in_progress": s.inProgress += item.amount; s.inProgressCount++; break;
        case "ready": s.ready += item.amount; s.readyCount++; break;
        case "invoiced": s.invoiced += item.amount; s.invoicedCount++; break;
        case "paid": s.paid += item.amount; s.paidCount++; break;
      }
    }
    return { ...s, activeClients: s.clientIds.size };
  }, [items]);

  /* ── State ── */
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [search, setSearch] = useState("");
  const [filterClient, setFilterClient] = useState("");
  const [filterPeriod, setFilterPeriod] = useState<PeriodKey>("all");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterUnexported, setFilterUnexported] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState<PipelineItem | null>(null);
  const [detailItem, setDetailItem] = useState<PipelineItem | null>(null);
  const [orderDrawerItem, setOrderDrawerItem] = useState<PipelineItem | null>(null);
  const [orderForDrawer, setOrderForDrawer] = useState<Order | null>(null);
  const [orderDrawerLoading, setOrderDrawerLoading] = useState(false);
  const [showExports, setShowExports] = useState(false);
  const [showMonthlyClose, setShowMonthlyClose] = useState(false);
  const [showArchives, setShowArchives] = useState(false);
  const [healthExpanded, setHealthExpanded] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [mutating, setMutating] = useState(false);

  /* ── Bulk selection ── */
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const lastClickedRef = useRef<string | null>(null);

  const persistExport = useCallback(async (meta: ExportMeta, label?: string) => {
    await fetch("/api/billing/exports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: label || meta.filename,
        format: meta.format,
        period_start: meta.periodStart,
        period_end: meta.periodEnd,
        total_ht: meta.totalHt,
        total_tva: meta.totalTva,
        total_ttc: meta.totalTtc,
        item_count: meta.itemCount,
        client_count: meta.clientCount,
        client_ids: meta.clientIds,
        filename: meta.filename,
        item_ids: meta.itemIds,
      }),
    });
    await mutateExports();
  }, [mutateExports]);

  /* ── Derived: categories ── */
  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const item of items) {
      if (item.category) set.add(item.category);
    }
    return Array.from(set).sort();
  }, [items]);

  /* ── Filters ── */
  const hasActiveFilters = !!(filterClient || filterPeriod !== "all" || filterCategory || filterUnexported);

  const filteredItems = useMemo(() => {
    let filtered = items;

    const tabDef = tabs.find(t => t.key === activeTab);
    if (tabDef && tabDef.billingStatuses.length > 0) {
      filtered = filtered.filter(i => tabDef.billingStatuses.includes(i.billingStatus));
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(i =>
        i.title.toLowerCase().includes(q) ||
        (i.clientName || "").toLowerCase().includes(q) ||
        (i.category || "").toLowerCase().includes(q) ||
        (i.notes || "").toLowerCase().includes(q)
      );
    }

    if (filterClient) {
      filtered = filtered.filter(i => i.clientId === filterClient);
    }

    const range = getPeriodRange(filterPeriod);
    if (range) {
      filtered = filtered.filter(i => {
        const d = i.createdAt?.split("T")[0];
        if (!d) return false;
        return d >= range.start && d <= range.end;
      });
    }

    if (filterCategory) {
      filtered = filtered.filter(i => i.category === filterCategory);
    }

    if (filterUnexported) {
      filtered = filtered.filter(i => i.billingStatus !== "paid");
    }

    console.log(`[Facturation FILTER] tab=${activeTab} | before=${items.length} | after=${filtered.length} | search="${search}" | client=${filterClient || "all"} | period=${filterPeriod} | category=${filterCategory || "all"} | unexported=${filterUnexported}`);

    return filtered;
  }, [items, activeTab, search, filterClient, filterPeriod, filterCategory, filterUnexported]);

  /* ── Bulk selection functions ── */
  const toggleSelection = useCallback((id: string, shiftKey?: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (shiftKey && lastClickedRef.current && lastClickedRef.current !== id) {
        const ids = filteredItems.map(i => i.id);
        const startIdx = ids.indexOf(lastClickedRef.current);
        const endIdx = ids.indexOf(id);
        if (startIdx !== -1 && endIdx !== -1) {
          const [from, to] = startIdx < endIdx ? [startIdx, endIdx] : [endIdx, startIdx];
          for (let i = from; i <= to; i++) next.add(ids[i]);
          return next;
        }
      }
      if (next.has(id)) next.delete(id); else next.add(id);
      lastClickedRef.current = id;
      return next;
    });
  }, [filteredItems]);

  const toggleAll = useCallback(() => {
    setSelectedIds(prev => {
      if (prev.size === filteredItems.length && filteredItems.length > 0) return new Set();
      return new Set(filteredItems.map(i => i.id));
    });
  }, [filteredItems]);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  useEffect(() => { clearSelection(); }, [activeTab, filterClient, filterPeriod, filterCategory, filterUnexported, clearSelection]);

  const selectedItems = useMemo(() =>
    filteredItems.filter(i => selectedIds.has(i.id)),
    [filteredItems, selectedIds]
  );

  const bulkActions = useMemo(() => {
    if (selectedItems.length === 0) return { canInvoice: false, canPay: false, canExport: false };
    const hasReady = selectedItems.some(i => i.billingStatus === "ready");
    const hasInvoiced = selectedItems.some(i => i.billingStatus === "invoiced");
    const hasExportable = selectedItems.some(i => i.billingStatus !== "paid");
    return { canInvoice: hasReady, canPay: hasInvoiced, canExport: hasExportable };
  }, [selectedItems]);

  /* ── Tab counts ── */
  const tabCounts = useMemo(() => {
    const counts: Record<TabKey, number> = { all: 0, in_progress: 0, ready: 0, invoiced: 0, paid: 0 };
    for (const item of items) {
      counts.all++;
      counts[item.billingStatus]++;
    }
    return counts;
  }, [items]);

  /* ── Grouping ── */
  const byClient = useMemo(() => {
    const map = new Map<string, { name: string; items: PipelineItem[]; total: number }>();
    for (const item of filteredItems) {
      const key = item.clientId || "__none__";
      const name = item.clientName || "Sans client";
      if (!map.has(key)) map.set(key, { name, items: [], total: 0 });
      const g = map.get(key)!;
      g.items.push(item);
      g.total += item.amount;
    }
    return Array.from(map.entries()).sort((a, b) => b[1].total - a[1].total);
  }, [filteredItems]);

  const byMonth = useMemo(() => {
    const map = new Map<string, { label: string; items: PipelineItem[]; total: number }>();
    for (const item of filteredItems) {
      const d = item.createdAt ? new Date(item.createdAt) : null;
      const key = d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` : "sans-date";
      const label = d ? d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }) : "Sans date";
      if (!map.has(key)) map.set(key, { label, items: [], total: 0 });
      const g = map.get(key)!;
      g.items.push(item);
      g.total += item.amount;
    }
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filteredItems]);

  /* ── Handlers ── */
  const refreshAll = useCallback(async () => {
    await Promise.all([mutatePipeline(), mutateHealth()]);
  }, [mutatePipeline, mutateHealth]);

  const handleDelete = useCallback(async (item: PipelineItem) => {
    if (mutating) return;
    setMutating(true);
    try {
      if (item.type === "order") {
        await fetch(`/api/orders/${item.id}`, { method: "DELETE" });
      } else {
        await fetch(`/api/billing/items/${item.billingItemId || item.id}`, { method: "DELETE" });
      }
      await refreshAll();
      if (detailItem?.id === item.id) setDetailItem(null);
    } finally {
      setMutating(false);
    }
  }, [refreshAll, detailItem, mutating]);

  const handleSaveManual = useCallback(async (data: Record<string, unknown>, id?: string) => {
    if (mutating) return;
    setMutating(true);
    try {
      const method = id ? "PATCH" : "POST";
      const url = id ? `/api/billing/items/${id}` : "/api/billing/items";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) return;
      setShowCreate(false);
      setEditItem(null);
      await refreshAll();
    } finally {
      setMutating(false);
    }
  }, [refreshAll, mutating]);

  const handleBillingStatusChange = useCallback(async (item: PipelineItem, newStatus: BillingStatusKey) => {
    if (mutating) return;
    setMutating(true);
    try {
      if (item.type === "order") {
        const updates: Record<string, unknown> = { status: billingToOrderStatus(newStatus) };
        if (newStatus === "invoiced") updates.invoiced_at = new Date().toISOString().slice(0, 10);
        if (newStatus === "paid") { updates.paid = true; updates.paid_at = new Date().toISOString().slice(0, 10); }
        if (newStatus === "ready" || newStatus === "in_progress") { updates.paid = false; }
        await fetch(`/api/orders/${item.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updates) });
      } else {
        const manualStatusMap: Record<BillingStatusKey, BillingItemStatus> = { in_progress: "draft", ready: "ready", invoiced: "invoiced", paid: "paid" };
        const updates: Record<string, unknown> = { status: manualStatusMap[newStatus] };
        if (newStatus === "paid") updates.paid_at = new Date().toISOString().slice(0, 10);
        await fetch(`/api/billing/items/${item.billingItemId || item.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updates) });
      }
      await refreshAll();
    } finally {
      setMutating(false);
    }
  }, [refreshAll, mutating]);

  const openOrderDrawer = useCallback(async (item: PipelineItem) => {
    if (item.type !== "order") { setDetailItem(item); return; }
    setOrderDrawerItem(item);
    setOrderDrawerLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = await apiFetch<any>(`/api/orders/${item.id}`, { method: "GET" });
      setOrderForDrawer(orderRecordToOrder(raw));
    } catch {
      setOrderDrawerItem(null);
      setDetailItem(item);
    } finally {
      setOrderDrawerLoading(false);
    }
  }, []);

  const closeOrderDrawer = useCallback(() => { setOrderDrawerItem(null); setOrderForDrawer(null); }, []);

  const patchOrderFromBilling = useCallback(
    async (orderId: string, apiBody: Record<string, unknown>): Promise<boolean> => {
      try {
        await apiFetch(`/api/orders/${orderId}`, { method: "PATCH", body: apiBody });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const raw = await apiFetch<any>(`/api/orders/${orderId}`, { method: "GET" });
        setOrderForDrawer(orderRecordToOrder(raw));
        await refreshAll();
        return true;
      } catch { return false; }
    },
    [refreshAll]
  );

  const orderBillingActions: BillingAction[] = useMemo(() => {
    if (!orderDrawerItem) return [];
    const transitions = billingTransitions[orderDrawerItem.billingStatus] || [];
    return transitions.map(t => ({ label: t.label, status: t.next, accent: t.next === "paid" }));
  }, [orderDrawerItem]);

  const handleOrderBillingStatusChange = useCallback(async (status: string) => {
    if (!orderDrawerItem) return;
    await handleBillingStatusChange(orderDrawerItem, status as BillingStatusKey);
    setOrderDrawerItem(prev => prev ? { ...prev, billingStatus: status as BillingStatusKey } : null);
  }, [orderDrawerItem, handleBillingStatusChange]);

  const billingClients = useMemo(() => {
    return clients.map((c: { id: string; name: string }) => ({ id: c.id, name: c.name, email: "" }));
  }, [clients]);

  const handleExportCsv = useCallback(async () => {
    if (filteredItems.length === 0) return;
    setExporting(true);
    const meta = downloadCsv(filteredItems);
    await persistExport(meta);
    await refreshAll();
    setExporting(false);
  }, [filteredItems, persistExport, refreshAll]);

  const handleExportPdf = useCallback(async () => {
    if (filteredItems.length === 0) return;
    setExporting(true);
    const meta = await downloadPdf(filteredItems);
    await persistExport(meta);
    await refreshAll();
    setExporting(false);
  }, [filteredItems, persistExport, refreshAll]);

  const handleClosePeriod = useCallback(async (year: number, month: number, notes?: string) => {
    if (mutating) return;
    setMutating(true);
    try {
      await fetch("/api/billing/closures", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ year, month, notes }) });
      await mutateClosures();
    } finally { setMutating(false); }
  }, [mutateClosures, mutating]);

  const handleReopenPeriod = useCallback(async (closureId: string) => {
    if (mutating) return;
    setMutating(true);
    try {
      await fetch(`/api/billing/closures/${closureId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "reopened" }) });
      await mutateClosures();
    } finally { setMutating(false); }
  }, [mutateClosures, mutating]);

  const handleActSuggestion = useCallback(async (suggestion: HealthSuggestion) => {
    if (mutating) return;
    setMutating(true);
    try {
      if (suggestion.type === "unbilled_order" && suggestion.orderId) {
        await fetch("/api/billing/from-order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ order_id: suggestion.orderId }) });
        await refreshAll();
      } else if (suggestion.type === "missing_recurring" && suggestion.profileId) {
        await fetch(`/api/billing/recurring/${suggestion.profileId}/generate`, { method: "POST" });
        await refreshAll();
      }
    } finally { setMutating(false); }
  }, [refreshAll, mutating]);

  const clearFilters = useCallback(() => {
    setFilterClient(""); setFilterPeriod("all"); setFilterCategory(""); setFilterUnexported(false); setSearch("");
  }, []);

  /* ── Bulk actions ── */
  const bulkChangeStatus = useCallback(async (newStatus: BillingStatusKey) => {
    setBulkLoading(true);
    const promises = selectedItems.map(item => {
      if (item.type === "order") {
        const updates: Record<string, unknown> = { status: billingToOrderStatus(newStatus) };
        if (newStatus === "invoiced") updates.invoiced_at = new Date().toISOString().slice(0, 10);
        if (newStatus === "paid") { updates.paid = true; updates.paid_at = new Date().toISOString().slice(0, 10); }
        if (newStatus === "ready" || newStatus === "in_progress") updates.paid = false;
        return fetch(`/api/orders/${item.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updates) });
      } else {
        const manualMap: Record<BillingStatusKey, string> = { in_progress: "draft", ready: "ready", invoiced: "invoiced", paid: "paid" };
        const updates: Record<string, unknown> = { status: manualMap[newStatus] };
        if (newStatus === "paid") updates.paid_at = new Date().toISOString().slice(0, 10);
        return fetch(`/api/billing/items/${item.billingItemId || item.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updates) });
      }
    });
    await Promise.all(promises);
    clearSelection();
    await refreshAll();
    setBulkLoading(false);
  }, [selectedItems, clearSelection, refreshAll]);

  const bulkMarkInvoiced = useCallback(() => {
    const eligible = selectedItems.filter(i => i.billingStatus === "ready");
    if (eligible.length === 0) return;
    setSelectedIds(new Set(eligible.map(i => i.id)));
    return bulkChangeStatus("invoiced");
  }, [selectedItems, bulkChangeStatus]);

  const bulkMarkPaid = useCallback(() => {
    const eligible = selectedItems.filter(i => i.billingStatus === "invoiced");
    if (eligible.length === 0) return;
    setSelectedIds(new Set(eligible.map(i => i.id)));
    return bulkChangeStatus("paid");
  }, [selectedItems, bulkChangeStatus]);

  const bulkExport = useCallback(async () => {
    if (selectedItems.length === 0) return;
    setBulkLoading(true);
    const meta = downloadCsv(selectedItems);
    await persistExport(meta);
    clearSelection();
    await refreshAll();
    setBulkLoading(false);
  }, [selectedItems, persistExport, clearSelection, refreshAll]);

  useEffect(() => {
    if (selectedIds.size === 0) return;
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "Escape") { clearSelection(); return; }
      if (e.key === "f" || e.key === "F") { e.preventDefault(); bulkMarkInvoiced(); return; }
      if (e.key === "p" || e.key === "P") { e.preventDefault(); bulkMarkPaid(); return; }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [selectedIds.size, clearSelection, bulkMarkInvoiced, bulkMarkPaid]);

  const loading = loadingItems;
  const viewTotalHt = useMemo(() => filteredItems.reduce((s, i) => s + i.amount, 0), [filteredItems]);

  return (
    <div className="max-w-[1120px] mx-auto">

      {/* ══════════════════════ HEADER ══════════════════════ */}
      <motion.div className="mb-8" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[24px] font-bold text-[#1A1A1A] tracking-tight">Facturation</h1>
            <p className="text-[14px] text-[#78716C] mt-1 leading-relaxed">
              Pilotez le cycle financier de vos commandes — de la livraison au paiement.
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="relative group/outils">
              <button className="flex items-center gap-1.5 text-[13px] font-medium text-[#57534E] border border-[#E6E6E4] px-3 py-2 rounded-lg hover:bg-[#F7F7F5] transition-colors">
                <Wrench size={14} /> Outils <ChevronDown size={12} />
              </button>
              <div className="absolute left-0 top-full mt-1 bg-white border border-[#E6E6E4] rounded-lg shadow-lg opacity-0 invisible group-hover/outils:opacity-100 group-hover/outils:visible transition-all z-30 min-w-[180px] py-1">
                <a href="/facturation/templates" className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#44403C] hover:bg-[#F7F7F5] transition-colors">
                  <FileText size={14} className="text-[#A8A29E]" /> Modèles
                </a>
                <a href="/facturation/templates" className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#44403C] hover:bg-[#F7F7F5] transition-colors">
                  <Repeat size={14} className="text-[#A8A29E]" /> Récurrences
                </a>
                <button onClick={() => setShowArchives(true)} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#44403C] hover:bg-[#F7F7F5] transition-colors">
                  <Archive size={14} className="text-[#A8A29E]" /> Archives
                </button>
              </div>
            </div>

            <div className="relative group/finance">
              <button className="flex items-center gap-1.5 text-[13px] font-medium text-[#57534E] border border-[#E6E6E4] px-3 py-2 rounded-lg hover:bg-[#F7F7F5] transition-colors">
                <Wallet size={14} /> Finance <ChevronDown size={12} />
              </button>
              <div className="absolute left-0 top-full mt-1 bg-white border border-[#E6E6E4] rounded-lg shadow-lg opacity-0 invisible group-hover/finance:opacity-100 group-hover/finance:visible transition-all z-30 min-w-[190px] py-1">
                <button onClick={() => setShowMonthlyClose(true)} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#44403C] hover:bg-[#F7F7F5] transition-colors">
                  <ClipboardCheck size={14} className="text-[#A8A29E]" /> Clôture mensuelle
                </button>
                <button onClick={() => setShowExports(true)} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#44403C] hover:bg-[#F7F7F5] transition-colors">
                  <History size={14} className="text-[#A8A29E]" /> Exports
                  {(dbExports || []).length > 0 && (
                    <span className="ml-auto text-[10px] font-bold bg-[#F0EEFF] text-[#7C3AED] px-1.5 py-0.5 rounded-full">{(dbExports || []).length}</span>
                  )}
                </button>
                <div className="h-px bg-[#F0F0EE] mx-2 my-1" />
                <button onClick={handleExportCsv} disabled={filteredItems.length === 0 || exporting} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#44403C] hover:bg-[#F7F7F5] transition-colors disabled:opacity-40">
                  <FileDown size={14} className="text-[#A8A29E]" /> Exporter CSV
                </button>
                <button onClick={handleExportPdf} disabled={filteredItems.length === 0 || exporting} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#44403C] hover:bg-[#F7F7F5] transition-colors disabled:opacity-40">
                  <FileDown size={14} className="text-red-400" /> Exporter PDF
                </button>
              </div>
            </div>

            <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 text-[13px] font-medium text-[#57534E] border border-[#E6E6E4] px-3 py-2 rounded-lg hover:bg-[#F7F7F5] transition-colors">
              <Plus size={14} /> Ligne manuelle
            </button>
            <a href="/commandes" className="flex items-center gap-1.5 text-[13px] font-semibold text-white bg-[#7C3AED] px-4 py-2 rounded-lg hover:bg-[#6D28D9] transition-colors shadow-sm shadow-[#7C3AED]/20">
              <Plus size={14} strokeWidth={2.5} /> Nouvelle commande
            </a>
          </div>
        </div>
      </motion.div>

      {/* ══════════════════════ KPI CARDS ══════════════════════ */}
      <motion.div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-[#E6E6E4] bg-white p-4 animate-pulse">
              <div className="h-2.5 bg-[#F0F0EE] rounded w-16 mb-3" />
              <div className="h-6 bg-[#F0F0EE] rounded w-20" />
            </div>
          ))
        ) : (
          <>
            <KpiCard icon={<TrendingUp size={14} />} label="CA total" value={formatEur(pipelineStats.total)} sub={`${pipelineStats.count} commande${pipelineStats.count > 1 ? "s" : ""}`} />
            <KpiCard icon={<AlertCircle size={14} />} label="En cours" value={formatEur(pipelineStats.inProgress)} sub={`${pipelineStats.inProgressCount} en production`} warn={pipelineStats.inProgressCount > 0} />
            <KpiCard icon={<Sparkles size={14} />} label="Prêtes" value={formatEur(pipelineStats.ready)} sub={`${pipelineStats.readyCount} à facturer`} accent />
            <KpiCard icon={<Receipt size={14} />} label="Facturées" value={formatEur(pipelineStats.invoiced)} sub={`${pipelineStats.invoicedCount} en attente`} />
            <KpiCard icon={<CheckCircle2 size={14} />} label="Payées" value={formatEur(pipelineStats.paid)} sub={`${pipelineStats.paidCount} encaissée${pipelineStats.paidCount > 1 ? "s" : ""}`} />
            <KpiCard icon={<Users size={14} />} label="Clients actifs" value={String(pipelineStats.activeClients)} />
          </>
        )}
      </motion.div>

      {/* ══════════════════════ BILLING INTELLIGENCE ══════════════════════ */}
      {health && (health.counts.errors > 0 || health.counts.warnings > 0 || health.suggestions.length > 0) && (
        <motion.div className="mb-5" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.07 }}>
          <BillingHealthPanel health={health} expanded={healthExpanded} onToggle={() => setHealthExpanded(!healthExpanded)} onActSuggestion={handleActSuggestion} mutating={mutating} />
        </motion.div>
      )}

      {/* ══════════════════════ FILTER BAR ══════════════════════ */}
      <motion.div className="mb-4" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-[320px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C4C4C2]" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher une commande..." className="w-full pl-9 pr-3 py-2 text-[13px] text-[#1A1A1A] bg-white border border-[#E6E6E4] rounded-lg focus:outline-none focus:border-[#7C3AED]/40 focus:ring-2 focus:ring-[#7C3AED]/8 placeholder:text-[#C4C4C2] transition-all" />
          </div>
          <div className="relative">
            <select value={filterPeriod} onChange={e => setFilterPeriod(e.target.value as PeriodKey)} className="pl-3 pr-8 py-2 text-[12px] font-medium text-[#57534E] bg-white border border-[#E6E6E4] rounded-lg focus:outline-none focus:border-[#7C3AED]/40 focus:ring-2 focus:ring-[#7C3AED]/8 transition-all appearance-none cursor-pointer">
              {periodOptions.map(p => (<option key={p.key} value={p.key}>{p.label}</option>))}
            </select>
            <Calendar size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A8A29E] pointer-events-none" />
          </div>
          <div className="relative">
            <select value={filterClient} onChange={e => setFilterClient(e.target.value)} className="pl-3 pr-8 py-2 text-[12px] font-medium text-[#57534E] bg-white border border-[#E6E6E4] rounded-lg focus:outline-none focus:border-[#7C3AED]/40 focus:ring-2 focus:ring-[#7C3AED]/8 transition-all appearance-none cursor-pointer">
              <option value="">Tous les clients</option>
              {clients.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
            <User size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A8A29E] pointer-events-none" />
          </div>
          {categories.length > 0 && (
            <div className="relative">
              <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="pl-3 pr-8 py-2 text-[12px] font-medium text-[#57534E] bg-white border border-[#E6E6E4] rounded-lg focus:outline-none focus:border-[#7C3AED]/40 focus:ring-2 focus:ring-[#7C3AED]/8 transition-all appearance-none cursor-pointer">
                <option value="">Toutes catégories</option>
                {categories.map(c => (<option key={c} value={c}>{c}</option>))}
              </select>
              <Tag size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A8A29E] pointer-events-none" />
            </div>
          )}
          <button onClick={() => setFilterUnexported(!filterUnexported)} className={`flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium rounded-lg border transition-all cursor-pointer ${filterUnexported ? "bg-[#F0EEFF] border-[#DDD6FE] text-[#6D28D9]" : "bg-white border-[#E6E6E4] text-[#78716C] hover:bg-[#FAFAF9]"}`}>
            <Filter size={12} /> Non payées
          </button>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1 px-2.5 py-2 text-[12px] font-medium text-[#7C3AED] hover:bg-[#F0EEFF] rounded-lg transition-colors cursor-pointer">
              <RotateCcw size={12} /> Réinitialiser
            </button>
          )}
          <div className="flex-1" />
          <div className="flex items-center bg-white border border-[#E6E6E4] rounded-lg overflow-hidden">
            {([
              { key: "list" as ViewMode, icon: <LayoutList size={14} />, label: "Liste" },
              { key: "client" as ViewMode, icon: <User size={14} />, label: "Par client" },
              { key: "period" as ViewMode, icon: <Calendar size={14} />, label: "Par mois" },
            ]).map(v => (
              <button key={v.key} onClick={() => setViewMode(v.key)} title={v.label} className={`p-2 transition-all ${viewMode === v.key ? "bg-[#F0EEFF] text-[#6D28D9]" : "text-[#C4C4C2] hover:text-[#78716C] hover:bg-[#FAFAF9]"}`}>
                {v.icon}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ══════════════════════ CONTENT CARD ══════════════════════ */}
      <motion.div className="bg-white rounded-xl border border-[#E6E6E4] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#F0F0EE] bg-[#FAFAF9]">
          <div className="flex items-center gap-0.5">
            {tabs.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-all ${activeTab === tab.key ? "bg-white text-[#1A1A1A] shadow-sm border border-[#E6E6E4]" : "text-[#78716C] hover:text-[#57534E] hover:bg-white/60"}`}>
                {tab.label}
                <span className={`text-[10px] tabular-nums px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? "bg-[#F0EEFF] text-[#7C3AED]" : "text-[#A8A29E]"}`}>{tabCounts[tab.key]}</span>
              </button>
            ))}
          </div>
          <div className="text-[12px] text-[#A8A29E] tabular-nums">
            {filteredItems.length} résultat{filteredItems.length > 1 ? "s" : ""}{hasActiveFilters && " (filtré)"}
          </div>
        </div>

        {pipelineError ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-[13px]">
              <AlertCircle size={16} />
              <div className="text-left">
                <div className="font-semibold">Erreur de chargement des données</div>
                <div className="text-red-600 text-[12px] mt-0.5">{pipelineError}</div>
                <div className="text-red-500 text-[11px] mt-1">Vérifiez que les migrations billing (036+) sont appliquées.</div>
              </div>
            </div>
          </div>
        ) : loading ? (
          <div className="p-5 space-y-2.5">
            {Array.from({ length: 6 }).map((_, i) => (<div key={i} className="h-[52px] bg-[#FAFAF9] rounded-lg animate-pulse" />))}
          </div>
        ) : filteredItems.length === 0 ? (
          <EmptyState hasItems={items.length > 0} hasFilters={hasActiveFilters} onClear={clearFilters} />
        ) : viewMode === "client" ? (
          <GroupedView groups={byClient} icon={<User size={13} className="text-[#7C3AED]" />} items={filteredItems} onRowClick={openOrderDrawer} onStatusChange={handleBillingStatusChange} onDelete={handleDelete} mutating={mutating} />
        ) : viewMode === "period" ? (
          <GroupedView groups={byMonth} icon={<Calendar size={13} className="text-[#7C3AED]" />} items={filteredItems} onRowClick={openOrderDrawer} onStatusChange={handleBillingStatusChange} onDelete={handleDelete} mutating={mutating} />
        ) : (
          <div>
            <AnimatePresence>
              {selectedIds.size > 0 && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }} className="mx-4 mt-3 mb-1 flex items-center gap-3 px-4 py-2.5 bg-[#FAFAF9] border border-[#E6E6E4] rounded-lg">
                  <span className="text-[13px] font-semibold text-[#1A1A1A] tabular-nums">{selectedIds.size} sélectionnée{selectedIds.size > 1 ? "s" : ""}</span>
                  <div className="h-4 w-px bg-[#E6E6E4]" />
                  {bulkActions.canInvoice && (<button onClick={bulkMarkInvoiced} disabled={bulkLoading} className="flex items-center gap-1.5 text-[12px] font-medium text-[#7C3AED] bg-[#F0EEFF] px-3 py-1.5 rounded-md hover:bg-[#E8E0FF] transition-colors disabled:opacity-50"><Receipt size={13} /> Facturer</button>)}
                  {bulkActions.canPay && (<button onClick={bulkMarkPaid} disabled={bulkLoading} className="flex items-center gap-1.5 text-[12px] font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-md hover:bg-emerald-100 transition-colors disabled:opacity-50"><CheckCircle2 size={13} /> Marquer payées</button>)}
                  {bulkActions.canExport && (<button onClick={bulkExport} disabled={bulkLoading} className="flex items-center gap-1.5 text-[12px] font-medium text-[#57534E] bg-white border border-[#E6E6E4] px-3 py-1.5 rounded-md hover:bg-[#F7F7F5] transition-colors disabled:opacity-50"><Download size={13} /> Exporter</button>)}
                  <button onClick={clearSelection} className="ml-auto flex items-center gap-1 text-[12px] font-medium text-[#A8A29E] hover:text-[#57534E] transition-colors"><X size={13} /> Annuler</button>
                </motion.div>
              )}
            </AnimatePresence>

            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F0F0EE]">
                  <th className="w-10 px-4 py-2.5">
                    <input type="checkbox" checked={filteredItems.length > 0 && selectedIds.size === filteredItems.length} ref={el => { if (el) el.indeterminate = selectedIds.size > 0 && selectedIds.size < filteredItems.length; }} onChange={toggleAll} className="w-3.5 h-3.5 rounded border-[#D6D3D1] text-[#7C3AED] focus:ring-[#7C3AED] focus:ring-offset-0 cursor-pointer accent-[#7C3AED]" />
                  </th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#A8A29E] uppercase tracking-wider">Commande</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#A8A29E] uppercase tracking-wider">Client</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#A8A29E] uppercase tracking-wider">Production</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#A8A29E] uppercase tracking-wider">Facturation</th>
                  <th className="text-right px-4 py-2.5 text-[11px] font-semibold text-[#A8A29E] uppercase tracking-wider">Montant</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => (
                  <ItemRow key={item.id} item={item} selected={selectedIds.has(item.id)} onToggle={(shiftKey) => toggleSelection(item.id, shiftKey)} onClick={() => openOrderDrawer(item)} onStatusChange={handleBillingStatusChange} onDelete={handleDelete} mutating={mutating} />
                ))}
              </tbody>
            </table>
            <SummaryBar count={filteredItems.length} total={viewTotalHt} />
          </div>
        )}
      </motion.div>

      {/* ══════════════════════ DRAWERS ══════════════════════ */}
      <AnimatePresence>
        {showCreate && (<ManualItemDrawer key="create" clients={clients} onClose={() => setShowCreate(false)} onSave={data => handleSaveManual(data)} />)}
        {detailItem && detailItem.type !== "order" && (<DetailDrawer key={`detail-${detailItem.id}`} item={detailItem} onClose={() => setDetailItem(null)} onStatusChange={(status) => handleBillingStatusChange(detailItem, status)} onDelete={() => handleDelete(detailItem)} mutating={mutating} />)}
        {showExports && (<ExportsDrawer key="exports" exports={dbExports || []} onClose={() => setShowExports(false)} />)}
        {showMonthlyClose && health && (<MonthlyCloseDrawer key="monthly-close" health={health} closures={dbClosures || []} onClose={() => setShowMonthlyClose(false)} onExportCsv={handleExportCsv} onExportPdf={handleExportPdf} onClosePeriod={handleClosePeriod} />)}
        {showArchives && (<ArchivesDrawer key="archives" closures={dbClosures || []} exports={dbExports || []} onClose={() => setShowArchives(false)} onReopen={handleReopenPeriod} />)}
      </AnimatePresence>

      <OrderDrawer order={orderForDrawer} onClose={closeOrderDrawer} patchOrder={patchOrderFromBilling} clients={billingClients} billingStatus={orderDrawerItem?.billingStatus} billingActions={orderBillingActions} onBillingStatusChange={handleOrderBillingStatusChange} billingMutating={mutating} onClientDeleted={refreshAll} />

      <AnimatePresence>
        {orderDrawerLoading && (
          <motion.div className="fixed inset-0 z-40 bg-black/5 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="bg-white rounded-xl shadow-lg px-6 py-4 flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
              <span className="text-[13px] text-[#5A5A58]">Chargement de la commande...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
