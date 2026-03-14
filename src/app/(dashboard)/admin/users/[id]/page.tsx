"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ShoppingCart,
  DollarSign,
  Users,
  Package,
  Globe,
  FolderKanban,
  ListTodo,
  UserPlus,
  Pin,
  PinOff,
  Plus,
  X,
  Eye,
  AlertTriangle,
  TrendingDown,
  Star,
  ShieldBan,
  Crown,
  ExternalLink,
  Activity,
  RefreshCw,
  Heart,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────
interface Profile {
  id: string;
  email: string;
  full_name: string;
  business_name: string | null;
  avatar_url: string | null;
  plan: string;
  subdomain: string;
  created_at: string;
  updated_at: string;
  phone: string | null;
  role: string | null;
  locale: string | null;
  timezone: string | null;
}

interface Stats {
  order_count: number;
  total_revenue: number;
  client_count: number;
  product_count: number;
  site_count: number;
  project_count: number;
  task_count: number;
  lead_count: number;
}

interface Order {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  product_name: string | null;
  client_name: string | null;
}

interface Client {
  id: string;
  name: string;
  email: string;
  created_at: string;
  total_revenue: number;
}

interface Product {
  id: string;
  name: string;
  price_cents: number;
  status: string;
  sales_count: number;
  created_at: string;
}

interface Site {
  id: string;
  name: string;
  subdomain: string;
  published: boolean;
  created_at: string;
}

interface Project {
  id: string;
  name: string;
  status: string;
  created_at: string;
}

interface AdminNote {
  id: string;
  content: string;
  tags: string[];
  is_pinned: boolean;
  created_at: string;
}

interface AdminFlag {
  id: string;
  flag_type: string;
  reason: string | null;
  created_at: string;
  resolved_at: string | null;
}

interface HealthSignals {
  last_order_at: string | null;
  orders_30d: number;
  products: number;
  clients: number;
  sites_published: number;
  projects: number;
  profile_complete: boolean;
  account_age_days: number;
  events_7d?: number;
  has_billing?: boolean;
}

interface HealthData {
  score: number;
  tier: string;
  signals: HealthSignals;
  computed_at: string;
}

interface UserDetail {
  profile: Profile;
  stats: Stats;
  recent_orders: Order[];
  recent_clients: Client[];
  products: Product[];
  sites: Site[];
  projects: Project[];
  admin_notes: AdminNote[];
  admin_flags: AdminFlag[];
  health: HealthData | null;
}

// ── Flag config ───────────────────────────────────────────────────
const FLAG_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  watch:         { label: "Surveillance",    color: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-200", icon: <Eye size={12} /> },
  support_issue: { label: "Support",         color: "text-red-700",     bg: "bg-red-50",     border: "border-red-200",   icon: <AlertTriangle size={12} /> },
  churn_risk:    { label: "Risque churn",    color: "text-orange-700",  bg: "bg-orange-50",  border: "border-orange-200",icon: <TrendingDown size={12} /> },
  high_value:    { label: "Haute valeur",    color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200",icon: <Star size={12} /> },
  blocked:       { label: "Bloque",          color: "text-red-900",     bg: "bg-red-100",    border: "border-red-300",   icon: <ShieldBan size={12} /> },
  vip:           { label: "VIP",             color: "text-purple-700",  bg: "bg-purple-50",  border: "border-purple-200",icon: <Crown size={12} /> },
};

const ALL_FLAG_TYPES = Object.keys(FLAG_CONFIG);

// ── Order status badges ───────────────────────────────────────────
const ORDER_STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-50 text-blue-700 border-blue-200",
  in_progress: "bg-amber-50 text-amber-700 border-amber-200",
  delivered: "bg-green-50 text-green-700 border-green-200",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  invoiced: "bg-violet-50 text-violet-700 border-violet-200",
  cancelled: "bg-gray-50 text-gray-500 border-gray-200",
  refunded: "bg-red-50 text-red-700 border-red-200",
};

const ORDER_STATUS_LABELS: Record<string, string> = {
  new: "Nouveau",
  in_progress: "En cours",
  delivered: "Livre",
  paid: "Paye",
  invoiced: "Facture",
  cancelled: "Annule",
  refunded: "Rembourse",
};

