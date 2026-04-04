"use client";

import { motion } from "framer-motion";
import SectionShell from "@/components/landing/SectionShell";

/* ═══════════════════════════════════════════════════════════════════════
   FAQ — Editorial 2-column layout
   Left: intro + reassurance. Right: clean list items.
   Calm, scannable, premium.
   ═══════════════════════════════════════════════════════════════════════ */

const ease = [0.22, 1, 0.36, 1] as const;

const FAQ = [
  { q: "Combien ça coûte ?", a: "Plan gratuit jusqu'à 10 commandes/mois. Plan Pro à 4,99 €/mois pour un accès illimité." },
  { q: "C'est compliqué à prendre en main ?", a: "Non. L'interface est conçue pour être comprise en 5 minutes, sans tutoriel." },
  { q: "Je travaille seul, c'est utile ?", a: "C'est justement pour vous. Jestly automatise le suivi, la relance et la facturation." },
  { q: "J'ai déjà Notion et Excel…", a: "C'est le problème qu'on résout. Tout est interconnecté au même endroit." },
  { q: "Mes données sont en sécurité ?", a: "Oui. Chiffrement, Row Level Security, hébergement Supabase. Vos données vous appartiennent." },
  { q: "Et si je veux arrêter ?", a: "Exportez tout en JSON ou CSV à tout moment. Aucun engagement, aucune pénalité." },
];

export default function FaqSection() {
  return (
    <SectionShell atmosphere="calm">
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-12 lg:gap-16 items-start">

          {/* ── Left: Intro column ── */}
          <motion.div
            className="lg:sticky lg:top-32"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
          >
            <span
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-semibold mb-6"
              style={{ background: "rgba(124,92,255,0.08)", color: "#7C5CFF", border: "1px solid rgba(124,92,255,0.12)" }}
            >
              Questions
            </span>

            <h2 className="text-[28px] sm:text-[34px] md:text-[40px] font-extrabold leading-[1.1] tracking-[-0.03em] mb-4" style={{ color: "#111118" }}>
              On vous comprend,
              <br />
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #7C5CFF, #9F7BFF)" }}>
                on a les réponses
              </span>
            </h2>

            <p className="text-[14px] leading-relaxed mb-6" style={{ color: "#66697A" }}>
              Les questions que se posent les freelancers avant de se lancer. Réponses courtes, honnêtes, sans jargon.
            </p>

            {/* Trust indicators */}
            <div className="flex flex-col gap-2.5">
              {["Plan gratuit inclus", "Aucun engagement", "Export libre"].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4" /></svg>
                  <span className="text-[13px] font-medium" style={{ color: "#57534E" }}>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Right: FAQ items ── */}
          <div>
            {FAQ.map((item, i) => (
              <motion.div
                key={i}
                className="group"
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05, ease }}
              >
                <div
                  className="py-7 transition-colors duration-200"
                  style={{ borderBottom: i < FAQ.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none" }}
                >
                  <h3 className="text-[15px] sm:text-[16px] font-bold mb-2" style={{ color: "#111118" }}>
                    {item.q}
                  </h3>
                  <p className="text-[13px] sm:text-[14px] leading-[1.7]" style={{ color: "#66697A" }}>
                    {item.a}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
    </SectionShell>
  );
}
