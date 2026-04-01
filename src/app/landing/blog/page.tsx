"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import TextSwapButton from "@/components/ui/TextSwapButton";

const ease = [0.22, 1, 0.36, 1] as const;

/* ── Données ── */

const categoryColors: Record<string, string> = {
  Productivité: "#7C5CFF",
  Facturation: "#22c55e",
  "Relation client": "#EC4899",
  Organisation: "#F59E0B",
  Portfolio: "#A855F7",
};

const articles = [
  {
    title: "Comment arrêter de gérer son business dans 6 outils",
    slug: "/blog/comment-arreter-de-gerer-son-business-dans-6-outils",
    category: "Organisation",
    readTime: "5 min",
    excerpt:
      "Notion pour les projets, Trello pour les tâches, Google Sheets pour la facturation… Il est temps de simplifier.",
    date: "15 mars 2026",
  },
  {
    title: "5 erreurs de facturation qui vous coûtent cher",
    slug: "/blog/5-erreurs-de-facturation-qui-vous-coutent-cher",
    category: "Facturation",
    readTime: "4 min",
    excerpt:
      "Oublier un devis, mal suivre un paiement, ne pas relancer. Ces erreurs sont évitables.",
    date: "12 mars 2026",
  },
  {
    title: "Comment créer un site freelance qui convertit",
    slug: "/blog/comment-creer-un-site-freelance-qui-convertit",
    category: "Portfolio",
    readTime: "6 min",
    excerpt:
      "Votre site est votre vitrine. Voici comment le rendre irrésistible pour vos prospects.",
    date: "8 mars 2026",
  },
  {
    title: "La méthode pour suivre ses clients sans CRM complexe",
    slug: "/blog/la-methode-pour-suivre-ses-clients-sans-crm-complexe",
    category: "Relation client",
    readTime: "4 min",
    excerpt:
      "Vous n\u2019avez pas besoin d\u2019un outil enterprise. Juste d\u2019un système simple et efficace.",
    date: "5 mars 2026",
  },
  {
    title: "Gagner 3 heures par semaine en automatisant sa gestion",
    slug: "/blog/gagner-3-heures-par-semaine-en-automatisant-sa-gestion",
    category: "Productivité",
    readTime: "5 min",
    excerpt:
      "Centraliser, automatiser, simplifier. Voici les 5 actions concrètes.",
    date: "1 mars 2026",
  },
  {
    title: "Le guide complet du brief client réussi",
    slug: "/blog/le-guide-complet-du-brief-client-reussi",
    category: "Relation client",
    readTime: "7 min",
    excerpt:
      "Un bon brief évite 80 % des problèmes. Voici comment le structurer.",
    date: "25 février 2026",
  },
];

const filterCategories = [
  "Tous",
  "Productivité",
  "Facturation",
  "Relation client",
  "Organisation",
  "Portfolio",
];

const crossLinks = [
  {
    title: "Comparatifs",
    description: "Comparez Jestly avec les outils que vous utilisez déjà.",
    href: "/comparatifs",
    icon: "⚖️",
  },
  {
    title: "Templates",
    description: "Des modèles prêts à l\u2019emploi pour gagner du temps.",
    href: "/templates",
    icon: "📋",
  },
  {
    title: "Centre d\u2019aide",
    description: "Guides et tutoriels pour maîtriser Jestly.",
    href: "/centre-aide",
    icon: "📚",
  },
];

