"use client";

import { motion } from "framer-motion";
import BadgeStatus from "@/components/ui/BadgeStatus";
import { invoices } from "@/lib/mock-data";

export default function FacturationPage() {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Facturation</h1>
        <button className="flex items-center gap-1.5 bg-[#4F46E5] text-white text-[13px] font-semibold px-4 py-2.5 rounded-lg hover:bg-[#4338CA] transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nouvelle facture
        </button>
      </motion.div>

      {/* Table */}
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
                {["Numéro", "Client", "Montant", "Statut", "Date", ""].map((h) => (
                  <th key={h} className="text-left text-[11px] font-semibold text-[#999] uppercase tracking-wider px-5 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr
                  key={inv.id}
                  className="border-b border-[#F8F8FA] last:border-b-0 hover:bg-[#FBFBFA] transition-colors"
                >
                  <td className="px-5 py-3.5 text-[13px] font-mono text-[#666]">
                    {inv.number}
                  </td>
                  <td className="px-5 py-3.5 text-[13px] font-medium text-[#1A1A1A]">
                    {inv.client}
                  </td>
                  <td className="px-5 py-3.5 text-[13px] font-medium text-[#1A1A1A]">
                    {inv.amount} &euro;
                  </td>
                  <td className="px-5 py-3.5">
                    <BadgeStatus status={inv.status} />
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-[#999]">
                    {inv.date}
                  </td>
                  <td className="px-5 py-3.5">
                    <button className="text-[12px] text-[#4F46E5] font-medium hover:underline">
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
