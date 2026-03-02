"use client";

import { useState, useEffect } from "react";

/* ═══════════════════════════════════════════
   SVG ICONS
   ═══════════════════════════════════════════ */

function IconGlobe() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#grad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FF6B35" /><stop offset="100%" stopColor="#FF3366" /></linearGradient></defs>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#grad2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <defs><linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FF6B35" /><stop offset="100%" stopColor="#FF3366" /></linearGradient></defs>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconChart() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#grad3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <defs><linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FF6B35" /><stop offset="100%" stopColor="#FF3366" /></linearGradient></defs>
      <path d="M18 20V10" />
      <path d="M12 20V4" />
      <path d="M6 20v-6" />
    </svg>
  );
}

function IconCard() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#grad4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <defs><linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FF6B35" /><stop offset="100%" stopColor="#FF3366" /></linearGradient></defs>
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}

function IconCheckSquare() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#grad5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <defs><linearGradient id="grad5" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FF6B35" /><stop offset="100%" stopColor="#FF3366" /></linearGradient></defs>
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#grad6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <defs><linearGradient id="grad6" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FF6B35" /><stop offset="100%" stopColor="#FF3366" /></linearGradient></defs>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
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

/* ═══════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════ */

const features = [
  {
    icon: <IconGlobe />,
    title: "Site web no-code",
    desc: "Creez votre vitrine en minutes. Portfolio, services, formations. Votre domaine : vous.jestly.fr",
  },
  {
    icon: <IconUsers />,
    title: "Commandes & CRM",
    desc: "Chaque commande alimente votre base clients automatiquement. Kanban, statuts, historique.",
  },
  {
    icon: <IconChart />,
    title: "Dashboard revenus",
    desc: "Visualisez vos revenus, conversions, panier moyen. Pilotez votre business en un coup d'oeil.",
  },
  {
    icon: <IconCard />,
    title: "Paiements Stripe",
    desc: "Encaissez en ligne. One-shot ou abonnement. Facturation automatique.",
  },
  {
    icon: <IconCheckSquare />,
    title: "Gestion de projets",
    desc: "To-do, deadlines, progression. Chaque commande devient un projet structure.",
  },
  {
    icon: <IconCalendar />,
    title: "Agenda integre",
    desc: "Deadlines auto, rappels, sync Google Calendar et Apple Calendar.",
  },
];

const tools = [
  "Stripe",
  "Notion",
  "Trello",
  "Google Sheets",
  "Google Calendar",
  "WordPress",
  "Canva Portfolio",
  "Gmail",
  "Google Drive",
  "WhatsApp",
];

const steps = [
  {
    num: "01",
    title: "Creez votre compte",
    desc: "Inscription gratuite, sans carte bancaire.",
  },
  {
    num: "02",
    title: "Personnalisez votre site",
    desc: "Choisissez vos services, fixez vos prix.",
  },
  {
    num: "03",
    title: "Recevez vos commandes",
    desc: "Vos clients commandent, vous livrez.",
  },
];

const faqItems = [
  {
    q: "C'est quoi Jestly exactement ?",
    a: "Jestly est une plateforme tout-en-un pour freelances creatifs. Elle regroupe votre site web, la gestion de commandes, le CRM, la facturation, les paiements et l'agenda dans un seul outil simple et intuitif.",
  },
  {
    q: "Est-ce que c'est vraiment gratuit ?",
    a: "Oui ! Le plan Free vous permet de gerer jusqu'a 10 commandes par mois, avec un site web inclus et un CRM basique. Aucune carte bancaire requise pour commencer.",
  },
  {
    q: "Je peux vendre des formations ?",
    a: "Absolument. Jestly vous permet de vendre des services, des prestations ponctuelles, des abonnements et des produits numeriques comme des formations ou des templates.",
  },
  {
    q: "Comment fonctionne le sous-domaine ?",
    a: "A la creation de votre compte, vous choisissez votre identifiant. Votre site sera accessible a l'adresse votrenom.jestly.fr. Vous pourrez aussi connecter votre propre domaine avec le plan Pro.",
  },
  {
    q: "Puis-je connecter mon Stripe existant ?",
    a: "Oui, vous connectez votre propre compte Stripe en quelques clics. Tous les paiements arrivent directement sur votre compte, Jestly ne prend aucune commission sur vos ventes.",
  },
];

