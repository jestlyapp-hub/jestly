"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  Mail,
  Send,
  FileText,
  Users,
  X,
  Eye,
  MousePointerClick,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  ExternalLink,
  MailOpen,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────
interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  preview_text: string | null;
  status: string;
  audience_type: string | null;
  audience_filter: Record<string, unknown> | null;
  campaign_id: string | null;
  sender_name: string | null;
  sender_email: string | null;
  template_key: string | null;
  html_content: string | null;
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  opened_count: number;
  clicked_count: number;
  bounced_count: number;
  scheduled_at: string | null;
  sent_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface Recipient {
  id: string;
  email?: string;
  recipient_email?: string;
  status: string;
  sent_at: string | null;
  delivered_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
}

interface LinkedCampaign {
  id: string;
  name: string;
}

// ── Constants ──────────────────────────────────────────────────────
const STATUSES = [
  { value: "all", label: "Tous" },
  { value: "draft", label: "Brouillon" },
  { value: "scheduled", label: "Planifiée" },
  { value: "sending", label: "En cours" },
  { value: "sent", label: "Envoyée" },
  { value: "cancelled", label: "Annulée" },
  { value: "failed", label: "Échouée" },
];

const STATUS_BADGE: Record<string, string> = {
  draft: "bg-gray-50 text-gray-600 border-gray-200",
  scheduled: "bg-blue-50 text-blue-700 border-blue-200",
  sending: "bg-amber-50 text-amber-700 border-amber-200",
  sent: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-600 border-red-200",
  failed: "bg-red-50 text-red-600 border-red-200",
};

const STATUS_LABEL: Record<string, string> = {
  draft: "Brouillon",
  scheduled: "Planifiée",
  sending: "En cours",
  sent: "Envoyée",
  cancelled: "Annulée",
  failed: "Échouée",
};

const AUDIENCE_LABELS: Record<string, string> = {
  all_leads: "Tous les leads",
  campaign_leads: "Leads campagne",
  waitlist: "Waitlist",
  custom_filter: "Filtre personnalisé",
};

const PAGE_SIZE = 30;

