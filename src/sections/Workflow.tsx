"use client";

import { motion } from "framer-motion";

const steps = [
  {
    num: "01",
    title: "Créez votre compte",
    desc: "Inscription gratuite en 30 secondes, sans carte bancaire.",
  },
  {
    num: "02",
    title: "Configurez votre site",
    desc: "Ajoutez vos services, fixez vos prix, personnalisez votre vitrine.",
  },
  {
    num: "03",
    title: "Recevez et gerez",
    desc: "Commandes, clients, factures — tout est automatique.",
  },
];

const stepVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const, delay: i * 0.15 },
  }),
};

export default function Workflow() {
  return (
    <section className="relative py-32 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Titre */}
        <motion.h2
          className="text-3xl sm:text-[2.6rem] font-bold text-center leading-tight mb-20 text-[#191919]"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Lancez-vous en 3 étapes.
        </motion.h2>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-6">
          {/* Timeline horizontale (desktop) */}
          <motion.div
            className="hidden md:block absolute top-10 left-[15%] right-[15%] h-[2px] overflow-hidden"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-transparent via-[#4F46E5] to-transparent"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
            />
          </motion.div>

          {/* Timeline verticale (mobile) */}
          <motion.div
            className="md:hidden absolute top-0 bottom-0 left-6 w-[2px] overflow-hidden"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="w-full h-full bg-gradient-to-b from-transparent via-[#4F46E5] to-transparent"
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
              style={{ transformOrigin: "top" }}
            />
          </motion.div>

          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              className="relative text-center md:text-center pl-14 md:pl-0"
              variants={stepVariants}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {/* Numero */}
              <div className="mb-4 inline-block">
                <span className="text-5xl font-bold text-[#4F46E5]">
                  {step.num}
                </span>
              </div>

              {/* Point sur la timeline (mobile) */}
              <div className="md:hidden absolute left-[18px] top-5 w-3 h-3 rounded-full bg-[#4F46E5]" />

              <h3 className="text-lg font-semibold mb-2 text-[#191919]">{step.title}</h3>
              <p className="text-sm text-[#8A8A88] max-w-[240px] mx-auto">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
