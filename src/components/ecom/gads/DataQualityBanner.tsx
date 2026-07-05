"use client";

import Link from "next/link";
import { formatCurrency } from "@/lib/ads/formatters";
import type { DataQuality } from "@/lib/costs/blended";

/**
 * Bandeau qualité de donnée (1C) — l'honnêteté fait partie du design :
 * traçabilité des commandes + part du CA réellement attribuable.
 */
export default function DataQualityBanner({ quality }: { quality: DataQuality }) {
  const total = quality.tracked + quality.ghost + quality.unmatched + quality.unknown;
  if (total === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-4 bg-white border border-[#E5E3F0] rounded-lg px-4 py-2.5 text-[12px]">
      <span className="font-semibold text-[#1a1535]">Qualité de la donnée :</span>
      <Chip dot="bg-emerald-500" label="trackées" value={quality.tracked} />
      <Chip dot="bg-rose-500" label="fantômes" value={quality.ghost} />
      <Chip dot="bg-amber-500" label="non rattachées" value={quality.unmatched} />
      {quality.unknown > 0 && <Chip dot="bg-[#B4B4B2]" label="inconnues" value={quality.unknown} />}
      {quality.pixel_recovered > 0 && <Chip dot="bg-sky-500" label="récupérées pixel" value={quality.pixel_recovered} />}
      {quality.survey_recovered > 0 && (
        <span className="inline-flex items-center gap-1.5 text-[#5A5A58]" title="Commandes fantômes dont le client a déclaré la source (survey post-achat)">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span className="tabular-nums font-medium text-[#1a1535]">{formatCurrency(quality.survey_recovered_revenue_cents)}</span>
          <span className="text-[#8A8A88]">récupérés par survey</span>
        </span>
      )}
      {quality.attributable_revenue_share != null && (
        <span className="text-[#5A5A58]">
          <span className="font-semibold text-[#1a1535] tabular-nums">
            {Math.round(quality.attributable_revenue_share * 100)} %
          </span>{" "}
          du CA attribuable
        </span>
      )}
      <Link href="/ecom/gads/attribution" className="ml-auto text-[11px] text-[#7C3AED] hover:underline">
        Vue Attribution →
      </Link>
    </div>
  );
}

function Chip({ dot, label, value }: { dot: string; label: string; value: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[#5A5A58]">
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${dot}`} />
      <span className="tabular-nums font-medium text-[#1a1535]">{value}</span>
      <span className="text-[#8A8A88]">{label}</span>
    </span>
  );
}