// ── Helpers ────────────────────────────────────────────────────────
function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(d: string): string {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Main Page ──────────────────────────────────────────────────────
export default function AdminEmailCampaignsPage() {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(0);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    subject: "",
    preview_text: "",
    audience_type: "all_leads",
    campaign_id: "",
    notes: "",
  });

  // Detail drawer
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<EmailCampaign | null>(null);
  const [detailRecipients, setDetailRecipients] = useState<Recipient[]>([]);
  const [detailRecipientCount, setDetailRecipientCount] = useState(0);
  const [detailLoading, setDetailLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [showSendConfirm, setShowSendConfirm] = useState(false);

  // Linked campaigns list (for dropdowns)
  const [linkedCampaigns, setLinkedCampaigns] = useState<LinkedCampaign[]>([]);
  const [linkedCampaignsMap, setLinkedCampaignsMap] = useState<Record<string, string>>({});

  // ── Fetch campaigns list ──
  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filterStatus !== "all") params.set("status", filterStatus);
    params.set("limit", String(PAGE_SIZE));
    params.set("offset", String(page * PAGE_SIZE));

    try {
      const res = await fetch(`/api/admin/email-campaigns?${params}`);
      const json = await res.json();
      setCampaigns(json.data || []);
      setTotal(json.total || 0);
    } catch {
      setCampaigns([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [search, filterStatus, page]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  useEffect(() => {
    setPage(0);
  }, [search, filterStatus]);

  // ── Fetch linked campaigns for dropdowns ──
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/campaigns?limit=200");
        const json = await res.json();
        const list = (json.data || []) as LinkedCampaign[];
        setLinkedCampaigns(list);
        const map: Record<string, string> = {};
        list.forEach((c) => { map[c.id] = c.name; });
        setLinkedCampaignsMap(map);
      } catch {
        setLinkedCampaigns([]);
      }
    })();
  }, []);

  // ── Search debounce ──
  const handleSearchChange = (v: string) => {
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => setSearch(v), 300);
  };

  // ── Compute KPIs from loaded data ──
  // Note: KPIs reflect the full dataset when no filter is active
  const kpiTotal = total;
  const kpiSent = campaigns.filter((c) => c.status === "sent").length;
  const kpiDraft = campaigns.filter((c) => c.status === "draft").length;
  const kpiRecipients = campaigns.reduce((sum, c) => sum + (c.total_recipients || 0), 0);

  // ── Create campaign ──
  const handleCreate = async () => {
    if (!createForm.name.trim() || !createForm.subject.trim()) return;
    setCreateLoading(true);
    try {
      const body: Record<string, unknown> = {
        name: createForm.name.trim(),
        subject: createForm.subject.trim(),
        audience_type: createForm.audience_type,
      };
      if (createForm.preview_text.trim()) body.preview_text = createForm.preview_text.trim();
      if (createForm.campaign_id) body.campaign_id = createForm.campaign_id;
      if (createForm.notes.trim()) body.notes = createForm.notes.trim();

      const res = await fetch("/api/admin/email-campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setShowCreate(false);
        setCreateForm({ name: "", subject: "", preview_text: "", audience_type: "all_leads", campaign_id: "", notes: "" });
        fetchCampaigns();
      }
    } finally {
      setCreateLoading(false);
    }
  };

  // ── Detail drawer ──
  const openDetail = async (id: string) => {
    setSelectedId(id);
    setDetailLoading(true);
    setDetail(null);
    setDetailRecipients([]);
    try {
      const res = await fetch(`/api/admin/email-campaigns/${id}`);
      const json = await res.json();
      setDetail(json.data || null);
      setDetailRecipients(json.recipients || []);
      setDetailRecipientCount(json.recipient_count || 0);
    } catch {
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedId(null);
    setDetail(null);
  };

  // ── Send campaign ──
  const handleSend = async () => {
    if (!detail || detail.status !== "draft") return;
    setSendLoading(true);
    try {
      const res = await fetch(`/api/admin/email-campaigns/${detail.id}/send`, { method: "POST" });
      if (res.ok) {
        await openDetail(detail.id);
        fetchCampaigns();
      }
    } finally {
      setSendLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // ── KPI cards config ──
  const kpiCards = [
    { label: "Campagnes email", value: kpiTotal, icon: Mail },
    { label: "Envoyées", value: kpiSent, icon: Send },
    { label: "En brouillon", value: kpiDraft, icon: FileText },
    { label: "Total destinataires", value: kpiRecipients, icon: Users },
  ];

  // ── Skeleton rows ──
  const SkeletonRows = () => (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <tr key={i} className="border-b border-[#F0F0EE]">
          {Array.from({ length: 7 }).map((_, j) => (
            <td key={j} className="px-4 py-3.5">
              <div className="w-16 h-3.5 bg-[#F0F0EE] rounded animate-pulse" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );

  // ── Recipient status badge ──
  const recipientStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: "bg-gray-50 text-gray-500 border-gray-200",
      sent: "bg-blue-50 text-blue-600 border-blue-200",
      delivered: "bg-emerald-50 text-emerald-600 border-emerald-200",
      opened: "bg-indigo-50 text-indigo-600 border-indigo-200",
      clicked: "bg-purple-50 text-purple-600 border-purple-200",
      bounced: "bg-red-50 text-red-600 border-red-200",
      failed: "bg-red-50 text-red-600 border-red-200",
    };
    return map[status] || "bg-gray-50 text-gray-500 border-gray-200";
  };

  return (
    <><div className="space-y-5">
      <AdminHeader
        title="Campagnes email"
        description="Envoi et suivi de vos campagnes email"
        section="Email"
        actions={
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-white bg-[#4F46E5] rounded-md hover:bg-[#4338CA] transition-colors cursor-pointer"
          >
            <Plus size={16} strokeWidth={1.5} />
            Nouvelle campagne email
          </button>
        }
      />

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white rounded-lg border border-[#E6E6E4] px-5 py-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-[#8A8A88] font-medium uppercase tracking-wide">
                {kpi.label}
              </span>
              <kpi.icon size={16} strokeWidth={1.5} className="text-[#CCCCCC]" />
            </div>
            <p className="text-[22px] font-bold text-[#191919] tabular-nums">
              {loading ? "..." : kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Filters bar ── */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search
            size={16}
            strokeWidth={1.5}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999]"
          />
          <input
            type="text"
            placeholder="Rechercher par nom ou objet..."
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-md bg-white border border-[#E6E6E4] text-[13px] text-[#191919] placeholder:text-[#999] outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-500/10"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2.5 rounded-md bg-white border border-[#E6E6E4] text-[12px] text-[#666] outline-none cursor-pointer"
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-lg border border-[#E6E6E4] overflow-hidden">
        {!loading && campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-52 text-[#999]">
            <Mail size={32} strokeWidth={1.2} className="mb-3 text-[#CCCCCC]" />
            <p className="text-[14px] font-medium text-[#8A8A88]">
              Aucune campagne email créée
            </p>
            <p className="text-[12px] text-[#ACACAA] mt-1 text-center max-w-sm">
              Les campagnes email vous permettent de contacter vos leads et de mesurer l&apos;impact.
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="mt-4 flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-white bg-[#4F46E5] rounded-md hover:bg-[#4338CA] transition-colors cursor-pointer"
            >
              <Plus size={16} strokeWidth={1.5} />
              Créer une campagne email
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1000px]">
              <thead>
                <tr className="border-b border-[#E6E6E4] bg-[#FBFBFA]">
                  <th className="px-4 py-3 text-[11px] font-semibold text-[#666] uppercase tracking-wide">Nom</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-[#666] uppercase tracking-wide">Statut</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-[#666] uppercase tracking-wide">Audience</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-[#666] uppercase tracking-wide text-right">Destinataires</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-[#666] uppercase tracking-wide">Stats</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-[#666] uppercase tracking-wide">Campagne liée</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-[#666] uppercase tracking-wide">Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <SkeletonRows />
                ) : (
                  campaigns.map((c) => {
                    const hasSentStats = c.sent_count > 0 || c.opened_count > 0 || c.clicked_count > 0;
                    return (
                      <tr
                        key={c.id}
                        onClick={() => openDetail(c.id)}
                        className="border-b border-[#F0F0EE] hover:bg-[#FBFBFA] cursor-pointer transition-colors"
                      >
                        {/* Nom + subject */}
                        <td className="px-4 py-3.5 max-w-[260px]">
                          <div className="min-w-0">
                            <p className="text-[13px] font-semibold text-[#191919] truncate">
                              {c.name}
                            </p>
                            <p className="text-[11px] text-[#8A8A88] truncate">
                              {c.subject}
                            </p>
                          </div>
                        </td>

                        {/* Statut */}
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                              STATUS_BADGE[c.status] || "bg-gray-50 text-gray-600 border-gray-200"
                            }`}
                          >
                            {STATUS_LABEL[c.status] || c.status}
                          </span>
                        </td>

                        {/* Audience */}
                        <td className="px-4 py-3.5">
                          <span className="text-[12px] text-[#5A5A58]">
                            {c.audience_type ? (AUDIENCE_LABELS[c.audience_type] || c.audience_type) : "\u2014"}
                          </span>
                        </td>

                        {/* Destinataires */}
                        <td className="px-4 py-3.5 text-right text-[13px] text-[#191919] tabular-nums">
                          {c.total_recipients || 0}
                        </td>

                        {/* Stats */}
                        <td className="px-4 py-3.5">
                          {hasSentStats ? (
                            <div className="flex items-center gap-3 text-[11px] tabular-nums">
                              <span className="text-[#5A5A58]" title="Envoyés">
                                <Send size={10} strokeWidth={1.5} className="inline mr-0.5 -mt-px" />
                                {c.sent_count}
                              </span>
                              <span className="text-[#5A5A58]" title="Ouverts">
                                <MailOpen size={10} strokeWidth={1.5} className="inline mr-0.5 -mt-px" />
                                {c.opened_count}
                              </span>
                              <span className="text-[#5A5A58]" title="Cliqués">
                                <MousePointerClick size={10} strokeWidth={1.5} className="inline mr-0.5 -mt-px" />
                                {c.clicked_count}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-[#ACACAA]">\u2014</span>
                          )}
                        </td>

                        {/* Campagne liée */}
                        <td className="px-4 py-3.5 text-[12px] text-[#5A5A58] truncate max-w-[140px]">
                          {c.campaign_id && linkedCampaignsMap[c.campaign_id]
                            ? linkedCampaignsMap[c.campaign_id]
                            : "\u2014"}
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3.5 text-[12px] text-[#8A8A88] whitespace-nowrap">
                          {formatDate(c.sent_at || c.created_at)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
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
              className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-[#E6E6E4] text-[12px] font-medium text-[#666] hover:bg-[#F7F7F5] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} strokeWidth={1.5} />
              Précédent
            </button>
            <span className="px-3 py-1.5 text-[12px] text-[#5A5A58] font-medium">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-[#E6E6E4] text-[12px] font-medium text-[#666] hover:bg-[#F7F7F5] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Suivant
              <ChevronRight size={14} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}

      {/* ── Create Modal ── */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowCreate(false)} />
          <div className="relative bg-white rounded-lg border border-[#E6E6E4] shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6E6E4]">
              <h2 className="text-[15px] font-semibold text-[#191919]">Nouvelle campagne email</h2>
              <button
                onClick={() => setShowCreate(false)}
                className="p-1 rounded-md hover:bg-[#F7F7F5] text-[#8A8A88] transition-colors cursor-pointer"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              {/* Nom */}
              <div>
                <label className="block text-[11px] font-medium text-[#8A8A88] uppercase tracking-wide mb-1.5">
                  Nom <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Ex: Lancement produit Q1"
                  className="w-full px-3 py-2.5 rounded-md bg-[#F7F7F5] border border-[#E6E6E4] text-[13px] text-[#191919] placeholder:text-[#999] outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-500/10"
                />
              </div>

              {/* Objet */}
              <div>
                <label className="block text-[11px] font-medium text-[#8A8A88] uppercase tracking-wide mb-1.5">
                  Objet <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={createForm.subject}
                  onChange={(e) => setCreateForm((f) => ({ ...f, subject: e.target.value }))}
                  placeholder="Sujet de l'email"
                  className="w-full px-3 py-2.5 rounded-md bg-[#F7F7F5] border border-[#E6E6E4] text-[13px] text-[#191919] placeholder:text-[#999] outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-500/10"
                />
              </div>

              {/* Preview text */}
              <div>
                <label className="block text-[11px] font-medium text-[#8A8A88] uppercase tracking-wide mb-1.5">
                  Texte d&apos;aperçu
                </label>
                <input
                  type="text"
                  value={createForm.preview_text}
                  onChange={(e) => setCreateForm((f) => ({ ...f, preview_text: e.target.value }))}
                  placeholder="Texte visible dans l'aperçu email"
                  className="w-full px-3 py-2.5 rounded-md bg-[#F7F7F5] border border-[#E6E6E4] text-[13px] text-[#191919] placeholder:text-[#999] outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-500/10"
                />
              </div>

              {/* Audience type */}
              <div>
                <label className="block text-[11px] font-medium text-[#8A8A88] uppercase tracking-wide mb-1.5">
                  Type d&apos;audience
                </label>
                <select
                  value={createForm.audience_type}
                  onChange={(e) => setCreateForm((f) => ({ ...f, audience_type: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-md bg-[#F7F7F5] border border-[#E6E6E4] text-[13px] text-[#191919] outline-none cursor-pointer focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-500/10"
                >
                  <option value="all_leads">Tous les leads</option>
                  <option value="campaign_leads">Leads d&apos;une campagne</option>
                  <option value="waitlist">Waitlist</option>
                </select>
              </div>

              {/* Campaign select (if campaign_leads) */}
              {createForm.audience_type === "campaign_leads" && (
                <div>
                  <label className="block text-[11px] font-medium text-[#8A8A88] uppercase tracking-wide mb-1.5">
                    Campagne associée
                  </label>
                  <select
                    value={createForm.campaign_id}
                    onChange={(e) => setCreateForm((f) => ({ ...f, campaign_id: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-md bg-[#F7F7F5] border border-[#E6E6E4] text-[13px] text-[#191919] outline-none cursor-pointer focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-500/10"
                  >
                    <option value="">Sélectionner une campagne...</option>
                    {linkedCampaigns.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-medium text-[#8A8A88] uppercase tracking-wide mb-1.5">
                  Notes
                </label>
                <textarea
                  value={createForm.notes}
                  onChange={(e) => setCreateForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={3}
                  placeholder="Notes internes..."
                  className="w-full px-3 py-2.5 rounded-md bg-[#F7F7F5] border border-[#E6E6E4] text-[13px] text-[#191919] placeholder:text-[#999] outline-none resize-none focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-500/10"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E6E6E4]">
              <button
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 text-[13px] font-medium text-[#5A5A58] rounded-md border border-[#E6E6E4] hover:bg-[#F7F7F5] transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleCreate}
                disabled={createLoading || !createForm.name.trim() || !createForm.subject.trim()}
                className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-white bg-[#4F46E5] rounded-md hover:bg-[#4338CA] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createLoading && <Loader2 size={14} className="animate-spin" />}
                Créer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Detail Drawer ── */}
      {selectedId && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/20" onClick={closeDetail} />
          <div className="relative w-full max-w-[480px] bg-white border-l border-[#E6E6E4] shadow-xl overflow-y-auto">
            {detailLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 size={24} className="animate-spin text-[#CCCCCC]" />
              </div>
            ) : detail ? (
              <div className="divide-y divide-[#EFEFEF]">
                {/* Header */}
                <div className="px-6 py-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0 mr-3">
                      <h2 className="text-[15px] font-semibold text-[#191919] truncate">{detail.name}</h2>
                      <p className="text-[13px] text-[#5A5A58] mt-0.5 truncate">{detail.subject}</p>
                      {detail.preview_text && (
                        <p className="text-[12px] text-[#8A8A88] mt-1 line-clamp-2">{detail.preview_text}</p>
                      )}
                    </div>
                    <button
                      onClick={closeDetail}
                      className="p-1 rounded-md hover:bg-[#F7F7F5] text-[#8A8A88] transition-colors cursor-pointer shrink-0"
                    >
                      <X size={18} strokeWidth={1.5} />
                    </button>
                  </div>

                  {/* Status badge */}
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                      STATUS_BADGE[detail.status] || "bg-gray-50 text-gray-600 border-gray-200"
                    }`}
                  >
                    {STATUS_LABEL[detail.status] || detail.status}
                  </span>
                </div>

                {/* Audience / Campaign info */}
                <div className="px-6 py-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-[#8A8A88] uppercase tracking-wide">Audience</span>
                    <span className="text-[13px] text-[#191919]">
                      {detail.audience_type ? (AUDIENCE_LABELS[detail.audience_type] || detail.audience_type) : "\u2014"}
                    </span>
                  </div>
                  {detail.audience_filter && Object.keys(detail.audience_filter).length > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium text-[#8A8A88] uppercase tracking-wide">Filtre</span>
                      <span className="text-[12px] text-[#5A5A58] font-mono">
                        {JSON.stringify(detail.audience_filter)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-[#8A8A88] uppercase tracking-wide">Campagne liée</span>
                    <span className="text-[13px] text-[#191919]">
                      {detail.campaign_id && linkedCampaignsMap[detail.campaign_id]
                        ? linkedCampaignsMap[detail.campaign_id]
                        : "\u2014"}
                    </span>
                  </div>
                </div>

                {/* Stats cards */}
                <div className="px-6 py-4">
                  <p className="text-[11px] font-medium text-[#8A8A88] uppercase tracking-wide mb-3">Statistiques</p>
                  {detail.status === "draft" ? (
                    <p className="text-[12px] text-[#ACACAA] italic">
                      Campagne pas encore envoyée.
                    </p>
                  ) : (
                    <>
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        {[
                          { label: "Envoyés", value: detail.sent_count, icon: Send },
                          { label: "Livrés", value: detail.delivered_count, icon: CheckCircle2 },
                          { label: "Ouverts", value: detail.opened_count, icon: Eye },
                          { label: "Cliqués", value: detail.clicked_count, icon: MousePointerClick },
                          { label: "Bounced", value: detail.bounced_count, icon: AlertTriangle },
                        ].map((s) => (
                          <div key={s.label} className="bg-[#F7F7F5] rounded-md px-3 py-2.5 text-center">
                            <s.icon size={14} strokeWidth={1.5} className="mx-auto text-[#CCCCCC] mb-1" />
                            <p className="text-[15px] font-bold text-[#191919] tabular-nums">{s.value || 0}</p>
                            <p className="text-[10px] text-[#8A8A88] uppercase tracking-wide">{s.label}</p>
                          </div>
                        ))}
                      </div>
                      {detail.sent_count === 0 && detail.opened_count === 0 && detail.clicked_count === 0 && (
                        <p className="text-[11px] text-[#ACACAA] italic">
                          Open/click tracking non instrumenté — les compteurs resteront à 0 tant que le tracking n&apos;est pas en place.
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* Sender info */}
                {(detail.sender_name || detail.sender_email) && (
                  <div className="px-6 py-4 space-y-2">
                    <p className="text-[11px] font-medium text-[#8A8A88] uppercase tracking-wide">Expéditeur</p>
                    <p className="text-[13px] text-[#191919]">
                      {detail.sender_name || "\u2014"} {detail.sender_email && (
                        <span className="text-[#8A8A88]">&lt;{detail.sender_email}&gt;</span>
                      )}
                    </p>
                  </div>
                )}

                {/* HTML content preview */}
                {detail.html_content && (
                  <div className="px-6 py-4">
                    <p className="text-[11px] font-medium text-[#8A8A88] uppercase tracking-wide mb-2">Aperçu du contenu</p>
                    <div
                      className="bg-[#F7F7F5] border border-[#EFEFEF] rounded-md p-3 max-h-[200px] overflow-y-auto text-[12px] text-[#5A5A58]"
                      dangerouslySetInnerHTML={{ __html: detail.html_content }}
                    />
                  </div>
                )}

                {/* Notes */}
                {detail.notes && (
                  <div className="px-6 py-4">
                    <p className="text-[11px] font-medium text-[#8A8A88] uppercase tracking-wide mb-1.5">Notes</p>
                    <p className="text-[13px] text-[#5A5A58] whitespace-pre-wrap">{detail.notes}</p>
                  </div>
                )}

                {/* Dates */}
                <div className="px-6 py-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-[#8A8A88] uppercase tracking-wide">Créée le</span>
                    <span className="text-[12px] text-[#5A5A58]">{formatDateTime(detail.created_at)}</span>
                  </div>
                  {detail.sent_at && (
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium text-[#8A8A88] uppercase tracking-wide">Envoyée le</span>
                      <span className="text-[12px] text-[#5A5A58]">{formatDateTime(detail.sent_at)}</span>
                    </div>
                  )}
                  {detail.scheduled_at && (
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium text-[#8A8A88] uppercase tracking-wide">Planifiée</span>
                      <span className="text-[12px] text-[#5A5A58]">{formatDateTime(detail.scheduled_at)}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {detail.status === "draft" && (
                  <div className="px-6 py-4 flex items-center gap-3">
                    <button
                      onClick={() => setShowSendConfirm(true)}
                      disabled={sendLoading}
                      className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-white bg-[#4F46E5] rounded-md hover:bg-[#4338CA] transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {sendLoading ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Send size={14} strokeWidth={1.5} />
                      )}
                      Envoyer
                    </button>
                  </div>
                )}

                {/* Recipients preview */}
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] font-medium text-[#8A8A88] uppercase tracking-wide">
                      Destinataires ({detailRecipientCount})
                    </p>
                  </div>
                  {detailRecipients.length === 0 ? (
                    <p className="text-[12px] text-[#ACACAA] italic">
                      {detail.status === "draft"
                        ? "Les destinataires seront calculés au moment de l'envoi."
                        : "Aucun destinataire enregistré."}
                    </p>
                  ) : (
                    <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                      {detailRecipients.slice(0, 20).map((r) => (
                        <div
                          key={r.id}
                          className="flex items-center justify-between px-3 py-2 rounded-md bg-[#F7F7F5] border border-[#EFEFEF]"
                        >
                          <span className="text-[12px] text-[#191919] truncate mr-2">
                            {r.recipient_email || r.email || "\u2014"}
                          </span>
                          <span
                            className={`shrink-0 inline-block px-2 py-0.5 rounded-full text-[10px] font-medium border ${recipientStatusBadge(r.status)}`}
                          >
                            {r.status}
                          </span>
                        </div>
                      ))}
                      {detailRecipientCount > 20 && (
                        <p className="text-[11px] text-[#ACACAA] text-center pt-1">
                          ... et {detailRecipientCount - 20} autres
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-[#ACACAA] text-[13px]">
                Campagne introuvable.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    <ConfirmDialog
      open={showSendConfirm}
      title="Envoyer la campagne"
      message="Envoyer cette campagne email ? Cette action est irréversible."
      variant="danger"
      confirmLabel="Envoyer"
      cancelLabel="Annuler"
      onConfirm={() => { setShowSendConfirm(false); handleSend(); }}
      onCancel={() => setShowSendConfirm(false)}
    />
    </>
  );
}
