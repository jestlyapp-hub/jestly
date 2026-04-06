"use client";

import { useRef, useCallback } from "react";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import SectionShell from "@/components/landing/SectionShell";

/* ═══════════════════════════════════════════════════════════════════════
   FEATURE SHOWCASE — 5 features, mosaïque compacte, cliquable
   ═══════════════════════════════════════════════════════════════════════ */

const ease = [0.22, 1, 0.36, 1] as const;

interface ShowcaseFeature {
  id: string;
  title: string;
  tagline: string;
  label: string;
  href: string;
  color: string;
  tint: string;
  borderTint: string;
  glowColor: string;
  icon: React.ReactNode;
}

const SHOWCASE: ShowcaseFeature[] = [
  {
    id: "crm",
    title: "CRM clients",
    tagline: "Centralisez vos clients et échanges",
    label: "CRM",
    href: "/fonctionnalites/crm",
    color: "#10B981",
    tint: "rgba(16,185,129,0.05)",
    borderTint: "rgba(16,185,129,0.12)",
    glowColor: "rgba(16,185,129,0.10)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    id: "facturation",
    title: "Facturation",
    tagline: "Encaissez plus simplement",
    label: "Facturation",
    href: "/fonctionnalites/facturation",
    color: "#F59E0B",
    tint: "rgba(245,158,11,0.05)",
    borderTint: "rgba(245,158,11,0.12)",
    glowColor: "rgba(245,158,11,0.10)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /><path d="M9 15l2 2 4-4" />
      </svg>
    ),
  },
  {
    id: "site-web",
    title: "Site & Portfolio",
    tagline: "Présentez votre travail et convertissez",
    label: "Site web",
    href: "/fonctionnalites/site-vitrine",
    color: "#8B5CF6",
    tint: "rgba(139,92,246,0.05)",
    borderTint: "rgba(139,92,246,0.12)",
    glowColor: "rgba(139,92,246,0.10)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" />
      </svg>
    ),
  },
  {
    id: "commandes",
    title: "Projets",
    tagline: "Pilotez vos projets sans friction",
    label: "Projets",
    href: "/fonctionnalites/commandes",
    color: "#3B82F6",
    tint: "rgba(59,130,246,0.05)",
    borderTint: "rgba(59,130,246,0.12)",
    glowColor: "rgba(59,130,246,0.10)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" />
      </svg>
    ),
  },
  {
    id: "analytics",
    title: "Analytics",
    tagline: "Gardez une vue claire de votre activité",
    label: "Analytics",
    href: "/fonctionnalites/analytics",
    color: "#7C3AED",
    tint: "rgba(124,58,237,0.05)",
    borderTint: "rgba(124,58,237,0.12)",
    glowColor: "rgba(124,58,237,0.10)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" />
      </svg>
    ),
  },
];

/* ── Showcase Card ── */

function ShowcaseCard({ f, index, large = false }: { f: ShowcaseFeature; index: number; large?: boolean }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [3, -3]), { damping: 30, stiffness: 200 });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-3, 3]), { damping: 30, stiffness: 200 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  }, [mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      ref={cardRef}
      className={large ? "md:col-span-2 md:row-span-2" : ""}
      style={{ perspective: 800 }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.08, ease }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <Link href={f.href} className="block h-full">
        <motion.div
          className={`group relative rounded-[20px] overflow-hidden h-full cursor-pointer ${
            large ? "p-8 sm:p-10" : "p-6"
          }`}
          style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
            background: `linear-gradient(160deg, ${f.tint}, rgba(255,255,255,0.97))`,
            border: `1px solid ${f.borderTint}`,
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
          }}
          whileHover={{
            y: -4,
            boxShadow: `0 20px 50px ${f.glowColor}, 0 8px 20px rgba(0,0,0,0.03)`,
            borderColor: `${f.color}30`,
          }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
        >
          {/* Glow au hover */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[20px]"
            style={{ background: `radial-gradient(ellipse at 30% 0%, ${f.color}08 0%, transparent 60%)` }}
          />

          {/* Label tag */}
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold mb-4 relative z-10 transition-colors duration-300"
            style={{
              background: `${f.color}0C`,
              color: f.color,
              border: `1px solid ${f.color}18`,
            }}
          >
            {f.icon}
            {f.label}
          </div>

          {/* Titre */}
          <h3
            className={`font-bold relative z-10 mb-2 transition-colors duration-300 group-hover:text-[#18181B] ${
              large ? "text-[22px] sm:text-[26px]" : "text-[16px] sm:text-[17px]"
            }`}
            style={{ color: "#18181B" }}
          >
            {f.title}
          </h3>

          {/* Tagline */}
          <p
            className={`relative z-10 leading-[1.6] ${
              large ? "text-[15px] max-w-[340px]" : "text-[13px]"
            }`}
            style={{ color: "#9CA3AF" }}
          >
            {f.tagline}
          </p>

          {/* CTA arrow */}
          <div className="mt-4 flex items-center gap-1.5 relative z-10">
            <span className="text-[12px] font-semibold transition-colors duration-300" style={{ color: f.color }}>
              Découvrir
            </span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke={f.color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SECTION — FEATURE SHOWCASE GALLERY
   ═══════════════════════════════════════════════════════════════════════ */

export default function InteractiveFeatures() {
  return (
    <SectionShell atmosphere="system">
      <div className="relative py-16 sm:py-20 overflow-hidden">
        {/* Glow background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] pointer-events-none" style={{ background: "radial-gradient(ellipse, rgba(124,92,255,0.03) 0%, transparent 70%)" }} />

        {/* Header */}
        <div className="text-center mb-12 sm:mb-14 relative z-10">
          <motion.div
            className="mb-5"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
          >
            <span
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-semibold"
              style={{
                background: "rgba(124,92,255,0.08)",
                color: "#7C5CFF",
                border: "1px solid rgba(124,92,255,0.12)",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              Plateforme tout-en-un
            </span>
          </motion.div>

          <motion.h2
            className="text-[28px] sm:text-[38px] md:text-[44px] font-extrabold leading-[1.1] tracking-tight mb-4"
            style={{ color: "#18181B" }}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease }}
          >
            Tout votre business freelance,{" "}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #7C5CFF, #A78BFA)" }}>
              un seul cockpit.
            </span>
          </motion.h2>

          <motion.p
            className="text-[15px] sm:text-[17px] leading-relaxed max-w-[500px] mx-auto"
            style={{ color: "#6B7280" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2, ease }}
          >
            CRM, facturation, portfolio, gestion de projets et analytics — explorez chaque module.
          </motion.p>
        </div>

        {/* Mosaïque : 1 grande carte + 4 secondaires */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 max-w-[960px] mx-auto auto-rows-fr">
          {/* Grande carte CRM — span 2 cols × 2 rows */}
          <ShowcaseCard f={SHOWCASE[0]} index={0} large />

          {/* 4 cartes secondaires */}
          {SHOWCASE.slice(1).map((f, i) => (
            <ShowcaseCard key={f.id} f={f} index={i + 1} />
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
