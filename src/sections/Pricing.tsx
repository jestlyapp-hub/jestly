"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ═══════════════════════════════════════════════════════════
   DONNÉES PRICING
   ═══════════════════════════════════════════════════════════ */

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    tagline: "Pour découvrir et démarrer",
    monthlyPrice: 0,
    yearlyPrice: 0,
    cta: "Commencer gratuitement",
    ctaHref: "/login",
    highlighted: false,
    features: [
      "1 site vitrine",
      "15 commandes / mois",
      "3 projets actifs",
      "CRM basique",
      "Calendrier & tâches",
      "Analytics essentiels",
      "Branding Jestly visible",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Le choix des freelances actifs",
    badge: "Le plus choisi",
    monthlyPrice: 4.99,
    yearlyPrice: 3.99,
    cta: "Passer Pro",
    ctaHref: "/login",
    highlighted: true,
    features: [
      "3 sites vitrines",
      "50 commandes / mois",
      "Projets illimités",
      "CRM complet + exports",
      "Devis & factures automatiques",
      "Calendrier avancé",
      "Analytics complets",
      "Sans branding Jestly",
      "Support prioritaire",
    ],
  },
  {
    id: "business",
    name: "Business",
    tagline: "Pour scaler sans limites",
    monthlyPrice: 14.99,
    yearlyPrice: 11.99,
    cta: "Choisir Business",
    ctaHref: "/login",
    highlighted: false,
    features: [
      "Sites illimités",
      "Commandes illimitées",
      "Projets illimités",
      "Domaine personnalisé",
      "White-label complet",
      "Analytics avancés + exports",
      "Automatisations",
      "Support prioritaire dédié",
      "Accès aux fonctionnalités bêta",
    ],
  },
];

/* ── Tableau comparatif ── */

type CellValue = boolean | string;

interface ComparisonCategory {
  category: string;
  rows: { label: string; starter: CellValue; pro: CellValue; business: CellValue }[];
}

const COMPARISON: ComparisonCategory[] = [
  {
    category: "Gestion business",
    rows: [
      { label: "Sites vitrines", starter: "1", pro: "3", business: "Illimité" },
      { label: "Commandes / mois", starter: "15", pro: "50", business: "Illimité" },
      { label: "Projets actifs", starter: "3", pro: "Illimité", business: "Illimité" },
      { label: "Domaine personnalisé", starter: false, pro: false, business: true },
    ],
  },
  {
    category: "Clients & CRM",
    rows: [
      { label: "Fiches clients", starter: true, pro: true, business: true },
      { label: "Notes & historique", starter: "Basique", pro: "Complet", business: "Complet" },
      { label: "Import / export contacts", starter: false, pro: true, business: true },
    ],
  },
  {
    category: "Facturation & ventes",
    rows: [
      { label: "Devis", starter: false, pro: true, business: true },
      { label: "Factures automatiques", starter: false, pro: true, business: true },
      { label: "Paiement Stripe", starter: true, pro: true, business: true },
      { label: "Exports comptables", starter: false, pro: true, business: true },
    ],
  },
  {
    category: "Production & organisation",
    rows: [
      { label: "Tâches & sous-tâches", starter: true, pro: true, business: true },
      { label: "Calendrier", starter: "Basique", pro: "Avancé", business: "Avancé" },
      { label: "Briefing client", starter: false, pro: true, business: true },
      { label: "Automatisations", starter: false, pro: false, business: true },
    ],
  },
  {
    category: "Site & portfolio",
    rows: [
      { label: "Pages personnalisables", starter: "3", pro: "10", business: "Illimité" },
      { label: "Portfolio projets", starter: true, pro: true, business: true },
      { label: "SEO intégré", starter: "Basique", pro: "Complet", business: "Complet" },
      { label: "White-label (sans Jestly)", starter: false, pro: true, business: true },
    ],
  },
  {
    category: "Analytics & pilotage",
    rows: [
      { label: "Dashboard résumé", starter: true, pro: true, business: true },
      { label: "Analytics détaillés", starter: false, pro: true, business: true },
      { label: "Exports rapports", starter: false, pro: false, business: true },
    ],
  },
  {
    category: "Support & évolutivité",
    rows: [
      { label: "Centre d'aide", starter: true, pro: true, business: true },
      { label: "Support prioritaire", starter: false, pro: true, business: true },
      { label: "Accès bêta", starter: false, pro: false, business: true },
    ],
  },
];

/* ── FAQ ── */

