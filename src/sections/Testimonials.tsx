"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import SectionShell from "@/components/landing/SectionShell";

/* ═══════════════════════════════════════════════════════════════════════
   TESTIMONIALS WALL — Immediate Social Proof
   DNA: Stripe wall × Linear credibility × Apple editorial hierarchy
   Everything visible at first glance. No interaction required.
   ═══════════════════════════════════════════════════════════════════════ */

const ease = [0.22, 1, 0.36, 1] as const;

/* ═══════════════════════════════════════════════════════════════════════
   DATA
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
  // ── Featured ──
  {
    id: "clara",
    name: "Clara Dumont",
    role: "Designer freelance",
    city: "Lyon",
    initials: "CD",
    color: "#7C5CFF",
    colorBg: "rgba(124,92,255,0.07)",
    category: "Design",
    quote: "Avant j'avais mes devis dans Notion, mes échanges dans les mails, et mon suivi projet dans un tableur. Depuis Jestly, j'ai une vision claire de tout. Mes devis partent en 2 clics, et je sais exactement qui me doit quoi.",
    tags: ["4 outils remplacés", "Devis 3x plus rapides"],
    featured: true,
    before: "Notion + Drive + Excel + mails",
    after: "Tout centralisé dans Jestly",
    metric: { value: "14", label: "clients actifs" },
  },
  {
    id: "lucas",
    name: "Lucas Bernard",
    role: "Développeur freelance",
    city: "Toulouse",
    initials: "LB",
    color: "#F59E0B",
    colorBg: "rgba(245,158,11,0.07)",
    category: "Dev",
    quote: "J'ai testé plein d'outils : trop complexes, trop chers, ou trop limités. Jestly a trouvé le bon équilibre. Je gère mes sprints, je facture, et je suis mes clients — le tout dans une interface que j'ai plaisir à ouvrir chaque matin.",
    tags: ["Interface plaisante", "Facturation intégrée"],
    featured: true,
    before: "Linear + Stripe + Notion + mails",
    after: "Projets + factures + CRM unifié",
    metric: { value: "6", label: "clients récurrents" },
  },
  // ── Standard ──
  {
    id: "mathis",
    name: "Mathis Renaud",
    role: "Monteur vidéo",
    city: "Bordeaux",
    initials: "MR",
    color: "#FF6B35",
    colorBg: "rgba(255,107,53,0.07)",
    category: "Vidéo",
    quote: "Je perdais des briefs dans mes mails et j'oubliais de relancer mes clients. Maintenant, chaque projet a son espace et les relances partent toutes seules.",
    tags: ["Zéro brief perdu", "Relances auto"],
  },
  {
    id: "ines",
    name: "Inès Bakir",
    role: "Consultante stratégie",
    city: "Paris",
    initials: "IB",
    color: "#10B981",
    colorBg: "rgba(16,185,129,0.07)",
    category: "Conseil",
    quote: "En tant que consultante, je dois suivre mes missions, mes heures et mes factures en même temps. Jestly m'a permis de tout regrouper sans complexité.",
    tags: ["3 outils remplacés", "Vision pipeline nette"],
  },
  {
    id: "noah",
    name: "Noah Petit",
    role: "Motion designer",
    city: "Nantes",
    initials: "NP",
    color: "#8B5CF6",
    colorBg: "rgba(139,92,246,0.07)",
    category: "Créatif",
    quote: "Je cherchais un outil qui comprenne la réalité d'un freelance créatif. Pas un ERP complexe. Jestly, c'est exactement ça : l'essentiel, bien fait.",
    tags: ["Charge mentale réduite", "Portfolio intégré"],
  },
  {
    id: "sarah",
    name: "Sarah Morel",
    role: "Photographe",
    city: "Marseille",
    initials: "SM",
    color: "#3B82F6",
    colorBg: "rgba(59,130,246,0.07)",
    category: "Photo",
    quote: "Je passais plus de temps à gérer l'admin qu'à shooter. Avec Jestly, mes clients réservent, reçoivent leurs devis, et je suis mes paiements au même endroit.",
    tags: ["Admin divisé par 2", "Paiements suivis"],
    metric: { value: "6", label: "shootings/mois" },
  },
  {
    id: "julie",
    name: "Julie Marchand",
    role: "Community manager",
    city: "Lille",
    initials: "JM",
    color: "#EC4899",
    colorBg: "rgba(236,72,153,0.07)",
    category: "Social",
    quote: "Gérer 8 clients avec chacun leur brief, leur facturation et leurs deadlines, c'était l'enfer. Jestly a remis de l'ordre sans que j'aie besoin de tout restructurer.",
    tags: ["Multi-clients simplifié", "Deadlines claires"],
  },
  {
    id: "thomas",
    name: "Thomas Garnier",
    role: "Rédacteur freelance",
    city: "Strasbourg",
    initials: "TG",
    color: "#0EA5E9",
    colorBg: "rgba(14,165,233,0.07)",
    category: "Rédaction",
    quote: "Le fait d'avoir mon portfolio, mes clients et ma facturation au même endroit m'a retiré une vraie charge mentale. Je me concentre enfin sur l'écriture.",
    tags: ["Charge mentale réduite", "Tout au même endroit"],
  },
];

/* ═══════════════════════════════════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════════════════════════════════ */

