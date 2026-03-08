"use client";

import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";

interface Stats {
  total: number;
  thisWeek: number;
  thisMonth: number;
  avgScore: number;
  statusCounts: Record<string, number>;
  jobCounts: Record<string, number>;
  sourceCounts: Record<string, number>;
  utmCounts: Record<string, number>;
  dailySignups: { date: string; count: number }[];
}

const JOB_LABELS: Record<string, string> = {
  "freelance-creative": "Créatif",
  "freelance-dev": "Dev / Tech",
  "agency": "Agence",
  "freelance-other": "Autre freelance",
  "curious": "Curieux",
};

const STATUS_LABELS: Record<string, string> = {
  new: "Nouveau",
  contacted: "Contacté",
  qualified: "Qualifié",
  invited: "Invité",
  active: "Actif",
  rejected: "Rejeté",
};

const PIE_COLORS = ["#7C3AED", "#6366F1", "#A78BFA", "#818CF8", "#C4B5FD", "#DDD6FE"];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => {
        if (d.total !== undefined) setStats(d);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return <p className="text-sm text-[#999] p-8">Erreur de chargement des statistiques.</p>;
  }

  const jobData = Object.entries(stats.jobCounts).map(([key, value]) => ({
    name: JOB_LABELS[key] || key,
    value,
  }));

  const statusData = Object.entries(stats.statusCounts).map(([key, value]) => ({
    name: STATUS_LABELS[key] || key,
    value,
  }));

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-[#1A1A1A]">Admin Dashboard</h1>
        <p className="text-sm text-[#666] mt-1">Vue d&apos;ensemble de la waitlist Jestly</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total inscrits", value: stats.total, icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z", color: "#7C3AED" },
          { label: "Cette semaine", value: stats.thisWeek, icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5", color: "#6366F1" },
          { label: "Ce mois", value: stats.thisMonth, icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z", color: "#A78BFA" },
          { label: "Score moyen", value: stats.avgScore, icon: "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z", color: "#8B5CF6" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl border border-[#E6E6E4] p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: kpi.color + "15" }}>
                <svg className="w-5 h-5" style={{ color: kpi.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={kpi.icon} />
                </svg>
              </div>
              <span className="text-[12px] font-medium text-[#666]">{kpi.label}</span>
            </div>
            <p className="text-2xl font-bold text-[#1A1A1A]">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Daily signups area chart */}
        <div className="bg-white rounded-xl border border-[#E6E6E4] p-5">
          <h3 className="text-[14px] font-semibold text-[#1A1A1A] mb-4">Inscriptions (30 derniers jours)</h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.dailySignups}>
                <defs>
                  <linearGradient id="colorSignups" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "#999" }}
                  tickFormatter={(v) => v.slice(5)}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 10, fill: "#999" }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #E6E6E4", fontSize: 12 }}
                  labelFormatter={(v) => `${v}`}
                />
                <Area type="monotone" dataKey="count" stroke="#7C3AED" fill="url(#colorSignups)" strokeWidth={2} name="Inscrits" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Job type pie */}
        <div className="bg-white rounded-xl border border-[#E6E6E4] p-5">
          <h3 className="text-[14px] font-semibold text-[#1A1A1A] mb-4">Par m&eacute;tier</h3>
          <div className="h-[220px] flex items-center">
            <ResponsiveContainer width="50%" height="100%">
              <PieChart>
                <Pie data={jobData} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3}>
                  {jobData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E6E6E4", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {jobData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-[12px] text-[#666]">{d.name}</span>
                  <span className="text-[12px] font-semibold text-[#1A1A1A] ml-auto">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Status bar chart */}
      {statusData.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E6E6E4] p-5">
          <h3 className="text-[14px] font-semibold text-[#1A1A1A] mb-4">Par statut</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#666" }} />
                <YAxis tick={{ fontSize: 11, fill: "#999" }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E6E6E4", fontSize: 12 }} />
                <Bar dataKey="value" fill="#7C3AED" radius={[6, 6, 0, 0]} name="Inscrits" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Quick insights */}
      <div className="bg-white rounded-xl border border-[#E6E6E4] p-5">
        <h3 className="text-[14px] font-semibold text-[#1A1A1A] mb-3">Insights rapides</h3>
        <div className="space-y-2 text-[13px] text-[#666]">
          {stats.total > 0 && (
            <>
              <p>
                Taux d&apos;inscription cette semaine : <span className="font-semibold text-[#1A1A1A]">{stats.thisWeek}</span> nouveau{stats.thisWeek > 1 ? "x" : ""}
                {stats.thisMonth > 0 && ` (${Math.round((stats.thisWeek / stats.thisMonth) * 100)}% du mois)`}
              </p>
              {Object.keys(stats.utmCounts).length > 0 && (
                <p>
                  Top source UTM : <span className="font-semibold text-[#7C3AED]">{Object.entries(stats.utmCounts).sort((a, b) => b[1] - a[1])[0][0]}</span>
                </p>
              )}
              {Object.keys(stats.jobCounts).length > 0 && (
                <p>
                  Profil dominant : <span className="font-semibold text-[#7C3AED]">
                    {JOB_LABELS[Object.entries(stats.jobCounts).sort((a, b) => b[1] - a[1])[0][0]] || Object.entries(stats.jobCounts).sort((a, b) => b[1] - a[1])[0][0]}
                  </span>
                </p>
              )}
            </>
          )}
          {stats.total === 0 && <p>Aucune inscription pour le moment.</p>}
        </div>
      </div>
    </div>
  );
}
