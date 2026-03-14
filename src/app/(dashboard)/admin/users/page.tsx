"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
  ShoppingCart,
  Globe,
  UserCheck,
  ArrowUpDown,
  RefreshCw,
  Activity,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────
type HealthTier = "healthy" | "watch" | "risky" | "critical";

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  business_name: string | null;
  avatar_url: string | null;
  plan: string;
  subdomain: string | null;
  created_at: string;
  updated_at: string | null;
  order_count: number;
  total_revenue: number;
  client_count: number;
  product_count: number;
  site_count: number;
  project_count: number;
  last_order_at: string | null;
  health_score: number | null;
  health_tier: HealthTier | null;
}

// ── Constants ──────────────────────────────────────────────────────
const PLANS = [
  { value: "all", label: "Tous" },
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro" },
];

const HEALTH_TIERS = [
  { value: "all", label: "Tous" },
  { value: "healthy", label: "Healthy" },
  { value: "watch", label: "Watch" },
  { value: "risky", label: "Risky" },
  { value: "critical", label: "Critical" },
];

const SORTS = [
  { value: "created_at", label: "Date d'inscription" },
  { value: "full_name", label: "Nom" },
  { value: "email", label: "Email" },
];

const PAGE_SIZE = 50;

const TIER_BADGE_CLASSES: Record<HealthTier, string> = {
  healthy: "bg-emerald-50 text-emerald-700",
  watch: "bg-amber-50 text-amber-700",
  risky: "bg-orange-50 text-orange-700",
  critical: "bg-red-50 text-red-700",
};

// ── Helpers ────────────────────────────────────────────────────────
function getInitials(name: string | null, email: string): string {
  if (name && name.trim()) {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || "")
      .join("");
  }
  return (email[0] || "?").toUpperCase();
}

