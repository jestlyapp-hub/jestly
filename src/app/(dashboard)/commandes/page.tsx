"use client";

import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import BadgeStatus from "@/components/ui/BadgeStatus";
import { useApi, apiFetch } from "@/lib/hooks/use-api";
import { orderRecordToOrder } from "@/lib/adapters";
import type { Order, BoardStatus, BoardField } from "@/types";
import type { KanbanView } from "@/lib/kanban-config";
import KanbanStatsBar from "@/components/commandes/KanbanStatsBar";
import KanbanViewToggle from "@/components/commandes/KanbanViewToggle";
import KanbanBoard from "@/components/commandes/KanbanBoard";
import OrderDrawer from "@/components/commandes/OrderDrawer";
import CreateOrderDrawer from "@/components/commandes/CreateOrderDrawer";
import CustomizeDrawer from "@/components/commandes/CustomizeDrawer";

interface KanbanStats {
  caMonth: number;
  enProduction: number;
  attentePaiement: number;
  total: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rawToStatus(s: any): BoardStatus {
  return {
    id: s.id,
    slug: s.slug || "",
    name: s.name,
    color: s.color,
    view: s.view || "production",
    position: s.position,
    isArchived: s.is_archived ?? false,
  };
}

export default function CommandesPage() {
  const [view, setView] = useState<KanbanView>("production");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Order | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rawOrders, loading, error, mutate } = useApi<any[]>("/api/orders");
  const { data: stats, mutate: mutateStats } = useApi<KanbanStats>("/api/orders/stats");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: boardConfig, mutate: mutateBoard } = useApi<any>("/api/orders/board");

  const boardId: string | undefined = boardConfig?.board?.id;

  // Parse grouped statuses
  const productionStatuses: BoardStatus[] = useMemo(() => {
    if (!boardConfig?.statuses?.production) return [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return boardConfig.statuses.production.map((s: any) => rawToStatus(s));
  }, [boardConfig]);

  const cashStatuses: BoardStatus[] = useMemo(() => {
    if (!boardConfig?.statuses?.cash) return [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return boardConfig.statuses.cash.map((s: any) => rawToStatus(s));
  }, [boardConfig]);

  // All statuses combined (for slug-mapping + OrderDrawer dropdown)
  const allStatuses = useMemo(
    () => [...productionStatuses, ...cashStatuses],
    [productionStatuses, cashStatuses]
  );

  // Current view statuses (for KanbanBoard columns)
  const currentStatuses = view === "cashflow" ? cashStatuses : productionStatuses;

  const boardFields: BoardField[] = useMemo(() => {
    if (!boardConfig?.fields) return [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return boardConfig.fields.map((f: any) => ({
      id: f.id as string,
      key: f.key as string,
      label: f.label as string,
      fieldType: f.field_type as BoardField["fieldType"],
      options: Array.isArray(f.options) ? (f.options as string[]) : [],
      isRequired: f.is_required as boolean,
      isVisibleOnCard: f.is_visible_on_card as boolean,
      position: f.position as number,
    }));
  }, [boardConfig]);

  // Convert raw orders and map statusId from all statuses
  const orders: Order[] = useMemo(() => {
    if (!rawOrders) return [];
    return rawOrders.map((raw) => {
      const order = orderRecordToOrder(raw);
      // If no statusId, map from text status slug
      if (!order.statusId && allStatuses.length > 0) {
        const match = allStatuses.find((s) => s.slug === order.status);
        if (match) order.statusId = match.id;
      }
      return order;
    });
  }, [rawOrders, allStatuses]);

  const filtered = orders.filter((o) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      o.client.toLowerCase().includes(q) ||
      o.product.toLowerCase().includes(q) ||
      o.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  const handleStatusChange = useCallback(
    async (orderId: string, newStatusId: string) => {
      const statusObj = allStatuses.find((s) => s.id === newStatusId);
      await apiFetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        body: { status_id: newStatusId, status: statusObj?.slug || "new" },
      });
      mutate();
      mutateStats();
      setSelected((prev) =>
        prev?.id === orderId
          ? {
              ...prev,
              statusId: newStatusId,
              status: (statusObj?.slug || prev.status) as Order["status"],
            }
          : prev
      );
    },
    [mutate, mutateStats, allStatuses]
  );

  const handleOrderUpdate = useCallback(
    async (orderId: string, updates: Partial<Order>) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const body: Record<string, any> = {};
      if ("priority" in updates) body.priority = updates.priority;
      if ("deadline" in updates) body.deadline = updates.deadline || null;
      if ("paid" in updates) body.paid = updates.paid;
      if ("notes" in updates) body.notes = updates.notes || null;
      if ("checklist" in updates) body.checklist = updates.checklist;
      if ("tags" in updates) body.tags = updates.tags;
      if ("customFields" in updates) body.custom_fields = updates.customFields;

      await apiFetch(`/api/orders/${orderId}`, { method: "PATCH", body });
      mutate();
      mutateStats();
      setSelected((prev) =>
        prev?.id === orderId ? { ...prev, ...updates } : prev
      );
    },
    [mutate, mutateStats]
  );

  const refreshAll = useCallback(() => {
    mutate();
    mutateStats();
    mutateBoard();
  }, [mutate, mutateStats, mutateBoard]);

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto">
        <div className="h-8 w-40 bg-[#F7F7F5] rounded animate-pulse mb-6" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-16 bg-[#F7F7F5] rounded-lg animate-pulse"
            />
          ))}
        </div>
        <div className="flex gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-[280px] h-[300px] bg-[#F7F7F5]/50 rounded-lg animate-pulse flex-shrink-0"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto py-12 text-center">
        <p className="text-[14px] text-red-500 mb-2">Erreur : {error}</p>
        <button
          onClick={mutate}
          className="text-[13px] text-[#4F46E5] hover:underline cursor-pointer"
        >
          Reessayer
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-[#191919]">Commandes</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCustomizeOpen(true)}
            className="flex items-center gap-1.5 border border-[#E6E6E4] text-[#5A5A58] text-[13px] font-medium px-3 py-2 rounded-lg hover:bg-[#F7F7F5] transition-colors cursor-pointer"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Personnaliser
          </button>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-1.5 bg-[#4F46E5] text-white text-[13px] font-semibold px-4 py-2.5 rounded-lg hover:bg-[#4338CA] transition-colors cursor-pointer"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nouvelle commande
          </button>
        </div>
      </motion.div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="mb-5"
      >
        <KanbanStatsBar stats={stats} />
      </motion.div>

      {/* Controls */}
      <motion.div
        className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <KanbanViewToggle view={view} onChange={setView} />
        <div className="relative flex-1 max-w-xs">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#8A8A88"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute left-3 top-1/2 -translate-y-1/2"
          >
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

      {/* Board or Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        {view === "table" ? (
          <div className="bg-white rounded-xl border border-[#E6E6E4] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#EFEFEF]">
                    {[
                      "Ref",
                      "Client",
                      "Produit",
                      "Prix",
                      "Statut",
                      "Priorite",
                      "Date",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider px-5 py-3"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => setSelected(order)}
                      className="border-b border-[#F8F8FA] last:border-b-0 hover:bg-[#FBFBFA] transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-3.5 text-[12px] font-mono text-[#8A8A88]">
                        {order.id.slice(0, 8)}
                      </td>
                      <td className="px-5 py-3.5 text-[13px] font-medium text-[#191919]">
                        {order.client}
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-[#5A5A58]">
                        {order.product}
                      </td>
                      <td className="px-5 py-3.5 text-[13px] font-medium text-[#191919]">
                        {order.price} &euro;
                      </td>
                      <td className="px-5 py-3.5">
                        <BadgeStatus status={order.status} />
                      </td>
                      <td className="px-5 py-3.5 text-[12px] text-[#5A5A58] capitalize">
                        {order.priority}
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-[#8A8A88]">
                        {order.date}
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-5 py-12 text-center text-[14px] text-[#8A8A88]"
                      >
                        Aucune commande trouvee.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <KanbanBoard
            orders={filtered}
            columns={currentStatuses}
            boardFields={boardFields}
            onCardClick={(order) => setSelected(order)}
            onStatusChange={handleStatusChange}
          />
        )}
      </motion.div>

      {/* Order detail drawer */}
      <OrderDrawer
        order={selected}
        boardStatuses={allStatuses}
        boardFields={boardFields}
        onClose={() => setSelected(null)}
        onStatusChange={handleStatusChange}
        onUpdate={handleOrderUpdate}
      />

      {/* Create order drawer */}
      <CreateOrderDrawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={refreshAll}
        statuses={productionStatuses}
        fields={boardFields}
      />

      {/* Customize drawer */}
      <CustomizeDrawer
        open={customizeOpen}
        onClose={() => setCustomizeOpen(false)}
        boardId={boardId}
        currentView={view === "cashflow" ? "cash" : "production"}
        productionStatuses={productionStatuses}
        cashStatuses={cashStatuses}
        fields={boardFields}
        onRefresh={mutateBoard}
      />
    </div>
  );
}
