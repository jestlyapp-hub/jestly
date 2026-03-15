"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue, AnimatePresence } from "framer-motion";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════════════════════
   JESTLY — THE FREELANCE OPERATING SYSTEM
   Category-defining landing — manifesto + product theater + pixel system
   ═══════════════════════════════════════════════════════════════════════ */

const ease = [0.22, 1, 0.36, 1] as const;

/* ─── DATA ─── */
const ORBIT_MODULES = [
  { label: "Portfolio", icon: "◈", angle: -60 },
  { label: "Orders", icon: "◇", angle: 0 },
  { label: "Clients", icon: "○", angle: 60 },
  { label: "Revenue", icon: "△", angle: 120 },
  { label: "Projects", icon: "□", angle: 180 },
  { label: "Invoicing", icon: "▽", angle: 240 },
];

const CHAOS_TOOLS = ["Notion", "Stripe", "Trello", "Calendly", "Drive", "Gmail", "WordPress", "Sheets", "Mailchimp", "Figma"];

const SYSTEM_LAYERS = [
  { label: "Présenter", desc: "Site portfolio + builder 100 blocs", color: "#7C3AED" },
  { label: "Vendre", desc: "Checkout, briefs, offres packagées", color: "#4F46E5" },
  { label: "Livrer", desc: "Projets, tâches, calendrier, fichiers", color: "#0891B2" },
  { label: "Facturer", desc: "Factures, exports, récurrence", color: "#059669" },
  { label: "Piloter", desc: "Dashboard, analytics, KPIs, vision", color: "#D97706" },
];

/* ═══════════════════════════════════════════════════════════════════════
   PIXEL FIELD — Multi-layer topographic system background
   ═══════════════════════════════════════════════════════════════════════ */
