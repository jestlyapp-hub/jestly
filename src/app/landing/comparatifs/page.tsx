"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import TextSwapButton from "@/components/ui/TextSwapButton";

const ease = [0.22, 1, 0.36, 1] as const;

const beforeTools = [
  { name: "Notion", emoji: "\ud83d\udcdd" },
  { name: "Trello", emoji: "\ud83d\udcca" },
  { name: "Google Agenda", emoji: "\ud83d\udcc5" },
  { name: "Excel", emoji: "\ud83d\udcc8" },
  { name: "Stripe Dashboard", emoji: "\ud83d\udcb3" },
  { name: "Wix", emoji: "\ud83c\udf10" },
];

const comparisons = [
  {
    competitor: "Notion",
    slug: "jestly-vs-notion",
    description:
      "Jestly centralise là où Notion ne fait qu\u2019organiser. CRM, facturation et site inclus.",
  },
  {
    competitor: "Trello",
    slug: "jestly-vs-trello",
    description:
      "Jestly va au-delà du kanban : commandes, clients et facturation dans un seul flux.",
  },
  {
    competitor: "ClickUp",
    slug: "jestly-vs-clickup",
    description:
      "Jestly est pensé freelance. Pas besoin de 200 réglages pour être productif.",
  },
  {
    competitor: "Google Sheets",
    slug: "jestly-vs-google-sheets",
    description:
      "Jestly remplace vos tableurs par un vrai système connecté, sans formules.",
  },
  {
    competitor: "Google Agenda",
    slug: "jestly-vs-google-agenda",
    description:
      "Jestly intègre calendrier, tâches et commandes. Tout est lié automatiquement.",
  },
  {
    competitor: "HubSpot",
    slug: "jestly-vs-hubspot",
    description:
      "Jestly offre un CRM adapté aux freelances, sans la complexité enterprise.",
  },
];

export default function ComparatifsPage() {
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
        <section className="pt-32 sm:pt-40 pb-20 px-4">
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
                Comparatifs
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
              Pourquoi choisir{" "}
              <span
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, #7C5CFF 0%, #A78BFA 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Jestly
              </span>{" "}
              ?
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
              Comparez objectivement. Décidez en connaissance de cause.
            </motion.p>
          </div>
        </section>

        {/* ── Before / After visual ── */}
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
                marginBottom: 40,
              }}
            >
              Jestly remplace vos outils dispersés
            </motion.h2>
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-6 justify-center">
              {/* Before */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.7, ease }}
                style={{
                  background: "#fff",
                  border: "1px solid #EEEDF2",
                  borderRadius: 20,
                  padding: "32px 28px",
                  flex: 1,
                  maxWidth: 340,
                  width: "100%",
                }}
              >
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#A8A8B0",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    marginBottom: 20,
                    textAlign: "center",
                  }}
                >
                  Avant
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
                  {beforeTools.map((tool) => (
                    <div
                      key={tool.name}
                      style={{
                        background: "#F8F8FC",
                        border: "1px solid #EEEDF2",
                        borderRadius: 12,
                        padding: "10px 14px",
                        fontSize: 13,
                        fontWeight: 500,
                        color: "#6B6F80",
                        textAlign: "center",
                      }}
                    >
                      <span style={{ marginRight: 6 }}>{tool.emoji}</span>
                      {tool.name}
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Arrow */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, ease, delay: 0.2 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 48 48"
                  fill="none"
                  className="rotate-90 md:rotate-0"
                >
                  <circle cx="24" cy="24" r="24" fill="rgba(124,92,255,0.08)" />
                  <path
                    d="M18 24h12M26 20l4 4-4 4"
                    stroke="#7C5CFF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.div>

              {/* After */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.7, ease, delay: 0.15 }}
                style={{
                  background: "#fff",
                  border: "2px solid #7C5CFF",
                  borderRadius: 20,
                  padding: "32px 28px",
                  flex: 1,
                  maxWidth: 340,
                  width: "100%",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#7C5CFF",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    marginBottom: 20,
                  }}
                >
                  Après
                </p>
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(124,92,255,0.06) 0%, rgba(167,139,250,0.04) 100%)",
                    border: "1px solid rgba(124,92,255,0.15)",
                    borderRadius: 16,
                    padding: "24px 20px",
                  }}
                >
                  <span
                    style={{
                      fontSize: 28,
                      fontWeight: 700,
                      backgroundImage:
                        "linear-gradient(135deg, #7C5CFF 0%, #A78BFA 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    Jestly
                  </span>
                  <p
                    style={{
                      fontSize: 13,
                      color: "#6B6F80",
                      marginTop: 6,
                    }}
                  >
                    Tout-en-un pour freelances
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Comparison cards ── */}
        <section className="pb-24 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {comparisons.map((comp, i) => (
                <motion.div
                  key={comp.slug}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, ease, delay: i * 0.08 }}
                >
                  <Link
                    href={`/landing/comparatifs/${comp.slug}`}
                    style={{
                      display: "block",
                      background: "#fff",
                      border: "1px solid #EEEDF2",
                      borderRadius: 20,
                      padding: "28px 24px",
                      textDecoration: "none",
                      transition:
                        "border-color 0.2s ease, box-shadow 0.2s ease",
                      height: "100%",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "rgba(124,92,255,0.3)";
                      e.currentTarget.style.boxShadow =
                        "0 8px 24px rgba(124,92,255,0.08)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#EEEDF2";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <h3
                      style={{
                        fontSize: 17,
                        fontWeight: 700,
                        color: "#111118",
                        marginBottom: 8,
                      }}
                    >
                      Jestly vs {comp.competitor}
                    </h3>
                    <p
                      style={{
                        fontSize: 14,
                        color: "#6B6F80",
                        lineHeight: 1.7,
                        marginBottom: 16,
                      }}
                    >
                      {comp.description}
                    </p>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#7C5CFF",
                      }}
                    >
                      Voir le comparatif →
                    </span>
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
              Prêt à tout centraliser ?
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease, delay: 0.1 }}
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              <TextSwapButton
                label="Essayer Jestly gratuitement"
                href="/login"
                variant="primary"
                size="lg"
              />
              <TextSwapButton
                label="Voir les tarifs"
                href="/landing#pricing"
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
