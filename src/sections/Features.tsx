"use client";

import { motion } from "framer-motion";

/* ─── Icones SVG minimalistes ─── */

const icons = {
  globe: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  layout: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18" />
      <path d="M9 21V9" />
    </svg>
  ),
  users: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  fileText: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  barChart: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 20V10" />
      <path d="M12 20V4" />
      <path d="M6 20v-6" />
    </svg>
  ),
  creditCard: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  ),
};

const features = [
  {
    icon: icons.globe,
    title: "Site web no-code",
    desc: "Créez votre vitrine avec sous-domaine personnalisé en quelques minutes.",
  },
  {
    icon: icons.layout,
    title: "Commandes clients",
    desc: "Recevez et gérez vos commandes avec un kanban intuitif.",
  },
  {
    icon: icons.barChart,
    title: "Dashboard revenus",
    desc: "Suivez vos revenus, conversions et panier moyen en temps réel.",
  },
  {
    icon: icons.users,
    title: "CRM freelance",
    desc: "Chaque vente enrichit automatiquement votre base clients.",
  },
  {
    icon: icons.fileText,
    title: "Facturation intégrée",
    desc: "Factures PDF automatiques. Numérotation, TVA, tout est géré.",
  },
  {
    icon: icons.creditCard,
    title: "Gestion abonnements",
    desc: "Proposez des abonnements et gérez les paiements récurrents.",
  },
];

/* ─── Variants Framer Motion ─── */
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
} as const;

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function Features() {
  return (
    <section
      id="features"
      className="relative py-32 px-6 bg-[#FBFBFA]"
    >
      <div className="max-w-5xl mx-auto">
        {/* Titre */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-[2.6rem] font-bold leading-tight mb-4 text-[#191919]">
            Tout ce qu&apos;il vous faut.
          </h2>
          <p className="text-[#8A8A88] text-base max-w-md mx-auto">
            Six outils essentiels réunis dans une interface unique.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={cardVariants}
              className="group bg-white border border-[#E6E6E4] rounded-lg p-7 transition-all duration-300 hover:bg-[#F7F7F5]"
            >
              <div className="text-[#4F46E5] mb-4">{f.icon}</div>
              <h3 className="text-[15px] font-semibold mb-2 text-[#191919]">{f.title}</h3>
              <p className="text-sm text-[#8A8A88] leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
