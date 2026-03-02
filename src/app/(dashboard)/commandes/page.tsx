"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import BadgeStatus from "@/components/ui/BadgeStatus";
import SlidePanel from "@/components/ui/SlidePanel";
import { orders } from "@/lib/mock-data";
import type { Order, OrderStatus } from "@/types";

const statusFilters: { label: string; value: OrderStatus | "all" }[] = [
  { label: "Toutes", value: "all" },
  { label: "En attente", value: "pending" },
  { label: "En cours", value: "in_progress" },
  { label: "Livree", value: "delivered" },
  { label: "Annulee", value: "cancelled" },
];

export default function CommandesPage() {
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Order | null>(null);

  const filtered = orders.filter((o) => {
    const matchStatus = filter === "all" || o.status === filter;
    const matchSearch =
      o.client.toLowerCase().includes(search.toLowerCase()) ||
      o.product.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Commandes</h1>
        <button className="flex items-center gap-1.5 bg-[#6a18f1] text-white text-[13px] font-semibold px-4 py-2.5 rounded-lg hover:bg-[#5a12d9] transition-colors self-start">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nouvelle commande
        </button>
      </motion.div>

      {/* Filters */}
      <motion.div
        className="flex flex-col sm:flex-row gap-3 mb-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08 }}
      >
        <div className="flex items-center gap-1 bg-white border border-[#E6E8F0] rounded-lg p-1">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-all cursor-pointer ${
                filter === f.value
                  ? "bg-[#F0EBFF] text-[#6a18f1]"
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
            placeholder="Filtrer par client ou produit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-[#E6E8F0] rounded-lg pl-9 pr-4 py-2.5 text-[13px] text-[#1A1A1A] placeholder-[#BBB] focus:outline-none focus:border-[#6a18f1]/30 focus:ring-1 focus:ring-[#6a18f1]/20 transition-all"
          />
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        className="bg-white rounded-xl border border-[#E6E8F0] overflow-hidden"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F0F0F5]">
                {["Ref", "Client", "Produit", "Prix", "Statut", "Date"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left text-[11px] font-semibold text-[#999] uppercase tracking-wider px-5 py-3"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => setSelected(order)}
                  className="border-b border-[#F8F8FA] last:border-b-0 hover:bg-[#FAFBFD] transition-colors cursor-pointer"
                >
                  <td className="px-5 py-3.5 text-[12px] font-mono text-[#999]">
                    {order.id}
                  </td>
                  <td className="px-5 py-3.5 text-[13px] font-medium text-[#1A1A1A]">
                    {order.client}
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-[#666]">
                    {order.product}
                  </td>
                  <td className="px-5 py-3.5 text-[13px] font-medium text-[#1A1A1A]">
                    {order.price} &euro;
                  </td>
                  <td className="px-5 py-3.5">
                    <BadgeStatus status={order.status} />
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-[#999]">
                    {order.date}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-[14px] text-[#BBB]"
                  >
                    Aucune commande trouvee.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Slide Panel — detail commande */}
      <SlidePanel
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `Commande ${selected.id}` : ""}
      >
        {selected && (
          <div className="space-y-6">
            <div>
              <div className="text-[11px] font-semibold text-[#999] uppercase tracking-wider mb-1">
                Client
              </div>
              <div className="text-[15px] font-semibold text-[#1A1A1A]">
                {selected.client}
              </div>
              <div className="text-[13px] text-[#999]">{selected.clientEmail}</div>
            </div>
            <div className="h-px bg-[#E6E8F0]" />
            <div>
              <div className="text-[11px] font-semibold text-[#999] uppercase tracking-wider mb-1">
                Produit
              </div>
              <div className="text-[14px] text-[#1A1A1A]">{selected.product}</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[11px] font-semibold text-[#999] uppercase tracking-wider mb-1">
                  Prix
                </div>
                <div className="text-xl font-bold text-[#1A1A1A]">
                  {selected.price} &euro;
                </div>
              </div>
              <div>
                <div className="text-[11px] font-semibold text-[#999] uppercase tracking-wider mb-1">
                  Statut
                </div>
                <BadgeStatus status={selected.status} />
              </div>
            </div>
            <div className="h-px bg-[#E6E8F0]" />
            <div>
              <div className="text-[11px] font-semibold text-[#999] uppercase tracking-wider mb-1">
                Date
              </div>
              <div className="text-[14px] text-[#1A1A1A]">{selected.date}</div>
            </div>
            <div className="flex gap-3 pt-4">
              <button className="flex-1 bg-[#6a18f1] text-white text-[13px] font-semibold py-2.5 rounded-lg hover:bg-[#5a12d9] transition-colors">
                Marquer livree
              </button>
              <button className="flex-1 border border-[#E6E8F0] text-[#666] text-[13px] font-semibold py-2.5 rounded-lg hover:bg-[#F8F9FC] transition-colors">
                Modifier
              </button>
            </div>
          </div>
        )}
      </SlidePanel>
    </div>
  );
}
