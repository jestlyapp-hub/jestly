"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useApi, apiFetch } from "@/lib/hooks/use-api";
import { toast } from "@/lib/hooks/use-toast";
import BadgeStatus from "@/components/ui/BadgeStatus";
import EmptyState from "@/components/ui/EmptyState";
import CreateClientDrawer from "@/components/clients/CreateClientDrawer";
import EditClientSheet from "@/components/clients/EditClientSheet";
import ArchiveClientDialog from "@/components/clients/ArchiveClientDialog";
import DeleteClientDialog from "@/components/clients/DeleteClientDialog";
import RestoreClientDialog from "@/components/clients/RestoreClientDialog";
import SelectableCheckbox from "@/components/ui/SelectableCheckbox";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ClientRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  tags: string[];
  status: "active" | "archived";
  source: string | null;
  total_revenue: number;
  last_order_at: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  orders_count: number;
  website?: string | null;
  notes?: string | null;
  language?: string;
  timezone?: string;
  custom_fields?: Record<string, string>;
}

type Tab = "active" | "archived" | "all";
type SortKey = "name" | "created_at" | "last_order_at" | "total_revenue";
type SortOrder = "asc" | "desc";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatRevenue(cents: number) {
  return new Intl.NumberFormat("fr-FR").format(cents) + " \u20AC";
}

