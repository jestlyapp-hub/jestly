/**
 * Helpers communs aux endpoints /api/ecom/ads/*
 */
import type { AdsProvider, DateRange } from "@/lib/ads/types";
import { parisDaysAgo, todayParis } from "@/lib/paris-time";

export function parseRange(rangeParam: string | null, fromParam: string | null, toParam: string | null): DateRange {
  if (fromParam && toParam && /^\d{4}-\d{2}-\d{2}$/.test(fromParam) && /^\d{4}-\d{2}-\d{2}$/.test(toParam)) {
    return { from: fromParam, to: toParam };
  }
  // « Aujourd'hui » au sens de Paris — pas du fuseau UTC du serveur.
  const days = rangeParam === "7d" ? 7 : rangeParam === "90d" ? 90 : 30;
  return { from: parisDaysAgo(days), to: todayParis() };
}

export function parseProviders(providersParam: string | null): AdsProvider[] | undefined {
  if (!providersParam) return undefined;
  const valid = new Set(["pinterest", "google_ads", "meta_ads", "tiktok_ads"]);
  const list = providersParam.split(",").map((p) => p.trim()).filter((p) => valid.has(p)) as AdsProvider[];
  return list.length > 0 ? list : undefined;
}
