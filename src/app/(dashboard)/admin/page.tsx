"use client";

import { useState, useEffect, useCallback } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import AdminHeader from "@/components/admin/AdminHeader";

// ── Types ────────────────────────────────────────────────────────
interface DashboardData {
  total_users: number;
  total_orders: number;
  total_revenue: number;
  total_products: number;
  total_clients: number;
  total_sites: number;
  total_waitlist: number;
  total_leads: number;
  total_projects: number;
  users_this_week: number;
  orders_this_week: number;
  revenue_this_week: number;
  recent_signups: {
    id: string;
    email: string;
    full_name: string | null;
    plan: string | null;
    created_at: string;
  }[];
  daily_signups_30d: { date: string; count: number }[];
}

interface HealthData {
  total_users: number;
  scored_users: number;
  avg_score: number;
  distribution: {
    healthy: number;
    watch: number;
    risky: number;
    critical: number;
  };
  at_risk: {
    account_id: string;
    score: number;
    tier: string;
    signals: Record<string, unknown>;
    computed_at: string;
    profile?: {
      id: string;
      email: string;
      full_name: string | null;
      plan: string | null;
      created_at: string;
    };
  }[];
}

interface AnalyticsData {
  dau: number;
  wau: number;
  mau: number;
  total_users: number;
  daily_dau: { date: string; count: number }[];
  activation: {
    total: number;
    activated: number;
  };
}

// ── Formatters ───────────────────────────────────────────────────
const fmtEur = (v: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(v);

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });

const fmtChartDate = (d: string) => d.slice(5); // "MM-DD"

// ── Tier badge config ────────────────────────────────────────────
const TIER_STYLES: Record<string, string> = {
  healthy: "bg-emerald-50 text-emerald-700",
  watch: "bg-amber-50 text-amber-700",
  risky: "bg-orange-50 text-orange-700",
  critical: "bg-red-50 text-red-700",
};

const TIER_LABELS: Record<string, string> = {
  healthy: "Sain",
  watch: "Vigilance",
  risky: "Risque",
  critical: "Critique",
};

const TIER_BAR_COLORS: Record<string, string> = {
  healthy: "#10b981",
  watch: "#f59e0b",
  risky: "#f97316",
  critical: "#ef4444",
};

function scoreColor(score: number): string {
  if (score >= 70) return "text-emerald-600";
  if (score >= 45) return "text-amber-600";
  if (score >= 20) return "text-orange-600";
  return "text-red-600";
}

function scoreBgColor(score: number): string {
  if (score >= 70) return "bg-emerald-50 text-emerald-700";
  if (score >= 45) return "bg-amber-50 text-amber-700";
  if (score >= 20) return "bg-orange-50 text-orange-700";
  return "bg-red-50 text-red-700";
}

// ── Skeleton block ───────────────────────────────────────────────
function Skeleton({ className }: { className?: string }) {
  return <div className={`bg-[#F0F0EE] rounded animate-pulse ${className || ""}`} />;
}

