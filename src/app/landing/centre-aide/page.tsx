"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import TextSwapButton from "@/components/ui/TextSwapButton";
import { HelpSearch } from "@/components/help-center/HelpSearch";
import { getAllParcours, getPopularArticles } from "@/lib/help-center/queries";

const ease = [0.22, 1, 0.36, 1] as const;

/* ── Données ── */

const startGuides = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7C5CFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <line x1="20" y1="8" x2="20" y2="14" />
        <line x1="23" y1="11" x2="17" y2="11" />
      </svg>
    ),
    title: "Créer votre compte et configurer Jestly",
    description: "Inscription, paramétrage initial, premiers pas.",
    slug: "creer-compte-configurer",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7C5CFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      </svg>
    ),
    title: "Ajouter votre première commande",
    description: "Créez, suivez et livrez un projet de A à Z.",
    slug: "premiere-commande",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7C5CFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>
    ),
    title: "Personnaliser votre site vitrine",
    description: "Activez et configurez votre site en quelques minutes.",
    slug: "personnaliser-site",
  },
];

const helpCategories = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7C5CFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
    title: "Commandes & projets",
    count: 6,
    description: "Créer, suivre, livrer et archiver vos commandes.",
    slug: "commandes-projets",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7C5CFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Clients & CRM",
    count: 5,
    description: "Gérer vos contacts, notes et historique.",
    slug: "clients-crm",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7C5CFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    title: "Facturation",
    count: 4,
    description: "Devis, factures, exports et paiements.",
    slug: "facturation",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7C5CFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    title: "Site vitrine & portfolio",
    count: 5,
    description: "Personnalisation, pages, SEO et domaine.",
    slug: "site-vitrine",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7C5CFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    title: "Calendrier & tâches",
    count: 4,
    description: "Planification, deadlines, sous-tâches.",
    slug: "calendrier-taches",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7C5CFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
    title: "Mon compte & paramètres",
    count: 3,
    description: "Profil, abonnement, sécurité.",
    slug: "compte-parametres",
  },
];

const faqItems = [
  {
    question: "Comment créer mon premier projet ?",
    slug: "creer-premier-projet",
    // aligné avec data.ts
    answer:
      "Rendez-vous dans le menu « Commandes » de votre tableau de bord, puis cliquez sur « Nouvelle commande ». Remplissez les informations du client, la description du projet, la date d\u2019échéance et le prix. Votre commande apparaît directement dans votre pipeline.",
  },
  {
    question: "Comment envoyer une facture ?",
    slug: "envoyer-une-facture",
    answer:
      "Depuis le module « Facturation », cliquez sur « Nouvelle facture ». Sélectionnez le client et la commande associée, vérifiez les montants puis envoyez directement par e-mail. Vous pouvez aussi télécharger le PDF.",
  },
  {
    question: "Comment connecter mon domaine ?",
    slug: "connecter-son-domaine",
    answer:
      "Avec le plan Business, allez dans « Paramètres > Domaine ». Entrez votre nom de domaine personnalisé et configurez le CNAME indiqué chez votre registrar. La propagation prend généralement quelques minutes.",
  },
  {
    question: "Comment exporter mes données ?",
    slug: "exporter-ses-factures",
    answer:
      "Chaque module (commandes, clients, factures) dispose d\u2019un bouton d\u2019export en haut à droite. Vous pouvez exporter en CSV ou PDF selon le module. Vos données vous appartiennent.",
  },
  {
    question: "Comment contacter le support ?",
    slug: "contacter-le-support",
    answer:
      "Vous pouvez nous écrire via la page /contact ou directement par e-mail à support@jestly.fr. Nous répondons sous 24 heures en jours ouvrés.",
  },
];

const popularArticles = getPopularArticles(6);
const recommendedParcours = getAllParcours();

