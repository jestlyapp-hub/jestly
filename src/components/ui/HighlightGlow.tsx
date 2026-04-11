"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";

interface HighlightGlowProps {
  /** Activer le glow (passer true pour déclencher l'animation) */
  active: boolean;
  /** Durée en ms (défaut 1200) */
  duration?: number;
  /** Couleur du glow (défaut emerald — succès) */
  color?: "emerald" | "indigo" | "amber";
  children: ReactNode;
}

const GLOW_COLORS = {
  emerald: {
    ring: "ring-emerald-400/40",
    bg: "bg-emerald-50/40",
    shadow: "0 0 16px rgba(52, 211, 153, 0.25)",
  },
  indigo: {
    ring: "ring-indigo-400/40",
    bg: "bg-indigo-50/40",
    shadow: "0 0 16px rgba(99, 102, 241, 0.25)",
  },
  amber: {
    ring: "ring-amber-400/40",
    bg: "bg-amber-50/40",
    shadow: "0 0 16px rgba(251, 191, 36, 0.25)",
  },
};

/**
 * Enveloppe un élément d'un glow temporaire vert après création/action réussie.
 *
 * Usage :
 * ```tsx
 * <HighlightGlow active={item.id === newlyCreatedId}>
 *   <div>...</div>
 * </HighlightGlow>
 * ```
 */
export default function HighlightGlow({
  active,
  duration = 1200,
  color = "emerald",
  children,
}: HighlightGlowProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!active) return;
    setShow(true);
    const timer = setTimeout(() => setShow(false), duration);
    return () => clearTimeout(timer);
  }, [active, duration]);

  const c = GLOW_COLORS[color];

  if (!show) return <>{children}</>;

  return (
    <motion.div
      initial={{ boxShadow: c.shadow, scale: 1.005 }}
      animate={{ boxShadow: "0 0 0px rgba(0,0,0,0)", scale: 1 }}
      transition={{ duration: duration / 1000, ease: "easeOut" }}
      className={`rounded-lg ring-1 ${c.ring} ${c.bg} transition-colors`}
    >
      {children}
    </motion.div>
  );
}
