"use client";

import { motion } from "framer-motion";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════════
   TARIFS — Mode bêta : tout inclus, pas de pricing visible
   L'ancienne page complète est dans page.pricing.tsx.bak
   ═══════════════════════════════════════════════════════════ */

const ease = [0.22, 1, 0.36, 1] as const;

export default function TarifsPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Fond */}
      <div className="fixed inset-0 -z-20 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #F8F8FC 0%, #F4F3FA 100%)" }} />
        <div className="absolute top-[-10%] right-[5%] w-[900px] h-[900px] rounded-full" style={{ background: "radial-gradient(450px circle, rgba(124,92,255,0.06), transparent 70%)" }} />
      </div>

      <main className="pt-32 sm:pt-40 pb-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] px-4 py-1.5 rounded-full mb-6"
            style={{ color: "#7C5CFF", background: "rgba(124,92,255,0.08)" }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#7C5CFF]" />
            Bêta ouverte
          </motion.div>

          {/* Titre */}
          <motion.h1
            className="text-[28px] sm:text-[40px] md:text-[48px] font-extrabold leading-[1.08] tracking-[-0.03em] text-[#111118] mb-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease }}
          >
            Tout est inclus.
            <br />
            <span style={{ color: "#7C5CFF" }}>Gratuitement.</span>
          </motion.h1>

          <motion.p
            className="text-[16px] sm:text-[18px] text-[#5B6270] leading-relaxed max-w-lg mx-auto mb-10"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease }}
          >
            Pendant la bêta, toutes les fonctionnalités de Jestly sont accessibles
            sans limite et sans carte bancaire. Les abonnements payants arriveront prochainement.
          </motion.p>

          {/* Card bêta */}
          <motion.div
            className="bg-white rounded-2xl border border-[#E8E5F5] shadow-sm p-8 mb-8 text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl bg-[#EEF2FF] flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <div>
                <h2 className="text-[18px] font-bold text-[#111118]">Accès complet bêta</h2>
                <p className="text-[13px] text-[#8A8A88]">Toutes les fonctionnalités, sans limite</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                "Commandes illimitées",
                "Sites illimités",
                "Projets illimités",
                "CRM complet",
                "Analytics",
                "Exports",
                "Tâches & calendrier",
                "Facturation",
                "Support",
              ].map((f) => (
                <div key={f} className="flex items-center gap-2 text-[13px] text-[#5A5A58]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {f}
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4, ease }}
          >
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-[15px] font-semibold text-white transition-all hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, #7C5CFF 0%, #9B7EFF 100%)", boxShadow: "0 8px 30px rgba(124,92,255,0.3)" }}
            >
              Commencer gratuitement
            </Link>
            <p className="text-[12px] text-[#8A8A88] mt-4">
              Sans carte bancaire. Les abonnements seront disponibles prochainement.
            </p>
          </motion.div>

          {/* Info */}
          <motion.div
            className="mt-12 rounded-xl border border-[#E6E6E4] bg-white/60 p-5 text-[13px] text-[#8A8A88] leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            Les abonnements payants (Starter, Pro, Business) seront disponibles
            lors du lancement officiel. Vous serez prévenu par email avant tout changement.
            Vos données et votre travail seront conservés.
          </motion.div>
        </div>
      </main>
    </div>
  );
}
