"use client";

import { motion } from "framer-motion";
import StatCard from "@/components/ui/StatCard";
import BadgeStatus from "@/components/ui/BadgeStatus";
import { subscriptions } from "@/lib/mock-data";

export default function AbonnementsPage() {
  const activeCount = subscriptions.filter((s) => s.status === "active").length;
  const mrr = subscriptions
    .filter((s) => s.status === "active")
    .reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <motion.h1
        className="text-2xl font-bold text-[#1A1A1A] mb-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        Abonnements
      </motion.h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.06 }}>
          <StatCard label="MRR" value={`${mrr} \u20ac`} change="+8 % ce mois" positive />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.12 }}>
          <StatCard label="Abonnés actifs" value={String(activeCount)} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.18 }}>
          <StatCard label="Panier moyen" value={`${Math.round(mrr / activeCount)} \u20ac`} />
        </motion.div>
      </div>

      {/* Table */}
      <motion.div
        className="bg-white rounded-xl border border-[#E6E8F0] overflow-hidden"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F0F0F5]">
                {["Client", "Plan", "Montant", "Statut", "Prochain paiement"].map((h) => (
                  <th key={h} className="text-left text-[11px] font-semibold text-[#999] uppercase tracking-wider px-5 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub) => (
                <tr
                  key={sub.id}
                  className="border-b border-[#F8F8FA] last:border-b-0 hover:bg-[#FAFBFD] transition-colors"
                >
                  <td className="px-5 py-3.5 text-[13px] font-medium text-[#1A1A1A]">
                    {sub.client}
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-[#666]">
                    {sub.plan}
                  </td>
                  <td className="px-5 py-3.5 text-[13px] font-medium text-[#1A1A1A]">
                    {sub.amount} &euro;/mois
                  </td>
                  <td className="px-5 py-3.5">
                    <BadgeStatus status={sub.status} />
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-[#999]">
                    {sub.nextBilling}
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
