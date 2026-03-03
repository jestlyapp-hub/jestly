"use client";

import { motion } from "framer-motion";

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#4F46E5"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

const freePlan = [
  "10 commandes / mois",
  "Site web inclus",
  "CRM basique",
  "Dashboard",
];

const proPlan = [
  "Commandes illimitées",
  "Factures automatiques",
  "Toutes les intégrations",
  "Support prioritaire",
];

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const, delay: i * 0.12 },
  }),
};

export default function Pricing() {
  return (
    <section
      id="pricing"
      className="relative py-32 px-6 bg-[#FBFBFA]"
    >
      <div className="max-w-2xl mx-auto">
        {/* Titre */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-[2.6rem] font-bold leading-tight mb-4 text-[#191919]">
            Un prix simple.
          </h2>
          <p className="text-[#8A8A88]">
            Pas de frais cachés. Évoluez quand vous voulez.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* ── Free ── */}
          <motion.div
            className="bg-white border border-[#E6E6E4] rounded-lg p-8"
            variants={cardVariants}
            custom={0}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold mb-1 text-[#191919]">Gratuit</h3>
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-4xl font-bold text-[#191919]">0&euro;</span>
              <span className="text-[#8A8A88] text-sm">/mois</span>
            </div>
            <ul className="flex flex-col gap-3.5 mb-8">
              {freePlan.map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-3 text-sm text-[#5A5A58]"
                >
                  <CheckIcon /> {f}
                </li>
              ))}
            </ul>
            <motion.a
              href="/login"
              className="block text-center w-full py-3.5 rounded-md border border-[#E6E6E4] text-sm font-semibold text-[#191919] hover:bg-[#F7F7F5] transition-colors cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Commencer
            </motion.a>
          </motion.div>

          {/* ── Pro ── */}
          <motion.div
            className="relative bg-white rounded-lg p-8 border-2 border-[#4F46E5]"
            variants={cardVariants}
            custom={1}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {/* Badge */}
            <div className="absolute -top-3 right-6">
              <span className="text-[11px] font-bold uppercase tracking-wider bg-[#4F46E5] text-white px-4 py-1.5 rounded-full">
                Populaire
              </span>
            </div>

            <h3 className="text-lg font-semibold mb-1 text-[#191919]">Pro</h3>
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-4xl font-bold text-[#191919]">7&euro;</span>
              <span className="text-[#8A8A88] text-sm">/mois</span>
            </div>
            <ul className="flex flex-col gap-3.5 mb-8">
              {proPlan.map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-3 text-sm text-[#5A5A58]"
                >
                  <CheckIcon /> {f}
                </li>
              ))}
            </ul>
            <motion.a
              href="/login"
              className="block text-center w-full py-3.5 rounded-md bg-[#4F46E5] text-sm font-semibold text-white cursor-pointer hover:bg-[#4338CA] transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Passer Pro
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