export default function CentreAidePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div
      style={{
        background: "linear-gradient(180deg, #F8F8FC 0%, #F4F3FA 100%)",
      }}
    >
      {/* Violet radial glows */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-20%",
            left: "-10%",
            width: 800,
            height: 800,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(124,92,255,0.08) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-10%",
            right: "-10%",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 70%)",
          }}
        />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* ── Hero ── */}
        <section className="pt-32 sm:pt-40 pb-16 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease }}
            >
              <span
                style={{
                  display: "inline-block",
                  padding: "6px 16px",
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#7C5CFF",
                  background: "rgba(124,92,255,0.08)",
                  border: "1px solid rgba(124,92,255,0.15)",
                  marginBottom: 24,
                }}
              >
                Centre d&apos;aide
              </span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease, delay: 0.1 }}
              style={{
                fontSize: "clamp(2rem, 5vw, 3.2rem)",
                fontWeight: 700,
                lineHeight: 1.15,
                color: "#111118",
                marginBottom: 28,
              }}
            >
              Comment pouvons-nous{" "}
              <span
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, #7C5CFF 0%, #A78BFA 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                vous aider
              </span>{" "}
              ?
            </motion.h1>
            {/* Search bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease, delay: 0.2 }}
            >
              <HelpSearch />
            </motion.div>
          </div>
        </section>

        {/* ── Parcours recommandés ── */}
        <section className="pb-20 px-4">
          <div className="max-w-5xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, ease }}
              style={{
                fontSize: "clamp(1.3rem, 3vw, 1.75rem)",
                fontWeight: 700,
                color: "#111118",
                textAlign: "center",
                marginBottom: 10,
              }}
            >
              🚀 Parcours recommandés
            </motion.h2>
            <p
              style={{
                textAlign: "center",
                color: "#6B6F80",
                fontSize: 15,
                marginBottom: 32,
              }}
            >
              Des séquences de guides pour progresser pas à pas sur un objectif précis.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedParcours.map((p, i) => (
                <motion.div
                  key={p.slug}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, ease, delay: i * 0.08 }}
                >
                  <Link
                    href={`/centre-aide/guide/${p.guideSlugs[0]}`}
                    style={{ textDecoration: "none" }}
                  >
                    <div
                      style={{
                        background: "#fff",
                        border: "1px solid #EEEDF2",
                        borderRadius: 20,
                        padding: "24px 24px",
                        height: "100%",
                        transition: "box-shadow 0.3s ease, border-color 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow =
                          "0 8px 30px rgba(124,92,255,0.08)";
                        e.currentTarget.style.borderColor =
                          "rgba(124,92,255,0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = "none";
                        e.currentTarget.style.borderColor = "#EEEDF2";
                      }}
                    >
                      <div style={{ fontSize: 28, marginBottom: 10 }}>{p.icon}</div>
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          color: "#111118",
                          marginBottom: 6,
                        }}
                      >
                        {p.title}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: "#6B6F80",
                          lineHeight: 1.6,
                          marginBottom: 12,
                        }}
                      >
                        {p.description}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#7C5CFF",
                        }}
                      >
                        {p.guideSlugs.length} guide
                        {p.guideSlugs.length > 1 ? "s" : ""} · Commencer →
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Guides de démarrage ── */}
        <section className="pb-20 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, ease }}
              style={{
                fontSize: "clamp(1.3rem, 3vw, 1.75rem)",
                fontWeight: 700,
                color: "#111118",
                textAlign: "center",
                marginBottom: 32,
              }}
            >
              Guides de démarrage
            </motion.h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {startGuides.map((guide, i) => (
                <motion.div
                  key={guide.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, ease, delay: i * 0.08 }}
                >
                  <Link href={`/centre-aide/guide/${guide.slug}`} style={{ textDecoration: "none" }}>
                    <div
                      style={{
                        background: "#fff",
                        border: "1px solid #EEEDF2",
                        borderRadius: 20,
                        padding: "28px 24px",
                        textAlign: "center",
                        transition:
                          "box-shadow 0.3s ease, border-color 0.3s ease",
                        height: "100%",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow =
                          "0 8px 30px rgba(124,92,255,0.08)";
                        e.currentTarget.style.borderColor =
                          "rgba(124,92,255,0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = "none";
                        e.currentTarget.style.borderColor = "#EEEDF2";
                      }}
                    >
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 14,
                          background:
                            "linear-gradient(135deg, rgba(124,92,255,0.08) 0%, rgba(167,139,250,0.04) 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto 16px",
                        }}
                      >
                        {guide.icon}
                      </div>
                      <h3
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          color: "#111118",
                          marginBottom: 8,
                          lineHeight: 1.4,
                        }}
                      >
                        {guide.title}
                      </h3>
                      <p
                        style={{
                          fontSize: 14,
                          color: "#6B6F80",
                          lineHeight: 1.6,
                        }}
                      >
                        {guide.description}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Catégories ── */}
        <section className="pb-20 px-4">
          <div className="max-w-5xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, ease }}
              style={{
                fontSize: "clamp(1.3rem, 3vw, 1.75rem)",
                fontWeight: 700,
                color: "#111118",
                textAlign: "center",
                marginBottom: 32,
              }}
            >
              Catégories
            </motion.h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {helpCategories.map((cat, i) => (
                <motion.div
                  key={cat.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, ease, delay: i * 0.07 }}
                >
                  <Link href={`/centre-aide/categorie/${cat.slug}`} style={{ textDecoration: "none" }}>
                    <div
                      style={{
                        background: "#fff",
                        border: "1px solid #EEEDF2",
                        borderRadius: 20,
                        padding: "28px 24px",
                        transition:
                          "box-shadow 0.3s ease, border-color 0.3s ease",
                        height: "100%",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow =
                          "0 8px 30px rgba(124,92,255,0.08)";
                        e.currentTarget.style.borderColor =
                          "rgba(124,92,255,0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = "none";
                        e.currentTarget.style.borderColor = "#EEEDF2";
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          marginBottom: 14,
                        }}
                      >
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 14,
                            background:
                              "linear-gradient(135deg, rgba(124,92,255,0.08) 0%, rgba(167,139,250,0.04) 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {cat.icon}
                        </div>
                        <div>
                          <h3
                            style={{
                              fontSize: 16,
                              fontWeight: 700,
                              color: "#111118",
                              marginBottom: 2,
                            }}
                          >
                            {cat.title}
                          </h3>
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 500,
                              color: "#7C5CFF",
                              background: "rgba(124,92,255,0.06)",
                              padding: "2px 8px",
                              borderRadius: 999,
                            }}
                          >
                            {cat.count} articles
                          </span>
                        </div>
                      </div>
                      <p
                        style={{
                          fontSize: 14,
                          color: "#6B6F80",
                          lineHeight: 1.6,
                        }}
                      >
                        {cat.description}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Articles populaires ── */}
        <section className="pb-20 px-4">
          <div className="max-w-5xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, ease }}
              style={{
                fontSize: "clamp(1.3rem, 3vw, 1.75rem)",
                fontWeight: 700,
                color: "#111118",
                textAlign: "center",
                marginBottom: 32,
              }}
            >
              Articles populaires
            </motion.h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularArticles.map((a, i) => (
                <motion.div
                  key={a.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, ease, delay: i * 0.05 }}
                >
                  <Link
                    href={`/centre-aide/article/${a.slug}`}
                    style={{ textDecoration: "none" }}
                  >
                    <div
                      style={{
                        background: "#fff",
                        border: "1px solid #EEEDF2",
                        borderRadius: 16,
                        padding: "20px 22px",
                        height: "100%",
                        transition:
                          "box-shadow 0.3s ease, border-color 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow =
                          "0 8px 30px rgba(124,92,255,0.08)";
                        e.currentTarget.style.borderColor =
                          "rgba(124,92,255,0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = "none";
                        e.currentTarget.style.borderColor = "#EEEDF2";
                      }}
                    >
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: "#111118",
                          marginBottom: 6,
                          lineHeight: 1.4,
                        }}
                      >
                        {a.title}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: "#6B6F80",
                          lineHeight: 1.6,
                        }}
                      >
                        {a.excerpt}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Questions populaires ── */}
        <section className="pb-20 px-4">
          <div className="max-w-3xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, ease }}
              style={{
                fontSize: "clamp(1.3rem, 3vw, 1.75rem)",
                fontWeight: 700,
                color: "#111118",
                textAlign: "center",
                marginBottom: 32,
              }}
            >
              Questions populaires
            </motion.h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {faqItems.map((item, i) => (
                <motion.div
                  key={item.question}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, ease, delay: i * 0.06 }}
                  style={{
                    background: "#fff",
                    border: "1px solid #EEEDF2",
                    borderRadius: 16,
                    overflow: "hidden",
                  }}
                >
                  <button
                    onClick={() =>
                      setOpenFaq(openFaq === i ? null : i)
                    }
                    style={{
                      width: "100%",
                      padding: "18px 24px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: "#111118",
                      }}
                    >
                      {item.question}
                    </span>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#A8A8B0"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        flexShrink: 0,
                        marginLeft: 12,
                        transform:
                          openFaq === i
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                        transition: "transform 0.3s ease",
                      }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  {openFaq === i && (
                    <div
                      style={{
                        padding: "0 24px 18px",
                        fontSize: 14,
                        color: "#6B6F80",
                        lineHeight: 1.7,
                      }}
                    >
                      {item.answer}
                      <div style={{ marginTop: 12 }}>
                        <Link
                          href={`/centre-aide/article/${item.slug}`}
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#7C5CFF",
                            textDecoration: "none",
                          }}
                        >
                          Lire l&apos;article complet →
                        </Link>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Besoin d'aide ? ── */}
        <section className="pb-20 px-4">
          <div className="max-w-3xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, ease }}
              style={{
                fontSize: "clamp(1.3rem, 3vw, 1.75rem)",
                fontWeight: 700,
                color: "#111118",
                textAlign: "center",
                marginBottom: 32,
              }}
            >
              Besoin d&apos;aide ?
            </motion.h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, ease }}
              >
                <Link href="/faq" style={{ textDecoration: "none" }}>
                  <div
                    style={{
                      background: "#fff",
                      border: "1px solid #EEEDF2",
                      borderRadius: 20,
                      padding: "32px 24px",
                      textAlign: "center",
                      transition:
                        "box-shadow 0.3s ease, border-color 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow =
                        "0 8px 30px rgba(124,92,255,0.08)";
                      e.currentTarget.style.borderColor =
                        "rgba(124,92,255,0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.borderColor = "#EEEDF2";
                    }}
                  >
                    <div
                      style={{
                        fontSize: 32,
                        marginBottom: 12,
                      }}
                    >
                      ❓
                    </div>
                    <h3
                      style={{
                        fontSize: 17,
                        fontWeight: 700,
                        color: "#111118",
                        marginBottom: 6,
                      }}
                    >
                      Consultez la FAQ
                    </h3>
                    <p
                      style={{
                        fontSize: 14,
                        color: "#6B6F80",
                        lineHeight: 1.6,
                      }}
                    >
                      Les réponses aux questions les plus fréquentes.
                    </p>
                  </div>
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, ease, delay: 0.08 }}
              >
                <Link href="/contact" style={{ textDecoration: "none" }}>
                  <div
                    style={{
                      background: "#fff",
                      border: "1px solid #EEEDF2",
                      borderRadius: 20,
                      padding: "32px 24px",
                      textAlign: "center",
                      transition:
                        "box-shadow 0.3s ease, border-color 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow =
                        "0 8px 30px rgba(124,92,255,0.08)";
                      e.currentTarget.style.borderColor =
                        "rgba(124,92,255,0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.borderColor = "#EEEDF2";
                    }}
                  >
                    <div
                      style={{
                        fontSize: 32,
                        marginBottom: 12,
                      }}
                    >
                      ✉️
                    </div>
                    <h3
                      style={{
                        fontSize: 17,
                        fontWeight: 700,
                        color: "#111118",
                        marginBottom: 6,
                      }}
                    >
                      Contactez-nous
                    </h3>
                    <p
                      style={{
                        fontSize: 14,
                        color: "#6B6F80",
                        lineHeight: 1.6,
                      }}
                    >
                      Une question spécifique ? Notre équipe vous répond sous 24 h.
                    </p>
                  </div>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="pb-32 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, ease }}
              style={{
                fontSize: "clamp(1.4rem, 3vw, 2rem)",
                fontWeight: 700,
                color: "#111118",
                marginBottom: 24,
              }}
            >
              Essayez Jestly dès maintenant.
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease, delay: 0.1 }}
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              <TextSwapButton
                label="Commencer gratuitement"
                href="/login"
                variant="primary"
                size="lg"
              />
              <TextSwapButton
                label="Voir les fonctionnalités"
                href="/fonctionnalites"
                variant="secondary"
                size="lg"
              />
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}
