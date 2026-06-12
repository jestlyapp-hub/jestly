"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ChevronUp, ChevronDown, ImageOff } from "lucide-react";
import { formatCurrency, formatRoas, formatNumberFr } from "@/lib/ads/formatters";
import CampaignStatusBadge from "./CampaignStatusBadge";
import type { CreativeRow, AggregatedProfitStatus } from "@/lib/ads/types";

interface Props {
  creatives: CreativeRow[];
  total: number;
  onSortChange?: (sortBy: string, sortOrder: "asc" | "desc") => void;
  onStatusFilter?: (status: AggregatedProfitStatus | "all") => void;
  onSearchChange?: (search: string) => void;
  currentSortBy?: string;
  currentSortOrder?: "asc" | "desc";
  currentStatus?: AggregatedProfitStatus | "all";
  currentSearch?: string;
}

type SortKey = "spend_cents" | "revenue_cents" | "real_roas" | "orders";

const API_KEY: Record<SortKey, string> = {
  spend_cents: "spend", revenue_cents: "revenue", real_roas: "roas", orders: "orders",
};

/** Miniature du pin (media_url) avec fallback si le visuel n'est pas connu. */
export function PinThumbnail({ src, alt, size = 40 }: { src: string | null; alt: string; size?: number }) {
  if (!src) {
    return (
      <span
        className="flex items-center justify-center rounded-md bg-[#F7F7F5] border border-[#E6E6E4] text-[#8A8A88] flex-shrink-0"
        style={{ width: size, height: size }}
      >
        <ImageOff size={Math.round(size * 0.4)} />
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src} alt={alt} loading="lazy"
      className="rounded-md object-cover border border-[#E6E6E4] flex-shrink-0"
      style={{ width: size, height: size }}
    />
  );
}

export default function CreativesTable({
  creatives, total, onSortChange, onStatusFilter, onSearchChange,
  currentSortBy = "spend", currentSortOrder = "desc", currentStatus = "all", currentSearch = "",
}: Props) {
  const [search, setSearch] = useState(currentSearch);

  const sortableHeaders: { key: SortKey; label: string }[] = [
    { key: "spend_cents", label: "Dépense" },
    { key: "revenue_cents", label: "Revenue" },
    { key: "real_roas", label: "ROAS" },
    { key: "orders", label: "Cmds" },
  ];

  const setSort = (key: SortKey) => {
    const apiKey = API_KEY[key];
    const order = currentSortBy === apiKey && currentSortOrder === "desc" ? "asc" : "desc";
    onSortChange?.(apiKey, order);
  };

  const sortIndicator = (key: SortKey) => {
    if (currentSortBy !== API_KEY[key]) return null;
    return currentSortOrder === "desc" ? <ChevronDown size={11} /> : <ChevronUp size={11} />;
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange?.(search);
  };

  return (
    <div className="bg-white border border-[#E6E6E4] rounded-xl">
      {/* Toolbar */}
      <div className="px-4 py-3 border-b border-[#E6E6E4] flex flex-wrap items-center gap-2">
        <form onSubmit={submitSearch} className="relative flex-1 min-w-[180px] max-w-md">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8A8A88]" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un visuel ou une campagne…"
            className="w-full pl-8 pr-3 py-1.5 border border-[#E6E6E4] rounded-md text-[12px] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30"
          />
        </form>
        <select
          value={currentStatus}
          onChange={(e) => onStatusFilter?.(e.target.value as AggregatedProfitStatus | "all")}
          className="px-2.5 py-1.5 border border-[#E6E6E4] rounded-md text-[12px] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30"
        >
          <option value="all">Tous statuts</option>
          <option value="profitable">Rentables</option>
          <option value="warning">Limites</option>
          <option value="unprofitable">En perte</option>
          <option value="insufficient_data">Données partielles</option>
          <option value="unmatched">Non attribués</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#FBFBFA] border-b border-[#E6E6E4]">
            <tr className="text-left text-[10px] font-semibold uppercase tracking-wide text-[#8A8A88]">
              <th className="px-3 py-2">Visuel</th>
              <th className="px-3 py-2">Campagne</th>
              {sortableHeaders.map((h) => (
                <th key={h.key} className="px-3 py-2 text-right">
                  <button onClick={() => setSort(h.key)} className="inline-flex items-center gap-0.5 hover:text-[#191919]">
                    {h.label}{sortIndicator(h.key)}
                  </button>
                </th>
              ))}
              <th className="px-3 py-2">Statut</th>
            </tr>
          </thead>
          <tbody>
            {creatives.length === 0 ? (
              <tr><td colSpan={7} className="px-3 py-12 text-center text-[12px] text-[#8A8A88]">
                Aucun visuel dans cette plage de filtres.
              </td></tr>
            ) : creatives.map((c) => {
              const title = c.pin_title || c.ad_name || `Pin ${c.pin_id ?? c.ad_id}`;
              return (
                <tr key={`${c.provider}|${c.ad_id}`} className="border-b border-[#F7F7F5] last:border-0 hover:bg-[#FBFBFA]">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2.5">
                      <PinThumbnail src={c.pin_media_url} alt={title} />
                      <span className="text-[12px] font-medium text-[#191919] line-clamp-2 max-w-[260px]">{title}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    {c.campaign_id && c.campaign_id !== "unknown" ? (
                      <Link href={`/ecom/ads/campaigns/${c.campaign_id}?provider=${c.provider}`}
                        className="text-[11px] text-[#5A5A58] hover:text-[#7C3AED] line-clamp-1 max-w-[180px]">
                        {c.campaign_name ?? c.campaign_id}
                      </Link>
                    ) : (
                      <span className="text-[11px] text-[#8A8A88]">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right text-[12px] tabular-nums text-[#191919]">{formatCurrency(c.spend_cents)}</td>
                  <td className="px-3 py-2 text-right text-[12px] tabular-nums text-[#191919]">{formatCurrency(c.revenue_cents)}</td>
                  <td className="px-3 py-2 text-right text-[12px] tabular-nums font-semibold text-[#191919]">{formatRoas(c.real_roas)}</td>
                  <td className="px-3 py-2 text-right text-[12px] tabular-nums text-[#191919]">{formatNumberFr(c.orders)}</td>
                  <td className="px-3 py-2"><CampaignStatusBadge status={c.profit_status} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-[#E6E6E4] text-[11px] text-[#8A8A88]">
        {total} visuel{total > 1 ? "s" : ""}{currentSearch ? ` correspondant à "${currentSearch}"` : ""}
      </div>
    </div>
  );
}
