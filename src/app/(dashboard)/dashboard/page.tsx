"use client";

import { motion } from "framer-motion";
import StatCard from "@/components/ui/StatCard";
import BadgeStatus from "@/components/ui/BadgeStatus";
import { orders, activities } from "@/lib/mock-data";

const stats = [
  { label: "Revenu du mois", value: "3 920 \u20ac", change: "+14 % vs mois dernier", positive: true },
  { label: "Commandes actives", value: "5", change: "+2 cette semaine", positive: true },
  { label: "Clients actifs", value: "6", change: "+1 ce mois", positive: true },
  { label: "Taux conversion", value: "68 %", change: "-3 % vs mois dernier", positive: false },
];

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const, delay: i * 0.06 },
  }),
};

export default function DashboardPage() {
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Bonjour Gabriel</h1>
        <p className="text-[14px] text-[#999] mt-1">
          Voici un apercu de votre activite.
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            variants={fadeIn}
            custom={i}
            initial="hidden"
            animate="visible"
          >
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      {/* Main content — orders + activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Commandes recentes */}
        <motion.div
          className="lg:col-span-2 bg-white rounded-xl border border-[#E6E8F0]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <div className="px-5 py-4 border-b border-[#E6E8F0] flex items-center justify-between">
            <h2 className="text-[14px] font-semibold text-[#1A1A1A]">
              Commandes recentes
            </h2>
            <a
              href="/commandes"
              className="text-[12px] font-medium text-[#6a18f1] hover:underline"
            >
              Tout voir
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F0F0F5]">
                  <th className="text-left text-[11px] font-semibold text-[#999] uppercase tracking-wider px-5 py-3">
                    Client
                  </th>
                  <th className="text-left text-[11px] font-semibold text-[#999] uppercase tracking-wider px-5 py-3">
                    Produit
                  </th>
                  <th className="text-left text-[11px] font-semibold text-[#999] uppercase tracking-wider px-5 py-3">
                    Prix
                  </th>
                  <th className="text-left text-[11px] font-semibold text-[#999] uppercase tracking-wider px-5 py-3">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-[#F8F8FA] last:border-b-0 hover:bg-[#FAFBFD] transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="text-[13px] font-medium text-[#1A1A1A]">
                        {order.client}
                      </div>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Activite recente */}
        <motion.div
          className="bg-white rounded-xl border border-[#E6E8F0]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
        >
          <div className="px-5 py-4 border-b border-[#E6E8F0]">
            <h2 className="text-[14px] font-semibold text-[#1A1A1A]">
              Activite
            </h2>
          </div>
          <div className="p-4">
            {activities.map((a) => (
              <div
                key={a.id}
                className="flex items-start gap-3 py-3 border-b border-[#F8F8FA] last:border-b-0"
              >
                <div className="w-2 h-2 rounded-full bg-[#6a18f1] mt-1.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-[#1A1A1A] leading-snug">
                    {a.message}
                  </p>
                  <p className="text-[11px] text-[#BBB] mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
