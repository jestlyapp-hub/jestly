"use client";

import { useState } from "react";
import { motion } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 2 — "Modules connectés"
   Central hub with surrounding modules + connection lines
   ═══════════════════════════════════════════════════════════════════════ */

const ease = [0.22, 1, 0.36, 1] as const;

const MODULES = [
  { id: "crm", label: "CRM", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z", desc: "Clients, prospects et historique complet.", color: "#7C5CFF" },
  { id: "invoicing", label: "Facturation", icon: "M9 7h6m-6 4h6m-6 4h4M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z", desc: "Devis, factures et suivi paiements.", color: "#10B981" },
  { id: "site", label: "Site web", icon: "M3 3h18v18H3zM3 9h18M9 21V9", desc: "Portfolio relié à votre activité.", color: "#3B82F6" },
  { id: "agenda", label: "Agenda", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z", desc: "Planning et deadlines synchronisés.", color: "#F59E0B" },
  { id: "analytics", label: "Analytics", icon: "M18 20V10M12 20V4M6 20v-6", desc: "Revenus et tendances en temps réel.", color: "#8B5CF6" },
  { id: "orders", label: "Commandes", icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2", desc: "Projets, briefs et livrables.", color: "#FF6B35" },
];

export default function ReplacementToolsSection() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section className="relative py-24 sm:py-32 lg:py-36 px-6 overflow-hidden" style={{ background: "white" }}>
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{ backgroundImage: "linear-gradient(rgba(124,92,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(124,92,255,1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <motion.span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-semibold mb-5" style={{ background: "rgba(124,92,255,0.08)", color: "#7C5CFF", border: "1px solid rgba(124,92,255,0.12)" }} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease }}>
            Écosystème
          </motion.span>
          <motion.h2 className="text-[26px] sm:text-[36px] md:text-[44px] font-extrabold leading-[1.1] tracking-[-0.03em] mb-4" style={{ color: "#111118" }} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.08, ease }}>
            Tout est<span className="bg-clip-text text-transparent ml-2" style={{ backgroundImage: "linear-gradient(135deg, #7C5CFF, #9F7BFF)" }}>connecté</span>
          </motion.h2>
          <motion.p className="text-[14px] sm:text-[16px] leading-relaxed max-w-lg mx-auto" style={{ color: "#66697A" }} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.16, ease }}>
            Chaque module parle aux autres. Un client créé se retrouve dans vos factures, vos projets et votre portfolio.
          </motion.p>
        </div>

        {/* Hub + modules */}
        <div className="relative max-w-3xl mx-auto">
          {/* Center hub */}
          <motion.div
            className="mx-auto w-24 h-24 sm:w-28 sm:h-28 rounded-3xl flex flex-col items-center justify-center mb-10 relative z-10"
            style={{ background: "linear-gradient(135deg, #7C5CFF, #6F5BFF)", boxShadow: "0 8px 40px rgba(124,92,255,0.25)" }}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
          >
            <span className="text-[18px] sm:text-[20px] font-extrabold text-white">Jestly</span>
            <span className="text-[10px] font-medium text-white/60 mt-0.5">Tout-en-un</span>
          </motion.div>

          {/* Modules grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5">
            {MODULES.map((mod, i) => {
              const isActive = hovered === mod.id;
              return (
                <motion.div
                  key={mod.id}
                  className="rounded-[20px] p-5 text-center cursor-default transition-all duration-300"
                  style={{
                    background: isActive ? `${mod.color}06` : "white",
                    border: isActive ? `1px solid ${mod.color}20` : "1px solid rgba(0,0,0,0.06)",
                    boxShadow: isActive ? `0 8px 24px ${mod.color}10` : "0 2px 8px rgba(0,0,0,0.02)",
                  }}
                  onMouseEnter={() => setHovered(mod.id)}
                  onMouseLeave={() => setHovered(null)}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 + i * 0.08, ease }}
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: `${mod.color}08` }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={mod.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={mod.icon} /></svg>
                  </div>
                  <div className="text-[14px] font-bold mb-1" style={{ color: "#111118" }}>{mod.label}</div>
                  <div className="text-[11px] leading-relaxed" style={{ color: "#8A8FA3" }}>{mod.desc}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
