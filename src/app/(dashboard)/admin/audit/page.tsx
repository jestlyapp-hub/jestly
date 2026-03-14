"use client";

import { useState, useEffect, useCallback } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  ScrollText,
  ChevronLeft,
  ChevronRight,
  Shield,
  Eye,
  StickyNote,
  Flag,
  Download,
  ShieldOff,
  Clock,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────
interface AuditLog {
  id: string;
  actor_id: string;
  actor_email: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  result: string;
  created_at: string;
}

// ── Constants ──────────────────────────────────────────────────────
const ACTION_FILTERS = [
  { value: "", label: "Toutes les actions" },
  { value: "admin_access_granted", label: "Accès accordé" },
  { value: "admin_access_denied", label: "Accès refusé" },
  { value: "view_account", label: "Consultation compte" },
  { value: "add_note", label: "Ajout note" },
  { value: "add_flag", label: "Ajout flag" },
  { value: "remove_flag", label: "Retrait flag" },
  { value: "export", label: "Export" },
];

const RESULT_FILTERS = [
  { value: "", label: "Tous les résultats" },
  { value: "success", label: "Succès" },
  { value: "denied", label: "Refusé" },
];

const PAGE_SIZE = 50;

// ── Action badge config ────────────────────────────────────────────
const ACTION_BADGES: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  access_granted: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    icon: <Shield size={12} strokeWidth={1.7} />,
  },
  admin_access_granted: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    icon: <Shield size={12} strokeWidth={1.7} />,
  },
  access_denied: {
    bg: "bg-red-50",
    text: "text-red-700",
    icon: <ShieldOff size={12} strokeWidth={1.7} />,
  },
  admin_access_denied: {
    bg: "bg-red-50",
    text: "text-red-700",
    icon: <ShieldOff size={12} strokeWidth={1.7} />,
  },
  view_account: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    icon: <Eye size={12} strokeWidth={1.7} />,
  },
  add_note: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    icon: <StickyNote size={12} strokeWidth={1.7} />,
  },
  add_flag: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    icon: <Flag size={12} strokeWidth={1.7} />,
  },
  remove_flag: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    icon: <Flag size={12} strokeWidth={1.7} />,
  },
  export: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    icon: <Download size={12} strokeWidth={1.7} />,
  },
};

const DEFAULT_BADGE = {
  bg: "bg-gray-50",
  text: "text-gray-600",
  icon: <Clock size={12} strokeWidth={1.7} />,
};