/* ── Featured Card (large, editorial) ── */
function FeaturedCard({ t, index }: { t: Testimonial; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className="relative group"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: index * 0.12, ease }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        className="relative rounded-[28px] overflow-hidden h-full"
        style={{
          background: "white",
          border: "1px solid #EEEFF2",
        }}
        animate={{
          boxShadow: hovered
            ? `0 20px 50px rgba(0,0,0,0.06), 0 0 0 1px ${t.color}20`
            : "0 2px 16px rgba(0,0,0,0.03), 0 0 0 1px #EEEFF200",
          y: hovered ? -4 : 0,
        }}
        transition={{ type: "spring", damping: 30, stiffness: 250 }}
      >
        {/* Accent top bar */}
        <div className="h-[3px]" style={{ background: `linear-gradient(90deg, ${t.color}, ${t.color}66, transparent)` }} />

        <div className="p-6 sm:p-8 flex flex-col">
          {/* Header: avatar + info + category */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-[13px] font-bold text-white flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}BB)` }}
              >
                {t.initials}
              </div>
              <div>
                <div className="text-[14px] font-semibold" style={{ color: "#111118" }}>{t.name}</div>
                <div className="text-[12px] font-medium" style={{ color: "#8A8FA3" }}>
                  {t.role} &middot; {t.city}
                </div>
              </div>
            </div>
            <span
              className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-semibold flex-shrink-0"
              style={{ background: t.colorBg, color: t.color }}
            >
              {t.category}
            </span>
          </div>

          {/* Quote icon */}
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none" className="mb-3 flex-shrink-0">
            <rect width="40" height="40" rx="10" fill={t.colorBg} />
            <path
              d="M16.5 24.5c-1.333 0-2.333-.433-3-.7C12.833 23.133 12.5 22.167 12.5 21c0-.833.233-1.7.7-2.6.5-.9 1.233-1.733 2.2-2.5l1.3 1.2c-.567.5-1 1-1.3 1.5-.267.467-.4.933-.4 1.4h1.5c.567 0 1.017.183 1.35.55.367.333.55.783.55 1.35v1.05c0 .567-.183 1.05-.55 1.45-.333.367-.783.55-1.35.55zm8 0c-1.333 0-2.333-.433-3-.7C20.833 23.133 20.5 22.167 20.5 21c0-.833.233-1.7.7-2.6.5-.9 1.233-1.733 2.2-2.5l1.3 1.2c-.567.5-1 1-1.3 1.5-.267.467-.4.933-.4 1.4h1.5c.567 0 1.017.183 1.35.55.367.333.55.783.55 1.35v1.05c0 .567-.183 1.05-.55 1.45-.333.367-.783.55-1.35.55z"
              fill={t.color}
            />
          </svg>

          {/* Quote */}
          <blockquote className="text-[15px] sm:text-[16px] leading-[1.7] font-medium mb-5" style={{ color: "#111118" }}>
            {t.quote}
          </blockquote>

          {/* Before → After */}
          {t.before && t.after && (
            <div className="rounded-2xl overflow-hidden mb-5" style={{ background: "#FAFAFA", border: "1px solid #F0F0EE" }}>
              <div className="grid grid-cols-2 divide-x divide-[#F0F0EE]">
                <div className="px-4 py-3">
                  <div className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: "#B0B3C0" }}>Avant</div>
                  <div className="text-[11px] font-medium leading-snug" style={{ color: "#78716C" }}>{t.before}</div>
                </div>
                <div className="px-4 py-3">
                  <div className="flex items-center gap-1 mb-1">
                    <div className="text-[9px] font-bold uppercase tracking-wider" style={{ color: t.color }}>Maintenant</div>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={t.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <div className="text-[11px] font-semibold leading-snug" style={{ color: "#111118" }}>{t.after}</div>
                </div>
              </div>
            </div>
          )}

          {/* Tags + metric */}
          <div className="mt-auto flex items-center flex-wrap gap-2">
            {t.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold"
                style={{ background: t.colorBg, color: t.color, border: `1px solid ${t.color}12` }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                </svg>
                {tag}
              </span>
            ))}
            {t.metric && (
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold ml-auto"
                style={{ background: "#F0FDF4", color: "#059669", border: "1px solid #D1FAE5" }}
              >
                <span className="text-[13px] tabular-nums">{t.metric.value}</span>
                {t.metric.label}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Standard Card (compact, scannable) ── */
function StandardCard({ t, index }: { t: Testimonial; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className="relative group"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: 0.15 + index * 0.06, ease }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        className="relative rounded-[22px] overflow-hidden h-full flex flex-col"
        style={{
          background: "white",
          border: "1px solid #EEEFF2",
        }}
        animate={{
          boxShadow: hovered
            ? `0 16px 40px rgba(0,0,0,0.05), 0 0 0 1px ${t.color}18`
            : "0 1px 8px rgba(0,0,0,0.02)",
          y: hovered ? -3 : 0,
        }}
        transition={{ type: "spring", damping: 30, stiffness: 280 }}
      >
        <div className="p-5 sm:p-6 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center gap-2.5 mb-4">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
              style={{ background: t.color }}
            >
              {t.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold truncate" style={{ color: "#111118" }}>{t.name}</div>
              <div className="text-[11px] font-medium truncate" style={{ color: "#8A8FA3" }}>{t.role}</div>
            </div>
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-semibold flex-shrink-0"
              style={{ background: t.colorBg, color: t.color }}
            >
              {t.category}
            </span>
          </div>

          {/* Quote */}
          <blockquote className="text-[13px] leading-[1.65] font-medium mb-4 flex-1" style={{ color: "#3A3A42" }}>
            &ldquo;{t.quote}&rdquo;
          </blockquote>

          {/* Tags */}
          <div className="flex items-center flex-wrap gap-1.5">
            {t.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-semibold"
                style={{ background: t.colorBg, color: t.color }}
              >
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12l2 2 4-4" />
                </svg>
                {tag}
              </span>
            ))}
            {t.metric && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold ml-auto"
                style={{ background: "#F0FDF4", color: "#059669" }}
              >
                <span className="text-[11px] tabular-nums">{t.metric.value}</span>
                {t.metric.label}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN SECTION
   ═══════════════════════════════════════════════════════════════════════ */

export default function Testimonials() {
  const featured = TESTIMONIALS.filter((t) => t.featured);
  const standard = TESTIMONIALS.filter((t) => !t.featured);
  // Trim to nearest multiple of 3 for perfect grid symmetry
  const visibleStandard = standard.slice(0, Math.floor(standard.length / 3) * 3);

  return (
    <SectionShell atmosphere="warm" maxWidth="max-w-7xl">

        {/* ────────── PARTIE A: Header ────────── */}
        <div className="text-center mb-14 sm:mb-16">
          <motion.div
            className="mb-4"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease }}
          >
            <span
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-semibold"
              style={{ background: "rgba(124,92,255,0.08)", color: "#7C5CFF", border: "1px solid rgba(124,92,255,0.12)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Retours utilisateurs
            </span>
          </motion.div>

          <motion.h2
            className="text-[26px] sm:text-[34px] md:text-[42px] lg:text-[48px] font-extrabold leading-[1.1] tracking-[-0.03em] mb-4"
            style={{ color: "#111118" }}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.08, ease }}
          >
            Ils ne veulent plus revenir
            <br />
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #7C5CFF 0%, #9F7BFF 50%, #6F5BFF 100%)" }}>
              à leurs outils dispersés
            </span>
          </motion.h2>

          <motion.p
            className="text-[14px] sm:text-[16px] leading-relaxed max-w-xl mx-auto"
            style={{ color: "#66697A" }}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.16, ease }}
          >
            Designers, monteurs, développeurs et consultants utilisent Jestly
            pour centraliser leur activité sans complexifier leur quotidien.
          </motion.p>
        </div>

        {/* ────────── PARTIE B: Testimonials Wall ────────── */}

        {/* Featured row — 2 large editorial cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 mb-5 sm:mb-6">
          {featured.map((t, i) => (
            <FeaturedCard key={t.id} t={t} index={i} />
          ))}
        </div>

        {/* Uniform grid — 3 cols desktop, 2 cols tablet, 1 col mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {visibleStandard.map((t, i) => (
            <StandardCard key={t.id} t={t} index={i} />
          ))}
        </div>

        {/* ────────── PARTIE C: Proof Band ────────── */}
    </SectionShell>
  );
}
