"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  Megaphone,
  Zap,
  DollarSign,
  Users,
  Facebook,
  Globe,
  Mail,
  Share2,
  Handshake,
  PhoneOutgoing,
  Hash,
  TrendingUp,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────
interface Campaign {
  id: string;
  name: string;
  slug: string;
  status: string;
  channel: string;
  budget_planned: number | null;
  budget_spent: number | null;
  currency: string;
  leads_count: number;
  signups_count: number;
  paid_count: number;
  created_at: string;
}

interface CampaignStats {
  total: number;
  active: number;
  total_budget_spent: number;
  total_leads: number;
}

// ── Constants ──────────────────────────────────────────────────────
const STATUSES = [
  { value: "all", label: "Tous" },
  { value: "draft", label: "Brouillon" },
  { value: "active", label: "Active" },
  { value: "paused", label: "En pause" },
  { value: "archived", label: "Archivée" },
  { value: "completed", label: "Terminée" },
];

const CHANNELS = [
  { value: "all", label: "Tous les canaux" },
  { value: "meta", label: "Meta" },
  { value: "tiktok", label: "TikTok" },
  { value: "google", label: "Google" },
  { value: "email", label: "Email" },
  { value: "seo", label: "SEO" },
  { value: "organic_social", label: "Social organique" },
  { value: "affiliate", label: "Affiliation" },
  { value: "partner", label: "Partenaire" },
  { value: "direct", label: "Direct" },
  { value: "outbound", label: "Outbound" },
  { value: "other", label: "Autre" },
];

const STATUS_BADGE: Record<string, string> = {
  draft: "bg-gray-50 text-gray-600 border-gray-200",
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  paused: "bg-amber-50 text-amber-700 border-amber-200",
  archived: "bg-gray-100 text-gray-400 border-gray-200",
  completed: "bg-blue-50 text-blue-700 border-blue-200",
};

const CHANNEL_ICON: Record<string, React.ReactNode> = {
  meta: <Facebook size={12} strokeWidth={1.5} />,
  tiktok: <Hash size={12} strokeWidth={1.5} />,
  google: <Globe size={12} strokeWidth={1.5} />,
  email: <Mail size={12} strokeWidth={1.5} />,
  seo: <TrendingUp size={12} strokeWidth={1.5} />,
  organic_social: <Share2 size={12} strokeWidth={1.5} />,
  affiliate: <Handshake size={12} strokeWidth={1.5} />,
  partner: <Handshake size={12} strokeWidth={1.5} />,
  direct: <Globe size={12} strokeWidth={1.5} />,
  outbound: <PhoneOutgoing size={12} strokeWidth={1.5} />,
  other: <Hash size={12} strokeWidth={1.5} />,
};

const CHANNEL_LABELS: Record<string, string> = {
  meta: "Meta",
  tiktok: "TikTok",
  google: "Google",
  email: "Email",
  seo: "SEO",
  organic_social: "Social",
  affiliate: "Affiliation",
  partner: "Partenaire",
  direct: "Direct",
  outbound: "Outbound",
  other: "Autre",
};

const PAGE_SIZE = 30;

