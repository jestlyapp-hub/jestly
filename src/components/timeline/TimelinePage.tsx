"use client";

import { motion } from "framer-motion";
import { Clock, RefreshCw } from "lucide-react";
import { useTimeline } from "@/lib/hooks/use-timeline";
import TimelineList from "./TimelineList";
import TimelineFilters from "./TimelineFilters";
import TimelineSearch from "./TimelineSearch";
import EmptyState from "@/components/ui/EmptyState";

export default function TimelinePage() {
  const {
    grouped,
    filters,
    loading,
    validating,
    error,
    hasMore,
    loadMore,
    updateFilters,
    resetFilters,
    refresh,
  } = useTimeline();

  const totalEvents = grouped.reduce((sum, g) => sum + g.events.length, 0);

  return (
    <div className="min-h-screen">
      {/* ── Header ── */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-[#191919] tracking-[-0.01em]">
              Timeline
            </h1>
            <p className="text-[13px] text-[#8A8A88] mt-0.5">
              Toute l&apos;activité de votre espace au même endroit
            </p>
          </div>
          <button
            type="button"
            onClick={() => refresh()}
            disabled={validating}
            className="flex items-center gap-2 px-3 py-2 text-[12px] font-medium text-[#5A5A58] bg-white border border-[#E6E6E4] rounded-lg hover:bg-[#F7F7F5] transition-all duration-150 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw
              size={14}
              strokeWidth={1.8}
              className={validating ? "animate-spin" : ""}
            />
            Actualiser
          </button>
        </div>
      </div>

      {/* ── Filters + Search ── */}
      <div className="space-y-3 mb-6">
        <TimelineFilters
          activeTypes={filters.types || []}
          onToggleTypes={(types) =>
            updateFilters({ types: types.length > 0 ? types : undefined })
          }
          onReset={resetFilters}
        />
        <TimelineSearch
          value={filters.search || ""}
          onChange={(search) => updateFilters({ search: search || undefined })}
        />
      </div>

      {/* ── Error ── */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-[13px] text-red-700"
        >
          {error}
        </motion.div>
      )}

      {/* ── Timeline ── */}
      {!loading && totalEvents === 0 && !error ? (
        <EmptyState
          icon={<Clock size={40} strokeWidth={1.2} className="text-[#B0B0AE]" />}
          title="Votre activité apparaîtra ici"
          description="Créez une commande, un client ou un projet pour voir votre timeline se remplir automatiquement."
        />
      ) : (
        <TimelineList
          grouped={grouped}
          hasMore={hasMore}
          loading={loading}
          validating={validating}
          onLoadMore={loadMore}
        />
      )}
    </div>
  );
}
