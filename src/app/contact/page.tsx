"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqItems = [
  {
    question: "Comment contacter le support ?",
    answer:
      "Par email à jestly@gmail.com ou depuis votre espace client dans la section Support.",
  },
  {
    question: "Sous combien de temps obtenez-vous une réponse ?",
    answer:
      "Nous répondons généralement sous 24 heures en jours ouvrés.",
  },
  {
    question: "Où trouver l'aide Jestly ?",
    answer:
      "Consultez notre Guide accessible depuis le menu de votre dashboard.",
  },
];

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-[#EFEFEF] last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 text-left text-[15px] font-medium text-[#191919] hover:text-[#4F46E5] transition-colors"
      >
        {question}
        <svg
          className={`h-4 w-4 shrink-0 text-[#8A8A88] transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" as const }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-[14px] leading-relaxed text-[#5A5A58]">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl">
      {/* Hero */}
      <div className="mb-10 text-center">
        <h1 className="text-[28px] font-bold text-[#191919]">Contactez-nous</h1>
        <p className="mt-3 text-[15px] text-[#5A5A58]">
          Une question ou un problème ? Notre équipe est là pour vous aider.
        </p>
      </div>

      {/* Main card */}
      <div className="rounded-xl border border-[#E6E6E4] bg-white p-8 shadow-sm">
        {/* Email section */}
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EEF2FF]">
            <svg
              className="h-5 w-5 text-[#4F46E5]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
              />
            </svg>
          </div>
          <div className="flex-1">
            <a
              href="mailto:jestly@gmail.com"
              className="text-[15px] font-medium text-[#4F46E5] hover:text-[#4338CA] transition-colors"
            >
              jestly@gmail.com
            </a>
            <p className="mt-1.5 text-[14px] leading-relaxed text-[#5A5A58]">
              Vous pouvez nous contacter directement par email. Nous répondons
              généralement sous 24 heures.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <a
            href="mailto:jestly@gmail.com"
            className="inline-flex items-center justify-center rounded-lg bg-[#4F46E5] px-5 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-[#4338CA]"
          >
            Envoyer un email
          </a>
        </div>

        {/* Divider */}
        <div className="my-8 border-t border-[#EFEFEF]" />

        {/* Client section */}
        <div className="flex items-center justify-between">
          <p className="text-[14px] text-[#5A5A58]">Vous êtes déjà client ?</p>
          <a
            href="/support"
            className="text-[14px] font-medium text-[#4F46E5] hover:text-[#4338CA] transition-colors"
          >
            Accéder au support &rarr;
          </a>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-14">
        <h2 className="mb-6 text-[20px] font-semibold text-[#191919]">
          Questions fréquentes
        </h2>
        <div className="rounded-xl border border-[#E6E6E4] bg-white px-6">
          {faqItems.map((item) => (
            <FaqItem key={item.question} question={item.question} answer={item.answer} />
          ))}
        </div>
      </div>
    </div>
  );
}
