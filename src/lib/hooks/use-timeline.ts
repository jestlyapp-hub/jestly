"use client";

import useSWRInfinite from "swr/infinite";
import { useState, useCallback, useMemo } from "react";
import type {
  TimelineEvent,
  TimelineEventType,
  TimelineFilters,
  TimelineResponse,
  TimelineGroup,
} from "@/types/timeline";
import { TIMELINE_GROUP_LABELS } from "@/types/timeline";

const PAGE_SIZE = 30;

const fetcher = async (url: string): Promise<TimelineResponse> => {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return res.json();
};

function buildUrl(filters: TimelineFilters, cursor?: string | null): string {
  const params = new URLSearchParams();
  params.set("limit", String(PAGE_SIZE));

  if (filters.types && filters.types.length > 0) {
    params.set("types", filters.types.join(","));
  }
  if (filters.entity_type) {
    params.set("entity_type", filters.entity_type);
  }
  if (filters.entity_id) {
    params.set("entity_id", filters.entity_id);
  }
  if (filters.important_only) {
    params.set("important", "true");
  }
  if (filters.search && filters.search.length >= 2) {
    params.set("q", filters.search);
  }
  if (filters.date_from) {
    params.set("from", filters.date_from);
  }
  if (filters.date_to) {
    params.set("to", filters.date_to);
  }
  if (cursor) {
    params.set("cursor", cursor);
  }

  return `/api/timeline?${params.toString()}`;
}

// ── Grouping par date ────────────────────────────────────────

function getTimelineGroup(dateStr: string): TimelineGroup {
  const date = new Date(dateStr);
  const now = new Date();

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const startOfWeek = new Date(today);
  startOfWeek.setDate(startOfWeek.getDate() - today.getDay() + 1); // Lundi
  const startOfLastWeek = new Date(startOfWeek);
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  if (date >= today) return "today";
  if (date >= yesterday) return "yesterday";
  if (date >= startOfWeek) return "this_week";
  if (date >= startOfLastWeek) return "last_week";
  if (date >= startOfMonth) return "this_month";
  return "older";
}

export interface GroupedTimelineEvents {
  group: TimelineGroup;
  label: string;
  events: TimelineEvent[];
}

function groupEvents(events: TimelineEvent[]): GroupedTimelineEvents[] {
  const groups = new Map<TimelineGroup, TimelineEvent[]>();

  for (const event of events) {
    const group = getTimelineGroup(event.created_at);
    if (!groups.has(group)) {
      groups.set(group, []);
    }
    groups.get(group)!.push(event);
  }

  const order: TimelineGroup[] = [
    "today",
    "yesterday",
    "this_week",
    "last_week",
    "this_month",
    "older",
  ];

  return order
    .filter((g) => groups.has(g))
    .map((g) => ({
      group: g,
      label: TIMELINE_GROUP_LABELS[g],
      events: groups.get(g)!,
    }));
}

// ── Hook ─────────────────────────────────────────────────────

export function useTimeline() {
  const [filters, setFilters] = useState<TimelineFilters>({});

  const getKey = useCallback(
    (pageIndex: number, previousPageData: TimelineResponse | null) => {
      // Première page
      if (pageIndex === 0) return buildUrl(filters);
      // Pas de page suivante
      if (!previousPageData?.has_more || !previousPageData?.next_cursor)
        return null;
      return buildUrl(filters, previousPageData.next_cursor);
    },
    [filters]
  );

  const { data, error, isLoading, isValidating, size, setSize, mutate } =
    useSWRInfinite<TimelineResponse>(getKey, fetcher, {
      revalidateOnFocus: false,
      revalidateFirstPage: true,
      dedupingInterval: 5000,
    });

  // Flatten all pages
  const allEvents = useMemo(() => {
    if (!data) return [];
    return data.flatMap((page) => page.events);
  }, [data]);

  // Grouper par date
  const grouped = useMemo(() => groupEvents(allEvents), [allEvents]);

  // Has more
  const hasMore = data ? data[data.length - 1]?.has_more ?? false : false;

  // Charger la page suivante
  const loadMore = useCallback(() => {
    if (hasMore && !isValidating) {
      setSize((s) => s + 1);
    }
  }, [hasMore, isValidating, setSize]);

  // Update filtres (reset pagination)
  const updateFilters = useCallback(
    (newFilters: Partial<TimelineFilters>) => {
      setFilters((prev) => ({ ...prev, ...newFilters }));
    },
    []
  );

  // Toggle un type dans les filtres
  const toggleType = useCallback((type: TimelineEventType) => {
    setFilters((prev) => {
      const current = prev.types || [];
      const next = current.includes(type)
        ? current.filter((t) => t !== type)
        : [...current, type];
      return { ...prev, types: next.length > 0 ? next : undefined };
    });
  }, []);

  // Reset tous les filtres
  const resetFilters = useCallback(() => {
    setFilters({});
  }, []);

  return {
    events: allEvents,
    grouped,
    filters,
    loading: isLoading,
    validating: isValidating,
    error: error ? (error instanceof Error ? error.message : "Erreur") : null,
    hasMore,
    loadMore,
    updateFilters,
    toggleType,
    resetFilters,
    setFilters,
    refresh: mutate,
  };
}
