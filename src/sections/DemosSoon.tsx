"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════════════
   DÉCOUVREZ JESTLY EN ACTION — 5 teasers vidéo "bientôt disponibles"
   ═══════════════════════════════════════════════════════════════════════ */

/* ── Feature Color Map — source unique de vérité pour les couleurs features ── */

export const featureColorMap = {
  site: {
    color: "#8B5CF6",
    badge: "text-violet-600",
    badgeBg: "bg-violet-50",
    bg: "from-violet-50 to-indigo-50",
    glow: "violet",
  },
  projects: {
    color: "#F59E0B",
    badge: "text-amber-600",
    badgeBg: "bg-amber-50",
    bg: "from-orange-50 to-amber-50",
    glow: "orange",
  },
  crm: {
    color: "#10B981",
    badge: "text-emerald-600",
    badgeBg: "bg-emerald-50",
    bg: "from-emerald-50 to-teal-50",
    glow: "green",
  },
  billing: {
    color: "#3B82F6",
    badge: "text-blue-600",
    badgeBg: "bg-blue-50",
    bg: "from-blue-50 to-indigo-50",
    glow: "blue",
  },
  analytics: {
    color: "#7C3AED",
    badge: "text-indigo-600",
    badgeBg: "bg-indigo-50",
    bg: "from-indigo-50 to-purple-50",
    glow: "indigo",
  },
} as const;

type FeatureKey = keyof typeof featureColorMap;

interface DemoCard {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  href: string;
  featureKey: FeatureKey;
  icon: React.ReactNode;
}

const DEMOS: DemoCard[] = [
  {
    id: "site-web",
    title: "Créez un site qui convertit",
    subtitle: "Walkthrough guidé bientôt disponible",
    category: "Site web",
    href: "/fonctionnalites/site-vitrine",
    featureKey: "site",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10A15.3 15.3 0 0112 2z" /></svg>,
  },
  {
    id: "commandes",
    title: "Suivez vos projets de A à Z",
    subtitle: "Démo guidée en préparation",
    category: "Projets",
    href: "/fonctionnalites/commandes",
    featureKey: "projects",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg>,
  },
  {
    id: "clients",
    title: "Un CRM pensé pour les créatifs",
    subtitle: "Tutoriel express bientôt disponible",
    category: "CRM",
    href: "/fonctionnalites/crm",
    featureKey: "crm",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>,
  },
  {
    id: "facturation",
    title: "Facturation sans friction",
    subtitle: "Aperçu vidéo en préparation",
    category: "Facturation",
    href: "/fonctionnalites/facturation",
    featureKey: "billing",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /><path d="M9 15l2 2 4-4" /></svg>,
  },
  {
    id: "analytics",
    title: "Visualisez votre croissance",
    subtitle: "Démo guidée bientôt disponible",
    category: "Analytics",
    href: "/fonctionnalites/analytics",
    featureKey: "analytics",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" /></svg>,
  },
];

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

/* ── Teaser Video Card ── */

