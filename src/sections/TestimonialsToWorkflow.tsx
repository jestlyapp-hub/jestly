"use client";

import { useState, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
} from "framer-motion";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════════════════════
   TESTIMONIALS → WORKFLOW — Cinematic Hybrid Section
   DNA: Stripe immersion × Linear transitions × Apple cinematic scroll
   Single continuous block: Light proof → Gradient dissolve → Dark system
   ═══════════════════════════════════════════════════════════════════════ */

const ease = [0.22, 1, 0.36, 1] as const;

/* ═══════════════════════════════════════════════════════════════════════
   TESTIMONIALS DATA
   ═══════════════════════════════════════════════════════════════════════ */

interface Testimonial {
  id: string;
  name: string;
  role: string;
  city: string;
  initials: string;
  color: string;
  colorBg: string;
  category: string;
  quote: string;
  tags: string[];
  featured?: boolean;
  before?: string;
  after?: string;
  metric?: { value: string; label: string };
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: "clara", name: "Clara Dumont", role: "Designer freelance", city: "Lyon", initials: "CD",
    color: "#7C5CFF", colorBg: "rgba(124,92,255,0.07)", category: "Design",
    quote: "Avant j'avais mes devis dans Notion, mes échanges dans les mails, et mon suivi projet dans un tableur. Depuis Jestly, j'ai une vision claire de tout. Mes devis partent en 2 clics, et je sais exactement qui me doit quoi.",
    tags: ["4 outils remplacés", "Devis 3x plus rapides"], featured: true,
    before: "Notion + Drive + Excel + mails", after: "Tout centralisé dans Jestly",
    metric: { value: "14", label: "clients actifs" },
  },
  {
    id: "lucas", name: "Lucas Bernard", role: "Développeur freelance", city: "Toulouse", initials: "LB",
    color: "#F59E0B", colorBg: "rgba(245,158,11,0.07)", category: "Dev",
    quote: "J'ai testé plein d'outils : trop complexes, trop chers, ou trop limités. Jestly a trouvé le bon équilibre. Je gère mes sprints, je facture, et je suis mes clients — le tout dans une interface que j'ai plaisir à ouvrir chaque matin.",
    tags: ["Interface plaisante", "Facturation intégrée"], featured: true,
    before: "Linear + Stripe + Notion + mails", after: "Projets + factures + CRM unifié",
    metric: { value: "6", label: "clients récurrents" },
  },
  { id: "mathis", name: "Mathis Renaud", role: "Monteur vidéo", city: "Bordeaux", initials: "MR", color: "#FF6B35", colorBg: "rgba(255,107,53,0.07)", category: "Vidéo", quote: "Je perdais des briefs dans mes mails et j'oubliais de relancer mes clients. Maintenant, chaque projet a son espace et les relances partent toutes seules.", tags: ["Zéro brief perdu", "Relances auto"] },
  { id: "ines", name: "Inès Bakir", role: "Consultante stratégie", city: "Paris", initials: "IB", color: "#10B981", colorBg: "rgba(16,185,129,0.07)", category: "Conseil", quote: "En tant que consultante, je dois suivre mes missions, mes heures et mes factures en même temps. Jestly m'a permis de tout regrouper sans complexité.", tags: ["3 outils remplacés", "Vision pipeline nette"] },
  { id: "noah", name: "Noah Petit", role: "Motion designer", city: "Nantes", initials: "NP", color: "#8B5CF6", colorBg: "rgba(139,92,246,0.07)", category: "Créatif", quote: "Je cherchais un outil qui comprenne la réalité d'un freelance créatif. Pas un ERP complexe. Jestly, c'est exactement ça : l'essentiel, bien fait.", tags: ["Charge mentale réduite", "Portfolio intégré"] },
  { id: "sarah", name: "Sarah Morel", role: "Photographe", city: "Marseille", initials: "SM", color: "#3B82F6", colorBg: "rgba(59,130,246,0.07)", category: "Photo", quote: "Je passais plus de temps à gérer l'admin qu'à shooter. Avec Jestly, mes clients réservent, reçoivent leurs devis, et je suis mes paiements au même endroit.", tags: ["Admin divisé par 2", "Paiements suivis"], metric: { value: "6", label: "shootings/mois" } },
  { id: "julie", name: "Julie Marchand", role: "Community manager", city: "Lille", initials: "JM", color: "#EC4899", colorBg: "rgba(236,72,153,0.07)", category: "Social", quote: "Gérer 8 clients avec chacun leur brief, leur facturation et leurs deadlines, c'était l'enfer. Jestly a remis de l'ordre sans que j'aie besoin de tout restructurer.", tags: ["Multi-clients simplifié", "Deadlines claires"] },
  { id: "thomas", name: "Thomas Garnier", role: "Rédacteur freelance", city: "Strasbourg", initials: "TG", color: "#0EA5E9", colorBg: "rgba(14,165,233,0.07)", category: "Rédaction", quote: "Le fait d'avoir mon portfolio, mes clients et ma facturation au même endroit m'a retiré une vraie charge mentale. Je me concentre enfin sur l'écriture.", tags: ["Charge mentale réduite", "Tout au même endroit"] },
];

