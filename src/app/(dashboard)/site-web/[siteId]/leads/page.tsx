"use client";

import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import SlidePanel from "@/components/ui/SlidePanel";
import StatCard from "@/components/ui/StatCard";
import { useApi } from "@/lib/hooks/use-api";
import type { Lead, LeadStatus } from "@/types";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ─── Source config ───
const sourceConfig: Record<string, { label: string; color: string; bg: string }> = {
  "contact-form": { label: "Contact", color: "#4F46E5", bg: "#EEF2FF" },
  "custom-form": { label: "Formulaire", color: "#6366F1", bg: "#EDE9FE" },
  "quote-request": { label: "Devis", color: "#F59E0B", bg: "#FFFBEB" },
  "newsletter": { label: "Newsletter", color: "#10B981", bg: "#ECFDF5" },
  "lead-magnet": { label: "Lead magnet", color: "#F97316", bg: "#FFF7ED" },
  "checkout": { label: "Checkout", color: "#8B5CF6", bg: "#F5F3FF" },
  "booking": { label: "Réservation", color: "#EC4899", bg: "#FDF2F8" },
  "signup": { label: "Inscription", color: "#06B6D4", bg: "#ECFEFF" },
  "other": { label: "Autre", color: "#8A8A88", bg: "#F7F7F5" },
};

const statusConfig: Record<LeadStatus, { label: string; color: string; bg: string }> = {
  new: { label: "Nouveau", color: "#4F46E5", bg: "#EEF2FF" },
  contacted: { label: "Contacté", color: "#F59E0B", bg: "#FFFBEB" },
  qualified: { label: "Qualifié", color: "#10B981", bg: "#ECFDF5" },
  won: { label: "Converti", color: "#059669", bg: "#D1FAE5" },
  lost: { label: "Perdu", color: "#EF4444", bg: "#FEF2F2" },
  archived: { label: "Archivé", color: "#8A8A88", bg: "#F7F7F5" },
};

const allStatuses: LeadStatus[] = ["new", "contacted", "qualified", "won", "lost", "archived"];

function transformLead(row: any): Lead {
  return {
    id: row.id,
    name: row.name || "",
    email: row.email,
    phone: row.phone || null,
    company: row.company || null,
    source: row.source || "contact-form",
    status: row.status || "new",
    message: row.message || null,
    fields: row.fields || {},
    page_path: row.page_path || null,
    block_type: row.block_type || null,
    block_label: row.block_label || null,
    utm_source: row.utm_source || null,
    utm_medium: row.utm_medium || null,
    utm_campaign: row.utm_campaign || null,
    referrer: row.referrer || null,
    product_name: row.product_name || null,
    amount: row.amount ?? null,
    notes: row.notes || null,
    created_at: row.created_at || new Date().toISOString(),
  };
}

type FilterType = "all" | LeadStatus | string;

