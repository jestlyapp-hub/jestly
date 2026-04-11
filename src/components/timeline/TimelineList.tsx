"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import TimelineItem from "./TimelineItem";
import type { GroupedTimelineEvents } from "@/lib/hooks/use-timeline";

interface TimelineListProps {
  grouped: GroupedTimelineEvents[];
  hasMore: boolean;
  loading: boolean;
  validating: boolean;
  onLoadMore: () => void;
}

export default function TimelineList({
  grouped,
  hasMore,
  loading,
  validating,
  onLoadMore,
}: TimelineListProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Infinite scroll via IntersectionObserver
  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0]?.isIntersecting && hasMore && !validating) {
        onLoadMore();
      }
    },
    [hasMore, validating, onLoadMore]
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin: "200px",
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleIntersect]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4 py-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="w-9 h-9 rounded-full bg-[#F0F0EE] flex-shrink-0" />
            <div className="flex-1 h-16 bg-[#F0F0EE] rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (grouped.length === 0) {
    return null; // Empty state handled by parent
  }

  return (
    <div className="space-y-6">
      {grouped.map((group) => (
        <div key={group.group}>
          {/* Group label */}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[11px] font-semibold text-[#B0B0AE] uppercase tracking-[0.06em]">
              {group.label}
            </span>
            <div className="flex-1 h-px bg-[#F0F0EE]" />
            <span className="text-[11px] text-[#C4C4C2]">
              {group.events.length}
            </span>
          </div>

          {/* Events */}
          <div>
            {group.events.map((event, idx) => (
              <TimelineItem
                key={event.id}
                event={event}
                isLast={idx === group.events.length - 1}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Sentinel pour infinite scroll */}
      <div ref={sentinelRef} className="h-1" />

      {/* Loading indicator */}
      {validating && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center py-4"
        >
          <Loader2 size={18} className="animate-spin text-[#B0B0AE]" />
          <span className="ml-2 text-[12px] text-[#B0B0AE]">
            Chargement…
          </span>
        </motion.div>
      )}
    </div>
  );
}
