"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Download, ChevronUp, ChevronDown, GitCompare } from "lucide-react";
import { formatCurrency, formatRoas, formatNumberFr, providerEmoji } from "@/lib/ads/formatters";
import CampaignStatusBadge from "./CampaignStatusBadge";
import type { CampaignRow, ProfitStatus, AdsProvider } from "@/lib/ads/types";

interface Props {
  campaigns: CampaignRow[];
  total: number;
  onSortChange?: (sortBy: string, sortOrder: "asc" | "desc") => void;
  onStatusFilter?: (status: ProfitStatus | "all") => void;
  onSearchChange?: (search: string) => void;
  currentSortBy?: string;
  currentSortOrder?: "asc" | "desc";
  currentStatus?: ProfitStatus | "all";
  currentSearch?: string;
  exportHref?: string;
}

type SortKey = "campaign_name" | "spend_cents" | "revenue_cents" | "real_roas" | "orders";

export default function CampaignsTable({
  campaigns, total, onSortChange, onStatusFilter, onSearchChange,
  currentSortBy = "spend", currentSortOrder = "desc", currentStatus = "all",
  currentSearch = "", exportHref,
}: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState(currentSearch);

  const toggle = (key: string) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(key)) n.delete(key); else n.add(key);
      return n;
    });
  };

  const sortableHeaders: { key: SortKey; label: string; align?: "right" }[] = [
    { key: "spend_cents", label: "Dépense", align: "right" },
    { key: "revenue_cents", label: "Revenue", align: "right" },
    { key: "real_roas", label: "ROAS", align: "right" },
    { key: "orders", label: "Cmds", align: "right" },
  ];

  const setSort = (key: SortKey) => {
    const apiKey = key === "spend_cents" ? "spend" : key === "revenue_cents" ? "revenue" : key === "real_roas" ? "roas" : "orders";
    const order = currentSortBy === apiKey && currentSortOrder === "desc" ? "asc" : "desc";
    onSortChange?.(apiKey, order);
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange?.(search);
  };

  const handleCompare = () => {
    if (selected.size < 2) return;
    const ids = [...selected].map((k) => k.split("|")[1]).join(",");
    router.push(`/ecom/ads/comparison?campaign_ids=${ids}`);
  };

  const sortIndicator = useMemo(() => {
    return (key: SortKey) => {
      const apiKey = key === "spend_cents" ? "spend" : key === "revenue_cents" ? "revenue" : key === "real_roas" ? "roas" : "orders";
      if (currentSortBy !== apiKey) return null;
      return currentSortOrder === "desc" ? <ChevronDown size={11} /> : <ChevronUp size={11} />;
    };
  }, [currentSortBy, currentSortOrder]);

  return (
    <div className="bg-white border border-[#E6E6E4] rounded-xl">
      {/* Toolbar */}
      <div className="px-4 py-3 border-b border-[#E6E6E4] flex flex-wrap items-center gap-2">
        <form onSubmit={submitSearch} className="relative flex-1 min-w-[180px] max-w-md">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8A8A88]" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une campagne…"
            className="w-full pl-8 pr-3 py-1.5 border border-[#E6E6E4] rounded-md text-[12px] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30"
          />
        </form>
        <select
          value={currentStatus}
          onChange={(e) => onStatusFilter?.(e.target.value as ProfitStatus | "all")}
          className="px-2.5 py-1.5 border border-[#E6E6E4] rounded-md text-[12px] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30"
        >
          <option value="all">Tous statuts</option>
          <option value="profitable">Rentables</option>
          <option value="warning">Limites</option>
          <option value="unprofitable">En perte</option>
          <option value="unmatched">Non attribuées</option>
        </select>
        {selected.size >= 2 && (
          <button
            onClick={handleCompare}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-md text-[12px] font-semibold"
          >
            <GitCompare size={12} />
            Comparer ({selected.size})
          </button>
        )}
        {exportHref && (
          <a href={exportHref}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-[#E6E6E4] rounded-md text-[12px] font-medium text-[#5A5A58] hover:bg-[#FBFBFA] ml-auto">
            <Download size={12} /> CSV
          </a>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#FBFBFA] border-b border-[#E6E6E4]">
            <tr className="text-left text-[10px] font-semibold uppercase tracking-wide text-[#8A8A88]">
              <th className="w-8 px-3 py-2"></th>
              <th className="px-3 py-2">Campagne</th>
              {sortableHeaders.map((h) => (
                <th key={h.key} className={`px-3 py-2 ${h.align === "right" ? "text-right" : ""}`}>
                  <button onClick={() => setSort(h.key)} className="inline-flex items-center gap-0.5 hover:text-[#191919]">
                    {h.label}{sortIndicator(h.key)}
                  </button>
                </th>
              ))}
              <th className="px-3 py-2">Statut</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.length === 0 ? (
              <tr><td colSpan={7} className="px-3 py-12 text-center text-[12px] text-[#8A8A88]">
                Aucune campagne dans cette plage de filtres.
              </td></tr>
            ) : campaigns.map((c) => {
              const key = `${c.provider}|${c.campaign_id}`;
              const isSelected = selected.has(key);
              return (
                <tr key={key} className="border-b border-[#F7F7F5] last:border-0 hover:bg-[#FBFBFA]">
                  <td className="px-3 py-2.5">
                    <input
                      type="checkbox" checked={isSelected} onChange={() => toggle(key)}
                      className="accent-[#7C3AED] cursor-pointer"
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <Link href={`/ecom/ads/campaigns/${c.campaign_id}?provider=${c.provider}`}
                      className="flex items-center gap-1.5 text-[12px] font-medium text-[#191919] hover:text-[#7C3AED]">
                      <span className="text-[13px]">{providerEmoji(c.provider)}</span>
                      <span className="line-clamp-1">{c.campaign_name}</span>
                    </Link>
                  </td>
                  <td className="px-3 py-2.5 text-right text-[12px] tabular-nums text-[#191919]">{formatCurrency(c.spend_cents)}</td>
                  <td className="px-3 py-2.5 text-right text-[12px] tabular-nums text-[#191919]">{formatCurrency(c.revenue_cents)}</td>
                  <td className="px-3 py-2.5 text-right text-[12px] tabular-nums font-semibold text-[#191919]">{formatRoas(c.real_roas)}</td>
                  <td className="px-3 py-2.5 text-right text-[12px] tabular-nums text-[#191919]">{formatNumberFr(c.orders)}</td>
                  <td className="px-3 py-2.5"><CampaignStatusBadge status={c.profit_status} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-[#E6E6E4] text-[11px] text-[#8A8A88] flex items-center justify-between">
        <span>{total} campagne{total > 1 ? "s" : ""}{currentSearch ? ` correspondant à "${currentSearch}"` : ""}</span>
        {selected.size > 0 && <span>{selected.size} sélectionnée{selected.size > 1 ? "s" : ""}</span>}
      </div>
    </div>
  );
}
