"use client";

import { motion } from "framer-motion";
import { activities } from "@/lib/mock-data";

type ActivityType = "order" | "payment" | "client" | "delivery" | "invoice";

const iconConfig: Record<ActivityType, { bg: string; color: string }> = {
  order: { bg: "bg-[#EEF2FF]", color: "text-[#4F46E5]" },
  payment: { bg: "bg-emerald-50", color: "text-emerald-600" },
  client: { bg: "bg-blue-50", color: "text-blue-600" },
  delivery: { bg: "bg-teal-50", color: "text-teal-600" },
  invoice: { bg: "bg-amber-50", color: "text-amber-600" },
};

function getIcon(type: ActivityType) {
  switch (type) {
    case "order":
      return (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      );
    case "payment":
      return (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
        </svg>
      );
    case "client":
      return (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      );
    case "delivery":
      return (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "invoice":
      return (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      );
  }
}

function getAllActivities() {
  const extra = [
    { id: 6, type: "order", message: "Commande CMD-005 mise a jour", time: "il y a 8h" },
    { id: 7, type: "payment", message: "Paiement recu — 680 EUR", time: "il y a 1j" },
    { id: 8, type: "invoice", message: "Facture FAC-2025-045 envoyee", time: "il y a 2j" },
  ];
  return [...activities, ...extra].slice(0, 8);
}

export default function ActivityFeed() {
  const items = getAllActivities();

  return (
    <div className="bg-white rounded-xl border border-[#E6E6E4]">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#E6E6E4] flex items-center justify-between">
        <h2 className="text-[14px] font-semibold text-[#1A1A1A]">Activite recente</h2>
        <a href="/commandes" className="text-[12px] font-medium text-[#4F46E5] hover:underline">
          Tout voir
        </a>
      </div>

      {/* Timeline */}
      <div className="p-5">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[13px] top-4 bottom-4 w-px bg-[#E6E6E4]" />

          <div className="space-y-1">
            {items.map((item, i) => {
              const type = (item.type as ActivityType) || "order";
              const cfg = iconConfig[type] || iconConfig.order;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-[#FBFBFA] transition-colors relative"
                >
                  {/* Icon */}
                  <div className={`w-[26px] h-[26px] rounded-full flex items-center justify-center shrink-0 z-10 ${cfg.bg} ${cfg.color}`}>
                    {getIcon(type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-[13px] text-[#1A1A1A] leading-snug">{item.message}</p>
                    <p className="text-[11px] text-[#BBB] mt-0.5">{item.time}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
