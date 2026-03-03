"use client";

import { motion } from "framer-motion";

export default function AbonnementsPage() {
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

      {/* Empty state */}
      <motion.div
        className="bg-white rounded-xl border border-[#E6E6E4] py-16 text-center"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="w-12 h-12 rounded-xl bg-[#F7F7F5] flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
            <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
            <path d="M18 12a2 2 0 0 0 0 4h4v-4z" />
          </svg>
        </div>
        <p className="text-[14px] text-[#999]">Aucun abonnement pour le moment.</p>
        <p className="text-[12px] text-[#BBB] mt-1">Les abonnements récurrents seront disponibles prochainement.</p>
      </motion.div>
    </div>
  );
}
