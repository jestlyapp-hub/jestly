"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTrack } from "@/lib/hooks/use-track";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { useApi, apiFetch } from "@/lib/hooks/use-api";
import { useColumns } from "@/lib/hooks/use-columns";
import { orderRecordToOrder } from "@/lib/adapters";
import type { Order, FieldOption, BoardField } from "@/types";

const OrderDrawer = dynamic(() => import("@/components/commandes/OrderDrawer"), { ssr: false });
const CreateOrderDrawer = dynamic(() => import("@/components/commandes/CreateOrderDrawer"), { ssr: false });
import EditableCell from "@/components/commandes/EditableCell";
import ClientSelectCell from "@/components/commandes/ClientSelectCell";
import StatusSelectCell from "@/components/commandes/StatusSelectCell";
import CustomCell from "@/components/commandes/CustomCell";
import AddColumnButton from "@/components/commandes/AddColumnButton";
import ColumnHeaderMenu from "@/components/commandes/ColumnHeaderMenu";
import BulkToolbar from "@/components/commandes/BulkToolbar";
import { toast } from "@/lib/hooks/use-toast";
import { formatDateFR, isOverdue, isOrderOverdue, isActiveProductionStatus } from "@/lib/notion-colors";
import { NEXT_STATUS, PREV_STATUS, STATUS_LABELS, LEGACY_SEEDED_KEYS } from "@/lib/kanban-config";
import SelectableCheckbox from "@/components/ui/SelectableCheckbox";
import PipelineSummaryCards from "@/components/ui/PipelineSummaryCards";
import { computeOrdersPipelineSummary } from "@/lib/business-metrics";

/* ─── Notion-style color palette for select options ─── */
const OPTION_COLORS = ["violet", "blue", "cyan", "emerald", "amber", "orange", "rose", "pink", "indigo", "teal"];

/* ─── Base column config (fallbacks for safety) ─── */
const BASE_KEYS = new Set(["title", "client", "price", "status", "deadline", "date"]);

const BASE_FALLBACKS: BoardField[] = [
  { id: "fb-title", key: "title", label: "Titre", fieldType: "text", options: [], isRequired: true, isVisibleOnCard: false, isSystem: true, config: {}, position: 0 },
  { id: "fb-client", key: "client", label: "Client", fieldType: "text", options: [], isRequired: true, isVisibleOnCard: false, isSystem: true, config: {}, position: 1 },
  { id: "fb-price", key: "price", label: "Prix", fieldType: "money", options: [], isRequired: true, isVisibleOnCard: false, isSystem: true, config: {}, position: 2 },
  { id: "fb-status", key: "status", label: "Statut", fieldType: "select", options: [], isRequired: true, isVisibleOnCard: false, isSystem: true, config: {}, position: 3 },
  { id: "fb-deadline", key: "deadline", label: "Deadline", fieldType: "date", options: [], isRequired: true, isVisibleOnCard: false, isSystem: true, config: {}, position: 4 },
  { id: "fb-date", key: "date", label: "Date", fieldType: "date", options: [], isRequired: true, isVisibleOnCard: false, isSystem: true, config: { readOnly: true }, position: 5 },
];

const CELL_STYLES: Record<string, string> = {
  title: "font-medium max-w-[280px]",
  client: "max-w-[200px]",
  price: "font-semibold tabular-nums",
};

/* ─── Tab config ─── */

type TabKey = "todo" | "in_progress" | "delivered" | "paid" | "all";

const TABS: { key: TabKey; label: string; slug?: string }[] = [
  { key: "todo", label: "À faire", slug: "new" },
  { key: "in_progress", label: "En cours", slug: "in_progress" },
  { key: "delivered", label: "Livré", slug: "delivered" },
  { key: "paid", label: "Payé", slug: "paid" },
  { key: "all", label: "Tous" },
];

interface ClientOption {
  id: string;
  name: string;
  email: string;
}

/* ─── Helpers ─── */

function isDeadlineSoon(iso: string | undefined): boolean {
  if (!iso) return false;
  try {
    const d = new Date(iso + (iso.includes("T") ? "" : "T00:00:00"));
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diff = d.getTime() - now.getTime();
    return diff >= 0 && diff <= 3 * 86400000;
  } catch { return false; }
}