/* ═══════════════════════════════════════════════════════════════════════
   WORKFLOW DATA
   ═══════════════════════════════════════════════════════════════════════ */

const STEPS = [
  { id: "lead", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z", label: "Client entrant", description: "Un prospect arrive via votre site ou par email.", tag: "Automatisé" },
  { id: "quote", icon: "M9 7h6m-6 4h6m-6 4h4M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z", label: "Devis envoyé", description: "Créez et envoyez un devis en quelques clics.", tag: "Connecté" },
  { id: "payment", icon: "M21 4H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM1 10h22", label: "Paiement reçu", description: "Suivi automatique, relances intelligentes.", tag: "Sans friction" },
  { id: "project", icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 5h6M9 14l2 2 4-4", label: "Projet géré", description: "Tâches, deadlines et livrables organisés.", tag: "Centralisé" },
  { id: "delivery", icon: "M3 3h18v18H3zM3 9h18M9 21V9", label: "Site livré", description: "Publiez le projet sur votre portfolio Jestly.", tag: "Publié" },
];

const FLOATERS = [
  { content: "Sophie Martin", sub: "Nouveau lead", x: "8%", y: "18%", delay: 0 },
  { content: "+1 247 €", sub: "Paiement reçu", x: "85%", y: "15%", delay: 0.8 },
  { content: "Projet livré", sub: "Il y a 2 min", x: "78%", y: "72%", delay: 1.6 },
  { content: "4.9 / 5", sub: "Satisfaction", x: "5%", y: "68%", delay: 2.2 },
];

/* ═══════════════════════════════════════════════════════════════════════
   TESTIMONIAL CARDS
   ═══════════════════════════════════════════════════════════════════════ */

function FeaturedCard({ t, index }: { t: Testimonial; index: number }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div className="relative group" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.6, delay: index * 0.12, ease }} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <motion.div className="relative rounded-[28px] overflow-hidden h-full" style={{ background: "white", border: "1px solid #EEEFF2" }} animate={{ boxShadow: hovered ? `0 20px 50px rgba(0,0,0,0.06), 0 0 0 1px ${t.color}20` : "0 2px 16px rgba(0,0,0,0.03)", y: hovered ? -4 : 0 }} transition={{ type: "spring", damping: 30, stiffness: 250 }}>
        <div className="h-[3px]" style={{ background: `linear-gradient(90deg, ${t.color}, ${t.color}66, transparent)` }} />
        <div className="p-6 sm:p-8 flex flex-col">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-[13px] font-bold text-white flex-shrink-0" style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}BB)` }}>{t.initials}</div>
              <div>
                <div className="text-[14px] font-semibold" style={{ color: "#111118" }}>{t.name}</div>
                <div className="text-[12px] font-medium" style={{ color: "#8A8FA3" }}>{t.role} &middot; {t.city}</div>
              </div>
            </div>
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-semibold flex-shrink-0" style={{ background: t.colorBg, color: t.color }}>{t.category}</span>
          </div>
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none" className="mb-3 flex-shrink-0"><rect width="40" height="40" rx="10" fill={t.colorBg} /><path d="M16.5 24.5c-1.333 0-2.333-.433-3-.7C12.833 23.133 12.5 22.167 12.5 21c0-.833.233-1.7.7-2.6.5-.9 1.233-1.733 2.2-2.5l1.3 1.2c-.567.5-1 1-1.3 1.5-.267.467-.4.933-.4 1.4h1.5c.567 0 1.017.183 1.35.55.367.333.55.783.55 1.35v1.05c0 .567-.183 1.05-.55 1.45-.333.367-.783.55-1.35.55zm8 0c-1.333 0-2.333-.433-3-.7C20.833 23.133 20.5 22.167 20.5 21c0-.833.233-1.7.7-2.6.5-.9 1.233-1.733 2.2-2.5l1.3 1.2c-.567.5-1 1-1.3 1.5-.267.467-.4.933-.4 1.4h1.5c.567 0 1.017.183 1.35.55.367.333.55.783.55 1.35v1.05c0 .567-.183 1.05-.55 1.45-.333.367-.783.55-1.35.55z" fill={t.color} /></svg>
          <blockquote className="text-[15px] sm:text-[16px] leading-[1.7] font-medium mb-5" style={{ color: "#111118" }}>{t.quote}</blockquote>
          {t.before && t.after && (
            <div className="rounded-2xl overflow-hidden mb-5" style={{ background: "#FAFAFA", border: "1px solid #F0F0EE" }}>
              <div className="grid grid-cols-2 divide-x divide-[#F0F0EE]">
                <div className="px-4 py-3"><div className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: "#B0B3C0" }}>Avant</div><div className="text-[11px] font-medium leading-snug" style={{ color: "#78716C" }}>{t.before}</div></div>
                <div className="px-4 py-3"><div className="flex items-center gap-1 mb-1"><div className="text-[9px] font-bold uppercase tracking-wider" style={{ color: t.color }}>Maintenant</div><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={t.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></div><div className="text-[11px] font-semibold leading-snug" style={{ color: "#111118" }}>{t.after}</div></div>
              </div>
            </div>
          )}
          <div className="mt-auto flex items-center flex-wrap gap-2">
            {t.tags.map((tag) => (<span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold" style={{ background: t.colorBg, color: t.color, border: `1px solid ${t.color}12` }}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" /></svg>{tag}</span>))}
            {t.metric && (<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold ml-auto" style={{ background: "#F0FDF4", color: "#059669", border: "1px solid #D1FAE5" }}><span className="text-[13px] tabular-nums">{t.metric.value}</span>{t.metric.label}</span>)}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function StandardCard({ t, index }: { t: Testimonial; index: number }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div className="relative group" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.5, delay: 0.15 + index * 0.06, ease }} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <motion.div className="relative rounded-[22px] overflow-hidden h-full flex flex-col" style={{ background: "white", border: "1px solid #EEEFF2" }} animate={{ boxShadow: hovered ? `0 16px 40px rgba(0,0,0,0.05), 0 0 0 1px ${t.color}18` : "0 1px 8px rgba(0,0,0,0.02)", y: hovered ? -3 : 0 }} transition={{ type: "spring", damping: 30, stiffness: 280 }}>
        <div className="p-5 sm:p-6 flex flex-col h-full">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0" style={{ background: t.color }}>{t.initials}</div>
            <div className="flex-1 min-w-0"><div className="text-[13px] font-semibold truncate" style={{ color: "#111118" }}>{t.name}</div><div className="text-[11px] font-medium truncate" style={{ color: "#8A8FA3" }}>{t.role}</div></div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-semibold flex-shrink-0" style={{ background: t.colorBg, color: t.color }}>{t.category}</span>
          </div>
          <blockquote className="text-[13px] leading-[1.65] font-medium mb-4 flex-1" style={{ color: "#3A3A42" }}>&ldquo;{t.quote}&rdquo;</blockquote>
          <div className="flex items-center flex-wrap gap-1.5">
            {t.tags.map((tag) => (<span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-semibold" style={{ background: t.colorBg, color: t.color }}><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4" /></svg>{tag}</span>))}
            {t.metric && (<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold ml-auto" style={{ background: "#F0FDF4", color: "#059669" }}><span className="text-[11px] tabular-nums">{t.metric.value}</span>{t.metric.label}</span>)}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   WORKFLOW COMPONENTS
   ═══════════════════════════════════════════════════════════════════════ */

function StepCard({ step, index }: { step: typeof STEPS[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} className="relative flex-shrink-0 w-[200px] sm:w-[210px] lg:w-[220px] group cursor-default" initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.2 + index * 0.15, ease }}>
      <motion.div className="relative rounded-2xl p-5 h-full border transition-colors duration-300" style={{ background: "rgba(26,26,36,0.8)", borderColor: "rgba(255,255,255,0.06)", backdropFilter: "blur(12px)" }} whileHover={{ scale: 1.05, borderColor: "rgba(124,92,255,0.3)", boxShadow: "0 0 40px rgba(124,92,255,0.12), 0 8px 32px rgba(0,0,0,0.3)" }} transition={{ type: "spring", stiffness: 200, damping: 20 }}>
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 0%, rgba(124,92,255,0.08), transparent 70%)" }} />
        <div className="absolute -top-3 -left-1 w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-extrabold" style={{ background: "linear-gradient(135deg, #7C5CFF, #6F5BFF)", color: "white", boxShadow: "0 2px 12px rgba(124,92,255,0.4)" }}>{String(index + 1).padStart(2, "0")}</div>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: "linear-gradient(135deg, rgba(124,92,255,0.15), rgba(124,92,255,0.05))", border: "1px solid rgba(124,92,255,0.12)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B197FC" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={step.icon} /></svg>
        </div>
        <h3 className="text-[14px] font-bold text-white mb-1">{step.label}</h3>
        <p className="text-[11px] leading-relaxed mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>{step.description}</p>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider" style={{ background: "rgba(124,92,255,0.1)", color: "#B197FC", border: "1px solid rgba(124,92,255,0.12)" }}><span className="w-1 h-1 rounded-full" style={{ background: "#B197FC" }} />{step.tag}</span>
      </motion.div>
    </motion.div>
  );
}

function ConnectionLine({ index, direction }: { index: number; direction: "horizontal" | "vertical" }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  if (direction === "vertical") {
    return (
      <div ref={ref} className="flex justify-center py-1">
        <div className="relative w-px h-12 overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <motion.div className="absolute top-0 left-0 w-full" style={{ height: "40%", background: "linear-gradient(to bottom, transparent, #7C5CFF, transparent)" }} animate={inView ? { top: ["-40%", "100%"] } : {}} transition={{ duration: 1.8, delay: 0.3 + index * 0.2, repeat: Infinity, repeatDelay: 2, ease: "linear" }} />
        </div>
      </div>
    );
  }
  return (
    <div ref={ref} className="flex items-center flex-shrink-0 px-1">
      <div className="relative w-10 sm:w-14 lg:w-16 h-px overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <motion.div className="absolute top-0 left-0 h-full" style={{ width: "40%", background: "linear-gradient(to right, transparent, #7C5CFF, transparent)" }} animate={inView ? { left: ["-40%", "100%"] } : {}} transition={{ duration: 1.8, delay: 0.3 + index * 0.2, repeat: Infinity, repeatDelay: 2, ease: "linear" }} />
      </div>
    </div>
  );
}

function FloatingElement({ content, sub, x, y, delay }: typeof FLOATERS[number]) {
  return (
    <motion.div className="absolute hidden lg:flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl pointer-events-none" style={{ left: x, top: y, background: "rgba(26,26,36,0.7)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.5 + delay * 0.3, ease }} animate={{ y: [0, -6, 0] }}>
      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#7C5CFF", boxShadow: "0 0 8px rgba(124,92,255,0.5)" }} />
      <div>
        <div className="text-[11px] font-semibold text-white leading-tight">{content}</div>
        <div className="text-[9px] font-medium leading-tight" style={{ color: "rgba(255,255,255,0.4)" }}>{sub}</div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN HYBRID SECTION
   ═══════════════════════════════════════════════════════════════════════ */

export default function TestimonialsToWorkflow() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });

  // Background color transition: light → dark
  // 0-0.35 = light, 0.35-0.55 = transition, 0.55-1 = dark
  const bgR = useTransform(scrollYProgress, [0, 0.35, 0.55], [247, 30, 15]);
  const bgG = useTransform(scrollYProgress, [0, 0.35, 0.55], [247, 26, 15]);
  const bgB = useTransform(scrollYProgress, [0, 0.35, 0.55], [251, 36, 20]);

  // Grid opacity: light grid → dark grid
  const lightGridOpacity = useTransform(scrollYProgress, [0, 0.35, 0.5], [0.025, 0.01, 0]);
  const darkGridOpacity = useTransform(scrollYProgress, [0.4, 0.55, 1], [0, 0.03, 0.03]);

  // Purple glow in transition zone
  const glowOpacity = useTransform(scrollYProgress, [0.25, 0.45, 0.65], [0, 0.12, 0.06]);
  const glowScale = useTransform(scrollYProgress, [0.25, 0.45], [0.8, 1]);

  // Bridge text
  const bridgeOpacity = useTransform(scrollYProgress, [0.3, 0.4, 0.48, 0.55], [0, 1, 1, 0]);
  const bridgeScale = useTransform(scrollYProgress, [0.3, 0.4, 0.55], [0.95, 1, 1.02]);
  const bridgeY = useTransform(scrollYProgress, [0.3, 0.4, 0.55], [30, 0, -20]);

  const featured = TESTIMONIALS.filter((t) => t.featured);
  const standard = TESTIMONIALS.filter((t) => !t.featured);
  const visibleStandard = standard.slice(0, Math.floor(standard.length / 3) * 3);

  return (
    <section ref={sectionRef} className="relative w-full">
      {/* ── Dynamic background ── */}
      <motion.div className="absolute inset-0 pointer-events-none" style={{ background: useTransform([bgR, bgG, bgB], ([r, g, b]) => `rgb(${r},${g},${b})`) }} />

      {/* ── Light grid (top) ── */}
      <motion.div className="absolute inset-0 pointer-events-none" style={{ opacity: lightGridOpacity, backgroundImage: "linear-gradient(rgba(124,92,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(124,92,255,1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      {/* ── Dark grid (bottom) ── */}
      <motion.div className="absolute inset-0 pointer-events-none" style={{ opacity: darkGridOpacity, backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      {/* ── Center glow (transition zone) ── */}
      <motion.div
        className="absolute left-1/2 pointer-events-none -translate-x-1/2 w-[900px] h-[900px] rounded-full"
        style={{
          top: "42%",
          background: "radial-gradient(ellipse, rgba(124,92,255,0.35) 0%, rgba(124,92,255,0.08) 30%, transparent 65%)",
          opacity: glowOpacity,
          scale: glowScale,
        }}
      />

      {/* ── Floating transition shapes ── */}
      <motion.div
        className="absolute left-[15%] pointer-events-none w-[300px] h-[300px] rounded-full"
        style={{
          top: "38%",
          background: "radial-gradient(circle, rgba(124,92,255,0.1), transparent 70%)",
          opacity: useTransform(scrollYProgress, [0.3, 0.45, 0.6], [0, 0.8, 0]),
          filter: "blur(60px)",
        }}
      />
      <motion.div
        className="absolute right-[10%] pointer-events-none w-[250px] h-[250px] rounded-full"
        style={{
          top: "40%",
          background: "radial-gradient(circle, rgba(139,92,246,0.08), transparent 70%)",
          opacity: useTransform(scrollYProgress, [0.32, 0.47, 0.62], [0, 0.7, 0]),
          filter: "blur(50px)",
        }}
      />

      {/* ════════════════════════════════════════════════════════════════════
         CONTENT
         ════════════════════════════════════════════════════════════════════ */}
      <div className="relative z-10">

        {/* ════════ PART 1: TESTIMONIALS (LIGHT) ════════ */}
        <div className="max-w-7xl mx-auto px-6 pt-24 sm:pt-32 lg:pt-40 pb-32 sm:pb-40">
          {/* Header */}
          <div className="text-center mb-14 sm:mb-16">
            <motion.div className="mb-4" initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease }}>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-semibold" style={{ background: "rgba(124,92,255,0.08)", color: "#7C5CFF", border: "1px solid rgba(124,92,255,0.12)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                Retours utilisateurs
              </span>
            </motion.div>
            <motion.h2 className="text-[26px] sm:text-[34px] md:text-[42px] lg:text-[48px] font-extrabold leading-[1.1] tracking-[-0.03em] mb-4" style={{ color: "#111118" }} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.08, ease }}>
              Ils ne veulent plus revenir<br />
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #7C5CFF 0%, #9F7BFF 50%, #6F5BFF 100%)" }}>à leurs outils dispersés</span>
            </motion.h2>
            <motion.p className="text-[14px] sm:text-[16px] leading-relaxed max-w-xl mx-auto" style={{ color: "#66697A" }} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.16, ease }}>
              Designers, monteurs, développeurs et consultants utilisent Jestly pour centraliser leur activité sans complexifier leur quotidien.
            </motion.p>
          </div>

          {/* Featured cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 mb-5 sm:mb-6">
            {featured.map((t, i) => <FeaturedCard key={t.id} t={t} index={i} />)}
          </div>

          {/* Standard grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {visibleStandard.map((t, i) => <StandardCard key={t.id} t={t} index={i} />)}
          </div>
        </div>

        {/* ════════ PART 2: BRIDGE (TRANSITION) ════════ */}
        <motion.div
          className="flex flex-col items-center justify-center py-24 sm:py-32 px-6 text-center"
          style={{ opacity: bridgeOpacity, scale: bridgeScale, y: bridgeY }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-semibold mb-5" style={{ background: "rgba(124,92,255,0.12)", color: "#B197FC", border: "1px solid rgba(124,92,255,0.18)" }}>
            <span className="w-[6px] h-[6px] rounded-full animate-pulse" style={{ background: "#7C5CFF" }} />
            Un système complet
          </span>
          <h2 className="text-[28px] sm:text-[38px] md:text-[48px] font-extrabold leading-[1.08] tracking-[-0.03em] text-white">
            Tout est connecté.
            <br />
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #7C5CFF, #B197FC, #7C5CFF)" }}>Sans friction.</span>
          </h2>
        </motion.div>

        {/* ════════ PART 3: WORKFLOW (DARK) ════════ */}
        <div className="max-w-7xl mx-auto px-6 pb-28 sm:pb-36 lg:pb-44">
          {/* Workflow header */}
          <div className="text-center mb-16 sm:mb-20">
            <motion.div className="mb-5" initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease }}>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-semibold" style={{ background: "rgba(124,92,255,0.1)", color: "#B197FC", border: "1px solid rgba(124,92,255,0.15)" }}>
                <span className="w-[6px] h-[6px] rounded-full animate-pulse" style={{ background: "#7C5CFF" }} />
                Workflow complet
              </span>
            </motion.div>
            <motion.h2 className="text-[28px] sm:text-[38px] md:text-[48px] lg:text-[56px] font-extrabold leading-[1.08] tracking-[-0.03em] mb-5 text-white" initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.08, ease }}>
              Gérez tout votre business<br />
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #7C5CFF 0%, #B197FC 40%, #7C5CFF 80%)" }}>dans un seul système fluide</span>
            </motion.h2>
            <motion.p className="text-[15px] sm:text-[17px] leading-relaxed max-w-lg mx-auto" style={{ color: "rgba(255,255,255,0.45)" }} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.16, ease }}>
              Du premier client au paiement final, tout est connecté dans Jestly.
            </motion.p>
          </div>

          {/* Flow */}
          <div className="relative mb-20 sm:mb-24">
            {FLOATERS.map((f) => <FloatingElement key={f.content} {...f} />)}
            <div className="hidden md:flex items-center justify-center">
              {STEPS.map((step, i) => (<div key={step.id} className="flex items-center"><StepCard step={step} index={i} />{i < STEPS.length - 1 && <ConnectionLine index={i} direction="horizontal" />}</div>))}
            </div>
            <div className="flex flex-col items-center md:hidden">
              {STEPS.map((step, i) => (<div key={step.id} className="flex flex-col items-center"><StepCard step={step} index={i} />{i < STEPS.length - 1 && <ConnectionLine index={i} direction="vertical" />}</div>))}
            </div>
          </div>

          {/* CTA */}
          <motion.div className="text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3, ease }}>
            <p className="text-[15px] sm:text-[17px] font-medium mb-6" style={{ color: "rgba(255,255,255,0.5)" }}>Tout est déjà prêt. Il ne reste qu&apos;à commencer.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/login" className="group relative px-8 py-4 rounded-2xl text-[14px] sm:text-[15px] font-semibold text-white overflow-hidden transition-all duration-300 hover:-translate-y-[2px] active:translate-y-0 active:scale-[0.98]" style={{ background: "linear-gradient(135deg, #7C5CFF, #6F5BFF)", boxShadow: "0 8px 32px rgba(124,92,255,0.35), 0 0 0 1px rgba(124,92,255,0.2)" }}>
                <span className="relative z-10">Créer mon premier client</span>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </Link>
              <Link href="#demo" className="px-6 py-4 rounded-2xl text-[14px] font-semibold transition-all duration-300 hover:border-white/20 hover:bg-white/[0.03]" style={{ color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.08)" }}>Voir la démo</Link>
            </div>
            <motion.div className="mt-8 flex flex-wrap items-center justify-center gap-5" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.5, ease }}>
              {["Gratuit pour commencer", "Sans engagement", "Données exportables"].map((item) => (
                <div key={item} className="flex items-center gap-1.5">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#7C5CFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4" /></svg>
                  <span className="text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.35)" }}>{item}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
