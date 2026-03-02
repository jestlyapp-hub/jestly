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
    "bg-[#4F46E5] text-white hover:bg-[#4338CA]",
  secondary:
    "border border-[#E6E6E4] text-[#191919] hover:bg-[#F7F7F5]",
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
      className={`inline-flex items-center gap-2 font-semibold text-sm rounded-md px-7 py-3.5 cursor-pointer transition-colors ${styles[variant]} ${className}`}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      {children}
    </motion.a>
  );
}
