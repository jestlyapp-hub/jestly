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
    <section className="relative py-32 px-6 bg-[#F7F7F5]">
      <div className="relative z-10 text-center max-w-2xl mx-auto">
        <motion.h2
          className="text-3xl sm:text-[2.8rem] font-bold leading-tight mb-8 text-[#191919]"
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
