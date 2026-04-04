"use client";

import { motion } from "framer-motion";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════════
   ABONNEMENT — Mode bêta full free
   Page simplifiée : tout est inclus, pas de pricing/upgrade.
   L'ancienne page complète est dans page.billing.tsx.bak
   ═══════════════════════════════════════════════════════════ */

export default function AbonnementPage() {
  return (
    <div className="max-w-[640px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <h1 className="text-[22px] font-bold text-[#191919] tracking-tight mb-1">Abonnement</h1>
        <p className="text-[13px] text-[#8A8A88] mb-8">
          Les abonnements arrivent bientôt. En attendant, profite de tout gratuitement.
        </p>

        {/* Beta card */}
        <div className="rounded-xl border border-[#DDD6FE] bg-gradient-to-r from-[#FAFAFF] to-[#F5F3FF] p-6">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#EEF2FF] flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-[16px] font-bold text-[#191919]">Bêta ouverte</h2>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#4F46E5] bg-[#EEF2FF] border border-[#DDD6FE] px-2.5 py-0.5 rounded-full">
                  Accès complet
                </span>
              </div>
              <p className="text-[13px] text-[#5A5A58] leading-relaxed mb-4">
                Pendant la bêta, toutes les fonctionnalités sont accessibles gratuitement et sans limite.
                Commandes, sites, projets, exports, analytics — tout est inclus.
              </p>

              {/* Features list */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Commandes illimitées",
                  "Sites illimités",
                  "Projets illimités",
                  "CRM complet",
                  "Analytics",
                  "Exports",
                  "Tâches & calendrier",
                  "Support",
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-[12px] text-[#5A5A58]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 rounded-lg border border-[#E6E6E4] bg-[#FBFBFA] p-4">
          <p className="text-[12px] text-[#8A8A88] leading-relaxed">
            Les abonnements payants seront disponibles prochainement.
            Tu seras prévenu par email avant tout changement.
            Tes données et ton travail seront conservés.
          </p>
        </div>

        {/* Link to support */}
        <p className="text-center text-[12px] text-[#8A8A88] mt-6">
          Une question ?{" "}
          <Link href="/support" className="text-[#4F46E5] hover:text-[#4338CA] font-medium transition-colors">
            Contacte le support
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
