"use client";
import { usePageTitle } from "@/lib/hooks/use-page-title";

import { Suspense, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Flame, Info, Trophy } from "lucide-react";
import { useApi } from "@/lib/hooks/use-api";
import AdsKpiGrid from "@/components/ecom/ads/AdsKpiGrid";
import PeriodSelector from "@/components/ecom/ads/PeriodSelector";
import CreativesTable, { PinThumbnail } from "@/components/ecom/ads/CreativesTable";
import { computeRoas } from "@/lib/ads/roas-engine";
import { formatCurrency, formatRoas } from "@/lib/ads/formatters";
import type { CreativeRow, AggregatedProfitStatus } from "@/lib/ads/types";

interface CreativesResponse { creatives: CreativeRow[]; total: number }

function CreativesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const range = (searchParams.get("range") ?? "30d") as "7d" | "30d" | "90d" | "custom";
  const sortBy = searchParams.get("sortBy") ?? "spend";
  const sortOrder = (searchParams.get("sortOrder") ?? "desc") as "asc" | "desc";
  const status = (searchParams.get("status") ?? "all") as AggregatedProfitStatus | "all";
  const search = searchParams.get("search") ?? "";

  const query = useMemo(() => {
    const p = new URLSearchParams();
    p.set("range", range);
    p.set("sortBy", sortBy);
    p.set("sortOrder", sortOrder);
    p.set("limit", "200");
    if (status !== "all") p.set("status", status);
    if (search) p.set("search", search);
    return p.toString();
  }, [range, sortBy, sortOrder, status, search]);

  const { data } = useApi<CreativesResponse>(`/api/ecom/ads/creatives?${query}`);
  const creatives = useMemo(() => data?.creatives ?? [], [data]);

  const updateParam = useCallback((key: string, value: string | null) => {
    const p = new URLSearchParams(searchParams.toString());
    if (value == null || value === "" || (key === "status" && value === "all")) p.delete(key);
    else p.set(key, value);
    router.replace(`/ecom/ads/creatives?${p.toString()}`);
  }, [searchParams, router]);

  // KPIs agrégés sur la liste affichée
  const totals = useMemo(() => {
    let spend = 0, revenue = 0, orders = 0;
    for (const c of creatives) { spend += c.spend_cents; revenue += c.revenue_cents; orders += c.orders; }
    return { spend, revenue, orders, roas: computeRoas(revenue, spend) };
  }, [creatives]);

  const kpis = data ? [
    { label: "Dépense", value: formatCurrency(totals.spend), delta_percent: null, positiveIsGood: false },
    { label: "Revenue attribué", value: formatCurrency(totals.revenue), delta_percent: null, positiveIsGood: true },
    { label: "ROAS réel", value: formatRoas(totals.roas), delta_percent: null, positiveIsGood: true },
    { label: "Commandes", value: String(totals.orders), delta_percent: null, positiveIsGood: true },
    { label: "Visuels actifs", value: String(data.total), delta_percent: null, positiveIsGood: true },
    { label: "Visuels attribués", value: String(creatives.filter((c) => c.orders > 0).length), delta_percent: null, positiveIsGood: true },
  ] : [];

  // Top visuel (meilleur ROAS avec revenue) et visuels qui brûlent (spend sans commande)
  const topCreative = useMemo(() => {
    return creatives
      .filter((c) => c.revenue_cents > 0 && c.spend_cents > 0)
      .sort((a, b) => (b.real_roas ?? 0) - (a.real_roas ?? 0))[0] ?? null;
  }, [creatives]);

  const burningCreatives = useMemo(() => {
    return creatives
      .filter((c) => c.spend_cents > 0 && c.orders === 0)
      .sort((a, b) => b.spend_cents - a.spend_cents)
      .slice(0, 3);
  }, [creatives]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <Link href="/ecom/ads" className="inline-flex items-center gap-1 text-[11px] text-[#8A8A88] hover:text-[#191919] mb-1">
            <ArrowLeft size={11} /> Performance Ads
          </Link>
          <h1 className="text-[26px] font-bold text-[#191919] tracking-tight">Visuels Pinterest</h1>
          <p className="text-[12px] text-[#8A8A88] mt-0.5">Quel pin rapporte le plus — ROAS réel par visuel, basé sur vos commandes Shopify</p>
        </div>
        <PeriodSelector value={range} onChange={(v) => updateParam("range", v)} />
      </header>

      {/* Note tracking template */}
      <div className="flex items-start gap-2 px-3 py-2.5 bg-[#F0EEFF] border border-[#E6E6E4] rounded-lg">
        <Info size={14} className="text-[#7C3AED] flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-[#5A5A58]">
          Le revenue par visuel ne couvre que les commandes arrivées via un lien taggé{" "}
          <code className="px-1 py-0.5 bg-white rounded text-[10px]">utm_content={"{adid}"}</code>{" "}
          (tracking template Pinterest). Les commandes antérieures à l&apos;activation du template restent
          attribuées au niveau campagne et n&apos;apparaissent pas ici.
        </p>
      </div>

      {/* KPI grid */}
      <AdsKpiGrid kpis={kpis} loading={!data} />

      {/* Top visuel + budget brûlé */}
      {(topCreative || burningCreatives.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="bg-white border border-[#E6E6E4] rounded-xl p-4">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#8A8A88] mb-3">
              <Trophy size={12} className="text-emerald-600" /> Top visuel
            </div>
            {topCreative ? (
              <div className="flex items-center gap-3">
                <PinThumbnail src={topCreative.pin_media_url} alt={topCreative.pin_title ?? "Pin"} size={56} />
                <div className="min-w-0">
                  <div className="text-[13px] font-medium text-[#191919] line-clamp-1">
                    {topCreative.pin_title || topCreative.ad_name || `Pin ${topCreative.pin_id ?? topCreative.ad_id}`}
                  </div>
                  <div className="text-[11px] text-[#8A8A88] line-clamp-1">{topCreative.campaign_name ?? ""}</div>
                  <div className="text-[12px] mt-0.5 tabular-nums">
                    <strong className="text-emerald-600">{formatRoas(topCreative.real_roas)}</strong>
                    <span className="text-[#8A8A88]"> · {formatCurrency(topCreative.revenue_cents)} pour {formatCurrency(topCreative.spend_cents)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-[12px] text-[#8A8A88]">Aucun visuel avec revenue attribué sur la période.</p>
            )}
          </div>
          <div className="bg-white border border-[#E6E6E4] rounded-xl p-4">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#8A8A88] mb-3">
              <Flame size={12} className="text-rose-600" /> Budget sans conversion
            </div>
            {burningCreatives.length > 0 ? (
              <ul className="space-y-2">
                {burningCreatives.map((c) => (
                  <li key={c.ad_id} className="flex items-center gap-2.5">
                    <PinThumbnail src={c.pin_media_url} alt={c.pin_title ?? "Pin"} size={32} />
                    <span className="text-[12px] text-[#191919] line-clamp-1 flex-1">
                      {c.pin_title || c.ad_name || `Pin ${c.pin_id ?? c.ad_id}`}
                    </span>
                    <span className="text-[12px] font-semibold text-rose-600 tabular-nums">{formatCurrency(c.spend_cents)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[12px] text-[#8A8A88]">Aucun visuel ne dépense sans convertir. 👌</p>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <CreativesTable
        creatives={creatives}
        total={data?.total ?? 0}
        onSortChange={(by, order) => {
          updateParam("sortBy", by);
          updateParam("sortOrder", order);
        }}
        onStatusFilter={(s) => updateParam("status", s === "all" ? null : s)}
        onSearchChange={(s) => updateParam("search", s || null)}
        currentSortBy={sortBy}
        currentSortOrder={sortOrder}
        currentStatus={status}
        currentSearch={search}
      />
    </div>
  );
}

export default function EcomAdsCreativesPage() {
  usePageTitle("Créatives — Publicités ECOM");
  return (
    <Suspense fallback={<div className="text-[13px] text-[#8A8A88] py-10 text-center">Chargement…</div>}>
      <CreativesContent />
    </Suspense>
  );
}
