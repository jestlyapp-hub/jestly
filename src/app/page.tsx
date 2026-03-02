"use client";

import { useState, useEffect } from "react";

/* ═══════════════════════════════════════════════════
   ICONS SVG
   ═══════════════════════════════════════════════════ */

function IconGlobe() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function IconLayout() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18" />
      <path d="M9 21V9" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconFileText() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function IconBarChart() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 20V10" />
      <path d="M12 20V4" />
      <path d="M6 20v-6" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IconArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconPlus({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════ */

const features = [
  {
    icon: <IconGlobe />,
    title: "Site web no-code",
    desc: "Votre vitrine en ligne en 5 minutes. Portfolio, services, formations.",
  },
  {
    icon: <IconLayout />,
    title: "Gestion des commandes",
    desc: "Kanban, statuts, brief client. Chaque commande est un projet.",
  },
  {
    icon: <IconUsers />,
    title: "Base clients",
    desc: "CRM automatique. Chaque vente enrichit votre base.",
  },
  {
    icon: <IconFileText />,
    title: "Facturation",
    desc: "Factures PDF auto. Numerotation, TVA, tout est gere.",
  },
  {
    icon: <IconBarChart />,
    title: "Dashboard",
    desc: "Revenus, conversions, panier moyen. Votre cockpit business.",
  },
  {
    icon: <IconCalendar />,
    title: "Agenda",
    desc: "Deadlines, rappels, sync Google Calendar.",
  },
];

const tools = ["Notion", "Trello", "Stripe", "Google Sheets", "WordPress", "Canva", "Gmail"];

const steps = [
  { num: "01", title: "Inscrivez-vous", desc: "Gratuit, 30 secondes, sans CB." },
  { num: "02", title: "Creez votre site", desc: "Ajoutez vos services, fixez vos tarifs." },
  { num: "03", title: "Recevez et gerez", desc: "Commandes, clients, factures. Tout est automatique." },
];

const faqData = [
  {
    q: "C'est quoi Jestly exactement ?",
    a: "Jestly est une plateforme tout-en-un pour freelances creatifs. Elle regroupe votre site web, la gestion de commandes, le CRM, la facturation, les paiements et l'agenda dans un seul outil simple et intuitif.",
  },
  {
    q: "Est-ce que c'est vraiment gratuit ?",
    a: "Oui. Le plan Free vous permet de gerer jusqu'a 10 commandes par mois, avec un site web inclus et un CRM basique. Aucune carte bancaire requise pour commencer.",
  },
  {
    q: "Je peux vendre des formations ?",
    a: "Absolument. Jestly vous permet de vendre des services, des prestations ponctuelles, des abonnements et des produits numeriques comme des formations ou des templates.",
  },
  {
    q: "Comment fonctionne le sous-domaine ?",
    a: "A la creation de votre compte, vous choisissez votre identifiant unique. Votre site sera accessible a l'adresse votrenom.jestly.fr. Vous pourrez aussi connecter votre propre domaine avec le plan Pro.",
  },
  {
    q: "Puis-je connecter mon Stripe existant ?",
    a: "Oui, vous connectez votre propre compte Stripe en quelques clics. Tous les paiements arrivent directement sur votre compte, Jestly ne prend aucune commission sur vos ventes.",
  },
];

const freePlan = ["10 commandes/mois", "Site web inclus", "CRM", "Dashboard"];
const proPlan = ["Commandes illimitees", "Factures auto", "Toutes les integrations", "Support prioritaire"];

/* ═══════════════════════════════════════════════════
   COMPOSANTS FLOTTANTS HERO
   ═══════════════════════════════════════════════════ */

function FloatingDashboard() {
  return (
    <div className="float-element animate-float-1 top-[8%] right-[4%] w-52 p-4 hidden lg:block">
      <div className="text-[10px] font-semibold text-[#999] uppercase tracking-wider mb-2">Revenus</div>
      <div className="text-xl font-bold text-[#1A1A1A]">2 480 &euro;</div>
      <div className="mt-2 h-1.5 bg-[#F0F0F0] rounded-full overflow-hidden">
        <div className="h-full w-[72%] bg-[#FF6B35] rounded-full" />
      </div>
      <div className="text-[10px] text-emerald-500 mt-1.5 font-medium">+12% ce mois</div>
    </div>
  );
}

function FloatingOrder() {
  return (
    <div className="float-element animate-float-2 bottom-[18%] left-[3%] w-48 p-4 hidden lg:block">
      <div className="text-[10px] font-semibold text-[#999] uppercase tracking-wider mb-2">Commande</div>
      <div className="text-sm font-semibold text-[#1A1A1A] mb-1">Logo redesign</div>
      <div className="flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B35]" />
        <span className="text-[11px] text-[#888]">En cours &middot; Marie D.</span>
      </div>
    </div>
  );
}

function FloatingCalendar() {
  return (
    <div className="float-element animate-float-3 top-[45%] right-[2%] w-40 p-4 hidden lg:block">
      <div className="text-[10px] font-semibold text-[#999] uppercase tracking-wider mb-2">Agenda</div>
      <div className="text-sm font-semibold text-[#1A1A1A]">15 Mars</div>
      <div className="flex items-center gap-1.5 mt-1">
        <div className="w-1.5 h-1.5 rounded-full bg-[#E8453C]" />
        <span className="text-[11px] text-[#888]">Livraison deadline</span>
      </div>
    </div>
  );
}

function FloatingInvoice() {
  return (
    <div className="float-element animate-float-4 top-[12%] left-[3%] w-44 p-4 hidden lg:block">
      <div className="text-[10px] font-semibold text-[#999] uppercase tracking-wider mb-2">Facture</div>
      <div className="text-lg font-bold text-[#1A1A1A]">850 &euro;</div>
      <div className="flex items-center gap-1.5 mt-1">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        <span className="text-[11px] text-emerald-500 font-medium">Payee</span>
      </div>
    </div>
  );
}

/* Fleches courbes SVG decoratives */
function CurvedArrows() {
  return (
    <div className="absolute inset-0 pointer-events-none hidden lg:block">
      {/* Fleche de la facture (haut-gauche) vers le centre */}
      <svg className="absolute top-[18%] left-[14%] w-32 h-24" viewBox="0 0 140 100" fill="none">
        <path d="M10 15 Q60 5 110 55" stroke="#FF6B35" strokeWidth="1.2" strokeDasharray="5 4" opacity="0.25" strokeLinecap="round" />
        <path d="M105 48 L113 58 L101 56" stroke="#FF6B35" strokeWidth="1.2" opacity="0.25" fill="none" strokeLinecap="round" />
      </svg>
      {/* Fleche du dashboard (haut-droit) vers le centre */}
      <svg className="absolute top-[16%] right-[16%] w-28 h-24" viewBox="0 0 120 100" fill="none">
        <path d="M100 10 Q60 15 30 60" stroke="#FF6B35" strokeWidth="1.2" strokeDasharray="5 4" opacity="0.25" strokeLinecap="round" />
        <path d="M35 53 L27 63 L38 62" stroke="#FF6B35" strokeWidth="1.2" opacity="0.25" fill="none" strokeLinecap="round" />
      </svg>
      {/* Fleche de la commande (bas-gauche) vers le centre */}
      <svg className="absolute bottom-[22%] left-[16%] w-28 h-20" viewBox="0 0 120 80" fill="none">
        <path d="M15 65 Q50 40 95 30" stroke="#FF6B35" strokeWidth="1.2" strokeDasharray="5 4" opacity="0.25" strokeLinecap="round" />
        <path d="M89 25 L99 28 L91 36" stroke="#FF6B35" strokeWidth="1.2" opacity="0.25" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   PAGE PRINCIPALE
   ═══════════════════════════════════════════════════ */

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  /* Observation au scroll pour les animations fade-in */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll(".animate-on-scroll");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1A1A1A] overflow-x-hidden">

      {/* ──────────────── NAVBAR ──────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#F0F0F0]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#" className="text-[22px] font-extrabold tracking-tight" style={{ fontFamily: "var(--font-sans)" }}>
            Jestly
          </a>

          <div className="hidden md:flex items-center gap-8">
            <a href="#fonctionnalites" className="text-sm text-[#666] hover:text-[#1A1A1A] transition-colors">Fonctionnalites</a>
            <a href="#tarifs" className="text-sm text-[#666] hover:text-[#1A1A1A] transition-colors">Tarifs</a>
            <a href="#faq" className="text-sm text-[#666] hover:text-[#1A1A1A] transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-3">
            <a href="#" className="hidden sm:inline text-sm text-[#666] hover:text-[#1A1A1A] transition-colors font-medium">Se connecter</a>
            <a href="#" className="btn-primary !py-2.5 !px-5 !text-[13px]">Commencer gratuitement</a>
          </div>
        </div>
      </nav>

      {/* ──────────────── HERO ──────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20">
        {/* Elements flottants */}
        <FloatingDashboard />
        <FloatingInvoice />
        <FloatingCalendar />
        <FloatingOrder />
        <CurvedArrows />

        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <h1
            className="text-[clamp(2.8rem,7vw,5.2rem)] font-extrabold leading-[1.08] tracking-tight mb-6"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Gerez votre freelance<br />
            comme un{" "}
            <span className="accent-word text-[1.15em]">pro.</span>
          </h1>

          <p className="text-base sm:text-lg text-[#666] max-w-lg mx-auto mb-10 leading-relaxed">
            De la commande a la facturation. Tout votre business freelance dans une seule plateforme simple et intuitive.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-5">
            <a href="#" className="btn-primary">
              Commencer gratuitement <IconArrowRight />
            </a>
            <a href="#" className="btn-outline">
              Voir la demo
            </a>
          </div>

          <p className="text-[13px] text-[#AAAAAA]">
            Gratuit &middot; Sans carte bancaire &middot; Pret en 3 minutes
          </p>
        </div>
      </section>

      {/* ──────────────── SOCIAL PROOF / LOGOS ──────────────── */}
      <section className="py-16 bg-[#F0F0F0]">
        <p className="text-center text-sm text-[#999] mb-8 font-medium">Remplace vos outils du quotidien</p>

        <div className="overflow-hidden">
          <div className="scrolling-logos flex items-center gap-16 whitespace-nowrap w-max">
            {[...tools, ...tools].map((tool, i) => (
              <span key={i} className="text-lg font-semibold text-[#1A1A1A] opacity-[0.18] select-none">
                {tool}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────── FONCTIONNALITES ──────────────── */}
      <section id="fonctionnalites" className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-3xl sm:text-[2.6rem] font-extrabold leading-tight mb-4 animate-on-scroll"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Tout ce qu&apos;il vous faut.
            </h2>
            <p className="text-[#666] text-base animate-on-scroll stagger-1">
              Une seule plateforme, zero prise de tete.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div key={f.title} className={`feature-card animate-on-scroll stagger-${i + 1}`}>
                <div className="mb-4">{f.icon}</div>
                <h3 className="text-base font-bold mb-2" style={{ fontFamily: "var(--font-sans)" }}>
                  {f.title}
                </h3>
                <p className="text-sm text-[#666] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────── COMMENT CA MARCHE ──────────────── */}
      <section className="py-28 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2
            className="text-3xl sm:text-[2.6rem] font-extrabold text-center leading-tight mb-16 animate-on-scroll"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Lancez-vous en 3 etapes.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6 relative">
            {/* Ligne de connexion horizontale (desktop) */}
            <div className="hidden md:block absolute top-8 left-[18%] right-[18%] h-px bg-[#E8E8E8]" />

            {steps.map((step, i) => (
              <div key={step.num} className={`text-center relative animate-on-scroll stagger-${i + 1}`}>
                <div className="relative inline-block mb-5">
                  <span
                    className="text-5xl font-extrabold text-[#FF6B35] opacity-20"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    {step.num}
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ fontFamily: "var(--font-sans)" }}>
                  {step.title}
                </h3>
                <p className="text-sm text-[#666]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────── PRICING ──────────────── */}
      <section id="tarifs" className="py-28 px-6">
        <div className="max-w-2xl mx-auto">
          <h2
            className="text-3xl sm:text-[2.6rem] font-extrabold text-center leading-tight mb-4 animate-on-scroll"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Un prix simple.
          </h2>
          <p className="text-center text-[#666] mb-14 animate-on-scroll stagger-1">
            Pas de frais caches. Evoluez quand vous voulez.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Free */}
            <div className="pricing-card animate-on-scroll stagger-1">
              <h3 className="text-lg font-bold mb-1" style={{ fontFamily: "var(--font-sans)" }}>Gratuit</h3>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-extrabold" style={{ fontFamily: "var(--font-sans)" }}>0&euro;</span>
                <span className="text-[#999] text-sm">/mois</span>
              </div>
              <ul className="flex flex-col gap-3.5 mb-8">
                {freePlan.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-[#666]">
                    <IconCheck /> {f}
                  </li>
                ))}
              </ul>
              <a href="#" className="btn-outline block text-center w-full justify-center">Commencer</a>
            </div>

            {/* Pro */}
            <div className="pricing-card-pro animate-on-scroll stagger-2">
              <div className="absolute -top-3 right-6">
                <span className="text-[11px] font-bold uppercase tracking-wider bg-[#FF6B35] text-white px-4 py-1.5 rounded-full">
                  Populaire
                </span>
              </div>
              <h3 className="text-lg font-bold mb-1" style={{ fontFamily: "var(--font-sans)" }}>Pro</h3>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-extrabold" style={{ fontFamily: "var(--font-sans)" }}>7&euro;</span>
                <span className="text-[#999] text-sm">/mois</span>
              </div>
              <ul className="flex flex-col gap-3.5 mb-8">
                {proPlan.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-[#666]">
                    <IconCheck /> {f}
                  </li>
                ))}
              </ul>
              <a href="#" className="btn-primary block text-center w-full justify-center">Passer Pro</a>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── FAQ ──────────────── */}
      <section id="faq" className="py-28 px-6 bg-white">
        <div className="max-w-2xl mx-auto">
          <h2
            className="text-3xl sm:text-[2.6rem] font-extrabold text-center leading-tight mb-14 animate-on-scroll"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Questions frequentes
          </h2>

          <div className="flex flex-col">
            {faqData.map((item, i) => (
              <div key={i} className={`faq-item animate-on-scroll stagger-${i + 1}`}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between py-5 text-left cursor-pointer"
                >
                  <span className="text-[15px] font-semibold pr-4">{item.q}</span>
                  <IconPlus className={`faq-icon flex-shrink-0 ${openFaq === i ? "open" : ""}`} />
                </button>
                <div className={`faq-answer ${openFaq === i ? "open" : ""}`}>
                  <p className="text-sm text-[#666] pb-5 leading-relaxed">{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────── CTA FINAL ──────────────── */}
      <section className="py-28 px-6" style={{ background: "linear-gradient(180deg, #FAFAFA 0%, #FFF5EE 100%)" }}>
        <div className="text-center max-w-2xl mx-auto">
          <h2
            className="text-3xl sm:text-[2.6rem] font-extrabold leading-tight mb-8 animate-on-scroll"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Pret a simplifier votre{" "}
            <span className="accent-word text-[1.1em]">freelance</span> ?
          </h2>
          <div className="animate-on-scroll stagger-1">
            <a href="#" className="btn-primary !py-4 !px-10 !text-base">
              Commencer gratuitement <IconArrowRight />
            </a>
          </div>
        </div>
      </section>

      {/* ──────────────── FOOTER ──────────────── */}
      <footer className="bg-[#1A1A1A] text-white py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
            <div>
              <span className="text-xl font-extrabold tracking-tight block mb-2" style={{ fontFamily: "var(--font-sans)" }}>
                Jestly
              </span>
              <p className="text-sm text-[#888]">Le cockpit du freelance moderne.</p>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#666] mb-4">Produit</h4>
              <ul className="flex flex-col gap-2.5">
                <li><a href="#fonctionnalites" className="text-sm text-[#999] hover:text-white transition-colors">Fonctionnalites</a></li>
                <li><a href="#tarifs" className="text-sm text-[#999] hover:text-white transition-colors">Tarifs</a></li>
                <li><a href="#faq" className="text-sm text-[#999] hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#666] mb-4">Legal</h4>
              <ul className="flex flex-col gap-2.5">
                <li><a href="#" className="text-sm text-[#999] hover:text-white transition-colors">CGU</a></li>
                <li><a href="#" className="text-sm text-[#999] hover:text-white transition-colors">Confidentialite</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#666] mb-4">Contact</h4>
              <a href="mailto:contact@jestly.fr" className="text-sm text-[#999] hover:text-white transition-colors">
                contact@jestly.fr
              </a>
            </div>
          </div>

          <div className="border-t border-[#333] pt-8">
            <p className="text-xs text-[#555] text-center">&copy; 2025 Jestly. Tous droits reserves.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
