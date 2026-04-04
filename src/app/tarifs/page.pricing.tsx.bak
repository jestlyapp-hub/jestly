"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { isBetaOpenAccess } from "@/lib/beta";
import BetaPricingLock from "@/components/ui/BetaPricingLock";

/* ═══════════════════════════════════════════════════════════
   JESTLY — PAGE TARIFS
   Page dédiée, même DA que la landing.
   ═══════════════════════════════════════════════════════════ */

const ease = [0.22, 1, 0.36, 1] as const;

/* ── Plans ── */

interface Plan {
  id: string;
  name: string;
  tagline: string;
  badge?: string;
  monthlyPrice: number;
  yearlyPrice: number;
  cta: string;
  highlighted: boolean;
  features: string[];
}

const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "Découvrir et démarrer",
    monthlyPrice: 0,
    yearlyPrice: 0,
    cta: "Commencer gratuitement",
    highlighted: false,
    features: [
      "1 site vitrine",
      "15 commandes / mois",
      "3 projets actifs",
      "CRM basique",
      "Calendrier & tâches",
      "Analytics essentiels",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Le plan des freelances actifs",
    badge: "Le plus choisi",
    monthlyPrice: 4.99,
    yearlyPrice: 3.99,
    cta: "Passer Pro",
    highlighted: true,
    features: [
      "3 sites vitrines",
      "50 commandes / mois",
      "Projets illimités",
      "CRM complet + exports",
      "Devis & factures automatiques",
      "Calendrier avancé",
      "Analytics complets",
      "Application mobile ::soon",
      "Support prioritaire",
    ],
  },
  {
    id: "business",
    name: "Business",
    tagline: "Scaler sans limites",
    monthlyPrice: 14.99,
    yearlyPrice: 11.99,
    cta: "Choisir Business",
    highlighted: false,
    features: [
      "Sites illimités",
      "Commandes illimitées",
      "Projets illimités",
      "Domaine personnalisé",
      "White-label complet",
      "Analytics avancés + exports",
      "Automatisations ::soon",
      "Application mobile ::soon",
      "Support prioritaire dédié",
      "Accès aux fonctionnalités bêta",
    ],
  },
];

/* ── Comparaison ── */

type CellValue = boolean | string;