// ── Helpers ────────────────────────────────────────────────────────
function formatDateTime(d: string): string {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatActionLabel(action: string): string {
  return action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function getActionBadge(action: string) {
  return ACTION_BADGES[action] || DEFAULT_BADGE;
}

// ── Component ──────────────────────────────────────────────────────
export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("");
  const [resultFilter, setResultFilter] = useState("");
  const [page, setPage] = useState(0);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (actionFilter) params.set("action", actionFilter);
    if (resultFilter) params.set("result", resultFilter);
    params.set("sort", "created_at");
    params.set("order", "desc");
    params.set("limit", String(PAGE_SIZE));
    params.set("offset", String(page * PAGE_SIZE));

    try {
      const res = await fetch(`/api/admin/audit?${params}`);
      const data = await res.json();
      setLogs(data.data || []);
      setTotal(data.total || 0);
    } catch {
      setLogs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [actionFilter, resultFilter, page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Reset page on filter change
  useEffect(() => {
    setPage(0);
  }, [actionFilter, resultFilter]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // ── Skeleton rows ──
  const SkeletonRows = () => (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <tr key={i} className="border-b border-[#F0F0EE]">
          <td className="px-5 py-3.5">
            <div className="w-28 h-3.5 bg-[#F0F0EE] rounded animate-pulse" />
          </td>
          <td className="px-5 py-3.5">
            <div className="w-24 h-5 bg-[#F0F0EE] rounded-full animate-pulse" />
          </td>
          <td className="px-5 py-3.5">
            <div className="w-36 h-3.5 bg-[#F0F0EE] rounded animate-pulse" />
          </td>
          <td className="px-5 py-3.5">
            <div className="w-16 h-3.5 bg-[#F0F0EE] rounded animate-pulse" />
          </td>
          <td className="px-5 py-3.5">
            <div className="w-20 h-3.5 bg-[#F0F0EE] rounded animate-pulse" />
          </td>
          <td className="px-5 py-3.5">
            <div className="w-4 h-4 bg-[#F0F0EE] rounded-full animate-pulse" />
          </td>
        </tr>
      ))}
    </>
  );

  return (
    <div className="space-y-5">
      <AdminHeader
        title="Journal d'audit"
        description={`${total} action${total > 1 ? "s" : ""} enregistrée${total > 1 ? "s" : ""}`}
        section="Audit Log"
      />

      {/* ── Filters bar ── */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Action filter */}
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-2.5 rounded-lg bg-white border border-[#E6E6E4] text-[13px] text-[#5A5A58] outline-none cursor-pointer focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-500/10"
        >
          {ACTION_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>

        {/* Result filter */}
        <select
          value={resultFilter}
          onChange={(e) => setResultFilter(e.target.value)}
          className="px-3 py-2.5 rounded-lg bg-white border border-[#E6E6E4] text-[13px] text-[#5A5A58] outline-none cursor-pointer focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-500/10"
        >
          {RESULT_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-xl border border-[#E6E6E4] overflow-hidden">
        {!loading && logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-[#999]">
            <ScrollText size={32} strokeWidth={1.2} className="mb-3 text-[#CCCCCC]" />
            <p className="text-[14px] font-medium text-[#8A8A88]">
              Aucune action enregistr&eacute;e
            </p>
            <p className="text-[12px] text-[#ACACAA] mt-1">
              Les actions admin appara&icirc;tront ici
            </p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#E6E6E4] bg-[#FBFBFA]">
                <th className="px-5 py-3 text-[11px] font-semibold text-[#666] uppercase tracking-wide">
                  Date
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold text-[#666] uppercase tracking-wide">
                  Action
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold text-[#666] uppercase tracking-wide">
                  Acteur
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold text-[#666] uppercase tracking-wide">
                  Cible
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold text-[#666] uppercase tracking-wide">
                  IP
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold text-[#666] uppercase tracking-wide">
                  R&eacute;sultat
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonRows />
              ) : (
                logs.map((log) => {
                  const badge = getActionBadge(log.action);
                  return (
                    <tr
                      key={log.id}
                      className="border-b border-[#F0F0EE] hover:bg-[#FBFBFA] transition-colors"
                    >
                      {/* Date */}
                      <td className="px-5 py-3.5 text-[12px] text-[#8A8A88] whitespace-nowrap tabular-nums">
                        {formatDateTime(log.created_at)}
                      </td>

                      {/* Action badge */}
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${badge.bg} ${badge.text}`}
                        >
                          {badge.icon}
                          {formatActionLabel(log.action)}
                        </span>
                      </td>

                      {/* Actor */}
                      <td className="px-5 py-3.5 text-[13px] text-[#5A5A58]">
                        {log.actor_email}
                      </td>

                      {/* Target */}
                      <td className="px-5 py-3.5">
                        {log.target_id ? (
                          <div className="min-w-0">
                            <span className="text-[12px] text-[#8A8A88]">
                              {log.target_type || "—"}
                            </span>
                            <span className="text-[11px] text-[#ACACAA] ml-1.5 font-mono">
                              {log.target_id.slice(0, 8)}...
                            </span>
                          </div>
                        ) : (
                          <span className="text-[12px] text-[#CCCCCC]">—</span>
                        )}
                      </td>

                      {/* IP */}
                      <td className="px-5 py-3.5 text-[12px] text-[#8A8A88] font-mono">
                        {log.ip_address || "—"}
                      </td>

                      {/* Result dot */}
                      <td className="px-5 py-3.5">
                        <span className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full flex-shrink-0 ${
                              log.result === "success"
                                ? "bg-emerald-500"
                                : "bg-red-500"
                            }`}
                          />
                          <span className="text-[12px] text-[#8A8A88]">
                            {log.result === "success" ? "OK" : "Refus\u00e9"}
                          </span>
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Pagination ── */}
      {total > PAGE_SIZE && (
        <div className="flex items-center justify-between pt-1">
          <p className="text-[12px] text-[#8A8A88]">
            {page * PAGE_SIZE + 1}&ndash;
            {Math.min((page + 1) * PAGE_SIZE, total)} sur {total}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E6E6E4] text-[12px] font-medium text-[#666] hover:bg-[#F7F7F5] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} strokeWidth={1.5} />
              Pr&eacute;c&eacute;dent
            </button>
            <span className="px-3 py-1.5 text-[12px] text-[#5A5A58] font-medium">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E6E6E4] text-[12px] font-medium text-[#666] hover:bg-[#F7F7F5] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Suivant
              <ChevronRight size={14} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