function formatEUR(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getScoreColor(score: number): string {
  if (score >= 70) return "text-emerald-600";
  if (score >= 45) return "text-amber-600";
  if (score >= 20) return "text-orange-600";
  return "text-red-600";
}

// ── Component ──────────────────────────────────────────────────────
export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [plan, setPlan] = useState("all");
  const [healthFilter, setHealthFilter] = useState("all");
  const [sort, setSort] = useState("created_at");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);
  const [recalculating, setRecalculating] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (plan !== "all") params.set("plan", plan);
    params.set("sort", sort);
    params.set("order", order);
    params.set("limit", String(PAGE_SIZE));
    params.set("offset", String(page * PAGE_SIZE));

    try {
      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      setUsers(data.data || []);
      setTotal(data.total || 0);
    } catch {
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [search, plan, sort, order, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Reset page on filter change
  useEffect(() => {
    setPage(0);
  }, [search, plan, sort, order]);

  const handleSearchChange = (v: string) => {
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => setSearch(v), 300);
  };

  const toggleOrder = () => {
    setOrder((prev) => (prev === "desc" ? "asc" : "desc"));
  };

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      await fetch("/api/admin/health", { method: "POST" });
      await fetchUsers();
    } catch {
      // silently fail
    } finally {
      setRecalculating(false);
    }
  };

  // Client-side health tier filtering
  const filteredUsers =
    healthFilter === "all"
      ? users
      : users.filter((u) => u.health_tier === healthFilter);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleRowClick = (userId: string) => {
    router.push(`/admin/users/${userId}`);
  };

  // ── Skeleton rows ──
  const SkeletonRows = () => (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <tr key={i} className="border-b border-[#F0F0EE]">
          <td className="px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#F0F0EE] animate-pulse" />
              <div className="space-y-1.5">
                <div className="w-28 h-3.5 bg-[#F0F0EE] rounded animate-pulse" />
                <div className="w-36 h-2.5 bg-[#F0F0EE] rounded animate-pulse" />
              </div>
            </div>
          </td>
          <td className="px-5 py-3.5">
            <div className="w-10 h-5 bg-[#F0F0EE] rounded-full animate-pulse" />
          </td>
          <td className="px-5 py-3.5">
            <div className="w-6 h-3.5 bg-[#F0F0EE] rounded animate-pulse" />
          </td>
          <td className="px-5 py-3.5">
            <div className="w-14 h-3.5 bg-[#F0F0EE] rounded animate-pulse" />
          </td>
          <td className="px-5 py-3.5">
            <div className="w-6 h-3.5 bg-[#F0F0EE] rounded animate-pulse" />
          </td>
          <td className="px-5 py-3.5">
            <div className="w-6 h-3.5 bg-[#F0F0EE] rounded animate-pulse" />
          </td>
          <td className="px-5 py-3.5">
            <div className="w-16 h-3.5 bg-[#F0F0EE] rounded animate-pulse" />
          </td>
          <td className="px-5 py-3.5">
            <div className="w-20 h-3.5 bg-[#F0F0EE] rounded animate-pulse" />
          </td>
        </tr>
      ))}
    </>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <AdminHeader
          title="Utilisateurs"
          description={`${total} utilisateur${total > 1 ? "s" : ""} au total`}
          section="Utilisateurs"
        />
        <button
          onClick={handleRecalculate}
          disabled={recalculating}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-[#E6E6E4] text-[13px] font-medium text-[#5A5A58] hover:bg-[#F7F7F5] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw
            size={14}
            strokeWidth={1.5}
            className={recalculating ? "animate-spin" : ""}
          />
          {recalculating ? "Calcul en cours…" : "Recalculer scores"}
        </button>
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
            placeholder="Rechercher nom, email, entreprise..."
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white border border-[#E6E6E4] text-[13px] text-[#191919] placeholder:text-[#999] outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-500/10"
          />
        </div>

        {/* Plan chips */}
        <div className="flex gap-1.5">
          {PLANS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPlan(p.value)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors cursor-pointer ${
                plan === p.value
                  ? "bg-[#4F46E5] text-white"
                  : "bg-white border border-[#E6E6E4] text-[#666] hover:bg-[#F7F7F5]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Health tier chips */}
        <div className="flex gap-1.5">
          {HEALTH_TIERS.map((t) => (
            <button
              key={t.value}
              onClick={() => setHealthFilter(t.value)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors cursor-pointer ${
                healthFilter === t.value
                  ? "bg-[#4F46E5] text-white"
                  : "bg-white border border-[#E6E6E4] text-[#666] hover:bg-[#F7F7F5]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1.5">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white border border-[#E6E6E4] text-[12px] text-[#666] outline-none cursor-pointer"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <button
            onClick={toggleOrder}
            className="p-2 rounded-lg bg-white border border-[#E6E6E4] text-[#666] hover:bg-[#F7F7F5] transition-colors cursor-pointer"
            title={order === "desc" ? "Tri descendant" : "Tri ascendant"}
          >
            <ArrowUpDown size={14} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-xl border border-[#E6E6E4] overflow-hidden">
        {!loading && filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-[#999]">
            <Users size={32} strokeWidth={1.2} className="mb-3 text-[#CCCCCC]" />
            <p className="text-[14px] font-medium text-[#8A8A88]">
              Aucun utilisateur trouv&eacute;
            </p>
            <p className="text-[12px] text-[#ACACAA] mt-1">
              Essayez de modifier vos filtres
            </p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#E6E6E4] bg-[#FBFBFA]">
                <th className="px-5 py-3 text-[11px] font-semibold text-[#666] uppercase tracking-wide">
                  Utilisateur
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold text-[#666] uppercase tracking-wide">
                  Plan
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold text-[#666] uppercase tracking-wide">
                  <span className="flex items-center gap-1.5">
                    <ShoppingCart size={12} strokeWidth={1.5} />
                    Commandes
                  </span>
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold text-[#666] uppercase tracking-wide">
                  Revenu
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold text-[#666] uppercase tracking-wide">
                  <span className="flex items-center gap-1.5">
                    <UserCheck size={12} strokeWidth={1.5} />
                    Clients
                  </span>
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold text-[#666] uppercase tracking-wide">
                  <span className="flex items-center gap-1.5">
                    <Globe size={12} strokeWidth={1.5} />
                    Sites
                  </span>
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold text-[#666] uppercase tracking-wide">
                  <span className="flex items-center gap-1.5">
                    <Activity size={12} strokeWidth={1.5} />
                    Sant&eacute;
                  </span>
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold text-[#666] uppercase tracking-wide">
                  Inscrit le
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonRows />
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => handleRowClick(user.id)}
                    className="border-b border-[#F0F0EE] hover:bg-[#FBFBFA] cursor-pointer transition-colors"
                  >
                    {/* Avatar + Nom + Email */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#EDE9FE] flex items-center justify-center text-[11px] font-bold text-[#7C3AED] flex-shrink-0">
                            {getInitials(user.full_name, user.email)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-[#191919] truncate">
                            {user.full_name || user.email.split("@")[0]}
                          </p>
                          <p className="text-[11px] text-[#8A8A88] truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Plan badge */}
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                          user.plan === "pro"
                            ? "bg-indigo-50 text-indigo-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {user.plan === "pro" ? "Pro" : "Free"}
                      </span>
                    </td>

                    {/* Orders */}
                    <td className="px-5 py-3.5 text-[13px] text-[#5A5A58] tabular-nums">
                      {user.order_count}
                    </td>

                    {/* Revenue */}
                    <td className="px-5 py-3.5 text-[13px] font-medium text-[#191919] tabular-nums">
                      {user.total_revenue > 0
                        ? formatEUR(user.total_revenue)
                        : "0 \u20AC"}
                    </td>

                    {/* Clients */}
                    <td className="px-5 py-3.5 text-[13px] text-[#5A5A58] tabular-nums">
                      {user.client_count}
                    </td>

                    {/* Sites */}
                    <td className="px-5 py-3.5 text-[13px] text-[#5A5A58] tabular-nums">
                      {user.site_count}
                    </td>

                    {/* Health Score + Tier */}
                    <td className="px-5 py-3.5">
                      {user.health_score != null && user.health_tier ? (
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[13px] font-semibold tabular-nums ${getScoreColor(user.health_score)}`}
                          >
                            {user.health_score}
                          </span>
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${TIER_BADGE_CLASSES[user.health_tier]}`}
                          >
                            {user.health_tier}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[13px] text-[#ACACAA]">
                          &mdash;
                        </span>
                      )}
                    </td>

                    {/* Inscrit le */}
                    <td className="px-5 py-3.5 text-[12px] text-[#8A8A88]">
                      {formatDate(user.created_at)}
                    </td>
                  </tr>
                ))
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
