"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import TextSwapButton from "@/components/ui/TextSwapButton";

const ease = [0.22, 1, 0.36, 1] as const;

const competitor = "Google Agenda";

const summaryLeft = [
  "Calendrier fiable et synchronisé",
  "Intégration Google Workspace",
  "Rappels et notifications",
];

const summaryRight = [
  "Calendrier connecté aux commandes et clients",
  "Vue business complète, pas juste un agenda",
  "Deadlines liées aux projets et factures",
];

const tableRows: { critere: string; competitor: string; jestly: string }[] = [
  { critere: "Calendrier", competitor: "yes", jestly: "yes" },
  { critere: "Lien avec commandes", competitor: "no", jestly: "yes" },
  { critere: "CRM", competitor: "no", jestly: "yes" },
  { critere: "Facturation", competitor: "no", jestly: "yes" },
  { critere: "Vue business", competitor: "no", jestly: "yes" },
  { critere: "Tâches liées", competitor: "Basique", jestly: "Complet" },
  { critere: "Deadlines projets", competitor: "no", jestly: "yes" },
  { critere: "Planification freelance", competitor: "Partiel", jestly: "Complet" },
];

const benefits = [
  {
    title: "Un agenda qui comprend votre métier",
    description:
      "Dans Jestly, chaque événement est relié à un client, une commande ou un projet. Votre planning a du contexte.",
  },
  {
    title: "Deadlines automatiques",
    description:
      "Quand vous créez une commande avec une date de livraison, elle apparaît dans votre calendrier. Sans saisie manuelle.",
  },
  {
    title: "Vue d\u2019ensemble business",
    description:
      "Visualisez votre charge de travail, vos échéances de facturation et vos rendez-vous clients dans un seul endroit.",
  },
];

function CheckIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M6 10l3 3 5-6"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M6 6l8 8M14 6l-8 8"
        stroke="#C4C4CC"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CellValue({ value }: { value: string }) {
  if (value === "yes") return <CheckIcon color="#7C5CFF" />;
  if (value === "no") return <XIcon />;
  return <span className="font-medium text-sm text-[#111118]">{value}</span>;
}

export default function JestlyVsGoogleAgendaPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* ── Background ── */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, #F8F8FC 0%, #F4F3FA 100%)",
        }}
      >
        <div
          className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full opacity-30"
          style={{
            background:
              "radial-gradient(circle, rgba(124,92,255,0.15) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle, rgba(167,139,250,0.15) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="mx-auto max-w-4xl px-6 py-24 md:py-32">
        {/* ── Hero ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease }}
          className="text-center mb-20"
        >
          <p className="text-sm font-medium text-[#6B6F80] mb-4">
            <Link href="/comparatifs" className="hover:text-[#7C5CFF] transition-colors">
              Comparatifs
            </Link>{" "}
            / Jestly vs {competitor}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-[#111118] mb-6">
            Jestly vs{" "}
            <span
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #7C5CFF 0%, #A78BFA 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {competitor}
            </span>
          </h1>
          <p className="text-lg text-[#6B6F80] max-w-2xl mx-auto">
            Google Agenda gère vos rendez-vous, mais il ne sait rien de vos commandes, vos clients ou vos factures.
          </p>
        </motion.div>

        {/* ── En résumé ── */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease, delay: 0.1 }}
          className="mb-20"
        >
          <h2 className="text-2xl font-bold text-[#111118] text-center mb-10">
            En résumé
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div
              className="rounded-2xl border p-6"
              style={{ background: "white", borderColor: "#EEEDF2" }}
            >
              <h3 className="font-semibold text-[#111118] mb-4">
                {competitor} c&apos;est bien pour…
              </h3>
              <ul className="space-y-3">
                {summaryLeft.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[#6B6F80] text-sm">
                    <CheckIcon color="#C4C4CC" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div
              className="rounded-2xl border p-6"
              style={{ background: "white", borderColor: "#EEEDF2" }}
            >
              <h3 className="font-semibold text-[#111118] mb-4">
                Jestly va plus loin
              </h3>
              <ul className="space-y-3">
                {summaryRight.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[#6B6F80] text-sm">
                    <CheckIcon color="#7C5CFF" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.section>

        {/* ── Comparison table ── */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease, delay: 0.15 }}
          className="mb-20"
        >
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ background: "white", borderColor: "#EEEDF2" }}
          >
            <div
              className="grid grid-cols-3 text-sm font-semibold text-[#6B6F80]"
              style={{ background: "#FAFAFE" }}
            >
              <div className="px-6 py-4">Critère</div>
              <div className="px-6 py-4 text-center">{competitor}</div>
              <div className="px-6 py-4 text-center">Jestly</div>
            </div>
            {tableRows.map((row, i) => (
              <div
                key={row.critere}
                className="grid grid-cols-3 text-sm border-t hover:bg-[#FAFAFE] transition-colors"
                style={{
                  borderColor: "#EEEDF2",
                  background: i % 2 === 1 ? "#FDFDFE" : "white",
                }}
              >
                <div className="px-6 py-4 text-[#111118] font-medium">
                  {row.critere}
                </div>
                <div className="px-6 py-4 flex items-center justify-center">
                  <CellValue value={row.competitor} />
                </div>
                <div className="px-6 py-4 flex items-center justify-center">
                  <CellValue value={row.jestly} />
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── Pourquoi choisir Jestly ── */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease, delay: 0.2 }}
          className="mb-20"
        >
          <h2 className="text-2xl font-bold text-[#111118] text-center mb-10">
            Pourquoi choisir Jestly
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="rounded-2xl border p-6"
                style={{ background: "white", borderColor: "#EEEDF2" }}
              >
                <h3 className="font-semibold text-[#111118] mb-2">{b.title}</h3>
                <p className="text-sm text-[#6B6F80] leading-relaxed">
                  {b.description}
                </p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── Final CTA ── */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease, delay: 0.25 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-[#111118] mb-4">
            Prêt à tout centraliser ?
          </h2>
          <p className="text-[#6B6F80] mb-8 max-w-lg mx-auto">
            Essayez Jestly gratuitement et découvrez un outil pensé pour votre activité de freelance créatif.
          </p>
          <TextSwapButton
            label="Démarrer gratuitement"
            href="/register"
            variant="primary"
            size="lg"
          />
        </motion.section>
      </div>
    </main>
  );
}
