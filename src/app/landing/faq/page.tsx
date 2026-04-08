"use client";

import { useId, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionShell from "@/components/landing/SectionShell";
import TextSwapButton from "@/components/ui/TextSwapButton";
import { FAQ_CATEGORIES, type FaqQA } from "./faq-data";

const ease = [0.22, 1, 0.36, 1] as const;

/* ═══════════════════════════════════════════════════════════════════════
   Accordion item (accessible)
   - button avec aria-expanded / aria-controls
   - panneau avec role="region" + id unique
   - clavier : Enter/Space natifs, Escape gérés plus haut
   ═══════════════════════════════════════════════════════════════════════ */
function AccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: FaqQA;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const uid = useId();
  const btnId = `faq-btn-${uid}`;
  const panelId = `faq-panel-${uid}`;

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
        id={btnId}
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="w-full min-h-[56px] flex items-center justify-between gap-4 px-5 py-4 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]/40 focus-visible:ring-offset-2 rounded-xl"
      >
        <span className="text-[15px] font-semibold text-[#111118]">
          {item.question}
        </span>
        <motion.svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#6B6F80"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease }}
          className="flex-shrink-0"
          aria-hidden
        >
          <path d="M6 9l6 6 6-6" />
        </motion.svg>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={btnId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">
              <p className="text-[14px] leading-relaxed text-[#4B4F60]">
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
  const [openKey, setOpenKey] = useState<string | null>(null);
  const toggle = (key: string) => setOpenKey((prev) => (prev === key ? null : key));

  return (
    <main
      id="main"
      className="min-h-screen"
      style={{ background: "linear-gradient(180deg, #F8F8FC 0%, #F4F3FA 100%)" }}
    >
      {/* Radial violet glows */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        <div
          className="absolute"
          style={{
            top: "10%",
            left: "15%",
            width: 650,
            height: 650,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124,92,255,0.07), transparent 70%)",
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
            background: "radial-gradient(circle, rgba(139,92,246,0.05), transparent 70%)",
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
                color: "#6D28D9",
                background: "rgba(124,92,255,0.08)",
                border: "1px solid rgba(124,92,255,0.15)",
              }}
            >
              FAQ
            </span>
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-[-0.03em] leading-[1.05] mb-5 text-[#111118]"
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
            className="text-[17px] max-w-2xl mx-auto leading-relaxed text-[#4B4F60]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease }}
          >
            Tout ce que vous devez savoir sur Jestly : bêta gratuite, fonctionnalités,
            sécurité, support et démarrage. Si votre question n&apos;est pas ici, écrivez-nous.
          </motion.p>
        </div>
      </SectionShell>

      {/* ── Categories ── */}
      <SectionShell atmosphere="calm" className="relative z-10">
        <div className="max-w-3xl mx-auto space-y-12">
          {FAQ_CATEGORIES.map((cat, catIdx) => (
            <motion.section
              key={cat.title}
              aria-label={cat.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: catIdx * 0.08, ease }}
            >
              <h2 className="text-[18px] font-bold text-[#111118] mb-4 flex items-center gap-2">
                <span
                  className="w-1.5 h-5 rounded-full"
                  style={{ background: "linear-gradient(135deg, #7C5CFF, #A78BFA)" }}
                  aria-hidden
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
                      isOpen={openKey === key}
                      onToggle={() => toggle(key)}
                    />
                  );
                })}
              </div>
            </motion.section>
          ))}
        </div>
      </SectionShell>

      {/* ── CTA ── */}
      <SectionShell atmosphere="elevated" className="relative z-10">
        <motion.div
          className="text-center max-w-xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
        >
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-[-0.02em] mb-4 text-[#111118]">
            Encore une question ?
          </h2>
          <p className="text-[15px] mb-8 text-[#4B4F60] leading-relaxed">
            L&apos;équipe répond généralement sous 24 h ouvrées. Sinon, essayez par
            vous-même — la bêta est gratuite, sans carte bancaire.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <TextSwapButton
              label="Créer mon compte gratuit"
              href="/signup"
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
    </main>
  );
}
