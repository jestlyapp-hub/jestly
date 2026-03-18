"use client";

import { motion } from "framer-motion";
import Button from "@/components/ui/Button";

/* ─── Petite icône flèche ─── */
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
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-white">
      {/* ── Contenu central ── */}
      <div className="relative z-10 text-center max-w-3xl mx-auto px-6 pt-20">
        <motion.h1
          className="text-[clamp(2.6rem,7vw,5.5rem)] font-bold leading-[1.06] tracking-tight mb-6 text-[#191919]"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          Gérez votre freelance
          <br />
          comme un{" "}
          <span className="text-[#4F46E5]">
            pro.
          </span>
        </motion.h1>

        <motion.p
          className="text-base sm:text-lg text-[#5A5A58] max-w-md mx-auto mb-10 leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: "easeOut" }}
        >
          Plateforme tout-en-un pour vendre, gérer et scaler votre activité
          freelance.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
        >
          <Button href="/login">
            Commencer gratuitement <ArrowIcon />
          </Button>
          <Button variant="secondary" href="#features">Voir la démo</Button>
        </motion.div>

        <motion.p
          className="text-[13px] text-[#8A8A88] mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          Gratuit &middot; Sans carte bancaire &middot; Prêt en 3 minutes
        </motion.p>
      </div>
    </section>
  );
}
