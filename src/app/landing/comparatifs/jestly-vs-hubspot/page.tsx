"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import TextSwapButton from "@/components/ui/TextSwapButton";
import SeoContentSection from "@/components/seo/SeoContentSection";
import FaqSeoSection from "@/components/seo/FaqSeoSection";

const ease = [0.22, 1, 0.36, 1] as const;

const competitor = "HubSpot";

const summaryLeft = [
  "CRM puissant et complet",
  "Automatisations marketing avancées",
  "Écosystème intégré",
];

const summaryRight = [
  "Pensé freelance, pas enterprise",
  "Simple à prendre en main seul",
  "Prix accessible pour un indépendant",
];

const tableRows: { critere: string; competitor: string; jestly: string }[] = [
  { critere: "CRM", competitor: "yes", jestly: "yes" },
  { critere: "Facturation", competitor: "Add-on payant", jestly: "Inclus" },
  { critere: "Site vitrine", competitor: "yes", jestly: "yes" },
  { critere: "Complexité", competitor: "Élevée", jestly: "Minimale" },
  { critere: "Prix solo", competitor: "Cher", jestly: "Accessible" },
  { critere: "Gestion commandes", competitor: "no", jestly: "yes" },
  { critere: "Portfolio", competitor: "no", jestly: "yes" },
  { critere: "Adapté freelance", competitor: "Non", jestly: "Oui" },
];

const benefits = [
  {
    title: "Taillé pour les indépendants",
    description:
      "HubSpot est conçu pour des équipes commerciales. Jestly est pensé pour un freelance créatif qui veut gérer son activité simplement.",
  },
  {
    title: "Prix transparent",
    description:
      "Pas de plans enterprise, pas d\u2019add-ons cachés. Un forfait accessible qui inclut tout ce dont un indépendant a besoin.",
  },
  {
    title: "Portfolio et vitrine inclus",
    description:
      "Présentez vos réalisations avec un site professionnel intégré — une fonctionnalité que HubSpot ne cible pas pour les créatifs.",
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

export default function JestlyVsHubSpotPage() {
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
            HubSpot est un CRM enterprise puissant, mais surdimensionné et coûteux pour un freelance créatif qui travaille seul.
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

      <SeoContentSection blocks={[
        {
          heading: "HubSpot vs Jestly : quel CRM pour un freelance ?",
          paragraphs: [
            "HubSpot est un CRM puissant conçu pour les équipes commerciales B2B : pipelines complexes, séquences d'emails automatisées, scoring de leads. Pour un freelance qui gère 10 à 50 clients, c'est un canon pour tuer une mouche. L'interface est dense, la courbe d'apprentissage est raide, et les fonctionnalités premium coûtent cher.",
            "Jestly propose un CRM pensé pour les freelances : simple, connecté à votre facturation et vos commandes, sans superflu. Chaque contact a sa fiche avec l'historique complet. Quand vous créez une commande, le client est déjà associé. Quand vous facturez, le CRM se met à jour. Pas de pipeline à configurer, pas de workflow à construire.",
          ],
        },
        {
          heading: "Au-delà du CRM : un outil complet vs un outil spécialisé",
          paragraphs: [
            "La vraie différence : HubSpot est un CRM pur. Pour facturer, gérer des commandes, avoir un site vitrine ou suivre vos paiements, vous avez besoin d'autres outils. Jestly intègre tout cela nativement. Votre CRM, votre facturation, vos commandes, votre site et vos analytics vivent au même endroit.",
            "Pour un freelance, remplacer 5 outils par un seul est un gain de temps et d'argent considérable. Jestly est gratuit pendant la bêta — HubSpot gratuit est limité et les plans payants commencent à 45 €/mois.",
          ],
        },
      ]} />

      <FaqSeoSection
        title="Jestly vs HubSpot — Questions fréquentes"
        items={[
          {
            question: "HubSpot est-il trop complexe pour un freelance ?",
            answer: "Pour la plupart des freelances, oui. HubSpot est conçu pour des équipes commerciales avec des pipelines, des séquences et du scoring. Un freelance a besoin d'un CRM simple pour suivre ses clients et relancer ses prospects — exactement ce que propose Jestly.",
          },
          {
            question: "Jestly remplace-t-il HubSpot pour la gestion clients ?",
            answer: "Pour les freelances, oui. Jestly offre un CRM adapté + facturation + commandes + site vitrine en un seul outil. HubSpot reste plus adapté aux entreprises avec des équipes commerciales.",
          },
          {
            question: "Le CRM gratuit de HubSpot suffit-il pour un freelance ?",
            answer: "Le CRM gratuit de HubSpot offre les basiques, mais il ne gère pas la facturation, les commandes ni le site vitrine. Jestly regroupe tout dans un seul outil, gratuit pendant la bêta avec toutes les fonctionnalités.",
          },
        ]}
        accentColor="#F97316"
      />
    </main>
  );
}
