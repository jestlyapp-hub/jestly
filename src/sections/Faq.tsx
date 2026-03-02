"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqData = [
  {
    q: "C'est quoi Jestly exactement ?",
    a: "Jestly est une plateforme tout-en-un pour freelances creatifs. Elle regroupe votre site web, la gestion de commandes, le CRM, la facturation, les paiements et l'agenda dans un seul outil simple et intuitif.",
  },
  {
    q: "Est-ce que c'est vraiment gratuit ?",
    a: "Oui. Le plan Free vous permet de gerer jusqu'a 10 commandes par mois, avec un site web inclus et un CRM basique. Aucune carte bancaire requise.",
  },
  {
    q: "Je peux vendre des formations ?",
    a: "Absolument. Jestly vous permet de vendre des services, des prestations ponctuelles, des abonnements et des produits numeriques comme des formations ou des templates.",
  },
  {
    q: "Comment fonctionne le sous-domaine ?",
    a: "A la creation de votre compte, vous choisissez votre identifiant. Votre site sera accessible a votrenom.jestly.fr. Vous pourrez aussi connecter votre propre domaine avec le plan Pro.",
  },
  {
    q: "Puis-je connecter mon Stripe existant ?",
    a: "Oui, vous connectez votre propre compte Stripe en quelques clics. Les paiements arrivent directement sur votre compte — Jestly ne prend aucune commission.",
  },
];

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <motion.svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-white/30 flex-shrink-0"
      animate={{ rotate: open ? 45 : 0 }}
      transition={{ duration: 0.25 }}
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </motion.svg>
  );
}

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="relative py-32 px-6 bg-[#0a0a12]">
      <div className="max-w-2xl mx-auto">
        <motion.h2
          className="text-3xl sm:text-[2.6rem] font-extrabold text-center leading-tight mb-14"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Questions frequentes
        </motion.h2>

        <div className="flex flex-col">
          {faqData.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div
                key={i}
                className="border-b border-white/[0.06]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between py-5 text-left cursor-pointer group"
                >
                  <span className="text-[15px] font-semibold pr-4 group-hover:text-white/90 transition-colors">
                    {item.q}
                  </span>
                  <ChevronIcon open={isOpen} />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="text-sm text-white/40 pb-5 leading-relaxed">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
