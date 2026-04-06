"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import SectionShell from "@/components/landing/SectionShell";
import TextSwapButton from "@/components/ui/TextSwapButton";

const ease = [0.22, 1, 0.36, 1] as const;

/* ═══════════════════════════════════════════════════════════════════════
   Persona data
   ═══════════════════════════════════════════════════════════════════════ */
const PERSONAS = [
  {
    slug: "createurs",
    emoji: "\u2726",
    title: "Créateurs",
    description:
      "Vidéastes, monteurs, thumbnail makers — gérez vos projets créatifs, vos clients et vos paiements sans quitter votre flow.",
  },
  {
    slug: "developpeurs",
    emoji: "\u27E8/\u27E9",
    title: "Développeurs",
    description:
      "Freelances tech et indie hackers — facturez, suivez vos missions et présentez votre portfolio depuis un seul outil.",
  },
  {
    slug: "designers",
    emoji: "\u25C7",
    title: "Designers",
    description:
      "Graphistes, UI/UX, branding — un espace unifié pour vos briefs, vos livrables et votre relation client.",
  },
  {
    slug: "agences",
    emoji: "\u25A3",
    title: "Agences",
    description:
      "Petites structures multi-clients — pilotez commandes, équipes et facturation sans multiplier les outils.",
  },
  {
    slug: "consultants",
    emoji: "\u25CE",
    title: "Consultants",
    description:
      "Missions, CRM et facturation — structurez votre activité de conseil avec un outil pensé pour votre rythme.",
  },
];

/* ═══════════════════════════════════════════════════════════════════════
   Page
   ═══════════════════════════════════════════════════════════════════════ */
export default function PourQuiPage() {
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
            top: "5%",
            left: "30%",
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
            bottom: "10%",
            right: "15%",
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
              Pour qui ?
            </span>
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6"
            style={{ color: "#111118" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease }}
          >
            Conçu pour les créatifs{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #7C5CFF, #A78BFA)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              qui veulent scaler.
            </span>
          </motion.h1>

          <motion.p
            className="text-lg max-w-2xl mx-auto"
            style={{ color: "#6B6F80" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease }}
          >
            Que tu sois vidéaste, dev, designer, consultant ou en agence — Jestly s&apos;adapte
            à ton métier pour que tu puisses te concentrer sur ce que tu fais de mieux.
          </motion.p>
        </div>
      </SectionShell>

      {/* ── Personas grid ── */}
      <SectionShell atmosphere="system" className="relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PERSONAS.map((p, i) => (
            <motion.div
              key={p.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease }}
            >
              <Link
                href={`/pour-qui/${p.slug}`}
                className="group block rounded-2xl p-6 transition-shadow duration-300 hover:shadow-lg"
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #EEEDF2",
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-xl transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: "rgba(124,92,255,0.08)",
                    color: "#7C5CFF",
                  }}
                >
                  {p.emoji}
                </div>
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: "#111118" }}
                >
                  {p.title}
                </h3>
                <p className="text-sm mb-3" style={{ color: "#6B6F80" }}>
                  {p.description}
                </p>
                <span
                  className="inline-flex items-center gap-1 text-xs font-medium transition-colors duration-200"
                  style={{ color: "#7C5CFF" }}
                >
                  Découvrir
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </SectionShell>

      {/* ── Un outil, tous les métiers ── */}
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
            Un outil,{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #7C5CFF, #A78BFA)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              tous les métiers.
            </span>
          </motion.h2>
          <motion.p
            className="text-base max-w-2xl mx-auto"
            style={{ color: "#6B6F80" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease }}
          >
            Jestly n&apos;est pas un outil générique. Chaque fonctionnalité a été pensée
            pour les problèmes concrets des freelances créatifs : gestion de projets,
            relation client, facturation, présence en ligne. Un seul abonnement,
            zéro compromis.
          </motion.p>
        </div>

        <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              title: "Adapté à ton rythme",
              desc: "Que tu gères 2 ou 20 clients par mois, Jestly suit ta cadence.",
            },
            {
              title: "Personnalisable",
              desc: "Active uniquement les modules dont tu as besoin, désactive le reste.",
            },
            {
              title: "Pensé mobile",
              desc: "Consulte tes commandes, réponds à tes clients, même en déplacement.",
            },
            {
              title: "Évolutif",
              desc: "Tu commences seul, tu grandis en équipe — Jestly grandit avec toi.",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="rounded-xl p-5"
              style={{
                background: "#FFFFFF",
                border: "1px solid #EEEDF2",
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1, ease }}
            >
              <h3 className="text-sm font-semibold mb-1" style={{ color: "#111118" }}>
                {item.title}
              </h3>
              <p className="text-sm" style={{ color: "#6B6F80" }}>
                {item.desc}
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
            Prêt à simplifier ton quotidien ?
          </h2>
          <p className="text-base mb-8" style={{ color: "#6B6F80" }}>
            Essaie Jestly gratuitement — aucun engagement, aucune carte bancaire.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <TextSwapButton
              label="Commencer gratuitement"
              href="/register"
              variant="primary"
              size="lg"
            />
            <TextSwapButton
              label="Voir les fonctionnalités"
              href="/fonctionnalites"
              variant="secondary"
              size="lg"
            />
          </div>
        </motion.div>
      </SectionShell>
    </div>
  );
}
