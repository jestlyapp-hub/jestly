"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MANUAL_TEMPLATES } from "@/lib/email/types";
import type { WaitlistTemplateKey, SendEmailResult } from "@/lib/email/types";

interface WaitlistEntry {
  id: string;
  email: string;
  first_name: string;
  twitter: string | null;
  job_type: string;
  status: string;
  source: string | null;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  notes: string | null;
  tags: string[];
  score: number;
  invited_at: string | null;
  last_contacted_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

const STATUSES = [
  { value: "all", label: "Tous" },
  { value: "new", label: "Nouveau" },
  { value: "contacted", label: "Contacté" },
  { value: "qualified", label: "Qualifié" },
  { value: "invited", label: "Invité" },
  { value: "active", label: "Actif" },
  { value: "rejected", label: "Rejeté" },
];

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-50 text-blue-700 border-blue-200",
  contacted: "bg-amber-50 text-amber-700 border-amber-200",
  qualified: "bg-emerald-50 text-emerald-700 border-emerald-200",
  invited: "bg-violet-50 text-violet-700 border-violet-200",
  active: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

const JOB_LABELS: Record<string, string> = {
  "freelance-creative": "Créatif",
  "freelance-dev": "Dev / Tech",
  "agency": "Agence",
  "freelance-other": "Autre",
  "curious": "Curieux",
};

type Audience = "selected" | "filtered" | "all";

export default function AdminWaitlistPage() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterJob, setFilterJob] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<WaitlistEntry | null>(null);
  const [drawerNotes, setDrawerNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  // ── Multi-select ──
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  // ── Email modal ──
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailTemplate, setEmailTemplate] = useState<WaitlistTemplateKey>("teasing_produit");
  const [emailAudience, setEmailAudience] = useState<Audience>("selected");
  const [emailSending, setEmailSending] = useState(false);
  const [emailResult, setEmailResult] = useState<SendEmailResult | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check admin status via le champ is_admin de /api/auth/me
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setIsAdmin(d.is_admin === true))
      .catch(() => setIsAdmin(false));
  }, []);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterStatus !== "all") params.set("status", filterStatus);
    if (filterJob !== "all") params.set("job_type", filterJob);
    if (search) params.set("search", search);
    params.set("limit", "200");

    try {
      const res = await fetch(`/api/admin/waitlist?${params}`);
      const data = await res.json();
      setEntries(data.data || []);
      setTotal(data.total || 0);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterJob, search]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // Clear selection when filters change
  useEffect(() => {
    setCheckedIds(new Set());
  }, [filterStatus, filterJob, search]);

  const handleSearchChange = (v: string) => {
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => setSearch(v), 300);
  };

  const updateEntry = async (id: string, updates: Record<string, unknown>) => {
    await fetch("/api/admin/waitlist", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    });
    fetchEntries();
    if (selected?.id === id) {
      setSelected((prev) => prev ? { ...prev, ...updates } as WaitlistEntry : null);
    }
  };

  const deleteEntry = async (id: string) => {
    if (!confirm("Supprimer cette entrée ?")) return;
    await fetch(`/api/admin/waitlist?id=${id}`, { method: "DELETE" });
    fetchEntries();
    if (selected?.id === id) setSelected(null);
  };

  const saveNotes = async () => {
    if (!selected) return;
    setSavingNotes(true);
    await updateEntry(selected.id, { notes: drawerNotes });
    setSavingNotes(false);
  };

  const exportCSV = () => {
    const headers = ["Prénom", "Email", "Twitter", "Métier", "Statut", "Score", "Source", "UTM Source", "Date"];
    const rows = entries.map((e) => [
      e.first_name,
      e.email,
      e.twitter || "",
      JOB_LABELS[e.job_type] || e.job_type,
      e.status,
      e.score,
      e.source || "",
      e.utm_source || "",
      new Date(e.created_at).toLocaleDateString("fr-FR"),
    ]);

    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `waitlist-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openDrawer = (entry: WaitlistEntry) => {
    setSelected(entry);
    setDrawerNotes(entry.notes || "");
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

  // ── Checkbox logic ──
  const toggleCheck = (id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (checkedIds.size === entries.length) {
      setCheckedIds(new Set());
    } else {
      setCheckedIds(new Set(entries.map((e) => e.id)));
    }
  };

  // ── Email modal logic ──
  const openEmailModal = () => {
    setEmailResult(null);
    setEmailError(null);
    setPreviewHtml(null);
    setEmailAudience(checkedIds.size > 0 ? "selected" : "all");
    setEmailModalOpen(true);
  };

  const recipientCount = (): number => {
    if (emailAudience === "selected") return checkedIds.size;
    if (emailAudience === "filtered") return entries.length;
    return total;
  };

  // Fetch preview when template changes
  useEffect(() => {
    if (!emailModalOpen) return;
    setPreviewHtml(null);
    fetch(`/api/admin/waitlist/email-preview?template=${emailTemplate}`)
      .then((r) => r.json())
      .then((d) => setPreviewHtml(d.html || null))
      .catch(() => setPreviewHtml(null));
  }, [emailTemplate, emailModalOpen]);

  const handleSendEmail = async () => {
    const count = recipientCount();
    if (count === 0) {
      setEmailError("Aucun destinataire");
      return;
    }

    setEmailSending(true);
    setEmailError(null);
    setEmailResult(null);

    try {
      const res = await fetch("/api/admin/waitlist/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template: emailTemplate,
          audience: emailAudience,
          selectedIds: emailAudience === "selected" ? Array.from(checkedIds) : undefined,
          filters: emailAudience === "filtered" ? {
            status: filterStatus,
            job_type: filterJob,
            search: search || undefined,
          } : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setEmailError(data.error || "Erreur lors de l'envoi");
      } else {
        setEmailResult(data as SendEmailResult);
      }
    } catch {
      setEmailError("Erreur réseau");
    } finally {
      setEmailSending(false);
    }
  };

  const templateLabel = MANUAL_TEMPLATES.find((t) => t.key === emailTemplate)?.label ?? "";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1A1A1A]">Waitlist CRM</h1>
          <p className="text-sm text-[#666] mt-0.5">
            {total} inscrit{total > 1 ? "s" : ""} au total
            {checkedIds.size > 0 && (
              <span className="ml-2 text-[#7C3AED] font-medium">
                &middot; {checkedIds.size} sélectionné{checkedIds.size > 1 ? "s" : ""}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={openEmailModal}
              className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-white bg-[#7C3AED] rounded-lg hover:bg-[#6D28D9] transition-colors cursor-pointer shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              Envoyer un email
            </button>
          )}
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-[#666] bg-white border border-[#E6E6E4] rounded-lg hover:bg-[#F7F7F5] transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher email, nom, twitter..."
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white border border-[#E6E6E4] text-[13px] text-[#1A1A1A] placeholder:text-[#999] outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-violet-500/10"
          />
        </div>

        <div className="flex gap-1.5">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => setFilterStatus(s.value)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors cursor-pointer ${
                filterStatus === s.value
                  ? "bg-[#7C3AED] text-white"
                  : "bg-white border border-[#E6E6E4] text-[#666] hover:bg-[#F7F7F5]"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <select
          value={filterJob}
          onChange={(e) => setFilterJob(e.target.value)}
          className="px-3 py-2 rounded-lg bg-white border border-[#E6E6E4] text-[12px] text-[#666] outline-none cursor-pointer"
        >
          <option value="all">Tous les métiers</option>
          {Object.entries(JOB_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E6E6E4] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-5 h-5 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-[#999]">
            <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            <p className="text-sm">Aucun inscrit trouvé</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#E6E6E4] bg-[#FBFBFA]">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={checkedIds.size === entries.length && entries.length > 0}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded border-[#E6E6E4] text-[#7C3AED] accent-[#7C3AED] cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3 text-[11px] font-semibold text-[#666] uppercase tracking-wide">Inscrit</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-[#666] uppercase tracking-wide">Métier</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-[#666] uppercase tracking-wide">Statut</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-[#666] uppercase tracking-wide">Score</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-[#666] uppercase tracking-wide">Source</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-[#666] uppercase tracking-wide">Date</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-[#666] uppercase tracking-wide w-10"></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr
                  key={entry.id}
                  className={`border-b border-[#F0F0EE] hover:bg-[#FBFBFA] cursor-pointer transition-colors ${
                    checkedIds.has(entry.id) ? "bg-violet-50/40" : ""
                  }`}
                >
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={checkedIds.has(entry.id)}
                      onChange={() => toggleCheck(entry.id)}
                      className="w-4 h-4 rounded border-[#E6E6E4] text-[#7C3AED] accent-[#7C3AED] cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3" onClick={() => openDrawer(entry)}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center text-[11px] font-bold text-[#7C3AED]">
                        {entry.first_name[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-[#1A1A1A]">{entry.first_name}</p>
                        <p className="text-[11px] text-[#999]">{entry.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-[#666]" onClick={() => openDrawer(entry)}>{JOB_LABELS[entry.job_type] || entry.job_type}</td>
                  <td className="px-4 py-3" onClick={() => openDrawer(entry)}>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium border ${STATUS_COLORS[entry.status] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                      {entry.status}
                    </span>
                  </td>
                  <td className="px-4 py-3" onClick={() => openDrawer(entry)}>
                    <span className={`text-[13px] font-semibold ${entry.score >= 20 ? "text-emerald-600" : entry.score >= 10 ? "text-amber-600" : "text-[#999]"}`}>
                      {entry.score}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-[#666]" onClick={() => openDrawer(entry)}>{entry.source || "-"}</td>
                  <td className="px-4 py-3 text-[12px] text-[#999]" onClick={() => openDrawer(entry)}>{formatDate(entry.created_at)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteEntry(entry.id); }}
                      className="p-1 rounded hover:bg-red-50 text-[#999] hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ═══ DETAIL DRAWER ═══ */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/20" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-md bg-white shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-[#E6E6E4] px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-[15px] font-semibold text-[#1A1A1A]">Détail inscrit</h3>
              <button onClick={() => setSelected(null)} className="p-1 rounded hover:bg-[#F7F7F5] cursor-pointer">
                <svg className="w-5 h-5 text-[#999]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center text-lg font-bold text-[#7C3AED]">
                  {selected.first_name[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-lg font-bold text-[#1A1A1A]">{selected.first_name}</p>
                  <p className="text-[13px] text-[#666]">{selected.email}</p>
                  {selected.twitter && (
                    <p className="text-[12px] text-[#7C3AED] mt-0.5">@{selected.twitter.replace("@", "")}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#666] uppercase tracking-wide mb-2 block">Statut</label>
                <div className="flex flex-wrap gap-1.5">
                  {STATUSES.filter((s) => s.value !== "all").map((s) => (
                    <button
                      key={s.value}
                      onClick={() => updateEntry(selected.id, { status: s.value })}
                      className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-colors cursor-pointer ${
                        selected.status === s.value
                          ? STATUS_COLORS[s.value] || "bg-gray-100 text-gray-700 border-gray-300"
                          : "bg-white border-[#E6E6E4] text-[#666] hover:bg-[#F7F7F5]"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Métier", value: JOB_LABELS[selected.job_type] || selected.job_type },
                  { label: "Score", value: selected.score.toString() },
                  { label: "Source", value: selected.source || "-" },
                  { label: "Inscrit le", value: formatDate(selected.created_at) },
                  { label: "UTM Source", value: selected.utm_source || "-" },
                  { label: "UTM Medium", value: selected.utm_medium || "-" },
                  { label: "UTM Campaign", value: selected.utm_campaign || "-" },
                  { label: "Referrer", value: selected.referrer || "-" },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-[11px] font-medium text-[#999] mb-0.5">{item.label}</p>
                    <p className="text-[13px] text-[#1A1A1A]">{item.value}</p>
                  </div>
                ))}
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#666] uppercase tracking-wide mb-2 block">Tags</label>
                <div className="flex flex-wrap gap-1.5">
                  {selected.tags.map((tag) => (
                    <span key={tag} className="px-2 py-1 rounded-full bg-violet-50 text-violet-700 text-[11px] font-medium border border-violet-200">
                      {tag}
                    </span>
                  ))}
                  {selected.tags.length === 0 && <span className="text-[12px] text-[#999]">Aucun tag</span>}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#666] uppercase tracking-wide mb-2 block">Notes internes</label>
                <textarea
                  value={drawerNotes}
                  onChange={(e) => setDrawerNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-[#F7F7F5] border border-[#E6E6E4] text-[13px] text-[#1A1A1A] outline-none focus:border-[#7C3AED] resize-none"
                  placeholder="Ajouter des notes..."
                />
                <button
                  onClick={saveNotes}
                  disabled={savingNotes}
                  className="mt-2 px-4 py-1.5 rounded-lg bg-[#7C3AED] text-white text-[12px] font-medium hover:bg-[#6D28D9] transition-colors cursor-pointer disabled:opacity-50"
                >
                  {savingNotes ? "..." : "Sauvegarder"}
                </button>
              </div>

              <div className="flex gap-2 pt-2 border-t border-[#E6E6E4]">
                <a
                  href={`mailto:${selected.email}`}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-[#E6E6E4] text-[12px] font-medium text-[#666] hover:bg-[#F7F7F5] transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  Email
                </a>
                <button
                  onClick={() => deleteEntry(selected.id)}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-[12px] font-medium text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ EMAIL SEND MODAL ═══ */}
      {emailModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={() => !emailSending && setEmailModalOpen(false)} />
          <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6E6E4]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center">
                  <svg className="w-4.5 h-4.5 text-[#7C3AED]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-[15px] font-semibold text-[#1A1A1A]">Envoyer un email</h2>
                  <p className="text-[12px] text-[#999]">Campagne email waitlist</p>
                </div>
              </div>
              <button
                onClick={() => !emailSending && setEmailModalOpen(false)}
                disabled={emailSending}
                className="p-1.5 rounded-lg hover:bg-[#F7F7F5] text-[#999] cursor-pointer disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Success state */}
              {emailResult && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-emerald-800">Envoi terminé</p>
                      <p className="text-[12px] text-emerald-600">
                        {emailResult.sent} envoyé{emailResult.sent > 1 ? "s" : ""}
                        {emailResult.failed > 0 && (
                          <span className="text-red-500"> &middot; {emailResult.failed} échoué{emailResult.failed > 1 ? "s" : ""}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  {emailResult.errors.length > 0 && (
                    <div className="mt-2 text-[11px] text-red-500 space-y-0.5">
                      {emailResult.errors.slice(0, 5).map((e, i) => (
                        <p key={i}>{e}</p>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => setEmailModalOpen(false)}
                    className="mt-4 px-4 py-2 rounded-lg bg-emerald-600 text-white text-[13px] font-medium hover:bg-emerald-700 transition-colors cursor-pointer"
                  >
                    Fermer
                  </button>
                </div>
              )}

              {/* Form (hidden after success) */}
              {!emailResult && (
                <>
                  {/* Template select */}
                  <div>
                    <label className="text-[11px] font-semibold text-[#666] uppercase tracking-wide mb-2 block">Template</label>
                    <div className="space-y-2">
                      {MANUAL_TEMPLATES.map((t) => (
                        <button
                          key={t.key}
                          onClick={() => setEmailTemplate(t.key)}
                          className={`w-full text-left px-4 py-3 rounded-xl border transition-all cursor-pointer ${
                            emailTemplate === t.key
                              ? "border-[#7C3AED] bg-violet-50/50 ring-2 ring-violet-500/10"
                              : "border-[#E6E6E4] bg-white hover:bg-[#FBFBFA]"
                          }`}
                        >
                          <p className={`text-[13px] font-semibold ${emailTemplate === t.key ? "text-[#7C3AED]" : "text-[#1A1A1A]"}`}>
                            {t.label}
                          </p>
                          <p className="text-[11px] text-[#999] mt-0.5">{t.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Audience select */}
                  <div>
                    <label className="text-[11px] font-semibold text-[#666] uppercase tracking-wide mb-2 block">Destinataires</label>
                    <div className="flex gap-2">
                      {checkedIds.size > 0 && (
                        <button
                          onClick={() => setEmailAudience("selected")}
                          className={`flex-1 px-3 py-2.5 rounded-xl border text-[12px] font-medium transition-all cursor-pointer ${
                            emailAudience === "selected"
                              ? "border-[#7C3AED] bg-violet-50/50 text-[#7C3AED] ring-2 ring-violet-500/10"
                              : "border-[#E6E6E4] text-[#666] hover:bg-[#FBFBFA]"
                          }`}
                        >
                          Sélection ({checkedIds.size})
                        </button>
                      )}
                      <button
                        onClick={() => setEmailAudience("filtered")}
                        className={`flex-1 px-3 py-2.5 rounded-xl border text-[12px] font-medium transition-all cursor-pointer ${
                          emailAudience === "filtered"
                            ? "border-[#7C3AED] bg-violet-50/50 text-[#7C3AED] ring-2 ring-violet-500/10"
                            : "border-[#E6E6E4] text-[#666] hover:bg-[#FBFBFA]"
                        }`}
                      >
                        Filtre actuel ({entries.length})
                      </button>
                      <button
                        onClick={() => setEmailAudience("all")}
                        className={`flex-1 px-3 py-2.5 rounded-xl border text-[12px] font-medium transition-all cursor-pointer ${
                          emailAudience === "all"
                            ? "border-[#7C3AED] bg-violet-50/50 text-[#7C3AED] ring-2 ring-violet-500/10"
                            : "border-[#E6E6E4] text-[#666] hover:bg-[#FBFBFA]"
                        }`}
                      >
                        Toute la waitlist ({total})
                      </button>
                    </div>
                  </div>

                  {/* Summary bar */}
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#F7F7F5] border border-[#E6E6E4]">
                    <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-[#7C3AED]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-[#1A1A1A]">
                        {recipientCount()} destinataire{recipientCount() > 1 ? "s" : ""}
                      </p>
                      <p className="text-[11px] text-[#999]">
                        Template : {templateLabel}
                      </p>
                    </div>
                  </div>

                  {/* Email preview */}
                  <div>
                    <label className="text-[11px] font-semibold text-[#666] uppercase tracking-wide mb-2 block">Aperçu</label>
                    <div className="rounded-xl border border-[#E6E6E4] overflow-hidden bg-[#f0eff5]">
                      {previewHtml ? (
                        <iframe
                          srcDoc={previewHtml}
                          title="Email preview"
                          className="w-full h-[280px] border-0"
                          sandbox=""
                        />
                      ) : (
                        <div className="flex items-center justify-center h-[280px]">
                          <div className="w-4 h-4 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Error */}
                  {emailError && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200">
                      <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                      </svg>
                      <p className="text-[12px] text-red-600">{emailError}</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal footer */}
            {!emailResult && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-[#E6E6E4] bg-[#FBFBFA]">
                <button
                  onClick={() => setEmailModalOpen(false)}
                  disabled={emailSending}
                  className="px-4 py-2 rounded-lg border border-[#E6E6E4] text-[13px] font-medium text-[#666] hover:bg-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSendEmail}
                  disabled={emailSending || recipientCount() === 0}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#7C3AED] to-[#6366F1] text-white text-[13px] font-semibold shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {emailSending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                      </svg>
                      Envoyer à {recipientCount()} destinataire{recipientCount() > 1 ? "s" : ""}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