const PRODUCT_STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-50 text-gray-600 border-gray-200",
  active: "bg-green-50 text-green-700 border-green-200",
  archived: "bg-amber-50 text-amber-700 border-amber-200",
};

// ── Tier colors ──────────────────────────────────────────────────
const tierColors: Record<string, { bg: string; text: string; border: string }> = {
  healthy:  { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  watch:    { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200" },
  risky:    { bg: "bg-orange-50",  text: "text-orange-700",  border: "border-orange-200" },
  critical: { bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200" },
};

const tierLabels: Record<string, string> = {
  healthy: "Sain",
  watch: "A surveiller",
  risky: "Risque",
  critical: "Critique",
};

function scoreColor(tier: string): string {
  switch (tier) {
    case "healthy": return "text-emerald-600";
    case "watch": return "text-amber-600";
    case "risky": return "text-orange-600";
    case "critical": return "text-red-600";
    default: return "text-gray-600";
  }
}

function formatRelativeDate(dateStr: string | null): string {
  if (!dateStr) return "Jamais";
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";
  if (diffDays < 30) return `Il y a ${diffDays} j`;
  if (diffDays < 365) return `Il y a ${Math.floor(diffDays / 30)} mois`;
  return `Il y a ${Math.floor(diffDays / 365)} an(s)`;
}

// ── Helpers ───────────────────────────────────────────────────────
function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount);
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ── Component ─────────────────────────────────────────────────────
export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Notes state
  const [newNote, setNewNote] = useState("");
  const [noteSubmitting, setNoteSubmitting] = useState(false);

  // Flags state
  const [flagAdding, setFlagAdding] = useState(false);
  const [showFlagMenu, setShowFlagMenu] = useState(false);

  // Health state
  const [healthLoading, setHealthLoading] = useState(false);

  // ── Compute / recalculate health ───────────────────────────────
  const handleComputeHealth = async () => {
    setHealthLoading(true);
    try {
      const res = await fetch(`/api/admin/health?account_id=${id}`, { method: "POST" });
      if (!res.ok) throw new Error();
      // Refresh all data to get updated health
      const res2 = await fetch(`/api/admin/users/${id}`);
      if (!res2.ok) throw new Error();
      const json = await res2.json();
      setData(json);
    } catch {
      // silent
    } finally {
      setHealthLoading(false);
    }
  };

  // ── Fetch data ────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/users/${id}`);
      if (!res.ok) throw new Error("Erreur");
      const json = await res.json();
      setData(json);
    } catch {
      setError("Impossible de charger les donnees utilisateur.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Add note ──────────────────────────────────────────────────
  const handleAddNote = async () => {
    if (!newNote.trim() || noteSubmitting) return;
    setNoteSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newNote.trim() }),
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      setData((prev) =>
        prev ? { ...prev, admin_notes: [json.data, ...prev.admin_notes] } : prev,
      );
      setNewNote("");
    } catch {
      // silent
    } finally {
      setNoteSubmitting(false);
    }
  };

  // ── Toggle pin ────────────────────────────────────────────────
  const handleTogglePin = async (noteId: string, currentPinned: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${id}/notes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note_id: noteId, is_pinned: !currentPinned }),
      });
      if (!res.ok) throw new Error();
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          admin_notes: prev.admin_notes.map((n) =>
            n.id === noteId ? { ...n, is_pinned: !currentPinned } : n,
          ),
        };
      });
    } catch {
      // silent
    }
  };

  // ── Add flag ──────────────────────────────────────────────────
  const handleAddFlag = async (flagType: string) => {
    setFlagAdding(true);
    setShowFlagMenu(false);
    try {
      const res = await fetch(`/api/admin/users/${id}/flags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flag_type: flagType }),
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      setData((prev) =>
        prev ? { ...prev, admin_flags: [...prev.admin_flags, json.data] } : prev,
      );
    } catch {
      // silent
    } finally {
      setFlagAdding(false);
    }
  };

  // ── Remove flag ───────────────────────────────────────────────
  const handleRemoveFlag = async (flagId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${id}/flags?flag_id=${flagId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          admin_flags: prev.admin_flags.filter((f) => f.id !== flagId),
        };
      });
    } catch {
      // silent
    }
  };

  // ── Loading / Error ───────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8">
        <p className="text-sm text-red-600">{error || "Erreur inconnue"}</p>
        <button
          onClick={() => router.push("/admin/users")}
          className="mt-4 text-sm text-[#4F46E5] hover:underline"
        >
          Retour aux utilisateurs
        </button>
      </div>
    );
  }

  const { profile, stats } = data;
  const activeFlags = data.admin_flags.filter((f) => !f.resolved_at);
  const activeFlagTypes = activeFlags.map((f) => f.flag_type);
  const availableFlags = ALL_FLAG_TYPES.filter((t) => !activeFlagTypes.includes(t));

  // Sort notes: pinned first, then by date
  const sortedNotes = [...data.admin_notes].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const statCards: { label: string; value: string | number; icon: React.ReactNode; highlight?: string }[] = [
    { label: "Commandes", value: stats.order_count, icon: <ShoppingCart size={18} /> },
    { label: "Revenu total", value: formatCurrency(stats.total_revenue), icon: <DollarSign size={18} /> },
    { label: "Clients", value: stats.client_count, icon: <Users size={18} /> },
    { label: "Produits", value: stats.product_count, icon: <Package size={18} /> },
    { label: "Sites", value: stats.site_count, icon: <Globe size={18} /> },
    { label: "Projets", value: stats.project_count, icon: <FolderKanban size={18} /> },
    { label: "Taches", value: stats.task_count, icon: <ListTodo size={18} /> },
    { label: "Leads", value: stats.lead_count, icon: <UserPlus size={18} /> },
    ...(data.health
      ? [{
          label: "Score sante",
          value: data.health.score,
          icon: <Activity size={18} />,
          highlight: scoreColor(data.health.tier),
        }]
      : []),
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* ── Back link ── */}
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1.5 text-[13px] text-[#5A5A58] hover:text-[#191919] transition-colors"
      >
        <ArrowLeft size={14} />
        Retour aux utilisateurs
      </Link>

      {/* ══════════════════════════════════════════════════════════
          SECTION 1: Resume
      ══════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-lg border border-[#E6E6E4] p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Avatar + info */}
          <div className="flex items-start gap-4">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name}
                className="w-16 h-16 rounded-full object-cover border border-[#E6E6E4]"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#EEF2FF] border border-[#E6E6E4] flex items-center justify-center text-[#4F46E5] font-bold text-lg">
                {getInitials(profile.full_name)}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-[#191919]">{profile.full_name}</h1>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wide border ${
                    profile.plan === "pro"
                      ? "bg-[#EEF2FF] text-[#4F46E5] border-[#C7D2FE]"
                      : "bg-gray-50 text-gray-600 border-gray-200"
                  }`}
                >
                  {profile.plan}
                </span>
              </div>
              <p className="text-[13px] text-[#5A5A58] mt-0.5">{profile.email}</p>
              {profile.business_name && (
                <p className="text-[13px] text-[#8A8A88] mt-0.5">{profile.business_name}</p>
              )}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[12px] text-[#8A8A88]">
                <span>
                  Sous-domaine :{" "}
                  <a
                    href={`https://${profile.subdomain}.jestly.fr`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#4F46E5] hover:underline"
                  >
                    {profile.subdomain}.jestly.fr
                    <ExternalLink size={10} className="inline ml-0.5" />
                  </a>
                </span>
                <span>Inscrit le : {formatDate(profile.created_at)}</span>
                <span>Derniere activite : {formatDate(profile.updated_at)}</span>
                {profile.phone && <span>Tel : {profile.phone}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          {statCards.map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-3 p-3 rounded-lg border border-[#E6E6E4] bg-[#FBFBFA]"
            >
              <div className="w-8 h-8 rounded-md bg-[#EEF2FF] flex items-center justify-center text-[#4F46E5]">
                {s.icon}
              </div>
              <div>
                <p className={`text-[18px] font-bold leading-tight ${s.highlight || "text-[#191919]"}`}>{s.value}</p>
                <p className="text-[11px] text-[#8A8A88]">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          HEALTH SCORE CARD
      ══════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-lg border border-[#E6E6E4] p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Heart size={16} className="text-[#4F46E5]" />
            <h2 className="text-[15px] font-semibold text-[#191919]">Score de sante</h2>
          </div>
          <button
            onClick={handleComputeHealth}
            disabled={healthLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[#4F46E5] border border-[#4F46E5]/30 rounded-md hover:bg-[#EEF2FF] disabled:opacity-40 transition-colors"
          >
            <RefreshCw size={12} className={healthLoading ? "animate-spin" : ""} />
            {data.health ? "Recalculer" : "Calculer"}
          </button>
        </div>

        {!data.health ? (
          <p className="text-[13px] text-[#8A8A88]">Score non calcule. Cliquez sur &laquo; Calculer &raquo; pour generer le score.</p>
        ) : (
          <>
            {/* Score + Tier badge */}
            <div className="flex items-center gap-4 mb-5">
              <span className={`text-[40px] font-bold leading-none ${scoreColor(data.health.tier)}`}>
                {data.health.score}
              </span>
              <div>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-md text-[12px] font-semibold border ${
                    tierColors[data.health.tier]?.bg || "bg-gray-50"
                  } ${tierColors[data.health.tier]?.text || "text-gray-700"} ${
                    tierColors[data.health.tier]?.border || "border-gray-200"
                  }`}
                >
                  {tierLabels[data.health.tier] || data.health.tier}
                </span>
                <p className="text-[11px] text-[#8A8A88] mt-1">
                  Calcule le {formatDateTime(data.health.computed_at)}
                </p>
              </div>
            </div>

            {/* Signal breakdown grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Derniere commande", value: formatRelativeDate(data.health.signals.last_order_at) },
                { label: "Commandes 30j", value: String(data.health.signals.orders_30d) },
                { label: "Produits", value: String(data.health.signals.products) },
                { label: "Clients", value: String(data.health.signals.clients) },
                { label: "Site publie", value: data.health.signals.sites_published > 0 ? "Oui" : "Non" },
                { label: "Projets", value: String(data.health.signals.projects) },
                { label: "Profil complet", value: data.health.signals.profile_complete ? "Oui" : "Non" },
                { label: "Anciennete", value: `${data.health.signals.account_age_days} jours` },
              ].map((item) => (
                <div
                  key={item.label}
                  className="p-2.5 rounded-md border border-[#EFEFEF] bg-[#FBFBFA]"
                >
                  <p className="text-[11px] text-[#8A8A88] mb-0.5">{item.label}</p>
                  <p className="text-[13px] font-medium text-[#191919]">{item.value}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════
          QUICK DIAGNOSTIC STRIP
      ══════════════════════════════════════════════════════════ */}
      {data.health && (
        <div className="bg-white rounded-lg border border-[#E6E6E4] p-4">
          <p className="text-[12px] font-medium text-[#5A5A58] mb-3">Diagnostic rapide</p>
          <div className="flex flex-wrap gap-4">
            {/* Activite */}
            {(() => {
              const active = (data.health!.signals.orders_30d > 0) || ((data.health!.signals.events_7d ?? 0) > 0);
              return (
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${active ? "bg-emerald-500" : "bg-red-500"}`} />
                  <span className="text-[12px] text-[#5A5A58]">Activite</span>
                  <span className={`text-[11px] font-medium ${active ? "text-emerald-700" : "text-red-700"}`}>
                    {active ? "Active" : "Inactive"}
                  </span>
                </div>
              );
            })()}
            {/* Billing */}
            {(() => {
              const hasBilling = data.health!.signals.has_billing ?? false;
              return (
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${hasBilling ? "bg-emerald-500" : "bg-gray-300"}`} />
                  <span className="text-[12px] text-[#5A5A58]">Billing</span>
                  <span className={`text-[11px] font-medium ${hasBilling ? "text-emerald-700" : "text-gray-500"}`}>
                    {hasBilling ? "Configure" : "Non configure"}
                  </span>
                </div>
              );
            })()}
            {/* Publication */}
            {(() => {
              const published = data.health!.signals.sites_published > 0;
              return (
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${published ? "bg-emerald-500" : "bg-gray-300"}`} />
                  <span className="text-[12px] text-[#5A5A58]">Publication</span>
                  <span className={`text-[11px] font-medium ${published ? "text-emerald-700" : "text-gray-500"}`}>
                    {published ? "Publie" : "Non publie"}
                  </span>
                </div>
              );
            })()}
            {/* Profil */}
            {(() => {
              const complete = data.health!.signals.profile_complete;
              return (
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${complete ? "bg-emerald-500" : "bg-amber-400"}`} />
                  <span className="text-[12px] text-[#5A5A58]">Profil</span>
                  <span className={`text-[11px] font-medium ${complete ? "text-emerald-700" : "text-amber-700"}`}>
                    {complete ? "Complet" : "Incomplet"}
                  </span>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          SECTION 2: Admin Tools (Flags + Notes)
      ══════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-lg border border-[#E6E6E4] p-6 space-y-5">
        <h2 className="text-[15px] font-semibold text-[#191919]">Outils admin</h2>

        {/* Flags */}
        <div>
          <p className="text-[12px] font-medium text-[#5A5A58] mb-2">Drapeaux</p>
          <div className="flex flex-wrap items-center gap-2">
            {activeFlags.map((flag) => {
              const cfg = FLAG_CONFIG[flag.flag_type];
              if (!cfg) return null;
              return (
                <span
                  key={flag.id}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium border ${cfg.bg} ${cfg.color} ${cfg.border}`}
                >
                  {cfg.icon}
                  {cfg.label}
                  <button
                    onClick={() => handleRemoveFlag(flag.id)}
                    className="ml-1 hover:opacity-70 transition-opacity"
                    title="Retirer ce flag"
                  >
                    <X size={12} />
                  </button>
                </span>
              );
            })}

            {activeFlags.length === 0 && (
              <span className="text-[12px] text-[#8A8A88]">Aucun flag actif</span>
            )}

            {/* Add flag button */}
            {availableFlags.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowFlagMenu(!showFlagMenu)}
                  disabled={flagAdding}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[12px] font-medium text-[#5A5A58] border border-dashed border-[#E6E6E4] hover:border-[#4F46E5] hover:text-[#4F46E5] transition-colors"
                >
                  <Plus size={12} />
                  Ajouter
                </button>
                {showFlagMenu && (
                  <div className="absolute top-full left-0 mt-1 bg-white rounded-lg border border-[#E6E6E4] shadow-lg z-10 py-1 min-w-[180px]">
                    {availableFlags.map((ft) => {
                      const cfg = FLAG_CONFIG[ft];
                      return (
                        <button
                          key={ft}
                          onClick={() => handleAddFlag(ft)}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-[#5A5A58] hover:bg-[#F7F7F5] transition-colors text-left"
                        >
                          <span className={cfg.color}>{cfg.icon}</span>
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        <div>
          <p className="text-[12px] font-medium text-[#5A5A58] mb-2">Notes admin</p>

          {/* Add note form */}
          <div className="flex gap-2 mb-3">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Ajouter une note..."
              className="flex-1 min-h-[60px] px-3 py-2 text-[13px] text-[#191919] bg-[#F7F7F5] border border-[#E6E6E4] rounded-md resize-none focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] placeholder:text-[#ACACAA]"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  handleAddNote();
                }
              }}
            />
            <button
              onClick={handleAddNote}
              disabled={noteSubmitting || !newNote.trim()}
              className="self-end px-3 py-2 bg-[#4F46E5] text-white text-[12px] font-medium rounded-md hover:bg-[#4338CA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {noteSubmitting ? "..." : "Ajouter"}
            </button>
          </div>

          {/* Notes list */}
          {sortedNotes.length === 0 ? (
            <p className="text-[12px] text-[#8A8A88]">Aucune note</p>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {sortedNotes.map((note) => (
                <div
                  key={note.id}
                  className={`flex items-start gap-2 p-3 rounded-md border ${
                    note.is_pinned
                      ? "border-[#4F46E5]/20 bg-[#EEF2FF]/30"
                      : "border-[#E6E6E4] bg-white"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-[#191919] whitespace-pre-wrap">{note.content}</p>
                    <p className="text-[11px] text-[#8A8A88] mt-1">{formatDateTime(note.created_at)}</p>
                  </div>
                  <button
                    onClick={() => handleTogglePin(note.id, note.is_pinned)}
                    className={`flex-shrink-0 p-1 rounded transition-colors ${
                      note.is_pinned
                        ? "text-[#4F46E5] hover:text-[#4338CA]"
                        : "text-[#ACACAA] hover:text-[#5A5A58]"
                    }`}
                    title={note.is_pinned ? "Desepingler" : "Epingler"}
                  >
                    {note.is_pinned ? <PinOff size={14} /> : <Pin size={14} />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          SECTION 3: Commandes recentes
      ══════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-lg border border-[#E6E6E4] p-6">
        <h2 className="text-[15px] font-semibold text-[#191919] mb-4">Commandes recentes</h2>
        {data.recent_orders.length === 0 ? (
          <p className="text-[13px] text-[#8A8A88]">Aucune commande</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[#E6E6E4]">
                  <th className="text-left py-2 pr-4 text-[11px] font-medium text-[#8A8A88] uppercase tracking-wide">Montant</th>
                  <th className="text-left py-2 pr-4 text-[11px] font-medium text-[#8A8A88] uppercase tracking-wide">Statut</th>
                  <th className="text-left py-2 pr-4 text-[11px] font-medium text-[#8A8A88] uppercase tracking-wide">Produit</th>
                  <th className="text-left py-2 pr-4 text-[11px] font-medium text-[#8A8A88] uppercase tracking-wide">Client</th>
                  <th className="text-left py-2 text-[11px] font-medium text-[#8A8A88] uppercase tracking-wide">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_orders.map((order) => (
                  <tr key={order.id} className="border-b border-[#EFEFEF] last:border-0 hover:bg-[#FBFBFA]">
                    <td className="py-2.5 pr-4 font-medium text-[#191919]">{formatCurrency(order.amount)}</td>
                    <td className="py-2.5 pr-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium border ${ORDER_STATUS_COLORS[order.status] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                        {ORDER_STATUS_LABELS[order.status] || order.status}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-[#5A5A58]">{order.product_name || "—"}</td>
                    <td className="py-2.5 pr-4 text-[#5A5A58]">{order.client_name || "—"}</td>
                    <td className="py-2.5 text-[#8A8A88]">{formatDate(order.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════
          SECTION 4: Produits
      ══════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-lg border border-[#E6E6E4] p-6">
        <h2 className="text-[15px] font-semibold text-[#191919] mb-4">Produits</h2>
        {data.products.length === 0 ? (
          <p className="text-[13px] text-[#8A8A88]">Aucun produit</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[#E6E6E4]">
                  <th className="text-left py-2 pr-4 text-[11px] font-medium text-[#8A8A88] uppercase tracking-wide">Nom</th>
                  <th className="text-left py-2 pr-4 text-[11px] font-medium text-[#8A8A88] uppercase tracking-wide">Prix</th>
                  <th className="text-left py-2 pr-4 text-[11px] font-medium text-[#8A8A88] uppercase tracking-wide">Statut</th>
                  <th className="text-left py-2 pr-4 text-[11px] font-medium text-[#8A8A88] uppercase tracking-wide">Ventes</th>
                  <th className="text-left py-2 text-[11px] font-medium text-[#8A8A88] uppercase tracking-wide">Cree le</th>
                </tr>
              </thead>
              <tbody>
                {data.products.map((product) => (
                  <tr key={product.id} className="border-b border-[#EFEFEF] last:border-0 hover:bg-[#FBFBFA]">
                    <td className="py-2.5 pr-4 font-medium text-[#191919]">{product.name}</td>
                    <td className="py-2.5 pr-4 text-[#5A5A58]">{formatCurrency(product.price_cents / 100)}</td>
                    <td className="py-2.5 pr-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium border ${PRODUCT_STATUS_COLORS[product.status] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-[#5A5A58]">{product.sales_count}</td>
                    <td className="py-2.5 text-[#8A8A88]">{formatDate(product.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════
          SECTION 5: Sites
      ══════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-lg border border-[#E6E6E4] p-6">
        <h2 className="text-[15px] font-semibold text-[#191919] mb-4">Sites</h2>
        {data.sites.length === 0 ? (
          <p className="text-[13px] text-[#8A8A88]">Aucun site</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.sites.map((site) => (
              <div
                key={site.id}
                className="p-4 rounded-lg border border-[#E6E6E4] bg-[#FBFBFA] hover:border-[#4F46E5]/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-[13px] font-semibold text-[#191919] truncate">{site.name}</h3>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium border ${
                      site.published
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-gray-50 text-gray-500 border-gray-200"
                    }`}
                  >
                    {site.published ? "Publie" : "Brouillon"}
                  </span>
                </div>
                <p className="text-[12px] text-[#8A8A88]">
                  <a
                    href={`https://jestly.fr/s/${site.subdomain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#4F46E5] transition-colors"
                  >
                    {site.subdomain}
                    <ExternalLink size={10} className="inline ml-0.5" />
                  </a>
                </p>
                <p className="text-[11px] text-[#ACACAA] mt-1">{formatDate(site.created_at)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════
          SECTION 6: Clients recents
      ══════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-lg border border-[#E6E6E4] p-6">
        <h2 className="text-[15px] font-semibold text-[#191919] mb-4">Clients recents</h2>
        {data.recent_clients.length === 0 ? (
          <p className="text-[13px] text-[#8A8A88]">Aucun client</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[#E6E6E4]">
                  <th className="text-left py-2 pr-4 text-[11px] font-medium text-[#8A8A88] uppercase tracking-wide">Nom</th>
                  <th className="text-left py-2 pr-4 text-[11px] font-medium text-[#8A8A88] uppercase tracking-wide">Email</th>
                  <th className="text-left py-2 pr-4 text-[11px] font-medium text-[#8A8A88] uppercase tracking-wide">Revenu</th>
                  <th className="text-left py-2 text-[11px] font-medium text-[#8A8A88] uppercase tracking-wide">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_clients.map((client) => (
                  <tr key={client.id} className="border-b border-[#EFEFEF] last:border-0 hover:bg-[#FBFBFA]">
                    <td className="py-2.5 pr-4 font-medium text-[#191919]">{client.name}</td>
                    <td className="py-2.5 pr-4 text-[#5A5A58]">{client.email}</td>
                    <td className="py-2.5 pr-4 text-[#5A5A58]">{formatCurrency(client.total_revenue)}</td>
                    <td className="py-2.5 text-[#8A8A88]">{formatDate(client.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════
          SECTION 7: Projets recents (bonus)
      ══════════════════════════════════════════════════════════ */}
      {data.projects.length > 0 && (
        <div className="bg-white rounded-lg border border-[#E6E6E4] p-6">
          <h2 className="text-[15px] font-semibold text-[#191919] mb-4">Projets recents</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[#E6E6E4]">
                  <th className="text-left py-2 pr-4 text-[11px] font-medium text-[#8A8A88] uppercase tracking-wide">Nom</th>
                  <th className="text-left py-2 pr-4 text-[11px] font-medium text-[#8A8A88] uppercase tracking-wide">Statut</th>
                  <th className="text-left py-2 text-[11px] font-medium text-[#8A8A88] uppercase tracking-wide">Cree le</th>
                </tr>
              </thead>
              <tbody>
                {data.projects.map((project) => (
                  <tr key={project.id} className="border-b border-[#EFEFEF] last:border-0 hover:bg-[#FBFBFA]">
                    <td className="py-2.5 pr-4 font-medium text-[#191919]">{project.name}</td>
                    <td className="py-2.5 pr-4">
                      <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-medium border bg-gray-50 text-gray-600 border-gray-200">
                        {project.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-[#8A8A88]">{formatDate(project.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