function VideoCard({ demo, featured = false }: { demo: DemoCard; featured?: boolean }) {
  const c = featureColorMap[demo.featureKey];

  return (
    <motion.div variants={fadeUp} className="h-full">
      <Link href={demo.href} className="block h-full">
        <div className={`group relative overflow-hidden transition-all duration-300 h-full border-r border-b border-[#EEEFF2] ${featured ? "flex flex-col" : ""}`}>

          {/* ── Preview zone ── */}
          <div
            className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br ${c.bg} ${featured ? "flex-1 min-h-[140px]" : "aspect-[16/9]"}`}
          >
            {/* Dot grid pattern */}
            <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: `radial-gradient(${c.color}40 1px, transparent 1px)`, backgroundSize: "16px 16px" }} />

            {/* Glow central teinté */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[50px] opacity-30 group-hover:opacity-50 transition-opacity duration-500" style={{ width: featured ? 220 : 140, height: featured ? 220 : 140, background: `radial-gradient(circle, ${c.color}25, transparent)` }} />

            {/* Ghost UI wireframe */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-[0.07] group-hover:opacity-[0.10] transition-opacity duration-500 pointer-events-none">
              <div className="w-[55%] h-2 rounded-full" style={{ background: c.color }} />
              <div className="w-[40%] h-1.5 rounded-full" style={{ background: c.color }} />
              <div className="w-[30%] h-1.5 rounded-full" style={{ background: c.color }} />
            </div>

            {/* Play button premium */}
            <div className="relative z-10">
              <div
                className={`rounded-full flex items-center justify-center group-hover:scale-110 transition-all duration-300 ${featured ? "w-14 h-14" : "w-10 h-10"}`}
                style={{
                  background: "rgba(255,255,255,0.92)",
                  boxShadow: `0 4px 20px ${c.color}18, 0 0 0 1px ${c.color}10, 0 1px 3px rgba(0,0,0,0.06)`,
                }}
              >
                <svg width={featured ? "18" : "13"} height={featured ? "18" : "13"} viewBox="0 0 24 24" fill={c.color} stroke="none" className="ml-0.5">
                  <polygon points="8 5 20 12 8 19" />
                </svg>
              </div>
              {/* Ring halo au hover */}
              <div
                className="absolute rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  width: featured ? 72 : 52,
                  height: featured ? 72 : 52,
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  border: `1.5px solid ${c.color}15`,
                }}
              />
            </div>

            {/* Badge "Bientôt" */}
            <div className={`absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-semibold uppercase tracking-wider ${c.badge} ${c.badgeBg}`}>
              <span className="w-1 h-1 rounded-full animate-pulse" style={{ background: c.color }} />
              Bientôt
            </div>

            {/* Scrubber fantôme */}
            <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ background: `${c.color}08` }}>
              <div className="h-full rounded-r-full opacity-60 group-hover:opacity-100 transition-opacity duration-500" style={{ width: "35%", background: `linear-gradient(90deg, ${c.color}30, ${c.color}15)` }} />
            </div>
          </div>

          {/* ── Content ── */}
          <div className={featured ? "p-4 sm:p-5" : "p-3 sm:p-3.5"}>
            <div className="flex items-center gap-2 mb-1.5">
              <div className={`rounded-md flex items-center justify-center ${c.badgeBg} ${featured ? "w-6 h-6" : "w-5 h-5"}`} style={{ color: c.color }}>
                {demo.icon}
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-wider ${c.badge}`}>{demo.category}</span>
            </div>
            <h3 className={`font-bold text-[#191919] leading-snug ${featured ? "text-[16px] sm:text-[18px] mb-1.5" : "text-[13px] mb-1"}`}>{demo.title}</h3>
            <p className={`text-[#B0B0B0] leading-snug ${featured ? "text-[12px]" : "text-[10px]"}`}>{demo.subtitle}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ── Section ── */

export default function DemosSoon() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} id="demos" className="relative py-14 sm:py-16 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-[#FAFAFF] to-white" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-gradient-to-br from-violet-100/15 to-indigo-100/10 blur-[100px] pointer-events-none" />

      <div className="relative max-w-[940px] mx-auto px-5">
        <motion.div initial="hidden" animate={isInView ? "visible" : "hidden"} variants={stagger}>
          {/* Header */}
          <motion.div variants={fadeUp} className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
            <h2 className="text-[28px] sm:text-[38px] font-extrabold text-[#111118] tracking-tight leading-[1.1] mb-2.5">
              Découvrez Jestly{" "}
              <span className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] bg-clip-text text-transparent">en action</span>
            </h2>
            <p className="text-[15px] sm:text-[16px] text-[#6B7280] leading-relaxed">
              Des walkthroughs guidés pour chaque fonctionnalité — bientôt disponibles.
            </p>
          </motion.div>

          {/* Galerie — un seul rectangle */}
          <div className="rounded-2xl border border-[#E6E6E4] overflow-hidden bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            {/* Desktop : grid 2×3 */}
            <div className="hidden lg:grid grid-cols-2 grid-rows-3">
              <div className="row-span-2">
                <VideoCard demo={DEMOS[0]} featured />
              </div>
              <div><VideoCard demo={DEMOS[1]} /></div>
              <div><VideoCard demo={DEMOS[2]} /></div>
              <div><VideoCard demo={DEMOS[3]} /></div>
              <div><VideoCard demo={DEMOS[4]} /></div>
            </div>

            {/* Mobile/tablet */}
            <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2">
              {DEMOS.map((d) => (
                <VideoCard key={d.id} demo={d} />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
