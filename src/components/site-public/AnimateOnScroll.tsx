"use client";

import { motion } from "framer-motion";
import type { BlockAnimation } from "@/types";

const variants = {
  "fade-up": {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
  },
  "fade-in": {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  "slide-left": {
    hidden: { opacity: 0, x: -24 },
    visible: { opacity: 1, x: 0 },
  },
};

interface AnimateOnScrollProps {
  animation?: BlockAnimation;
  children: React.ReactNode;
  className?: string;
}

/**
 * Wraps children in a Framer Motion div that animates when scrolled into view.
 * If animation is "none" or undefined, renders children directly.
 */
export default function AnimateOnScroll({
  animation,
  children,
  className,
}: AnimateOnScrollProps) {
  if (!animation || animation === "none") {
    return <div className={className}>{children}</div>;
  }

  const variant = variants[animation];
  if (!variant) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: "easeOut" as const }}
      variants={variant}
      className={className}
    >
      {children}
    </motion.div>
  );
}
