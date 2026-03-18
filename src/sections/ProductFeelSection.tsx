"use client";

import { motion } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 8 — "Intégration simple"
   3 onboarding steps
   ═══════════════════════════════════════════════════════════════════════ */

const ease = [0.22, 1, 0.36, 1] as const;

const ONBOARDING = [
  { step: "1", title: "Créez votre compte", description: "Inscription gratuite en 30 secondes. Aucune carte bancaire requise.", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" },
  { step: "2", title: "Ajoutez vos clients", description: "Importez votre base ou créez vos premiers contacts manuellement.", icon: "M12 5v14M5 12h14" },
  { step: "3", title: "Commencez à facturer", description: "Envoyez votre premier devis et suivez les paiements automatiquement.", icon: "M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" },
];

export default function ProductFeelSection() {
  return (
    <section className="relative py-24 sm:py-32 lg:py-36 px-6 overflow-hidden" style={{ background: "white" }}>
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{ backgroundImage: "linear-gradient(rgba(124,92,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(124,92,255,1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <motion.span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-semibold mb-5" style={{ background: "rgba(124,92,255,0.08)", color: "#7C5CFF", border: "1px solid rgba(124,92,255,0.12)" }} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease }}>
            Démarrage
          </motion.span>
          <motion.h2 className="text-[26px] sm:text-[36px] md:text-[44px] font-extrabold leading-[1.1] tracking-[-0.03em] mb-4" style={{ color: "#111118" }} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.08, ease }}>
            Prêt en<span className="bg-clip-text text-transparent ml-2" style={{ backgroundImage: "linear-gradient(135deg, #7C5CFF, #9F7BFF)" }}>3 étapes</span>
          </motion.h2>
          <motion.p className="text-[14px] sm:text-[16px] leading-relaxed max-w-lg mx-auto" style={{ color: "#66697A" }} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.16, ease }}>
            Pas de configuration complexe. Pas de formation nécessaire.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ONBOARDING.map((s, i) => (
            <motion.div
              key={s.step}
              className="relative rounded-[24px] p-6 sm:p-8 text-center group hover:-translate-y-1 transition-all duration-300"
              style={{ background: "#F7F7FB", border: "1px solid rgba(0,0,0,0.05)" }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12, ease }}
            >
              {/* Step number */}
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[18px] font-extrabold text-white" style={{ background: "linear-gradient(135deg, #7C5CFF, #6F5BFF)", boxShadow: "0 4px 16px rgba(124,92,255,0.25)" }}>
                {s.step}
              </div>

              <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(124,92,255,0.06)" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7C5CFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={s.icon} /></svg>
              </div>

              <h3 className="text-[15px] font-bold mb-2" style={{ color: "#111118" }}>{s.title}</h3>
              <p className="text-[12px] leading-relaxed" style={{ color: "#66697A" }}>{s.description}</p>

              {/* Arrow to next */}
              {i < ONBOARDING.length - 1 && (
                <div className="hidden md:block absolute -right-3.5 top-1/2 -translate-y-1/2 z-10">
                  <svg width="18" height="14" viewBox="0 0 18 14" fill="none"><path d="M0 7h14M12 3l4 4-4 4" stroke="rgba(124,92,255,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
