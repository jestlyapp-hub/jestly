"use client";

import { useState, useEffect, useCallback } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  Users,
  UserPlus,
  Zap,
  CreditCard,
  TrendingUp,
  ArrowRight,
  BarChart3,
  Globe,
  Link2,
  FileText,
  Megaphone,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────
interface GrowthData {
  kpis: {
    total_leads: number;
    total_signups: number;
    total_activations: number;
    total_paid: number;
    lead_to_signup_pct: number | null;
    signup_to_paid_pct: number | null;
    lead_to_paid_pct: number | null;
    avg_cpl: number | null;
  };
  top_campaigns: TopCampaign[];
  top_sources: TopSource[];
  top_referrers: TopReferrer[];
  top_landing_pages: TopLandingPage[];
  daily_breakdown: DailyBreakdown[];
  attribution_comparison: AttributionRow[];
}

interface TopCampaign {
  id: string;
  name: string;
  channel: string;
  leads: number;
  signups: number;
  paid: number;
  conversion_pct: number | null;
  cpl: number | null;
}

interface TopSource {
  source_name: string;
  leads_count: number;
}

interface TopReferrer {
  referrer: string;
  leads_count: number;
}

interface TopLandingPage {
  landing_page_id: string;
  name: string;
  leads_count: number;
}

interface DailyBreakdown {
  date: string;
  leads: number;
  signups: number;
  paid: number;
}

interface AttributionRow {
  campaign_id: string;
  name: string;
  first_touch_leads: number;
  last_touch_leads: number;
}

// ── Constants ──────────────────────────────────────────────────────
const DATE_RANGES = [
  { value: "7", label: "7j" },
  { value: "30", label: "30j" },
  { value: "90", label: "90j" },
];

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
  });
}

function formatPct(value: number | null): string {
  if (value == null) return "\u2014";
  return `${value.toFixed(1)}%`;
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`bg-[#F0F0EE] rounded animate-pulse ${className || ""}`} />;
}