const FAQ_DATA = [
  {
    q: "Puis-je commencer gratuitement ?",
    a: "Oui. Le plan Starter est 100 % gratuit, sans carte bancaire. Vous pouvez l'utiliser aussi longtemps que vous voulez pour découvrir Jestly et organiser votre activité.",
  },
  {
    q: "Puis-je changer d'abonnement à tout moment ?",
    a: "Absolument. Vous pouvez passer de Starter à Pro ou Business à tout moment. Le changement est immédiat et vos données sont conservées.",
  },
  {
    q: "Est-ce que je garde mes données si je downgrade ?",
    a: "Oui, vos données restent intactes. Si vous dépassez les limites du plan inférieur, vous ne pourrez plus en créer de nouvelles, mais rien n'est supprimé.",
  },
  {
    q: "Est-ce qu'il y a un engagement ?",
    a: "Aucun engagement. Vous pouvez résilier à tout moment, même en abonnement annuel. L'accès continue jusqu'à la fin de la période payée.",
  },
  {
    q: "Jestly remplace vraiment plusieurs outils ?",
    a: "Oui. Jestly centralise la gestion de commandes, le CRM, la facturation, le calendrier, les tâches, le site web et les analytics. Vous n'avez plus besoin de jongler entre Notion, Trello, Google Agenda et vos tableurs.",
  },
  {
    q: "Est-ce que Jestly est adapté à un freelance solo ?",
    a: "C'est exactement pour ça qu'il a été conçu. Jestly est pensé pour les freelances créatifs qui veulent se professionnaliser sans se noyer dans des outils complexes.",
  },
  {
    q: "À qui s'adresse le plan Business ?",
    a: "Aux freelances avancés et aux petits studios qui gèrent un volume important de commandes, plusieurs sites et qui veulent un branding complètement personnalisé.",
  },
  {
    q: "Est-ce que je peux utiliser mon propre domaine ?",
    a: "Avec le plan Business, vous pouvez connecter votre propre nom de domaine. Sur le plan Pro, votre site est accessible via un sous-domaine Jestly personnalisé.",
  },
];

/* ── Réassurance ── */

const REASSURANCE = [
  { icon: "shield", label: "Sans engagement" },
  { icon: "zap", label: "Prêt en 3 minutes" },
  { icon: "layers", label: "Remplace 5+ outils" },
  { icon: "heart", label: "Conçu pour les créatifs" },
];

/* ── Value props ── */

const VALUE_PROPS = [
  {
    title: "Moins de temps perdu",
    desc: "Plus besoin de chercher vos infos entre 5 outils. Tout est centralisé, structuré et accessible en un clic.",
    icon: "clock",
  },
  {
    title: "Une image plus pro",
    desc: "Site vitrine, devis et factures avec votre identité. Vos clients voient un professionnel organisé.",
    icon: "star",
  },
  {
    title: "Un business plus clair",
    desc: "Suivez vos commandes, deadlines et revenus en temps réel. Prenez les bonnes décisions sans deviner.",
    icon: "chart",
  },
  {
    title: "Un seul abonnement",
    desc: "Jestly remplace Notion, Trello, Google Agenda, vos tableurs et vos outils de facturation dispersés.",
    icon: "box",
  },
];

/* ═══════════════════════════════════════════════════════════
   COMPOSANTS UTILITAIRES
   ═══════════════════════════════════════════════════════════ */

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D0D0CE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <motion.svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#8A8A88] flex-shrink-0" animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.25 }}>
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </motion.svg>
  );
}

function MiniIcon({ name }: { name: string }) {
  const props = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "#7C3AED", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "shield": return <svg {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
    case "zap": return <svg {...props}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>;
    case "layers": return <svg {...props}><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>;
    case "heart": return <svg {...props}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>;
    case "clock": return <svg {...props}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
    case "star": return <svg {...props}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
    case "chart": return <svg {...props}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
    case "box": return <svg {...props}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>;
    default: return null;
  }
}

function CellDisplay({ value }: { value: CellValue }) {
  if (value === true) return <CheckIcon className="text-[#7C3AED] mx-auto" />;
  if (value === false) return <span className="flex justify-center"><XIcon /></span>;
  return <span className="text-[13px] text-[#5A5A58] font-medium">{value}</span>;
}

/* ═══════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL — PAGE PRICING
   ═══════════════════════════════════════════════════════════ */

