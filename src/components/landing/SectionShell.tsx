"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════════════
   SectionShell — Atmospheric section wrapper
   Each section gets a distinct visual personality + smooth transitions.
   ═══════════════════════════════════════════════════════════════════════ */

type Atmosphere =
  | "hero"
  | "system"
  | "editorial"
  | "warm"
  | "process"
  | "contrast"
  | "calm"
  | "elevated";

interface SectionShellProps {
  children: React.ReactNode;
  atmosphere?: Atmosphere;
  className?: string;
  maxWidth?: string;
  id?: string;
}

interface Glow { x: string; y: string; size: number; color: string }
interface Particle { x: string; y: string; size: number; delay: number; opacity?: number }

interface AtmoConfig {
  bg: string;
  gridOpacity: number;
  gridColor: string;
  glows: Glow[];
  particles: Particle[];
  py: string;
}

const ATMO: Record<Atmosphere, AtmoConfig> = {
  hero: {
    bg: "transparent", gridOpacity: 0, gridColor: "124,92,255",
    glows: [], particles: [], py: "pt-0 pb-0",
  },

  /* Features — structured, visible grid, system feel */
  system: {
    bg: "#FFFFFF",
    gridOpacity: 0.045,
    gridColor: "124,92,255",
    glows: [
      { x: "75%", y: "15%", size: 600, color: "rgba(124,92,255,0.07)" },
      { x: "15%", y: "75%", size: 500, color: "rgba(139,92,246,0.05)" },
    ],
    particles: [
      { x: "6%", y: "12%", size: 10, delay: 0 },
      { x: "93%", y: "22%", size: 8, delay: 1.5 },
      { x: "88%", y: "78%", size: 7, delay: 3 },
      { x: "4%", y: "65%", size: 6, delay: 4.5 },
    ],
    py: "py-6 sm:py-10",
  },

  /* Stats — focused, calm, centered glow */
  editorial: {
    bg: "#FAFAFE",
    gridOpacity: 0.025,
    gridColor: "124,92,255",
    glows: [
      { x: "50%", y: "35%", size: 700, color: "rgba(124,92,255,0.06)" },
    ],
    particles: [
      { x: "90%", y: "20%", size: 7, delay: 0, opacity: 0.5 },
    ],
    py: "py-6 sm:py-10",
  },

  /* Testimonials — warmer, softer, human */
  warm: {
    bg: "#F6F5FB",
    gridOpacity: 0.03,
    gridColor: "140,120,200",
    glows: [
      { x: "25%", y: "25%", size: 550, color: "rgba(139,92,246,0.07)" },
      { x: "80%", y: "70%", size: 500, color: "rgba(124,92,255,0.05)" },
    ],
    particles: [
      { x: "5%", y: "18%", size: 9, delay: 0 },
      { x: "95%", y: "55%", size: 7, delay: 2 },
      { x: "50%", y: "90%", size: 6, delay: 3.5 },
    ],
    py: "py-6 sm:py-10",
  },

  /* Workflow — directional, denser grid, process-driven */
  process: {
    bg: "#FFFFFF",
    gridOpacity: 0.05,
    gridColor: "124,92,255",
    glows: [
      { x: "15%", y: "50%", size: 450, color: "rgba(124,92,255,0.06)" },
      { x: "85%", y: "50%", size: 450, color: "rgba(124,92,255,0.06)" },
    ],
    particles: [
      { x: "10%", y: "25%", size: 8, delay: 0 },
      { x: "90%", y: "35%", size: 7, delay: 1 },
      { x: "50%", y: "88%", size: 9, delay: 2 },
      { x: "30%", y: "75%", size: 6, delay: 3.5 },
    ],
    py: "py-6 sm:py-10",
  },

  /* Before/After — comparison, centered aura */
  contrast: {
    bg: "#F5F4FB",
    gridOpacity: 0.035,
    gridColor: "124,92,255",
    glows: [
      { x: "50%", y: "45%", size: 800, color: "rgba(124,92,255,0.08)" },
    ],
    particles: [
      { x: "8%", y: "45%", size: 8, delay: 0 },
      { x: "92%", y: "55%", size: 8, delay: 1.5 },
    ],
    py: "py-6 sm:py-10",
  },

  /* FAQ — calmest, simplest */
  calm: {
    bg: "#F7F6FC",
    gridOpacity: 0.02,
    gridColor: "150,140,190",
    glows: [
      { x: "60%", y: "30%", size: 500, color: "rgba(124,92,255,0.04)" },
    ],
    particles: [],
    py: "py-6 sm:py-10",
  },

  /* CTA — elevated, focused glow, polished conclusion */
  elevated: {
    bg: "#FFFFFF",
    gridOpacity: 0.02,
    gridColor: "124,92,255",
    glows: [
      { x: "50%", y: "50%", size: 800, color: "rgba(124,92,255,0.1)" },
    ],
    particles: [
      { x: "12%", y: "30%", size: 7, delay: 0 },
      { x: "88%", y: "70%", size: 7, delay: 2 },
      { x: "20%", y: "80%", size: 5, delay: 4 },
    ],
    py: "py-8 sm:py-12",
  },
};

export default function SectionShell({
  children,
  atmosphere = "editorial",
  className = "",
  maxWidth = "max-w-[1080px]",
  id,
}: SectionShellProps) {
  const atmo = ATMO[atmosphere];
  const isHero = atmosphere === "hero";
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: isHero ? undefined : ref,
    offset: ["start end", "end start"],
  });
  const glowY = useTransform(scrollYProgress, [0, 1], [30, -30]);

  if (isHero) {
    return (
      <section id={id} className={className}>
        {children}
      </section>
    );
  }

  return (
    <section
      ref={ref}
      id={id}
      className={`relative overflow-hidden ${atmo.py} px-6 ${className}`}
      style={{ background: atmo.bg }}
    >
      {/* Grid */}
      {atmo.gridOpacity > 0 && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: atmo.gridOpacity,
            backgroundImage: `linear-gradient(rgba(${atmo.gridColor},1) 1px, transparent 1px), linear-gradient(90deg, rgba(${atmo.gridColor},1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      )}

      {/* Glows with parallax */}
      {atmo.glows.map((g, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: g.x,
            top: g.y,
            width: g.size,
            height: g.size,
            transform: "translate(-50%, -50%)",
            background: `radial-gradient(circle, ${g.color}, transparent 65%)`,
            y: glowY,
          }}
        />
      ))}

      {/* Floating square particles */}
      {atmo.particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            borderRadius: 3,
            background: `rgba(124,92,255,${p.opacity ?? 0.12})`,
            border: "1px solid rgba(124,92,255,0.1)",
          }}
          animate={{
            y: [0, -10, 0],
            opacity: [p.opacity ?? 0.12, (p.opacity ?? 0.12) * 2.5, p.opacity ?? 0.12],
            rotate: [0, 8, 0],
          }}
          transition={{
            duration: 7 + i * 2,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Content */}
      <div className={`relative z-10 ${maxWidth} mx-auto`}>
        {children}
      </div>
    </section>
  );
}
