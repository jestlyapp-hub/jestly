"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useApi } from "@/lib/hooks/use-api";
import { ArrowLeft, AlertCircle } from "lucide-react";
import PeriodSelector from "@/components/ecom/ads/PeriodSelector";
import { formatAttributionMethod, formatConfidence, formatProvider } from "@/lib/ads/formatters";

interface AuditResponse {
  range: { from: string; to: string };
  method_filter: string | null;
  touches: Array<{
    order_id: string; touch_index: number; touch_at: string;
    provider: string | null; campaign_id: string | null; campaign_name: string | null;
    utm_source: string | null; utm_campaign: string | null;
    attribution_method: string; attribution_weight: number;
    referring_site: string | null; landing_path: string | null;
  }>;
  stats: Record<string, number>;
}

function AuditContent() {
  const [method, setMethod] = useState<string>("");
  const [range, setRange] = useState<"7d" | "30d" | "90d" | "custom">("30d");

  const params = new URLSearchParams({ range });
  if (method) params.set("method", method);
  const { data } = useApi<AuditResponse>(`/api/ecom/ads/attribution/audit?${params.toString()}`);

  const totalTouches = Object.values(data?.stats ?? {}).reduce((s, n) => s + n, 0);
  const unmatchedCount = data?.stats?.unmatched ?? 0;
  const unmatchedPct = totalTouches > 0 ? (unmatchedCount / totalTouches) * 100 : 0;

  return (
    <div className="space-y-5">
      <Link href="/ecom/ads" className="inline-flex items-center gap-1.5 text-[12px] text-[#5A5A58] hover:text-[#191919]">
        <ArrowLeft size={12} /> Retour Performance Ads
      </Link>

      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold text-[#191919] tracking-tight">Audit attribution</h1>
          <p className="text-[12px] text-[#8A8A88]">Comment chaque commande Shopify est attribuée à une campagne</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={method} onChange={(e) => setMethod(e.target.value)}
            className="px-2.5 py-1.5 border border-[#E6E6E4] rounded-md text-[12px] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30">
            <option value="">Toutes méthodes</option>
            <option value="utm_campaign_exact">UTM exact</option>
            <option value="utm_source_prorata">Source prorata</option>
            <option value="referring_site">Domaine référent</option>
            <option value="unmatched">Non attribuées</option>
          </select>
          <PeriodSelector value={range} onChange={setRange} />
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(data?.stats ?? {}).map(([m, n]) => (
          <div key={m} className="bg-white border border-[#E6E6E4] rounded-xl p-3">
            <div className="text-[10px] uppercase tracking-wide text-[#8A8A88] mb-1">{formatAttributionMethod(m)}</div>
            <div className="text-[18px] font-bold text-[#191919] tabular-nums">{n}</div>
          </div>
        ))}
      </div>

      {/* Recommandation si beaucoup d'unmatched */}
      {unmatchedPct > 30 && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertCircle size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-[12px] text-amber-700">
            <strong>{unmatchedCount} commandes sans UTM</strong> sur cette période ({unmatchedPct.toFixed(1)}% du total).
            Activez le tracking template Pinterest dans <em>Ad account settings → Conversions → URL parameters</em>
            pour automatiser <code className="bg-amber-100 px-1 rounded">utm_source=pinterest&amp;utm_campaign=&#123;CAMPAIGN_ID&#125;</code> sur tous vos pins promus.
          </p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-[#E6E6E4] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#FBFBFA] border-b border-[#E6E6E4]">
              <tr className="text-left text-[10px] font-semibold uppercase tracking-wide text-[#8A8A88]">
                <th className="px-3 py-2">Order ID</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Provider</th>
                <th className="px-3 py-2">Campagne</th>
                <th className="px-3 py-2">UTM source</th>
                <th className="px-3 py-2">UTM campaign</th>
                <th className="px-3 py-2">Méthode</th>
                <th className="px-3 py-2 text-right">Poids</th>
              </tr>
            </thead>
            <tbody>
              {(data?.touches ?? []).slice(0, 200).map((t) => (
                <tr key={`${t.order_id}|${t.touch_index}`} className="border-b border-[#F7F7F5] last:border-0 hover:bg-[#FBFBFA]">
                  <td className="px-3 py-2 text-[11px] font-mono text-[#5A5A58]">{t.order_id.slice(0, 12)}…</td>
                  <td className="px-3 py-2 text-[11px] text-[#8A8A88]">{new Date(t.touch_at).toLocaleDateString("fr-FR")}</td>
                  <td className="px-3 py-2 text-[11px] text-[#5A5A58]">{formatProvider(t.provider)}</td>
                  <td className="px-3 py-2 text-[12px] text-[#191919] truncate max-w-[200px]">{t.campaign_name ?? "—"}</td>
                  <td className="px-3 py-2 text-[11px] text-[#8A8A88]">{t.utm_source ?? "∅"}</td>
                  <td className="px-3 py-2 text-[11px] text-[#8A8A88] truncate max-w-[200px]">{t.utm_campaign ?? "∅"}</td>
                  <td className="px-3 py-2 text-[11px] text-[#5A5A58]">{formatAttributionMethod(t.attribution_method)}</td>
                  <td className="px-3 py-2 text-[11px] tabular-nums text-right text-[#191919]">{formatConfidence(t.attribution_weight)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {(data?.touches?.length ?? 0) > 200 && (
            <p className="text-[11px] text-[#8A8A88] text-center py-2 border-t border-[#E6E6E4]">
              Affichage limité à 200 lignes (total {data?.touches.length})
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AuditPage() {
  return (
    <Suspense fallback={<div className="text-[13px] text-[#8A8A88] py-10 text-center">Chargement…</div>}>
      <AuditContent />
    </Suspense>
  );
}
