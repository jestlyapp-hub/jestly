"use client";

import { useState } from "react";
import Link from "next/link";
import { useApi } from "@/lib/hooks/use-api";
import { formatCurrency, formatDate, formatFinancialStatus, formatFulfillmentStatus, formatSource } from "@/lib/shopify/formatters";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

interface OrderRow {
  id: string;
  name: string;
  created_at: string;
  total_price: number;
  currency: string;
  email: string | null;
  financial_status: string | null;
  fulfillment_status: string | null;
  source_name: string | null;
  utm_source: string | null;
}

const COLOR_CLASSES: Record<string, string> = {
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  rose: "bg-rose-50 text-rose-700 border-rose-200",
  gray: "bg-[#F7F7F5] text-[#5A5A58] border-[#E6E6E4]",
};

const PAGE_SIZE = 50;

export default function EcomOrdersPage() {
  const [search, setSearch] = useState("");
  const [financial, setFinancial] = useState("");
  const [fulfillment, setFulfillment] = useState("");
  const [offset, setOffset] = useState(0);

  const params = new URLSearchParams();
  params.set("limit", String(PAGE_SIZE));
  params.set("offset", String(offset));
  if (search) params.set("search", search);
  if (financial) params.set("financial", financial);
  if (fulfillment) params.set("fulfillment", fulfillment);

  const { data, loading } = useApi<{ data: OrderRow[]; total: number }>(
    `/api/ecom/orders?${params.toString()}`,
  );

  const total = data?.total ?? 0;
  const page = Math.floor(offset / PAGE_SIZE) + 1;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-[22px] font-bold text-[#191919] tracking-tight">Commandes</h1>
        <p className="text-[12px] text-[#8A8A88] mt-0.5">
          {total ? `${total} commande${total > 1 ? "s" : ""}` : "Aucune commande"}
        </p>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8A8A88]" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setOffset(0); }}
            placeholder="N°, email…"
            className="w-full pl-8 pr-3 py-1.5 border border-[#E6E6E4] rounded-md text-[12px] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30"
          />
        </div>
        <select
          value={financial}
          onChange={(e) => { setFinancial(e.target.value); setOffset(0); }}
          className="px-2.5 py-1.5 border border-[#E6E6E4] rounded-md text-[12px] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30"
        >
          <option value="">Tous paiements</option>
          <option value="paid">Payée</option>
          <option value="pending">En attente</option>
          <option value="refunded">Remboursée</option>
          <option value="voided">Annulée</option>
        </select>
        <select
          value={fulfillment}
          onChange={(e) => { setFulfillment(e.target.value); setOffset(0); }}
          className="px-2.5 py-1.5 border border-[#E6E6E4] rounded-md text-[12px] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30"
        >
          <option value="">Tous envois</option>
          <option value="fulfilled">Expédiée</option>
          <option value="unfulfilled">À expédier</option>
          <option value="partial">Partielle</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E6E6E4] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#FBFBFA] border-b border-[#E6E6E4]">
              <tr className="text-left text-[10px] font-semibold uppercase tracking-wide text-[#8A8A88]">
                <th className="px-4 py-2.5">N°</th>
                <th className="px-4 py-2.5">Date</th>
                <th className="px-4 py-2.5">Client</th>
                <th className="px-4 py-2.5 text-right">Montant</th>
                <th className="px-4 py-2.5">Paiement</th>
                <th className="px-4 py-2.5">Envoi</th>
                <th className="px-4 py-2.5">Source</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-[12px] text-[#8A8A88]">Chargement…</td></tr>
              )}
              {!loading && data?.data.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-[12px] text-[#8A8A88]">Aucune commande</td></tr>
              )}
              {data?.data.map((o) => {
                const fin = formatFinancialStatus(o.financial_status);
                const ful = formatFulfillmentStatus(o.fulfillment_status);
                return (
                  <tr key={o.id} className="border-b border-[#F7F7F5] last:border-0 hover:bg-[#FBFBFA]">
                    <td className="px-4 py-2.5 text-[13px] font-semibold text-[#191919]">
                      <Link href={`/ecom/orders/${o.id}`} className="hover:text-[#7C3AED]">{o.name}</Link>
                    </td>
                    <td className="px-4 py-2.5 text-[12px] text-[#5A5A58] whitespace-nowrap">{formatDate(o.created_at)}</td>
                    <td className="px-4 py-2.5 text-[12px] text-[#5A5A58] truncate max-w-[220px]">{o.email ?? "—"}</td>
                    <td className="px-4 py-2.5 text-[12px] font-semibold text-[#191919] tabular-nums text-right whitespace-nowrap">
                      {formatCurrency(o.total_price, o.currency)}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium border ${COLOR_CLASSES[fin.color]}`}>
                        {fin.label}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium border ${COLOR_CLASSES[ful.color]}`}>
                        {ful.label}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-[11px] text-[#8A8A88]">{formatSource(o.utm_source ?? o.source_name)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-[#E6E6E4]">
            <span className="text-[11px] text-[#8A8A88]">Page {page} / {totalPages}</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
                disabled={offset === 0}
                className="p-1 border border-[#E6E6E4] rounded hover:bg-[#FBFBFA] disabled:opacity-30"
              ><ChevronLeft size={14} /></button>
              <button
                onClick={() => setOffset(offset + PAGE_SIZE)}
                disabled={page >= totalPages}
                className="p-1 border border-[#E6E6E4] rounded hover:bg-[#FBFBFA] disabled:opacity-30"
              ><ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
