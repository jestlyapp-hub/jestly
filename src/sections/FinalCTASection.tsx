"use client";

import { motion } from "framer-motion";
import TextSwapButton from "@/components/ui/TextSwapButton";
import SectionShell from "@/components/landing/SectionShell";

/* ═══════════════════════════════════════════════════════════════════════
   CTA FINAL — Clean conversion block
   ═══════════════════════════════════════════════════════════════════════ */

const ease = [0.22, 1, 0.36, 1] as const;

export default function FinalCTASection() {
  return (
    <SectionShell atmosphere="elevated" maxWidth="max-w-3xl">
        <motion.div
          className="rounded-[32px] p-8 sm:p-12 lg:p-16 text-center"
          style={{ background: "linear-gradient(135deg, rgba(124,92,255,0.04), rgba(124,92,255,0.08))", border: "1px solid rgba(124,92,255,0.12)", boxShadow: "0 8px 40px rgba(124,92,255,0.06)" }}
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease }}
        >
          <motion.h2
            className="text-[26px] sm:text-[36px] md:text-[44px] font-extrabold leading-[1.1] tracking-[-0.03em] mb-4"
            style={{ color: "#111118" }}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15, ease }}
          >
            Tout ce dont vous avez besoin,
            <br />
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #7C5CFF, #9F7BFF, #6F5BFF)" }}>
              en un seul endroit
            </span>
          </motion.h2>

          <motion.p
            className="text-[15px] sm:text-[17px] leading-relaxed max-w-md mx-auto mb-8"
            style={{ color: "#66697A" }}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.25, ease }}
          >
            Rejoignez les freelancers qui ont remplacé leurs outils dispersés par un seul système pensé pour eux.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3, ease }}
          >
            <TextSwapButton label="Créer mon espace" href="/login" variant="primary" size="lg" />
            <TextSwapButton label="Voir la démo" href="#demo" variant="ghost" size="md" />
          </motion.div>

          <motion.div
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.45, ease }}
          >
            {["Gratuit pour commencer", "Aucun engagement", "Export libre", "Support inclus"].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4" /></svg>
                <span className="text-[12px] font-medium" style={{ color: "#78716C" }}>{item}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
    </SectionShell>
  );
}