const COMPARISON: { category: string; rows: { label: string; starter: CellValue; pro: CellValue; business: CellValue }[] }[] = [
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
      { label: "Paiement Stripe ::soon", starter: true, pro: true, business: true },
      { label: "Exports comptables", starter: false, pro: true, business: true },
    ],
  },
  {
    category: "Production & organisation",
    rows: [
      { label: "Tâches & sous-tâches", starter: true, pro: true, business: true },
      { label: "Calendrier", starter: "Basique", pro: "Avancé", business: "Avancé" },
      { label: "Briefing client", starter: false, pro: true, business: true },
      { label: "Automatisations ::soon", starter: false, pro: false, business: true },
    ],
  },
  {
    category: "Site & portfolio",
    rows: [
      { label: "Pages personnalisables", starter: "3", pro: "10", business: "Illimité" },
      { label: "Portfolio projets", starter: true, pro: true, business: true },
      { label: "SEO intégré", starter: "Basique", pro: "Complet", business: "Complet" },
      { label: "White-label", starter: false, pro: true, business: true },
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
  { q: "Puis-je commencer gratuitement ?", a: "Oui. Le plan Starter est 100 % gratuit, sans carte bancaire. Utilisez-le aussi longtemps que vous voulez pour découvrir Jestly." },
  { q: "Puis-je changer d'abonnement à tout moment ?", a: "Absolument. Upgrade ou downgrade en un clic. Le changement est immédiat et vos données sont conservées intégralement." },
  { q: "Est-ce que je garde mes données si je downgrade ?", a: "Oui, rien n'est supprimé. Si vous dépassez les limites du plan inférieur, vous ne pourrez plus créer de nouveaux éléments, mais tout reste accessible." },
  { q: "Y a-t-il un engagement ?", a: "Aucun engagement. Résiliez à tout moment. L'accès continue jusqu'à la fin de la période payée." },
  { q: "Jestly remplace vraiment plusieurs outils ?", a: "Oui. Commandes, CRM, facturation, calendrier, tâches, site web, analytics — tout est centralisé. Plus besoin de jongler entre Notion, Trello, Google Agenda et vos tableurs." },
  { q: "C'est adapté à un freelance solo ?", a: "C'est exactement pour ça que Jestly existe. Pensé pour les freelances créatifs qui veulent se professionnaliser sans se noyer dans des outils complexes." },
  { q: "Puis-je utiliser mon propre domaine ?", a: "Avec le plan Business, vous pouvez connecter votre propre nom de domaine. Sur les autres plans, votre site est accessible via un sous-domaine Jestly." },
  { q: "Y aura-t-il de nouvelles fonctionnalités ?", a: "Oui, Jestly évolue en continu. Toutes les nouvelles fonctionnalités sont incluses dans votre plan. Les utilisateurs Business accèdent aux bêtas en avant-première." },
];

/* ── Value props ── */

const VALUE_PROPS = [
  { title: "Moins de temps perdu", desc: "Plus besoin de chercher entre 5 outils. Tout est centralisé, structuré, accessible.", icon: "M12 2a10 10 0 100 20 10 10 0 000-20zM12 6v6l4 2" },
  { title: "Une image plus pro", desc: "Site vitrine, devis et factures à votre image. Vos clients voient un professionnel organisé.", icon: "M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01z" },
  { title: "Un business plus clair", desc: "Commandes, deadlines, revenus — tout en temps réel. Décidez vite, décidez bien.", icon: "M3 3v18h18M7 16l4-8 4 4 5-9" },
  { title: "Un seul abonnement", desc: "Jestly remplace Notion, Trello, Google Agenda, vos tableurs et vos outils dispersés.", icon: "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16zM3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" },
];

/* ═══════════════════════════════════════════════════════════
   ICÔNES
   ═══════════════════════════════════════════════════════════ */

function Check({ className = "" }: { className?: string }) {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12" /></svg>;
}

function XMark() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#D4D4D4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
}

function CellDisplay({ value }: { value: CellValue }) {
  if (value === true) return <Check className="text-[#7C5CFF] mx-auto" />;
  if (value === false) return <span className="flex justify-center"><XMark /></span>;
  return <span className="text-[13px] text-[#5A5A58] font-medium">{value}</span>;
}

