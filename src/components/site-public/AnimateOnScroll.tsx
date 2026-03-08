"use client";

import { motion } from "framer-motion";
import type { BlockAnimation } from "@/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const animationVariants: Record<string, { hidden: Record<string, any>; visible: Record<string, any> }> = {
  "fade-up": {
    hidden: { opacity: 0, y: 28 },
    visible: { opacity: 1, y: 0 },
  },
  "fade-down": {
    hidden: { opacity: 0, y: -28 },
    visible: { opacity: 1, y: 0 },
  },
  "fade-in": {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  "fade-left": {
    hidden: { opacity: 0, x: -32 },
    visible: { opacity: 1, x: 0 },
  },
  "fade-right": {
    hidden: { opacity: 0, x: 32 },
    visible: { opacity: 1, x: 0 },
  },
  "slide-left": {
    hidden: { opacity: 0, x: -24 },
    visible: { opacity: 1, x: 0 },
  },
  "scale-in": {
    hidden: { opacity: 0, scale: 0.92 },
    visible: { opacity: 1, scale: 1 },
  },
  "blur-reveal": {
    hidden: { opacity: 0, filter: "blur(8px)" },
    visible: { opacity: 1, filter: "blur(0px)" },
  },
};

interface AnimateOnScrollProps {
  animation?: BlockAnimation;
  duration?: number;
  delay?: number;
  children: React.ReactNode;
  className?: string;
}

/**
 * Wraps children in a Framer Motion div that animates when scrolled into view.
 * Supports reduced motion: falls back to no animation.
 */
export default function AnimateOnScroll({
  animation,
  duration = 0.5,
  delay = 0,
  children,
  className,
}: AnimateOnScrollProps) {
  if (!animation || animation === "none") {
    return <div className={className}>{children}</div>;
  }

  const variant = animationVariants[animation];
  if (!variant) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: Math.max(0.2, Math.min(1.5, duration)),
        delay: Math.max(0, Math.min(1, delay)),
        ease: "easeOut" as const,
      }}
      variants={variant}
      className={className}
    >
      {children}
    </motion.div>
  );
}
