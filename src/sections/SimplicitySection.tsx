"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 5 — "Cas d'usage"
   Persona cards with use cases
   ═══════════════════════════════════════════════════════════════════════ */

const ease = [0.22, 1, 0.36, 1] as const;

const PERSONAS = [
  { id: "designer", emoji: "🎨", role: "Designer", pain: "Devis, maquettes et retours clients dispersés", solved: "Suivi projet + facturation + portfolio unifié", modules: ["CRM", "Devis", "Portfolio"], color: "#7C5CFF" },
  { id: "dev", emoji: "💻", role: "Développeur", pain: "Trop d'outils pour gérer les missions", solved: "Sprints, facturation et CRM dans un seul espace", modules: ["Projets", "CRM", "Analytics"], color: "#3B82F6" },
  { id: "video", emoji: "🎬", role: "Vidéaste", pain: "Briefs perdus dans les mails, relances oubliées", solved: "Briefs centralisés, relances auto, deadlines claires", modules: ["Briefs", "Planning", "Factures"], color: "#FF6B35" },
  { id: "consultant", emoji: "📊", role: "Consultant", pain: "Suivi missions / heures / facturation trop manuel", solved: "Suivi missions + facturation auto + reporting", modules: ["Suivi", "Factures", "Reporting"], color: "#10B981" },
];

export default function SimplicitySection() {
  const [active, setActive] = useState(PERSONAS[0].id);
  const persona = PERSONAS.find((p) => p.id === active) || PERSONAS[0];

  return (
    <section className="relative py-24 sm:py-32 lg:py-36 px-6 overflow-hidden" style={{ background: "#F7F7FB" }}>
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(124,92,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(124,92,255,1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <motion.span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-semibold mb-5" style={{ background: "rgba(124,92,255,0.08)", color: "#7C5CFF", border: "1px solid rgba(124,92,255,0.12)" }} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease }}>
            Cas d&apos;usage
          </motion.span>
          <motion.h2 className="text-[26px] sm:text-[36px] md:text-[44px] font-extrabold leading-[1.1] tracking-[-0.03em] mb-4" style={{ color: "#111118" }} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.08, ease }}>
            Pensé pour<span className="bg-clip-text text-transparent ml-2" style={{ backgroundImage: "linear-gradient(135deg, #7C5CFF, #9F7BFF)" }}>votre métier</span>
          </motion.h2>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {PERSONAS.map((p) => (
            <button key={p.id} onClick={() => setActive(p.id)} className="px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-[#7C5CFF]/40" style={{ background: active === p.id ? `${p.color}08` : "white", color: active === p.id ? p.color : "#78716C", border: active === p.id ? `1px solid ${p.color}20` : "1px solid rgba(0,0,0,0.06)" }}>
              <span className="mr-1.5">{p.emoji}</span>{p.role}
            </button>
          ))}
        </div>

        {/* Panel */}
        <AnimatePresence mode="wait">
          <motion.div key={persona.id} className="rounded-[24px] p-6 sm:p-10" style={{ background: "white", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 4px 24px rgba(0,0,0,0.03)" }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4, ease }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-2 mb-4"><span className="text-[24px]">{persona.emoji}</span><span className="text-[16px] font-bold" style={{ color: "#111118" }}>{persona.role}</span></div>
                <div className="rounded-xl px-4 py-3 mb-3" style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.08)" }}>
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "#EF4444" }}>Le problème</div>
                  <div className="text-[13px] font-medium" style={{ color: "#57534E" }}>{persona.pain}</div>
                </div>
                <div className="rounded-xl px-4 py-3" style={{ background: `${persona.color}06`, border: `1px solid ${persona.color}10` }}>
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: persona.color }}>Avec Jestly</div>
                  <div className="text-[13px] font-semibold" style={{ color: "#111118" }}>{persona.solved}</div>
                </div>
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: "#8A8FA3" }}>Modules utilisés</div>
                <div className="flex flex-wrap gap-2">
                  {persona.modules.map((m, i) => (
                    <motion.span key={m} className="px-4 py-2.5 rounded-xl text-[12px] font-semibold" style={{ background: `${persona.color}06`, color: persona.color, border: `1px solid ${persona.color}12` }} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: i * 0.08 }}>{m}</motion.span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
