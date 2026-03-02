"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import SlidePanel from "@/components/ui/SlidePanel";
import Tabs from "@/components/ui/Tabs";
import BadgeStatus from "@/components/ui/BadgeStatus";
import { useApi } from "@/lib/hooks/use-api";
import { clientRecordToClient, orderRecordToOrder } from "@/lib/adapters";
import { clients as mockClients, orders as mockOrders } from "@/lib/mock-data";
import type { Client } from "@/types";

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Client | null>(null);
  const [tab, setTab] = useState("Commandes");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rawClients, loading, error, mutate } = useApi<any[]>("/api/clients");
  const clients: Client[] = rawClients ? rawClients.map(clientRecordToClient) : mockClients;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rawOrders } = useApi<any[]>("/api/orders");
  const orders = rawOrders ? rawOrders.map(orderRecordToOrder) : mockOrders;

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  /* Commandes du client sélectionné */
  const clientOrders = selected
    ? orders.filter((o) => o.client === selected.name)
    : [];

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="h-8 w-32 bg-[#F7F7F5] rounded animate-pulse mb-6" />
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
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Clients</h1>
        <div className="relative max-w-xs w-full">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher un client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-[#E6E6E4] rounded-lg pl-9 pr-4 py-2.5 text-[13px] text-[#1A1A1A] placeholder-[#BBB] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all"
          />
        </div>
      </motion.div>

      {/* Client list */}
      <motion.div
        className="bg-white rounded-xl border border-[#E6E6E4] overflow-hidden"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#EFEFEF]">
                {["Client", "Email", "Commandes", "Revenu total", "Dernière commande"].map((h) => (
                  <th key={h} className="text-left text-[11px] font-semibold text-[#999] uppercase tracking-wider px-5 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((client) => (
                <tr
                  key={client.id}
                  onClick={() => { setSelected(client); setTab("Commandes"); }}
                  className="border-b border-[#F8F8FA] last:border-b-0 hover:bg-[#FBFBFA] transition-colors cursor-pointer"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#EEF2FF] flex items-center justify-center text-[11px] font-semibold text-[#4F46E5]">
                        {client.avatar}
                      </div>
                      <span className="text-[13px] font-medium text-[#1A1A1A]">
                        {client.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-[#999]">{client.email}</td>
                  <td className="px-5 py-3.5 text-[13px] text-[#1A1A1A]">{client.ordersCount}</td>
                  <td className="px-5 py-3.5 text-[13px] font-medium text-[#1A1A1A]">{client.totalRevenue} &euro;</td>
                  <td className="px-5 py-3.5 text-[13px] text-[#999]">{client.lastOrder}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-[14px] text-[#BBB]">
                    Aucun client trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Slide Panel — detail client */}
      <SlidePanel
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name ?? ""}
      >
        {selected && (
          <div className="space-y-6">
            {/* Header client */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#EEF2FF] flex items-center justify-center text-sm font-bold text-[#4F46E5]">
                {selected.avatar}
              </div>
              <div>
                <div className="text-[16px] font-bold text-[#1A1A1A]">{selected.name}</div>
                <div className="text-[13px] text-[#999]">{selected.email}</div>
              </div>
            </div>

            {/* Stats rapides */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#F7F7F5] rounded-lg p-3">
                <div className="text-[11px] text-[#999] uppercase tracking-wider mb-1">Revenu total</div>
                <div className="text-lg font-bold text-[#1A1A1A]">{selected.totalRevenue} &euro;</div>
              </div>
              <div className="bg-[#F7F7F5] rounded-lg p-3">
                <div className="text-[11px] text-[#999] uppercase tracking-wider mb-1">Commandes</div>
                <div className="text-lg font-bold text-[#1A1A1A]">{selected.ordersCount}</div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs tabs={["Commandes", "Notes"]} active={tab} onChange={setTab} />

            {tab === "Commandes" && (
              <div className="space-y-2">
                {clientOrders.length === 0 && (
                  <p className="text-[13px] text-[#BBB] py-4 text-center">Aucune commande.</p>
                )}
                {clientOrders.map((o) => (
                  <div
                    key={o.id}
                    className="flex items-center justify-between py-3 border-b border-[#EFEFEF] last:border-b-0"
                  >
                    <div>
                      <div className="text-[13px] font-medium text-[#1A1A1A]">{o.product}</div>
                      <div className="text-[11px] text-[#999]">{o.date}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[13px] font-medium text-[#1A1A1A]">{o.price} &euro;</span>
                      <BadgeStatus status={o.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === "Notes" && (
              <div className="py-4">
                <textarea
                  placeholder="Ajouter une note..."
                  className="w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg p-3 text-[13px] text-[#1A1A1A] placeholder-[#BBB] min-h-[120px] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 resize-none"
                />
              </div>
            )}
          </div>
        )}
      </SlidePanel>
    </div>
  );
}
