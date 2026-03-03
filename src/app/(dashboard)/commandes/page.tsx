"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApi, apiFetch } from "@/lib/hooks/use-api";
import { useColumns } from "@/lib/hooks/use-columns";
import { orderRecordToOrder } from "@/lib/adapters";
import type { Order, FieldOption, BoardField } from "@/types";
import OrderDrawer from "@/components/commandes/OrderDrawer";
import CreateOrderDrawer from "@/components/commandes/CreateOrderDrawer";
import EditableCell from "@/components/commandes/EditableCell";
import ClientSelectCell from "@/components/commandes/ClientSelectCell";
import StatusSelectCell from "@/components/commandes/StatusSelectCell";
import CustomCell from "@/components/commandes/CustomCell";
import AddColumnButton from "@/components/commandes/AddColumnButton";
import ColumnHeaderMenu from "@/components/commandes/ColumnHeaderMenu";
import BulkToolbar from "@/components/commandes/BulkToolbar";
import { toast } from "@/lib/hooks/use-toast";
import { formatDateFR, isOverdue } from "@/lib/notion-colors";
import { NEXT_STATUS, PREV_STATUS, STATUS_LABELS, LEGACY_SEEDED_KEYS } from "@/lib/kanban-config";

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
  title: "font-medium max-w-[220px]",
  client: "max-w-[180px]",
  price: "font-medium",
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

/* ─── Base column header class ─── */
const TH_CLASS = "text-left text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider px-5 py-3";

interface ClientOption {
  id: string;
  name: string;
  email: string;
}

/* ─── Page ─── */