// ── Helpers ────────────────────────────────────────────────────────
function formatEUR(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

// ── Main Page ──────────────────────────────────────────────────────
export default function AdminCampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<CampaignStats>({
    total: 0,
    active: 0,
    total_budget_spent: 0,
    total_leads: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterChannel, setFilterChannel] = useState("all");
  const [page, setPage] = useState(0);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filterStatus !== "all") params.set("status", filterStatus);
    if (filterChannel !== "all") params.set("channel", filterChannel);
    params.set("limit", String(PAGE_SIZE));
    params.set("offset", String(page * PAGE_SIZE));

    try {
      const res = await fetch(`/api/admin/campaigns?${params}`);
      const json = await res.json();
      setCampaigns(json.data || []);
      setTotal(json.total || 0);
      if (json.stats) setStats(json.stats);
    } catch {
      setCampaigns([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [search, filterStatus, filterChannel, page]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  useEffect(() => {
    setPage(0);
  }, [search, filterStatus, filterChannel]);

  const handleSearchChange = (v: string) => {
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => setSearch(v), 300);
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // ── KPI cards ──
  const kpiCards = [
    { label: "Campagnes", value: stats.total, icon: Megaphone },
    { label: "Actives", value: stats.active, icon: Zap },
    { label: "Budget dépensé", value: formatEUR(stats.total_budget_spent), icon: DollarSign },
    { label: "Total leads", value: stats.total_leads, icon: Users },
  ];

  // ── Skeleton rows ──
  const SkeletonRows = () => (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <tr key={i} className="border-b border-[#F0F0EE]">
          {Array.from({ length: 10 }).map((_, j) => (
            <td key={j} className="px-4 py-3.5">
              <div className="w-16 h-3.5 bg-[#F0F0EE] rounded animate-pulse" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );

  return (
    <div className="space-y-5">
      <AdminHeader
        title="Campagnes"
        description="Gestion des campagnes marketing et acquisition"
        section="Campagnes"
        actions={
          <button
            onClick={() => router.push("/admin/campaigns/create")}
            className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-white bg-[#4F46E5] rounded-md hover:bg-[#4338CA] transition-colors cursor-pointer"
          >
            <Plus size={16} strokeWidth={1.5} />
            Nouvelle campagne
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
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search
            size={16}
            strokeWidth={1.5}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999]"
          />
          <input
            type="text"
            placeholder="Rechercher une campagne..."
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-md bg-white border border-[#E6E6E4] text-[13px] text-[#191919] placeholder:text-[#999] outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-500/10"
          />
        </div>

        {/* Status filter */}
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

        {/* Channel filter */}
        <select
          value={filterChannel}
          onChange={(e) => setFilterChannel(e.target.value)}
          className="px-3 py-2.5 rounded-md bg-white border border-[#E6E6E4] text-[12px] text-[#666] outline-none cursor-pointer"
        >
          {CHANNELS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-lg border border-[#E6E6E4] overflow-hidden">
        {!loading && campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-52 text-[#999]">
            <Megaphone size={32} strokeWidth={1.2} className="mb-3 text-[#CCCCCC]" />
            <p className="text-[14px] font-medium text-[#8A8A88]">
              Aucune campagne créée
            </p>
            <p className="text-[12px] text-[#ACACAA] mt-1 text-center max-w-xs">
              Créez votre première campagne pour commencer le tracking.
            </p>
            <button
              onClick={() => router.push("/admin/campaigns/create")}
              className="mt-4 flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-white bg-[#4F46E5] rounded-md hover:bg-[#4338CA] transition-colors cursor-pointer"
            >
              <Plus size={16} strokeWidth={1.5} />
              Créer une campagne
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[900px]">
              <thead>
                <tr className="border-b border-[#E6E6E4] bg-[#FBFBFA]">
                  <th className="px-4 py-3 text-[11px] font-semibold text-[#666] uppercase tracking-wide">Nom</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-[#666] uppercase tracking-wide">Statut</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-[#666] uppercase tracking-wide">Canal</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-[#666] uppercase tracking-wide text-right">Budget dépensé</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-[#666] uppercase tracking-wide text-right">Leads</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-[#666] uppercase tracking-wide text-right">Signups</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-[#666] uppercase tracking-wide text-right">Paid</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-[#666] uppercase tracking-wide text-right">CPL</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-[#666] uppercase tracking-wide text-right">Conversion</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-[#666] uppercase tracking-wide">Créé le</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <SkeletonRows />
                ) : (
                  campaigns.map((c) => {
                    const cpl =
                      c.leads_count > 0 && c.budget_spent
                        ? c.budget_spent / c.leads_count
                        : null;
                    const conversion =
                      c.leads_count > 0
                        ? c.signups_count / c.leads_count
                        : null;

                    return (
                      <tr
                        key={c.id}
                        onClick={() => router.push(`/admin/campaigns/${c.id}`)}
                        className="border-b border-[#F0F0EE] hover:bg-[#FBFBFA] cursor-pointer transition-colors"
                      >
                        {/* Nom */}
                        <td className="px-4 py-3.5">
                          <div className="min-w-0">
                            <p className="text-[13px] font-semibold text-[#191919] truncate">
                              {c.name}
                            </p>
                            <p className="text-[11px] text-[#8A8A88] truncate">
                              {c.slug}
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
                            {STATUSES.find((s) => s.value === c.status)?.label || c.status}
                          </span>
                        </td>

                        {/* Canal */}
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F7F7F5] text-[#5A5A58] border border-[#EFEFEF]">
                            {CHANNEL_ICON[c.channel] || <Hash size={12} strokeWidth={1.5} />}
                            {CHANNEL_LABELS[c.channel] || c.channel}
                          </span>
                        </td>

                        {/* Budget dépensé */}
                        <td className="px-4 py-3.5 text-right text-[13px] font-medium text-[#191919] tabular-nums">
                          {c.budget_spent != null ? formatEUR(c.budget_spent) : "\u2014"}
                        </td>

                        {/* Leads */}
                        <td className="px-4 py-3.5 text-right text-[13px] text-[#191919] tabular-nums">
                          {c.leads_count}
                        </td>

                        {/* Signups */}
                        <td className="px-4 py-3.5 text-right text-[13px] text-[#191919] tabular-nums">
                          {c.signups_count}
                        </td>

                        {/* Paid */}
                        <td className="px-4 py-3.5 text-right text-[13px] text-[#191919] tabular-nums">
                          {c.paid_count}
                        </td>

                        {/* CPL */}
                        <td className="px-4 py-3.5 text-right text-[13px] text-[#5A5A58] tabular-nums">
                          {cpl != null ? formatEUR(cpl) : "\u2014"}
                        </td>

                        {/* Conversion */}
                        <td className="px-4 py-3.5 text-right text-[13px] text-[#5A5A58] tabular-nums">
                          {conversion != null ? formatPercent(conversion) : "\u2014"}
                        </td>

                        {/* Créé le */}
                        <td className="px-4 py-3.5 text-[12px] text-[#8A8A88] whitespace-nowrap">
                          {formatDate(c.created_at)}
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
    </div>
  );
}
