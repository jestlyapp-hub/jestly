"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import {
  type TimeGranularity,
  GRANULARITIES,
  GRANULARITY_LABELS,
  formatPeriodLabel,
  navigatePeriod,
  getCurrentPeriodRef,
  isCurrentPeriod,
} from "@/lib/time-navigation";

interface TimeNavigatorProps {
  granularity: TimeGranularity;
  periodRef: Date;
  onGranularityChange: (g: TimeGranularity) => void;
  onPeriodChange: (ref: Date) => void;
}

export default function TimeNavigator({
  granularity,
  periodRef,
  onGranularityChange,
  onPeriodChange,
}: TimeNavigatorProps) {
  const label = formatPeriodLabel(granularity, periodRef);
  const isCurrent = isCurrentPeriod(granularity, periodRef);

  const handlePrev = useCallback(() => {
    onPeriodChange(navigatePeriod(granularity, periodRef, "prev"));
  }, [granularity, periodRef, onPeriodChange]);

  const handleNext = useCallback(() => {
    onPeriodChange(navigatePeriod(granularity, periodRef, "next"));
  }, [granularity, periodRef, onPeriodChange]);

  const handleToday = useCallback(() => {
    onPeriodChange(getCurrentPeriodRef());
  }, [onPeriodChange]);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      {/* Segmented control — granularité */}
      <div className="flex items-center bg-[#F7F7F5] rounded-lg p-0.5">
        {GRANULARITIES.map((g) => (
          <button
            key={g}
            onClick={() => onGranularityChange(g)}
            className={`relative px-3 py-1.5 text-[12px] font-medium rounded-md transition-all cursor-pointer ${
              granularity === g
                ? "text-[#191919]"
                : "text-[#8A8A88] hover:text-[#5A5A58]"
            }`}
          >
            {granularity === g && (
              <motion.div
                layoutId="time-granularity"
                className="absolute inset-0 bg-white rounded-md shadow-sm border border-[#E6E6E4]"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10">{GRANULARITY_LABELS[g]}</span>
          </button>
        ))}
      </div>

      {/* Navigation — prev / label / next + today */}
      <div className="flex items-center gap-1.5">
        {/* Prev */}
        <button
          onClick={handlePrev}
          title="Période précédente"
          className="p-1.5 rounded-md hover:bg-[#F0F0EE] text-[#8A8A88] hover:text-[#5A5A58] transition-colors cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Period label */}
        <span className="text-[13px] font-semibold text-[#191919] min-w-[180px] text-center select-none whitespace-nowrap">
          {label}
        </span>

        {/* Next */}
        <button
          onClick={handleNext}
          title="Période suivante"
          className="p-1.5 rounded-md hover:bg-[#F0F0EE] text-[#8A8A88] hover:text-[#5A5A58] transition-colors cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 6 15 12 9 18" />
          </svg>
        </button>

        {/* Today button */}
        {!isCurrent && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={handleToday}
            className="ml-1 px-2.5 py-1 text-[11px] font-medium text-[#4F46E5] bg-[#EEF2FF] hover:bg-[#E0E7FF] rounded-md transition-colors cursor-pointer"
          >
            Aujourd&apos;hui
          </motion.button>
        )}
      </div>
    </div>
  );
}