const freePlanFeatures = [
  "10 commandes/mois",
  "Site web inclus",
  "CRM basique",
  "Dashboard",
  "1 integration",
];

const proPlanFeatures = [
  "Commandes illimitees",
  "CRM avance",
  "Factures auto",
  "Toutes les integrations",
  "Support prioritaire",
];

/* ═══════════════════════════════════════════
   DASHBOARD MOCKUP COMPONENT
   ═══════════════════════════════════════════ */

function DashboardMockup() {
  return (
    <div className="dashboard-mockup w-full max-w-4xl mx-auto">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1a1a1f]">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="bg-[#111113] rounded-md px-16 py-1 text-xs text-[#555]">app.jestly.fr</div>
        </div>
      </div>

      <div className="flex min-h-[340px]">
        {/* Sidebar */}
        <div className="w-48 border-r border-[#1a1a1f] p-4 hidden sm:block">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#FF6B35] to-[#FF3366] flex items-center justify-center text-[10px] font-bold">J</div>
            <span className="text-sm font-semibold text-white" style={{ fontFamily: "var(--font-heading)" }}>Jestly</span>
          </div>
          <nav className="flex flex-col gap-1">
            {["Dashboard", "Commandes", "Clients", "Site web", "Factures", "Agenda"].map((item, i) => (
              <div key={item} className={`px-3 py-2 rounded-lg text-xs ${i === 0 ? "bg-white/5 text-white" : "text-[#666]"}`}>
                {item}
              </div>
            ))}
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 p-4 sm:p-6">
          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Revenus", value: "2 480 \u20ac", change: "+12%" },
              { label: "Commandes", value: "34", change: "+8%" },
              { label: "Clients", value: "21", change: "+3" },
              { label: "Panier moyen", value: "73 \u20ac", change: "+5%" },
            ].map((stat) => (
              <div key={stat.label} className="bg-[#111113] border border-[#1a1a1f] rounded-xl p-3">
                <div className="text-[10px] text-[#666] mb-1">{stat.label}</div>
                <div className="text-sm font-semibold text-white">{stat.value}</div>
                <div className="text-[10px] text-emerald-400 mt-0.5">{stat.change}</div>
              </div>
            ))}
          </div>

          {/* Bottom row: chart + kanban */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Mini chart */}
            <div className="bg-[#111113] border border-[#1a1a1f] rounded-xl p-4">
              <div className="text-[10px] text-[#666] mb-3">Revenus (7j)</div>
              <div className="flex items-end gap-1.5 h-20">
                {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                  <div key={i} className="flex-1 rounded-sm" style={{
                    height: `${h}%`,
                    background: `linear-gradient(to top, #FF6B35, #FF3366)`,
                    opacity: 0.6 + (i * 0.05),
                  }} />
                ))}
              </div>
            </div>

            {/* Mini kanban */}
            <div className="bg-[#111113] border border-[#1a1a1f] rounded-xl p-4">
              <div className="text-[10px] text-[#666] mb-3">Commandes recentes</div>
              <div className="flex flex-col gap-2">
                {[
                  { name: "Logo redesign", status: "En cours", color: "#FF6B35" },
                  { name: "Motion intro YT", status: "A livrer", color: "#FEBC2E" },
                  { name: "Montage podcast", status: "Termine", color: "#28C840" },
                ].map((item) => (
                  <div key={item.name} className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-[#0d0d0f]">
                    <span className="text-[11px] text-[#ccc]">{item.name}</span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: `${item.color}20`, color: item.color }}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════ */

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
    <div className="min-h-screen bg-[#0A0A0B] text-white overflow-x-hidden">
      {/* ─── NAVBAR ─── */}
      <nav className="navbar-glass fixed top-0 left-0 right-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="#" className="text-xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
            Jestly
          </a>
          <div className="hidden md:flex items-center gap-8">
            <a href="#fonctionnalites" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">Fonctionnalites</a>
            <a href="#tarifs" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">Tarifs</a>
            <a href="#faq" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">FAQ</a>
          </div>
          <a href="#" className="btn-primary !py-2.5 !px-5 !text-sm !rounded-lg">
            Commencer gratuitement
          </a>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16">
        <div className="hero-glow animate-glow-pulse" />

        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <h1
            className="text-[clamp(2.5rem,6vw,5rem)] font-bold leading-[1.1] tracking-tight mb-6 animate-on-scroll"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Pilotez votre freelance<br />
            depuis <span className="gradient-text">un seul endroit.</span>
          </h1>

          <p className="text-base sm:text-lg text-[#a1a1aa] max-w-xl mx-auto mb-10 leading-relaxed animate-on-scroll stagger-1">
            Site web, commandes, clients, factures, agenda &mdash; tout centralise dans une plateforme pensee pour les creatifs.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6 animate-on-scroll stagger-2">
            <a href="#" className="btn-primary flex items-center gap-2">
              Demarrer gratuitement <IconArrowRight />
            </a>
            <a href="#" className="btn-ghost">Voir la demo</a>
          </div>

          <p className="text-xs text-[#555] mb-16 animate-on-scroll stagger-3">
            Gratuit jusqu&apos;a 10 commandes/mois &middot; Sans carte bancaire
          </p>

          {/* Dashboard mockup */}
          <div className="animate-on-scroll stagger-4">
            <DashboardMockup />
          </div>
        </div>
      </section>

      {/* ─── TOOLS REPLACEMENT ─── */}
      <section className="py-24 px-6 bg-[#111113]">
        <div className="max-w-4xl mx-auto text-center">
          <h2
            className="text-3xl sm:text-4xl font-bold mb-4 animate-on-scroll"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Arretez de jongler entre 10 outils.
          </h2>
          <p className="text-[#a1a1aa] text-lg mb-14 animate-on-scroll stagger-1">
            Jestly remplace tout ca.
          </p>

          {/* Tools grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-14">
            {tools.map((tool, i) => (
              <div
                key={tool}
                className={`tool-name animate-on-scroll stagger-${i + 1} bg-[#0A0A0B] border border-[#1a1a1f] rounded-xl px-4 py-4 text-sm font-medium`}
              >
                {tool}
              </div>
            ))}
          </div>

          {/* Arrow down */}
          <div className="flex justify-center mb-8 animate-on-scroll">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <polyline points="19 12 12 19 5 12" />
            </svg>
          </div>

          {/* Jestly badge */}
          <div className="inline-flex items-center gap-3 animate-jestly-pulse bg-[#0A0A0B] border border-[#1a1a1f] rounded-2xl px-8 py-5 animate-on-scroll">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#FF3366] flex items-center justify-center text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>
              J
            </div>
            <span className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>Jestly</span>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="fonctionnalites" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-3xl sm:text-4xl font-bold text-center mb-4 animate-on-scroll"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Tout ce dont un freelance a besoin.
          </h2>
          <p className="text-[#a1a1aa] text-center mb-14 animate-on-scroll stagger-1">
            Six outils essentiels, une seule interface.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div key={f.title} className={`feature-card animate-on-scroll stagger-${i + 1}`}>
                <div className="mb-4">{f.icon}</div>
                <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                  {f.title}
                </h3>
                <p className="text-sm text-[#a1a1aa] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-24 px-6 bg-[#111113]">
        <div className="max-w-4xl mx-auto">
          <h2
            className="text-3xl sm:text-4xl font-bold text-center mb-4 animate-on-scroll"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Lancez-vous en 3 minutes.
          </h2>
          <p className="text-[#a1a1aa] text-center mb-16 animate-on-scroll stagger-1">
            Simple, rapide, efficace.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 relative">
            {/* Connector line (desktop) */}
            <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-px bg-gradient-to-r from-[#1a1a1f] via-[rgba(255,107,53,0.3)] to-[#1a1a1f]" />

            {steps.map((step, i) => (
              <div key={step.num} className={`relative text-center animate-on-scroll stagger-${i + 1}`}>
                <div className="inline-block mb-6">
                  <span
                    className="text-4xl font-bold gradient-text"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {step.num}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                  {step.title}
                </h3>
                <p className="text-sm text-[#a1a1aa]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="tarifs" className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <h2
            className="text-3xl sm:text-4xl font-bold text-center mb-4 animate-on-scroll"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Simple. Transparent.
          </h2>
          <p className="text-[#a1a1aa] text-center mb-14 animate-on-scroll stagger-1">
            Pas de frais caches. Upgradez quand vous voulez.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Free plan */}
            <div className="pricing-card animate-on-scroll stagger-1">
              <h3 className="text-lg font-semibold mb-1" style={{ fontFamily: "var(--font-heading)" }}>Free</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>0&euro;</span>
                <span className="text-[#666] text-sm">/mois</span>
              </div>
              <ul className="flex flex-col gap-3 mb-8">
                {freePlanFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-[#a1a1aa]">
                    <IconCheck /> {f}
                  </li>
                ))}
              </ul>
              <a href="#" className="btn-ghost block text-center w-full">
                Commencer gratuitement
              </a>
            </div>

            {/* Pro plan */}
            <div className="pricing-card-pro animate-on-scroll stagger-2">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--font-heading)" }}>Pro</h3>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-gradient-to-r from-[#FF6B35] to-[#FF3366] text-white px-3 py-1 rounded-full">
                  Populaire
                </span>
              </div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>7&euro;</span>
                <span className="text-[#666] text-sm">/mois</span>
              </div>
              <ul className="flex flex-col gap-3 mb-8">
                {proPlanFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-[#a1a1aa]">
                    <IconCheck /> {f}
                  </li>
                ))}
              </ul>
              <a href="#" className="btn-primary block text-center w-full">
                Passer Pro
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="py-24 px-6 bg-[#111113]">
        <div className="max-w-2xl mx-auto">
          <h2
            className="text-3xl sm:text-4xl font-bold text-center mb-14 animate-on-scroll"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Questions frequentes
          </h2>

          <div className="flex flex-col">
            {faqItems.map((item, i) => (
              <div key={i} className={`faq-item animate-on-scroll stagger-${i + 1}`}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between py-5 text-left"
                >
                  <span className="text-sm sm:text-base font-medium pr-4">{item.q}</span>
                  <IconPlus className={`faq-icon flex-shrink-0 text-[#666] ${openFaq === i ? "open" : ""}`} />
                </button>
                <div className={`faq-answer ${openFaq === i ? "open" : ""}`}>
                  <p className="text-sm text-[#a1a1aa] pb-5 leading-relaxed">{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOOTER CTA ─── */}
      <section className="relative py-24 px-6">
        <div className="footer-cta-glow animate-glow-pulse" />
        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <h2
            className="text-3xl sm:text-4xl font-bold mb-6 animate-on-scroll"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Pret a structurer votre freelance ?
          </h2>
          <div className="animate-on-scroll stagger-1">
            <a href="#" className="btn-primary inline-flex items-center gap-2 !py-4 !px-10 !text-base">
              Commencer gratuitement <IconArrowRight />
            </a>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-[#1a1a1f] py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div>
              <span className="text-xl font-bold tracking-tight block mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                Jestly
              </span>
              <p className="text-sm text-[#666]">Le cockpit du freelance moderne.</p>
            </div>

            {/* Produit */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#666] mb-4">Produit</h4>
              <ul className="flex flex-col gap-2">
                <li><a href="#fonctionnalites" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">Fonctionnalites</a></li>
                <li><a href="#tarifs" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">Tarifs</a></li>
                <li><a href="#faq" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#666] mb-4">Legal</h4>
              <ul className="flex flex-col gap-2">
                <li><a href="#" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">CGU</a></li>
                <li><a href="#" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">Confidentialite</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#666] mb-4">Contact</h4>
              <a href="mailto:contact@jestly.fr" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">
                contact@jestly.fr
              </a>
            </div>
          </div>

          <div className="border-t border-[#1a1a1f] pt-8">
            <p className="text-xs text-[#444] text-center">
              &copy; 2025 Jestly. Tous droits reserves.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
