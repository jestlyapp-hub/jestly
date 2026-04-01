"use client";

import { motion } from "framer-motion";
import TextSwapButton from "@/components/ui/TextSwapButton";

const ease = [0.22, 1, 0.36, 1] as const;

const valeurs = [
  {
    title: "Simplicité",
    description:
      "Chaque fonctionnalité doit être comprise en 3 secondes. Pas de menu caché, pas de jargon.",
  },
  {
    title: "Transparence",
    description:
      "Tarifs clairs, roadmap publique, communication directe. Pas de mauvaise surprise.",
  },
  {
    title: "Design",
    description:
      "Un outil pour créatifs se doit d\u2019être beau. L\u2019interface est un produit, pas un compromis.",
  },
  {
    title: "Efficacité",
    description:
      "Moins de clics, plus de résultats. Chaque interaction est optimisée pour votre temps.",
  },
];

const whyCards = [
  {
    title: "Trop d\u2019outils dispersés",
    description:
      "Les freelances jonglent entre 5 à 10 outils différents : Notion, Trello, Excel, Stripe, Google Agenda\u2026 Aucune connexion entre eux, aucune vue d\u2019ensemble.",
  },
  {
    title: "Pas d\u2019outil pensé créatif",
    description:
      "Les outils existants sont conçus pour des équipes corporate. Interface austère, workflows rigides, zéro sensibilité design.",
  },
  {
    title: "L\u2019organisation ne devrait pas être un frein",
    description:
      "Votre talent, c\u2019est créer. Pas gérer des tableurs. L\u2019admin devrait être invisible pour que vous puissiez vous concentrer sur ce qui compte.",
  },
];

export default function AProposPage() {
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
                À propos
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
              est né d&apos;un constat simple.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease, delay: 0.2 }}
              style={{
                fontSize: 18,
                color: "#6B6F80",
                maxWidth: 560,
                margin: "0 auto",
                lineHeight: 1.7,
              }}
            >
              Les freelances créatifs méritent un outil à la hauteur de leur
              ambition.
            </motion.p>
          </div>
        </section>

        {/* ── La mission ── */}
        <section className="pb-20 px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, ease }}
              style={{
                background: "#fff",
                border: "1px solid #EEEDF2",
                borderRadius: 20,
                padding: "40px 36px",
              }}
            >
              <h2
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: "#111118",
                  marginBottom: 16,
                }}
              >
                La mission
              </h2>
              <p
                style={{
                  fontSize: 16,
                  color: "#6B6F80",
                  lineHeight: 1.75,
                }}
              >
                Jestly centralise tout ce dont un freelance créatif a besoin
                pour gérer son activité : commandes, clients, facturation,
                calendrier, site vitrine et analytics. Un seul outil, une seule
                interface, zéro friction. Fini les onglets éparpillés, les
                données qui ne se parlent pas, et les heures perdues à jongler
                entre des outils qui n&apos;ont jamais été conçus pour vous.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── Pourquoi Jestly existe ── */}
        <section className="pb-24 px-4">
          <div className="max-w-5xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, ease }}
              style={{
                fontSize: "clamp(1.5rem, 3.5vw, 2rem)",
                fontWeight: 700,
                color: "#111118",
                textAlign: "center",
                marginBottom: 48,
              }}
            >
              Pourquoi{" "}
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
              existe
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {whyCards.map((card, i) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, ease, delay: i * 0.1 }}
                  style={{
                    background: "#fff",
                    border: "1px solid #EEEDF2",
                    borderRadius: 20,
                    padding: "32px 28px",
                  }}
                >
                  <h3
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: "#111118",
                      marginBottom: 12,
                    }}
                  >
                    {card.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 15,
                      color: "#6B6F80",
                      lineHeight: 1.7,
                    }}
                  >
                    {card.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Nos valeurs ── */}
        <section className="pb-24 px-4">
          <div className="max-w-5xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, ease }}
              style={{
                fontSize: "clamp(1.5rem, 3.5vw, 2rem)",
                fontWeight: 700,
                color: "#111118",
                textAlign: "center",
                marginBottom: 48,
              }}
            >
              Nos valeurs
            </motion.h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {valeurs.map((v, i) => (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, ease, delay: i * 0.08 }}
                  style={{
                    background: "#fff",
                    border: "1px solid #EEEDF2",
                    borderRadius: 20,
                    padding: "28px 24px",
                    textAlign: "center",
                  }}
                >
                  <h3
                    style={{
                      fontSize: 17,
                      fontWeight: 700,
                      marginBottom: 10,
                      backgroundImage:
                        "linear-gradient(135deg, #7C5CFF 0%, #A78BFA 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {v.title}
                  </h3>
                  <p style={{ fontSize: 14, color: "#6B6F80", lineHeight: 1.7 }}>
                    {v.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Construit pour durer ── */}
        <section className="pb-24 px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, ease }}
              style={{
                background: "#fff",
                border: "1px solid #EEEDF2",
                borderRadius: 20,
                padding: "40px 36px",
              }}
            >
              <h2
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: "#111118",
                  marginBottom: 16,
                }}
              >
                Construit pour durer
              </h2>
              <p
                style={{
                  fontSize: 16,
                  color: "#6B6F80",
                  lineHeight: 1.75,
                }}
              >
                Jestly évolue en continu grâce aux retours de ses utilisateurs.
                Chaque fonctionnalité est pensée, testée et améliorée dans une
                logique de qualité durable. Notre roadmap est ambitieuse et
                transparente : application mobile, automatisations, API publique
                et bien plus. On construit un outil qui grandira avec votre
                activité.
              </p>
            </motion.div>
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
              Rejoignez les freelances qui centralisent tout.
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
