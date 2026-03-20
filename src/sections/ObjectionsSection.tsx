"use client";

import { motion } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 7 — "Fonctionnalités clés"
   Feature grid (6 features — 3 rows × 2 cols)
   ═══════════════════════════════════════════════════════════════════════ */

const ease = [0.22, 1, 0.36, 1] as const;

const FEATURES = [
  { icon: "M3 3h18v18H3zM3 9h18M9 21V9", title: "Site web", desc: "Votre vitrine en ligne reliée à votre business.", color: "#3B82F6" },
  { icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z", title: "CRM clients", desc: "Gérez vos clients, prospects et historique complet.", color: "#7C5CFF" },
  { icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z", title: "Agenda", desc: "Planning, RDV et deadlines synchronisés.", color: "#F59E0B" },
  { icon: "M9 7h6m-6 4h6m-6 4h4M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z", title: "Facturation", desc: "Devis, factures et suivi des paiements automatisés.", color: "#10B981" },
  { icon: "M18 20V10M12 20V4M6 20v-6", title: "Analytics", desc: "Revenus, tendances et KPIs en temps réel.", color: "#8B5CF6" },
  { icon: "M9 5H2v7l6.29 6.29a1 1 0 0 0 1.42 0l5.58-5.58a1 1 0 0 0 0-1.42zM6 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2", title: "Commandes", desc: "Pipeline complet du brief à la livraison.", color: "#F59E0B" },
];

export default function ObjectionsSection() {
  return (
    <section className="relative py-24 sm:py-32 lg:py-36 px-6 overflow-hidden" style={{ background: "#F7F7FB" }}>
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(124,92,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(124,92,255,1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <motion.span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-semibold mb-5" style={{ background: "rgba(124,92,255,0.08)", color: "#7C5CFF", border: "1px solid rgba(124,92,255,0.12)" }} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease }}>
            Fonctionnalités
          </motion.span>
          <motion.h2 className="text-[26px] sm:text-[36px] md:text-[44px] font-extrabold leading-[1.1] tracking-[-0.03em] mb-4" style={{ color: "#111118" }} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.08, ease }}>
            Tout ce qu&apos;il faut,
            <span className="bg-clip-text text-transparent ml-2" style={{ backgroundImage: "linear-gradient(135deg, #7C5CFF, #9F7BFF)" }}>rien de plus</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              className="rounded-[20px] p-5 sm:p-6 group hover:-translate-y-1 transition-all duration-300"
              style={{ background: "white", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.06, ease }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${f.color}08` }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={f.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={f.icon} /></svg>
              </div>
              <h3 className="text-[14px] font-bold mb-1" style={{ color: "#111118" }}>{f.title}</h3>
              <p className="text-[12px] leading-relaxed" style={{ color: "#66697A" }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
