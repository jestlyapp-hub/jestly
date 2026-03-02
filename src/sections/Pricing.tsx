"use client";

import { motion } from "framer-motion";

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#8f3dff"
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
  "Commandes illimitees",
  "Factures automatiques",
  "Toutes les integrations",
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
      className="relative py-32 px-6"
      style={{
        background:
          "linear-gradient(180deg, #0a0a12 0%, #0d0a1f 50%, #0a0a12 100%)",
      }}
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
          <h2 className="text-3xl sm:text-[2.6rem] font-extrabold leading-tight mb-4">
            Un prix simple.
          </h2>
          <p className="text-white/40">
            Pas de frais caches. Evoluez quand vous voulez.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* ── Free ── */}
          <motion.div
            className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8"
            variants={cardVariants}
            custom={0}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-bold mb-1">Gratuit</h3>
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-4xl font-extrabold">0&euro;</span>
              <span className="text-white/30 text-sm">/mois</span>
            </div>
            <ul className="flex flex-col gap-3.5 mb-8">
              {freePlan.map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-3 text-sm text-white/50"
                >
                  <CheckIcon /> {f}
                </li>
              ))}
            </ul>
            <motion.a
              href="#"
              className="block text-center w-full py-3.5 rounded-full border border-white/10 text-sm font-semibold text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Commencer
            </motion.a>
          </motion.div>

          {/* ── Pro ── */}
          <motion.div
            className="relative bg-white/[0.04] rounded-2xl p-8 border border-[#6a18f1]/30 shadow-[0_0_60px_rgba(106,24,241,0.1)]"
            variants={cardVariants}
            custom={1}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {/* Badge */}
            <div className="absolute -top-3 right-6">
              <span className="text-[11px] font-bold uppercase tracking-wider bg-gradient-to-r from-[#6a18f1] to-[#8f3dff] text-white px-4 py-1.5 rounded-full">
                Populaire
              </span>
            </div>

            <h3 className="text-lg font-bold mb-1">Pro</h3>
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-4xl font-extrabold">7&euro;</span>
              <span className="text-white/30 text-sm">/mois</span>
            </div>
            <ul className="flex flex-col gap-3.5 mb-8">
              {proPlan.map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-3 text-sm text-white/50"
                >
                  <CheckIcon /> {f}
                </li>
              ))}
            </ul>
            <motion.a
              href="#"
              className="block text-center w-full py-3.5 rounded-full bg-gradient-to-r from-[#6a18f1] to-[#8f3dff] text-sm font-semibold text-white cursor-pointer hover:shadow-[0_0_32px_rgba(106,24,241,0.45)] transition-shadow"
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
