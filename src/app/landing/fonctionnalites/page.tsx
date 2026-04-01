"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import SectionShell from "@/components/landing/SectionShell";
import TextSwapButton from "@/components/ui/TextSwapButton";

const ease = [0.22, 1, 0.36, 1] as const;

/* ═══════════════════════════════════════════════════════════════════════
   Feature data
   ═══════════════════════════════════════════════════════════════════════ */
const FEATURES = [
  {
    slug: "site-web",
    title: "Site web",
    description: "Créez un site freelance premium.",
    color: "#FF8A3D",
    icon: "M3 3h18v18H3zM3 9h18M9 21V9",
  },
  {
    slug: "crm",
    title: "CRM clients",
    description: "Centralisez prospects, clients et suivis.",
    color: "#EC4899",
    icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8 4 4 0 000 8",
  },
  {
    slug: "agenda",
    title: "Agenda",
    description: "Planifiez rendez-vous et deadlines.",
    color: "#4C8DFF",
    icon: "M3 4h18v18H3zM16 2v4M8 2v4M3 10h18",
  },
  {
    slug: "facturation",
    title: "Facturation",
    description: "Devis, factures, paiements, relances.",
    color: "#22c55e",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 14l2 2 4-4",
  },
  {
    slug: "commandes",
    title: "Commandes",
    description: "Gérez projets, statuts et livraisons.",
    color: "#F59E0B",
    icon: "M9 5H2v7l6.29 6.29a1 1 0 001.42 0l5.58-5.58a1 1 0 000-1.42z",
  },
  {
    slug: "analytics",
    title: "Analytics",
    description: "Revenus, performances, croissance.",
    color: "#7c3aed",
    icon: "M3 3v18h18M7 16l4-8 4 4 5-9",
  },
  {
    slug: "portfolio",
    title: "Portfolio",
    description: "Présentez vos projets avec une mise en scène premium.",
    color: "#A855F7",
    icon: "M4 4h16v16H4zM4 12h16M12 4v16",
  },
  {
    slug: "paiements",
    title: "Paiements",
    description: "Encaissez simplement, suivez vos paiements.",
    color: "#10B981",
    icon: "M1 4h22v16H1zM1 10h22",
  },
  {
    slug: "briefs",
    title: "Briefs",
    description: "Collectez les besoins clients structurés.",
    color: "#6366F1",
    icon: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z",
  },
];

const CONNECTED_POINTS = [
  "Une commande créée met à jour le CRM, l\u2019agenda et la facturation automatiquement.",
  "Chaque client a un profil unifié : commandes, paiements, briefs, échanges.",
  "Vos analytics se nourrissent de toutes vos données en temps réel.",
  "Aucune saisie en double : tout circule entre les modules.",
];

/* ═══════════════════════════════════════════════════════════════════════
   Page
   ═══════════════════════════════════════════════════════════════════════ */
export default function FonctionnalitesPage() {
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
            top: "10%",
            left: "20%",
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
            top: "50%",
            right: "10%",
            width: 600,
            height: 600,
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
              Fonctionnalités
            </span>
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6"
            style={{ color: "#111118" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease }}
          >
            Tout ce qu&apos;il faut pour{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #7C5CFF, #A78BFA)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              piloter ton activité.
            </span>
          </motion.h1>

          <motion.p
            className="text-lg max-w-2xl mx-auto"
            style={{ color: "#6B6F80" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease }}
          >
            Un seul outil pour remplacer ta stack entière. Site, CRM, agenda, facturation,
            commandes, analytics — tout est centralisé, connecté et pensé pour les freelances.
          </motion.p>
        </div>
      </SectionShell>

      {/* ── Feature grid ── */}
      <SectionShell atmosphere="system" className="relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.06, ease }}
            >
              <Link
                href={`/landing/${f.slug}`}
                className="group block rounded-2xl p-6 transition-shadow duration-300 hover:shadow-lg"
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #EEEDF2",
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: `${f.color}14` }}
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={f.color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={f.icon} />
                  </svg>
                </div>
                <h3
                  className="text-base font-semibold mb-1"
                  style={{ color: "#111118" }}
                >
                  {f.title}
                </h3>
                <p className="text-sm" style={{ color: "#6B6F80" }}>
                  {f.description}
                </p>
                <span
                  className="inline-flex items-center gap-1 text-xs font-medium mt-3 transition-colors duration-200"
                  style={{ color: f.color }}
                >
                  Découvrir
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </SectionShell>

      {/* ── Tout est connecté ── */}
      <SectionShell atmosphere="warm" className="relative z-10">
        <div className="text-center mb-10">
          <motion.h2
            className="text-3xl sm:text-4xl font-bold mb-4"
            style={{ color: "#111118" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
          >
            Tout est{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #7C5CFF, #A78BFA)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              connecté.
            </span>
          </motion.h2>
          <motion.p
            className="text-base max-w-xl mx-auto"
            style={{ color: "#6B6F80" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease }}
          >
            Pas de silos, pas de copier-coller. Chaque module communique avec les autres.
          </motion.p>
        </div>

        <div className="max-w-2xl mx-auto space-y-4">
          {CONNECTED_POINTS.map((point, i) => (
            <motion.div
              key={i}
              className="flex items-start gap-3 rounded-xl p-4"
              style={{
                background: "#FFFFFF",
                border: "1px solid #EEEDF2",
              }}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1, ease }}
            >
              <span
                className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background: "rgba(124,92,255,0.1)",
                  color: "#7C5CFF",
                }}
              >
                {i + 1}
              </span>
              <p className="text-sm" style={{ color: "#111118" }}>
                {point}
              </p>
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
            Prêt à tout centraliser ?
          </h2>
          <p className="text-base mb-8" style={{ color: "#6B6F80" }}>
            Rejoins les freelances qui ont simplifié leur quotidien avec Jestly.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <TextSwapButton
              label="Commencer gratuitement"
              href="/register"
              variant="primary"
              size="lg"
            />
            <TextSwapButton
              label="Voir les tarifs"
              href="/landing#pricing"
              variant="secondary"
              size="lg"
            />
          </div>
        </motion.div>
      </SectionShell>
    </div>
  );
}
