"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Button from "@/components/ui/Button";
import FloatingCard from "@/components/ui/FloatingCard";

/* ─── Petite icone fleche ─── */
function ArrowIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

export default function Hero() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  /* Parallaxe leger sur le contenu central */
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  /* Les floating cards bougent plus vite pour un effet de profondeur */
  const cardsY = useTransform(scrollYProgress, [0, 1], [0, 200]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* ── Background : gradient sombre ── */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a153d] via-[#0f0b2a] to-[#050412]" />

      {/* ── Radial glow central (pulsation douce) ── */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] rounded-full"
        style={{
          background:
            "radial-gradient(ellipse, rgba(106,24,241,0.18) 0%, rgba(106,24,241,0.04) 50%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ── Noise overlay ── */}
      <div className="noise-overlay !fixed" />

      {/* ── Contenu central ── */}
      <motion.div
        style={{ y: contentY }}
        className="relative z-10 text-center max-w-3xl mx-auto px-6 pt-20"
      >
        <motion.h1
          className="text-[clamp(2.6rem,7vw,5.5rem)] font-extrabold leading-[1.06] tracking-tight mb-6"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          Gerez votre freelance
          <br />
          comme un{" "}
          <span className="bg-gradient-to-r from-[#6a18f1] via-[#8f3dff] to-[#b06aff] bg-clip-text text-transparent">
            pro.
          </span>
        </motion.h1>

        <motion.p
          className="text-base sm:text-lg text-white/45 max-w-md mx-auto mb-10 leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: "easeOut" }}
        >
          Plateforme tout-en-un pour vendre, gerer et scaler votre activite
          freelance.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
        >
          <Button>
            Commencer gratuitement <ArrowIcon />
          </Button>
          <Button variant="secondary">Voir la demo</Button>
        </motion.div>

        <motion.p
          className="text-[13px] text-white/25 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          Gratuit &middot; Sans carte bancaire &middot; Pret en 3 minutes
        </motion.p>
      </motion.div>

      {/* ── Floating UI Cards ── */}
      <motion.div
        style={{ y: cardsY }}
        className="absolute inset-0 pointer-events-none"
      >
        {/* Card Revenus — haut droite */}
        <FloatingCard
          className="top-[14%] right-[6%] w-48 hidden lg:block"
          delay={0}
          duration={5.5}
        >
          <div className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-1.5">
            Revenus
          </div>
          <div className="text-xl font-extrabold text-white">2 480 &euro;</div>
          <div className="mt-2 h-1 bg-white/[0.06] rounded-full overflow-hidden">
            <div className="h-full w-[72%] bg-gradient-to-r from-[#6a18f1] to-[#8f3dff] rounded-full" />
          </div>
          <div className="text-[10px] text-emerald-400 mt-1.5 font-medium">
            +12 % ce mois
          </div>
        </FloatingCard>

        {/* Card Facture — haut gauche */}
        <FloatingCard
          className="top-[16%] left-[5%] w-44 hidden lg:block"
          delay={0.4}
          duration={6}
        >
          <div className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-1.5">
            Facture #047
          </div>
          <div className="text-lg font-extrabold text-white">850 &euro;</div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#22c55e"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="text-[11px] text-emerald-400 font-medium">
              Payee
            </span>
          </div>
        </FloatingCard>

        {/* Card Commande — bas gauche */}
        <FloatingCard
          className="bottom-[20%] left-[7%] w-48 hidden lg:block"
          delay={0.8}
          duration={5}
        >
          <div className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-1.5">
            Commande
          </div>
          <div className="text-sm font-bold text-white mb-1">
            Logo redesign
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#8f3dff]" />
            <span className="text-[11px] text-white/40">
              En cours &middot; Marie D.
            </span>
          </div>
        </FloatingCard>

        {/* Card Agenda — droite milieu */}
        <FloatingCard
          className="top-[48%] right-[4%] w-40 hidden lg:block"
          delay={1.2}
          duration={5.8}
        >
          <div className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-1.5">
            Agenda
          </div>
          <div className="text-sm font-bold text-white">15 Mars</div>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#ff5f57]" />
            <span className="text-[11px] text-white/40">
              Deadline livraison
            </span>
          </div>
        </FloatingCard>
      </motion.div>
    </section>
  );
}