function relativeDate(iso: string | null) {
  if (!iso) return "\u2014";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "à l\u2019instant";
  if (mins < 60) return `il y a ${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `il y a ${days}j`;
  const months = Math.floor(days / 30);
  if (months < 12) return `il y a ${months} mois`;
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

const SORT_LABELS: Record<SortKey, string> = {
  name: "Nom",
  created_at: "Date de création",
  last_order_at: "Dernière commande",
  total_revenue: "Revenu total",
};

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------
export default function ClientsPage() {
  const router = useRouter();

  // Data
  const [tab, setTab] = useState<Tab>("active");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const apiUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set("status", tab);
    if (search.trim()) params.set("q", search.trim());
    params.set("sort", sortKey);
    params.set("order", sortOrder);
    return `/api/clients?${params.toString()}`;
  }, [tab, search, sortKey, sortOrder]);

  const { data: clients, loading, error, mutate } = useApi<ClientRow[]>(apiUrl, []);

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Clear selection on tab/search change
  useEffect(() => {
    setSelectedIds(new Set());
  }, [tab, search]);

  const allSelected = clients && clients.length > 0 && clients.every((c) => selectedIds.has(c.id));

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (!clients) return;
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(clients.map((c) => c.id)));
    }
  };

  // Drawers & Dialogs
  const [showCreate, setShowCreate] = useState(false);
  const [editClient, setEditClient] = useState<ClientRow | null>(null);
  const [archiveClient, setArchiveClient] = useState<{ id: string; name: string } | null>(null);
  const [deleteClient, setDeleteClient] = useState<{ id: string; name: string } | null>(null);
  const [restoreClient, setRestoreClient] = useState<{ id: string; name: string } | null>(null);

  // Actions dropdown
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const actionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openActionId) return;
    const handler = (e: MouseEvent) => {
      if (actionRef.current && !actionRef.current.contains(e.target as Node)) {
        setOpenActionId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openActionId]);

  // Sort dropdown
  const [showSort, setShowSort] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showSort) return;
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setShowSort(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showSort]);

  // Bulk actions
  const [bulkLoading, setBulkLoading] = useState(false);

  const handleBulk = useCallback(
    async (action: "archive" | "restore" | "delete") => {
      if (selectedIds.size === 0) return;
      setBulkLoading(true);
      try {
        await apiFetch("/api/clients/bulk", {
          method: "POST",
          body: { action, ids: Array.from(selectedIds) },
        });
        const labels = { archive: "archivé(s)", restore: "restauré(s)", delete: "supprimé(s)" };
        toast.success(`${selectedIds.size} client(s) ${labels[action]}`);
        setSelectedIds(new Set());
        mutate();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erreur lors de l\u2019action groupée");
      } finally {
        setBulkLoading(false);
      }
    },
    [selectedIds, mutate]
  );

  // Counts per tab (use current data length for active tab count)
  const counts = useMemo(() => {
    if (!clients) return { active: 0, archived: 0, all: 0 };
    const total = clients.length;
    // We only have the filtered list, so show count from current data
    return { active: tab === "active" ? total : 0, archived: tab === "archived" ? total : 0, all: tab === "all" ? total : 0 };
  }, [clients, tab]);

  // Sort click on column header
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder(key === "name" ? "asc" : "desc");
    }
  };

  // ---------------------------------------------------------------------------
  // Loading State
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-24 bg-[#F7F7F5] rounded-md animate-pulse" />
          <div className="h-6 w-16 bg-[#F7F7F5] rounded-full animate-pulse" />
        </div>
        <div className="bg-white rounded-xl border border-[#E6E6E4] overflow-hidden">
          <div className="h-10 border-b border-[#EFEFEF] bg-[#FBFBFA]" />
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-[#F8F8FA] last:border-b-0">
              <div className="w-5 h-5 bg-[#F7F7F5] rounded animate-pulse" />
              <div className="w-8 h-8 bg-[#F7F7F5] rounded-full animate-pulse" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-32 bg-[#F7F7F5] rounded animate-pulse" />
              </div>
              <div className="h-3.5 w-36 bg-[#F7F7F5] rounded animate-pulse" />
              <div className="h-3.5 w-12 bg-[#F7F7F5] rounded animate-pulse" />
              <div className="h-3.5 w-16 bg-[#F7F7F5] rounded animate-pulse" />
              <div className="h-3.5 w-20 bg-[#F7F7F5] rounded animate-pulse" />
              <div className="h-5 w-14 bg-[#F7F7F5] rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Error State
  // ---------------------------------------------------------------------------
  if (error) {
    return (
      <div className="max-w-6xl mx-auto py-12 text-center">
        <p className="text-[14px] text-red-500 mb-2">Erreur : {error}</p>
        <button onClick={mutate} className="text-[13px] text-[#4F46E5] hover:underline cursor-pointer">
          Réessayer
        </button>
      </div>
    );
  }

  const rows = clients ?? [];

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="max-w-6xl mx-auto">
      {/* ── Header ── */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="flex items-center gap-3">
          <h1 className="text-[22px] font-bold text-[#1A1A1A]">Clients</h1>
          {rows.length > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F7F7F5] text-[#5A5A58]">
              {rows.length} client{rows.length > 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative max-w-xs w-full">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#999"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher un client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-[#E6E6E4] rounded-lg pl-9 pr-4 py-2 text-[13px] text-[#1A1A1A] placeholder-[#BBB] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all"
            />
          </div>

          {/* Sort */}
          <div className="relative" ref={sortRef}>
            <button
              onClick={() => setShowSort((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium text-[#5A5A58] bg-white border border-[#E6E6E4] rounded-lg hover:bg-[#FBFBFA] transition-colors cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="14" y2="12" />
                <line x1="4" y1="18" x2="8" y2="18" />
              </svg>
              Trier
            </button>

            <AnimatePresence>
              {showSort && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-1 w-52 bg-white border border-[#E6E6E4] rounded-lg shadow-lg z-30 py-1"
                >
                  {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                    <button
                      key={key}
                      onClick={() => {
                        handleSort(key);
                        setShowSort(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-[12px] hover:bg-[#FBFBFA] transition-colors cursor-pointer flex items-center justify-between ${
                        sortKey === key ? "text-[#4F46E5] font-semibold" : "text-[#5A5A58]"
                      }`}
                    >
                      {SORT_LABELS[key]}
                      {sortKey === key && (
                        <span className="text-[10px] text-[#999]">{sortOrder === "asc" ? "\u2191" : "\u2193"}</span>
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Create button */}
          <button
            onClick={() => setShowCreate(true)}
            className="bg-[#4F46E5] text-white rounded-md px-3.5 py-2 text-[13px] font-medium hover:bg-[#4338CA] transition-colors whitespace-nowrap cursor-pointer"
          >
            + Nouveau client
          </button>
        </div>
      </motion.div>

      {/* ── Filter tabs ── */}
      <motion.div
        className="flex items-center gap-0 border-b border-[#E6E6E4] mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.05 }}
      >
        {(["active", "archived", "all"] as Tab[]).map((t) => {
          const labels: Record<Tab, string> = { active: "Actifs", archived: "Archivés", all: "Tous" };
          const isActive = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative px-4 py-2.5 text-[13px] font-medium transition-colors cursor-pointer ${
                isActive ? "text-[#4F46E5]" : "text-[#8A8A88] hover:text-[#5A5A58]"
              }`}
            >
              {labels[t]}
              {counts[t] > 0 && (
                <span className={`ml-1.5 text-[11px] ${isActive ? "text-[#4F46E5]" : "text-[#BBB]"}`}>
                  {counts[t]}
                </span>
              )}
              {isActive && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4F46E5] rounded-full"
                />
              )}
            </button>
          );
        })}
      </motion.div>

      {/* ── Bulk actions bar ── */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-2.5 mb-3 bg-[#EEF2FF] border border-[#C7D2FE] rounded-lg">
              <span className="text-[13px] font-medium text-[#4F46E5]">
                {selectedIds.size} sélectionné{selectedIds.size > 1 ? "s" : ""}
              </span>
              <div className="flex-1" />
              {tab !== "archived" && (
                <button
                  onClick={() => handleBulk("archive")}
                  disabled={bulkLoading}
                  className="text-[12px] font-medium text-[#5A5A58] hover:text-[#1A1A1A] transition-colors cursor-pointer disabled:opacity-40"
                >
                  Archiver
                </button>
              )}
              {tab === "archived" && (
                <button
                  onClick={() => handleBulk("restore")}
                  disabled={bulkLoading}
                  className="text-[12px] font-medium text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer disabled:opacity-40"
                >
                  Restaurer
                </button>
              )}
              <button
                onClick={() => handleBulk("delete")}
                disabled={bulkLoading}
                className="text-[12px] font-medium text-red-500 hover:text-red-600 transition-colors cursor-pointer disabled:opacity-40"
              >
                Supprimer
              </button>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="text-[12px] text-[#999] hover:text-[#5A5A58] transition-colors cursor-pointer ml-2"
              >
                Tout décocher
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Table ── */}
      <motion.div
        className="bg-white rounded-xl border border-[#E6E6E4] overflow-hidden"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
      >
        {rows.length === 0 ? (
          // Empty states
          search.trim() ? (
            <EmptyState
              title={`Aucun résultat pour "${search}"`}
              description="Essayez un autre terme de recherche."
            />
          ) : tab === "archived" ? (
            <EmptyState
              title="Aucun client archivé"
              description="Les clients archivés apparaîtront ici."
            />
          ) : (
            <EmptyState
              title="Aucun client"
              description="Créez votre premier client pour commencer."
              actionLabel="Nouveau client"
              onAction={() => setShowCreate(true)}
            />
          )
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#EFEFEF] bg-[#FBFBFA]">
                  <th className="w-[40px] px-3 py-2.5">
                    <div className="flex items-center justify-center">
                      <SelectableCheckbox
                        checked={!!allSelected}
                        indeterminate={!allSelected && selectedIds.size > 0}
                        onChange={toggleAll}
                      />
                    </div>
                  </th>
                  <th className="text-left text-[11px] font-semibold text-[#999] uppercase tracking-wider px-4 py-2.5">Client</th>
                  <th className="text-left text-[11px] font-semibold text-[#999] uppercase tracking-wider px-4 py-2.5">Email</th>
                  <th
                    className="text-left text-[11px] font-semibold text-[#999] uppercase tracking-wider px-4 py-2.5 cursor-pointer hover:text-[#5A5A58] transition-colors"
                    onClick={() => handleSort("total_revenue")}
                  >
                    <span className="flex items-center gap-1">
                      Commandes
                    </span>
                  </th>
                  <th
                    className="text-left text-[11px] font-semibold text-[#999] uppercase tracking-wider px-4 py-2.5 cursor-pointer hover:text-[#5A5A58] transition-colors"
                    onClick={() => handleSort("total_revenue")}
                  >
                    <span className="flex items-center gap-1">
                      Revenu
                      {sortKey === "total_revenue" && <span className="text-[10px]">{sortOrder === "asc" ? "\u2191" : "\u2193"}</span>}
                    </span>
                  </th>
                  <th
                    className="text-left text-[11px] font-semibold text-[#999] uppercase tracking-wider px-4 py-2.5 cursor-pointer hover:text-[#5A5A58] transition-colors"
                    onClick={() => handleSort("last_order_at")}
                  >
                    <span className="flex items-center gap-1">
                      Dernière commande
                      {sortKey === "last_order_at" && <span className="text-[10px]">{sortOrder === "asc" ? "\u2191" : "\u2193"}</span>}
                    </span>
                  </th>
                  <th className="text-left text-[11px] font-semibold text-[#999] uppercase tracking-wider px-4 py-2.5">Statut</th>
                  <th className="w-12 px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {rows.map((client) => (
                  <tr
                    key={client.id}
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      if (target.closest("[data-no-navigate]")) return;
                      router.push(`/clients/${client.id}`);
                    }}
                    className="border-b border-[#F8F8FA] last:border-b-0 hover:bg-[#FBFBFA] transition-colors cursor-pointer group"
                  >
                    {/* Checkbox */}
                    <td className="w-[40px] px-3 py-3" data-no-navigate>
                      <div className="flex items-center justify-center">
                        <SelectableCheckbox
                          checked={selectedIds.has(client.id)}
                          onChange={() => toggleSelect(client.id)}
                        />
                      </div>
                    </td>

                    {/* Client */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#EEF2FF] flex items-center justify-center text-[11px] font-semibold text-[#4F46E5] flex-shrink-0">
                          {initials(client.name)}
                        </div>
                        <div className="min-w-0">
                          <span className="text-[13px] font-medium text-[#1A1A1A] truncate block">{client.name}</span>
                          {client.company && (
                            <span className="text-[11px] text-[#8A8A88] truncate block">{client.company}</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3 text-[13px] text-[#5A5A58]">{client.email || "\u2014"}</td>

                    {/* Commandes */}
                    <td className="px-4 py-3 text-[13px] text-[#1A1A1A]">{client.orders_count}</td>

                    {/* Revenu */}
                    <td className="px-4 py-3 text-[13px] font-medium text-[#1A1A1A]">
                      {formatRevenue(client.total_revenue)}
                    </td>

                    {/* Dernière commande */}
                    <td className="px-4 py-3 text-[13px] text-[#8A8A88]">
                      {relativeDate(client.last_order_at)}
                    </td>

                    {/* Statut */}
                    <td className="px-4 py-3">
                      <BadgeStatus status={client.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 relative" data-no-navigate>
                      <button
                        onClick={() => setOpenActionId(openActionId === client.id ? null : client.id)}
                        className="p-1 rounded-md hover:bg-[#F7F7F5] transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="5" r="1" />
                          <circle cx="12" cy="12" r="1" />
                          <circle cx="12" cy="19" r="1" />
                        </svg>
                      </button>

                      <AnimatePresence>
                        {openActionId === client.id && (
                          <motion.div
                            ref={actionRef}
                            initial={{ opacity: 0, scale: 0.95, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -4 }}
                            transition={{ duration: 0.12 }}
                            className="absolute right-4 top-full mt-1 w-48 bg-white border border-[#E6E6E4] rounded-lg shadow-lg z-40 py-1"
                          >
                            <button
                              onClick={() => {
                                setOpenActionId(null);
                                router.push(`/clients/${client.id}`);
                              }}
                              className="w-full text-left px-3 py-2 text-[12px] text-[#5A5A58] hover:bg-[#FBFBFA] transition-colors cursor-pointer flex items-center gap-2"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                              Voir le client
                            </button>
                            <button
                              onClick={() => {
                                setOpenActionId(null);
                                setEditClient(client);
                              }}
                              className="w-full text-left px-3 py-2 text-[12px] text-[#5A5A58] hover:bg-[#FBFBFA] transition-colors cursor-pointer flex items-center gap-2"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                              Modifier
                            </button>

                            <div className="border-t border-[#EFEFEF] my-1" />

                            {client.status === "active" ? (
                              <button
                                onClick={() => {
                                  setOpenActionId(null);
                                  setArchiveClient({ id: client.id, name: client.name });
                                }}
                                className="w-full text-left px-3 py-2 text-[12px] text-[#5A5A58] hover:bg-[#FBFBFA] transition-colors cursor-pointer flex items-center gap-2"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="21 8 21 21 3 21 3 8" />
                                  <rect x="1" y="3" width="22" height="5" />
                                  <line x1="10" y1="12" x2="14" y2="12" />
                                </svg>
                                Archiver
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setOpenActionId(null);
                                  setRestoreClient({ id: client.id, name: client.name });
                                }}
                                className="w-full text-left px-3 py-2 text-[12px] text-emerald-600 hover:bg-[#FBFBFA] transition-colors cursor-pointer flex items-center gap-2"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="1 4 1 10 7 10" />
                                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                                </svg>
                                Restaurer
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setOpenActionId(null);
                                setDeleteClient({ id: client.id, name: client.name });
                              }}
                              className="w-full text-left px-3 py-2 text-[12px] text-red-500 hover:bg-red-50 transition-colors cursor-pointer flex items-center gap-2"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                              Supprimer
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* ── Drawers & Dialogs ── */}
      <CreateClientDrawer
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={(id) => {
          setShowCreate(false);
          mutate();
          router.push(`/clients/${id}`);
        }}
      />

      <EditClientSheet
        client={editClient}
        open={!!editClient}
        onClose={() => setEditClient(null)}
        onSaved={() => {
          setEditClient(null);
          mutate();
        }}
      />

      <ArchiveClientDialog
        client={archiveClient}
        open={!!archiveClient}
        onClose={() => setArchiveClient(null)}
        onArchived={() => {
          setArchiveClient(null);
          mutate();
        }}
      />

      <DeleteClientDialog
        client={deleteClient}
        open={!!deleteClient}
        onClose={() => setDeleteClient(null)}
        onDeleted={() => {
          setDeleteClient(null);
          mutate();
        }}
      />

      <RestoreClientDialog
        client={restoreClient}
        open={!!restoreClient}
        onClose={() => setRestoreClient(null)}
        onRestored={() => {
          setRestoreClient(null);
          mutate();
        }}
      />
    </div>
  );
}
