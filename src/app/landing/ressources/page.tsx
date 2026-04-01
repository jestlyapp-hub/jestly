"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import SectionShell from "@/components/landing/SectionShell";
import TextSwapButton from "@/components/ui/TextSwapButton";

const ease = [0.22, 1, 0.36, 1] as const;

/* ═══════════════════════════════════════════════════════════════════════
   Resource cards data
   ═══════════════════════════════════════════════════════════════════════ */
const RESOURCES = [
  {
    title: "Blog",
    description: "Conseils, retours d\u2019expérience et bonnes pratiques pour freelances créatifs.",
    href: "/blog",
    comingSoon: true,
    icon: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1M19 20l-7-5 7-5v10z",
  },
  {
    title: "Centre d\u2019aide",
    description: "Guides pas à pas pour maîtriser chaque fonctionnalité de Jestly.",
    href: "/centre-aide",
    comingSoon: true,
    icon: "M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M12 18h.01",
  },
  {
    title: "Templates",
    description: "Des modèles prêts à l\u2019emploi pour démarrer votre site, vos devis et vos factures.",
    href: "/templates",
    comingSoon: true,
    icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z",
  },
  {
    title: "Comparatifs",
    description: "Jestly face aux alternatives : Notion, Trello, Stripe et les autres.",
    href: "/comparatifs",
    comingSoon: false,
    icon: "M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2m6 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2",
  },
  {
    title: "Roadmap",
    description: "Découvrez ce qui arrive bientôt et votez pour vos fonctionnalités préférées.",
    href: "/roadmap",
    comingSoon: false,
    icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
  },
  {
    title: "FAQ",
    description: "Les réponses aux questions les plus fréquentes sur Jestly.",
    href: "/faq",
    comingSoon: false,
    icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    title: "Contact",
    description: "Une question, un partenariat, un bug ? Écrivez-nous directement.",
    href: "/contact",
    comingSoon: false,
    icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  },
];

/* ═══════════════════════════════════════════════════════════════════════
   Page
   ═══════════════════════════════════════════════════════════════════════ */
export default function RessourcesPage() {
  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(180deg, #F8F8FC 0%, #F4F3FA 100%)",
      }}
    >
      {/* Radial violet glows */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden
      >
        <div
          className="absolute"
          style={{
            top: "8%",
            left: "25%",
            width: 700,
            height: 700,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(124,92,255,0.08), transparent 70%)",
          }}
        />
        <div
          className="absolute"
          style={{
            bottom: "15%",
            right: "10%",
            width: 550,
            height: 550,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(139,92,246,0.06), transparent 70%)",
          }}
        />
      </div>

      {/* ── Hero ── */}
      <SectionShell atmosphere="hero" className="relative z-10 pt-32 pb-16 px-6">
        <div className="max-w-[1080px] mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
          >
            <span
              className="inline-block text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-6"
              style={{
                color: "#7C5CFF",
                background: "rgba(124,92,255,0.08)",
                border: "1px solid rgba(124,92,255,0.15)",
              }}
            >
              Ressources
            </span>
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6"
            style={{ color: "#111118" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease }}
          >
            Tout pour bien démarrer{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #7C5CFF, #A78BFA)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              et aller plus loin.
            </span>
          </motion.h1>

          <motion.p
            className="text-lg max-w-2xl mx-auto"
            style={{ color: "#6B6F80" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease }}
          >
            Guides, templates, comparatifs et FAQ — tout ce qu&apos;il faut pour tirer le meilleur de Jestly.
          </motion.p>
        </div>
      </SectionShell>

      {/* ── Resource grid ── */}
      <SectionShell atmosphere="system" className="relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {RESOURCES.map((r, i) => (
            <motion.div
              key={r.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.06, ease }}
            >
              <Link
                href={r.href}
                className="group block rounded-2xl p-6 transition-shadow duration-300 hover:shadow-lg relative"
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #EEEDF2",
                }}
              >
                {r.comingSoon && (
                  <span
                    className="absolute top-4 right-4 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{
                      color: "#7C5CFF",
                      background: "rgba(124,92,255,0.08)",
                      border: "1px solid rgba(124,92,255,0.15)",
                    }}
                  >
                    Bientôt
                  </span>
                )}
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: "rgba(124,92,255,0.08)" }}
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#7C5CFF"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={r.icon} />
                  </svg>
                </div>
                <h3
                  className="text-base font-semibold mb-1"
                  style={{ color: "#111118" }}
                >
                  {r.title}
                </h3>
                <p className="text-sm" style={{ color: "#6B6F80" }}>
                  {r.description}
                </p>
                <span
                  className="inline-flex items-center gap-1 text-xs font-medium mt-3 transition-colors duration-200"
                  style={{ color: "#7C5CFF" }}
                >
                  {r.comingSoon ? "À venir" : "Consulter"}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </SectionShell>

      {/* ── CTA ── */}
      <SectionShell atmosphere="elevated" className="relative z-10">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
        >
          <h2
            className="text-2xl sm:text-3xl font-bold mb-4"
            style={{ color: "#111118" }}
          >
            Besoin d&apos;aide pour démarrer ?
          </h2>
          <p className="text-base mb-8" style={{ color: "#6B6F80" }}>
            Créez votre compte en 30 secondes et découvrez Jestly par vous-même.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <TextSwapButton
              label="Commencer gratuitement"
              href="/register"
              variant="primary"
              size="lg"
            />
            <TextSwapButton
              label="Contacter l'équipe"
              href="/contact"
              variant="secondary"
              size="lg"
            />
          </div>
        </motion.div>
      </SectionShell>
    </div>
  );
}
