"use client";

import { motion } from "framer-motion";

export default function ParametresPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <motion.h1
        className="text-2xl font-bold text-[#1A1A1A] mb-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        Paramètres
      </motion.h1>

      <div className="space-y-8">
        {/* Profil */}
        <motion.section
          className="bg-white rounded-xl border border-[#E6E8F0] p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.06 }}
        >
          <h2 className="text-[15px] font-semibold text-[#1A1A1A] mb-5">Profil</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-[#999] mb-1.5">Prénom</label>
              <input
                type="text"
                defaultValue="Gabriel"
                className="w-full bg-[#F8F9FC] border border-[#E6E8F0] rounded-lg px-4 py-2.5 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#6a18f1]/30 focus:ring-1 focus:ring-[#6a18f1]/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#999] mb-1.5">Nom</label>
              <input
                type="text"
                defaultValue="Briau"
                className="w-full bg-[#F8F9FC] border border-[#E6E8F0] rounded-lg px-4 py-2.5 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#6a18f1]/30 focus:ring-1 focus:ring-[#6a18f1]/20 transition-all"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[12px] font-medium text-[#999] mb-1.5">Email</label>
              <input
                type="email"
                defaultValue="gabriel@jestly.fr"
                className="w-full bg-[#F8F9FC] border border-[#E6E8F0] rounded-lg px-4 py-2.5 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#6a18f1]/30 focus:ring-1 focus:ring-[#6a18f1]/20 transition-all"
              />
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <button className="bg-[#6a18f1] text-white text-[13px] font-semibold px-5 py-2.5 rounded-lg hover:bg-[#5a12d9] transition-colors">
              Sauvegarder
            </button>
          </div>
        </motion.section>

        {/* Abonnement */}
        <motion.section
          className="bg-white rounded-xl border border-[#E6E8F0] p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12 }}
        >
          <h2 className="text-[15px] font-semibold text-[#1A1A1A] mb-4">Abonnement</h2>
          <div className="flex items-center justify-between p-4 bg-[#F0EBFF] rounded-lg">
            <div>
              <div className="text-[14px] font-semibold text-[#6a18f1]">Plan Pro</div>
              <div className="text-[12px] text-[#6a18f1]/60">7 &euro;/mois &middot; Renouvellement le 15 avril 2025</div>
            </div>
            <button className="text-[12px] font-medium text-[#6a18f1] hover:underline">
              Gérer
            </button>
          </div>
        </motion.section>

        {/* Intégrations */}
        <motion.section
          className="bg-white rounded-xl border border-[#E6E8F0] p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.18 }}
        >
          <h2 className="text-[15px] font-semibold text-[#1A1A1A] mb-5">Intégrations</h2>
          <div className="space-y-3">
            {[
              { name: "Stripe", desc: "Paiements en ligne", connected: true },
              { name: "Google Calendar", desc: "Synchronisation agenda", connected: false },
              { name: "Apple Calendar", desc: "Synchronisation agenda", connected: false },
            ].map((integration) => (
              <div
                key={integration.name}
                className="flex items-center justify-between p-4 border border-[#E6E8F0] rounded-lg"
              >
                <div>
                  <div className="text-[13px] font-semibold text-[#1A1A1A]">{integration.name}</div>
                  <div className="text-[12px] text-[#999]">{integration.desc}</div>
                </div>
                {integration.connected ? (
                  <span className="text-[12px] font-medium text-emerald-500">Connecté</span>
                ) : (
                  <button className="text-[12px] font-medium text-[#6a18f1] border border-[#6a18f1]/20 px-3 py-1.5 rounded-lg hover:bg-[#F0EBFF] transition-colors">
                    Connecter
                  </button>
                )}
              </div>
            ))}
          </div>
        </motion.section>

        {/* Zone danger */}
        <motion.section
          className="bg-white rounded-xl border border-red-100 p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.24 }}
        >
          <h2 className="text-[15px] font-semibold text-red-500 mb-2">Zone dangereuse</h2>
          <p className="text-[13px] text-[#999] mb-4">
            Supprimer définitivement votre compte et toutes vos données.
          </p>
          <button className="text-[12px] font-medium text-red-500 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors">
            Supprimer mon compte
          </button>
        </motion.section>
      </div>
    </div>
  );
}
