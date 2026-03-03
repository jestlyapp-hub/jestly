"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import BadgeStatus from "@/components/ui/BadgeStatus";
import SlidePanel from "@/components/ui/SlidePanel";
import { useApi, apiFetch } from "@/lib/hooks/use-api";
import { orderRecordToOrder } from "@/lib/adapters";
import type { Order, OrderStatus } from "@/types";

const statusFilters: { label: string; value: OrderStatus | "all" }[] = [
  { label: "Toutes", value: "all" },
  { label: "Nouveau", value: "new" },
  { label: "En cours", value: "in_progress" },
  { label: "Valide", value: "validated" },
  { label: "Annule", value: "cancelled" },
];

export default function SiteCommandesPage() {
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Order | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rawOrders, loading, error, mutate } = useApi<any[]>("/api/orders?source=site");
  const orders: Order[] = rawOrders ? rawOrders.map(orderRecordToOrder) : [];

  const filtered = orders.filter((o) => {
    const matchStatus = filter === "all" || o.status === filter;
    const matchSearch =
      o.client.toLowerCase().includes(search.toLowerCase()) ||
      o.product.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const markDelivered = async (orderId: string) => {
    await apiFetch(`/api/orders/${orderId}`, { method: "PATCH", body: { status: "delivered" } });
    setSelected(null);
    mutate();
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl border border-[#E6E6E4] p-4 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-[#F7F7F5] rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto py-12 text-center">
        <p className="text-[14px] text-red-500 mb-2">Erreur : {error}</p>
        <button onClick={mutate} className="text-[13px] text-[#4F46E5] hover:underline">Réessayer</button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Filters */}
      <motion.div
        className="flex flex-col sm:flex-row gap-3 mb-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-1 bg-white border border-[#E6E6E4] rounded-lg p-1">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-all cursor-pointer ${
                filter === f.value
                  ? "bg-[#EEF2FF] text-[#4F46E5]"
                  : "text-[#999] hover:text-[#666]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Filtrer par client ou service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-[#E6E6E4] rounded-lg pl-9 pr-4 py-2.5 text-[13px] text-[#1A1A1A] placeholder-[#BBB] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all"
          />
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        className="bg-white rounded-xl border border-[#E6E6E4] overflow-hidden"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08 }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#EFEFEF]">
                {["Ref", "Client", "Service", "Prix", "Statut", "Date"].map((h) => (
                  <th key={h} className="text-left text-[11px] font-semibold text-[#999] uppercase tracking-wider px-5 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => setSelected(order)}
                  className="border-b border-[#F8F8FA] last:border-b-0 hover:bg-[#FBFBFA] transition-colors cursor-pointer"
                >
                  <td className="px-5 py-3.5 text-[12px] font-mono text-[#999]">{order.id.slice(0, 8)}</td>
                  <td className="px-5 py-3.5 text-[13px] font-medium text-[#1A1A1A]">{order.client}</td>
                  <td className="px-5 py-3.5 text-[13px] text-[#666]">{order.product}</td>
                  <td className="px-5 py-3.5 text-[13px] font-medium text-[#1A1A1A]">{order.price} &euro;</td>
                  <td className="px-5 py-3.5"><BadgeStatus status={order.status} /></td>
                  <td className="px-5 py-3.5 text-[13px] text-[#999]">{order.date}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-[14px] text-[#BBB]">
                    Aucune commande trouvée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Slide Panel */}
      <SlidePanel open={!!selected} onClose={() => setSelected(null)} title={selected ? `Commande ${selected.id.slice(0, 8)}` : ""}>
        {selected && (
          <div className="space-y-6">
            <div>
              <div className="text-[11px] font-semibold text-[#999] uppercase tracking-wider mb-1">Client</div>
              <div className="text-[15px] font-semibold text-[#1A1A1A]">{selected.client}</div>
              <div className="text-[13px] text-[#999]">{selected.clientEmail}</div>
            </div>
            <div className="h-px bg-[#E6E6E4]" />
            <div>
              <div className="text-[11px] font-semibold text-[#999] uppercase tracking-wider mb-1">Service</div>
              <div className="text-[14px] text-[#1A1A1A]">{selected.product}</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[11px] font-semibold text-[#999] uppercase tracking-wider mb-1">Prix</div>
                <div className="text-xl font-bold text-[#1A1A1A]">{selected.price} &euro;</div>
              </div>
              <div>
                <div className="text-[11px] font-semibold text-[#999] uppercase tracking-wider mb-1">Statut</div>
                <BadgeStatus status={selected.status} />
              </div>
            </div>
            <div className="h-px bg-[#E6E6E4]" />
            <div>
              <div className="text-[11px] font-semibold text-[#999] uppercase tracking-wider mb-1">Date</div>
              <div className="text-[14px] text-[#1A1A1A]">{selected.date}</div>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => markDelivered(selected.id)}
                className="flex-1 bg-[#4F46E5] text-white text-[13px] font-semibold py-2.5 rounded-lg hover:bg-[#4338CA] transition-colors"
              >
                Marquer livrée
              </button>
              <button className="flex-1 border border-[#E6E6E4] text-[#666] text-[13px] font-semibold py-2.5 rounded-lg hover:bg-[#F7F7F5] transition-colors">
                Modifier
              </button>
            </div>
          </div>
        )}
      </SlidePanel>
    </div>
  );
}