function PixelField() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none select-none" aria-hidden>
      {/* Base */}
      <div className="absolute inset-0 bg-[#FAFAFA]" />

      {/* L1: Architectural grid */}
      <div className="absolute inset-0 opacity-[0.018]" style={{
        backgroundImage: "linear-gradient(#4F46E5 1px, transparent 1px), linear-gradient(90deg, #4F46E5 1px, transparent 1px)",
        backgroundSize: "80px 80px",
      }} />

      {/* L2: Micro cells */}
      <div className="absolute inset-0 opacity-[0.012]" style={{
        backgroundImage: "linear-gradient(#4F46E5 0.5px, transparent 0.5px), linear-gradient(90deg, #4F46E5 0.5px, transparent 0.5px)",
        backgroundSize: "16px 16px",
      }} />

      {/* L3: Dense hero cluster — structured patch */}
      <div className="absolute top-[-5%] left-[20%] w-[60%] h-[55%] opacity-[0.04]" style={{
        backgroundImage: "linear-gradient(#4F46E5 1px, transparent 1px), linear-gradient(90deg, #4F46E5 1px, transparent 1px)",
        backgroundSize: "12px 12px",
        maskImage: "radial-gradient(ellipse 100% 80% at 50% 40%, black 0%, transparent 70%)",
        WebkitMaskImage: "radial-gradient(ellipse 100% 80% at 50% 40%, black 0%, transparent 70%)",
      }} />

      {/* L4: Secondary cluster — right zone */}
      <div className="absolute top-[30%] right-[0%] w-[35%] h-[40%] opacity-[0.025]" style={{
        backgroundImage: "linear-gradient(#7C3AED 0.5px, transparent 0.5px), linear-gradient(90deg, #7C3AED 0.5px, transparent 0.5px)",
        backgroundSize: "10px 10px",
        maskImage: "radial-gradient(ellipse at 70% 50%, black 0%, transparent 60%)",
        WebkitMaskImage: "radial-gradient(ellipse at 70% 50%, black 0%, transparent 60%)",
      }} />

      {/* L5: Bottom structure */}
      <div className="absolute bottom-[0%] left-[10%] w-[80%] h-[30%] opacity-[0.02]" style={{
        backgroundImage: "linear-gradient(#0891B2 0.5px, transparent 0.5px), linear-gradient(90deg, #0891B2 0.5px, transparent 0.5px)",
        backgroundSize: "20px 20px",
        maskImage: "linear-gradient(to top, black 0%, transparent 80%)",
        WebkitMaskImage: "linear-gradient(to top, black 0%, transparent 80%)",
      }} />

      {/* Glows */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[#4F46E5]/[0.025] rounded-full blur-[150px]" />
      <div className="absolute top-[50%] right-[-10%] w-[500px] h-[500px] bg-[#7C3AED]/[0.015] rounded-full blur-[120px]" />
      <div className="absolute bottom-[10%] left-[-5%] w-[400px] h-[300px] bg-[#0891B2]/[0.01] rounded-full blur-[100px]" />

      {/* Edge vignette */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse 70% 50% at 50% 35%, transparent 0%, #FAFAFA 85%)",
      }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   TOPBAR — Floating glass artifact
   ═══════════════════════════════════════════════════════════════════════ */
function Topbar() {
  const [scrolled, setScrolled] = useState(false);
  const hoverX = useMotionValue(0);
  const hoverW = useMotionValue(0);
  const hoverOpacity = useMotionValue(0);
  const springX = useSpring(hoverX, { stiffness: 400, damping: 35 });
  const springW = useSpring(hoverW, { stiffness: 400, damping: 35 });
  const springO = useSpring(hoverOpacity, { stiffness: 300, damping: 30 });
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const handleHover = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!navRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const navRect = navRef.current.getBoundingClientRect();
    hoverX.set(rect.left - navRect.left);
    hoverW.set(rect.width);
    hoverOpacity.set(1);
  }, [hoverX, hoverW, hoverOpacity]);

  const items = [
    { label: "Système", href: "#system" },
    { label: "Builder", href: "#builder" },
    { label: "Operations", href: "#ops" },
    { label: "Tarifs", href: "#pricing" },
  ];

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4"
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease }}
    >
      <div className={`flex items-center justify-between w-full max-w-[860px] px-4 h-[52px] rounded-2xl transition-all duration-500 ${
        scrolled
          ? "bg-white/80 backdrop-blur-2xl border border-black/[0.05] shadow-[0_1px_12px_-2px_rgba(0,0,0,0.06)]"
          : "bg-white/50 backdrop-blur-xl border border-white/60"
      }`}>
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-6 h-6 rounded-[7px] bg-[#0A0A0A] flex items-center justify-center group-hover:rounded-lg transition-all">
            <span className="text-white text-[9px] font-black">J</span>
          </div>
          <span className="text-[14px] font-bold text-[#0A0A0A] tracking-[-0.01em]">Jestly</span>
        </Link>

        <nav ref={navRef} className="hidden md:flex items-center relative">
          {/* Hover highlight */}
          <motion.div
            className="absolute top-0.5 h-[calc(100%-4px)] rounded-lg bg-black/[0.04]"
            style={{ x: springX, width: springW, opacity: springO }}
          />
          {items.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="relative z-10 px-3.5 py-1.5 text-[12.5px] font-medium text-[#555] hover:text-[#0A0A0A] transition-colors"
              onMouseEnter={handleHover}
              onMouseLeave={() => hoverOpacity.set(0)}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <Link
          href="/login"
          className="text-[11.5px] font-semibold text-white bg-[#0A0A0A] px-3.5 py-[7px] rounded-[10px] hover:bg-[#222] transition-all hover:shadow-md hover:shadow-black/8"
        >
          Démarrer
        </Link>
      </div>
    </motion.header>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   HERO — Full-scene product manifesto
   Central nucleus + orbiting modules + statement typography
   ═══════════════════════════════════════════════════════════════════════ */
function HeroScene() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-[100vh] flex flex-col items-center justify-center pt-20 pb-24 overflow-hidden">
      <motion.div className="max-w-6xl mx-auto px-6 w-full" style={{ y, opacity }}>

        {/* ─── CENTRAL COMPOSITION ─── */}
        <div className="text-center relative">

          {/* System badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0A0A0A] mb-10"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5] animate-pulse" />
            <span className="text-[10px] font-bold text-white/90 tracking-[0.15em] uppercase">Freelance Operating System</span>
          </motion.div>

          {/* ─── HEADLINE — architectural typography ─── */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease }}
          >
            <h1 className="text-[clamp(2.8rem,7vw,5.5rem)] font-extrabold leading-[0.95] tracking-[-0.04em] text-[#0A0A0A]">
              <span className="block">Arrêtez</span>
              <span className="block relative inline-block">
                <span className="relative">
                  d&apos;improviser
                  {/* Pixel-style underline accent */}
                  <span className="absolute -bottom-1 left-0 right-0 h-[5px] bg-[#4F46E5] opacity-20" style={{
                    maskImage: "repeating-linear-gradient(90deg, black 0px, black 3px, transparent 3px, transparent 5px)",
                    WebkitMaskImage: "repeating-linear-gradient(90deg, black 0px, black 3px, transparent 3px, transparent 5px)",
                  }} />
                </span>
              </span>
              <span className="block text-[#BBB]">votre infrastructure.</span>
            </h1>
          </motion.div>

          {/* Sub-statement */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-[clamp(0.95rem,1.6vw,1.15rem)] text-[#888] max-w-lg mx-auto mt-7 leading-relaxed"
          >
            Site, ventes, clients, projets, facturation —
            un seul système structuré au lieu de 10 onglets dispersés.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex items-center justify-center gap-4 mt-9"
          >
            <Link
              href="/login"
              className="group relative text-[14px] font-semibold text-white px-7 py-3.5 rounded-xl overflow-hidden transition-all shadow-[0_4px_24px_-4px_rgba(79,70,229,0.4)] hover:shadow-[0_8px_32px_-4px_rgba(79,70,229,0.5)] hover:-translate-y-0.5"
            >
              <span className="absolute inset-0 bg-[#4F46E5]" />
              <span className="absolute inset-0 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="relative z-10">Commencer gratuitement</span>
            </Link>
            <a href="#system" className="text-[13px] font-medium text-[#999] hover:text-[#0A0A0A] transition-colors">
              Explorer le système →
            </a>
          </motion.div>
        </div>

        {/* ─── PRODUCT NUCLEUS — Central system visualization ─── */}
        <motion.div
          className="relative mt-20 mx-auto max-w-3xl"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 1, ease }}
        >
          {/* Orbital ring */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[480px] h-[480px] rounded-full border border-[#4F46E5]/[0.06] hidden lg:block" />
            <div className="absolute w-[360px] h-[360px] rounded-full border border-[#4F46E5]/[0.04] hidden lg:block" />
          </div>

          {/* Central frame — Dashboard */}
          <div className="relative z-10 bg-white rounded-2xl border border-black/[0.06] shadow-[0_20px_60px_-12px_rgba(0,0,0,0.08)] overflow-hidden mx-auto max-w-2xl">
            {/* Chrome */}
            <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[#FAFAFA] border-b border-black/[0.04]">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
              </div>
              <div className="flex-1 bg-white rounded-md px-3 py-1 text-[9px] text-[#CCC] text-center border border-black/[0.03] ml-3 font-mono">
                jestly.fr / dashboard
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[8px] font-semibold text-emerald-500 uppercase tracking-wider">Live</span>
              </div>
            </div>

            {/* Dashboard content */}
            <div className="p-4 bg-[#FAFAFA] min-h-[280px] lg:min-h-[320px]">
              <div className="flex gap-3">
                {/* Sidebar */}
                <div className="w-9 bg-white rounded-xl flex flex-col items-center gap-2 py-3 border border-black/[0.03] flex-shrink-0 hidden sm:flex">
                  <div className="w-5 h-5 rounded-md bg-[#4F46E5]" />
                  {[0, 1, 2, 3, 4].map((i) => <div key={i} className="w-5 h-5 rounded-md bg-[#F3F3F3]" />)}
                </div>
                <div className="flex-1 space-y-2.5">
                  {/* KPIs */}
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { v: "3.2k €", l: "Revenus", c: "#4F46E5" },
                      { v: "42", l: "Commandes", c: "#0891B2" },
                      { v: "18", l: "Clients", c: "#7C3AED" },
                      { v: "89%", l: "Conversion", c: "#059669" },
                    ].map((k) => (
                      <div key={k.l} className="bg-white rounded-lg p-2 border border-black/[0.03]">
                        <div className="text-[8px] text-[#AAA] mb-0.5">{k.l}</div>
                        <div className="text-[13px] font-bold" style={{ color: k.c }}>{k.v}</div>
                      </div>
                    ))}
                  </div>
                  {/* Chart */}
                  <div className="bg-white rounded-lg p-3 border border-black/[0.03]">
                    <div className="flex items-end gap-[3px] h-20">
                      {[30, 50, 38, 65, 45, 72, 55, 80, 60, 90, 68, 85].map((h, i) => (
                        <motion.div
                          key={i}
                          className="flex-1 rounded-t-sm"
                          style={{ background: i >= 9 ? "#4F46E5" : i >= 7 ? "#818CF8" : "#EEF2FF" }}
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ delay: 1.1 + i * 0.04, duration: 0.6, ease }}
                        />
                      ))}
                    </div>
                  </div>
                  {/* Table preview */}
                  <div className="bg-white rounded-lg p-2.5 border border-black/[0.03] space-y-1.5">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-[#F3F3F3]" />
                        <div className="flex-1 h-2 bg-[#F7F7F5] rounded" />
                        <div className="h-2 w-10 bg-[#EEF2FF] rounded" />
                        <div className="h-4 w-14 rounded-md bg-[#F3F3F3]" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── ORBITING MODULE CARDS ─── */}
          {ORBIT_MODULES.map((mod, i) => {
            const a = mod.angle * (Math.PI / 180);
            const rx = 260, ry = 170;
            const x = Math.cos(a) * rx;
            const yPos = Math.sin(a) * ry;
            return (
              <motion.div
                key={mod.label}
                className="absolute hidden lg:flex items-center gap-1.5 px-3 py-2 bg-white/90 backdrop-blur-sm rounded-xl border border-black/[0.05] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all z-20"
                style={{ left: `calc(50% + ${x}px - 44px)`, top: `calc(50% + ${yPos}px - 16px)` }}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.3 + i * 0.1, duration: 0.5, ease }}
              >
                <span className="text-[14px] text-[#4F46E5]">{mod.icon}</span>
                <span className="text-[11px] font-semibold text-[#333]">{mod.label}</span>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MANIFESTO — Category-defining statement
   ═══════════════════════════════════════════════════════════════════════ */
function ManifestoSection() {
  return (
    <section className="py-32 relative">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease }}
        >
          <p className="text-[10px] font-bold text-[#4F46E5] uppercase tracking-[0.25em] mb-6">Manifeste</p>
          <h2 className="text-[clamp(1.8rem,4.5vw,3.2rem)] font-extrabold leading-[1.1] tracking-[-0.03em] text-[#0A0A0A] mb-8">
            Les freelances n&apos;ont pas besoin
            <br />
            d&apos;un outil de plus.
            <br />
            <span className="text-[#CCC]">Ils ont besoin d&apos;un système.</span>
          </h2>
          <div className="w-12 h-[2px] bg-[#4F46E5]/30 mb-8" />
          <p className="text-[17px] text-[#999] max-w-2xl leading-[1.7]">
            Votre business ne devrait pas vivre entre des onglets, des docs, des DMs et des dashboards.
            Jestly transforme le travail freelance en couche opérationnelle structurée —
            du portfolio au paiement, de la livraison à la facturation.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   CHAOS → SYSTEM — Visual choreography of transformation
   ═══════════════════════════════════════════════════════════════════════ */
function ChaosSystemSection() {
  return (
    <section id="system" className="py-28 overflow-hidden">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-[10px] font-bold text-[#4F46E5] uppercase tracking-[0.25em] mb-3">Architecture</p>
          <h2 className="text-[clamp(1.6rem,3.5vw,2.4rem)] font-extrabold text-[#0A0A0A]">
            Du chaos dispersé au système centralisé
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* BEFORE */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative h-[340px] rounded-2xl bg-gradient-to-br from-[#FEF2F2]/50 to-transparent border border-red-100/50 p-7 overflow-hidden"
          >
            <div className="text-[10px] font-bold text-red-400/80 uppercase tracking-[0.2em] mb-1">Avant</div>
            <div className="text-[17px] font-bold text-[#0A0A0A] mb-2">10 outils. 0 système.</div>
            <div className="text-[12px] text-[#AAA] mb-8">Chaque tâche dans un outil différent.</div>

            {/* Scattered tool chips */}
            {CHAOS_TOOLS.map((tool, i) => {
              const positions = [
                { l: 10, t: 42 }, { l: 55, t: 35 }, { l: 25, t: 60 }, { l: 68, t: 55 },
                { l: 8, t: 78 }, { l: 50, t: 75 }, { l: 75, t: 78 }, { l: 38, t: 45 },
                { l: 62, t: 68 }, { l: 20, t: 85 },
              ];
              const p = positions[i];
              const rot = (i % 2 === 0 ? -1 : 1) * (2 + (i % 5));
              return (
                <motion.div
                  key={tool}
                  className="absolute px-2.5 py-1 bg-white rounded-lg border border-black/[0.06] shadow-sm text-[10px] font-medium text-[#777]"
                  style={{ left: `${p.l}%`, top: `${p.t}%`, rotate: rot }}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 0.6 + (i % 3) * 0.13 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                >
                  {tool}
                </motion.div>
              );
            })}

            {/* Connection lines — tangled */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none" viewBox="0 0 400 340">
              <path d="M80 160 L200 130 L300 180 L150 220 L250 260 L100 280" fill="none" stroke="#EF4444" strokeWidth="1" strokeDasharray="4 4" />
              <path d="M60 200 L180 170 L320 210 L120 250" fill="none" stroke="#EF4444" strokeWidth="1" strokeDasharray="4 4" />
            </svg>
          </motion.div>

          {/* AFTER */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative h-[340px] rounded-2xl bg-gradient-to-br from-[#4F46E5]/[0.03] to-transparent border border-[#4F46E5]/10 p-7"
          >
            <div className="text-[10px] font-bold text-[#4F46E5] uppercase tracking-[0.2em] mb-1">Après</div>
            <div className="text-[17px] font-bold text-[#0A0A0A] mb-2">1 système. Tout connecté.</div>
            <div className="text-[12px] text-[#AAA] mb-8">Un noyau central, des modules intégrés.</div>

            {/* Central nucleus */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[30%]">
              {/* Ring */}
              <div className="absolute -inset-16 rounded-full border border-[#4F46E5]/[0.08]" />
              <div className="absolute -inset-24 rounded-full border border-[#4F46E5]/[0.04]" />

              {/* Core */}
              <motion.div
                className="relative w-14 h-14 rounded-2xl bg-[#0A0A0A] flex items-center justify-center shadow-xl shadow-black/20 z-10"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              >
                <span className="text-white text-[16px] font-black">J</span>
              </motion.div>

              {/* Orbiting modules */}
              {ORBIT_MODULES.slice(0, 6).map((mod, i) => {
                const a = ((i * 60) - 90) * (Math.PI / 180);
                const r = 80;
                return (
                  <motion.div
                    key={mod.label}
                    className="absolute w-8 h-8 rounded-lg bg-white border border-[#4F46E5]/10 flex items-center justify-center shadow-sm text-[12px] text-[#4F46E5]"
                    style={{
                      left: `${Math.cos(a) * r - 16 + 28}px`,
                      top: `${Math.sin(a) * r - 16 + 28}px`,
                    }}
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + i * 0.08 }}
                  >
                    {mod.icon}
                  </motion.div>
                );
              })}
            </div>

            {/* Connection lines — organized */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.08] pointer-events-none" viewBox="0 0 400 340">
              <line x1="200" y1="170" x2="140" y2="110" stroke="#4F46E5" strokeWidth="1" />
              <line x1="200" y1="170" x2="260" y2="110" stroke="#4F46E5" strokeWidth="1" />
              <line x1="200" y1="170" x2="280" y2="170" stroke="#4F46E5" strokeWidth="1" />
              <line x1="200" y1="170" x2="260" y2="230" stroke="#4F46E5" strokeWidth="1" />
              <line x1="200" y1="170" x2="140" y2="230" stroke="#4F46E5" strokeWidth="1" />
              <line x1="200" y1="170" x2="120" y2="170" stroke="#4F46E5" strokeWidth="1" />
            </svg>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   STICKY SYSTEM SHOWCASE — Layer reveal on scroll
   ═══════════════════════════════════════════════════════════════════════ */
function SystemShowcase() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const activeIndex = useTransform(scrollYProgress, [0, 1], [0, SYSTEM_LAYERS.length - 0.01]);

  return (
    <section ref={ref} className="relative" style={{ height: `${(SYSTEM_LAYERS.length + 1) * 100}vh` }}>
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left — Layers stack */}
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-[#4F46E5] uppercase tracking-[0.25em] mb-4">Le système</p>
              <h2 className="text-[clamp(1.4rem,3vw,2rem)] font-extrabold text-[#0A0A0A] mb-8">
                5 couches. 1 système.
              </h2>
              {SYSTEM_LAYERS.map((layer, i) => (
                <SystemLayerCard key={layer.label} layer={layer} index={i} progress={activeIndex} />
              ))}
            </div>

            {/* Right — Visual context */}
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-br from-[#4F46E5]/5 to-transparent rounded-3xl blur-3xl -z-10" />
              <div className="bg-white rounded-2xl border border-black/[0.05] shadow-lg p-8 min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <motion.div
                    className="w-20 h-20 rounded-3xl bg-[#0A0A0A] mx-auto mb-6 flex items-center justify-center"
                    animate={{ rotate: [0, 2, -2, 0] }}
                    transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                  >
                    <span className="text-white text-2xl font-black">J</span>
                  </motion.div>
                  <p className="text-[14px] font-semibold text-[#0A0A0A] mb-2">Tout converge ici</p>
                  <p className="text-[12px] text-[#999] max-w-xs mx-auto">
                    Chaque couche du système renforce les autres. Pas de silos, pas de friction.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SystemLayerCard({ layer, index, progress }: {
  layer: typeof SYSTEM_LAYERS[0];
  index: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  progress: any;
}) {
  const isActive = useTransform(progress, (v: number) => Math.floor(v) === index);
  const opacity = useTransform(progress, (v: number) => {
    const dist = Math.abs(v - index);
    return dist < 0.5 ? 1 : dist < 1.5 ? 0.4 : 0.2;
  });
  const scale = useTransform(progress, (v: number) => Math.floor(v) === index ? 1.02 : 1);

  return (
    <motion.div
      className="flex items-center gap-4 p-4 rounded-xl border transition-colors"
      style={{
        opacity,
        scale,
        borderColor: `${layer.color}15`,
        backgroundColor: `${layer.color}04`,
      }}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[14px] font-bold text-white flex-shrink-0" style={{ background: layer.color }}>
        {index + 1}
      </div>
      <div>
        <div className="text-[14px] font-bold text-[#0A0A0A]">{layer.label}</div>
        <div className="text-[12px] text-[#888]">{layer.desc}</div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   BUILDER — Conversion machine
   ═══════════════════════════════════════════════════════════════════════ */
function BuilderSection() {
  return (
    <section id="builder" className="py-28 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-[1fr_1.15fr] gap-14 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-[10px] font-bold text-[#7C3AED] uppercase tracking-[0.25em] mb-3">Builder</p>
            <h2 className="text-[clamp(1.5rem,3.2vw,2.2rem)] font-extrabold text-[#0A0A0A] leading-tight mb-5">
              Construisez le site
              <br />que vos clients voient.
              <br />
              <span className="text-[#CCC]">Opérez le système qu&apos;ils ne voient pas.</span>
            </h2>
            <p className="text-[15px] text-[#888] leading-relaxed mb-8">
              100+ blocs. Checkout intégré. Formulaires de brief. Templates par métier.
              Un site qui ne se contente pas d&apos;exister — il convertit.
            </p>
            <div className="space-y-2.5">
              {["100+ blocs premium designés", "Checkout et paiement intégrés", "Capture de leads automatique", "SEO et responsive natifs"].map((f) => (
                <div key={f} className="flex items-center gap-3">
                  <div className="w-1 h-1 rounded-full bg-[#7C3AED]" />
                  <span className="text-[13px] text-[#555] font-medium">{f}</span>
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
            <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED]/8 to-[#4F46E5]/3 rounded-3xl blur-3xl -z-10 scale-105" />
            <div className="bg-white rounded-2xl border border-black/[0.05] shadow-[0_16px_48px_-12px_rgba(0,0,0,0.06)] overflow-hidden">
              <div className="flex">
                <div className="w-40 border-r border-black/[0.03] bg-[#FAFAFA] p-2.5 space-y-1 flex-shrink-0">
                  <div className="text-[9px] font-bold text-[#AAA] uppercase tracking-wider px-1 mb-2">Blocs</div>
                  {["Hero", "Portfolio", "Services", "Checkout", "Contact", "Footer"].map((b, i) => (
                    <div key={b} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium ${
                      i === 1 ? "bg-[#7C3AED] text-white" : "text-[#777] hover:bg-white"
                    }`}>{b}</div>
                  ))}
                </div>
                <div className="flex-1 p-3 space-y-2 min-h-[280px] bg-[#FDFDFD]">
                  <div className="h-16 bg-gradient-to-r from-[#7C3AED]/6 to-[#4F46E5]/3 rounded-lg border border-[#7C3AED]/8 flex items-center justify-center">
                    <div className="h-2 w-20 bg-[#0A0A0A]/8 rounded" />
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="aspect-[4/3] bg-[#F5F5F5] rounded-lg border border-black/[0.02]" />
                    ))}
                  </div>
                  <div className="h-12 bg-[#F5F5F5] rounded-lg border border-black/[0.02]" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   OPS COCKPIT
   ═══════════════════════════════════════════════════════════════════════ */
function OpsSection() {
  const modules = [
    { title: "Pipeline", desc: "Kanban avec statuts custom", accent: "#4F46E5" },
    { title: "CRM", desc: "Historique et revenus par client", accent: "#7C3AED" },
    { title: "Analytics", desc: "Revenus, conversion, tendances", accent: "#0891B2" },
    { title: "Projets", desc: "Folders, fichiers, livraison", accent: "#059669" },
    { title: "Calendrier", desc: "Jour, semaine, mois", accent: "#D97706" },
    { title: "Facturation", desc: "Factures, exports, récurrence", accent: "#DC2626" },
  ];

  return (
    <section id="ops" className="py-28">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-[10px] font-bold text-[#0891B2] uppercase tracking-[0.25em] mb-3">Operations</p>
          <h2 className="text-[clamp(1.5rem,3.2vw,2.2rem)] font-extrabold text-[#0A0A0A]">Le cockpit de votre activité</h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {modules.map((m, i) => (
            <motion.div
              key={m.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group bg-white rounded-xl border border-black/[0.04] p-5 hover:shadow-lg hover:shadow-black/[0.03] hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-2 h-2 rounded-full transition-transform group-hover:scale-150" style={{ background: m.accent }} />
                <h3 className="text-[15px] font-bold text-[#0A0A0A]">{m.title}</h3>
              </div>
              <p className="text-[12px] text-[#999]">{m.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   PRICING
   ═══════════════════════════════════════════════════════════════════════ */
function PricingSection() {
  return (
    <section id="pricing" className="py-28">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-[clamp(1.5rem,3.2vw,2.2rem)] font-extrabold text-[#0A0A0A] mb-2">Un prix, pas une surprise</h2>
          <p className="text-[15px] text-[#999]">Commencez gratuitement. Passez au Pro quand c&apos;est le moment.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-4">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white rounded-2xl border border-black/[0.05] p-7">
            <div className="text-[11px] font-bold text-[#AAA] uppercase tracking-wider mb-1">Free</div>
            <div className="text-[34px] font-extrabold text-[#0A0A0A] mb-5">0<span className="text-[14px] text-[#CCC] font-semibold ml-1">€/mois</span></div>
            <div className="space-y-2 mb-6">
              {["1 site", "10 commandes/mois", "Blocs essentiels", "Dashboard"].map((f) => (
                <div key={f} className="flex items-center gap-2 text-[12px] text-[#666]">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#F3F3F3] flex items-center justify-center text-[8px] text-[#BBB]">✓</div>
                  {f}
                </div>
              ))}
            </div>
            <Link href="/login" className="block text-center text-[12px] font-semibold text-[#0A0A0A] border border-black/[0.08] py-2.5 rounded-xl hover:bg-[#F7F7F5] transition-colors">
              Démarrer
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.06 }} className="bg-[#0A0A0A] rounded-2xl p-7 relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-32 h-32 bg-[#4F46E5]/25 rounded-full blur-[50px]" />
            <div className="relative">
              <div className="text-[11px] font-bold text-[#4F46E5] uppercase tracking-wider mb-1">Pro</div>
              <div className="text-[34px] font-extrabold text-white mb-5">7<span className="text-[14px] text-[#666] font-semibold ml-1">€/mois</span></div>
              <div className="space-y-2 mb-6">
                {["Sites illimités", "Commandes illimitées", "100+ blocs premium", "Domaine custom", "Support prioritaire"].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-[12px] text-[#AAA]">
                    <div className="w-3.5 h-3.5 rounded-full bg-[#4F46E5]/20 flex items-center justify-center text-[8px] text-[#4F46E5]">✓</div>
                    {f}
                  </div>
                ))}
              </div>
              <Link href="/login" className="block text-center text-[12px] font-semibold text-white bg-[#4F46E5] py-2.5 rounded-xl hover:bg-[#4338CA] transition-colors shadow-lg shadow-[#4F46E5]/25">
                Passer au Pro
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   FINAL CTA — Manifesto closing scene
   ═══════════════════════════════════════════════════════════════════════ */
function FinalCTA() {
  return (
    <section className="py-32 relative">
      {/* Dense pixel field — signature moment */}
      <div className="absolute inset-0 opacity-[0.05]" style={{
        backgroundImage: "linear-gradient(#4F46E5 1px, transparent 1px), linear-gradient(90deg, #4F46E5 1px, transparent 1px)",
        backgroundSize: "20px 20px",
        maskImage: "radial-gradient(ellipse 60% 50% at 50% 50%, black 0%, transparent 70%)",
        WebkitMaskImage: "radial-gradient(ellipse 60% 50% at 50% 50%, black 0%, transparent 70%)",
      }} />

      <div className="max-w-3xl mx-auto px-6 text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease }}
        >
          <h2 className="text-[clamp(1.8rem,4.5vw,3rem)] font-extrabold text-[#0A0A0A] leading-[1.08] tracking-[-0.03em] mb-6">
            Construisez quelque chose
            <br />de sérieux.
          </h2>
          <p className="text-[16px] text-[#999] mb-10 max-w-md mx-auto">
            Le freelance OS pour ceux qui construisent un vrai business.
          </p>
          <Link
            href="/login"
            className="group inline-flex text-[15px] font-semibold text-white px-8 py-4 rounded-xl transition-all hover:-translate-y-0.5 relative overflow-hidden"
          >
            <span className="absolute inset-0 bg-[#0A0A0A]" />
            <span className="absolute inset-0 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <span className="relative z-10">Commencer gratuitement</span>
          </Link>
          <p className="text-[11px] text-[#CCC] mt-5">Gratuit pour toujours. Sans carte bancaire.</p>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════════════════════════════ */
function Footer() {
  return (
    <footer className="border-t border-black/[0.03] py-7">
      <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-[#0A0A0A] flex items-center justify-center">
            <span className="text-white text-[7px] font-black">J</span>
          </div>
          <span className="text-[11px] text-[#CCC]">© 2026 Jestly</span>
        </div>
        <div className="flex gap-5">
          {["Mentions légales", "CGV", "Contact"].map((l) => (
            <a key={l} href="#" className="text-[10px] text-[#CCC] hover:text-[#888] transition-colors">{l}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   PAGE ASSEMBLY
   ═══════════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  return (
    <>
      <PixelField />
      <Topbar />
      <main>
        <HeroScene />
        <ManifestoSection />
        <ChaosSystemSection />
        <SystemShowcase />
        <BuilderSection />
        <OpsSection />
        <PricingSection />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