export default function SiteLeadsPage() {
  const { data: rawLeads, mutate } = useApi<Record<string, unknown>[]>("/api/leads");
  const leads: Lead[] = useMemo(() => rawLeads ? rawLeads.map(transformLead) : [], [rawLeads]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterType>("all");
  const [filterSource, setFilterSource] = useState<FilterType>("all");
  const [selected, setSelected] = useState<Lead | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);

  // ─── Stats ───
  const stats = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const thisWeek = leads.filter(l => new Date(l.created_at) >= weekAgo).length;
    const thisMonth = leads.filter(l => new Date(l.created_at) >= monthAgo).length;
    const byStatus: Record<string, number> = {};
    const bySource: Record<string, number> = {};
    let totalAmount = 0;

    for (const l of leads) {
      byStatus[l.status] = (byStatus[l.status] || 0) + 1;
      bySource[l.source] = (bySource[l.source] || 0) + 1;
      if (l.amount) totalAmount += l.amount;
    }

    return { total: leads.length, thisWeek, thisMonth, byStatus, bySource, totalAmount };
  }, [leads]);

  // ─── Filtering ───
  const filtered = useMemo(() => {
    return leads.filter(l => {
      if (filterStatus !== "all" && l.status !== filterStatus) return false;
      if (filterSource !== "all" && l.source !== filterSource) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          l.name.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          (l.company && l.company.toLowerCase().includes(q)) ||
          (l.phone && l.phone.includes(q))
        );
      }
      return true;
    });
  }, [leads, filterStatus, filterSource, search]);

  // ─── Actions ───
  const updateLead = useCallback(async (id: string, data: { status?: string; notes?: string }) => {
    setSavingStatus(true);
    try {
      const res = await fetch("/api/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...data }),
      });
      if (!res.ok) throw new Error("update failed");
      mutate();
      if (selected && selected.id === id) {
        setSelected(prev => prev ? { ...prev, ...data } as Lead : null);
      }
    } catch {
      alert("Erreur lors de la mise à jour du lead");
    } finally {
      setSavingStatus(false);
    }
  }, [mutate, selected]);

  const openLead = (lead: Lead) => {
    setSelected(lead);
    setEditNotes(lead.notes || "");
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
  };

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const getSourceBadge = (source: string) => {
    const cfg = sourceConfig[source] || { label: source, color: "#8A8A88", bg: "#F7F7F5" };
    return <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ color: cfg.color, backgroundColor: cfg.bg }}>{cfg.label}</span>;
  };

  const getStatusBadge = (status: LeadStatus) => {
    const cfg = statusConfig[status] || statusConfig.new;
    return <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ color: cfg.color, backgroundColor: cfg.bg }}>{cfg.label}</span>;
  };

  // ─── Source filter options (only show sources that exist) ───
  const activeSources = useMemo(() => {
    const set = new Set(leads.map(l => l.source));
    return Array.from(set).sort();
  }, [leads]);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1 className="text-xl font-bold text-[#191919]">Leads</h1>
          <p className="text-[13px] text-[#8A8A88] mt-0.5">
            {leads.length} contact{leads.length !== 1 ? "s" : ""} collecté{leads.length !== 1 ? "s" : ""} depuis votre site
          </p>
        </div>
      </motion.div>

      {/* KPI Strip */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        <StatCard label="Total leads" value={String(stats.total)} change={`${stats.thisMonth} ce mois`} positive={true} />
        <StatCard label="Cette semaine" value={String(stats.thisWeek)} change="7 derniers jours" positive={stats.thisWeek > 0} />
        <StatCard label="Nouveaux" value={String(stats.byStatus["new"] || 0)} change="à traiter" positive={true} />
        <StatCard label="Qualifiés" value={String(stats.byStatus["qualified"] || 0)} change="prêts à convertir" positive={(stats.byStatus["qualified"] || 0) > 0} />
        <StatCard label="Convertis" value={String(stats.byStatus["won"] || 0)} change={stats.totalAmount > 0 ? `${stats.totalAmount} €` : "clients gagnés"} positive={(stats.byStatus["won"] || 0) > 0} />
      </motion.div>

      {/* Source breakdown mini-bar */}
      {leads.length > 0 && (
        <motion.div
          className="bg-white rounded-xl border border-[#E6E6E4] p-4 mb-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex items-center gap-6 flex-wrap">
            <span className="text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider">Sources</span>
            {activeSources.map(src => {
              const cfg = sourceConfig[src] || { label: src, color: "#8A8A88", bg: "#F7F7F5" };
              const count = stats.bySource[src] || 0;
              return (
                <button
                  key={src}
                  onClick={() => setFilterSource(filterSource === src ? "all" : src)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[12px] transition-all ${filterSource === src ? "ring-1 ring-[#4F46E5]/30 bg-[#EEF2FF]" : "hover:bg-[#F7F7F5]"}`}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.color }} />
                  <span className="font-medium text-[#191919]">{cfg.label}</span>
                  <span className="text-[#8A8A88]">{count}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Filters + Search */}
      <motion.div
        className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        {/* Status filters */}
        <div className="flex items-center gap-1 flex-wrap">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${filterStatus === "all" ? "bg-[#191919] text-white" : "text-[#5A5A58] hover:bg-[#F7F7F5]"}`}
          >
            Tous
          </button>
          {allStatuses.map(s => {
            const count = stats.byStatus[s] || 0;
            if (count === 0 && s !== "new") return null;
            const cfg = statusConfig[s];
            return (
              <button
                key={s}
                onClick={() => setFilterStatus(filterStatus === s ? "all" : s)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1 ${filterStatus === s ? "bg-[#191919] text-white" : "text-[#5A5A58] hover:bg-[#F7F7F5]"}`}
              >
                {cfg.label}
                {count > 0 && <span className={`text-[10px] ${filterStatus === s ? "text-white/70" : "text-[#8A8A88]"}`}>{count}</span>}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64 sm:ml-auto">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8A8A88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher nom, email, entreprise..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-[#E6E6E4] rounded-lg pl-9 pr-4 py-2 text-[12px] text-[#191919] placeholder-[#8A8A88] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all"
          />
        </div>
      </motion.div>

      {/* Main table */}
      <motion.div
        className="bg-white rounded-xl border border-[#E6E6E4] overflow-hidden"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#EFEFEF]">
                {["Lead", "Source", "Statut", "Page", "Date"].map(h => (
                  <th key={h} className="text-left text-[10px] font-semibold text-[#8A8A88] uppercase tracking-wider px-4 py-2.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(lead => (
                <tr
                  key={lead.id}
                  onClick={() => openLead(lead)}
                  className="border-b border-[#F8F8FA] last:border-b-0 hover:bg-[#FBFBFA] transition-colors cursor-pointer group"
                >
                  {/* Identity */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0" style={{ backgroundColor: sourceConfig[lead.source]?.color || "#8A8A88" }}>
                        {(lead.name || lead.email)[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[13px] font-medium text-[#191919] truncate">{lead.name || "—"}</div>
                        <div className="text-[11px] text-[#8A8A88] truncate">{lead.email}</div>
                      </div>
                    </div>
                  </td>
                  {/* Source */}
                  <td className="px-4 py-3">{getSourceBadge(lead.source)}</td>
                  {/* Status */}
                  <td className="px-4 py-3">{getStatusBadge(lead.status)}</td>
                  {/* Page */}
                  <td className="px-4 py-3">
                    <span className="text-[11px] text-[#8A8A88] font-mono">
                      {lead.page_path || "—"}
                    </span>
                  </td>
                  {/* Date */}
                  <td className="px-4 py-3 text-[11px] text-[#8A8A88]">{formatDate(lead.created_at)}</td>
                </tr>
              ))}
              {filtered.length === 0 && leads.length > 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-[13px] text-[#8A8A88]">
                    Aucun lead ne correspond à vos filtres.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {leads.length === 0 && (
          <div className="px-6 py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#EEF2FF] flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h3 className="text-[15px] font-semibold text-[#191919] mb-2">Aucun lead pour le moment</h3>
            <p className="text-[13px] text-[#8A8A88] max-w-md mx-auto mb-6">
              Les leads sont collectés automatiquement depuis les formulaires de contact, demandes de devis,
              inscriptions newsletter, et checkouts de votre site public.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {["Formulaire de contact", "Demande de devis", "Newsletter", "Checkout", "Lead magnet"].map(src => (
                <span key={src} className="inline-block text-[11px] font-medium text-[#5A5A58] bg-[#F7F7F5] border border-[#E6E6E4] px-3 py-1.5 rounded-full">
                  {src}
                </span>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* ─── Detail Drawer ─── */}
      <SlidePanel open={!!selected} onClose={() => setSelected(null)} title={selected?.name || selected?.email || "Lead"}>
        {selected && (
          <div className="space-y-6">
            {/* Identity card */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-[16px] font-bold text-white flex-shrink-0" style={{ backgroundColor: sourceConfig[selected.source]?.color || "#8A8A88" }}>
                {(selected.name || selected.email)[0]?.toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[16px] font-semibold text-[#191919]">{selected.name || "—"}</div>
                <a href={`mailto:${selected.email}`} className="text-[13px] text-[#4F46E5] hover:underline">{selected.email}</a>
                {selected.phone && <div className="text-[12px] text-[#5A5A58] mt-0.5">{selected.phone}</div>}
                {selected.company && <div className="text-[12px] text-[#5A5A58]">{selected.company}</div>}
              </div>
            </div>

            {/* Status selector */}
            <div>
              <div className="text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider mb-2">Statut</div>
              <div className="flex flex-wrap gap-1.5">
                {allStatuses.map(s => {
                  const cfg = statusConfig[s];
                  const active = selected.status === s;
                  return (
                    <button
                      key={s}
                      onClick={() => updateLead(selected.id, { status: s })}
                      disabled={savingStatus}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all border ${
                        active
                          ? "border-current"
                          : "border-transparent hover:bg-[#F7F7F5]"
                      }`}
                      style={active ? { color: cfg.color, backgroundColor: cfg.bg, borderColor: cfg.color + "40" } : { color: "#5A5A58" }}
                    >
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="h-px bg-[#E6E6E4]" />

            {/* Source & Attribution */}
            <div>
              <div className="text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider mb-3">Attribution</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#F7F7F5] rounded-lg p-3">
                  <div className="text-[10px] font-medium text-[#8A8A88] mb-1">Source</div>
                  {getSourceBadge(selected.source)}
                </div>
                <div className="bg-[#F7F7F5] rounded-lg p-3">
                  <div className="text-[10px] font-medium text-[#8A8A88] mb-1">Date</div>
                  <div className="text-[12px] text-[#191919]">{formatDateTime(selected.created_at)}</div>
                </div>
                {selected.page_path && (
                  <div className="bg-[#F7F7F5] rounded-lg p-3">
                    <div className="text-[10px] font-medium text-[#8A8A88] mb-1">Page</div>
                    <div className="text-[12px] text-[#191919] font-mono">{selected.page_path}</div>
                  </div>
                )}
                {selected.block_type && (
                  <div className="bg-[#F7F7F5] rounded-lg p-3">
                    <div className="text-[10px] font-medium text-[#8A8A88] mb-1">Bloc</div>
                    <div className="text-[12px] text-[#191919]">{selected.block_label || selected.block_type}</div>
                  </div>
                )}
                {selected.utm_source && (
                  <div className="bg-[#F7F7F5] rounded-lg p-3 col-span-2">
                    <div className="text-[10px] font-medium text-[#8A8A88] mb-1">Campagne</div>
                    <div className="text-[12px] text-[#191919]">
                      {[selected.utm_source, selected.utm_medium, selected.utm_campaign].filter(Boolean).join(" / ")}
                    </div>
                  </div>
                )}
                {selected.referrer && (
                  <div className="bg-[#F7F7F5] rounded-lg p-3 col-span-2">
                    <div className="text-[10px] font-medium text-[#8A8A88] mb-1">Referrer</div>
                    <div className="text-[12px] text-[#191919] truncate">{selected.referrer}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Business context */}
            {(selected.product_name || selected.amount) && (
              <>
                <div className="h-px bg-[#E6E6E4]" />
                <div>
                  <div className="text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider mb-3">Contexte commercial</div>
                  <div className="grid grid-cols-2 gap-3">
                    {selected.product_name && (
                      <div className="bg-[#F7F7F5] rounded-lg p-3">
                        <div className="text-[10px] font-medium text-[#8A8A88] mb-1">Produit / Service</div>
                        <div className="text-[12px] text-[#191919]">{selected.product_name}</div>
                      </div>
                    )}
                    {selected.amount != null && selected.amount > 0 && (
                      <div className="bg-[#F7F7F5] rounded-lg p-3">
                        <div className="text-[10px] font-medium text-[#8A8A88] mb-1">Montant</div>
                        <div className="text-[14px] font-semibold text-[#191919]">{selected.amount} €</div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Message */}
            {selected.message && (
              <>
                <div className="h-px bg-[#E6E6E4]" />
                <div>
                  <div className="text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider mb-2">Message</div>
                  <div className="bg-[#F7F7F5] rounded-lg p-4 text-[13px] text-[#191919] leading-relaxed whitespace-pre-wrap">
                    {selected.message}
                  </div>
                </div>
              </>
            )}

            {/* Submitted fields */}
            {Object.keys(selected.fields).length > 0 && (
              <>
                <div className="h-px bg-[#E6E6E4]" />
                <div>
                  <div className="text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider mb-2">Données soumises</div>
                  <div className="space-y-2">
                    {Object.entries(selected.fields).map(([key, value]) => (
                      <div key={key} className="bg-[#F7F7F5] rounded-lg p-3">
                        <div className="text-[10px] font-medium text-[#8A8A88] mb-0.5">{key}</div>
                        <div className="text-[13px] text-[#191919]">{String(value ?? "—")}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Internal notes */}
            <div className="h-px bg-[#E6E6E4]" />
            <div>
              <div className="text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider mb-2">Notes internes</div>
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Ajouter des notes sur ce lead..."
                rows={3}
                className="w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-4 py-3 text-[13px] text-[#191919] placeholder-[#BBB] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all resize-none"
              />
              {editNotes !== (selected.notes || "") && (
                <button
                  onClick={() => updateLead(selected.id, { notes: editNotes })}
                  disabled={savingStatus}
                  className="mt-2 px-4 py-1.5 bg-[#4F46E5] text-white text-[12px] font-semibold rounded-lg hover:bg-[#4338CA] transition-colors disabled:opacity-50"
                >
                  Sauvegarder
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="pt-2 space-y-2">
              <a
                href={`mailto:${selected.email}`}
                className="block w-full text-center bg-[#4F46E5] text-white text-[13px] font-semibold py-2.5 rounded-lg hover:bg-[#4338CA] transition-colors"
              >
                Envoyer un email
              </a>
              {selected.phone && (
                <a
                  href={`tel:${selected.phone}`}
                  className="block w-full text-center border border-[#E6E6E4] text-[#191919] text-[13px] font-semibold py-2.5 rounded-lg hover:bg-[#F7F7F5] transition-colors"
                >
                  Appeler
                </a>
              )}
            </div>
          </div>
        )}
      </SlidePanel>
    </div>
  );
}
