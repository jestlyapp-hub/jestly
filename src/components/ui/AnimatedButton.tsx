"use client";

import { motion } from "framer-motion";
import type { ReactNode, MouseEventHandler } from "react";

interface AnimatedButtonProps {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  /** Variante visuelle */
  variant?: "primary" | "secondary" | "danger";
  /** Affiche un spinner de chargement */
  loading?: boolean;
  /** Taille */
  size?: "sm" | "md";
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
}

const VARIANTS = {
  primary: "bg-[#4F46E5] text-white hover:bg-[#4338CA] focus-visible:ring-[#4F46E5]/30",
  secondary: "bg-white text-[#44403C] border border-[#E6E6E4] hover:bg-[#F7F7F5] focus-visible:ring-[#E6E6E4]/50",
  danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600/30",
};

const SIZES = {
  sm: "text-[12px] px-3 py-1.5 gap-1.5",
  md: "text-[13px] px-4 py-2.5 gap-2",
};

/**
 * Bouton avec micro-animations :
 * - whileHover: léger scale up (1.02)
 * - whileTap: bounce down (0.97)
 * - Transition spring rapide
 */
export default function AnimatedButton({
  children,
  onClick,
  variant = "primary",
  loading = false,
  size = "md",
  disabled,
  className = "",
  type = "button",
}: AnimatedButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <motion.button
      type={type}
      onClick={onClick}
      whileHover={isDisabled ? undefined : { scale: 1.02 }}
      whileTap={isDisabled ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      disabled={isDisabled}
      className={`inline-flex items-center justify-center font-semibold rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </motion.button>
  );
}
