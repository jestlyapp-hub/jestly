"use client";

import { motion } from "framer-motion";
import TextSwapButton from "@/components/ui/TextSwapButton";

const ease = [0.22, 1, 0.36, 1] as const;

interface RoadmapItem {
  title: string;
}

interface RoadmapColumn {
  label: string;
  color: string;
  items: RoadmapItem[];
}

const columns: RoadmapColumn[] = [
  {
    label: "Maintenant",
    color: "#22c55e",
    items: [
      { title: "Commandes & suivi de projets" },
      { title: "CRM clients intégré" },
      { title: "Site vitrine & portfolio" },
      { title: "Facturation & devis" },
      { title: "Calendrier & tâches" },
      { title: "Analytics business" },
    ],
  },
  {
    label: "Prochainement",
    color: "#F59E0B",
    items: [
      { title: "Application mobile" },
      { title: "Paiements Stripe intégrés" },
      { title: "Automatisations workflows" },
      { title: "Templates personnalisables" },
      { title: "Exports comptables avancés" },
      { title: "Briefing client interactif" },
    ],
  },
  {
    label: "Plus tard",
    color: "#7C5CFF",
    items: [
      { title: "Collaboration équipe" },
      { title: "API publique" },
      { title: "Intégrations tierces" },
      { title: "Marketplace de templates" },
      { title: "Mode hors-ligne" },
      { title: "IA assistante" },
    ],
  },
];

export default function RoadmapPage() {
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
                Roadmap
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
              Ce qu&apos;on{" "}
              <span
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, #7C5CFF 0%, #A78BFA 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                construit
              </span>{" "}
              pour vous.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease, delay: 0.2 }}
              style={{
                fontSize: 18,
                color: "#6B6F80",
                maxWidth: 520,
                margin: "0 auto",
                lineHeight: 1.7,
              }}
            >
              Transparence totale sur l&apos;évolution de Jestly.
            </motion.p>
          </div>
        </section>

        {/* ── Columns ── */}
        <section className="pb-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {columns.map((col, colIdx) => (
                <motion.div
                  key={col.label}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, ease, delay: colIdx * 0.12 }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 24,
                    }}
                  >
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: col.color,
                        flexShrink: 0,
                      }}
                    />
                    <h2
                      style={{
                        fontSize: 20,
                        fontWeight: 700,
                        color: "#111118",
                      }}
                    >
                      {col.label}
                    </h2>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {col.items.map((item, i) => (
                      <motion.div
                        key={item.title}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-40px" }}
                        transition={{
                          duration: 0.4,
                          ease,
                          delay: colIdx * 0.12 + i * 0.06,
                        }}
                        style={{
                          background: "#fff",
                          border: "1px solid #EEEDF2",
                          borderRadius: 16,
                          padding: "16px 20px",
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          cursor: "default",
                          transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                        }}
                        whileHover={{
                          borderColor: col.color,
                          boxShadow: `0 4px 16px ${col.color}15`,
                        }}
                      >
                        <div
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            background: col.color,
                            opacity: 0.5,
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontSize: 15,
                            fontWeight: 500,
                            color: "#111118",
                          }}
                        >
                          {item.title}
                        </span>
                      </motion.div>
                    ))}
                  </div>
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
                marginBottom: 12,
              }}
            >
              Vous avez une idée ?{" "}
              <span
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, #7C5CFF 0%, #A78BFA 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Dites-nous.
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease, delay: 0.05 }}
              style={{
                fontSize: 16,
                color: "#6B6F80",
                marginBottom: 28,
                lineHeight: 1.7,
              }}
            >
              Votre avis façonne directement la prochaine version de Jestly.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease, delay: 0.1 }}
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              <TextSwapButton
                label="Nous contacter"
                href="/contact"
                variant="primary"
                size="lg"
              />
              <TextSwapButton
                label="Commencer gratuitement"
                href="/login"
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