export default function CommandesPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("todo");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

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

  const counts = useMemo(() => {
    const c = { todo: 0, in_progress: 0, delivered: 0, paid: 0, all: orders.length };
    for (const o of orders) {
      if (o.status === "new") c.todo++;
      else if (o.status === "in_progress") c.in_progress++;
      else if (o.status === "delivered") c.delivered++;
      else if (o.status === "paid") c.paid++;
    }
    return c;
  }, [orders]);

  const filtered = useMemo(() => {
    let list = orders;
    const tab = TABS.find((t) => t.key === activeTab);
    if (tab?.slug) list = list.filter((o) => o.status === tab.slug);
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
    (orderId: string, index: number, e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (e.shiftKey && lastClickedIdx.current !== null) {
          const start = Math.min(lastClickedIdx.current, index);
          const end = Math.max(lastClickedIdx.current, index);
          for (let i = start; i <= end; i++) {
            next.add(filtered[i].id);
          }
        } else if (e.metaKey || e.ctrlKey) {
          if (next.has(orderId)) next.delete(orderId);
          else next.add(orderId);
        } else {
          if (next.has(orderId) && next.size === 1) {
            next.delete(orderId);
          } else {
            next.clear();
            next.add(orderId);
          }
        }
        lastClickedIdx.current = index;
        return next;
      });
    },
    [filtered]
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
      <div className="max-w-[1100px] mx-auto">
        <div className="h-8 w-40 bg-[#F7F7F5] rounded animate-pulse mb-6" />
        <div className="h-10 w-80 bg-[#F7F7F5] rounded animate-pulse mb-5" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-[#F7F7F5] rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  /* ─── Error (only if no data at all — inline banner otherwise) ─── */

  if (error && !rawOrders) {
    return (
      <div className="max-w-6xl mx-auto py-12 text-center">
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
        return <EditableCell value={order.product} onCommit={(v) => handleInlineTitle(order.id, v)} />;
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
      case "deadline":
        return order.deadline ? (
          <span className={isOverdue(order.deadline) ? "text-red-500 font-medium" : "text-[#5A5A58]"}>
            {formatDateFR(order.deadline)}
          </span>
        ) : (
          <span className="text-[#D0D0CE]">—</span>
        );
      case "date":
        return <span className="text-[#8A8A88]">{order.date}</span>;
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
    <div className="max-w-[1100px] mx-auto">
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-[#191919]">Commandes</h1>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-1.5 bg-[#4F46E5] text-white text-[13px] font-semibold px-4 py-2.5 rounded-lg hover:bg-[#4338CA] transition-colors cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nouvelle commande
        </button>
      </motion.div>

      {/* Tabs + Search */}
      <motion.div
        className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        <div className="flex items-center gap-0 border-b border-[#E6E6E4]">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setSelectedIds(new Set()); }}
              className={`relative px-4 py-2 text-[13px] font-medium transition-colors cursor-pointer ${
                activeTab === tab.key
                  ? "text-[#4F46E5]"
                  : "text-[#8A8A88] hover:text-[#5A5A58]"
              }`}
            >
              {tab.label}
              <span className={`ml-1.5 text-[11px] ${activeTab === tab.key ? "text-[#4F46E5]" : "text-[#8A8A88]"}`}>
                {counts[tab.key]}
              </span>
              {activeTab === tab.key && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#4F46E5] rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-xs sm:ml-auto">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8A8A88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-[#E6E6E4] rounded-lg pl-9 pr-4 py-2 text-[13px] text-[#191919] placeholder-[#8A8A88] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all"
          />
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="bg-white rounded-xl border border-[#E6E6E4]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#EFEFEF]">
                  {/* Select all checkbox */}
                  <th className="w-10 px-3 py-3">
                    <button
                      onClick={handleSelectAll}
                      className="w-4 h-4 rounded border-[1.5px] flex items-center justify-center cursor-pointer transition-colors"
                      style={{
                        borderColor: allSelected || someSelected ? "#4F46E5" : "#D0D0CE",
                        backgroundColor: allSelected ? "#4F46E5" : "transparent",
                      }}
                    >
                      {allSelected && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                      {someSelected && !allSelected && (
                        <div className="w-2 h-0.5 bg-[#4F46E5] rounded" />
                      )}
                    </button>
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
                        className={`group border-b border-[#F8F8FA] last:border-b-0 transition-colors ${
                          isSelected ? "bg-[#EEF2FF]" : "hover:bg-[#FBFBFA]"
                        }`}
                      >
                        {/* Row checkbox */}
                        <td className="px-3 py-3.5">
                          <button
                            onClick={(e) => handleRowSelect(order.id, idx, e)}
                            className="w-4 h-4 rounded border-[1.5px] flex items-center justify-center cursor-pointer transition-colors"
                            style={{
                              borderColor: isSelected ? "#4F46E5" : "#D0D0CE",
                              backgroundColor: isSelected ? "#4F46E5" : "transparent",
                            }}
                          >
                            {isSelected && (
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </button>
                        </td>
                        {/* Check circle = advance status */}
                        <td className="px-1 py-3.5 text-center">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleAdvanceStatus(order.id, order.status); }}
                            disabled={!hasNext}
                            title={hasNext ? `Avancer vers ${STATUS_LABELS[NEXT_STATUS[order.status]]}` : "Terminé"}
                            className={`w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center transition-all cursor-pointer ${
                              isDone
                                ? "bg-green-500 border-green-500 text-white"
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
                            className={`px-5 py-3.5 text-[13px] text-[#191919] ${CELL_STYLES[field.key] ?? ""}`}
                          >
                            {renderCell(field, order)}
                          </td>
                        ))}
                        {/* Chevron = open drawer */}
                        <td className="px-3 py-3.5 text-center">
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedId(order.id); }}
                            title="Voir le détail"
                            className="p-1 rounded hover:bg-[#F7F7F5] text-[#C0C0BE] hover:text-[#5A5A58] transition-colors cursor-pointer"
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
                    <td colSpan={totalColSpan} className="px-5 py-12 text-center text-[14px] text-[#8A8A88]">
                      Aucune commande trouvée.
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
      />
      <CreateOrderDrawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={mutate}
      />

    </div>
  );
}
