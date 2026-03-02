"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface FloatingCardProps {
  children: ReactNode;
  className?: string;
  /** Delai avant le debut de l'animation en secondes */
  delay?: number;
  /** Duree d'un cycle complet en secondes */
  duration?: number;
}

export default function FloatingCard({
  children,
  className = "",
  delay = 0,
  duration = 5,
}: FloatingCardProps) {
  return (
    <motion.div
      className={`absolute bg-white border border-[#E6E6E4] rounded-lg p-4 shadow-sm pointer-events-none ${className}`}
      initial={{ opacity: 0, scale: 0.85, y: 20 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: [0, -14, 0],
      }}
      transition={{
        opacity: { duration: 0.8, delay: delay + 0.3 },
        scale: { duration: 0.8, delay: delay + 0.3 },
        y: {
          duration,
          repeat: Infinity,
          ease: "easeInOut",
          delay: delay + 1,
        },
      }}
    >
      {children}
    </motion.div>
  );
}
