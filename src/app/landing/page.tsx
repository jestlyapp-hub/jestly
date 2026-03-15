"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";

// ═══════════════════════════════════════════════════════════════
// JESTLY PREMIUM LANDING PAGE
// ═══════════════════════════════════════════════════════════════

const NAV_ITEMS = [
  { label: "Fonctionnalités", href: "#features" },
  { label: "Builder", href: "#builder" },
  { label: "Business", href: "#business" },
  { label: "Tarifs", href: "#pricing" },
];

const FEATURES = [
  { title: "Créez", subtitle: "Votre site portfolio", desc: "Un builder puissant avec 100+ blocs. Créez un site unique en quelques minutes, sans coder.", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { title: "Vendez", subtitle: "Vos services", desc: "Checkout intégré, briefs clients, paiements. Vendez directement depuis votre site.", icon: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" },
  { title: "Gérez", subtitle: "Votre business", desc: "Commandes, clients, projets, tâches, calendrier, facturation. Tout dans un seul espace.", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
];

const PRODUCT_SCREENS = [
  { label: "Dashboard", color: "#4F46E5" },
  { label: "Builder", color: "#7C3AED" },
  { label: "Commandes", color: "#2563EB" },
  { label: "Analytics", color: "#0891B2" },
];

const SOCIAL_PROOF = [
  { name: "Marie L.", role: "Designer freelance", text: "Jestly a remplacé 5 outils. Mon business tourne enfin proprement." },
  { name: "Thomas D.", role: "Vidéaste", text: "Le builder est incroyable. Mon site portfolio est en ligne en 20 minutes." },
  { name: "Sarah B.", role: "Photographe", text: "Je gère mes commandes, mes clients et mes factures au même endroit." },
];

// ═══════════════════════════════════════════════════════════════
// PIXEL GRID BACKGROUND
// ═══════════════════════════════════════════════════════════════
function PixelGrid() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-[#FAFAFA]" />
      {/* Pixel grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(#4F46E5 1px, transparent 1px),
            linear-gradient(90deg, #4F46E5 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />
      {/* Radial fade */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#FAFAFA_70%)]" />
      {/* Top glow */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#4F46E5]/[0.04] rounded-full blur-[100px]" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// NAVBAR — Glassmorphism sticky
// ═══════════════════════════════════════════════════════════════
function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/70 backdrop-blur-xl border-b border-black/[0.04] shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
          : "bg-transparent"
      }`}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center">
            <span className="text-white text-sm font-bold">J</span>
          </div>
          <span className="text-[17px] font-bold text-[#1A1A1A] group-hover:text-[#4F46E5] transition-colors">Jestly</span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-[14px] font-medium text-[#666] hover:text-[#1A1A1A] transition-colors relative group"
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#4F46E5] group-hover:w-full transition-all duration-300" />
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-[13px] font-medium text-[#666] hover:text-[#1A1A1A] transition-colors hidden sm:block">
            Connexion
          </Link>
          <Link
            href="/login"
            className="text-[13px] font-semibold text-white bg-[#1A1A1A] px-4 py-2 rounded-lg hover:bg-[#333] transition-all hover:shadow-lg hover:shadow-black/10 hover:-translate-y-0.5"
          >
            Commencer gratuitement
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}

// ═══════════════════════════════════════════════════════════════
// HERO SECTION
// ═══════════════════════════════════════════════════════════════
function HeroSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={ref} className="relative pt-32 pb-20 overflow-hidden">
      <motion.div className="max-w-5xl mx-auto px-6 text-center" style={{ y, opacity }}>
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#4F46E5]/[0.06] border border-[#4F46E5]/10 mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5] animate-pulse" />
          <span className="text-[12px] font-semibold text-[#4F46E5]">Le tout-en-un pour freelances</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold leading-[1.05] tracking-tight text-[#0A0A0A] mb-6"
        >
          Gérez tout votre business
          <br />
          <span className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] bg-clip-text text-transparent">
            freelance en un seul endroit
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="text-[clamp(1rem,2vw,1.25rem)] text-[#666] max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Créez votre site portfolio, vendez vos services, gérez vos commandes,
          suivez vos revenus. Tout dans une plateforme pensée pour les créatifs.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="flex items-center justify-center gap-4"
        >
          <Link
            href="/login"
            className="text-[15px] font-semibold text-white bg-[#4F46E5] px-7 py-3.5 rounded-xl hover:bg-[#4338CA] transition-all shadow-lg shadow-[#4F46E5]/25 hover:shadow-xl hover:shadow-[#4F46E5]/30 hover:-translate-y-0.5"
          >
            Commencer gratuitement
          </Link>
          <a
            href="#features"
            className="text-[15px] font-semibold text-[#666] px-7 py-3.5 rounded-xl border border-[#E6E6E4] hover:border-[#CCC] hover:text-[#1A1A1A] hover:bg-white transition-all"
          >
            Découvrir
          </a>
        </motion.div>

        {/* Product mockup */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.7 }}
          className="mt-16 relative"
        >
          {/* Glow behind */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#4F46E5]/10 to-transparent rounded-3xl blur-3xl -z-10 scale-95" />

          {/* Browser mockup */}
          <div className="bg-white rounded-2xl border border-black/[0.08] shadow-2xl shadow-black/[0.08] overflow-hidden mx-auto max-w-4xl">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-5 py-3 bg-[#FAFAFA] border-b border-black/[0.04]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
                <div className="w-3 h-3 rounded-full bg-[#28C840]" />
              </div>
              <div className="flex-1 bg-white rounded-md px-4 py-1.5 text-[12px] text-[#AAA] text-center border border-black/[0.04]">
                jestly.fr/dashboard
              </div>
            </div>
            {/* Screenshot placeholder */}
            <div className="aspect-[16/9] bg-gradient-to-br from-[#F7F7F5] to-[#EFEFEF] flex items-center justify-center relative overflow-hidden">
              {/* Abstract dashboard representation */}
              <div className="w-full h-full p-6 flex gap-4">
                {/* Sidebar */}
                <div className="w-14 bg-white/80 rounded-xl flex flex-col items-center gap-3 py-4 flex-shrink-0">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className={`w-7 h-7 rounded-lg ${i === 0 ? "bg-[#4F46E5]" : "bg-[#EFEFEF]"}`} />
                  ))}
                </div>
                {/* Main content */}
                <div className="flex-1 space-y-4">
                  {/* Stats row */}
                  <div className="flex gap-3">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="flex-1 bg-white/80 rounded-xl p-4 space-y-2">
                        <div className="h-2 w-12 bg-[#E6E6E4] rounded" />
                        <div className="h-5 w-16 bg-[#1A1A1A]/10 rounded" />
                      </div>
                    ))}
                  </div>
                  {/* Chart area */}
                  <div className="bg-white/80 rounded-xl p-6 flex-1">
                    <div className="h-2 w-20 bg-[#E6E6E4] rounded mb-6" />
                    <div className="flex items-end gap-2 h-32">
                      {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t-md transition-all"
                          style={{ height: `${h}%`, background: i === 9 ? "#4F46E5" : "#E6E6E4" }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// SOCIAL PROOF
// ═══════════════════════════════════════════════════════════════
function SocialProofSection() {
  return (
    <section className="py-16 relative">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-10">
          <p className="text-[13px] font-semibold text-[#999] uppercase tracking-wider">Ils nous font confiance</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {SOCIAL_PROOF.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl border border-black/[0.04] p-6 hover:shadow-lg hover:shadow-black/[0.03] hover:-translate-y-1 transition-all duration-300"
            >
              <p className="text-[14px] text-[#444] leading-relaxed mb-5">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4F46E5]/20 to-[#7C3AED]/20 flex items-center justify-center text-[12px] font-bold text-[#4F46E5]">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-[#1A1A1A]">{t.name}</div>
                  <div className="text-[11px] text-[#999]">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// FEATURES — Create / Sell / Manage
// ═══════════════════════════════════════════════════════════════
function FeaturesSection() {
  return (
    <section id="features" className="py-24 relative">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-extrabold text-[#0A0A0A] mb-4">
            Tout ce dont vous avez besoin
          </h2>
          <p className="text-[17px] text-[#666] max-w-xl mx-auto">
            Créez, vendez et gérez — le tout depuis une seule plateforme.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="group relative bg-white rounded-2xl border border-black/[0.04] p-8 hover:shadow-xl hover:shadow-black/[0.04] hover:-translate-y-1.5 transition-all duration-400"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-[#4F46E5]/[0.06] flex items-center justify-center mb-5 group-hover:bg-[#4F46E5]/[0.1] group-hover:scale-110 transition-all">
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d={f.icon} />
                </svg>
              </div>
              <div className="text-[11px] font-semibold text-[#4F46E5] uppercase tracking-wider mb-1">{f.title}</div>
              <h3 className="text-[20px] font-bold text-[#0A0A0A] mb-3">{f.subtitle}</h3>
              <p className="text-[14px] text-[#666] leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// BUILDER SECTION
// ═══════════════════════════════════════════════════════════════
function BuilderSection() {
  return (
    <section id="builder" className="py-24 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="text-[11px] font-semibold text-[#4F46E5] uppercase tracking-wider mb-3">Site Builder</div>
            <h2 className="text-[clamp(1.6rem,3.5vw,2.5rem)] font-extrabold text-[#0A0A0A] mb-5 leading-tight">
              Un site portfolio<br />qui vous ressemble
            </h2>
            <p className="text-[16px] text-[#666] leading-relaxed mb-8 max-w-md">
              100+ blocs premium. Thèmes personnalisables. Publication en un clic.
              Pas besoin de savoir coder.
            </p>
            <div className="space-y-3">
              {["100+ blocs prêts à l'emploi", "Thèmes et design personnalisables", "Checkout et formulaires intégrés", "Optimisé SEO et mobile"].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#4F46E5]/[0.08] flex items-center justify-center flex-shrink-0">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                  <span className="text-[14px] text-[#444]">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#4F46E5]/10 to-[#7C3AED]/5 rounded-3xl blur-3xl -z-10" />
            <div className="bg-white rounded-2xl border border-black/[0.06] shadow-xl shadow-black/[0.05] overflow-hidden">
              {/* Builder UI representation */}
              <div className="flex">
                {/* Block sidebar */}
                <div className="w-48 border-r border-black/[0.04] bg-[#FAFAFA] p-3 space-y-2">
                  <div className="h-2 w-16 bg-[#DDD] rounded mb-3" />
                  {["Hero", "Portfolio", "Services", "Contact", "Footer"].map((b, i) => (
                    <div key={b} className={`px-3 py-2 rounded-lg text-[11px] font-medium ${i === 0 ? "bg-[#4F46E5] text-white" : "bg-white text-[#666] border border-black/[0.04]"}`}>
                      {b}
                    </div>
                  ))}
                </div>
                {/* Canvas */}
                <div className="flex-1 p-4 space-y-3 min-h-[300px]">
                  <div className="h-24 bg-gradient-to-r from-[#4F46E5]/10 to-[#7C3AED]/5 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="h-3 w-28 bg-[#1A1A1A]/15 rounded mx-auto mb-2" />
                      <div className="h-2 w-36 bg-[#1A1A1A]/8 rounded mx-auto" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="aspect-square bg-[#F3F3F3] rounded-lg" />
                    ))}
                  </div>
                  <div className="h-16 bg-[#F7F7F5] rounded-xl" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// BUSINESS MANAGEMENT
// ═══════════════════════════════════════════════════════════════
function BusinessSection() {
  return (
    <section id="business" className="py-24 relative">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-extrabold text-[#0A0A0A] mb-4">
            Votre cockpit business
          </h2>
          <p className="text-[17px] text-[#666] max-w-xl mx-auto">
            Dashboard, commandes, clients, analytics — tout dans un seul espace.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-5">
          {[
            { title: "Dashboard & Analytics", desc: "Suivez vos revenus, commandes et clients en temps réel.", bg: "from-[#4F46E5]/5 to-[#4F46E5]/[0.02]" },
            { title: "Gestion des commandes", desc: "Kanban, statuts personnalisés, briefs clients intégrés.", bg: "from-[#7C3AED]/5 to-[#7C3AED]/[0.02]" },
            { title: "CRM Clients", desc: "Historique, revenus, projets — tout sur chaque client.", bg: "from-[#2563EB]/5 to-[#2563EB]/[0.02]" },
            { title: "Facturation", desc: "Factures, exports, récurrence, clôtures périodiques.", bg: "from-[#0891B2]/5 to-[#0891B2]/[0.02]" },
          ].map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`bg-gradient-to-br ${card.bg} rounded-2xl border border-black/[0.04] p-8 hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}
            >
              <h3 className="text-[18px] font-bold text-[#0A0A0A] mb-2">{card.title}</h3>
              <p className="text-[14px] text-[#666] leading-relaxed">{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// PRICING
// ═══════════════════════════════════════════════════════════════
function PricingSection() {
  return (
    <section id="pricing" className="py-24 relative">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-extrabold text-[#0A0A0A] mb-4">Tarifs simples</h2>
          <p className="text-[17px] text-[#666]">Commencez gratuitement. Passez au Pro quand vous êtes prêt.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Free */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl border border-black/[0.06] p-8"
          >
            <div className="text-[13px] font-semibold text-[#999] uppercase tracking-wider mb-2">Free</div>
            <div className="flex items-baseline gap-1 mb-5">
              <span className="text-[40px] font-extrabold text-[#0A0A0A]">0€</span>
              <span className="text-[15px] text-[#999]">/mois</span>
            </div>
            <ul className="space-y-3 mb-8">
              {["1 site publié", "10 commandes/mois", "Blocs essentiels", "Dashboard & analytics"].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-[14px] text-[#444]">
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/login" className="block text-center text-[14px] font-semibold text-[#4F46E5] border-2 border-[#4F46E5]/20 px-6 py-3 rounded-xl hover:bg-[#4F46E5]/[0.04] transition-colors">
              Commencer gratuitement
            </Link>
          </motion.div>

          {/* Pro */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-[#0A0A0A] rounded-2xl p-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#4F46E5]/20 rounded-full blur-3xl -z-0" />
            <div className="relative z-10">
              <div className="text-[13px] font-semibold text-[#4F46E5] uppercase tracking-wider mb-2">Pro</div>
              <div className="flex items-baseline gap-1 mb-5">
                <span className="text-[40px] font-extrabold text-white">7€</span>
                <span className="text-[15px] text-[#888]">/mois</span>
              </div>
              <ul className="space-y-3 mb-8">
                {["Sites illimités", "Commandes illimitées", "100+ blocs premium", "Domaine personnalisé", "Support prioritaire"].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-[14px] text-[#CCC]">
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="block text-center text-[14px] font-semibold text-white bg-[#4F46E5] px-6 py-3 rounded-xl hover:bg-[#4338CA] transition-colors shadow-lg shadow-[#4F46E5]/25">
                Passer au Pro
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// FINAL CTA
// ═══════════════════════════════════════════════════════════════
function FinalCTA() {
  return (
    <section className="py-24 relative">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-extrabold text-[#0A0A0A] mb-5">
            Prêt à structurer votre<br />activité freelance ?
          </h2>
          <p className="text-[17px] text-[#666] mb-10 max-w-lg mx-auto">
            Rejoignez les créatifs qui gèrent leur business proprement avec Jestly.
          </p>
          <Link
            href="/login"
            className="inline-flex text-[16px] font-semibold text-white bg-[#4F46E5] px-8 py-4 rounded-xl hover:bg-[#4338CA] transition-all shadow-xl shadow-[#4F46E5]/20 hover:shadow-2xl hover:shadow-[#4F46E5]/30 hover:-translate-y-0.5"
          >
            Commencer gratuitement
          </Link>
          <p className="text-[13px] text-[#BBB] mt-4">Gratuit pour toujours. Pas de carte bancaire.</p>
        </motion.div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// FOOTER
// ═══════════════════════════════════════════════════════════════
function Footer() {
  return (
    <footer className="border-t border-black/[0.04] py-10">
      <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">J</span>
          </div>
          <span className="text-[13px] text-[#999]">© 2026 Jestly. Tous droits réservés.</span>
        </div>
        <div className="flex gap-6">
          {["Mentions légales", "CGV", "Contact"].map((l) => (
            <a key={l} href="#" className="text-[12px] text-[#999] hover:text-[#666] transition-colors">{l}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}

// ═══════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════
export default function LandingPage() {
  return (
    <>
      <PixelGrid />
      <Navbar />
      <main>
        <HeroSection />
        <SocialProofSection />
        <FeaturesSection />
        <BuilderSection />
        <BusinessSection />
        <PricingSection />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