// ── Bar helper (for inline bar charts in tables) ──
function InlineBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="flex-1 h-2 bg-[#F0F0EE] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#4F46E5] rounded-full transition-all duration-300"
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
      <span className="text-[12px] text-[#8A8A88] tabular-nums w-8 text-right">
        {value}
      </span>
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────
export default function AdminGrowthPage() {
  const [data, setData] = useState<GrowthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [days, setDays] = useState("30");
  const [filterCampaign, setFilterCampaign] = useState("");
  const [filterChannel, setFilterChannel] = useState("");
  const [filterSource, setFilterSource] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("days", days);
    if (filterCampaign) params.set("campaign", filterCampaign);
    if (filterChannel) params.set("channel", filterChannel);
    if (filterSource) params.set("source", filterSource);

    try {
      const res = await fetch(`/api/admin/growth?${params}`);
      if (!res.ok) {
        setError(true);
        return;
      }
      const json = await res.json();
      setData(json);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [days, filterCampaign, filterChannel, filterSource]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Loading state ──
  if (loading) {
    return (
      <div className="space-y-6">
        <AdminHeader title="Growth & Attribution" description="Chargement..." section="Growth" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-[#E6E6E4] p-5 h-24 animate-pulse">
              <Skeleton className="h-3 w-20 mb-3" />
              <Skeleton className="h-6 w-14" />
            </div>
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-[#E6E6E4] p-5 h-60 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <AdminHeader title="Growth & Attribution" description="Analyse des performances d'acquisition" section="Growth" />
        <div className="bg-white rounded-lg border border-[#E6E6E4] p-8 text-center">
          <p className="text-[14px] text-[#8A8A88]">Erreur de chargement des données.</p>
        </div>
      </div>
    );
  }

  const kpis = data.kpis;
  const maxSourceLeads = Math.max(...(data.top_sources.map((s) => s.leads_count) || [0]), 1);
  const maxReferrerLeads = Math.max(...(data.top_referrers.map((r) => r.leads_count) || [0]), 1);
  const maxDailyLeads = Math.max(...(data.daily_breakdown.map((d) => d.leads) || [0]), 1);

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Growth & Attribution"
        description="Analyse des performances d'acquisition"
        section="Growth"
      />

      {/* ── Date range + Filters ── */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Date range buttons */}
        <div className="flex gap-1">
          {DATE_RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setDays(r.value)}
              className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors cursor-pointer ${
                days === r.value
                  ? "bg-[#4F46E5] text-white"
                  : "bg-white border border-[#E6E6E4] text-[#666] hover:bg-[#F7F7F5]"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Filter: Channel */}
        <select
          value={filterChannel}
          onChange={(e) => setFilterChannel(e.target.value)}
          className="px-3 py-2 rounded-md bg-white border border-[#E6E6E4] text-[12px] text-[#666] outline-none cursor-pointer"
        >
          <option value="">Tous les canaux</option>
          {Object.entries(CHANNEL_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>

        {/* Filter: Source */}
        {data.top_sources.length > 0 && (
          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="px-3 py-2 rounded-md bg-white border border-[#E6E6E4] text-[12px] text-[#666] outline-none cursor-pointer"
          >
            <option value="">Toutes les sources</option>
            {data.top_sources.map((s) => (
              <option key={s.source_name} value={s.source_name}>{s.source_name}</option>
            ))}
          </select>
        )}

        {/* Filter: Campaign */}
        {data.top_campaigns.length > 0 && (
          <select
            value={filterCampaign}
            onChange={(e) => setFilterCampaign(e.target.value)}
            className="px-3 py-2 rounded-md bg-white border border-[#E6E6E4] text-[12px] text-[#666] outline-none cursor-pointer"
          >
            <option value="">Toutes les campagnes</option>
            {data.top_campaigns.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* ── KPI Row 1: Volume ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Leads total", value: kpis.total_leads, icon: Users },
          { label: "Signups attribués", value: kpis.total_signups, icon: UserPlus },
          { label: "Activations", value: kpis.total_activations, icon: Zap },
          { label: "Paid", value: kpis.total_paid, icon: CreditCard },
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

      {/* ── KPI Row 2: Rates ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Lead\u2192Signup", value: formatPct(kpis.lead_to_signup_pct), icon: ArrowRight },
          { label: "Signup\u2192Paid", value: formatPct(kpis.signup_to_paid_pct), icon: ArrowRight },
          { label: "Lead\u2192Paid", value: formatPct(kpis.lead_to_paid_pct), icon: TrendingUp },
          { label: "CPL moyen", value: kpis.avg_cpl != null ? formatEUR(kpis.avg_cpl) : "\u2014", icon: BarChart3 },
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

      {/* ── Top Campaigns ── */}
      <div className="bg-white rounded-lg border border-[#E6E6E4] p-5">
        <div className="flex items-center gap-2 mb-4">
          <Megaphone size={16} strokeWidth={1.5} className="text-[#CCCCCC]" />
          <h3 className="text-[14px] font-semibold text-[#191919]">Top Campagnes</h3>
        </div>
        {data.top_campaigns.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#E6E6E4]">
                  <th className="py-2 pr-4 text-[11px] font-semibold text-[#666] uppercase tracking-wide">Nom</th>
                  <th className="py-2 pr-4 text-[11px] font-semibold text-[#666] uppercase tracking-wide">Canal</th>
                  <th className="py-2 pr-4 text-[11px] font-semibold text-[#666] uppercase tracking-wide text-right">Leads</th>
                  <th className="py-2 pr-4 text-[11px] font-semibold text-[#666] uppercase tracking-wide text-right">Signups</th>
                  <th className="py-2 pr-4 text-[11px] font-semibold text-[#666] uppercase tracking-wide text-right">Paid</th>
                  <th className="py-2 pr-4 text-[11px] font-semibold text-[#666] uppercase tracking-wide text-right">Conversion</th>
                  <th className="py-2 text-[11px] font-semibold text-[#666] uppercase tracking-wide text-right">CPL</th>
                </tr>
              </thead>
              <tbody>
                {data.top_campaigns.map((c) => (
                  <tr key={c.id} className="border-b border-[#EFEFEF] hover:bg-[#FBFBFA]">
                    <td className="py-2.5 pr-4 text-[13px] font-medium text-[#191919]">{c.name}</td>
                    <td className="py-2.5 pr-4">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F7F7F5] text-[#5A5A58] border border-[#EFEFEF]">
                        {CHANNEL_LABELS[c.channel] || c.channel}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-[13px] text-[#191919] text-right tabular-nums">{c.leads}</td>
                    <td className="py-2.5 pr-4 text-[13px] text-[#191919] text-right tabular-nums">{c.signups}</td>
                    <td className="py-2.5 pr-4 text-[13px] text-[#191919] text-right tabular-nums">{c.paid}</td>
                    <td className="py-2.5 pr-4 text-[13px] text-[#5A5A58] text-right tabular-nums">{formatPct(c.conversion_pct)}</td>
                    <td className="py-2.5 text-[13px] text-[#5A5A58] text-right tabular-nums">{c.cpl != null ? formatEUR(c.cpl) : "\u2014"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState message="Aucune campagne avec des données pour cette période." />
        )}
      </div>

      {/* ── Two columns: Sources + Referrers ── */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Top Sources */}
        <div className="bg-white rounded-lg border border-[#E6E6E4] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Globe size={16} strokeWidth={1.5} className="text-[#CCCCCC]" />
            <h3 className="text-[14px] font-semibold text-[#191919]">Top Sources</h3>
          </div>
          {data.top_sources.length > 0 ? (
            <div className="space-y-3">
              {data.top_sources.map((s) => (
                <div key={s.source_name} className="flex items-center gap-3">
                  <span className="text-[13px] text-[#191919] w-28 truncate shrink-0">
                    {s.source_name}
                  </span>
                  <InlineBar value={s.leads_count} max={maxSourceLeads} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="Aucune source enregistrée." />
          )}
        </div>

        {/* Top Referrers */}
        <div className="bg-white rounded-lg border border-[#E6E6E4] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Link2 size={16} strokeWidth={1.5} className="text-[#CCCCCC]" />
            <h3 className="text-[14px] font-semibold text-[#191919]">Top Referrers</h3>
          </div>
          {data.top_referrers.length > 0 ? (
            <div className="space-y-3">
              {data.top_referrers.map((r) => (
                <div key={r.referrer} className="flex items-center gap-3">
                  <span className="text-[13px] text-[#191919] w-36 truncate shrink-0 font-mono text-[12px]">
                    {r.referrer}
                  </span>
                  <InlineBar value={r.leads_count} max={maxReferrerLeads} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="Aucun referrer enregistré." />
          )}
        </div>
      </div>

      {/* ── Top Landing Pages ── */}
      <div className="bg-white rounded-lg border border-[#E6E6E4] p-5">
        <div className="flex items-center gap-2 mb-4">
          <FileText size={16} strokeWidth={1.5} className="text-[#CCCCCC]" />
          <h3 className="text-[14px] font-semibold text-[#191919]">Top Landing Pages</h3>
        </div>
        {data.top_landing_pages.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#E6E6E4]">
                  <th className="py-2 pr-4 text-[11px] font-semibold text-[#666] uppercase tracking-wide">Page</th>
                  <th className="py-2 text-[11px] font-semibold text-[#666] uppercase tracking-wide text-right">Leads</th>
                </tr>
              </thead>
              <tbody>
                {data.top_landing_pages.map((lp) => (
                  <tr key={lp.name} className="border-b border-[#EFEFEF] hover:bg-[#FBFBFA]">
                    <td className="py-2.5 pr-4 text-[13px] text-[#191919] font-mono text-[12px]">{lp.name}</td>
                    <td className="py-2.5 text-[13px] text-[#191919] text-right tabular-nums">{lp.leads_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState message="Aucune landing page enregistrée." />
        )}
      </div>

      {/* ── Daily Breakdown ── */}
      <div className="bg-white rounded-lg border border-[#E6E6E4] p-5">
        <h3 className="text-[14px] font-semibold text-[#191919] mb-4">Breakdown quotidien</h3>
        {data.daily_breakdown.length > 0 ? (
          <div className="space-y-4">
            {/* Simple bar chart visualization */}
            <div className="h-[200px] flex items-end gap-1">
              {data.daily_breakdown.map((d) => {
                const heightPct = maxDailyLeads > 0 ? (d.leads / maxDailyLeads) * 100 : 0;
                return (
                  <div
                    key={d.date}
                    className="flex-1 flex flex-col items-center justify-end group"
                  >
                    <div className="relative w-full">
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                        <div className="bg-white border border-[#E6E6E4] rounded-lg shadow-lg px-3 py-2 text-[11px] whitespace-nowrap">
                          <p className="font-medium text-[#191919]">{formatDate(d.date)}</p>
                          <p className="text-[#5A5A58]">Leads: {d.leads}</p>
                          <p className="text-[#5A5A58]">Signups: {d.signups}</p>
                          <p className="text-[#5A5A58]">Paid: {d.paid}</p>
                        </div>
                      </div>
                      <div
                        className="w-full bg-[#4F46E5] rounded-t opacity-80 hover:opacity-100 transition-opacity min-h-[2px]"
                        style={{ height: `${Math.max(2, heightPct * 1.6)}px` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            {/* X-axis labels (show every Nth) */}
            <div className="flex gap-1">
              {data.daily_breakdown.map((d, i) => {
                const show = i === 0 || i === data.daily_breakdown.length - 1 ||
                  i % Math.max(1, Math.floor(data.daily_breakdown.length / 6)) === 0;
                return (
                  <div key={d.date} className="flex-1 text-center">
                    {show && (
                      <span className="text-[10px] text-[#8A8A88]">{formatDate(d.date)}</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Table breakdown */}
            <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-[#E6E6E4]">
                    <th className="py-2 pr-4 text-[11px] font-semibold text-[#666] uppercase tracking-wide">Date</th>
                    <th className="py-2 pr-4 text-[11px] font-semibold text-[#666] uppercase tracking-wide text-right">Leads</th>
                    <th className="py-2 pr-4 text-[11px] font-semibold text-[#666] uppercase tracking-wide text-right">Signups</th>
                    <th className="py-2 text-[11px] font-semibold text-[#666] uppercase tracking-wide text-right">Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {data.daily_breakdown.map((d) => (
                    <tr key={d.date} className="border-b border-[#EFEFEF] hover:bg-[#FBFBFA]">
                      <td className="py-2 pr-4 text-[13px] text-[#191919]">{formatDate(d.date)}</td>
                      <td className="py-2 pr-4 text-[13px] text-[#191919] text-right tabular-nums">{d.leads}</td>
                      <td className="py-2 pr-4 text-[13px] text-[#191919] text-right tabular-nums">{d.signups}</td>
                      <td className="py-2 text-[13px] text-[#191919] text-right tabular-nums">{d.paid}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <EmptyState message="Aucune donnée quotidienne pour cette période." />
        )}
      </div>

      {/* ── Attribution Comparison ── */}
      <div className="bg-white rounded-lg border border-[#E6E6E4] p-5">
        <h3 className="text-[14px] font-semibold text-[#191919] mb-1">First Touch vs Last Touch</h3>
        <p className="text-[12px] text-[#8A8A88] mb-4">
          Comparaison des modèles d'attribution par campagne
        </p>
        {data.attribution_comparison.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#E6E6E4]">
                  <th className="py-2 pr-4 text-[11px] font-semibold text-[#666] uppercase tracking-wide">Campagne</th>
                  <th className="py-2 pr-4 text-[11px] font-semibold text-[#666] uppercase tracking-wide text-right">First Touch</th>
                  <th className="py-2 pr-4 text-[11px] font-semibold text-[#666] uppercase tracking-wide text-right">Last Touch</th>
                  <th className="py-2 text-[11px] font-semibold text-[#666] uppercase tracking-wide text-right">Diff</th>
                </tr>
              </thead>
              <tbody>
                {data.attribution_comparison.map((row) => {
                  const diff = row.first_touch_leads - row.last_touch_leads;
                  return (
                    <tr key={row.name} className="border-b border-[#EFEFEF] hover:bg-[#FBFBFA]">
                      <td className="py-2.5 pr-4 text-[13px] font-medium text-[#191919]">{row.name}</td>
                      <td className="py-2.5 pr-4 text-[13px] text-[#191919] text-right tabular-nums">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#4F46E5]" />
                          {row.first_touch_leads}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 text-[13px] text-[#191919] text-right tabular-nums">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#6366F1]" />
                          {row.last_touch_leads}
                        </span>
                      </td>
                      <td className="py-2.5 text-[13px] text-right tabular-nums">
                        <span
                          className={`font-medium ${
                            diff > 0 ? "text-emerald-600" : diff < 0 ? "text-red-500" : "text-[#8A8A88]"
                          }`}
                        >
                          {diff > 0 ? "+" : ""}{diff}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState message="Aucune donnée de conversion encore. Les signups seront attribués automatiquement quand des leads créeront des comptes." />
        )}
      </div>
    </div>
  );
}

// ── Empty state helper ─────────────────────────────────────────────
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <BarChart3 size={28} strokeWidth={1.2} className="mb-2 text-[#CCCCCC]" />
      <p className="text-[13px] text-[#8A8A88] max-w-sm">{message}</p>
    </div>
  );
}
