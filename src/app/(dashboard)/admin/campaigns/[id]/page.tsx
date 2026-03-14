"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import Link from "next/link";
import {
  ArrowLeft,
  Pencil,
  Users,
  UserPlus,
  Zap,
  CreditCard,
  DollarSign,
  TrendingUp,
  BarChart3,
  Target,
  Mail,
  Globe,
  Loader2,
  ChevronRight,
  X,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────
interface CampaignDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  channel: string;
  objective: string | null;
  budget_planned: number | null;
  budget_spent: number | null;
  currency: string;
  start_date: string | null;
  end_date: string | null;
  target_audience: string | null;
  offer_name: string | null;
  hook: string | null;
  main_cta: string | null;
  notes: string | null;
  owner: string | null;
  created_at: string;
  updated_at: string;
  // Computed
  leads_count: number;
  signups_count: number;
  activations_count: number;
  paid_count: number;
  cpl: number | null;
  cpsu: number | null;
  revenue_attributed: number | null;
  roas: number | null;
  // Related
  leads: CampaignLead[];
  landing_pages: LandingPage[];
  email_campaigns: EmailCampaign[];
  daily_stats: DailyStat[];
}

interface CampaignLead {
  id: string;
  name: string | null;
  email: string;
  source: string | null;
  status: string;
  score: number | null;
  created_at: string;
}

interface LandingPage {
  path: string;
  type: string | null;
  leads_count: number;
}

interface EmailCampaign {
  id: string;
  name: string;
  status: string;
  recipients: number;
  sent_at: string | null;
}

interface DailyStat {
  date: string;
  leads: number;
  signups: number;
  paid: number;
  spend: number;
}