export default function Pricing() {
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <section id="pricing" className="relative bg-[#f0eff5] overflow-hidden">

      {/* ── Background subtle grid ── */}
      <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: "radial-gradient(circle, #7C3AED 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

      {/* ═══ 1. HERO PRICING ═══ */}
      <div className="relative pt-28 pb-8 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.p
            className="text-[13px] font-semibold text-[#7C3AED] tracking-wide uppercase mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Abonnements
          </motion.p>

          <motion.h2
            className="text-3xl sm:text-[2.8rem] font-bold leading-[1.15] mb-5 text-[#191919]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
          >
            Un seul outil pour piloter<br className="hidden sm:block" /> tout ton business freelance
          </motion.h2>

          <motion.p
            className="text-[15px] sm:text-[16px] text-[#5A5A58] max-w-xl mx-auto mb-3 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Remplace Notion, Trello, Google Agenda, tes tableurs et tes outils de facturation. Tout est centralisé.
          </motion.p>

          <motion.p
            className="text-[12px] text-[#8A8A88] mb-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            Gratuit · Sans carte bancaire · Sans engagement
          </motion.p>

          {/* Toggle Mensuel / Annuel */}
          <motion.div
            className="inline-flex items-center gap-3 bg-white rounded-full p-1.5 border border-[#E6E6E4] shadow-sm"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2 text-[13px] font-semibold rounded-full transition-all cursor-pointer ${
                !annual ? "bg-[#7C3AED] text-white shadow-sm" : "text-[#5A5A58] hover:text-[#191919]"
              }`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-5 py-2 text-[13px] font-semibold rounded-full transition-all cursor-pointer flex items-center gap-2 ${
                annual ? "bg-[#7C3AED] text-white shadow-sm" : "text-[#5A5A58] hover:text-[#191919]"
              }`}
            >
              Annuel
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                annual ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-600"
              }`}>
                -20 %
              </span>
            </button>
          </motion.div>
        </div>
      </div>

      {/* ═══ 2. CARTES DES PLANS ═══ */}
      <div className="relative px-6 pt-12 pb-16">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          {PLANS.map((plan, i) => {
            const price = annual ? plan.yearlyPrice : plan.monthlyPrice;
            const isHighlighted = plan.highlighted;

            return (
              <motion.div
                key={plan.id}
                className={`relative rounded-2xl p-7 flex flex-col transition-shadow ${
                  isHighlighted
                    ? "bg-white border-2 border-[#7C3AED] shadow-lg shadow-[#7C3AED]/8 md:-mt-3 md:pb-9"
                    : "bg-white border border-[#E6E6E4] hover:shadow-md"
                }`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="text-[11px] font-bold uppercase tracking-wider bg-[#7C3AED] text-white px-4 py-1.5 rounded-full shadow-sm whitespace-nowrap">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <h3 className="text-[15px] font-semibold text-[#191919] mb-0.5">{plan.name}</h3>
                <p className="text-[12px] text-[#8A8A88] mb-5">{plan.tagline}</p>

                {/* Prix */}
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-[40px] font-extrabold text-[#191919] leading-none tracking-tight">
                    {price === 0 ? "0" : price.toFixed(2).replace(".", ",")}€
                  </span>
                  <span className="text-[13px] text-[#8A8A88]">/mois</span>
                </div>
                {annual && price > 0 && (
                  <p className="text-[11px] text-emerald-600 font-medium mb-5">
                    Facturé {(price * 12).toFixed(2).replace(".", ",")} € / an
                  </p>
                )}
                {(!annual || price === 0) && <div className="mb-5" />}

                {/* CTA */}
                <motion.a
                  href={plan.ctaHref}
                  className={`block text-center w-full py-3 rounded-lg text-[13px] font-semibold transition-colors cursor-pointer mb-7 ${
                    isHighlighted
                      ? "bg-[#7C3AED] text-white hover:bg-[#6D28D9] shadow-sm"
                      : "border border-[#E6E6E4] text-[#191919] hover:bg-[#F7F7F5]"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {plan.cta}
                </motion.a>

                {/* Features */}
                <ul className="flex flex-col gap-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[13px] text-[#5A5A58]">
                      <CheckIcon className={isHighlighted ? "text-[#7C3AED] flex-shrink-0 mt-0.5" : "text-[#C0C0BE] flex-shrink-0 mt-0.5"} />
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ═══ 3. BANDEAU RÉASSURANCE ═══ */}
      <div className="relative px-6 pb-20">
        <motion.div
          className="max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {REASSURANCE.map((r) => (
            <div key={r.label} className="flex flex-col items-center gap-2 py-4 px-3 bg-white/60 rounded-xl border border-[#E6E6E4]/60">
              <MiniIcon name={r.icon} />
              <span className="text-[12px] font-medium text-[#5A5A58] text-center">{r.label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ═══ 4. TABLEAU COMPARATIF ═══ */}
      <div className="relative px-6 pb-24">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-2xl sm:text-[2rem] font-bold text-[#191919] mb-3">
              Comparer les plans en détail
            </h3>
            <p className="text-[14px] text-[#8A8A88]">
              Tout ce qui est inclus, plan par plan.
            </p>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl border border-[#E6E6E4] overflow-hidden shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Header */}
            <div className="grid grid-cols-4 border-b border-[#E6E6E4] bg-[#FAFAF9]">
              <div className="px-5 py-4" />
              <div className="px-3 py-4 text-center">
                <span className="text-[12px] font-semibold text-[#8A8A88] uppercase tracking-wider">Starter</span>
              </div>
              <div className="px-3 py-4 text-center">
                <span className="text-[12px] font-bold text-[#7C3AED] uppercase tracking-wider">Pro</span>
              </div>
              <div className="px-3 py-4 text-center">
                <span className="text-[12px] font-semibold text-[#8A8A88] uppercase tracking-wider">Business</span>
              </div>
            </div>

            {/* Categories */}
            {COMPARISON.map((cat, ci) => (
              <div key={cat.category}>
                {/* Category header */}
                <div className="px-5 py-3 bg-[#FAFAF9] border-b border-[#EFEFEF]">
                  <span className="text-[11px] font-bold text-[#8A8A88] uppercase tracking-wider">{cat.category}</span>
                </div>
                {/* Rows */}
                {cat.rows.map((row, ri) => (
                  <div
                    key={`${ci}-${ri}`}
                    className="grid grid-cols-4 border-b border-[#F5F5F3] last:border-b-0 hover:bg-[#FAFAF9] transition-colors"
                  >
                    <div className="px-5 py-3 text-[13px] text-[#5A5A58]">{row.label}</div>
                    <div className="px-3 py-3 text-center"><CellDisplay value={row.starter} /></div>
                    <div className="px-3 py-3 text-center bg-[#7C3AED]/[0.02]"><CellDisplay value={row.pro} /></div>
                    <div className="px-3 py-3 text-center"><CellDisplay value={row.business} /></div>
                  </div>
                ))}
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ═══ 5. POURQUOI ÇA VAUT LE COUP ═══ */}
      <div className="relative px-6 pb-24">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-2xl sm:text-[2rem] font-bold text-[#191919] mb-3">
              Pourquoi ça vaut le coup ?
            </h3>
            <p className="text-[14px] text-[#8A8A88] max-w-lg mx-auto">
              Jestly ne coûte pas un abonnement de plus. Il remplace du temps perdu, du chaos et plusieurs outils.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {VALUE_PROPS.map((vp, i) => (
              <motion.div
                key={vp.title}
                className="bg-white rounded-xl border border-[#E6E6E4] p-6 hover:shadow-md transition-shadow group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <div className="w-10 h-10 rounded-lg bg-[#7C3AED]/8 flex items-center justify-center mb-4 group-hover:bg-[#7C3AED]/12 transition-colors">
                  <MiniIcon name={vp.icon} />
                </div>
                <h4 className="text-[15px] font-semibold text-[#191919] mb-1.5">{vp.title}</h4>
                <p className="text-[13px] text-[#8A8A88] leading-relaxed">{vp.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ 6. FAQ ═══ */}
      <div className="relative px-6 pb-24">
        <div className="max-w-2xl mx-auto">
          <motion.h3
            className="text-2xl sm:text-[2rem] font-bold text-center text-[#191919] mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Questions fréquentes
          </motion.h3>

          <div className="flex flex-col">
            {FAQ_DATA.map((item, i) => {
              const isOpen = openFaq === i;
              return (
                <motion.div
                  key={i}
                  className="border-b border-[#E6E6E4]"
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: i * 0.04 }}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full flex items-center justify-between py-5 text-left cursor-pointer group"
                  >
                    <span className="text-[14px] font-semibold pr-4 text-[#191919] group-hover:text-[#7C3AED] transition-colors">
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
                        <p className="text-[13px] text-[#8A8A88] pb-5 leading-relaxed">
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
      </div>

      {/* ═══ 7. CTA FINAL ═══ */}
      <div className="relative px-6 pb-28">
        <motion.div
          className="max-w-xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-2xl sm:text-[2rem] font-bold text-[#191919] mb-4">
            Prêt à centraliser ton business ?
          </h3>
          <p className="text-[14px] text-[#8A8A88] mb-8">
            Commence gratuitement. Passe Pro quand tu es prêt.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <motion.a
              href="/login"
              className="inline-flex items-center gap-2 bg-[#7C3AED] text-white text-[14px] font-semibold px-8 py-3.5 rounded-lg hover:bg-[#6D28D9] transition-colors cursor-pointer shadow-sm"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Commencer gratuitement
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </motion.a>
            <motion.a
              href="#pricing"
              className="inline-flex items-center text-[14px] font-medium text-[#5A5A58] hover:text-[#7C3AED] transition-colors cursor-pointer px-4 py-3.5"
              whileHover={{ scale: 1.02 }}
            >
              Voir les plans
            </motion.a>
          </div>
          <p className="text-[11px] text-[#C0C0BE] mt-6">
            Sans carte bancaire · Sans engagement · Données hébergées en Europe
          </p>
        </motion.div>
      </div>
    </section>
  );
}