function Chevron({ open }: { open: boolean }) {
  return (
    <motion.svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#B0B0AE] flex-shrink-0" animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }}>
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </motion.svg>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════ */

export default function TarifsPage() {
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const beta = isBetaOpenAccess();

  return (
    <div className="relative min-h-screen overflow-hidden">

      {/* ── Fond identique à la landing ── */}
      <div className="fixed inset-0 -z-20 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #F8F8FC 0%, #F4F3FA 100%)" }} />
        <div className="absolute top-[-10%] right-[5%] w-[900px] h-[900px] rounded-full" style={{ background: "radial-gradient(450px circle, rgba(124,92,255,0.06), transparent 70%)" }} />
        <div className="absolute bottom-[-5%] left-[0%] w-[800px] h-[800px] rounded-full" style={{ background: "radial-gradient(400px circle, rgba(140,110,255,0.05), transparent 70%)" }} />
      </div>

      <main>

        {/* ═══ 1. HERO TARIFS ═══ */}
        <section className="pt-32 sm:pt-40 pb-10 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] px-4 py-1.5 rounded-full mb-6"
              style={{ color: "#7C5CFF", background: "rgba(124,92,255,0.08)" }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#7C5CFF]" />
              Abonnements
            </motion.div>

            <motion.h1
              className="text-[28px] sm:text-[40px] md:text-[48px] font-extrabold leading-[1.08] tracking-[-0.03em] text-[#111118] mb-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease, delay: 0.05 }}
            >
              Un seul outil pour piloter<br className="hidden sm:block" />
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #7C5CFF 0%, #A78BFA 100%)" }}>
                tout ton business.
              </span>
            </motion.h1>

            <motion.p
              className="text-[15px] sm:text-[17px] leading-relaxed max-w-[480px] mx-auto mb-4"
              style={{ color: "#6B6F80" }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease, delay: 0.1 }}
            >
              Clients, commandes, factures, tâches, site web et analytics. Fini les 6 apps.
            </motion.p>

            <motion.p
              className="text-[12px] mb-10"
              style={{ color: "#A8A8B0" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              {beta ? "Bêta ouverte — Tout est inclus gratuitement" : "Gratuit · Sans carte bancaire · Sans engagement"}
            </motion.p>

            {/* Toggle — masqué en mode bêta */}
            {!beta && (
              <motion.div
                className="inline-flex items-center bg-white rounded-full p-1 border border-[#EEEDF2] shadow-sm"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease, delay: 0.2 }}
              >
                <button
                  onClick={() => setAnnual(false)}
                  className={`px-5 py-2 text-[13px] font-semibold rounded-full transition-all duration-200 cursor-pointer ${
                    !annual ? "bg-[#111118] text-white shadow-sm" : "text-[#8A8A88] hover:text-[#5A5A58]"
                  }`}
                >
                  Mensuel
                </button>
                <button
                  onClick={() => setAnnual(true)}
                  className={`px-5 py-2 text-[13px] font-semibold rounded-full transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                    annual ? "bg-[#111118] text-white shadow-sm" : "text-[#8A8A88] hover:text-[#5A5A58]"
                  }`}
                >
                  Annuel
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    annual ? "bg-white/15 text-white/90" : "bg-emerald-50 text-emerald-600"
                  }`}>
                    -20 %
                  </span>
                </button>
              </motion.div>
            )}
          </div>
        </section>

        {/* ═══ 2. CARTES PRICING ═══ */}
        <section className="px-6 pt-14 pb-20">
          {beta ? (
            <div className="max-w-[1060px] mx-auto">
              <BetaPricingLock
                title="Abonnements disponibles prochainement"
                subtitle="Pendant la bêta, toutes les fonctionnalités sont incluses gratuitement. Inscrivez-vous pour en profiter."
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
                  {PLANS.map((plan) => (
                    <div key={plan.id} className="bg-white rounded-2xl border border-[#EEEDF2] p-7">
                      <h3 className="text-[15px] font-bold text-[#111118] mb-0.5">{plan.name}</h3>
                      <p className="text-[12px] text-[#8A8A88] mb-6">{plan.tagline}</p>
                      <div className="text-[42px] font-extrabold text-[#111118] mb-6">••••</div>
                      <div className="h-12 bg-[#F7F7F5] rounded-xl mb-5" />
                      <div className="border-t border-[#F0F0EE] pt-5 space-y-2.5">
                        {plan.features.map((_, j) => (
                          <div key={j} className="h-3 bg-[#F7F7F5] rounded" style={{ width: `${55 + (j * 11) % 35}%` }} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </BetaPricingLock>
            </div>
          ) : (
          <div className="max-w-[1060px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
            {PLANS.map((plan, i) => {
              const price = annual ? plan.yearlyPrice : plan.monthlyPrice;
              const hl = plan.highlighted;

              return (
                <motion.div
                  key={plan.id}
                  className={`relative rounded-2xl flex flex-col ${
                    hl
                      ? "bg-white border-2 border-[#7C5CFF]/50 shadow-xl shadow-[#7C5CFF]/[0.06] md:-mt-3 md:mb-[-12px]"
                      : "bg-white border border-[#EEEDF2] hover:shadow-lg hover:border-[#E0DFE6] transition-all duration-300"
                  }`}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease, delay: 0.2 + i * 0.08 }}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                      <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-white px-4 py-1.5 rounded-full whitespace-nowrap shadow-md" style={{ background: "linear-gradient(135deg, #7C5CFF 0%, #A78BFA 100%)" }}>
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <div className="p-7 pb-5">
                    <h3 className={`text-[15px] font-bold mb-0.5 ${hl ? "text-[#7C5CFF]" : "text-[#111118]"}`}>{plan.name}</h3>
                    <p className="text-[12px] text-[#8A8A88] mb-6">{plan.tagline}</p>

                    <div className="flex items-baseline gap-1.5 mb-1">
                      <span className="text-[42px] font-extrabold leading-none tracking-tight text-[#111118]">
                        {price === 0 ? "0" : price.toFixed(2).replace(".", ",")}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-[18px] font-bold text-[#111118]">€</span>
                        <span className="text-[11px] text-[#8A8A88] -mt-0.5">/mois</span>
                      </div>
                    </div>

                    {annual && price > 0 ? (
                      <p className="text-[11px] text-emerald-600 font-semibold mb-6">
                        {(price * 12).toFixed(2).replace(".", ",")} € facturé par an
                      </p>
                    ) : (
                      <p className="text-[11px] text-[#C4C4C2] mb-6">{price === 0 ? "Gratuit pour toujours" : "Facturé mensuellement"}</p>
                    )}

                    <motion.a
                      href="/login"
                      className={`block text-center w-full py-3 rounded-xl text-[13px] font-semibold transition-all duration-200 cursor-pointer ${
                        beta
                          ? "bg-[#EEF2FF] text-[#7C5CFF] border border-[#DDD6FE]"
                          : hl
                            ? "text-white shadow-md" : "bg-[#111118] text-white hover:bg-[#2A2A30]"
                      }`}
                      style={!beta && hl ? { background: "linear-gradient(135deg, #7C5CFF 0%, #9B7EFF 100%)" } : undefined}
                      whileHover={{ scale: 1.015 }}
                      whileTap={{ scale: 0.985 }}
                    >
                      {beta ? (plan.monthlyPrice === 0 ? "Commencer gratuitement" : "Inclus pendant la bêta") : plan.cta}
                    </motion.a>
                  </div>

                  <div className="border-t border-[#F0F0EE] px-7 py-5 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#B0B0AE] mb-3">Inclus</p>
                    <ul className="flex flex-col gap-2.5">
                      {plan.features.map((f) => {
                        const isSoon = f.includes("::soon");
                        const label = f.replace(" ::soon", "");
                        return (
                          <li key={f} className="flex items-start gap-2.5 text-[13px] text-[#5A5A58] leading-snug">
                            <Check className={`flex-shrink-0 mt-[2px] ${hl ? "text-[#7C5CFF]" : "text-[#D0D0CE]"}`} />
                            <span className="flex items-center gap-1.5">
                              {label}
                              {isSoon && (
                                <span className="text-[9px] font-bold uppercase tracking-wide text-[#7C5CFF] bg-[#7C5CFF]/[0.08] px-1.5 py-0.5 rounded-full leading-none">
                                  Soon
                                </span>
                              )}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </motion.div>
              );
            })}
          </div>
          )}
        </section>

        {/* ═══ 3. RÉASSURANCE ═══ */}
        <section className="px-6 pb-24">
          <motion.div
            className="max-w-2xl mx-auto flex flex-wrap justify-center gap-2.5"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {["Sans engagement", "Sans carte bancaire", "Prêt en 3 minutes", "Remplace 5+ outils", "Upgrade à tout moment", "Hébergé en Europe"].map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#6B6F80] bg-white border border-[#EEEDF2] rounded-full px-4 py-2">
                <Check className="text-[#7C5CFF] w-3 h-3" />
                {t}
              </span>
            ))}
          </motion.div>
        </section>

        {/* ═══ 4. TABLEAU COMPARATIF ═══ */}
        {beta ? (
          <section className="px-6 pb-28">
            <div className="max-w-4xl mx-auto">
              <BetaPricingLock title="Comparatif disponible prochainement" subtitle="Les détails de chaque plan seront visibles lors du lancement des abonnements.">
                <div className="bg-white rounded-2xl border border-[#EEEDF2] overflow-hidden shadow-sm">
                  <div className="grid grid-cols-4 border-b border-[#EEEDF2] bg-[#FAFAFE]">
                    <div className="px-5 py-4" />
                    <div className="px-3 py-4 text-center"><span className="text-[11px] font-bold text-[#B0B0AE] uppercase tracking-[0.08em]">Starter</span></div>
                    <div className="px-3 py-4 text-center"><span className="text-[11px] font-bold text-[#7C5CFF] uppercase tracking-[0.08em]">Pro</span></div>
                    <div className="px-3 py-4 text-center"><span className="text-[11px] font-bold text-[#B0B0AE] uppercase tracking-[0.08em]">Business</span></div>
                  </div>
                  {COMPARISON.slice(0, 2).map((cat, ci) => (
                    <div key={ci}>
                      <div className="px-5 py-3 bg-[#FAFAFE] border-b border-[#F0F0EE]">
                        <span className="text-[10px] font-bold text-[#8A8A88] uppercase tracking-[0.1em]">{cat.category}</span>
                      </div>
                      {cat.rows.map((row, ri) => (
                        <div key={ri} className="grid grid-cols-4 border-b border-[#F5F5F3]">
                          <div className="px-5 py-3.5 text-[13px] text-[#5A5A58]">{row.label.replace(" ::soon", "")}</div>
                          <div className="px-3 py-3.5 text-center text-[13px] text-[#C0C0BE]">—</div>
                          <div className="px-3 py-3.5 text-center text-[13px] text-[#C0C0BE]">—</div>
                          <div className="px-3 py-3.5 text-center text-[13px] text-[#C0C0BE]">—</div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </BetaPricingLock>
            </div>
          </section>
        ) : (
          <section className="px-6 pb-28">
            <div className="max-w-4xl mx-auto">
              <motion.div
                className="text-center mb-14"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease }}
              >
                <h2 className="text-[24px] sm:text-[32px] font-bold text-[#111118] tracking-tight mb-3">
                  Comparer en détail
                </h2>
                <p className="text-[15px]" style={{ color: "#6B7280" }}>
                  Tout ce qui est inclus, plan par plan.
                </p>
              </motion.div>

              <motion.div
                className="bg-white rounded-2xl border border-[#EEEDF2] overflow-hidden shadow-sm"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease, delay: 0.05 }}
              >
                <div className="grid grid-cols-4 border-b border-[#EEEDF2] bg-[#FAFAFE]">
                  <div className="px-5 py-4" />
                  <div className="px-3 py-4 text-center"><span className="text-[11px] font-bold text-[#B0B0AE] uppercase tracking-[0.08em]">Starter</span></div>
                  <div className="px-3 py-4 text-center">
                    <div className="inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#7C5CFF]" />
                      <span className="text-[11px] font-bold text-[#7C5CFF] uppercase tracking-[0.08em]">Pro</span>
                    </div>
                  </div>
                  <div className="px-3 py-4 text-center"><span className="text-[11px] font-bold text-[#B0B0AE] uppercase tracking-[0.08em]">Business</span></div>
                </div>
                {COMPARISON.map((cat, ci) => (
                  <div key={ci}>
                    <div className="px-5 py-3 bg-[#FAFAFE] border-b border-[#F0F0EE]">
                      <span className="text-[10px] font-bold text-[#8A8A88] uppercase tracking-[0.1em]">{cat.category}</span>
                    </div>
                    {cat.rows.map((row, ri) => {
                      const rowSoon = row.label.includes("::soon");
                      const rowLabel = row.label.replace(" ::soon", "");
                      return (
                        <div key={ri} className="grid grid-cols-4 border-b border-[#F5F5F3] last:border-b-0 hover:bg-[#FCFCFB] transition-colors">
                          <div className="px-5 py-3.5 text-[13px] text-[#5A5A58] flex items-center gap-1.5">
                            {rowLabel}
                            {rowSoon && (
                              <span className="text-[9px] font-bold uppercase tracking-wide text-[#7C5CFF] bg-[#7C5CFF]/[0.08] px-1.5 py-0.5 rounded-full leading-none">Soon</span>
                            )}
                          </div>
                          <div className="px-3 py-3.5 text-center"><CellDisplay value={row.starter} /></div>
                          <div className="px-3 py-3.5 text-center bg-[#7C5CFF]/[0.015]"><CellDisplay value={row.pro} /></div>
                          <div className="px-3 py-3.5 text-center"><CellDisplay value={row.business} /></div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </motion.div>
            </div>
          </section>
        )}

        {/* ═══ 5. POURQUOI ÇA VAUT LE COUP ═══ */}
        <section className="px-6 pb-28">
          <div className="max-w-4xl mx-auto">
            <motion.div
              className="text-center mb-14"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease }}
            >
              <h2 className="text-[24px] sm:text-[32px] font-bold text-[#111118] tracking-tight mb-3">
                Pourquoi ça vaut le coup
              </h2>
              <p className="text-[15px] max-w-md mx-auto" style={{ color: "#6B7280" }}>
                Pas un outil de plus. Celui qui remplace tous les autres.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {VALUE_PROPS.map((vp, i) => (
                <motion.div
                  key={vp.title}
                  className="group bg-white rounded-xl border border-[#EEEDF2] p-6 hover:shadow-lg hover:border-[#E0DFE6] transition-all duration-300"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, ease, delay: i * 0.06 }}
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-4 group-hover:scale-105 transition-transform" style={{ background: "rgba(124,92,255,0.07)" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7C5CFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={vp.icon} /></svg>
                  </div>
                  <h4 className="text-[14px] font-bold text-[#111118] mb-1.5">{vp.title}</h4>
                  <p className="text-[13px] leading-relaxed" style={{ color: "#6B7280" }}>{vp.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ 6. FAQ ═══ */}
        <section className="px-6 pb-28">
          <div className="max-w-2xl mx-auto">
            <motion.h2
              className="text-[24px] sm:text-[32px] font-bold text-center text-[#111118] tracking-tight mb-14"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease }}
            >
              Questions fréquentes
            </motion.h2>

            <div className="bg-white rounded-2xl border border-[#EEEDF2] overflow-hidden">
              {FAQ_DATA.map((item, i) => {
                const isOpen = openFaq === i;
                return (
                  <div key={i} className={i < FAQ_DATA.length - 1 ? "border-b border-[#F0F0EE]" : ""}>
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      className="w-full flex items-center justify-between px-6 py-5 text-left cursor-pointer group"
                    >
                      <span className="text-[14px] font-semibold pr-4 text-[#111118] group-hover:text-[#7C5CFF] transition-colors">
                        {item.q}
                      </span>
                      <Chevron open={isOpen} />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <p className="text-[13px] px-6 pb-5 leading-relaxed" style={{ color: "#6B7280" }}>
                            {item.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══ 7. CTA FINAL ═══ */}
        <section className="px-6 pb-24">
          <motion.div
            className="max-w-xl mx-auto text-center"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease }}
          >
            <h2 className="text-[24px] sm:text-[32px] font-bold text-[#111118] tracking-tight mb-4">
              Prêt à centraliser ton business ?
            </h2>
            <p className="text-[15px] mb-8" style={{ color: "#6B7280" }}>
              {beta ? "Toutes les fonctionnalités sont incluses pendant la bêta." : "Commence gratuitement. Passe Pro quand tu es prêt."}
            </p>
            <motion.a
              href="/login"
              className="inline-flex items-center gap-2 text-white text-[14px] font-semibold px-8 py-3.5 rounded-xl transition-all cursor-pointer shadow-lg"
              style={{ background: "linear-gradient(135deg, #7C5CFF 0%, #9B7EFF 100%)", boxShadow: "0 8px 24px rgba(124,92,255,0.2)" }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Commencer gratuitement
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
            </motion.a>
            <p className="text-[11px] mt-6" style={{ color: "#B0B0B8" }}>
              Sans carte bancaire · Sans engagement · Hébergé en Europe
            </p>
          </motion.div>
        </section>

      </main>
    </div>
  );
}
