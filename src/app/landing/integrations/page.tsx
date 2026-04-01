"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import TextSwapButton from "@/components/ui/TextSwapButton";

const ease = [0.22, 1, 0.36, 1] as const;

/* ═══════════════════════════════════════════════════════════════════════
   Intégrations — Tout est connecté. Nativement.
   ═══════════════════════════════════════════════════════════════════════ */

const MODULES = [
  {
    title: "Site web",
    desc: "Votre vitrine publique, alimentée par vos projets et témoignages.",
    color: "#FF8A3D",
    icon: "M3 3h18v18H3zM3 9h18M9 21V9",
  },
  {
    title: "CRM",
    desc: "Chaque commande enrichit automatiquement la fiche client.",
    color: "#EC4899",
    icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8 4 4 0 000 8",
  },
  {
    title: "Agenda",
    desc: "Les deadlines et rendez-vous se synchronisent avec vos projets.",
    color: "#4C8DFF",
    icon: "M3 4h18v18H3zM16 2v4M8 2v4M3 10h18",
  },
  {
    title: "Facturation",
    desc: "Les factures se génèrent depuis vos commandes terminées.",
    color: "#22c55e",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 14l2 2 4-4",
  },
  {
    title: "Commandes",
    desc: "Le cœur du système — chaque module y est connecté.",
    color: "#F59E0B",
    icon: "M9 5H2v7l6.29 6.29a1 1 0 001.42 0l5.58-5.58a1 1 0 000-1.42z",
  },
  {
    title: "Analytics",
    desc: "Toutes les données convergent dans vos tableaux de bord.",
    color: "#7c3aed",
    icon: "M3 3v18h18M7 16l4-8 4 4 5-9",
  },
  {
    title: "Portfolio",
    desc: "Vos réalisations se publient directement sur votre site.",
    color: "#A855F7",
    icon: "M4 4h16v16H4zM4 12h16M12 4v16",
  },
  {
    title: "Paiements",
    desc: "Les encaissements mettent à jour commandes et facturation.",
    color: "#10B981",
    icon: "M1 4h22v16H1zM1 10h22",
  },
];

const BENEFITS = [
  {
    title: "Pas de configuration complexe",
    desc: "Tout fonctionne dès l\u2019inscription. Aucun plugin à installer, aucune API à connecter manuellement.",
    icon: "M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3",
  },
  {
    title: "Données toujours synchronisées",
    desc: "Un changement dans un module se propage instantanément aux autres. Zéro doublon, zéro oubli.",
    icon: "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15",
  },
  {
    title: "Moins de bugs, plus de fiabilité",
    desc: "Un système natif signifie moins de points de défaillance qu\u2019un écosystème de plugins tiers.",
    icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  },
];