// ── Component ────────────────────────────────────────────────────
export default function AdminDashboardV3() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [recalculating, setRecalculating] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/dashboard").then((r) => r.ok ? r.json() : null),
      fetch("/api/admin/health").then((r) => r.ok ? r.json() : null),
      fetch("/api/admin/analytics").then((r) => r.ok ? r.json() : null),
    ])
      .then(([d, h, a]) => {
        setDashboard(d);
        setHealth(h);
        setAnalytics(a);
        if (!d) setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const handleRecalculate = useCallback(async () => {
    setRecalculating(true);
    try {
      const res = await fetch("/api/admin/health", { method: "POST" });
      if (res.ok) {
        // Refresh health data
        const fresh = await fetch("/api/admin/health").then((r) => r.ok ? r.json() : null);
        if (fresh) setHealth(fresh);
      }
    } catch {
      // silently fail
    } finally {
      setRecalculating(false);
    }
  }, []);

  // ── Loading skeleton ────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        <AdminHeader title="Dashboard" description="Chargement..." />
        {/* Hero KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-[#E6E6E4] p-5 h-28 animate-pulse">
              <Skeleton className="h-3 w-24 mb-4" />
              <Skeleton className="h-7 w-16" />
            </div>
          ))}
        </div>
        {/* Product Intelligence */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-[#E6E6E4] p-4 h-20 animate-pulse">
              <Skeleton className="h-3 w-16 mb-3" />
              <Skeleton className="h-6 w-12" />
            </div>
          ))}
        </div>
        {/* Health */}
        <div className="bg-white rounded-xl border border-[#E6E6E4] p-5 h-32 animate-pulse">
          <Skeleton className="h-4 w-40 mb-4" />
          <Skeleton className="h-6 w-full" />
        </div>
        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-[#E6E6E4] p-5 h-72 animate-pulse" />
          ))}
        </div>
        {/* Tables */}
        <div className="grid lg:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-[#E6E6E4] p-5 h-60 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="space-y-6">
        <AdminHeader title="Dashboard" description="Vue d'ensemble de Jestly" />
        <p className="text-sm text-[#8A8A88] p-8">Erreur de chargement des statistiques.</p>
      </div>
    );
  }

  const activationRate =
    analytics && analytics.total_users > 0
      ? Math.round((analytics.activation.activated / analytics.total_users) * 100)
      : 0;

  const healthTotal = health
    ? health.distribution.healthy + health.distribution.watch + health.distribution.risky + health.distribution.critical
    : 0;

  const atRiskCount = health
    ? health.distribution.risky + health.distribution.critical
    : 0;

  // ── Render ──────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <AdminHeader
        title="Dashboard"
        description="Vue d'ensemble globale de Jestly"
      />

      {/* ── Section 1: Business KPIs (hero row) ──────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {([
          {
            label: "Utilisateurs",
            value: dashboard.total_users.toLocaleString("fr-FR"),
            change: dashboard.users_this_week,
            changeLabel: "cette semaine",
            color: "#4F46E5",
          },
          {
            label: "Revenu",
            value: fmtEur(dashboard.total_revenue),
            change: dashboard.revenue_this_week,
            changeLabel: "cette semaine",
            isCurrency: true,
            color: "#16a34a",
          },
          {
            label: "Commandes",
            value: dashboard.total_orders.toLocaleString("fr-FR"),
            change: dashboard.orders_this_week,
            changeLabel: "cette semaine",
            color: "#4F46E5",
          },
          {
            label: "Waitlist",
            value: dashboard.total_waitlist.toLocaleString("fr-FR"),
            change: null,
            color: "#8B5CF6",
          },
        ] as const).map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white rounded-xl border border-[#E6E6E4] p-5"
          >
            <p className="text-[12px] font-medium text-[#8A8A88] uppercase tracking-wide mb-1">
              {kpi.label}
            </p>
            <p className="text-[26px] font-bold text-[#191919] tracking-[-0.02em]">
              {kpi.value}
            </p>
            {kpi.change !== null && kpi.change !== undefined && (
              <p className="text-[12px] text-[#5A5A58] mt-1">
                <span className="font-semibold" style={{ color: kpi.color }}>
                  +{"isCurrency" in kpi && kpi.isCurrency ? fmtEur(kpi.change) : kpi.change}
                </span>{" "}
                {kpi.changeLabel}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* ── Section 2: Product Intelligence ──────────────────── */}
      <div>
        <h2 className="text-[14px] font-semibold text-[#191919] mb-3">Intelligence Produit</h2>
        {analytics && (analytics.dau > 0 || analytics.wau > 0 || analytics.mau > 0) ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "DAU", value: analytics.dau, sub: "Aujourd'hui" },
              { label: "WAU", value: analytics.wau, sub: "7 jours" },
              { label: "MAU", value: analytics.mau, sub: "30 jours" },
              { label: "Taux d'activation", value: `${activationRate}%`, sub: `${analytics.activation.activated}/${analytics.total_users}` },
            ].map((m) => (
              <div key={m.label} className="bg-white rounded-xl border border-[#E6E6E4] p-4">
                <p className="text-[11px] font-medium text-[#8A8A88] uppercase tracking-wide mb-1">
                  {m.label}
                </p>
                <p className="text-[22px] font-bold text-[#191919]">{m.value}</p>
                <p className="text-[11px] text-[#8A8A88] mt-0.5">{m.sub}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#E6E6E4] p-6 text-center">
            <p className="text-[13px] text-[#8A8A88]">
              {"\u00C9"}v{"\u00E9"}nements produit en cours de collecte...
            </p>
          </div>
        )}
      </div>

      {/* ── Section 3: Health Overview ────────────────────────── */}
      <div>
        <h2 className="text-[14px] font-semibold text-[#191919] mb-3">Sant{"\u00E9"} des comptes</h2>
        {health && health.scored_users > 0 ? (
          <div className="bg-white rounded-xl border border-[#E6E6E4] p-5 space-y-4">
            {/* Distribution bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[13px] text-[#5A5A58]">
                  Distribution ({health.scored_users} comptes analys{"\u00E9"}s)
                </p>
                <span className={`inline-block px-2.5 py-0.5 text-[12px] font-semibold rounded-md ${scoreBgColor(health.avg_score)}`}>
                  Score moyen : {health.avg_score}
                </span>
              </div>
              <div className="flex h-5 rounded-md overflow-hidden">
                {(["healthy", "watch", "risky", "critical"] as const).map((tier) => {
                  const count = health.distribution[tier];
                  const pct = healthTotal > 0 ? (count / healthTotal) * 100 : 0;
                  if (pct === 0) return null;
                  return (
                    <div
                      key={tier}
                      className="h-full relative group cursor-default"
                      style={{ width: `${pct}%`, backgroundColor: TIER_BAR_COLORS[tier] }}
                      title={`${TIER_LABELS[tier]}: ${count} (${Math.round(pct)}%)`}
                    />
                  );
                })}
              </div>
              <div className="flex gap-4 mt-2">
                {(["healthy", "watch", "risky", "critical"] as const).map((tier) => (
                  <div key={tier} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: TIER_BAR_COLORS[tier] }} />
                    <span className="text-[11px] text-[#5A5A58]">
                      {TIER_LABELS[tier]} ({health.distribution[tier]})
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Alert + recalculate */}
            <div className="flex items-center justify-between">
              <div>
                {atRiskCount > 0 && (
                  <p className="text-[13px] font-medium text-orange-600">
                    {atRiskCount} compte{atRiskCount > 1 ? "s" : ""} {"\u00E0"} risque
                  </p>
                )}
              </div>
              <button
                onClick={handleRecalculate}
                disabled={recalculating}
                className="text-[13px] font-medium text-[#4F46E5] hover:text-[#4338CA] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {recalculating ? "Recalcul en cours..." : "Recalculer les scores"}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#E6E6E4] p-5">
            <div className="flex items-center justify-between">
              <p className="text-[13px] text-[#8A8A88]">Non calcul{"\u00E9"}</p>
              <button
                onClick={handleRecalculate}
                disabled={recalculating}
                className="text-[13px] font-medium text-[#4F46E5] hover:text-[#4338CA] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {recalculating ? "Recalcul en cours..." : "Recalculer les scores"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Section 4: Charts (2 columns) ────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Inscriptions 30j */}
        <div className="bg-white rounded-xl border border-[#E6E6E4] p-5">
          <h3 className="text-[14px] font-semibold text-[#191919] mb-4">
            Inscriptions 30j
          </h3>
          <div className="h-[220px]">
            {dashboard.daily_signups_30d.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dashboard.daily_signups_30d}>
                  <defs>
                    <linearGradient id="gradSignups" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "#8A8A88" }}
                    tickFormatter={fmtChartDate}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 10, fill: "#8A8A88" }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #E6E6E4",
                      fontSize: 12,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    }}
                    labelFormatter={(v) => `${v}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#4F46E5"
                    fill="url(#gradSignups)"
                    strokeWidth={2}
                    name="Inscrits"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-[13px] text-[#8A8A88]">Aucune donn{"\u00E9"}e</p>
              </div>
            )}
          </div>
        </div>

        {/* DAU 7j */}
        <div className="bg-white rounded-xl border border-[#E6E6E4] p-5">
          <h3 className="text-[14px] font-semibold text-[#191919] mb-4">
            DAU 7j
          </h3>
          <div className="h-[220px]">
            {analytics && analytics.daily_dau.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.daily_dau}>
                  <defs>
                    <linearGradient id="gradDau" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "#8A8A88" }}
                    tickFormatter={fmtChartDate}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 10, fill: "#8A8A88" }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #E6E6E4",
                      fontSize: 12,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    }}
                    labelFormatter={(v) => `${v}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#8B5CF6"
                    fill="url(#gradDau)"
                    strokeWidth={2}
                    name="Utilisateurs actifs"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-[13px] text-[#8A8A88]">Aucune donn{"\u00E9"}e</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Section 5: Operational Intelligence (2 columns) ─── */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Comptes a risque */}
        <div className="bg-white rounded-xl border border-[#E6E6E4] p-5">
          <h3 className="text-[14px] font-semibold text-[#191919] mb-4">
            Comptes {"\u00E0"} risque
          </h3>
          <div className="overflow-x-auto">
            {health && health.at_risk.length > 0 ? (
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-[#E6E6E4]">
                    <th className="text-left py-2 pr-3 text-[#8A8A88] font-medium">Nom</th>
                    <th className="text-left py-2 pr-3 text-[#8A8A88] font-medium">Email</th>
                    <th className="text-left py-2 pr-3 text-[#8A8A88] font-medium">Score</th>
                    <th className="text-left py-2 pr-3 text-[#8A8A88] font-medium">Tier</th>
                    <th className="text-left py-2 text-[#8A8A88] font-medium">Signal</th>
                  </tr>
                </thead>
                <tbody>
                  {health.at_risk.map((a) => {
                    const topSignal = a.signals
                      ? Object.keys(a.signals)[0] || "—"
                      : "—";
                    return (
                      <tr key={a.account_id} className="border-b border-[#EFEFEF] hover:bg-[#FBFBFA]">
                        <td className="py-2 pr-3 text-[#191919]">
                          {a.profile?.full_name || "—"}
                        </td>
                        <td className="py-2 pr-3 text-[#5A5A58] max-w-[160px] truncate">
                          {a.profile?.email || "—"}
                        </td>
                        <td className="py-2 pr-3">
                          <span className={`font-semibold ${scoreColor(a.score)}`}>
                            {a.score}
                          </span>
                        </td>
                        <td className="py-2 pr-3">
                          <span className={`inline-block px-2 py-0.5 text-[11px] rounded-md font-medium ${TIER_STYLES[a.tier] || ""}`}>
                            {TIER_LABELS[a.tier] || a.tier}
                          </span>
                        </td>
                        <td className="py-2 text-[#5A5A58] max-w-[120px] truncate">
                          {topSignal}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p className="text-[13px] text-[#8A8A88] py-2">Aucun compte {"\u00E0"} risque</p>
            )}
          </div>
        </div>

        {/* Dernieres inscriptions */}
        <div className="bg-white rounded-xl border border-[#E6E6E4] p-5">
          <h3 className="text-[14px] font-semibold text-[#191919] mb-4">
            Derni{"\u00E8"}res inscriptions
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[#E6E6E4]">
                  <th className="text-left py-2 pr-3 text-[#8A8A88] font-medium">Nom</th>
                  <th className="text-left py-2 pr-3 text-[#8A8A88] font-medium">Email</th>
                  <th className="text-left py-2 pr-3 text-[#8A8A88] font-medium">Plan</th>
                  <th className="text-left py-2 text-[#8A8A88] font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.recent_signups.map((u) => (
                  <tr key={u.id} className="border-b border-[#EFEFEF] hover:bg-[#FBFBFA]">
                    <td className="py-2 pr-3 text-[#191919]">
                      {u.full_name || "—"}
                    </td>
                    <td className="py-2 pr-3 text-[#5A5A58] max-w-[160px] truncate">
                      {u.email}
                    </td>
                    <td className="py-2 pr-3">
                      <span className="inline-block px-2 py-0.5 text-[11px] rounded-md bg-[#F7F7F5] text-[#5A5A58] border border-[#EFEFEF]">
                        {u.plan || "free"}
                      </span>
                    </td>
                    <td className="py-2 text-[#8A8A88] whitespace-nowrap">
                      {fmtDate(u.created_at)}
                    </td>
                  </tr>
                ))}
                {dashboard.recent_signups.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-[#8A8A88]">
                      Aucun inscrit
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
