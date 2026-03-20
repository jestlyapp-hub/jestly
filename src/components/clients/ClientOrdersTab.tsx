"use client";

import { useState, useCallback } from "react";
import { useApi } from "@/lib/hooks/use-api";
import BadgeStatus from "@/components/ui/BadgeStatus";

interface Props {
  clientId: string;
}

interface OrderRow {
  id: string;
  title: string;
  amount: number;
  status: string;
  paid: boolean;
  created_at: string;
  services?: { title: string } | null;
}

interface OrdersResponse {
  orders: OrderRow[];
  total: number;
  page: number;
  totalPages: number;
}

const statusFilters = [
  { value: "", label: "Tous" },
  { value: "new", label: "Nouveau" },
  { value: "in_progress", label: "En cours" },
  { value: "delivered", label: "Livré" },
  { value: "cancelled", label: "Annulé" },
  { value: "refunded", label: "Remboursé" },
];

export default function ClientOrdersTab({ clientId }: Props) {
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const url = `/api/clients/${clientId}/orders?page=${page}&limit=20${status ? `&status=${status}` : ""}${search ? `&search=${encodeURIComponent(search)}` : ""}`;
  const { data, loading } = useApi<OrdersResponse>(url);

  const handleStatusChange = useCallback((val: string) => {
    setStatus(val);
    setPage(1);
  }, []);

  const handleSearch = useCallback((val: string) => {
    setSearch(val);
    setPage(1);
  }, []);

  const orders = data?.orders || [];
  const totalPages = data?.totalPages || 1;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full bg-white border border-[#E6E6E4] rounded-lg pl-9 pr-4 py-2 text-[13px] text-[#191919] placeholder-[#BBB] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => handleStatusChange(f.value)}
              className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all cursor-pointer ${
                status === f.value
                  ? "bg-[#4F46E5] text-white"
                  : "bg-[#F7F7F5] text-[#666] hover:bg-[#EFEFEF]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E6E6E4] overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-[#F7F7F5] rounded animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <p className="text-[13px] text-[#BBB] py-8 text-center">Aucune commande trouvée.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#EFEFEF]">
                  {["Produit", "Montant", "Statut", "Payé", "Date"].map((h) => (
                    <th key={h} className="text-left text-[11px] font-semibold text-[#999] uppercase tracking-wider px-5 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-[#F8F8FA] last:border-b-0 hover:bg-[#FBFBFA] transition-colors">
                    <td className="px-5 py-3 text-[13px] font-medium text-[#191919]">
                      {o.services?.title || o.title}
                    </td>
                    <td className="px-5 py-3 text-[13px] text-[#191919]">{o.amount}€</td>
                    <td className="px-5 py-3">
                      <BadgeStatus status={o.status as "new"} />
                    </td>
                    <td className="px-5 py-3 text-[13px]">
                      {o.paid ? (
                        <span className="text-emerald-600">Oui</span>
                      ) : (
                        <span className="text-[#999]">Non</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-[13px] text-[#999]">
                      {new Date(o.created_at).toLocaleDateString("fr-FR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1.5 text-[12px] rounded-lg border border-[#E6E6E4] text-[#666] hover:bg-[#F7F7F5] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Précédent
          </button>
          <span className="text-[12px] text-[#999]">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-3 py-1.5 text-[12px] rounded-lg border border-[#E6E6E4] text-[#666] hover:bg-[#F7F7F5] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}
