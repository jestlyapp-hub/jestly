"use client";

import { motion } from "framer-motion";
import Button from "@/components/ui/Button";

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

export default function FinalCta() {
  return (
    <section className="relative py-32 px-6 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a12] via-[#1a153d] to-[#0a0a12]" />

      {/* Glow central */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full"
        style={{
          background:
            "radial-gradient(ellipse, rgba(106,24,241,0.2), transparent 70%)",
        }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        <motion.h2
          className="text-3xl sm:text-[2.8rem] font-extrabold leading-tight mb-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Prêt à scaler votre freelance ?
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <Button className="!py-4 !px-10 !text-base">
            Commencer gratuitement <ArrowIcon />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