// ── Constants ──────────────────────────────────────────────────────
const STATUS_BADGE: Record<string, string> = {
  draft: "bg-gray-50 text-gray-600 border-gray-200",
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  paused: "bg-amber-50 text-amber-700 border-amber-200",
  archived: "bg-gray-100 text-gray-400 border-gray-200",
  completed: "bg-blue-50 text-blue-700 border-blue-200",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon",
  active: "Active",
  paused: "En pause",
  archived: "Archivée",
  completed: "Terminée",
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

const OBJECTIVE_LABELS: Record<string, string> = {
  awareness: "Notoriété",
  leads: "Leads",
  signups: "Inscriptions",
  sales: "Ventes",
  retention: "Rétention",
  other: "Autre",
};

const AVAILABLE_STATUSES = ["draft", "active", "paused", "archived", "completed"];

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

function formatPercent(num: number, den: number): string {
  if (den === 0) return "\u2014";
  return `${((num / den) * 100).toFixed(1)}%`;
}

// ── Skeleton ───────────────────────────────────────────────────────
function Skeleton({ className }: { className?: string }) {
  return <div className={`bg-[#F0F0EE] rounded animate-pulse ${className || ""}`} />;
}

// ── Component ──────────────────────────────────────────────────────
export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const fetchCampaign = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/campaigns/${id}`);
      if (!res.ok) {
        setError(true);
        return;
      }
      const data = await res.json();
      setCampaign(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCampaign();
  }, [fetchCampaign]);

  const handleStatusChange = async (newStatus: string) => {
    if (!campaign) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/campaigns/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setCampaign((prev) => prev ? { ...prev, status: newStatus } : prev);
      }
    } catch {
      // silently fail
    } finally {
      setUpdatingStatus(false);
      setStatusMenuOpen(false);
    }
  };

  // ── Loading state ──
  if (loading) {
    return (
      <div className="space-y-6">
        <AdminHeader title="Chargement..." section="Campagnes" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-[#E6E6E4] p-5 h-24 animate-pulse">
              <Skeleton className="h-3 w-20 mb-3" />
              <Skeleton className="h-6 w-14" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="space-y-6">
        <AdminHeader title="Campagne introuvable" section="Campagnes" />
        <div className="bg-white rounded-lg border border-[#E6E6E4] p-8 text-center">
          <p className="text-[14px] text-[#8A8A88]">
            Cette campagne n'existe pas ou une erreur est survenue.
          </p>
          <Link
            href="/admin/campaigns"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 text-[13px] font-medium text-[#4F46E5] hover:text-[#4338CA] transition-colors"
          >
            <ArrowLeft size={16} strokeWidth={1.5} />
            Retour aux campagnes
          </Link>
        </div>
      </div>
    );
  }

  // ── Funnel computation ──
  const funnelSteps = [
    { label: "Leads", value: campaign.leads_count, icon: Users },
    { label: "Signups", value: campaign.signups_count, icon: UserPlus },
    { label: "Activations", value: campaign.activations_count, icon: Zap },
    { label: "Paid", value: campaign.paid_count, icon: CreditCard },
  ];

  const budgetPct =
    campaign.budget_planned && campaign.budget_planned > 0 && campaign.budget_spent != null
      ? Math.min(100, (campaign.budget_spent / campaign.budget_planned) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminHeader
        title={campaign.name}
        description={
          [
            CHANNEL_LABELS[campaign.channel] || campaign.channel,
            campaign.objective ? OBJECTIVE_LABELS[campaign.objective] || campaign.objective : null,
          ]
            .filter(Boolean)
            .join(" \u00B7 ")
        }
        section="Campagnes"
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/admin/campaigns"
              className="flex items-center gap-2 px-3 py-2 text-[13px] font-medium text-[#666] bg-white border border-[#E6E6E4] rounded-md hover:bg-[#F7F7F5] transition-colors"
            >
              <ArrowLeft size={14} strokeWidth={1.5} />
              Retour
            </Link>
            <button
              onClick={() => setEditOpen(true)}
              className="flex items-center gap-2 px-3 py-2 text-[13px] font-medium text-[#666] bg-white border border-[#E6E6E4] rounded-md hover:bg-[#F7F7F5] transition-colors cursor-pointer"
            >
              <Pencil size={14} strokeWidth={1.5} />
              Modifier
            </button>
          </div>
        }
      />

      {/* ── Top bar: status + dates ── */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Status dropdown */}
        <div className="relative">
          <button
            onClick={() => setStatusMenuOpen(!statusMenuOpen)}
            disabled={updatingStatus}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium border cursor-pointer transition-colors ${
              STATUS_BADGE[campaign.status] || "bg-gray-50 text-gray-600 border-gray-200"
            }`}
          >
            {updatingStatus ? (
              <Loader2 size={12} className="animate-spin" />
            ) : null}
            {STATUS_LABELS[campaign.status] || campaign.status}
            <ChevronRight size={12} className="rotate-90" />
          </button>
          {statusMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setStatusMenuOpen(false)} />
              <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-[#E6E6E4] rounded-lg shadow-lg py-1 min-w-[140px]">
                {AVAILABLE_STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    className={`w-full text-left px-3 py-2 text-[12px] hover:bg-[#F7F7F5] transition-colors cursor-pointer ${
                      campaign.status === s ? "font-semibold text-[#4F46E5]" : "text-[#5A5A58]"
                    }`}
                  >
                    {STATUS_LABELS[s] || s}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Dates */}
        {campaign.start_date && (
          <span className="text-[12px] text-[#8A8A88]">
            Du {formatDate(campaign.start_date)}
            {campaign.end_date && ` au ${formatDate(campaign.end_date)}`}
          </span>
        )}

        {/* Slug */}
        <span className="text-[11px] text-[#8A8A88] font-mono bg-[#F7F7F5] px-2 py-1 rounded border border-[#EFEFEF]">
          {campaign.slug}
        </span>
      </div>

      {/* ── KPI Row 1: Funnel metrics ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {funnelSteps.map((step) => (
          <div
            key={step.label}
            className="bg-white rounded-lg border border-[#E6E6E4] px-5 py-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-[#8A8A88] font-medium uppercase tracking-wide">
                {step.label}
              </span>
              <step.icon size={16} strokeWidth={1.5} className="text-[#CCCCCC]" />
            </div>
            <p className="text-[22px] font-bold text-[#191919] tabular-nums">{step.value}</p>
          </div>
        ))}
      </div>

      {/* ── KPI Row 2: Cost & revenue metrics ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "CPL",
            value: campaign.cpl != null ? formatEUR(campaign.cpl) : "\u2014",
            icon: DollarSign,
          },
          {
            label: "CPSU",
            value: campaign.cpsu != null ? formatEUR(campaign.cpsu) : "\u2014",
            icon: DollarSign,
          },
          {
            label: "Revenue attribué",
            value: campaign.revenue_attributed != null ? formatEUR(campaign.revenue_attributed) : "\u2014",
            icon: TrendingUp,
          },
          {
            label: "ROAS",
            value: campaign.roas != null ? `${campaign.roas.toFixed(2)}x` : "\u2014",
            icon: BarChart3,
          },
        ].map((kpi) => (
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
            <p className="text-[22px] font-bold text-[#191919] tabular-nums">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* ── Budget card ── */}
      {campaign.budget_planned != null && campaign.budget_planned > 0 && (
        <div className="bg-white rounded-lg border border-[#E6E6E4] p-5">
          <h3 className="text-[14px] font-semibold text-[#191919] mb-3">Budget</h3>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] text-[#5A5A58]">
              {formatEUR(campaign.budget_spent || 0)} dépensé sur {formatEUR(campaign.budget_planned)}
            </span>
            <span className="text-[13px] font-medium text-[#191919]">
              {budgetPct.toFixed(0)}%
            </span>
          </div>
          <div className="h-2.5 bg-[#F0F0EE] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${budgetPct}%`,
                backgroundColor: budgetPct > 90 ? "#ef4444" : budgetPct > 70 ? "#f59e0b" : "#4F46E5",
              }}
            />
          </div>
        </div>
      )}

      {/* ── Attribution funnel ── */}
      <div className="bg-white rounded-lg border border-[#E6E6E4] p-5">
        <h3 className="text-[14px] font-semibold text-[#191919] mb-4">Funnel d'attribution</h3>
        <div className="flex items-center justify-between gap-2">
          {funnelSteps.map((step, i) => (
            <div key={step.label} className="flex items-center gap-2 flex-1">
              <div className="flex-1 text-center">
                <div
                  className="mx-auto rounded-lg flex items-center justify-center mb-2"
                  style={{
                    width: 56,
                    height: 56,
                    backgroundColor: i === 0 ? "#EEF2FF" : i === 1 ? "#F0FDF4" : i === 2 ? "#FFF7ED" : "#EFF6FF",
                  }}
                >
                  <step.icon
                    size={22}
                    strokeWidth={1.5}
                    style={{
                      color: i === 0 ? "#4F46E5" : i === 1 ? "#16a34a" : i === 2 ? "#ea580c" : "#2563eb",
                    }}
                  />
                </div>
                <p className="text-[18px] font-bold text-[#191919] tabular-nums">{step.value}</p>
                <p className="text-[11px] text-[#8A8A88] uppercase tracking-wide">{step.label}</p>
              </div>
              {i < funnelSteps.length - 1 && (
                <div className="flex flex-col items-center px-1">
                  <ChevronRight size={16} className="text-[#CCCCCC]" />
                  <span className="text-[11px] text-[#8A8A88] mt-0.5">
                    {formatPercent(funnelSteps[i + 1].value, step.value)}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Daily stats ── */}
      <div className="bg-white rounded-lg border border-[#E6E6E4] p-5">
        <h3 className="text-[14px] font-semibold text-[#191919] mb-4">Stats journalières</h3>
        {campaign.daily_stats && campaign.daily_stats.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#E6E6E4]">
                  <th className="py-2 pr-4 text-[11px] font-semibold text-[#666] uppercase tracking-wide">Date</th>
                  <th className="py-2 pr-4 text-[11px] font-semibold text-[#666] uppercase tracking-wide text-right">Leads</th>
                  <th className="py-2 pr-4 text-[11px] font-semibold text-[#666] uppercase tracking-wide text-right">Signups</th>
                  <th className="py-2 pr-4 text-[11px] font-semibold text-[#666] uppercase tracking-wide text-right">Paid</th>
                  <th className="py-2 text-[11px] font-semibold text-[#666] uppercase tracking-wide text-right">Dépense</th>
                </tr>
              </thead>
              <tbody>
                {campaign.daily_stats.map((ds) => (
                  <tr key={ds.date} className="border-b border-[#EFEFEF] hover:bg-[#FBFBFA]">
                    <td className="py-2 pr-4 text-[13px] text-[#191919]">{formatDate(ds.date)}</td>
                    <td className="py-2 pr-4 text-[13px] text-[#191919] text-right tabular-nums">{ds.leads}</td>
                    <td className="py-2 pr-4 text-[13px] text-[#191919] text-right tabular-nums">{ds.signups}</td>
                    <td className="py-2 pr-4 text-[13px] text-[#191919] text-right tabular-nums">{ds.paid}</td>
                    <td className="py-2 text-[13px] text-[#5A5A58] text-right tabular-nums">{formatEUR(ds.spend)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <BarChart3 size={28} strokeWidth={1.2} className="mb-2 text-[#CCCCCC]" />
            <p className="text-[13px] text-[#8A8A88]">
              Stats journalières disponibles après activation
            </p>
          </div>
        )}
      </div>

      {/* ── Leads table ── */}
      <div className="bg-white rounded-lg border border-[#E6E6E4] p-5">
        <h3 className="text-[14px] font-semibold text-[#191919] mb-4">
          Leads attribués
          {campaign.leads && campaign.leads.length > 0 && (
            <span className="text-[12px] text-[#8A8A88] font-normal ml-2">
              ({campaign.leads.length} derniers)
            </span>
          )}
        </h3>
        {campaign.leads && campaign.leads.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#E6E6E4]">
                  <th className="py-2 pr-4 text-[11px] font-semibold text-[#666] uppercase tracking-wide">Nom</th>
                  <th className="py-2 pr-4 text-[11px] font-semibold text-[#666] uppercase tracking-wide">Email</th>
                  <th className="py-2 pr-4 text-[11px] font-semibold text-[#666] uppercase tracking-wide">Source</th>
                  <th className="py-2 pr-4 text-[11px] font-semibold text-[#666] uppercase tracking-wide">Statut</th>
                  <th className="py-2 pr-4 text-[11px] font-semibold text-[#666] uppercase tracking-wide text-right">Score</th>
                  <th className="py-2 text-[11px] font-semibold text-[#666] uppercase tracking-wide">Date</th>
                </tr>
              </thead>
              <tbody>
                {campaign.leads.map((lead) => (
                  <tr key={lead.id} className="border-b border-[#EFEFEF] hover:bg-[#FBFBFA]">
                    <td className="py-2 pr-4 text-[13px] text-[#191919]">{lead.name || "\u2014"}</td>
                    <td className="py-2 pr-4 text-[13px] text-[#5A5A58] max-w-[180px] truncate">{lead.email}</td>
                    <td className="py-2 pr-4 text-[12px] text-[#8A8A88]">{lead.source || "\u2014"}</td>
                    <td className="py-2 pr-4">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F7F7F5] text-[#5A5A58] border border-[#EFEFEF]">
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-[13px] text-right tabular-nums font-medium text-[#191919]">
                      {lead.score ?? "\u2014"}
                    </td>
                    <td className="py-2 text-[12px] text-[#8A8A88] whitespace-nowrap">{formatDate(lead.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Users size={28} strokeWidth={1.2} className="mb-2 text-[#CCCCCC]" />
            <p className="text-[13px] text-[#8A8A88]">Aucun lead attribué à cette campagne</p>
          </div>
        )}
      </div>

      {/* ── Landing pages table ── */}
      {campaign.landing_pages && campaign.landing_pages.length > 0 && (
        <div className="bg-white rounded-lg border border-[#E6E6E4] p-5">
          <h3 className="text-[14px] font-semibold text-[#191919] mb-4">Landing pages</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#E6E6E4]">
                  <th className="py-2 pr-4 text-[11px] font-semibold text-[#666] uppercase tracking-wide">Page</th>
                  <th className="py-2 pr-4 text-[11px] font-semibold text-[#666] uppercase tracking-wide">Type</th>
                  <th className="py-2 text-[11px] font-semibold text-[#666] uppercase tracking-wide text-right">Leads</th>
                </tr>
              </thead>
              <tbody>
                {campaign.landing_pages.map((lp) => (
                  <tr key={lp.path} className="border-b border-[#EFEFEF] hover:bg-[#FBFBFA]">
                    <td className="py-2 pr-4 text-[13px] text-[#191919] font-mono">{lp.path}</td>
                    <td className="py-2 pr-4 text-[12px] text-[#8A8A88]">{lp.type || "\u2014"}</td>
                    <td className="py-2 text-[13px] text-[#191919] text-right tabular-nums font-medium">{lp.leads_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Email campaigns table ── */}
      {campaign.email_campaigns && campaign.email_campaigns.length > 0 && (
        <div className="bg-white rounded-lg border border-[#E6E6E4] p-5">
          <h3 className="text-[14px] font-semibold text-[#191919] mb-4">Campagnes email liées</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#E6E6E4]">
                  <th className="py-2 pr-4 text-[11px] font-semibold text-[#666] uppercase tracking-wide">Nom</th>
                  <th className="py-2 pr-4 text-[11px] font-semibold text-[#666] uppercase tracking-wide">Statut</th>
                  <th className="py-2 pr-4 text-[11px] font-semibold text-[#666] uppercase tracking-wide text-right">Destinataires</th>
                  <th className="py-2 text-[11px] font-semibold text-[#666] uppercase tracking-wide">Envoyé le</th>
                </tr>
              </thead>
              <tbody>
                {campaign.email_campaigns.map((ec) => (
                  <tr key={ec.id} className="border-b border-[#EFEFEF] hover:bg-[#FBFBFA]">
                    <td className="py-2 pr-4 text-[13px] text-[#191919]">{ec.name}</td>
                    <td className="py-2 pr-4">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F7F7F5] text-[#5A5A58] border border-[#EFEFEF]">
                        {ec.status}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-[13px] text-[#191919] text-right tabular-nums">{ec.recipients}</td>
                    <td className="py-2 text-[12px] text-[#8A8A88]">{ec.sent_at ? formatDate(ec.sent_at) : "\u2014"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Notes ── */}
      {campaign.notes && (
        <div className="bg-white rounded-lg border border-[#E6E6E4] p-5">
          <h3 className="text-[14px] font-semibold text-[#191919] mb-3">Notes</h3>
          <p className="text-[13px] text-[#5A5A58] leading-relaxed whitespace-pre-wrap">
            {campaign.notes}
          </p>
        </div>
      )}

      {/* ── Edit Modal (simplified) ── */}
      {editOpen && (
        <EditCampaignModal
          campaign={campaign}
          onClose={() => setEditOpen(false)}
          onSaved={() => {
            setEditOpen(false);
            fetchCampaign();
          }}
        />
      )}
    </div>
  );
}

// ── Edit Campaign Modal ────────────────────────────────────────────
function EditCampaignModal({
  campaign,
  onClose,
  onSaved,
}: {
  campaign: CampaignDetail;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(campaign.name);
  const [description, setDescription] = useState(campaign.description || "");
  const [budgetPlanned, setBudgetPlanned] = useState(
    campaign.budget_planned != null ? String(campaign.budget_planned) : ""
  );
  const [budgetSpent, setBudgetSpent] = useState(
    campaign.budget_spent != null ? String(campaign.budget_spent) : ""
  );
  const [notes, setNotes] = useState(campaign.notes || "");
  const [owner, setOwner] = useState(campaign.owner || "");
  const [targetAudience, setTargetAudience] = useState(campaign.target_audience || "");
  const [hook, setHook] = useState(campaign.hook || "");
  const [mainCta, setMainCta] = useState(campaign.main_cta || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputCls =
    "w-full px-3 py-2 rounded-md bg-[#F7F7F5] border border-[#E6E6E4] text-[14px] text-[#191919] placeholder:text-[#999] outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-500/10 transition-colors";
  const labelCls = "block text-[13px] font-medium text-[#5A5A58] mb-1.5";

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/campaigns/${campaign.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          budget_planned: budgetPlanned ? parseFloat(budgetPlanned) : null,
          budget_spent: budgetSpent ? parseFloat(budgetSpent) : null,
          notes: notes.trim() || null,
          owner: owner.trim() || null,
          target_audience: targetAudience.trim() || null,
          hook: hook.trim() || null,
          main_cta: mainCta.trim() || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erreur lors de la mise à jour.");
        return;
      }
      onSaved();
    } catch {
      setError("Erreur réseau.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-4 bg-white rounded-lg shadow-xl border border-[#E6E6E4] max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E6E6E4]">
          <h2 className="text-[16px] font-semibold text-[#191919]">Modifier la campagne</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-[#F7F7F5] cursor-pointer transition-colors"
          >
            <X size={18} strokeWidth={1.5} className="text-[#666]" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {error && (
            <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-[13px] text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className={labelCls}>Nom</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={`${inputCls} resize-none`} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Budget prévu</label>
              <input type="number" value={budgetPlanned} onChange={(e) => setBudgetPlanned(e.target.value)} min="0" step="0.01" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Budget dépensé</label>
              <input type="number" value={budgetSpent} onChange={(e) => setBudgetSpent(e.target.value)} min="0" step="0.01" className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Audience cible</label>
            <textarea value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} rows={2} className={`${inputCls} resize-none`} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Hook</label>
              <input type="text" value={hook} onChange={(e) => setHook(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>CTA</label>
              <input type="text" value={mainCta} onChange={(e) => setMainCta(e.target.value)} className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Responsable</label>
            <input type="text" value={owner} onChange={(e) => setOwner(e.target.value)} className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={`${inputCls} resize-none`} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-[#E6E6E4] bg-[#FBFBFA]">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-[13px] font-medium text-[#666] hover:text-[#191919] transition-colors cursor-pointer disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="flex items-center gap-2 px-4 py-2 text-[13px] font-semibold text-white bg-[#4F46E5] rounded-md hover:bg-[#4338CA] transition-colors cursor-pointer disabled:opacity-50"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