/* ── Icônes catégorie pour le featured ── */
const categoryIcons: Record<string, string> = {
  Organisation: "🗂️",
  Facturation: "💰",
  "Relation client": "🤝",
  Productivité: "⚡",
  Portfolio: "🎨",
};

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("Tous");

  const filtered =
    activeCategory === "Tous"
      ? articles
      : articles.filter((a) => a.category === activeCategory);

  const featured = articles[0];

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
                Blog
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
                marginBottom: 20,
              }}
            >
              Ressources pour{" "}
              <span
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, #7C5CFF 0%, #A78BFA 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                freelances créatifs
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease, delay: 0.2 }}
              style={{
                fontSize: 18,
                color: "#6B6F80",
                maxWidth: 540,
                margin: "0 auto",
                lineHeight: 1.7,
              }}
            >
              Conseils, guides et bonnes pratiques pour développer votre
              activité freelance.
            </motion.p>
          </div>
        </section>

        {/* ── Featured article ── */}
        <section className="pb-16 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, ease }}
            >
              <Link href={featured.slug} style={{ textDecoration: "none" }}>
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid #EEEDF2",
                    borderRadius: 24,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "row",
                    transition: "box-shadow 0.3s ease",
                  }}
                  className="flex-col sm:flex-row"
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.boxShadow =
                      "0 12px 40px rgba(124,92,255,0.1)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.boxShadow = "none")
                  }
                >
                  {/* Image placeholder */}
                  <div
                    style={{
                      minHeight: 220,
                      background: `linear-gradient(135deg, ${categoryColors[featured.category]}15, ${categoryColors[featured.category]}30)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 48,
                      flexShrink: 0,
                    }}
                    className="w-full sm:w-[320px]"
                  >
                    {categoryIcons[featured.category] || "📝"}
                  </div>
                  {/* Content */}
                  <div style={{ padding: "32px 28px", flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        marginBottom: 16,
                      }}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 12px",
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 600,
                          color: categoryColors[featured.category],
                          background: `${categoryColors[featured.category]}12`,
                          border: `1px solid ${categoryColors[featured.category]}25`,
                        }}
                      >
                        {featured.category}
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          color: "#A8A8B0",
                        }}
                      >
                        {featured.readTime} de lecture
                      </span>
                    </div>
                    <h2
                      style={{
                        fontSize: "clamp(1.2rem, 2.5vw, 1.5rem)",
                        fontWeight: 700,
                        color: "#111118",
                        marginBottom: 12,
                        lineHeight: 1.3,
                      }}
                    >
                      {featured.title}
                    </h2>
                    <p
                      style={{
                        fontSize: 15,
                        color: "#6B6F80",
                        lineHeight: 1.7,
                        marginBottom: 16,
                      }}
                    >
                      {featured.excerpt}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: 13,
                        color: "#A8A8B0",
                      }}
                    >
                      <span>{featured.date}</span>
                      <span>·</span>
                      <span
                        style={{
                          color: "#7C5CFF",
                          fontWeight: 600,
                        }}
                      >
                        Lire l&apos;article →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ── Category filter pills ── */}
        <section className="pb-8 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease }}
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                justifyContent: "center",
              }}
            >
              {filterCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: "8px 18px",
                    borderRadius: 999,
                    fontSize: 14,
                    fontWeight: 500,
                    border:
                      activeCategory === cat
                        ? "1px solid rgba(124,92,255,0.3)"
                        : "1px solid #EEEDF2",
                    background:
                      activeCategory === cat
                        ? "rgba(124,92,255,0.08)"
                        : "#fff",
                    color:
                      activeCategory === cat ? "#7C5CFF" : "#6B6F80",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  {cat}
                </button>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Article grid ── */}
        <section className="pb-24 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filtered.map((article, i) => (
                <motion.div
                  key={article.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, ease, delay: i * 0.08 }}
                >
                  <Link href={article.slug} style={{ textDecoration: "none" }}>
                    <div
                      style={{
                        background: "#fff",
                        border: "1px solid #EEEDF2",
                        borderRadius: 20,
                        padding: "24px 24px 20px",
                        transition:
                          "box-shadow 0.3s ease, border-color 0.3s ease",
                        cursor: "pointer",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
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
                      {/* Category badge */}
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 12px",
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 600,
                          color:
                            categoryColors[article.category] || "#7C5CFF",
                          background: `${categoryColors[article.category] || "#7C5CFF"}12`,
                          border: `1px solid ${categoryColors[article.category] || "#7C5CFF"}25`,
                          alignSelf: "flex-start",
                          marginBottom: 14,
                        }}
                      >
                        {article.category}
                      </span>

                      {/* Title */}
                      <h3
                        style={{
                          fontSize: 17,
                          fontWeight: 700,
                          color: "#111118",
                          marginBottom: 8,
                          lineHeight: 1.4,
                        }}
                      >
                        {article.title}
                      </h3>

                      {/* Excerpt */}
                      <p
                        style={{
                          fontSize: 14,
                          color: "#6B6F80",
                          lineHeight: 1.7,
                          marginBottom: 16,
                          flex: 1,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {article.excerpt}
                      </p>

                      {/* Meta */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          fontSize: 13,
                          color: "#A8A8B0",
                        }}
                      >
                        <span>{article.date}</span>
                        <span>{article.readTime} de lecture</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Newsletter ── */}
        <section className="pb-24 px-4">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, ease }}
              style={{
                background: "#fff",
                border: "1px solid #EEEDF2",
                borderRadius: 24,
                padding: "40px 32px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  background:
                    "linear-gradient(135deg, rgba(124,92,255,0.1) 0%, rgba(167,139,250,0.06) 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                  fontSize: 24,
                }}
              >
                ✉️
              </div>
              <h2
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#111118",
                  marginBottom: 8,
                }}
              >
                Recevez nos meilleurs conseils freelance
              </h2>
              <p
                style={{
                  fontSize: 15,
                  color: "#6B6F80",
                  lineHeight: 1.7,
                  marginBottom: 24,
                  maxWidth: 400,
                  margin: "0 auto 24px",
                }}
              >
                Un e-mail par semaine, zéro spam. Désabonnement en un clic.
              </p>
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  maxWidth: 420,
                  margin: "0 auto",
                }}
                className="flex-col sm:flex-row"
              >
                <input
                  type="email"
                  placeholder="votre@email.com"
                  disabled
                  style={{
                    flex: 1,
                    height: 46,
                    paddingLeft: 16,
                    paddingRight: 16,
                    borderRadius: 14,
                    border: "1px solid #EEEDF2",
                    background: "#F8F8FC",
                    fontSize: 14,
                    color: "#A8A8B0",
                    outline: "none",
                    cursor: "not-allowed",
                  }}
                />
                <TextSwapButton
                  label="S'abonner"
                  href="/login"
                  variant="primary"
                  size="md"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Cross-links ── */}
        <section className="pb-24 px-4">
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
              Explorez aussi
            </motion.h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {crossLinks.map((link, i) => (
                <motion.div
                  key={link.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, ease, delay: i * 0.08 }}
                >
                  <Link href={link.href} style={{ textDecoration: "none" }}>
                    <div
                      style={{
                        background: "#fff",
                        border: "1px solid #EEEDF2",
                        borderRadius: 20,
                        padding: "24px 20px",
                        textAlign: "center",
                        transition:
                          "box-shadow 0.3s ease, border-color 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow =
                          "0 8px 24px rgba(124,92,255,0.08)";
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
                          fontSize: 28,
                          marginBottom: 12,
                        }}
                      >
                        {link.icon}
                      </div>
                      <h3
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          color: "#111118",
                          marginBottom: 6,
                        }}
                      >
                        {link.title}
                      </h3>
                      <p
                        style={{
                          fontSize: 13,
                          color: "#6B6F80",
                          lineHeight: 1.6,
                        }}
                      >
                        {link.description}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
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
              Prêt à simplifier votre activité ?
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