export default function IntegrationsPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* ── Background ── */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: "linear-gradient(180deg, #F8F8FC 0%, #F4F3FA 100%)",
        }}
      >
        <div
          className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle, rgba(124,92,255,0.25) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-[-10%] right-[5%] w-[500px] h-[500px] rounded-full opacity-15"
          style={{
            background:
              "radial-gradient(circle, rgba(167,139,250,0.3) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* ── Hero ── */}
      <section className="pt-36 pb-20 px-6">
        <div className="max-w-[800px] mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
          >
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold mb-6"
              style={{
                background: "rgba(124,92,255,0.08)",
                color: "#7C5CFF",
                border: "1px solid rgba(124,92,255,0.12)",
              }}
            >
              Intégrations
            </span>
          </motion.div>
          <motion.h1
            className="text-[36px] sm:text-[48px] font-bold leading-[1.1] tracking-tight mb-5"
            style={{ color: "#111118" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease }}
          >
            Tout est connecté.{" "}
            <span
              style={{
                background:
                  "linear-gradient(135deg, #7C5CFF 0%, #A78BFA 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Nativement.
            </span>
          </motion.h1>
          <motion.p
            className="text-[16px] sm:text-[18px] leading-relaxed max-w-[600px] mx-auto"
            style={{ color: "#6B6F80" }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease }}
          >
            Pas de plugins. Pas de bricolage. Chaque module Jestly communique
            avec les autres.
          </motion.p>
        </div>
      </section>

      {/* ── Écosystème Jestly ── */}
      <section className="pb-24 px-6">
        <div className="max-w-[900px] mx-auto">
          <motion.h2
            className="text-[24px] sm:text-[28px] font-bold text-center mb-4"
            style={{ color: "#111118" }}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
          >
            L&apos;écosystème Jestly
          </motion.h2>
          <motion.p
            className="text-[15px] text-center mb-12 max-w-[500px] mx-auto"
            style={{ color: "#6B6F80" }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease }}
          >
            Huit modules interconnectés, un seul système.
          </motion.p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {MODULES.map((m, i) => (
              <motion.div
                key={m.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.5, delay: i * 0.05, ease }}
                className="rounded-2xl p-5"
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #EEEDF2",
                  borderLeft: `4px solid ${m.color}`,
                }}
              >
                <div className="flex items-center gap-3 mb-2.5">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${m.color}12` }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={m.color}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d={m.icon} />
                    </svg>
                  </div>
                  <h3
                    className="text-[14px] font-semibold"
                    style={{ color: "#111118" }}
                  >
                    {m.title}
                  </h3>
                </div>
                <p
                  className="text-[13px] leading-relaxed"
                  style={{ color: "#6B6F80" }}
                >
                  {m.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pourquoi natif > plugins ── */}
      <section className="pb-24 px-6">
        <div className="max-w-[900px] mx-auto">
          <motion.h2
            className="text-[24px] sm:text-[28px] font-bold text-center mb-12"
            style={{ color: "#111118" }}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
          >
            Pourquoi natif &gt; plugins
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {BENEFITS.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08, ease }}
                className="rounded-2xl p-6"
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #EEEDF2",
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: "rgba(124,92,255,0.08)" }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#7C5CFF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={b.icon} />
                  </svg>
                </div>
                <h3
                  className="text-[15px] font-semibold mb-2"
                  style={{ color: "#111118" }}
                >
                  {b.title}
                </h3>
                <p
                  className="text-[13px] leading-relaxed"
                  style={{ color: "#6B6F80" }}
                >
                  {b.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Intégrations externes ── */}
      <section className="pb-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease }}
          className="max-w-[720px] mx-auto rounded-2xl p-8 sm:p-10"
          style={{
            background: "#FFFFFF",
            border: "1px solid #EEEDF2",
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <h2
              className="text-[20px] font-bold"
              style={{ color: "#111118" }}
            >
              Intégrations externes
            </h2>
            <span
              className="inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold"
              style={{
                background: "rgba(124,92,255,0.08)",
                color: "#7C5CFF",
                border: "1px solid rgba(124,92,255,0.12)",
              }}
            >
              Bientôt
            </span>
          </div>
          <p
            className="text-[14px] leading-relaxed mb-4"
            style={{ color: "#6B6F80" }}
          >
            Nous travaillons sur des connexions avec les outils que vous
            utilisez déjà : Stripe pour les paiements avancés, Google
            Calendar pour la synchronisation d&apos;agenda, et d&apos;autres
            intégrations demandées par la communauté.
          </p>
          <p
            className="text-[14px] leading-relaxed"
            style={{ color: "#6B6F80" }}
          >
            En attendant, Jestly couvre nativement tout ce dont un freelance
            a besoin au quotidien. Les intégrations externes viendront
            enrichir l&apos;expérience, pas la remplacer.
          </p>
        </motion.div>
      </section>

      {/* ── Final CTA ── */}
      <section className="pb-28 px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease }}
          className="max-w-[720px] mx-auto rounded-2xl p-10 text-center"
          style={{
            background: "#FFFFFF",
            border: "1px solid #EEEDF2",
          }}
        >
          <h2
            className="text-[24px] sm:text-[28px] font-bold mb-3"
            style={{ color: "#111118" }}
          >
            Prêt à tout centraliser ?
          </h2>
          <p
            className="text-[15px] leading-relaxed mb-8 max-w-[460px] mx-auto"
            style={{ color: "#6B6F80" }}
          >
            Un seul outil pour gérer votre activité freelance de A à Z.
          </p>
          <TextSwapButton
            label="Commencer gratuitement"
            href="/auth"
            size="lg"
            icon={
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            }
          />
        </motion.div>
      </section>
    </main>
  );
}
