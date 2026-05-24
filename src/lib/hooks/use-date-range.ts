"use client";

import { useState, useMemo, useCallback } from "react";
import type { PeriodFilter } from "@/lib/period-filter";
import { PERIOD_ALL } from "@/lib/period-filter";

export interface DateRange {
  from: string; // YYYY-MM-DD
  to: string;
}

export interface UseDateRangeReturn {
  filter: PeriodFilter;
  setFilter: (f: PeriodFilter) => void;
  range: DateRange | null;
  /** Période précédente de même durée (pour la comparaison). */
  previousRange: DateRange | null;
  /** True si l'user a sélectionné "comparer à la période précédente". */
  compare: boolean;
  setCompare: (v: boolean) => void;
}

const today = () => new Date().toISOString().slice(0, 10);
const ninetyDaysAgo = () => new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString().slice(0, 10);

export function useDateRange(initial?: PeriodFilter): UseDateRangeReturn {
  const [filter, setFilter] = useState<PeriodFilter>(initial ?? PERIOD_ALL);
  const [compare, setCompare] = useState(false);

  const range = useMemo<DateRange | null>(() => {
    if (!filter.range) return { from: ninetyDaysAgo(), to: today() };
    return { from: filter.range.start, to: filter.range.end };
  }, [filter]);

  const previousRange = useMemo<DateRange | null>(() => {
    if (!range) return null;
    const fromDate = new Date(range.from);
    const toDate = new Date(range.to);
    const durationMs = toDate.getTime() - fromDate.getTime();
    const prevTo = new Date(fromDate.getTime() - 24 * 3600 * 1000);
    const prevFrom = new Date(prevTo.getTime() - durationMs);
    return {
      from: prevFrom.toISOString().slice(0, 10),
      to: prevTo.toISOString().slice(0, 10),
    };
  }, [range]);

  const handleSetFilter = useCallback((f: PeriodFilter) => setFilter(f), []);

  return {
    filter,
    setFilter: handleSetFilter,
    range,
    previousRange,
    compare,
    setCompare,
  };
}
