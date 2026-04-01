"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionShell from "@/components/landing/SectionShell";
import TextSwapButton from "@/components/ui/TextSwapButton";

const ease = [0.22, 1, 0.36, 1] as const;

/* ═══════════════════════════════════════════════════════════════════════
   FAQ data
   ═══════════════════════════════════════════════════════════════════════ */
interface FaqItem {
  question: string;
  answer: string;
}

interface FaqCategory {
  title: string;
  items: FaqItem[];
}

const FAQ_CATEGORIES: FaqCategory[] = [
  {
    title: "Général",
    items: [
      {
        question: "Qu\u2019est-ce que Jestly exactement ?",
        answer:
          "Jestly est un SaaS tout-en-un conçu pour les freelances créatifs. Il regroupe site web, CRM, agenda, facturation, commandes, analytics, portfolio, paiements et briefs dans un seul outil — pour remplacer une dizaine d\u2019abonnements séparés.",
      },
      {
        question: "À qui s\u2019adresse Jestly ?",
        answer:
          "Jestly est pensé pour les freelances créatifs : vidéastes, designers, développeurs, consultants, petites agences. Tout professionnel indépendant qui veut centraliser sa gestion sans complexité.",
      },
      {
        question: "Comment démarrer avec Jestly ?",
        answer:
          "Créez votre compte gratuitement en 30 secondes. Aucune carte bancaire n\u2019est requise. Vous accédez immédiatement au tableau de bord et pouvez commencer à configurer votre espace.",
      },
      {
        question: "Jestly est-il gratuit ?",
        answer:
          "Oui, Jestly propose un plan gratuit (Free) qui inclut jusqu\u2019à 10 commandes par mois et l\u2019accès à toutes les fonctionnalités essentielles. Le plan Pro à 7\u00a0\u20ac/mois débloque l\u2019usage illimité.",
      },
    ],
  },
  {
    title: "Abonnements",
    items: [
      {
        question: "Quels sont les plans disponibles ?",
        answer:
          "Deux plans : Free (10 commandes/mois, fonctionnalités essentielles) et Pro (7\u00a0\u20ac/mois, usage illimité, domaine personnalisé, priorité support). Pas de plan entreprise complexe — on garde les choses simples.",
      },
      {
        question: "Comment passer au plan Pro ?",
        answer:
          "Depuis votre tableau de bord, rendez-vous dans Paramètres > Abonnement et cliquez sur « Passer au Pro ». Le paiement est géré via Stripe, sécurisé et instantané.",
      },
      {
        question: "Puis-je revenir au plan Free ?",
        answer:
          "Absolument. Vous pouvez rétrograder à tout moment depuis vos paramètres. Votre abonnement Pro reste actif jusqu\u2019à la fin de la période payée, puis vous repassez en Free.",
      },
      {
        question: "Y a-t-il un engagement ?",
        answer:
          "Aucun engagement. L\u2019abonnement Pro est mensuel et résiliable à tout moment, sans frais ni justification.",
      },
    ],
  },
  {
    title: "Fonctionnalités",
    items: [
      {
        question: "Quelles fonctionnalités sont incluses ?",
        answer:
          "Site web personnalisable, CRM clients, agenda, facturation (devis + factures), gestion des commandes, analytics, portfolio, paiements en ligne et briefs clients. Tout est inclus dès le plan Free.",
      },
      {
        question: "Jestly s\u2019intègre-t-il avec d\u2019autres outils ?",
        answer:
          "Jestly est conçu pour être autonome et remplacer votre stack. Les paiements passent par Stripe. D\u2019autres intégrations (Notion, Google Calendar, Zapier) sont prévues sur la roadmap.",
      },
      {
        question: "Y a-t-il une application mobile ?",
        answer:
          "Jestly est entièrement responsive et fonctionne parfaitement sur mobile via votre navigateur. Une application native est envisagée à terme.",
      },
      {
        question: "Puis-je personnaliser mon site ?",
        answer:
          "Oui, le builder de site intégré vous permet de choisir vos couleurs, polices, blocs de contenu et mise en page. Votre site est accessible sur un sous-domaine prenom.jestly.fr ou votre propre domaine (Pro).",
      },
    ],
  },
  {
    title: "Sécurité & données",
    items: [
      {
        question: "Où sont hébergées mes données ?",
        answer:
          "Vos données sont hébergées sur Supabase (infrastructure AWS) avec des serveurs en Europe. Les sauvegardes sont automatiques et quotidiennes.",
      },
      {
        question: "Jestly est-il conforme au RGPD ?",
        answer:
          "Oui. Jestly respecte le RGPD : vos données vous appartiennent, aucune revente à des tiers, droit d\u2019accès et de suppression à tout moment. Notre politique de confidentialité détaille nos engagements.",
      },
      {
        question: "Puis-je exporter mes données ?",
        answer:
          "Oui, vous pouvez exporter vos clients, commandes, factures et contacts au format CSV depuis votre tableau de bord à tout moment.",
      },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════════════
   Accordion item
   ═══════════════════════════════════════════════════════════════════════ */
function AccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className="rounded-xl overflow-hidden transition-shadow duration-300"
      style={{
        background: "#FFFFFF",
        border: "1px solid #EEEDF2",
        boxShadow: isOpen ? "0 4px 20px rgba(124,92,255,0.06)" : "none",
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left cursor-pointer"
      >
        <span
          className="text-sm font-medium"
          style={{ color: "#111118" }}
        >
          {item.question}
        </span>
        <motion.svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#A8A8B0"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="flex-shrink-0"
        >
          <path d="M6 9l6 6 6-6" />
        </motion.svg>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4">
              <p className="text-sm leading-relaxed" style={{ color: "#6B6F80" }}>
                {item.answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   Page
   ═══════════════════════════════════════════════════════════════════════ */
export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggleItem = (key: string) => {
    setOpenIndex((prev) => (prev === key ? null : key));
  };

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
            left: "15%",
            width: 650,
            height: 650,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(124,92,255,0.07), transparent 70%)",
          }}
        />
        <div
          className="absolute"
          style={{
            bottom: "20%",
            right: "20%",
            width: 550,
            height: 550,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(139,92,246,0.05), transparent 70%)",
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
              FAQ
            </span>
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6"
            style={{ color: "#111118" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease }}
          >
            Questions{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #7C5CFF, #A78BFA)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              fréquentes
            </span>
          </motion.h1>

          <motion.p
            className="text-lg max-w-2xl mx-auto"
            style={{ color: "#6B6F80" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease }}
          >
            Tout ce que vous devez savoir sur Jestly. Si votre question n&apos;est pas ici,
            n&apos;hésitez pas à nous contacter.
          </motion.p>
        </div>
      </SectionShell>

      {/* ── FAQ categories ── */}
      <SectionShell atmosphere="calm" className="relative z-10">
        <div className="max-w-3xl mx-auto space-y-12">
          {FAQ_CATEGORIES.map((cat, catIdx) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: catIdx * 0.1, ease }}
            >
              <h2
                className="text-lg font-bold mb-4 flex items-center gap-2"
                style={{ color: "#111118" }}
              >
                <span
                  className="w-1.5 h-5 rounded-full"
                  style={{
                    background:
                      "linear-gradient(135deg, #7C5CFF, #A78BFA)",
                  }}
                />
                {cat.title}
              </h2>
              <div className="space-y-3">
                {cat.items.map((item, itemIdx) => {
                  const key = `${catIdx}-${itemIdx}`;
                  return (
                    <AccordionItem
                      key={key}
                      item={item}
                      isOpen={openIndex === key}
                      onToggle={() => toggleItem(key)}
                    />
                  );
                })}
              </div>
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
            Encore une question ?
          </h2>
          <p className="text-base mb-8" style={{ color: "#6B6F80" }}>
            Notre équipe répond en moins de 24h. Sinon, essayez par vous-même — c&apos;est gratuit.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <TextSwapButton
              label="Commencer gratuitement"
              href="/register"
              variant="primary"
              size="lg"
            />
            <TextSwapButton
              label="Nous contacter"
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
