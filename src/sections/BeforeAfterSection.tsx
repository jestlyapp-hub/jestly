"use client";

import { motion } from "framer-motion";
import SectionShell from "@/components/landing/SectionShell";

/* ═══════════════════════════════════════════════════════════════════════
   AVANT / APRÈS — Editorial split with strong visual contrast
   Left panel: faded/messy. Right panel: clean/structured.
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
  { label: "Projets organisés", icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 14l2 2 4-4" },
  { label: "Historique client complet", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" },
  { label: "Facturation automatisée", icon: "M9 7h6m-6 4h6m-6 4h4M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" },
  { label: "Portfolio intégré", icon: "M3 3h18v18H3zM3 9h18M9 21V9" },
  { label: "Relances automatiques", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
];

export default function BeforeAfterSection() {
  return (
    <SectionShell atmosphere="contrast">
        {/* Header */}
        <div className="text-center mb-16 sm:mb-20">
          <motion.span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-semibold mb-6" style={{ background: "rgba(124,92,255,0.08)", color: "#7C5CFF", border: "1px solid rgba(124,92,255,0.12)" }} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease }}>
            Transformation
          </motion.span>
          <motion.h2 className="text-[28px] sm:text-[38px] md:text-[46px] font-extrabold leading-[1.08] tracking-[-0.03em]" style={{ color: "#111118" }} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.08, ease }}>
            Avant, c&apos;était le bazar.
            <br /><span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #7C5CFF, #9F7BFF)" }}>Maintenant, c&apos;est clair.</span>
          </motion.h2>
        </div>

        {/* Comparison container — single unified panel */}
        <motion.div
          className="rounded-[28px] overflow-hidden"
          style={{ background: "white", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 4px 32px rgba(0,0,0,0.04)" }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* ── BEFORE ── */}
            <div className="p-7 sm:p-10 relative" style={{ background: "rgba(0,0,0,0.015)" }}>
              {/* Subtle chaos lines */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.03] overflow-hidden">
                {[18, 38, 58, 78].map((t) => (
                  <div key={t} className="absolute w-full h-px" style={{ top: `${t}%`, background: "#EF4444", transform: `rotate(${(t % 3) - 1}deg)` }} />
                ))}
              </div>

              <div className="relative z-10">
                {/* Panel header */}
                <div className="flex items-center gap-2.5 mb-8 pb-5" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(239,68,68,0.08)" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                  </div>
                  <div>
                    <div className="text-[14px] font-bold" style={{ color: "#DC2626" }}>Avant</div>
                    <div className="text-[11px] font-medium" style={{ color: "#A8A8B3" }}>Outils dispersés, zéro visibilité</div>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2.5">
                  {BEFORE.map((item, i) => (
                    <motion.div
                      key={item.label}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-2xl"
                      style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.04)" }}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.2 + i * 0.05, ease }}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(0,0,0,0.03)" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C4C4CC" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon} /></svg>
                      </div>
                      <span className="text-[13px] font-medium" style={{ color: "#8A8A94" }}>{item.label}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Divider ── */}
            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2" style={{ background: "linear-gradient(to bottom, transparent 10%, rgba(124,92,255,0.12) 50%, transparent 90%)" }} />

            {/* ── AFTER ── */}
            <div className="p-7 sm:p-10 relative" style={{ borderTop: "1px solid rgba(0,0,0,0.04)" }}>
              {/* Panel header */}
              <div className="flex items-center gap-2.5 mb-8 pb-5" style={{ borderBottom: "1px solid rgba(124,92,255,0.08)" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(124,92,255,0.08)" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7C5CFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" /></svg>
                </div>
                <div>
                  <div className="text-[14px] font-bold" style={{ color: "#7C5CFF" }}>Avec Jestly</div>
                  <div className="text-[11px] font-medium" style={{ color: "#A8A8B3" }}>1 plateforme, vision complète</div>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-2.5">
                {AFTER.map((item, i) => (
                  <motion.div
                    key={item.label}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-2xl"
                    style={{ background: "rgba(124,92,255,0.025)", border: "1px solid rgba(124,92,255,0.06)" }}
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.3 + i * 0.05, ease }}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(16,185,129,0.07)" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon} /></svg>
                    </div>
                    <span className="text-[13px] font-semibold" style={{ color: "#111118" }}>{item.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
    </SectionShell>
  );
}
