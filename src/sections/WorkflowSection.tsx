"use client";

import { motion } from "framer-motion";
import TextSwapButton from "@/components/ui/TextSwapButton";
import SectionShell from "@/components/landing/SectionShell";

/* ═══════════════════════════════════════════════════════════════════════
   WORKFLOW — Light Premium
   Horizontal flow desktop, vertical mobile. Full white theme.
   ═══════════════════════════════════════════════════════════════════════ */

const ease = [0.22, 1, 0.36, 1] as const;

const STEPS = [
  { id: "lead", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z", label: "Client entrant", description: "Un prospect arrive via votre site ou par email.", tag: "Automatisé", color: "#7C5CFF" },
  { id: "quote", icon: "M9 7h6m-6 4h6m-6 4h4M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z", label: "Devis envoyé", description: "Créez et envoyez un devis en quelques clics.", tag: "Connecté", color: "#3B82F6" },
  { id: "payment", icon: "M21 4H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM1 10h22", label: "Paiement reçu", description: "Suivi automatique, relances intelligentes.", tag: "Sans friction", color: "#10B981" },
  { id: "project", icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 5h6M9 14l2 2 4-4", label: "Projet géré", description: "Tâches, deadlines et livrables organisés.", tag: "Centralisé", color: "#F59E0B" },
  { id: "delivery", icon: "M3 3h18v18H3zM3 9h18M9 21V9", label: "Site livré", description: "Publiez le projet sur votre portfolio Jestly.", tag: "Publié", color: "#8B5CF6" },
];

export default function WorkflowSection() {
  return (
    <SectionShell atmosphere="process" maxWidth="max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16 sm:mb-20">
          <motion.div className="mb-5" initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease }}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-semibold" style={{ background: "rgba(124,92,255,0.08)", color: "#7C5CFF", border: "1px solid rgba(124,92,255,0.12)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              Workflow complet
            </span>
          </motion.div>

          <motion.h2 className="text-[26px] sm:text-[36px] md:text-[44px] lg:text-[50px] font-extrabold leading-[1.08] tracking-[-0.03em] mb-5" style={{ color: "#111118" }} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.08, ease }}>
            Du premier contact
            <br />
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #7C5CFF, #9F7BFF, #6F5BFF)" }}>au projet livré</span>
          </motion.h2>

          <motion.p className="text-[14px] sm:text-[16px] leading-relaxed max-w-lg mx-auto" style={{ color: "#66697A" }} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.16, ease }}>
            Un seul flux, de la prise de contact au paiement. Zéro outil en plus.
          </motion.p>
        </div>

        {/* Desktop: horizontal flow */}
        <div className="hidden md:flex items-start justify-center gap-0">
          {STEPS.map((step, i) => (
            <div key={step.id} className="flex items-center">
              {/* Step card */}
              <motion.div
                className="relative w-[190px] lg:w-[210px] rounded-[22px] p-5 group hover:-translate-y-1 transition-all duration-300"
                style={{ background: "#F7F7FB", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.15 + i * 0.12, ease }}
              >
                {/* Number badge */}
                <div className="absolute -top-3 -left-1 w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-extrabold text-white" style={{ background: `linear-gradient(135deg, ${step.color}, ${step.color}CC)`, boxShadow: `0 2px 10px ${step.color}30` }}>
                  {String(i + 1).padStart(2, "0")}
                </div>

                {/* Icon */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${step.color}08` }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={step.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={step.icon} /></svg>
                </div>

                <h3 className="text-[14px] font-bold mb-1" style={{ color: "#111118" }}>{step.label}</h3>
                <p className="text-[11px] leading-relaxed mb-3" style={{ color: "#66697A" }}>{step.description}</p>

                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider" style={{ background: `${step.color}08`, color: step.color, border: `1px solid ${step.color}12` }}>
                  <span className="w-1 h-1 rounded-full" style={{ background: step.color }} />
                  {step.tag}
                </span>
              </motion.div>

              {/* Arrow connector */}
              {i < STEPS.length - 1 && (
                <div className="flex items-center px-1.5 flex-shrink-0">
                  <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
                    <path d="M0 6h16M14 2l4 4-4 4" stroke="rgba(124,92,255,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile: vertical timeline */}
        <div className="flex flex-col items-center md:hidden gap-3">
          {STEPS.map((step, i) => (
            <div key={step.id} className="flex flex-col items-center w-full max-w-xs">
              <motion.div
                className="relative w-full rounded-[22px] p-5"
                style={{ background: "#F7F7FB", border: "1px solid rgba(0,0,0,0.06)" }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1, ease }}
              >
                <div className="absolute -top-3 left-4 w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-extrabold text-white" style={{ background: `linear-gradient(135deg, ${step.color}, ${step.color}CC)` }}>
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="flex items-start gap-3 mt-1">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${step.color}08` }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={step.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={step.icon} /></svg>
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold mb-0.5" style={{ color: "#111118" }}>{step.label}</h3>
                    <p className="text-[11px] leading-relaxed" style={{ color: "#66697A" }}>{step.description}</p>
                  </div>
                </div>
              </motion.div>
              {i < STEPS.length - 1 && (
                <div className="py-1">
                  <svg width="12" height="20" viewBox="0 0 12 20" fill="none"><path d="M6 0v16M2 14l4 4 4-4" stroke="rgba(124,92,255,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div className="text-center mt-16 sm:mt-20" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3, ease }}>
          <p className="text-[15px] sm:text-[17px] font-medium mb-6" style={{ color: "#66697A" }}>
            Tout est déjà prêt. Il ne reste qu&apos;à commencer.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <TextSwapButton label="Créer mon premier client" href="/login" variant="primary" size="md" />
            <TextSwapButton label="Voir la démo" href="#demo" variant="ghost" size="md" />
          </div>
        </motion.div>
    </SectionShell>
  );
}
