"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApi } from "@/lib/hooks/use-api";
import type { BillingItemStatus } from "@/types";
import { isOrderDelivered, billingToOrderStatus } from "@/lib/billing-utils";
import {
  Plus,
  FileText,
  TrendingUp,
  CheckCircle2,
  Download,
  Users,
  Search,
  MoreHorizontal,
  Sparkles,
  X,
  LayoutList,
  User,
  Calendar,
  Trash2,
  ArrowRight,
  AlertCircle,
  Receipt,
  Filter,
  RotateCcw,
  Pencil,
  Copy,
  Tag,
  Hash,
  StickyNote,
  History,
  ShieldCheck,
  Lightbulb,
  CircleCheck,
  CircleAlert,
  Info,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  Zap,
  TriangleAlert,
  Archive,
  Lock,
  Unlock,
  FileDown,
  Wrench,
  Wallet,
  Repeat,
} from "lucide-react";

/* ══════════════════════════════════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════════════════════════════════ */

function formatEur(n: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function formatDateLong(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

/* ── Pipeline item type (unified order + manual) ── */

interface PipelineItem {
  id: string;
  type: "order" | "manual" | "recurring";
  title: string;
  clientId: string | null;
  clientName: string | null;
  amount: number;
  taxRate: number;
  taxAmount: number;
  totalTtc: number;
  billingStatus: BillingStatusKey;
  orderStatus?: string | null;
  priority?: string | null;
  createdAt: string;
  deadline?: string | null;
  deliveredAt?: string | null;
  invoicedAt?: string | null;
  paidAt?: string | null;
  category: string;
  tags: string[];
  notes: string;
  source: string;
  // Manual item extra fields
  quantity?: number;
  unit?: string;
  unitPrice?: number;
  description?: string;
  billingItemId?: string;
}

type BillingStatusKey = "in_progress" | "ready" | "invoiced" | "paid";

/* ── Billing status config ── */

const billingStatusConfig: Record<BillingStatusKey, { label: string; bg: string; text: string; dot: string }> = {
  in_progress: { label: "En cours", bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400" },
  ready: { label: "Prête", bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-500" },
  invoiced: { label: "Facturée", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  paid: { label: "Payée", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
};

const orderStatusLabels: Record<string, string> = {
  new: "Nouveau",
  brief_received: "Brief reçu",
  in_progress: "En production",
  in_review: "En révision",
  validated: "Validé",
  delivered: "Livré",
  invoiced: "Facturé",
  paid: "Payé",
};

const sourceLabels: Record<string, string> = {
  manual: "Saisie manuelle",
  order: "Commande",
  recurring: "Récurrent",
  template: "Template",
  task: "Tâche",
};

function BillingBadge({ status, size = "sm" }: { status: BillingStatusKey; size?: "sm" | "md" }) {
  const c = billingStatusConfig[status] || billingStatusConfig.in_progress;
  const sizeClass = size === "md" ? "px-3 py-1 text-[12px]" : "px-2.5 py-0.5 text-[11px]";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${sizeClass} ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  const label = orderStatusLabels[status] || status;
  const delivered = isOrderDelivered(status);
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md ${
      delivered ? "bg-emerald-50 text-emerald-600" : "bg-[#F5F5F4] text-[#78716C]"
    }`}>
      {delivered && <CheckCircle2 size={9} />}
      {label}
    </span>
  );
}

/* ── Tab config ── */

type TabKey = "all" | "in_progress" | "ready" | "invoiced" | "paid";

const tabs: { key: TabKey; label: string; billingStatuses: BillingStatusKey[] }[] = [
  { key: "all", label: "Toutes", billingStatuses: [] },
  { key: "in_progress", label: "En cours", billingStatuses: ["in_progress"] },
  { key: "ready", label: "Prêtes", billingStatuses: ["ready"] },
  { key: "invoiced", label: "Facturées", billingStatuses: ["invoiced"] },
  { key: "paid", label: "Payées", billingStatuses: ["paid"] },
];

/* ── View mode ── */

type ViewMode = "list" | "client" | "period";

/* ── Billing transitions ── */

const billingTransitions: Record<BillingStatusKey, { label: string; next: BillingStatusKey }[]> = {
  in_progress: [
    { label: "Marquer prête", next: "ready" },
  ],
  ready: [
    { label: "Marquer facturée", next: "invoiced" },
  ],
  invoiced: [
    { label: "Marquer payée", next: "paid" },
    { label: "Retour prête", next: "ready" },
  ],
  paid: [
    { label: "Retour facturée", next: "invoiced" },
  ],
};

/* ── Period filter ── */

type PeriodKey = "all" | "week" | "month" | "quarter" | "year";

const periodOptions: { key: PeriodKey; label: string }[] = [
  { key: "all", label: "Toutes les dates" },
  { key: "week", label: "Cette semaine" },
  { key: "month", label: "Ce mois-ci" },
  { key: "quarter", label: "Ce trimestre" },
  { key: "year", label: "Cette année" },
];

function getPeriodRange(key: PeriodKey): { start: string; end: string } | null {
  if (key === "all") return null;
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();
  const day = now.getDay();
  let start: Date;
  let end: Date;
  switch (key) {
    case "week": {
      const diff = day === 0 ? 6 : day - 1;
      start = new Date(y, m, d - diff);
      end = new Date(y, m, d + (6 - diff));
      break;
    }
    case "month":
      start = new Date(y, m, 1);
      end = new Date(y, m + 1, 0);
      break;
    case "quarter": {
      const q = Math.floor(m / 3);
      start = new Date(y, q * 3, 1);
      end = new Date(y, q * 3 + 3, 0);
      break;
    }
    case "year":
      start = new Date(y, 0, 1);
      end = new Date(y, 11, 31);
      break;
  }
  return {
    start: start!.toISOString().slice(0, 10),
    end: end!.toISOString().slice(0, 10),
  };
}

/* ── Export helpers ── */

interface ExportMeta {
  filename: string;
  format: "csv" | "pdf";
  itemCount: number;
  totalHt: number;
  totalTva: number;
  totalTtc: number;
  clientCount: number;
  clientIds: string[];
  itemIds: string[];
  periodStart: string | null;
  periodEnd: string | null;
}

function computeExportMeta(items: PipelineItem[], format: "csv" | "pdf"): ExportMeta {
  const totalHt = items.reduce((s, i) => s + i.amount, 0);
  const totalTva = items.reduce((s, i) => s + (i.taxAmount || 0), 0);
  const totalTtc = items.reduce((s, i) => s + (i.totalTtc || i.amount), 0);
  const dates = items.map(i => i.createdAt?.split("T")[0]).filter(Boolean).sort();
  const clientSet = new Set(items.filter(i => i.clientId).map(i => i.clientId!));
  const ext = format === "pdf" ? "pdf" : "csv";
  const filename = `facturation-${new Date().toISOString().slice(0, 10)}.${ext}`;
  return {
    filename, format,
    itemCount: items.length,
    totalHt, totalTva, totalTtc,
    clientCount: clientSet.size,
    clientIds: Array.from(clientSet),
    itemIds: items.map(i => i.id),
    periodStart: dates[0] || null,
    periodEnd: dates[dates.length - 1] || null,
  };
}

function downloadCsv(items: PipelineItem[]): ExportMeta {
  const headers = ["Titre", "Client", "Type", "Montant HT", "TVA %", "Montant TVA", "Total TTC", "Statut facturation", "Statut commande", "Date création", "Date livraison"];
  const rows = items.map(i => [
    i.title, i.clientName || "", i.type === "order" ? "Commande" : "Manuel",
    i.amount, i.taxRate || 0, i.taxAmount || 0, i.totalTtc || i.amount,
    billingStatusConfig[i.billingStatus]?.label || i.billingStatus,
    i.orderStatus ? (orderStatusLabels[i.orderStatus] || i.orderStatus) : "",
    i.createdAt?.split("T")[0] || "", i.deliveredAt || "",
  ]);
  const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const meta = computeExportMeta(items, "csv");
  a.download = meta.filename;
  a.click();
  URL.revokeObjectURL(url);
  return meta;
}

async function downloadPdf(items: PipelineItem[], periodLabel?: string): Promise<ExportMeta> {
  const jsPDF = (await import("jspdf")).default;
  await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();

  // Header band
  doc.setFillColor(124, 58, 237);
  doc.rect(0, 0, pageW, 36, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Récapitulatif de facturation", 16, 18);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const subtitle = periodLabel || new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  doc.text(subtitle.charAt(0).toUpperCase() + subtitle.slice(1), 16, 28);

  // Export date
  doc.setFontSize(9);
  doc.text(`Exporté le ${new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`, pageW - 16, 28, { align: "right" });

  // Reset text color
  doc.setTextColor(26, 26, 26);

  // Summary cards
  const meta = computeExportMeta(items, "pdf");
  const y0 = 46;

  // Summary row
  doc.setFontSize(9);
  doc.setTextColor(120, 113, 108);
  const summaryPairs = [
    ["PRESTATIONS", String(meta.itemCount)],
    ["CLIENTS", String(meta.clientCount)],
    ["TOTAL HT", formatEur(meta.totalHt)],
    ["TVA", formatEur(meta.totalTva)],
    ["TOTAL TTC", formatEur(meta.totalTtc)],
  ];
  const colW = (pageW - 32) / summaryPairs.length;
  summaryPairs.forEach(([label, val], idx) => {
    const cx = 16 + idx * colW;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 113, 108);
    doc.text(label, cx, y0);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(26, 26, 26);
    doc.text(val, cx, y0 + 7);
  });

  // Separator
  doc.setDrawColor(230, 230, 228);
  doc.line(16, y0 + 14, pageW - 16, y0 + 14);

  // Table
  const tableY = y0 + 20;
  const tableData = items.map(i => [
    i.title.slice(0, 40),
    i.clientName || "—",
    i.type === "order" ? "Commande" : "Manuel",
    formatEur(i.amount),
    (i.taxRate || 0) > 0 ? `${i.taxRate}%` : "—",
    formatEur(i.totalTtc || i.amount),
    billingStatusConfig[i.billingStatus]?.label || "—",
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (doc as any).autoTable({
    startY: tableY,
    head: [["Titre", "Client", "Type", "Montant HT", "TVA", "Total TTC", "Statut"]],
    body: tableData,
    styles: {
      fontSize: 8,
      cellPadding: 3,
      textColor: [26, 26, 26],
      lineColor: [240, 240, 238],
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: [250, 250, 249],
      textColor: [87, 83, 78],
      fontStyle: "bold",
      fontSize: 7.5,
    },
    alternateRowStyles: {
      fillColor: [252, 252, 251],
    },
    columnStyles: {
      3: { halign: "right" as const, fontStyle: "bold" as const },
      4: { halign: "center" as const },
      5: { halign: "right" as const, fontStyle: "bold" as const },
    },
    margin: { left: 16, right: 16 },
    didDrawPage: () => {
      // Footer on each page
      doc.setFontSize(7);
      doc.setTextColor(168, 162, 158);
      doc.text("Jestly — Récapitulatif de facturation", 16, doc.internal.pageSize.getHeight() - 8);
      doc.text(
        `Page ${doc.getCurrentPageInfo().pageNumber}`,
        pageW - 16,
        doc.internal.pageSize.getHeight() - 8,
        { align: "right" }
      );
    },
  });

  // Totals row after table
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable?.finalY || tableY + 20;
  if (finalY + 30 < doc.internal.pageSize.getHeight()) {
    doc.setDrawColor(124, 58, 237);
    doc.setLineWidth(0.5);
    doc.line(pageW - 100, finalY + 6, pageW - 16, finalY + 6);
    doc.setFontSize(9);
    doc.setTextColor(87, 83, 78);
    doc.setFont("helvetica", "normal");
    doc.text("Total HT :", pageW - 100, finalY + 14);
    doc.text("TVA :", pageW - 100, finalY + 21);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(26, 26, 26);
    doc.text(formatEur(meta.totalHt), pageW - 16, finalY + 14, { align: "right" });
    doc.text(formatEur(meta.totalTva), pageW - 16, finalY + 21, { align: "right" });

    doc.setFontSize(11);
    doc.setTextColor(124, 58, 237);
    doc.text("Total TTC :", pageW - 100, finalY + 30);
    doc.text(formatEur(meta.totalTtc), pageW - 16, finalY + 30, { align: "right" });
  }

  doc.save(meta.filename);
  return meta;
}

/* ── Stats interface ── */

interface BillingStats {
  totalHt: number;
  totalTtc: number;
  readyHt: number;
  readyTtc: number;
  exportedHt: number;
  invoicedHt: number;
  monthHt: number;
  activeClients: number;
  itemCount: number;
  draftCount: number;
  readyCount: number;
}

/* ── Health API types ── */

interface HealthAnomaly {
  id: string;
  type: string;
  severity: "error" | "warning" | "info";
  title: string;
  description: string;
  itemId?: string;
  itemTitle?: string;
  fix?: string;
}

interface HealthSuggestion {
  id: string;
  type: string;
  title: string;
  description: string;
  orderId?: string;
  profileId?: string;
  clientName?: string;
  amount?: number;
  action: string;
}

interface HealthCheckItem {
  id: string;
  label: string;
  description: string;
  done: boolean;
  count?: number;
  severity: "success" | "warning" | "error";
}

interface HealthData {
  score: number;
  anomalies: HealthAnomaly[];
  suggestions: HealthSuggestion[];
  checklist: HealthCheckItem[];
  month: {
    label: string;
    totalItems: number;
    totalHt: number;
    readyHt: number;
    drafts: number;
    ready: number;
    exported: number;
    invoiced: number;
  };
  counts: {
    errors: number;
    warnings: number;
    infos: number;
    suggestions: number;
  };
}

/* ── Shared Tailwind tokens ── */

const tw = {
  input: "w-full px-3.5 py-2.5 text-[13px] text-[#1A1A1A] border border-[#E6E6E4] rounded-lg bg-white focus:outline-none focus:border-[#7C3AED]/40 focus:ring-2 focus:ring-[#7C3AED]/8 placeholder:text-[#C4C4C2] transition-all",
  label: "block text-[12px] font-medium text-[#57534E] mb-1.5",
  select: "w-full px-3.5 py-2.5 text-[13px] text-[#1A1A1A] border border-[#E6E6E4] rounded-lg bg-white focus:outline-none focus:border-[#7C3AED]/40 focus:ring-2 focus:ring-[#7C3AED]/8 transition-all appearance-none",
} as const;

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
  const [showFilters, setShowFilters] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState<PipelineItem | null>(null);
  const [detailItem, setDetailItem] = useState<PipelineItem | null>(null);
  const [showExports, setShowExports] = useState(false);
  const [showMonthlyClose, setShowMonthlyClose] = useState(false);
  const [showArchives, setShowArchives] = useState(false);
  const [healthExpanded, setHealthExpanded] = useState(false);
  const [exporting, setExporting] = useState(false);

  /* ── Bulk selection (state only — functions defined after filteredItems) ── */
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

    // Tab filter
    const tabDef = tabs.find(t => t.key === activeTab);
    if (tabDef && tabDef.billingStatuses.length > 0) {
      filtered = filtered.filter(i => tabDef.billingStatuses.includes(i.billingStatus));
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(i =>
        i.title.toLowerCase().includes(q) ||
        (i.clientName || "").toLowerCase().includes(q) ||
        (i.category || "").toLowerCase().includes(q) ||
        (i.notes || "").toLowerCase().includes(q)
      );
    }

    // Client filter
    if (filterClient) {
      filtered = filtered.filter(i => i.clientId === filterClient);
    }

    // Period filter
    const range = getPeriodRange(filterPeriod);
    if (range) {
      filtered = filtered.filter(i => {
        const d = i.createdAt?.split("T")[0];
        if (!d) return false;
        return d >= range.start && d <= range.end;
      });
    }

    // Category filter
    if (filterCategory) {
      filtered = filtered.filter(i => i.category === filterCategory);
    }

    // Unpaid only
    if (filterUnexported) {
      filtered = filtered.filter(i => i.billingStatus !== "paid");
    }

    // DEBUG: trace filtering
    console.log(`[Facturation FILTER] tab=${activeTab} | before=${items.length} | after=${filtered.length} | search="${search}" | client=${filterClient || "all"} | period=${filterPeriod} | category=${filterCategory || "all"} | unexported=${filterUnexported}`);

    return filtered;
  }, [items, activeTab, search, filterClient, filterPeriod, filterCategory, filterUnexported]);

  /* ── Bulk selection functions (after filteredItems is available) ── */
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

  // Clear selection when tab or filters change
  useEffect(() => { clearSelection(); }, [activeTab, filterClient, filterPeriod, filterCategory, filterUnexported, clearSelection]);

  // Selected items derived
  const selectedItems = useMemo(() =>
    filteredItems.filter(i => selectedIds.has(i.id)),
    [filteredItems, selectedIds]
  );

  // Smart actions: determine which bulk actions are relevant
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
    if (item.type === "order") {
      await fetch(`/api/orders/${item.id}`, { method: "DELETE" });
    } else {
      await fetch(`/api/billing/items/${item.billingItemId || item.id}`, { method: "DELETE" });
    }
    await refreshAll();
    if (detailItem?.id === item.id) setDetailItem(null);
  }, [refreshAll, detailItem]);

  const handleSaveManual = useCallback(async (data: Record<string, unknown>, id?: string) => {
    const method = id ? "PATCH" : "POST";
    const url = id ? `/api/billing/items/${id}` : "/api/billing/items";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) return;
    setShowCreate(false);
    setEditItem(null);
    await refreshAll();
  }, [refreshAll]);

  const handleBillingStatusChange = useCallback(async (item: PipelineItem, newStatus: BillingStatusKey) => {
    if (item.type === "order") {
      const updates: Record<string, unknown> = { status: billingToOrderStatus(newStatus) };
      if (newStatus === "invoiced") updates.invoiced_at = new Date().toISOString().slice(0, 10);
      if (newStatus === "paid") {
        updates.paid = true;
        updates.paid_at = new Date().toISOString().slice(0, 10);
      }
      if (newStatus === "ready" || newStatus === "in_progress") {
        updates.paid = false;
      }
      await fetch(`/api/orders/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
    } else {
      // Manual billing item
      const manualStatusMap: Record<BillingStatusKey, BillingItemStatus> = {
        in_progress: "draft",
        ready: "ready",
        invoiced: "invoiced",
        paid: "paid",
      };
      const updates: Record<string, unknown> = { status: manualStatusMap[newStatus] };
      if (newStatus === "paid") updates.paid_at = new Date().toISOString().slice(0, 10);
      await fetch(`/api/billing/items/${item.billingItemId || item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
    }
    await refreshAll();
  }, [refreshAll]);

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
    await fetch("/api/billing/closures", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year, month, notes }),
    });
    await mutateClosures();
  }, [mutateClosures]);

  const handleReopenPeriod = useCallback(async (closureId: string) => {
    await fetch(`/api/billing/closures/${closureId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "reopened" }),
    });
    await mutateClosures();
  }, [mutateClosures]);

  const handleActSuggestion = useCallback(async (suggestion: HealthSuggestion) => {
    if (suggestion.type === "unbilled_order" && suggestion.orderId) {
      await fetch("/api/billing/from-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: suggestion.orderId }),
      });
      await refreshAll();
    } else if (suggestion.type === "missing_recurring" && suggestion.profileId) {
      await fetch(`/api/billing/recurring/${suggestion.profileId}/generate`, { method: "POST" });
      await refreshAll();
    }
  }, [refreshAll]);

  const clearFilters = useCallback(() => {
    setFilterClient("");
    setFilterPeriod("all");
    setFilterCategory("");
    setFilterUnexported(false);
    setSearch("");
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
    // Temporarily set selectedIds to only eligible, then change
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

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    if (selectedIds.size === 0) return;
    const handler = (e: KeyboardEvent) => {
      // Don't fire when typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "Escape") { clearSelection(); return; }
      if (e.key === "f" || e.key === "F") { e.preventDefault(); bulkMarkInvoiced(); return; }
      if (e.key === "p" || e.key === "P") { e.preventDefault(); bulkMarkPaid(); return; }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [selectedIds.size, clearSelection, bulkMarkInvoiced, bulkMarkPaid]);

  const loading = loadingItems;

  /* ── Computed KPI totals for the current view ── */
  const viewTotalHt = useMemo(() => filteredItems.reduce((s, i) => s + i.amount, 0), [filteredItems]);

  return (
    <div className="max-w-[1120px] mx-auto">

      {/* ══════════════════════ HEADER ══════════════════════ */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[24px] font-bold text-[#1A1A1A] tracking-tight">Facturation</h1>
            <p className="text-[14px] text-[#78716C] mt-1 leading-relaxed">
              Pilotez le cycle financier de vos commandes — de la livraison au paiement.
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            {/* ── Menu Outils ── */}
            <div className="relative group/outils">
              <button className="flex items-center gap-1.5 text-[13px] font-medium text-[#57534E] border border-[#E6E6E4] px-3 py-2 rounded-lg hover:bg-[#F7F7F5] transition-colors">
                <Wrench size={14} />
                Outils
                <ChevronDown size={12} />
              </button>
              <div className="absolute left-0 top-full mt-1 bg-white border border-[#E6E6E4] rounded-lg shadow-lg opacity-0 invisible group-hover/outils:opacity-100 group-hover/outils:visible transition-all z-30 min-w-[180px] py-1">
                <a
                  href="/facturation/templates"
                  className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#44403C] hover:bg-[#F7F7F5] transition-colors"
                >
                  <FileText size={14} className="text-[#A8A29E]" />
                  Modèles
                </a>
                <a
                  href="/facturation/templates"
                  className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#44403C] hover:bg-[#F7F7F5] transition-colors"
                >
                  <Repeat size={14} className="text-[#A8A29E]" />
                  Récurrences
                </a>
                <button
                  onClick={() => setShowArchives(true)}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#44403C] hover:bg-[#F7F7F5] transition-colors"
                >
                  <Archive size={14} className="text-[#A8A29E]" />
                  Archives
                </button>
              </div>
            </div>

            {/* ── Menu Finance ── */}
            <div className="relative group/finance">
              <button className="flex items-center gap-1.5 text-[13px] font-medium text-[#57534E] border border-[#E6E6E4] px-3 py-2 rounded-lg hover:bg-[#F7F7F5] transition-colors">
                <Wallet size={14} />
                Finance
                <ChevronDown size={12} />
              </button>
              <div className="absolute left-0 top-full mt-1 bg-white border border-[#E6E6E4] rounded-lg shadow-lg opacity-0 invisible group-hover/finance:opacity-100 group-hover/finance:visible transition-all z-30 min-w-[190px] py-1">
                <button
                  onClick={() => setShowMonthlyClose(true)}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#44403C] hover:bg-[#F7F7F5] transition-colors"
                >
                  <ClipboardCheck size={14} className="text-[#A8A29E]" />
                  Clôture mensuelle
                </button>
                <button
                  onClick={() => setShowExports(true)}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#44403C] hover:bg-[#F7F7F5] transition-colors"
                >
                  <History size={14} className="text-[#A8A29E]" />
                  Exports
                  {(dbExports || []).length > 0 && (
                    <span className="ml-auto text-[10px] font-bold bg-[#F0EEFF] text-[#7C3AED] px-1.5 py-0.5 rounded-full">{(dbExports || []).length}</span>
                  )}
                </button>
                <div className="h-px bg-[#F0F0EE] mx-2 my-1" />
                <button
                  onClick={handleExportCsv}
                  disabled={filteredItems.length === 0 || exporting}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#44403C] hover:bg-[#F7F7F5] transition-colors disabled:opacity-40"
                >
                  <FileDown size={14} className="text-[#A8A29E]" />
                  Exporter CSV
                </button>
                <button
                  onClick={handleExportPdf}
                  disabled={filteredItems.length === 0 || exporting}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#44403C] hover:bg-[#F7F7F5] transition-colors disabled:opacity-40"
                >
                  <FileDown size={14} className="text-red-400" />
                  Exporter PDF
                </button>
              </div>
            </div>

            {/* ── Actions principales ── */}
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 text-[13px] font-medium text-[#57534E] border border-[#E6E6E4] px-3 py-2 rounded-lg hover:bg-[#F7F7F5] transition-colors"
            >
              <Plus size={14} />
              Ligne manuelle
            </button>
            <a
              href="/commandes"
              className="flex items-center gap-1.5 text-[13px] font-semibold text-white bg-[#7C3AED] px-4 py-2 rounded-lg hover:bg-[#6D28D9] transition-colors shadow-sm shadow-[#7C3AED]/20"
            >
              <Plus size={14} strokeWidth={2.5} />
              Nouvelle commande
            </a>
          </div>
        </div>
      </motion.div>

      {/* ══════════════════════ KPI CARDS ══════════════════════ */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-[#E6E6E4] bg-white p-4 animate-pulse">
              <div className="h-2.5 bg-[#F0F0EE] rounded w-16 mb-3" />
              <div className="h-6 bg-[#F0F0EE] rounded w-20" />
            </div>
          ))
        ) : (
          <>
            <KpiCard
              icon={<TrendingUp size={14} />}
              label="Pipeline total"
              value={formatEur(pipelineStats.total)}
              sub={`${pipelineStats.count} commande${pipelineStats.count > 1 ? "s" : ""}`}
            />
            <KpiCard
              icon={<AlertCircle size={14} />}
              label="En cours"
              value={formatEur(pipelineStats.inProgress)}
              sub={`${pipelineStats.inProgressCount} en production`}
              warn={pipelineStats.inProgressCount > 0}
            />
            <KpiCard
              icon={<Sparkles size={14} />}
              label="Prêtes"
              value={formatEur(pipelineStats.ready)}
              sub={`${pipelineStats.readyCount} à facturer`}
              accent
            />
            <KpiCard
              icon={<Receipt size={14} />}
              label="Facturées"
              value={formatEur(pipelineStats.invoiced)}
              sub={`${pipelineStats.invoicedCount} en attente`}
            />
            <KpiCard
              icon={<CheckCircle2 size={14} />}
              label="Payées"
              value={formatEur(pipelineStats.paid)}
              sub={`${pipelineStats.paidCount} encaissée${pipelineStats.paidCount > 1 ? "s" : ""}`}
            />
            <KpiCard
              icon={<Users size={14} />}
              label="Clients actifs"
              value={String(pipelineStats.activeClients)}
            />
          </>
        )}
      </motion.div>

      {/* ══════════════════════ BILLING INTELLIGENCE ══════════════════════ */}
      {health && (health.counts.errors > 0 || health.counts.warnings > 0 || health.suggestions.length > 0) && (
        <motion.div
          className="mb-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.07 }}
        >
          <BillingHealthPanel
            health={health}
            expanded={healthExpanded}
            onToggle={() => setHealthExpanded(!healthExpanded)}
            onActSuggestion={handleActSuggestion}
          />
        </motion.div>
      )}

      {/* ══════════════════════ FILTER BAR ══════════════════════ */}
      <motion.div
        className="mb-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-[320px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C4C4C2]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher une commande..."
              className="w-full pl-9 pr-3 py-2 text-[13px] text-[#1A1A1A] bg-white border border-[#E6E6E4] rounded-lg focus:outline-none focus:border-[#7C3AED]/40 focus:ring-2 focus:ring-[#7C3AED]/8 placeholder:text-[#C4C4C2] transition-all"
            />
          </div>

          {/* Period */}
          <div className="relative">
            <select
              value={filterPeriod}
              onChange={e => setFilterPeriod(e.target.value as PeriodKey)}
              className="pl-3 pr-8 py-2 text-[12px] font-medium text-[#57534E] bg-white border border-[#E6E6E4] rounded-lg focus:outline-none focus:border-[#7C3AED]/40 focus:ring-2 focus:ring-[#7C3AED]/8 transition-all appearance-none cursor-pointer"
            >
              {periodOptions.map(p => (
                <option key={p.key} value={p.key}>{p.label}</option>
              ))}
            </select>
            <Calendar size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A8A29E] pointer-events-none" />
          </div>

          {/* Client */}
          <div className="relative">
            <select
              value={filterClient}
              onChange={e => setFilterClient(e.target.value)}
              className="pl-3 pr-8 py-2 text-[12px] font-medium text-[#57534E] bg-white border border-[#E6E6E4] rounded-lg focus:outline-none focus:border-[#7C3AED]/40 focus:ring-2 focus:ring-[#7C3AED]/8 transition-all appearance-none cursor-pointer"
            >
              <option value="">Tous les clients</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <User size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A8A29E] pointer-events-none" />
          </div>

          {/* Category */}
          {categories.length > 0 && (
            <div className="relative">
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="pl-3 pr-8 py-2 text-[12px] font-medium text-[#57534E] bg-white border border-[#E6E6E4] rounded-lg focus:outline-none focus:border-[#7C3AED]/40 focus:ring-2 focus:ring-[#7C3AED]/8 transition-all appearance-none cursor-pointer"
              >
                <option value="">Toutes catégories</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <Tag size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A8A29E] pointer-events-none" />
            </div>
          )}

          {/* Unexported toggle */}
          <button
            onClick={() => setFilterUnexported(!filterUnexported)}
            className={`flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium rounded-lg border transition-all cursor-pointer ${
              filterUnexported
                ? "bg-[#F0EEFF] border-[#DDD6FE] text-[#6D28D9]"
                : "bg-white border-[#E6E6E4] text-[#78716C] hover:bg-[#FAFAF9]"
            }`}
          >
            <Filter size={12} />
            Non payées
          </button>

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-2.5 py-2 text-[12px] font-medium text-[#7C3AED] hover:bg-[#F0EEFF] rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw size={12} />
              Réinitialiser
            </button>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* View mode toggle */}
          <div className="flex items-center bg-white border border-[#E6E6E4] rounded-lg overflow-hidden">
            {([
              { key: "list" as ViewMode, icon: <LayoutList size={14} />, label: "Liste" },
              { key: "client" as ViewMode, icon: <User size={14} />, label: "Par client" },
              { key: "period" as ViewMode, icon: <Calendar size={14} />, label: "Par mois" },
            ]).map(v => (
              <button
                key={v.key}
                onClick={() => setViewMode(v.key)}
                title={v.label}
                className={`p-2 transition-all ${
                  viewMode === v.key
                    ? "bg-[#F0EEFF] text-[#6D28D9]"
                    : "text-[#C4C4C2] hover:text-[#78716C] hover:bg-[#FAFAF9]"
                }`}
              >
                {v.icon}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ══════════════════════ CONTENT CARD ══════════════════════ */}
      <motion.div
        className="bg-white rounded-xl border border-[#E6E6E4] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        {/* Tabs toolbar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#F0F0EE] bg-[#FAFAF9]">
          <div className="flex items-center gap-0.5">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-all ${
                  activeTab === tab.key
                    ? "bg-white text-[#1A1A1A] shadow-sm border border-[#E6E6E4]"
                    : "text-[#78716C] hover:text-[#57534E] hover:bg-white/60"
                }`}
              >
                {tab.label}
                <span className={`text-[10px] tabular-nums px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.key
                    ? "bg-[#F0EEFF] text-[#7C3AED]"
                    : "text-[#A8A29E]"
                }`}>
                  {tabCounts[tab.key]}
                </span>
              </button>
            ))}
          </div>
          <div className="text-[12px] text-[#A8A29E] tabular-nums">
            {filteredItems.length} résultat{filteredItems.length > 1 ? "s" : ""}
            {hasActiveFilters && " (filtré)"}
          </div>
        </div>

        {/* Table content */}
        {pipelineError ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-[13px]">
              <AlertCircle size={16} />
              <div className="text-left">
                <div className="font-semibold">Erreur de chargement du pipeline</div>
                <div className="text-red-600 text-[12px] mt-0.5">{pipelineError}</div>
                <div className="text-red-500 text-[11px] mt-1">Vérifiez que les migrations billing (036+) sont appliquées.</div>
              </div>
            </div>
          </div>
        ) : loading ? (
          <div className="p-5 space-y-2.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-[52px] bg-[#FAFAF9] rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <EmptyState hasItems={items.length > 0} hasFilters={hasActiveFilters} onClear={clearFilters} />
        ) : viewMode === "client" ? (
          <GroupedView
            groups={byClient}
            icon={<User size={13} className="text-[#7C3AED]" />}
            items={filteredItems}
            onRowClick={setDetailItem}
            onStatusChange={handleBillingStatusChange}
            onDelete={handleDelete}
          />
        ) : viewMode === "period" ? (
          <GroupedView
            groups={byMonth}
            icon={<Calendar size={13} className="text-[#7C3AED]" />}
            items={filteredItems}
            onRowClick={setDetailItem}
            onStatusChange={handleBillingStatusChange}
            onDelete={handleDelete}
          />
        ) : (
          <div>
            {/* ── Bulk Action Bar ── */}
            <AnimatePresence>
              {selectedIds.size > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="mx-4 mt-3 mb-1 flex items-center gap-3 px-4 py-2.5 bg-[#FAFAF9] border border-[#E6E6E4] rounded-lg"
                >
                  <span className="text-[13px] font-semibold text-[#1A1A1A] tabular-nums">
                    {selectedIds.size} sélectionnée{selectedIds.size > 1 ? "s" : ""}
                  </span>
                  <div className="h-4 w-px bg-[#E6E6E4]" />
                  {bulkActions.canInvoice && (
                    <button
                      onClick={bulkMarkInvoiced}
                      disabled={bulkLoading}
                      className="flex items-center gap-1.5 text-[12px] font-medium text-[#7C3AED] bg-[#F0EEFF] px-3 py-1.5 rounded-md hover:bg-[#E8E0FF] transition-colors disabled:opacity-50"
                    >
                      <Receipt size={13} />
                      Facturer
                    </button>
                  )}
                  {bulkActions.canPay && (
                    <button
                      onClick={bulkMarkPaid}
                      disabled={bulkLoading}
                      className="flex items-center gap-1.5 text-[12px] font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-md hover:bg-emerald-100 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle2 size={13} />
                      Marquer payées
                    </button>
                  )}
                  {bulkActions.canExport && (
                    <button
                      onClick={bulkExport}
                      disabled={bulkLoading}
                      className="flex items-center gap-1.5 text-[12px] font-medium text-[#57534E] bg-white border border-[#E6E6E4] px-3 py-1.5 rounded-md hover:bg-[#F7F7F5] transition-colors disabled:opacity-50"
                    >
                      <Download size={13} />
                      Exporter
                    </button>
                  )}
                  <button
                    onClick={clearSelection}
                    className="ml-auto flex items-center gap-1 text-[12px] font-medium text-[#A8A29E] hover:text-[#57534E] transition-colors"
                  >
                    <X size={13} />
                    Annuler
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F0F0EE]">
                  <th className="w-10 px-4 py-2.5">
                    <input
                      type="checkbox"
                      checked={filteredItems.length > 0 && selectedIds.size === filteredItems.length}
                      ref={el => { if (el) el.indeterminate = selectedIds.size > 0 && selectedIds.size < filteredItems.length; }}
                      onChange={toggleAll}
                      className="w-3.5 h-3.5 rounded border-[#D6D3D1] text-[#7C3AED] focus:ring-[#7C3AED] focus:ring-offset-0 cursor-pointer accent-[#7C3AED]"
                    />
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
                  <ItemRow
                    key={item.id}
                    item={item}
                    selected={selectedIds.has(item.id)}
                    onToggle={(shiftKey) => toggleSelection(item.id, shiftKey)}
                    onClick={() => setDetailItem(item)}
                    onStatusChange={handleBillingStatusChange}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
            <SummaryBar count={filteredItems.length} total={viewTotalHt} />
          </div>
        )}
      </motion.div>

      {/* ══════════════════════ DRAWERS ══════════════════════ */}
      <AnimatePresence>
        {showCreate && (
          <ManualItemDrawer
            key="create"
            clients={clients}
            onClose={() => setShowCreate(false)}
            onSave={data => handleSaveManual(data)}
          />
        )}
        {detailItem && (
          <DetailDrawer
            key={`detail-${detailItem.id}`}
            item={detailItem}
            onClose={() => setDetailItem(null)}
            onStatusChange={(status) => handleBillingStatusChange(detailItem, status)}
            onDelete={() => handleDelete(detailItem)}
          />
        )}
        {showExports && (
          <ExportsDrawer
            key="exports"
            exports={dbExports || []}
            onClose={() => setShowExports(false)}
          />
        )}
        {showMonthlyClose && health && (
          <MonthlyCloseDrawer
            key="monthly-close"
            health={health}
            closures={dbClosures || []}
            onClose={() => setShowMonthlyClose(false)}
            onExportCsv={handleExportCsv}
            onExportPdf={handleExportPdf}
            onClosePeriod={handleClosePeriod}
          />
        )}
        {showArchives && (
          <ArchivesDrawer
            key="archives"
            closures={dbClosures || []}
            exports={dbExports || []}
            onClose={() => setShowArchives(false)}
            onReopen={handleReopenPeriod}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   KPI CARD
   ══════════════════════════════════════════════════════════════════════ */

function KpiCard({ icon, label, value, sub, accent, warn }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
  warn?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-4 transition-all hover:shadow-sm ${
      accent
        ? "bg-[#FAFAFF] border-[#E8E5F5]"
        : warn
          ? "bg-amber-50/40 border-amber-100"
          : "bg-white border-[#E6E6E4]"
    }`}>
      <div className="flex items-center gap-1.5 mb-2.5">
        <span className={accent ? "text-[#7C3AED]" : warn ? "text-amber-500" : "text-[#A8A29E]"}>{icon}</span>
        <span className="text-[11px] font-semibold text-[#A8A29E] uppercase tracking-wider">{label}</span>
      </div>
      <div className={`text-[20px] font-bold tabular-nums tracking-tight ${
        accent ? "text-[#6D28D9]" : warn ? "text-amber-700" : "text-[#1A1A1A]"
      }`}>
        {value}
      </div>
      {sub && <div className="text-[11px] text-[#A8A29E] mt-0.5">{sub}</div>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   EMPTY STATE
   ══════════════════════════════════════════════════════════════════════ */

function EmptyState({ hasItems, hasFilters, onClear }: {
  hasItems: boolean;
  hasFilters: boolean;
  onClear: () => void;
}) {
  return (
    <div className="py-20 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[#F5F5F4] flex items-center justify-center mx-auto mb-5">
        <Receipt size={24} className="text-[#D6D3D1]" />
      </div>
      {!hasItems ? (
        <>
          <p className="text-[15px] font-semibold text-[#44403C]">Aucune commande à suivre</p>
          <p className="text-[13px] text-[#A8A29E] mt-1.5 mb-6 max-w-sm mx-auto">
            Les commandes livrées apparaîtront automatiquement ici pour piloter votre facturation.
          </p>
          <a
            href="/commandes"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-white bg-[#7C3AED] px-5 py-2.5 rounded-lg hover:bg-[#6D28D9] transition-colors shadow-sm shadow-[#7C3AED]/20"
          >
            <Plus size={14} strokeWidth={2.5} />
            Créer une commande
          </a>
        </>
      ) : (
        <>
          <p className="text-[15px] font-semibold text-[#44403C]">Aucun résultat</p>
          <p className="text-[13px] text-[#A8A29E] mt-1.5 mb-5">
            {hasFilters ? "Aucune commande ne correspond à vos filtres." : "Essayez une autre recherche."}
          </p>
          {hasFilters && (
            <button
              onClick={onClear}
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#7C3AED] hover:bg-[#F0EEFF] px-4 py-2 rounded-lg transition-colors"
            >
              <RotateCcw size={13} />
              Réinitialiser les filtres
            </button>
          )}
        </>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   SUMMARY BAR
   ══════════════════════════════════════════════════════════════════════ */

function SummaryBar({ count, total }: { count: number; total: number }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-[#FAFAF9] border-t border-[#F0F0EE]">
      <span className="text-[12px] text-[#A8A29E]">
        {count} commande{count > 1 ? "s" : ""}
      </span>
      <span className="text-[13px] font-bold text-[#1A1A1A] tabular-nums">
        Total HT : {formatEur(total)}
      </span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   ITEM ROW
   ══════════════════════════════════════════════════════════════════════ */

function ItemRow({ item, selected, onToggle, onClick, onStatusChange, onDelete }: {
  item: PipelineItem;
  selected?: boolean;
  onToggle?: (shiftKey: boolean) => void;
  onClick: () => void;
  onStatusChange: (item: PipelineItem, status: BillingStatusKey) => void;
  onDelete: (item: PipelineItem) => void;
}) {
  return (
    <tr
      onClick={onClick}
      className={`border-b border-[#F5F5F4] hover:bg-[#FAFAF9] transition-colors group cursor-pointer ${
        selected ? "bg-[#FAFAFF]" : ""
      }`}
    >
      {onToggle && (
        <td className="w-10 px-4 py-3.5" onClick={e => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={!!selected}
            onChange={() => {}}
            onClick={(e) => { e.stopPropagation(); onToggle(e.shiftKey); }}
            className="w-3.5 h-3.5 rounded border-[#D6D3D1] text-[#7C3AED] focus:ring-[#7C3AED] focus:ring-offset-0 cursor-pointer accent-[#7C3AED]"
          />
        </td>
      )}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2">
          <div className="text-[13px] font-medium text-[#1A1A1A]">{item.title}</div>
          {item.type !== "order" && (
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-[#F5F5F4] text-[#A8A29E] uppercase">
              {item.type === "recurring" ? "Récurrent" : "Manuel"}
            </span>
          )}
        </div>
        {item.category && (
          <div className="text-[11px] text-[#A8A29E] mt-0.5">{item.category}</div>
        )}
      </td>
      <td className="px-4 py-3.5 text-[13px] text-[#57534E]">
        {item.clientName || <span className="text-[#D6D3D1]">—</span>}
      </td>
      <td className="px-4 py-3.5">
        {item.orderStatus ? (
          <OrderStatusBadge status={item.orderStatus} />
        ) : (
          <span className="text-[11px] text-[#C4C4C2]">—</span>
        )}
      </td>
      <td className="px-4 py-3.5">
        <BillingBadge status={item.billingStatus} />
      </td>
      <td className="px-4 py-3.5 text-right">
        <span className="text-[13px] font-semibold text-[#1A1A1A] tabular-nums">
          {formatEur(item.amount)}
        </span>
      </td>
      <td className="px-2 py-3.5">
        <ActionMenu item={item} onStatusChange={onStatusChange} onDelete={onDelete} />
      </td>
    </tr>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   GROUPED VIEW
   ══════════════════════════════════════════════════════════════════════ */

function GroupedView({ groups, icon, items, onRowClick, onStatusChange, onDelete }: {
  groups: [string, { name?: string; label?: string; items: PipelineItem[]; total: number }][];
  icon: React.ReactNode;
  items: PipelineItem[];
  onRowClick: (item: PipelineItem) => void;
  onStatusChange: (item: PipelineItem, status: BillingStatusKey) => void;
  onDelete: (item: PipelineItem) => void;
}) {
  const total = items.reduce((s, i) => s + i.amount, 0);
  return (
    <div>
      {groups.map(([key, group]) => (
        <div key={key}>
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#FAFAF9] border-b border-[#F0F0EE]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#F0EEFF] flex items-center justify-center shrink-0">
                {icon}
              </div>
              <span className="text-[13px] font-semibold text-[#1A1A1A] capitalize">{group.name || group.label}</span>
              <span className="text-[11px] text-[#A8A29E] tabular-nums">{group.items.length}</span>
            </div>
            <span className="text-[13px] font-bold text-[#1A1A1A] tabular-nums">{formatEur(group.total)}</span>
          </div>
          <table className="w-full">
            <tbody>
              {group.items.map(item => (
                <ItemRow
                  key={item.id}
                  item={item}
                  onClick={() => onRowClick(item)}
                  onStatusChange={onStatusChange}
                  onDelete={onDelete}
                />
              ))}
            </tbody>
          </table>
        </div>
      ))}
      <SummaryBar count={items.length} total={total} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   ACTION MENU
   ══════════════════════════════════════════════════════════════════════ */

function ActionMenu({ item, onStatusChange, onDelete }: {
  item: PipelineItem;
  onStatusChange: (item: PipelineItem, status: BillingStatusKey) => void;
  onDelete: (item: PipelineItem) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const transitions = billingTransitions[item.billingStatus] || [];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="p-1.5 rounded-md text-[#D6D3D1] opacity-0 group-hover:opacity-100 hover:text-[#57534E] hover:bg-[#F5F5F4] transition-all"
      >
        <MoreHorizontal size={15} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl border border-[#E6E6E4] shadow-lg shadow-black/8 z-30 py-1.5 overflow-hidden"
          >
            {item.type === "order" && (
              <a
                href={`/commandes`}
                onClick={(e) => e.stopPropagation()}
                className="w-full text-left px-3.5 py-2 text-[12px] text-[#57534E] hover:bg-[#FAFAF9] flex items-center gap-2.5 transition-colors"
              >
                <ArrowRight size={13} className="text-[#A8A29E]" />
                Voir dans Commandes
              </a>
            )}
            {transitions.length > 0 && (
              <>
                <div className="border-t border-[#F0F0EE] my-1.5 mx-3" />
                <div className="px-3.5 py-1">
                  <span className="text-[10px] font-semibold text-[#A8A29E] uppercase tracking-wider">Facturation</span>
                </div>
                {transitions.map(t => (
                  <button
                    key={t.next}
                    onClick={(e) => { e.stopPropagation(); onStatusChange(item, t.next); setOpen(false); }}
                    className="w-full text-left px-3.5 py-2 text-[12px] text-[#57534E] hover:bg-[#FAFAF9] flex items-center gap-2.5 transition-colors"
                  >
                    <ArrowRight size={13} className="text-[#A8A29E]" />
                    {t.label}
                  </button>
                ))}
              </>
            )}
            {item.type !== "order" && (
              <>
                <div className="border-t border-[#F0F0EE] my-1.5 mx-3" />
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(item); setOpen(false); }}
                  className="w-full text-left px-3.5 py-2 text-[12px] text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
                >
                  <Trash2 size={13} />
                  Supprimer
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   DETAIL DRAWER
   ══════════════════════════════════════════════════════════════════════ */

function DetailDrawer({ item, onClose, onStatusChange, onDelete }: {
  item: PipelineItem;
  onClose: () => void;
  onStatusChange: (status: BillingStatusKey) => void;
  onDelete: () => void;
}) {
  const transitions = billingTransitions[item.billingStatus] || [];

  return (
    <>
      <motion.div
        className="fixed inset-0 bg-black/15 z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="fixed right-0 top-0 h-screen w-[520px] max-w-full bg-white border-l border-[#E6E6E4] z-50 flex flex-col shadow-2xl"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 300 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F0EE]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#F0EEFF] flex items-center justify-center shrink-0">
              <FileText size={16} className="text-[#7C3AED]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-[15px] font-semibold text-[#1A1A1A] truncate">{item.title}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                {item.type === "order" && item.orderStatus && (
                  <OrderStatusBadge status={item.orderStatus} />
                )}
                {item.type !== "order" && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#F5F5F4] text-[#A8A29E]">
                    {item.type === "recurring" ? "Récurrent" : "Manuel"}
                  </span>
                )}
                {item.category && <span className="text-[11px] text-[#A8A29E]">{item.category}</span>}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#A8A29E] hover:text-[#57534E] hover:bg-[#F5F5F4] transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Amount hero */}
          <div className="px-6 py-6 border-b border-[#F0F0EE] bg-[#FAFAF9]">
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-[11px] font-semibold text-[#A8A29E] uppercase tracking-wider mb-1">Montant</div>
                <div className="text-[28px] font-bold text-[#1A1A1A] tabular-nums tracking-tight">{formatEur(item.amount)}</div>
              </div>
              <BillingBadge status={item.billingStatus} size="md" />
            </div>
            {(item.taxRate || 0) > 0 && (
              <div className="flex items-center gap-4 mt-3 text-[12px] text-[#78716C]">
                <span className="tabular-nums">TVA {item.taxRate}% → TTC {formatEur(item.totalTtc || item.amount)}</span>
              </div>
            )}
          </div>

          {/* Details grid */}
          <div className="px-6 py-5 space-y-4">
            <DetailRow icon={<User size={14} />} label="Client" value={item.clientName || "—"} />
            <DetailRow icon={<Calendar size={14} />} label="Date de création" value={formatDateLong(item.createdAt)} />
            {item.deadline && (
              <DetailRow icon={<Calendar size={14} />} label="Deadline" value={formatDateLong(item.deadline)} />
            )}
            {item.deliveredAt && (
              <DetailRow icon={<CheckCircle2 size={14} />} label="Date de livraison" value={formatDateLong(item.deliveredAt)} />
            )}
            {item.invoicedAt && (
              <DetailRow icon={<Receipt size={14} />} label="Date de facturation" value={formatDateLong(item.invoicedAt)} />
            )}
            {item.paidAt && (
              <DetailRow icon={<CheckCircle2 size={14} />} label="Date de paiement" value={formatDateLong(item.paidAt)} />
            )}
            <DetailRow icon={<Hash size={14} />} label="Source" value={sourceLabels[item.source] || item.source} />
            {item.type === "order" && item.orderStatus && (
              <DetailRow icon={<Info size={14} />} label="Statut commande" value={orderStatusLabels[item.orderStatus] || item.orderStatus} />
            )}
            {item.description && (
              <DetailRow icon={<FileText size={14} />} label="Description" value={item.description} />
            )}
            {item.tags.length > 0 && (
              <div className="flex items-start gap-3">
                <Tag size={14} className="text-[#A8A29E] mt-0.5 shrink-0" />
                <div>
                  <div className="text-[11px] font-semibold text-[#A8A29E] uppercase tracking-wider mb-1.5">Tags</div>
                  <div className="flex flex-wrap gap-1.5">
                    {item.tags.map(t => (
                      <span key={t} className="px-2 py-0.5 text-[11px] font-medium bg-[#F5F5F4] text-[#57534E] rounded-md">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {item.notes && (
              <div className="flex items-start gap-3">
                <StickyNote size={14} className="text-[#A8A29E] mt-0.5 shrink-0" />
                <div>
                  <div className="text-[11px] font-semibold text-[#A8A29E] uppercase tracking-wider mb-1.5">Notes</div>
                  <div className="text-[13px] text-[#57534E] whitespace-pre-wrap leading-relaxed bg-[#FAFAF9] rounded-lg p-3 border border-[#F0F0EE]">
                    {item.notes}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Status actions */}
          {transitions.length > 0 && (
            <div className="px-6 pb-5">
              <div className="text-[11px] font-semibold text-[#A8A29E] uppercase tracking-wider mb-2.5">Actions de facturation</div>
              <div className="space-y-1.5">
                {transitions.map(t => (
                  <button
                    key={t.next}
                    onClick={() => onStatusChange(t.next)}
                    className={`w-full text-left px-3.5 py-2.5 text-[13px] bg-[#FAFAF9] hover:bg-[#F0EEFF] border border-[#F0F0EE] hover:border-[#DDD6FE] rounded-lg flex items-center gap-2.5 transition-all ${
                      t.next === "paid" ? "text-emerald-700 font-medium" : "text-[#57534E]"
                    }`}
                  >
                    <ArrowRight size={13} className={t.next === "paid" ? "text-emerald-500" : "text-[#A8A29E]"} />
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#F0F0EE] flex items-center gap-2.5">
          {item.type !== "order" && (
            <button
              onClick={onDelete}
              className="px-3.5 py-2.5 text-[12px] font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 size={13} className="inline mr-1.5" />
              Supprimer
            </button>
          )}
          <div className="flex-1" />
          {item.type === "order" && (
            <a
              href="/commandes"
              className="px-4 py-2.5 text-[13px] font-semibold text-white bg-[#7C3AED] rounded-lg hover:bg-[#6D28D9] transition-colors shadow-sm shadow-[#7C3AED]/20"
            >
              <ArrowRight size={13} className="inline mr-1.5" />
              Voir dans Commandes
            </a>
          )}
        </div>
      </motion.div>
    </>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-[#A8A29E] mt-0.5 shrink-0">{icon}</span>
      <div>
        <div className="text-[11px] font-semibold text-[#A8A29E] uppercase tracking-wider mb-0.5">{label}</div>
        <div className="text-[13px] text-[#1A1A1A]">{value}</div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   BILLING FORM DRAWER (create + edit)
   ══════════════════════════════════════════════════════════════════════ */

function ManualItemDrawer({ clients, onClose, onSave }: {
  clients: { id: string; name: string }[];
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => void;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rawTemplates } = useApi<any[]>("/api/billing/templates");
  const activeTemplates = useMemo(
    () => (rawTemplates || []).filter((t: { archived?: boolean }) => !t.archived),
    [rawTemplates]
  );

  const [form, setForm] = useState({
    title: "",
    description: "",
    client_id: "",
    category: "",
    quantity: "1",
    unit: "unité",
    unit_price: "",
    tax_rate: "0",
    performed_at: new Date().toISOString().slice(0, 10),
    notes: "",
    status: "draft" as BillingItemStatus,
    tags: "",
  });
  const [saving, setSaving] = useState(false);

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const applyTemplate = (tplId: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tpl = activeTemplates.find((t: any) => t.id === tplId);
    if (!tpl) return;
    setForm(f => ({
      ...f,
      title: tpl.title,
      description: tpl.description || "",
      category: tpl.category || "",
      quantity: String(tpl.quantity || 1),
      unit: tpl.unit || "unité",
      unit_price: String(tpl.unit_price || 0),
      tax_rate: String(tpl.tax_rate || 0),
      tags: (tpl.tags || []).join(", "),
    }));
  };

  const total = (Number(form.quantity) || 0) * (Number(form.unit_price) || 0);
  const taxAmount = total * (Number(form.tax_rate) / 100);
  const totalTtc = total + taxAmount;
  const canSave = form.title.trim() && Number(form.unit_price) > 0;

  const handleSubmit = async () => {
    if (!canSave) return;
    setSaving(true);
    const tags = form.tags.split(",").map(t => t.trim()).filter(Boolean);
    await onSave({
      title: form.title,
      description: form.description,
      client_id: form.client_id || null,
      category: form.category,
      quantity: Number(form.quantity),
      unit: form.unit,
      unit_price: Number(form.unit_price),
      tax_rate: Number(form.tax_rate),
      performed_at: form.performed_at || null,
      notes: form.notes,
      status: form.status,
      tags,
    });
    setSaving(false);
  };

  return (
    <>
      <motion.div
        className="fixed inset-0 bg-black/15 z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="fixed right-0 top-0 h-screen w-[520px] max-w-full bg-white border-l border-[#E6E6E4] z-50 flex flex-col shadow-2xl"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 300 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F0EE]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#F0EEFF]">
              <Plus size={16} className="text-[#7C3AED]" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-[#1A1A1A]">Ligne manuelle</h2>
              <p className="text-[10px] text-[#A8A29E]">Pour les cas hors commande</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#A8A29E] hover:text-[#57534E] hover:bg-[#F5F5F4] transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Template prefill */}
          {activeTemplates.length > 0 && (
            <div className="bg-[#FAFAF9] border border-[#E6E6E4] rounded-lg p-3">
              <label className="text-[11px] font-medium text-[#78716C] uppercase tracking-wide mb-1.5 block">Préremplir depuis un template</label>
              <select
                defaultValue=""
                onChange={e => { if (e.target.value) applyTemplate(e.target.value); e.target.value = ""; }}
                className={tw.select}
              >
                <option value="">Choisir un template…</option>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {activeTemplates.map((t: any) => (
                  <option key={t.id} value={t.id}>{t.title} — {formatEur(Number(t.unit_price || 0))}</option>
                ))}
              </select>
            </div>
          )}

          {/* Title */}
          <div>
            <label className={tw.label}>Titre *</label>
            <input
              type="text"
              value={form.title}
              onChange={e => set("title", e.target.value)}
              placeholder="Ex: Montage vidéo Reel Instagram"
              className={tw.input}
              autoFocus
            />
          </div>

          {/* Client + Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={tw.label}>Client</label>
              <select value={form.client_id} onChange={e => set("client_id", e.target.value)} className={tw.select}>
                <option value="">Aucun client</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={tw.label}>Catégorie</label>
              <input
                type="text"
                value={form.category}
                onChange={e => set("category", e.target.value)}
                placeholder="Ex: Vidéo, Design..."
                className={tw.input}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={tw.label}>Description</label>
            <textarea
              value={form.description}
              onChange={e => set("description", e.target.value)}
              rows={2}
              placeholder="Détails de la prestation..."
              className={`${tw.input} resize-none`}
            />
          </div>

          {/* Quantity + Unit + Price */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={tw.label}>Quantité</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={form.quantity}
                onChange={e => set("quantity", e.target.value)}
                className={`${tw.input} tabular-nums`}
              />
            </div>
            <div>
              <label className={tw.label}>Unité</label>
              <select value={form.unit} onChange={e => set("unit", e.target.value)} className={tw.select}>
                <option value="unité">Unité</option>
                <option value="heure">Heure</option>
                <option value="jour">Jour</option>
                <option value="forfait">Forfait</option>
                <option value="lot">Lot</option>
                <option value="mois">Mois</option>
              </select>
            </div>
            <div>
              <label className={tw.label}>Prix unitaire *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.unit_price}
                onChange={e => set("unit_price", e.target.value)}
                placeholder="0,00"
                className={`${tw.input} tabular-nums`}
              />
            </div>
          </div>

          {/* Tax + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={tw.label}>TVA (%)</label>
              <select value={form.tax_rate} onChange={e => set("tax_rate", e.target.value)} className={tw.select}>
                <option value="0">0% (non assujetti)</option>
                <option value="5.5">5,5%</option>
                <option value="10">10%</option>
                <option value="20">20%</option>
              </select>
            </div>
            <div>
              <label className={tw.label}>Date de réalisation</label>
              <input
                type="date"
                value={form.performed_at}
                onChange={e => set("performed_at", e.target.value)}
                className={tw.input}
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className={tw.label}>Tags <span className="text-[#C4C4C2] font-normal">(séparés par des virgules)</span></label>
            <input
              type="text"
              value={form.tags}
              onChange={e => set("tags", e.target.value)}
              placeholder="design, urgent, sprint-3..."
              className={tw.input}
            />
          </div>

          {/* Notes */}
          <div>
            <label className={tw.label}>Notes internes</label>
            <textarea
              value={form.notes}
              onChange={e => set("notes", e.target.value)}
              rows={3}
              placeholder="Notes privées pour votre suivi..."
              className={`${tw.input} resize-none`}
            />
          </div>

          {/* Total preview */}
          <div className="rounded-xl bg-[#FAFAFF] border border-[#E8E5F5] p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-[#78716C]">Total HT</span>
              <span className="text-[18px] font-bold text-[#1A1A1A] tabular-nums">{formatEur(total)}</span>
            </div>
            {Number(form.tax_rate) > 0 && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-[#A8A29E]">TVA ({form.tax_rate}%)</span>
                  <span className="text-[13px] text-[#78716C] tabular-nums">{formatEur(taxAmount)}</span>
                </div>
                <div className="border-t border-[#E8E5F5] pt-2 flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-[#78716C]">Total TTC</span>
                  <span className="text-[15px] font-bold text-[#6D28D9] tabular-nums">{formatEur(totalTtc)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#F0F0EE] flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-[13px] font-medium text-[#57534E] border border-[#E6E6E4] rounded-lg hover:bg-[#F5F5F4] transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSave || saving}
            className={`flex-1 py-2.5 text-[13px] font-semibold rounded-lg transition-all ${
              canSave && !saving
                ? "text-white bg-[#7C3AED] hover:bg-[#6D28D9] shadow-sm shadow-[#7C3AED]/20"
                : "text-[#D6D3D1] bg-[#F5F5F4] border border-[#E6E6E4] cursor-not-allowed"
            }`}
          >
            {saving ? "Enregistrement..." : "Créer la ligne"}
          </button>
        </div>
      </motion.div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   EXPORTS DRAWER
   ══════════════════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════════════════
   BILLING HEALTH PANEL
   ══════════════════════════════════════════════════════════════════════ */

function BillingHealthPanel({ health, expanded, onToggle, onActSuggestion }: {
  health: HealthData;
  expanded: boolean;
  onToggle: () => void;
  onActSuggestion: (suggestion: HealthSuggestion) => void;
}) {
  const { score, anomalies, suggestions, counts } = health;
  const totalIssues = counts.errors + counts.warnings + counts.suggestions;

  const scoreColor = score >= 80
    ? "text-emerald-600"
    : score >= 50
      ? "text-amber-600"
      : "text-red-600";

  const scoreBg = score >= 80
    ? "bg-emerald-50 border-emerald-100"
    : score >= 50
      ? "bg-amber-50 border-amber-100"
      : "bg-red-50 border-red-100";

  const scoreIcon = score >= 80
    ? <ShieldCheck size={18} className="text-emerald-500" />
    : score >= 50
      ? <TriangleAlert size={18} className="text-amber-500" />
      : <CircleAlert size={18} className="text-red-500" />;

  // Group anomalies by severity
  const errors = anomalies.filter(a => a.severity === "error");
  const warnings = anomalies.filter(a => a.severity === "warning");

  return (
    <div className="rounded-xl border border-[#E6E6E4] bg-white overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      {/* Header — always visible */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#FAFAF9] transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-4">
          {/* Score badge */}
          <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${scoreBg}`}>
            {scoreIcon}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2.5">
              <span className="text-[14px] font-semibold text-[#1A1A1A]">Santé de la facturation</span>
              <span className={`text-[13px] font-bold tabular-nums ${scoreColor}`}>{score}/100</span>
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              {counts.errors > 0 && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-red-600">
                  <CircleAlert size={11} /> {counts.errors} erreur{counts.errors > 1 ? "s" : ""}
                </span>
              )}
              {counts.warnings > 0 && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-amber-600">
                  <TriangleAlert size={11} /> {counts.warnings} avertissement{counts.warnings > 1 ? "s" : ""}
                </span>
              )}
              {counts.suggestions > 0 && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-violet-600">
                  <Lightbulb size={11} /> {counts.suggestions} suggestion{counts.suggestions > 1 ? "s" : ""}
                </span>
              )}
              {totalIssues === 0 && (
                <span className="text-[11px] text-emerald-600 font-medium">Tout est en ordre</span>
              )}
            </div>
          </div>
        </div>
        <div className="text-[#A8A29E]">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-[#F0F0EE]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                {/* Anomalies column */}
                {(errors.length > 0 || warnings.length > 0) && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <CircleAlert size={14} className="text-amber-500" />
                      <span className="text-[12px] font-semibold text-[#44403C] uppercase tracking-wider">Anomalies détectées</span>
                    </div>
                    <div className="space-y-2">
                      {errors.map(a => (
                        <AnomalyCard key={a.id} anomaly={a} />
                      ))}
                      {warnings.slice(0, 5).map(a => (
                        <AnomalyCard key={a.id} anomaly={a} />
                      ))}
                      {warnings.length > 5 && (
                        <div className="text-[11px] text-[#A8A29E] pl-3">
                          + {warnings.length - 5} autre{warnings.length - 5 > 1 ? "s" : ""} avertissement{warnings.length - 5 > 1 ? "s" : ""}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Suggestions column */}
                {suggestions.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb size={14} className="text-violet-500" />
                      <span className="text-[12px] font-semibold text-[#44403C] uppercase tracking-wider">Facturation potentiellement oubliée</span>
                    </div>
                    <div className="space-y-2">
                      {suggestions.slice(0, 6).map(s => (
                        <SuggestionCard key={s.id} suggestion={s} onAct={() => onActSuggestion(s)} />
                      ))}
                      {suggestions.length > 6 && (
                        <div className="text-[11px] text-[#A8A29E] pl-3">
                          + {suggestions.length - 6} autre{suggestions.length - 6 > 1 ? "s" : ""} suggestion{suggestions.length - 6 > 1 ? "s" : ""}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AnomalyCard({ anomaly }: { anomaly: HealthAnomaly }) {
  const icon = anomaly.severity === "error"
    ? <CircleAlert size={13} className="text-red-500 shrink-0 mt-0.5" />
    : anomaly.severity === "warning"
      ? <TriangleAlert size={13} className="text-amber-500 shrink-0 mt-0.5" />
      : <Info size={13} className="text-blue-400 shrink-0 mt-0.5" />;

  const border = anomaly.severity === "error"
    ? "border-red-100 bg-red-50/40"
    : anomaly.severity === "warning"
      ? "border-amber-100 bg-amber-50/30"
      : "border-[#F0F0EE] bg-[#FAFAF9]";

  return (
    <div className={`flex items-start gap-2.5 px-3 py-2.5 rounded-lg border ${border}`}>
      {icon}
      <div className="min-w-0 flex-1">
        <div className="text-[12px] font-medium text-[#1A1A1A]">{anomaly.title}</div>
        <div className="text-[11px] text-[#78716C] mt-0.5 leading-relaxed">{anomaly.description}</div>
        {anomaly.fix && (
          <div className="text-[11px] text-[#7C3AED] mt-1 font-medium">{anomaly.fix}</div>
        )}
      </div>
    </div>
  );
}

function SuggestionCard({ suggestion, onAct }: { suggestion: HealthSuggestion; onAct?: () => void }) {
  const isActionable = suggestion.type === "unbilled_order" || suggestion.type === "missing_recurring";
  return (
    <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg border border-[#E8E5F5] bg-[#FAFAFF]">
      <Zap size={13} className="text-violet-500 shrink-0 mt-0.5" />
      <div className="min-w-0 flex-1">
        <div className="text-[12px] font-medium text-[#1A1A1A]">{suggestion.title}</div>
        <div className="text-[11px] text-[#78716C] mt-0.5 leading-relaxed">{suggestion.description}</div>
        <div className="flex items-center gap-3 mt-1.5">
          {suggestion.amount != null && suggestion.amount > 0 && (
            <span className="text-[11px] font-semibold text-[#6D28D9] tabular-nums">{formatEur(suggestion.amount)}</span>
          )}
          {isActionable && onAct ? (
            <button
              onClick={(e) => { e.stopPropagation(); onAct(); }}
              className="text-[11px] font-semibold text-white bg-[#7C3AED] px-2.5 py-1 rounded-md hover:bg-[#6D28D9] transition-colors"
            >
              {suggestion.action}
            </button>
          ) : (
            <span className="text-[11px] text-[#7C3AED] font-medium">{suggestion.action}</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   MONTHLY CLOSE DRAWER
   ══════════════════════════════════════════════════════════════════════ */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function MonthlyCloseDrawer({ health, closures, onClose, onExportCsv, onExportPdf, onClosePeriod }: {
  health: HealthData;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  closures: any[];
  onClose: () => void;
  onExportCsv: () => void;
  onExportPdf: () => void;
  onClosePeriod: (year: number, month: number, notes?: string) => Promise<void>;
}) {
  const { checklist, month, anomalies, suggestions, score } = health;
  const doneCount = checklist.filter(c => c.done).length;
  const allDone = doneCount === checklist.length;
  const [closing, setClosing] = useState(false);
  const [closeNotes, setCloseNotes] = useState("");

  const scoreColor = score >= 80 ? "text-emerald-600" : score >= 50 ? "text-amber-600" : "text-red-600";
  const scoreLabel = score >= 80 ? "Excellent" : score >= 50 ? "À améliorer" : "Attention requise";

  // Check if current month is already closed
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existingClosure = closures.find((c: any) =>
    c.period_year === currentYear && c.period_month === currentMonth && c.status === "closed"
  );

  const handleClose = async () => {
    setClosing(true);
    await onClosePeriod(currentYear, currentMonth, closeNotes || undefined);
    setClosing(false);
  };

  return (
    <>
      <motion.div
        className="fixed inset-0 bg-black/15 z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="fixed right-0 top-0 h-screen w-[560px] max-w-full bg-white border-l border-[#E6E6E4] z-50 flex flex-col shadow-2xl"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 300 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F0EE]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F0EEFF] flex items-center justify-center">
              <ClipboardCheck size={16} className="text-[#7C3AED]" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-[#1A1A1A]">Clôture mensuelle</h2>
              <p className="text-[11px] text-[#A8A29E] capitalize">{month.label}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {existingClosure && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                <Lock size={10} />
                Clôturée
              </span>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg text-[#A8A29E] hover:text-[#57534E] hover:bg-[#F5F5F4] transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Month summary */}
          <div className="px-6 py-5 bg-[#FAFAF9] border-b border-[#F0F0EE]">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-[11px] font-semibold text-[#A8A29E] uppercase tracking-wider mb-1">CA du mois</div>
                <div className="text-[20px] font-bold text-[#1A1A1A] tabular-nums">{formatEur(month.totalHt)}</div>
                <div className="text-[11px] text-[#A8A29E]">{month.totalItems} prestation{month.totalItems > 1 ? "s" : ""}</div>
              </div>
              <div>
                <div className="text-[11px] font-semibold text-[#A8A29E] uppercase tracking-wider mb-1">Prêt à exporter</div>
                <div className="text-[20px] font-bold text-[#7C3AED] tabular-nums">{formatEur(month.readyHt)}</div>
                <div className="text-[11px] text-[#A8A29E]">{month.ready} ligne{month.ready > 1 ? "s" : ""}</div>
              </div>
              <div>
                <div className="text-[11px] font-semibold text-[#A8A29E] uppercase tracking-wider mb-1">Score santé</div>
                <div className={`text-[20px] font-bold tabular-nums ${scoreColor}`}>{score}/100</div>
                <div className="text-[11px] text-[#A8A29E]">{scoreLabel}</div>
              </div>
            </div>

            {/* Progress mini-bars */}
            <div className="mt-4 grid grid-cols-4 gap-2">
              {[
                { label: "Brouillons", count: month.drafts, color: "bg-[#A8A29E]" },
                { label: "Prêtes", count: month.ready, color: "bg-violet-500" },
                { label: "Exportées", count: month.exported, color: "bg-cyan-500" },
                { label: "Facturées", count: month.invoiced, color: "bg-emerald-500" },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <div className="text-[16px] font-bold text-[#1A1A1A] tabular-nums">{s.count}</div>
                  <div className="flex items-center gap-1 justify-center mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${s.color}`} />
                    <span className="text-[10px] text-[#A8A29E]">{s.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Checklist */}
          <div className="px-6 py-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ClipboardCheck size={14} className="text-[#7C3AED]" />
                <span className="text-[13px] font-semibold text-[#1A1A1A]">Checklist de clôture</span>
              </div>
              <span className={`text-[12px] font-semibold tabular-nums ${allDone ? "text-emerald-600" : "text-[#A8A29E]"}`}>
                {doneCount}/{checklist.length}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-[#F0F0EE] rounded-full mb-5 overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${allDone ? "bg-emerald-500" : "bg-[#7C3AED]"}`}
                initial={{ width: 0 }}
                animate={{ width: `${(doneCount / checklist.length) * 100}%` }}
                transition={{ duration: 0.6, ease: "easeOut" as const }}
              />
            </div>

            <div className="space-y-2">
              {checklist.map(item => (
                <div
                  key={item.id}
                  className={`flex items-start gap-3 px-3.5 py-3 rounded-lg border transition-all ${
                    item.done
                      ? "border-emerald-100 bg-emerald-50/30"
                      : item.severity === "error"
                        ? "border-red-100 bg-red-50/30"
                        : item.severity === "warning"
                          ? "border-amber-100 bg-amber-50/20"
                          : "border-[#F0F0EE] bg-[#FAFAF9]"
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {item.done ? (
                      <CircleCheck size={16} className="text-emerald-500" />
                    ) : item.severity === "error" ? (
                      <CircleAlert size={16} className="text-red-500" />
                    ) : item.severity === "warning" ? (
                      <TriangleAlert size={16} className="text-amber-500" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-[#D6D3D1]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-[13px] font-medium ${item.done ? "text-emerald-700" : "text-[#1A1A1A]"}`}>
                      {item.label}
                    </div>
                    <div className="text-[11px] text-[#78716C] mt-0.5 leading-relaxed">{item.description}</div>
                  </div>
                  {!item.done && item.count != null && item.count > 0 && (
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${
                      item.severity === "error" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"
                    }`}>
                      {item.count}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Anomalies summary */}
          {anomalies.length > 0 && (
            <div className="px-6 pb-5">
              <div className="flex items-center gap-2 mb-3">
                <CircleAlert size={14} className="text-amber-500" />
                <span className="text-[12px] font-semibold text-[#44403C] uppercase tracking-wider">
                  {anomalies.length} anomalie{anomalies.length > 1 ? "s" : ""} restante{anomalies.length > 1 ? "s" : ""}
                </span>
              </div>
              <div className="space-y-1.5">
                {anomalies.slice(0, 4).map(a => (
                  <div key={a.id} className="flex items-center gap-2 px-3 py-2 rounded-md bg-[#FAFAF9] border border-[#F0F0EE]">
                    {a.severity === "error"
                      ? <CircleAlert size={12} className="text-red-500 shrink-0" />
                      : <TriangleAlert size={12} className="text-amber-500 shrink-0" />
                    }
                    <span className="text-[12px] text-[#57534E] truncate flex-1">{a.description}</span>
                  </div>
                ))}
                {anomalies.length > 4 && (
                  <div className="text-[11px] text-[#A8A29E] pl-3">
                    + {anomalies.length - 4} autre{anomalies.length - 4 > 1 ? "s" : ""}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Suggestions summary */}
          {suggestions.length > 0 && (
            <div className="px-6 pb-5">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb size={14} className="text-violet-500" />
                <span className="text-[12px] font-semibold text-[#44403C] uppercase tracking-wider">
                  Facturation potentiellement oubliée
                </span>
              </div>
              <div className="space-y-1.5">
                {suggestions.slice(0, 3).map(s => (
                  <div key={s.id} className="flex items-center gap-2 px-3 py-2 rounded-md bg-[#FAFAFF] border border-[#E8E5F5]">
                    <Zap size={12} className="text-violet-500 shrink-0" />
                    <span className="text-[12px] text-[#57534E] truncate flex-1">{s.title}</span>
                    {s.amount != null && s.amount > 0 && (
                      <span className="text-[11px] font-semibold text-[#6D28D9] tabular-nums shrink-0">{formatEur(s.amount)}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Close notes */}
          {!existingClosure && (
            <div className="px-6 pb-5">
              <label className="block text-[12px] font-medium text-[#57534E] mb-1.5">Notes de clôture (optionnel)</label>
              <textarea
                value={closeNotes}
                onChange={e => setCloseNotes(e.target.value)}
                placeholder="Ex: RAS, tout a été facturé..."
                className="w-full px-3.5 py-2.5 text-[13px] text-[#1A1A1A] border border-[#E6E6E4] rounded-lg bg-white focus:outline-none focus:border-[#7C3AED]/40 focus:ring-2 focus:ring-[#7C3AED]/8 placeholder:text-[#C4C4C2] transition-all resize-none h-16"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#F0F0EE] space-y-2.5">
          {existingClosure ? (
            <div className="text-center py-2">
              <div className="flex items-center justify-center gap-2 text-emerald-600 mb-2">
                <Lock size={14} />
                <span className="text-[13px] font-semibold">Période clôturée</span>
              </div>
              <p className="text-[11px] text-[#A8A29E]">
                Clôturée le {formatDateLong(existingClosure.closed_at)}
              </p>
            </div>
          ) : (
            <>
              {/* Export buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { onExportCsv(); }}
                  className="py-2.5 text-[12px] font-medium text-[#57534E] border border-[#E6E6E4] rounded-lg hover:bg-[#F5F5F4] transition-colors flex items-center justify-center gap-1.5"
                >
                  <FileDown size={13} />
                  Export CSV
                </button>
                <button
                  onClick={() => { onExportPdf(); }}
                  className="py-2.5 text-[12px] font-medium text-[#57534E] border border-[#E6E6E4] rounded-lg hover:bg-[#F5F5F4] transition-colors flex items-center justify-center gap-1.5"
                >
                  <FileText size={13} className="text-red-500" />
                  Export PDF
                </button>
              </div>

              {/* Close button */}
              {allDone ? (
                <button
                  onClick={handleClose}
                  disabled={closing}
                  className="w-full py-3 text-[13px] font-semibold text-white bg-[#7C3AED] rounded-lg hover:bg-[#6D28D9] transition-colors shadow-sm shadow-[#7C3AED]/20 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <Lock size={14} />
                  {closing ? "Clôture en cours…" : "Clôturer la période"}
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="text-center">
                    <span className="text-[12px] text-[#A8A29E]">
                      {checklist.length - doneCount} point{checklist.length - doneCount > 1 ? "s" : ""} à résoudre avant de clôturer
                    </span>
                  </div>
                  <button
                    onClick={handleClose}
                    disabled={closing}
                    className="w-full py-3 text-[13px] font-medium text-[#57534E] border border-[#E6E6E4] rounded-lg hover:bg-[#F5F5F4] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    <Lock size={14} />
                    {closing ? "Clôture en cours…" : "Clôturer quand même"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ExportsDrawer({ exports, onClose }: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  exports: any[];
  onClose: () => void;
}) {
  // Compute totals
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalExportedHt = exports.reduce((s: number, e: any) => s + Number(e.total_ht || 0), 0);

  return (
    <>
      <motion.div
        className="fixed inset-0 bg-black/15 z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="fixed right-0 top-0 h-screen w-[520px] max-w-full bg-white border-l border-[#E6E6E4] z-50 flex flex-col shadow-2xl"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 300 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F0EE]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F0EEFF] flex items-center justify-center">
              <History size={16} className="text-[#7C3AED]" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-[#1A1A1A]">Historique des exports</h2>
              <p className="text-[11px] text-[#A8A29E]">{exports.length} export{exports.length > 1 ? "s" : ""} · Total {formatEur(totalExportedHt)} HT</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#A8A29E] hover:text-[#57534E] hover:bg-[#F5F5F4] transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {exports.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#F5F5F4] flex items-center justify-center mx-auto mb-5">
                <Download size={24} className="text-[#D6D3D1]" />
              </div>
              <p className="text-[14px] font-semibold text-[#44403C]">Aucun export</p>
              <p className="text-[13px] text-[#A8A29E] mt-1.5">
                Vos exports CSV et PDF apparaîtront ici après téléchargement.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#F0F0EE]">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {exports.map((exp: any) => (
                <div key={exp.id} className="px-6 py-4 hover:bg-[#FAFAF9] transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-[9px] font-bold uppercase ${
                          exp.format === "pdf"
                            ? "bg-red-50 text-red-600"
                            : "bg-emerald-50 text-emerald-600"
                        }`}>
                          {exp.format}
                        </span>
                        <div className="text-[13px] font-medium text-[#1A1A1A] truncate">{exp.filename || exp.label}</div>
                      </div>
                      <div className="text-[11px] text-[#A8A29E] mt-1.5 flex items-center gap-2 flex-wrap">
                        <span>{formatDateLong(exp.created_at)}</span>
                        <span className="text-[#D6D3D1]">·</span>
                        <span>{exp.item_count} ligne{exp.item_count > 1 ? "s" : ""}</span>
                        {exp.client_count > 0 && (
                          <>
                            <span className="text-[#D6D3D1]">·</span>
                            <span>{exp.client_count} client{exp.client_count > 1 ? "s" : ""}</span>
                          </>
                        )}
                      </div>
                      {exp.period_start && exp.period_end && (
                        <div className="text-[11px] text-[#A8A29E] mt-0.5">
                          Période : {formatDate(exp.period_start)} → {formatDate(exp.period_end)}
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <div className="text-[14px] font-bold text-[#1A1A1A] tabular-nums">{formatEur(Number(exp.total_ht || 0))}</div>
                      {Number(exp.total_tva || 0) > 0 && (
                        <div className="text-[11px] text-[#A8A29E] tabular-nums mt-0.5">
                          TVA {formatEur(Number(exp.total_tva))}
                        </div>
                      )}
                      {Number(exp.total_ttc || 0) > Number(exp.total_ht || 0) && (
                        <div className="text-[11px] text-[#78716C] font-semibold tabular-nums">
                          TTC {formatEur(Number(exp.total_ttc))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   ARCHIVES DRAWER
   ══════════════════════════════════════════════════════════════════════ */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ArchivesDrawer({ closures, exports, onClose, onReopen }: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  closures: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  exports: any[];
  onClose: () => void;
  onReopen: (closureId: string) => Promise<void>;
}) {
  const [reopening, setReopening] = useState<string | null>(null);

  const handleReopen = async (id: string) => {
    setReopening(id);
    await onReopen(id);
    setReopening(null);
  };

  // Sort closures: closed first, then by date desc
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sorted = [...closures].sort((a: any, b: any) => {
    if (a.period_year !== b.period_year) return b.period_year - a.period_year;
    return b.period_month - a.period_month;
  });

  // Total closed revenue
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalClosedHt = sorted.filter((c: any) => c.status === "closed").reduce((s: number, c: any) => s + Number(c.total_ht || 0), 0);

  return (
    <>
      <motion.div
        className="fixed inset-0 bg-black/15 z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="fixed right-0 top-0 h-screen w-[580px] max-w-full bg-white border-l border-[#E6E6E4] z-50 flex flex-col shadow-2xl"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 300 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F0EE]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F0EEFF] flex items-center justify-center">
              <Archive size={16} className="text-[#7C3AED]" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-[#1A1A1A]">Archives de périodes</h2>
              <p className="text-[11px] text-[#A8A29E]">{sorted.length} période{sorted.length > 1 ? "s" : ""} · Revenu clôturé : {formatEur(totalClosedHt)}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#A8A29E] hover:text-[#57534E] hover:bg-[#F5F5F4] transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {sorted.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#F5F5F4] flex items-center justify-center mx-auto mb-5">
                <Archive size={24} className="text-[#D6D3D1]" />
              </div>
              <p className="text-[14px] font-semibold text-[#44403C]">Aucune période archivée</p>
              <p className="text-[13px] text-[#A8A29E] mt-1.5">
                Clôturez un mois pour le retrouver ici.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#F0F0EE]">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {sorted.map((closure: any) => {
                const isClosed = closure.status === "closed";
                const snapshot = closure.snapshot || {};
                // Find related exports
                const relatedExports = exports.filter(
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (e: any) => (snapshot.export_ids || []).includes(e.id)
                );

                return (
                  <div key={closure.id} className="px-6 py-5">
                    {/* Period header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold ${
                          isClosed
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-amber-50 text-amber-600"
                        }`}>
                          {isClosed ? <Lock size={10} /> : <Unlock size={10} />}
                          {isClosed ? "Clôturée" : "Réouverte"}
                        </span>
                        <h3 className="text-[15px] font-bold text-[#1A1A1A] capitalize">{closure.period_label}</h3>
                      </div>
                      {isClosed && (
                        <button
                          onClick={() => handleReopen(closure.id)}
                          disabled={reopening === closure.id}
                          className="text-[11px] font-medium text-[#A8A29E] hover:text-[#57534E] transition-colors flex items-center gap-1 disabled:opacity-50"
                        >
                          <Unlock size={11} />
                          {reopening === closure.id ? "..." : "Rouvrir"}
                        </button>
                      )}
                    </div>

                    {/* Totals grid */}
                    <div className="grid grid-cols-5 gap-3 mb-3">
                      {[
                        { label: "HT", value: formatEur(Number(closure.total_ht || 0)), bold: true },
                        { label: "TVA", value: formatEur(Number(closure.total_tva || 0)) },
                        { label: "TTC", value: formatEur(Number(closure.total_ttc || 0)), bold: true },
                        { label: "Lignes", value: String(closure.item_count || 0) },
                        { label: "Clients", value: String(closure.client_count || 0) },
                      ].map(col => (
                        <div key={col.label}>
                          <div className="text-[10px] font-medium text-[#A8A29E] uppercase tracking-wider">{col.label}</div>
                          <div className={`text-[13px] tabular-nums mt-0.5 ${col.bold ? "font-bold text-[#1A1A1A]" : "text-[#57534E]"}`}>
                            {col.value}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Status breakdown */}
                    <div className="flex items-center gap-3 mb-2">
                      {[
                        { label: "Exportées", count: snapshot.exported || 0, color: "bg-cyan-400" },
                        { label: "Facturées", count: snapshot.invoiced || 0, color: "bg-emerald-400" },
                        { label: "Brouillons", count: snapshot.drafts || 0, color: "bg-[#A8A29E]" },
                      ].filter(s => s.count > 0).map(s => (
                        <span key={s.label} className="flex items-center gap-1 text-[10px] text-[#78716C]">
                          <span className={`w-1.5 h-1.5 rounded-full ${s.color}`} />
                          {s.count} {s.label.toLowerCase()}
                        </span>
                      ))}
                    </div>

                    {/* Top clients */}
                    {(snapshot.top_clients || []).length > 0 && (
                      <div className="mt-2">
                        <div className="flex items-center flex-wrap gap-1.5">
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {(snapshot.top_clients || []).slice(0, 4).map((tc: any, idx: number) => (
                            <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-[#F5F5F4] text-[#57534E]">
                              {tc.name} · {formatEur(tc.total_ht)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Related exports */}
                    {relatedExports.length > 0 && (
                      <div className="mt-2.5 flex items-center gap-1.5">
                        <FileDown size={11} className="text-[#A8A29E]" />
                        <span className="text-[10px] text-[#A8A29E]">{relatedExports.length} export{relatedExports.length > 1 ? "s" : ""} associé{relatedExports.length > 1 ? "s" : ""}</span>
                      </div>
                    )}

                    {/* Notes */}
                    {closure.notes && (
                      <div className="mt-2 text-[11px] text-[#78716C] italic bg-[#FAFAF9] px-3 py-2 rounded-md">
                        {closure.notes}
                      </div>
                    )}

                    {/* Closed date */}
                    <div className="mt-2 text-[10px] text-[#C4C4C2]">
                      {isClosed ? "Clôturée" : "Réouverte"} le {formatDateLong(closure.closed_at || closure.reopened_at)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