function fmtEur(n: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

/* ─── Page ─── */

export default function CommandesPage() {
  const track = useTrack();
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabFromUrl = searchParams.get("tab") as TabKey | null;
  const searchFromUrl = searchParams.get("q");
  const [activeTab, setActiveTabLocal] = useState<TabKey>(tabFromUrl && ["todo", "in_progress", "delivered", "paid", "all"].includes(tabFromUrl) ? tabFromUrl : "todo");

  const updateUrl = useCallback((updates: Record<string, string | null>) => {
    const url = new URL(window.location.href);
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") url.searchParams.delete(key);
      else url.searchParams.set(key, value);
    }
    router.replace(url.pathname + url.search, { scroll: false });
  }, [router]);

  const setActiveTab = (tab: TabKey) => {
    setActiveTabLocal(tab);
    updateUrl({ tab: tab === "todo" ? null : tab });
  };
  const [search, setSearch] = useState(searchFromUrl ?? "");

  // Persister la recherche dans l'URL (debounce)
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      updateUrl({ q: search.trim() || null });
    }, 400);
    return () => clearTimeout(searchTimerRef.current);
  }, [search, updateUrl]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  // Track page view au montage
  useEffect(() => { track("commandes_page_viewed"); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ─── Data: single source of truth via useApi + setData ─── */

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rawOrders, loading, error, mutate, setData: setRawOrders } = useApi<any[]>("/api/orders");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rawClients } = useApi<any[]>("/api/clients");

  /* ─── Dynamic columns (system + custom) ─── */
  const { fields, loading: fieldsLoading, addField, patchField, deleteField } = useColumns();

  // System fields from API, with hardcoded fallbacks for safety
  const systemFields = useMemo(() => {
    const apiSystem = fields.filter(f => f.isSystem);
    return BASE_FALLBACKS.map(def => apiSystem.find(f => f.key === def.key) ?? def);
  }, [fields]);

  // Custom fields (non-system, non-base-key)
  const customColumns = useMemo(() =>
    fields.filter(f => !f.isSystem && !BASE_KEYS.has(f.key)),
    [fields]
  );

  // All visible columns for TABLE (excludes hidden + legacy keys)
  const visibleColumns = useMemo(() =>
    [...systemFields, ...customColumns]
      .filter(f => !(f.config as { hidden?: boolean })?.hidden)
      .filter(f => !LEGACY_SEEDED_KEYS.has(f.key))
      .sort((a, b) => a.position - b.position),
    [systemFields, customColumns]
  );

  // All custom fields for DRAWER (including hidden + legacy, excluding system)
  const drawerFields = useMemo(() =>
    fields.filter(f => !f.isSystem),
    [fields]
  );

  const clients: ClientOption[] = useMemo(() => {
    if (!rawClients) return [];
    return rawClients.map((c: { id: string; name: string; email: string }) => ({
      id: c.id, name: c.name, email: c.email,
    }));
  }, [rawClients]);

  const orders: Order[] = useMemo(() => {
    if (!rawOrders) return [];
    return rawOrders.map((raw) => orderRecordToOrder(raw));
  }, [rawOrders]);

  const selected = useMemo(
    () => (selectedId ? orders.find((o) => o.id === selectedId) ?? null : null),
    [orders, selectedId]
  );

  // Push sync error toast when refetch fails (stale data still shown)
  useEffect(() => {
    if (error && rawOrders) {
      toast.error(`Erreur de synchronisation : ${error}`, { id: "sync-error" });
    }
  }, [error, rawOrders]);

  /* ─── Counts + filter ─── */

  /* ─── Status group mapping ─── */
  const STATUS_GROUPS: Record<string, string[]> = {
    todo: ["new", "brief_received"],
    in_progress: ["in_progress", "in_review", "validated"],
    delivered: ["delivered"],
    paid: ["paid", "invoiced"],
  };

  const getTabForStatus = (status: string): keyof typeof STATUS_GROUPS | null => {
    for (const [group, statuses] of Object.entries(STATUS_GROUPS)) {
      if (statuses.includes(status)) return group as keyof typeof STATUS_GROUPS;
    }
    return null;
  };

  const counts = useMemo(() => {
    const c = { todo: 0, in_progress: 0, delivered: 0, paid: 0, all: orders.length };
    for (const o of orders) {
      const group = getTabForStatus(o.status);
      if (group && group in c) c[group as keyof Omit<typeof c, "all">]++;
    }
    return c;
  }, [orders]);

  /* ─── Pipeline summary (source de vérité unique) ─── */
  const pipelineSummary = useMemo(() => computeOrdersPipelineSummary(orders), [orders]);

  /* ─── Aggregated stats (overdue/soon pour alertes) ─── */
  const stats = useMemo(() => {
    const overdueCount = orders.filter(o => isOrderOverdue(o.deadline, o.status)).length;
    const soonCount = orders.filter(o => o.deadline && isDeadlineSoon(o.deadline) && !isOverdue(o.deadline) && isActiveProductionStatus(o.status)).length;
    return { overdueCount, soonCount };
  }, [orders]);

  const filtered = useMemo(() => {
    let list = orders;
    const tab = TABS.find((t) => t.key === activeTab);
    if (tab?.slug) {
      const groupStatuses = STATUS_GROUPS[activeTab];
      if (groupStatuses) {
        list = list.filter((o) => groupStatuses.includes(o.status));
      } else {
        list = list.filter((o) => o.status === tab.slug);
      }
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          o.client.toLowerCase().includes(q) ||
          o.product.toLowerCase().includes(q) ||
          o.id.toLowerCase().includes(q)
      );
    }
    return list;
  }, [orders, activeTab, search]);

  /* ─── Multi-select ─── */

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const lastClickedIdx = useRef<number | null>(null);

  const handleRowSelect = useCallback(
    (orderId: string, _index: number) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(orderId)) next.delete(orderId);
        else next.add(orderId);
        return next;
      });
    },
    []
  );

  const handleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === filtered.length) return new Set();
      return new Set(filtered.map((o) => o.id));
    });
  }, [filtered]);

  /* ─── Optimistic patch: update cache directly, no refetch ─── */

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const patchOrder = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (orderId: string, apiBody: Record<string, unknown>, rawPatch: Record<string, any>): Promise<boolean> => {
      // Optimistic: update cache immediately
      setRawOrders((prev) =>
        prev?.map((row) => (row.id === orderId ? { ...row, ...rawPatch } : row)) ?? null
      );

      try {
        // API call returns updated row
        const updated = await apiFetch(`/api/orders/${orderId}`, {
          method: "PATCH",
          body: apiBody,
        });
        // Confirm with real server data
        setRawOrders((prev) =>
          prev?.map((row) => (row.id === orderId ? updated : row)) ?? null
        );
        return true;
      } catch (err) {
        // Rollback: refetch clean state from server
        mutate();
        const msg = err instanceof Error ? err.message : "Échec";
        const lo = msg.toLowerCase();
        if (lo.includes("colonne") || lo.includes("column") || lo.includes("contrainte") || lo.includes("constraint") || lo.includes("migrate")) {
          toast.warning("Base de données à mettre à jour — Lancez node scripts/migrate.mjs pour appliquer les migrations.", { id: "migration-needed" });
        }
        toast.error(`Erreur: ${msg}`, { duration: 5000 });
        return false;
      }
    },
    [setRawOrders, mutate]
  );

  /* ─── Check circle: advance to next status ─── */

  const handleAdvanceStatus = useCallback(
    (orderId: string, currentStatus: string) => {
      const next = NEXT_STATUS[currentStatus];
      if (!next) return;
      patchOrder(orderId, { status: next }, { status: next });
      toast.success(`Déplacée vers ${STATUS_LABELS[next]}`);
    },
    [patchOrder]
  );

  /* ─── Undo button: regress to previous status ─── */

  const handleRegressStatus = useCallback(
    (orderId: string, currentStatus: string) => {
      const prev = PREV_STATUS[currentStatus];
      if (!prev) return;
      patchOrder(orderId, { status: prev }, { status: prev });
      toast.success(`Retour vers ${STATUS_LABELS[prev]}`);
    },
    [patchOrder]
  );

  /* ─── Inline editing handlers ─── */

  const handleInlineTitle = useCallback(
    (orderId: string, value: string | number) => {
      patchOrder(orderId, { title: String(value) }, { title: String(value) });
    },
    [patchOrder]
  );

  const handleInlineAmount = useCallback(
    (orderId: string, value: string | number) => {
      patchOrder(orderId, { amount: Number(value) }, { amount: Number(value) });
    },
    [patchOrder]
  );

  const handleInlineClient = useCallback(
    (orderId: string, clientId: string) => {
      const client = clients.find((c) => c.id === clientId);
      patchOrder(
        orderId,
        { client_id: clientId },
        { client_id: clientId, clients: client ? { name: client.name, email: client.email, phone: null } : undefined }
      );
    },
    [patchOrder, clients]
  );

  const handleInlineStatus = useCallback(
    (orderId: string, newStatus: string) => {
      patchOrder(orderId, { status: newStatus }, { status: newStatus });
      toast.success(`Statut : ${STATUS_LABELS[newStatus] ?? newStatus}`);
    },
    [patchOrder]
  );

  /* ─── Custom field handlers ─── */

  const handleInlineCustomField = useCallback(
    (orderId: string, fieldKey: string, value: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const current = rawOrders?.find((r: any) => r.id === orderId);
      const next = { ...(current?.custom_fields ?? {}), [fieldKey]: value };
      patchOrder(orderId, { custom_fields: next }, { custom_fields: next });
    },
    [patchOrder, rawOrders]
  );

  const handleAddOption = useCallback(
    async (fieldId: string, label: string): Promise<FieldOption> => {
      const field = fields.find((f) => f.id === fieldId);
      const color = OPTION_COLORS[(field?.options.length ?? 0) % OPTION_COLORS.length];
      const newOption: FieldOption = { label, color };
      await patchField(fieldId, { options: [...(field?.options ?? []), newOption] });
      return newOption;
    },
    [fields, patchField]
  );

  /* ─── Column header actions ─── */

  const handleColumnRename = useCallback(
    (fieldId: string, label: string) => {
      patchField(fieldId, { label });
    },
    [patchField]
  );

  const handleColumnChangeType = useCallback(
    (fieldId: string, fieldType: string) => {
      patchField(fieldId, { field_type: fieldType });
    },
    [patchField]
  );

  const handleColumnHide = useCallback(
    (fieldId: string) => {
      const field = fields.find((f) => f.id === fieldId);
      patchField(fieldId, { config: { ...(field?.config ?? {}), hidden: true } });
    },
    [patchField, fields]
  );

  const handleColumnDelete = useCallback(
    (fieldId: string) => {
      deleteField(fieldId);
    },
    [deleteField]
  );

  /* ─── Bulk actions ─── */

  const handleBulkDelete = useCallback(async () => {
    const ids = Array.from(selectedIds);
    // Optimistic: remove from cache
    setRawOrders((prev) => prev?.filter((row) => !selectedIds.has(row.id)) ?? null);
    setSelectedIds(new Set());

    try {
      await apiFetch("/api/orders/bulk", { method: "POST", body: { action: "delete", ids } });
      toast.success(`${ids.length} commande${ids.length > 1 ? "s" : ""} supprimée${ids.length > 1 ? "s" : ""}`);
    } catch (err) {
      mutate(); // Rollback
      toast.error(err instanceof Error ? err.message : "Erreur lors de la suppression");
    }
  }, [selectedIds, setRawOrders, mutate]);

  const handleBulkDuplicate = useCallback(async () => {
    const ids = Array.from(selectedIds);
    setSelectedIds(new Set());

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await apiFetch<{ orders: any[] }>("/api/orders/bulk", {
        method: "POST",
        body: { action: "duplicate", ids },
      });
      // Add duplicated orders to cache
      if (result.orders) {
        setRawOrders((prev) => [...(result.orders ?? []), ...(prev ?? [])]);
      }
      toast.success(`${ids.length} commande${ids.length > 1 ? "s" : ""} dupliquée${ids.length > 1 ? "s" : ""}`);
    } catch (err) {
      mutate();
      toast.error(err instanceof Error ? err.message : "Erreur lors de la duplication");
    }
  }, [selectedIds, setRawOrders, mutate]);

  const handleBulkMove = useCallback(async (status: string) => {
    const ids = Array.from(selectedIds);
    // Optimistic: update status in cache
    setRawOrders((prev) =>
      prev?.map((row) => (selectedIds.has(row.id) ? { ...row, status } : row)) ?? null
    );
    setSelectedIds(new Set());

    try {
      await apiFetch("/api/orders/bulk", { method: "POST", body: { action: "move", ids, status } });
      toast.success(`${ids.length} commande${ids.length > 1 ? "s" : ""} → ${STATUS_LABELS[status] ?? status}`);
    } catch (err) {
      mutate();
      toast.error(err instanceof Error ? err.message : "Erreur lors du déplacement");
    }
  }, [selectedIds, setRawOrders, mutate]);

  /* ─── Loading (only on initial fetch, never on refetch) ─── */

  if (loading && !rawOrders) {
    return (
      <div className="max-w-[1320px] mx-auto px-4">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-8 w-48 bg-[#F7F7F5] rounded-lg animate-pulse mb-2" />
            <div className="h-4 w-72 bg-[#F7F7F5] rounded animate-pulse" />
          </div>
          <div className="h-10 w-44 bg-[#F7F7F5] rounded-lg animate-pulse" />
        </div>
        {/* Stats skeleton */}
        <div className="flex gap-3 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 w-32 bg-[#F7F7F5] rounded-lg animate-pulse" />
          ))}
        </div>
        {/* Toolbar skeleton */}
        <div className="h-12 bg-[#F7F7F5] rounded-lg animate-pulse mb-4" />
        {/* Table skeleton */}
        <div className="bg-white rounded-xl border border-[#E6E6E4] overflow-hidden">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-14 border-b border-[#F8F8FA] animate-pulse bg-[#FEFEFE]" />
          ))}
        </div>
      </div>
    );
  }

  /* ─── Error (only if no data at all — inline banner otherwise) ─── */

  if (error && !rawOrders) {
    return (
      <div className="max-w-[1320px] mx-auto px-4 py-12 text-center">
        <p className="text-[14px] text-red-500 mb-2">Erreur : {error}</p>
        <button onClick={mutate} className="text-[13px] text-[#4F46E5] hover:underline cursor-pointer">
          Réessayer
        </button>
      </div>
    );
  }

  const allSelected = filtered.length > 0 && selectedIds.size === filtered.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < filtered.length;
  // checkbox + advance + dynamic columns + add/chevron
  const totalColSpan = 3 + visibleColumns.length;

  // Cell renderer: dispatches to the right component based on field key
  const renderCell = (field: BoardField, order: Order) => {
    switch (field.key) {
      case "title":
        return (
          <div>
            <EditableCell value={order.product} onCommit={(v) => handleInlineTitle(order.id, v)} />
            {order.category && (
              <span className="text-[11px] text-[#8A8A88] mt-0.5 block">{order.category}</span>
            )}
          </div>
        );
      case "client":
        return <ClientSelectCell currentName={order.client} currentId={order.clientId} clients={clients} onCommit={(id) => handleInlineClient(order.id, id)} />;
      case "price":
        return <EditableCell value={order.price} type="number" suffix="€" onCommit={(v) => handleInlineAmount(order.id, v)} />;
      case "status":
        return (
          <div className="flex items-center gap-1.5">
            <StatusSelectCell currentStatus={order.status} onCommit={(s) => handleInlineStatus(order.id, s)} />
            {PREV_STATUS[order.status] && (
              <button
                onClick={(e) => { e.stopPropagation(); handleRegressStatus(order.id, order.status); }}
                title={`Revenir à ${STATUS_LABELS[PREV_STATUS[order.status]]}`}
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-[#F7F7F5] text-[#C0C0BE] hover:text-[#5A5A58] transition-all cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="19 12 5 12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
              </button>
            )}
          </div>
        );
      case "deadline": {
        const operationallyOverdue = isOrderOverdue(order.deadline, order.status);
        const operationallySoon = order.deadline && isDeadlineSoon(order.deadline) && !isOverdue(order.deadline) && isActiveProductionStatus(order.status);
        return order.deadline ? (
          <span className={`inline-flex items-center gap-1.5 text-[12px] px-2 py-0.5 rounded-md ${
            operationallyOverdue
              ? "bg-red-50 text-red-600 font-medium"
              : operationallySoon
                ? "bg-amber-50 text-amber-600 font-medium"
                : "text-[#5A5A58]"
          }`}>
            {operationallyOverdue && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            )}
            {formatDateFR(order.deadline)}
          </span>
        ) : (
          <span className="text-[#D0D0CE] text-[12px]">—</span>
        );
      }
      case "date":
        return <span className="text-[12px] text-[#8A8A88]">{formatDateFR(order.date)}</span>;
      default:
        return (
          <CustomCell
            field={field}
            value={order.customFields?.[field.key]}
            onCommit={(v) => handleInlineCustomField(order.id, field.key, v)}
            onAddOption={(label) => handleAddOption(field.id, label)}
          />
        );
    }
  };

  /* ─── Render ─── */

  return (
    <div className="max-w-[1320px] mx-auto px-4">
      {/* ═══ PAGE HEADER ═══ */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-bold text-[#191919] tracking-tight">Commandes</h1>
            <p className="text-[13px] text-[#8A8A88] mt-0.5">
              Suivez, organisez et transformez vos commandes en livrables.
            </p>
          </div>
          <button
            data-guide="new-order-btn"
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 bg-[#4F46E5] text-white text-[13px] font-semibold px-5 py-2.5 rounded-lg hover:bg-[#4338CA] transition-all shadow-sm hover:shadow cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nouvelle commande
          </button>
        </div>

        {/* ─── Pipeline Summary (source de vérité unique) ─── */}
        {orders.length > 0 && (
          <div className="mt-4">
            <PipelineSummaryCards summary={pipelineSummary} />
            {(stats.overdueCount > 0 || stats.soonCount > 0) && (
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {stats.overdueCount > 0 && (
                  <div className="flex items-center gap-1.5 text-[12px] text-red-600 bg-red-50 rounded-lg px-3 py-1.5">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <span className="font-medium">{stats.overdueCount}</span> en retard
                  </div>
                )}
                {stats.soonCount > 0 && (
                  <div className="flex items-center gap-1.5 text-[12px] text-amber-600 bg-amber-50 rounded-lg px-3 py-1.5">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <span className="font-medium">{stats.soonCount}</span> bientôt
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* ═══ CONTROL BAR ═══ */}
      <motion.div
        className="bg-white rounded-t-xl border border-[#E6E6E4] border-b-0 px-2 pt-1"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-2">
          {/* Tabs */}
          <div className="flex items-center gap-0">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setSelectedIds(new Set()); }}
                className={`relative px-3.5 py-3 text-[13px] font-medium transition-colors cursor-pointer ${
                  activeTab === tab.key
                    ? "text-[#191919]"
                    : "text-[#8A8A88] hover:text-[#5A5A58]"
                }`}
              >
                {tab.label}
                <span className={`ml-1 text-[11px] px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.key
                    ? "bg-[#4F46E5] text-white"
                    : "bg-[#F0F0EE] text-[#8A8A88]"
                }`}>
                  {counts[tab.key]}
                </span>
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="tab-underline"
                    className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#191919] rounded-full"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative sm:ml-auto mb-2 sm:mb-0 w-full sm:w-auto">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8A8A88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher par client, titre, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-[260px] bg-[#F7F7F5] border border-transparent rounded-lg pl-9 pr-4 py-2 text-[13px] text-[#191919] placeholder-[#8A8A88] focus:outline-none focus:bg-white focus:border-[#E6E6E4] focus:ring-1 focus:ring-[#4F46E5]/15 transition-all"
            />
          </div>
        </div>
      </motion.div>

      {/* ═══ TABLE CONTAINER ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="bg-white rounded-b-xl border border-[#E6E6E4] border-t-[#EFEFEF] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E6E6E4]">
                  {/* Select all checkbox */}
                  <th className="w-[44px] px-3 py-3">
                    <div className="flex items-center justify-center">
                      <SelectableCheckbox
                        checked={!!allSelected}
                        indeterminate={someSelected && !allSelected}
                        onChange={handleSelectAll}
                      />
                    </div>
                  </th>
                  {/* Advance column */}
                  <th className="w-10 px-1 py-3" />
                  {/* ── All columns (dynamic, with ColumnHeaderMenu) ── */}
                  {visibleColumns.map((field) => (
                    <th
                      key={field.id}
                      className="group/th text-left text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider px-5 py-3"
                    >
                      <div className="flex items-center">
                        <span>{field.label}</span>
                        <ColumnHeaderMenu
                          field={field}
                          onRename={(label) => handleColumnRename(field.id, label)}
                          onChangeType={(ft) => handleColumnChangeType(field.id, ft)}
                          onHide={() => handleColumnHide(field.id)}
                          onDelete={() => handleColumnDelete(field.id)}
                        />
                      </div>
                    </th>
                  ))}
                  {/* Add column button */}
                  <th className="w-10 px-3 py-3">
                    {!fieldsLoading && (
                      <AddColumnButton onAdd={addField} />
                    )}
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {filtered.map((order, idx) => {
                    const hasNext = !!NEXT_STATUS[order.status];
                    const isDone = order.status === "paid";
                    const isSelected = selectedIds.has(order.id);

                    return (
                      <motion.tr
                        key={order.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        onClick={() => setSelectedId(order.id)}
                        className={`group border-b border-[#F5F5F3] last:border-b-0 transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-[#EEF2FF] hover:bg-[#E8EDFF]"
                            : "hover:bg-[#FAFAF9]"
                        }`}
                      >
                        {/* Row checkbox */}
                        <td className="w-[44px] px-3 py-3">
                          <div className="flex items-center justify-center">
                            <SelectableCheckbox
                              checked={isSelected}
                              onChange={() => handleRowSelect(order.id, idx)}
                            />
                          </div>
                        </td>
                        {/* Check circle = advance status */}
                        <td className="px-1 py-3 text-center">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleAdvanceStatus(order.id, order.status); }}
                            disabled={!hasNext}
                            title={hasNext ? `Avancer vers ${STATUS_LABELS[NEXT_STATUS[order.status]]}` : "Terminé"}
                            className={`w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center transition-all cursor-pointer ${
                              isDone
                                ? "bg-emerald-500 border-emerald-500 text-white"
                                : "border-[#D0D0CE] hover:border-[#4F46E5] hover:bg-[#EEF2FF] text-transparent hover:text-[#4F46E5]"
                            }`}
                          >
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </button>
                        </td>
                        {/* ── All cells (dynamic) ── */}
                        {visibleColumns.map((field) => (
                          <td
                            key={field.id}
                            className={`px-5 py-3 text-[13px] text-[#191919] ${CELL_STYLES[field.key] ?? ""}`}
                          >
                            {renderCell(field, order)}
                          </td>
                        ))}
                        {/* Chevron = open drawer */}
                        <td className="px-3 py-3 text-center">
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedId(order.id); }}
                            title="Voir le détail"
                            className="p-1.5 rounded-md hover:bg-[#F0F0EE] text-[#C0C0BE] hover:text-[#5A5A58] transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={totalColSpan} className="px-5 py-16 text-center">
                      <div className="text-[#C0C0BE] mb-2">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      </div>
                      <p className="text-[14px] text-[#8A8A88] font-medium">Aucune commande trouvée</p>
                      <p className="text-[12px] text-[#B0B0AE] mt-1">
                        {search ? "Essayez un autre terme de recherche." : "Créez votre première commande pour commencer."}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* Bulk actions toolbar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <BulkToolbar
            count={selectedIds.size}
            onDelete={handleBulkDelete}
            onDuplicate={handleBulkDuplicate}
            onMove={handleBulkMove}
            onClear={() => setSelectedIds(new Set())}
          />
        )}
      </AnimatePresence>

      {/* Drawers */}
      <OrderDrawer
        order={selected}
        onClose={() => setSelectedId(null)}
        patchOrder={patchOrder}
        clients={clients}
        customFields={drawerFields}
        onAddOption={handleAddOption}
        onClientDeleted={mutate}
      />
      <CreateOrderDrawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => { mutate(); track("order_created"); if (orders.length === 0) track("first_order_created"); }}
      />

    </div>
  );
}
