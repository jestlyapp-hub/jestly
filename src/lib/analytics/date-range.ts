// ── Date Range Utilities for Analytics ──
// Centralized temporal logic for all analytics queries

export type RangeKey = "today" | "7d" | "30d" | "90d" | "12m" | "all" | "custom";

export interface DateRange {
  start: Date;
  end: Date;
}

/**
 * Compute start/end Date objects from a range key.
 * All times are UTC-based. `end` is always "now".
 */
export function computeDateRange(
  range: RangeKey,
  customFrom?: string | null,
  customTo?: string | null,
): DateRange {
  const now = new Date();
  let start: Date;
  let end = new Date(now);

  switch (range) {
    case "today":
      start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      break;
    case "7d":
      start = new Date(now.getTime() - 7 * 86400000);
      break;
    case "30d":
      start = new Date(now.getTime() - 30 * 86400000);
      break;
    case "90d":
      start = new Date(now.getTime() - 90 * 86400000);
      break;
    case "12m":
      start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      break;
    case "all":
      start = new Date(2020, 0, 1);
      break;
    case "custom":
      start = customFrom ? new Date(customFrom) : new Date(now.getTime() - 30 * 86400000);
      if (customTo) end = new Date(customTo);
      break;
    default:
      start = new Date(now.getTime() - 30 * 86400000);
  }

  return { start, end };
}

/**
 * Compute the previous period (same duration, shifted back).
 */
export function computePreviousPeriod(current: DateRange): DateRange {
  const durationMs = current.end.getTime() - current.start.getTime();
  return {
    start: new Date(current.start.getTime() - durationMs),
    end: new Date(current.start.getTime()),
  };
}

/**
 * Determine the best granularity for a time series chart.
 */
export function getGranularity(range: DateRange): "hour" | "day" | "month" {
  const diffDays = Math.ceil((range.end.getTime() - range.start.getTime()) / 86400000);
  if (diffDays <= 1) return "hour";
  if (diffDays <= 90) return "day";
  return "month";
}
