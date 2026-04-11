"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { useApi } from "@/lib/hooks/use-api";
import type { Subscription } from "@/types/subscription";
import { CATEGORY_CONFIG, STATUS_CONFIG } from "@/types/subscription";
import { computeTotals, monthlyAmount } from "@/lib/subscriptions/helpers";
import SubscriptionCard from "@/components/subscriptions/SubscriptionCard";
import {
  Plus,
  LayoutGrid,
  BarChart3,
  Calendar,
  TrendingUp,
  Search,
  SlidersHorizontal,
} from "lucide-react";

const SubscriptionDrawer = dynamic(() => import("@/components/subscriptions/SubscriptionDrawer"), { ssr: false });
const SubsDashboard = dynamic(() => import("@/components/subscriptions/SubsDashboard"), { ssr: false });
const SubsCalendar = dynamic(() => import("@/components/subscriptions/SubsCalendar"), { ssr: false });
const SubsProjection = dynamic(() => import("@/components/subscriptions/SubsProjection"), { ssr: false });

// ── Tabs ─────────────────────────────────────────────────────────

type TabKey = "grid" | "dashboard" | "timeline" | "projection";

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "grid", label: "Abonnements", icon: LayoutGrid },
  { key: "dashboard", label: "Dashboard", icon: BarChart3 },
  { key: "timeline", label: "Timeline", icon: Calendar },
  { key: "projection", label: "Projection", icon: TrendingUp },
];

// ── Empty state ──────────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-20"
    >
      <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-violet-50 flex items-center justify-center">
        <SlidersHorizontal size={28} className="text-violet-500" strokeWidth={1.5} />
      </div>
      <h2 className="text-[18px] font-bold text-[#191919] mb-2">Cockpit Abonnements</h2>
      <p className="text-[14px] text-[#8A8A88] mb-6 max-w-md mx-auto">
        Suivez vos abonnements, anticipez vos prélèvements et optimisez votre budget.
      </p>
      <motion.button
        onClick={onAdd}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#7C3AED] text-white text-[14px] font-semibold hover:bg-[#6D28D9] transition-colors cursor-pointer shadow-sm"
      >
        <Plus size={18} />
        Ajouter mon premier abonnement
      </motion.button>
    </motion.div>
  );
}

// ── Main Page ────────────────────────────────────────────────────

export default function AbonnementsPage() {
  const { data: subs, loading, mutate } = useApi<Subscription[]>("/api/subscriptions", []);
  const subscriptions = subs ?? [];

  const [tab, setTab] = useState<TabKey>("grid");
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showDrawer, setShowDrawer] = useState(false);
  const [editSub, setEditSub] = useState<Subscription | null>(null);

  const totals = useMemo(() => computeTotals(subscriptions), [subscriptions]);

  const filtered = useMemo(() => {
    let result = subscriptions;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(q) || (s.domain ?? "").toLowerCase().includes(q));
    }
    if (filterCat !== "all") result = result.filter((s) => s.category === filterCat);
    if (filterStatus !== "all") result = result.filter((s) => s.status === filterStatus);
    return result.sort((a, b) => monthlyAmount(b) - monthlyAmount(a));
  }, [subscriptions, search, filterCat, filterStatus]);

  const handleEdit = useCallback((sub: Subscription) => { setEditSub(sub); setShowDrawer(true); }, []);
  const handleAdd = useCallback(() => { setEditSub(null); setShowDrawer(true); }, []);
  const handleSaved = useCallback(() => { mutate(); }, [mutate]);

  if (loading && subscriptions.length === 0) {
    return (
      <div className="max-w-[1200px] mx-auto">
        <div className="h-8 w-48 skeleton-shimmer mb-2" />
        <div className="h-4 w-72 skeleton-shimmer mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-40 skeleton-shimmer rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto pb-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6"
      >
        <div>
          <h1 className="text-[24px] font-bold text-[#191919] tracking-tight">Abonnements</h1>
          <p className="text-[13px] text-[#8A8A88] mt-0.5">
            {totals.activeCount > 0
              ? `${totals.activeCount} actif${totals.activeCount > 1 ? "s" : ""} · ${totals.monthlyTotal.toFixed(0)}€/mois`
              : "Gérez vos abonnements et optimisez votre budget"}
          </p>
        </div>
        <motion.button
          onClick={handleAdd}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#7C3AED] text-white text-[13px] font-semibold hover:bg-[#6D28D9] transition-colors cursor-pointer shadow-sm"
        >
          <Plus size={16} />
          Ajouter
        </motion.button>
      </motion.div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-[#E6E6E4]">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-medium border-b-2 transition-all cursor-pointer -mb-px ${
              tab === t.key ? "border-[#7C3AED] text-[#7C3AED]" : "border-transparent text-[#999] hover:text-[#666]"
            }`}
          >
            <t.icon size={15} strokeWidth={1.8} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {subscriptions.length === 0 && tab === "grid" ? (
        <EmptyState onAdd={handleAdd} />
      ) : (
        <>
          {tab === "grid" && (
            <div>
              <div className="flex items-center gap-3 mb-5 flex-wrap">
                <div className="relative flex-1 max-w-xs">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#BBB]" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher..."
                    className="w-full bg-white border border-[#E6E6E4] rounded-lg pl-9 pr-3 py-2 text-[13px] text-[#191919] placeholder-[#BBB] focus:outline-none focus:border-[#7C3AED]/30 focus:ring-1 focus:ring-[#7C3AED]/20"
                  />
                </div>
                <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="bg-white border border-[#E6E6E4] rounded-lg px-3 py-2 text-[12px] text-[#5A5A58] focus:outline-none">
                  <option value="all">Toutes catégories</option>
                  {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (<option key={key} value={key}>{cfg.icon} {cfg.label}</option>))}
                </select>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-white border border-[#E6E6E4] rounded-lg px-3 py-2 text-[12px] text-[#5A5A58] focus:outline-none">
                  <option value="all">Tous statuts</option>
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (<option key={key} value={key}>{cfg.label}</option>))}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {filtered.map((sub) => (<SubscriptionCard key={sub.id} sub={sub} onClick={() => handleEdit(sub)} />))}
                </AnimatePresence>
              </div>
              {filtered.length === 0 && subscriptions.length > 0 && (
                <p className="text-center text-[14px] text-[#AAA] py-12">Aucun résultat pour ce filtre</p>
              )}
            </div>
          )}
          {tab === "dashboard" && <SubsDashboard subs={subscriptions} />}
          {tab === "timeline" && <SubsCalendar subs={subscriptions} />}
          {tab === "projection" && <SubsProjection subs={subscriptions} />}
        </>
      )}

      <SubscriptionDrawer
        open={showDrawer}
        onClose={() => { setShowDrawer(false); setEditSub(null); }}
        onSaved={handleSaved}
        subscription={editSub}
      />
    </div>
  );
}
