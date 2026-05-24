"use client";

import { RefreshCw, Download, GitCompare } from "lucide-react";
import { useState } from "react";
import PeriodFilterDropdown from "@/components/facturation/PeriodFilterDropdown";
import type { PeriodFilter } from "@/lib/period-filter";
import { apiFetch } from "@/lib/hooks/use-api";
import { toast } from "@/lib/hooks/use-toast";
import { formatRelativeDate } from "@/lib/shopify/formatters";

interface Props {
  shopName: string;
  lastSyncAt: string | null;
  filter: PeriodFilter;
  onFilterChange: (f: PeriodFilter) => void;
  compare: boolean;
  onCompareChange: (v: boolean) => void;
  onRefresh: () => void;
}

export default function DashboardHeader({
  shopName, lastSyncAt, filter, onFilterChange, compare, onCompareChange, onRefresh,
}: Props) {
  const [syncing, setSyncing] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleRefresh = async () => {
    setSyncing(true);
    try {
      await apiFetch("/api/ecom/sync", { method: "POST" });
      toast.success("Synchronisation lancée");
      onRefresh();
    } catch (err) {
      toast.error("Échec de la synchronisation");
    } finally {
      setSyncing(false);
    }
  };

  const handleExport = (type: "orders" | "products" | "customers") => {
    setExporting(true);
    window.location.href = `/api/ecom/export?type=${type}`;
    setTimeout(() => setExporting(false), 800);
  };

  return (
    <header className="mb-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
        <div>
          <h1 className="text-[26px] font-bold text-[#191919] tracking-tight">Tour de pilotage</h1>
          <p className="text-[12px] text-[#8A8A88] mt-0.5">
            {shopName}
            {lastSyncAt && <> · MAJ {formatRelativeDate(lastSyncAt)}</>}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <PeriodFilterDropdown value={filter} onChange={onFilterChange} />
          <button
            onClick={() => onCompareChange(!compare)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 border rounded-md text-[12px] font-medium transition-colors ${
              compare ? "border-[#7C3AED] bg-[#F0EEFF] text-[#7C3AED]" : "border-[#E6E6E4] text-[#5A5A58] hover:bg-[#FBFBFA]"
            }`}
            title="Comparer à la période précédente"
          >
            <GitCompare size={12} />
            Comparer
          </button>
          <button
            onClick={handleRefresh}
            disabled={syncing}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 border border-[#E6E6E4] rounded-md text-[12px] font-medium text-[#5A5A58] hover:bg-[#FBFBFA] disabled:opacity-50"
          >
            <RefreshCw size={12} className={syncing ? "animate-spin" : ""} />
            Actualiser
          </button>
          <div className="relative group">
            <button className="inline-flex items-center gap-1.5 px-2.5 py-1.5 border border-[#E6E6E4] rounded-md text-[12px] font-medium text-[#5A5A58] hover:bg-[#FBFBFA] disabled:opacity-50" disabled={exporting}>
              <Download size={12} />
              Exporter
            </button>
            <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-[#E6E6E4] rounded-md shadow-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button onClick={() => handleExport("orders")} className="w-full text-left px-3 py-1.5 text-[12px] text-[#191919] hover:bg-[#FBFBFA]">Commandes (CSV)</button>
              <button onClick={() => handleExport("products")} className="w-full text-left px-3 py-1.5 text-[12px] text-[#191919] hover:bg-[#FBFBFA]">Produits (CSV)</button>
              <button onClick={() => handleExport("customers")} className="w-full text-left px-3 py-1.5 text-[12px] text-[#191919] hover:bg-[#FBFBFA]">Clients (CSV)</button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
