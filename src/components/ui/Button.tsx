"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary";
  href?: string;
  className?: string;
}

const styles = {
  primary:
    "bg-gradient-to-r from-[#6a18f1] to-[#8f3dff] text-white hover:shadow-[0_0_32px_rgba(106,24,241,0.45)]",
  secondary:
    "border border-white/10 bg-white/[0.04] backdrop-blur-md text-white hover:bg-white/[0.08] hover:border-white/20",
};

export default function Button({
  children,
  variant = "primary",
  href = "#",
  className = "",
}: ButtonProps) {
  return (
    <motion.a
      href={href}
      className={`inline-flex items-center gap-2 font-semibold text-sm rounded-full px-7 py-3.5 cursor-pointer transition-shadow ${styles[variant]} ${className}`}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      {children}
    </motion.a>
  );
}
