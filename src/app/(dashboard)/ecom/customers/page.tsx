"use client";

import { useState } from "react";
import { useApi } from "@/lib/hooks/use-api";
import { formatCurrency, formatNumber, formatDate } from "@/lib/shopify/formatters";
import { Search, Mail } from "lucide-react";

interface CustomerRow {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  orders_count: number;
  total_spent: number;
  currency: string;
  accepts_marketing: boolean;
  created_at: string;
}

export default function EcomCustomersPage() {
  const [search, setSearch] = useState("");
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  const { data, loading } = useApi<{ data: CustomerRow[]; total: number }>(`/api/ecom/customers?${params.toString()}`);

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-[22px] font-bold text-[#191919] tracking-tight">Clients</h1>
        <p className="text-[12px] text-[#8A8A88] mt-0.5">{data?.total ?? 0} client{(data?.total ?? 0) > 1 ? "s" : ""}</p>
      </div>

      <div className="relative max-w-md mb-4">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8A8A88]" />
        <input
          type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Email, nom…" className="w-full pl-8 pr-3 py-1.5 border border-[#E6E6E4] rounded-md text-[12px] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30"
        />
      </div>

      <div className="bg-white border border-[#E6E6E4] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#FBFBFA] border-b border-[#E6E6E4]">
              <tr className="text-left text-[10px] font-semibold uppercase tracking-wide text-[#8A8A88]">
                <th className="px-4 py-2.5">Client</th>
                <th className="px-4 py-2.5">Email</th>
                <th className="px-4 py-2.5 text-right">Commandes</th>
                <th className="px-4 py-2.5 text-right">Total dépensé</th>
                <th className="px-4 py-2.5">Marketing</th>
                <th className="px-4 py-2.5">Inscrit le</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-[12px] text-[#8A8A88]">Chargement…</td></tr>
              )}
              {!loading && data?.data.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-[12px] text-[#8A8A88]">Aucun client</td></tr>
              )}
              {data?.data.map((c) => {
                const name = [c.first_name, c.last_name].filter(Boolean).join(" ") || "—";
                return (
                  <tr key={c.id} className="border-b border-[#F7F7F5] last:border-0 hover:bg-[#FBFBFA]">
                    <td className="px-4 py-2.5 text-[13px] font-medium text-[#191919]">{name}</td>
                    <td className="px-4 py-2.5 text-[12px] text-[#5A5A58]">{c.email ?? "—"}</td>
                    <td className="px-4 py-2.5 text-[12px] tabular-nums text-right text-[#191919]">{formatNumber(c.orders_count)}</td>
                    <td className="px-4 py-2.5 text-[12px] font-semibold tabular-nums text-right text-[#191919]">
                      {formatCurrency(c.total_spent, c.currency)}
                    </td>
                    <td className="px-4 py-2.5">
                      {c.accepts_marketing ? <Mail size={12} className="text-emerald-600" /> : <span className="text-[#8A8A88] text-[11px]">Non</span>}
                    </td>
                    <td className="px-4 py-2.5 text-[12px] text-[#8A8A88]">{formatDate(c.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
