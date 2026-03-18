"use client";

import { motion } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 3 — "Avant / Après"
   Split screen transformation
   ═══════════════════════════════════════════════════════════════════════ */

const ease = [0.22, 1, 0.36, 1] as const;

const BEFORE = [
  { icon: "M4 4h16v16H4zM4 12h16M12 4v16", label: "Notion pour les projets" },
  { icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z", label: "Mails pour les échanges" },
  { icon: "M22 12h-4l-3 9L9 3l-3 9H2", label: "Excel pour la compta" },
  { icon: "M3 3h18v18H3zM3 9h18", label: "Un site séparé" },
  { icon: "M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z", label: "Relances manuelles" },
];

const AFTER = [
  { label: "Projets organisés" },
  { label: "Historique client complet" },
  { label: "Facturation automatisée" },
  { label: "Portfolio intégré" },
  { label: "Relances automatiques" },
];

export default function PersonasSection() {
  return (
    <section className="relative py-24 sm:py-32 lg:py-36 px-6 overflow-hidden" style={{ background: "#F7F7FB" }}>
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(124,92,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(124,92,255,1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <motion.span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-semibold mb-5" style={{ background: "rgba(124,92,255,0.08)", color: "#7C5CFF", border: "1px solid rgba(124,92,255,0.12)" }} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease }}>
            Transformation
          </motion.span>
          <motion.h2 className="text-[26px] sm:text-[36px] md:text-[44px] font-extrabold leading-[1.1] tracking-[-0.03em] mb-4" style={{ color: "#111118" }} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.08, ease }}>
            Avant, c&apos;était le bazar.
            <br /><span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #7C5CFF, #9F7BFF)" }}>Maintenant, c&apos;est clair.</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Before */}
          <motion.div className="rounded-[24px] p-6 sm:p-8" style={{ background: "white", border: "1px solid rgba(0,0,0,0.06)" }} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease }}>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(239,68,68,0.08)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </div>
              <span className="text-[13px] font-bold uppercase tracking-wider" style={{ color: "#EF4444" }}>Avant</span>
            </div>
            <div className="space-y-3">
              {BEFORE.map((item, i) => (
                <motion.div key={item.label} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "#FAFAFA", border: "1px solid #F0F0EE" }} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.2 + i * 0.06, ease }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(239,68,68,0.06)" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#D4D4D8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon} /></svg>
                  </div>
                  <span className="text-[13px] font-medium" style={{ color: "#78716C" }}>{item.label}</span>
                </motion.div>
              ))}
            </div>
            <div className="mt-5 text-center"><span className="text-[12px] font-semibold px-3 py-1.5 rounded-lg" style={{ background: "rgba(239,68,68,0.06)", color: "#DC2626" }}>5+ outils, 0 visibilité</span></div>
          </motion.div>

          {/* After */}
          <motion.div className="rounded-[24px] p-6 sm:p-8" style={{ background: "white", border: "1px solid rgba(124,92,255,0.12)", boxShadow: "0 4px 24px rgba(124,92,255,0.06)" }} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1, ease }}>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(124,92,255,0.08)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7C5CFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" /></svg>
              </div>
              <span className="text-[13px] font-bold uppercase tracking-wider" style={{ color: "#7C5CFF" }}>Avec Jestly</span>
            </div>
            <div className="space-y-3">
              {AFTER.map((item, i) => (
                <motion.div key={item.label} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "rgba(124,92,255,0.03)", border: "1px solid rgba(124,92,255,0.08)" }} initial={{ opacity: 0, x: 12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.3 + i * 0.06, ease }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(16,185,129,0.08)" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4" /></svg>
                  </div>
                  <span className="text-[13px] font-semibold" style={{ color: "#111118" }}>{item.label}</span>
                </motion.div>
              ))}
            </div>
            <div className="mt-5 text-center"><span className="text-[12px] font-semibold px-3 py-1.5 rounded-lg" style={{ background: "rgba(124,92,255,0.08)", color: "#7C5CFF" }}>1 plateforme, vision complète</span></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
