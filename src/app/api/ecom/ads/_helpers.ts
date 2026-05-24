/**
 * Helpers communs aux endpoints /api/ecom/ads/*
 */
import type { AdsProvider, DateRange } from "@/lib/ads/types";

export function parseRange(rangeParam: string | null, fromParam: string | null, toParam: string | null): DateRange {
  if (fromParam && toParam) {
    return { from: fromParam, to: toParam };
  }
  const today = new Date();
  const toIso = today.toISOString().slice(0, 10);
  const days = rangeParam === "7d" ? 7 : rangeParam === "90d" ? 90 : 30;
  const fromIso = new Date(today.getTime() - days * 24 * 3600 * 1000).toISOString().slice(0, 10);
  return { from: fromIso, to: toIso };
}

export function parseProviders(providersParam: string | null): AdsProvider[] | undefined {
  if (!providersParam) return undefined;
  const valid = new Set(["pinterest", "google_ads", "meta_ads", "tiktok_ads"]);
  const list = providersParam.split(",").map((p) => p.trim()).filter((p) => valid.has(p)) as AdsProvider[];
  return list.length > 0 ? list : undefined;
}
