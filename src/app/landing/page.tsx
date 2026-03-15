"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import Link from "next/link";

// ═══════════════════════════════════════════════════════════════════════
// JESTLY — FREELANCE OPERATING SYSTEM
// Manifesto landing page — NOT a standard SaaS homepage
// ═══════════════════════════════════════════════════════════════════════

// ─── SCATTERED TOOLS (chaos state) ───
const SCATTERED_TOOLS = [
  { name: "Notion", x: 8, y: 12, rot: -6 },
  { name: "Stripe", x: 72, y: 8, rot: 4 },
  { name: "Trello", x: 18, y: 68, rot: -3 },
  { name: "Calendly", x: 78, y: 62, rot: 5 },
  { name: "Drive", x: 45, y: 82, rot: -2 },
  { name: "Gmail", x: 88, y: 35, rot: 3 },
  { name: "WordPress", x: 5, y: 40, rot: -5 },
  { name: "Excel", x: 62, y: 78, rot: 2 },
];

// ─── SYSTEM MODULES (order state) ───
const SYSTEM_MODULES = [
  { label: "Portfolio", desc: "Site qui convertit", icon: "◈" },
  { label: "Orders", desc: "Pipeline structuré", icon: "◇" },
  { label: "Clients", desc: "CRM intégré", icon: "○" },
  { label: "Revenue", desc: "Suivi temps réel", icon: "△" },
  { label: "Projects", desc: "Delivery maîtrisée", icon: "□" },
  { label: "Invoicing", desc: "Facturation auto", icon: "▽" },
];

// ─── LIVE EVENTS (floating cards) ───
const LIVE_EVENTS = [
  { text: "Nouveau lead capturé", badge: "Lead", color: "#4F46E5" },
  { text: "Commande payée — 490 €", badge: "Revenue", color: "#059669" },
  { text: "Projet livré", badge: "Delivery", color: "#7C3AED" },
  { text: "Site publié", badge: "Live", color: "#0891B2" },
];

// ═══════════════════════════════════════════════════════════════════════
// PIXEL FIELD — Living background system
// ═══════════════════════════════════════════════════════════════════════
function PixelField() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      <div className="absolute inset-0 bg-[#FAFAFA]" />

      {/* Primary grid — architectural */}
      <div className="absolute inset-0 opacity-[0.025]" style={{
        backgroundImage: "linear-gradient(#4F46E5 1px, transparent 1px), linear-gradient(90deg, #4F46E5 1px, transparent 1px)",
        backgroundSize: "80px 80px",
      }} />

      {/* Secondary micro grid — texture */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: "linear-gradient(#4F46E5 0.5px, transparent 0.5px), linear-gradient(90deg, #4F46E5 0.5px, transparent 0.5px)",
        backgroundSize: "20px 20px",
      }} />

      {/* Dense cluster — hero zone */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] opacity-[0.04]" style={{
        backgroundImage: "linear-gradient(#4F46E5 1px, transparent 1px), linear-gradient(90deg, #4F46E5 1px, transparent 1px)",
        backgroundSize: "16px 16px",
        maskImage: "radial-gradient(ellipse at center, black 0%, transparent 70%)",
        WebkitMaskImage: "radial-gradient(ellipse at center, black 0%, transparent 70%)",
      }} />

      {/* Radial glow — top */}
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[#4F46E5]/[0.03] rounded-full blur-[120px]" />

      {/* Radial glow — mid */}
      <div className="absolute top-[60%] right-0 w-[600px] h-[400px] bg-[#7C3AED]/[0.02] rounded-full blur-[100px]" />

      {/* Edge fade */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse 80% 60% at 50% 40%, transparent 0%, #FAFAFA 80%)",
      }} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// FLOATING TOPBAR — Premium glass object
// ═══════════════════════════════════════════════════════════════════════
function Topbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hoverIdx, setHoverIdx] = useState(-1);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const items = [
    { label: "Système", href: "#system" },
    { label: "Builder", href: "#builder" },
    { label: "Operations", href: "#ops" },
    { label: "Tarifs", href: "#pricing" },
  ];

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4"
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={`flex items-center justify-between w-full max-w-5xl px-5 h-14 rounded-2xl transition-all duration-500 ${
        scrolled
          ? "bg-white/75 backdrop-blur-2xl border border-black/[0.06] shadow-[0_2px_20px_-4px_rgba(0,0,0,0.06)]"
          : "bg-white/40 backdrop-blur-lg border border-black/[0.03]"
      }`}>
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-[#0A0A0A] flex items-center justify-center group-hover:scale-105 transition-transform">
            <span className="text-white text-[11px] font-black tracking-tight">J</span>
          </div>
          <span className="text-[15px] font-bold text-[#0A0A0A] tracking-tight">Jestly</span>
        </Link>

        {/* Nav items with hover tracker */}
        <nav className="hidden md:flex items-center gap-1 relative">
          {items.map((item, i) => (
            <a
              key={item.label}
              href={item.href}
              className="relative px-4 py-2 text-[13px] font-medium text-[#555] hover:text-[#0A0A0A] transition-colors z-10"
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(-1)}
            >
              {item.label}
            </a>
          ))}
          {/* Hover pill */}
          <AnimatePresence>
            {hoverIdx >= 0 && (
              <motion.div
                className="absolute top-1 h-[calc(100%-8px)] rounded-lg bg-black/[0.04]"
                layoutId="nav-hover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, left: `${hoverIdx * 96 + 4}px`, width: "88px" }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </AnimatePresence>
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-[13px] font-medium text-[#666] hover:text-[#0A0A0A] transition-colors hidden sm:block">
            Connexion
          </Link>
          <Link
            href="/login"
            className="text-[12px] font-semibold text-white bg-[#0A0A0A] px-4 py-2 rounded-xl hover:bg-[#222] transition-all hover:shadow-lg hover:shadow-black/10"
          >
            Démarrer
          </Link>
        </div>
      </div>
    </motion.header>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// HERO SCENE — Asymmetric manifesto + product constellation
// ═══════════════════════════════════════════════════════════════════════
function HeroScene() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.6], [1, 0.96]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden">
      <motion.div className="max-w-6xl mx-auto px-6 w-full" style={{ y, opacity, scale }}>
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">

          {/* LEFT — Manifesto text */}
          <div>
            {/* System badge */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="inline-flex items-center gap-2 mb-8"
            >
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0A0A0A] text-[11px] font-semibold text-white tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5] animate-pulse" />
                FREELANCE OS
              </span>
            </motion.div>

            {/* Title — signature typography */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="mb-7"
            >
              <h1 className="text-[clamp(2.4rem,5.5vw,4rem)] font-extrabold leading-[1.04] tracking-[-0.03em] text-[#0A0A0A]">
                Arrêtez de
                <br />
                <span className="relative inline-block">
                  bricoler
                  {/* Strike-through accent */}
                  <span className="absolute left-0 right-0 top-1/2 h-[3px] bg-[#4F46E5]/60 -rotate-1" />
                </span>
                {" "}votre
                <br />
                business freelance.
              </h1>
            </motion.div>

            {/* Sub-headline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.6 }}
              className="text-[clamp(1rem,1.8vw,1.15rem)] text-[#666] max-w-md leading-relaxed mb-10"
            >
              Jestly centralise votre site, vos ventes, vos clients et votre delivery
              dans un seul système structuré. Fini les 10 outils éparpillés.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="flex items-center gap-4"
            >
              <Link
                href="/login"
                className="group relative text-[14px] font-semibold text-white bg-[#4F46E5] px-7 py-3.5 rounded-xl overflow-hidden transition-all shadow-[0_4px_20px_-4px_rgba(79,70,229,0.4)] hover:shadow-[0_8px_30px_-4px_rgba(79,70,229,0.5)] hover:-translate-y-0.5"
              >
                <span className="relative z-10">Commencer gratuitement</span>
                <span className="absolute inset-0 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <a href="#system" className="text-[14px] font-semibold text-[#888] hover:text-[#0A0A0A] transition-colors">
                Découvrir le système →
              </a>
            </motion.div>
          </div>

          {/* RIGHT — Product constellation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative hidden lg:block"
          >
            {/* Central product frame */}
            <div className="relative bg-white rounded-2xl border border-black/[0.06] shadow-[0_8px_40px_-8px_rgba(0,0,0,0.08)] overflow-hidden">
              {/* Mini browser chrome */}
              <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[#FAFAFA] border-b border-black/[0.04]">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
                </div>
                <div className="flex-1 bg-white rounded-md px-3 py-1 text-[10px] text-[#BBB] text-center border border-black/[0.03] ml-2">
                  jestly.fr/dashboard
                </div>
              </div>
              {/* Dashboard abstraction */}
              <div className="p-5 bg-[#FAFAFA] min-h-[340px]">
                <div className="flex gap-3">
                  {/* Sidebar */}
                  <div className="w-10 bg-white rounded-xl flex flex-col items-center gap-2.5 py-3 border border-black/[0.04] flex-shrink-0">
                    <div className="w-5 h-5 rounded-md bg-[#4F46E5]" />
                    {[0, 1, 2, 3, 4].map((i) => <div key={i} className="w-5 h-5 rounded-md bg-[#F3F3F3]" />)}
                  </div>
                  {/* Content */}
                  <div className="flex-1 space-y-3">
                    {/* KPI row */}
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { v: "3 170 €", l: "Revenus", c: "#4F46E5" },
                        { v: "42", l: "Commandes", c: "#0891B2" },
                        { v: "18", l: "Clients", c: "#7C3AED" },
                        { v: "89%", l: "Conversion", c: "#059669" },
                      ].map((kpi) => (
                        <div key={kpi.l} className="bg-white rounded-lg p-2.5 border border-black/[0.04]">
                          <div className="text-[9px] text-[#999] mb-1">{kpi.l}</div>
                          <div className="text-[14px] font-bold" style={{ color: kpi.c }}>{kpi.v}</div>
                        </div>
                      ))}
                    </div>
                    {/* Chart */}
                    <div className="bg-white rounded-lg p-4 border border-black/[0.04]">
                      <div className="h-1.5 w-16 bg-[#E6E6E4] rounded mb-4" />
                      <div className="flex items-end gap-1.5 h-24">
                        {[35, 55, 42, 68, 50, 78, 62, 85, 55, 92, 70, 82].map((h, i) => (
                          <motion.div
                            key={i}
                            className="flex-1 rounded-t"
                            style={{ background: i >= 9 ? "#4F46E5" : "#EEF2FF" }}
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            transition={{ delay: 0.8 + i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating event cards — constellation */}
            {LIVE_EVENTS.map((ev, i) => {
              const positions = [
                { top: "-16px", right: "-20px" },
                { bottom: "60px", left: "-30px" },
                { top: "80px", right: "-40px" },
                { bottom: "-10px", right: "40px" },
              ];
              const pos = positions[i];
              return (
                <motion.div
                  key={ev.text}
                  className="absolute bg-white rounded-xl border border-black/[0.06] shadow-lg shadow-black/[0.04] px-3.5 py-2.5 flex items-center gap-2.5 z-10"
                  style={pos}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 + i * 0.15, duration: 0.5 }}
                >
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md text-white" style={{ background: ev.color }}>
                    {ev.badge}
                  </span>
                  <span className="text-[11px] font-medium text-[#444] whitespace-nowrap">{ev.text}</span>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MANIFESTO — "Freelancers don't need more tools."
// ═══════════════════════════════════════════════════════════════════════
function ManifestoSection() {
  return (
    <section className="py-32 relative">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-6"
        >
          <p className="text-[11px] font-bold text-[#4F46E5] uppercase tracking-[0.2em]">Manifeste</p>
          <h2 className="text-[clamp(1.6rem,4vw,2.8rem)] font-extrabold leading-[1.15] tracking-tight text-[#0A0A0A]">
            Les freelances n&apos;ont pas besoin
            <br />
            d&apos;un outil de plus.
            <br />
            <span className="text-[#999]">Ils ont besoin d&apos;un système.</span>
          </h2>
          <p className="text-[17px] text-[#888] max-w-2xl leading-relaxed">
            Votre business ne devrait pas être dispersé entre des onglets, des docs, des DMs et des dashboards.
            Jestly transforme le travail freelance en couche opérationnelle structurée.
            Du portfolio au paiement, de la livraison à la facturation — un centre propre.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// CHAOS → SYSTEM — Tool absorption choreography
// ═══════════════════════════════════════════════════════════════════════
function ChaosToSystemSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const progress = useTransform(scrollYProgress, [0.2, 0.7], [0, 1]);

  return (
    <section id="system" ref={ref} className="py-28 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-[11px] font-bold text-[#4F46E5] uppercase tracking-[0.2em] mb-3">Architecture</p>
          <h2 className="text-[clamp(1.6rem,3.5vw,2.4rem)] font-extrabold text-[#0A0A0A] mb-4">
            Du chaos dispersé au système centralisé
          </h2>
        </motion.div>

        {/* Two states */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* BEFORE — Scattered */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative h-80 rounded-2xl border border-red-200/50 bg-gradient-to-br from-red-50/30 to-transparent p-6 overflow-hidden"
          >
            <div className="text-[11px] font-bold text-red-400 uppercase tracking-wider mb-2">Avant</div>
            <div className="text-[15px] font-semibold text-[#0A0A0A] mb-6">8 outils, 8 onglets, 0 structure</div>
            {SCATTERED_TOOLS.map((tool, i) => (
              <motion.div
                key={tool.name}
                className="absolute px-3 py-1.5 bg-white rounded-lg border border-black/[0.06] shadow-sm text-[11px] font-medium text-[#666]"
                style={{ left: `${tool.x}%`, top: `${tool.y}%`, rotate: tool.rot }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 0.7 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.06 }}
              >
                {tool.name}
              </motion.div>
            ))}
          </motion.div>

          {/* AFTER — Structured */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative h-80 rounded-2xl border border-[#4F46E5]/20 bg-gradient-to-br from-[#4F46E5]/[0.03] to-transparent p-6"
          >
            <div className="text-[11px] font-bold text-[#4F46E5] uppercase tracking-wider mb-2">Après</div>
            <div className="text-[15px] font-semibold text-[#0A0A0A] mb-6">1 système, tout connecté</div>
            {/* Central node */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-2xl bg-[#0A0A0A] flex items-center justify-center shadow-xl shadow-black/20 z-10">
              <span className="text-white text-[14px] font-black">J</span>
            </div>
            {/* Orbiting modules */}
            {SYSTEM_MODULES.map((mod, i) => {
              const angle = (i * 60 - 90) * (Math.PI / 180);
              const radius = 100;
              const x = Math.cos(angle) * radius;
              const yPos = Math.sin(angle) * radius;
              return (
                <motion.div
                  key={mod.label}
                  className="absolute px-2.5 py-1.5 bg-white rounded-lg border border-[#4F46E5]/10 shadow-sm"
                  style={{
                    left: `calc(50% + ${x}px - 32px)`,
                    top: `calc(50% + ${yPos}px - 14px)`,
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                >
                  <div className="text-[10px] font-semibold text-[#4F46E5]">{mod.label}</div>
                  <div className="text-[8px] text-[#999]">{mod.desc}</div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// BUILDER — Portfolio machine
// ═══════════════════════════════════════════════════════════════════════
function BuilderSection() {
  return (
    <section id="builder" className="py-28 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          {/* Visual — Builder frame */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative order-2 lg:order-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED]/10 to-[#4F46E5]/5 rounded-3xl blur-3xl -z-10" />
            <div className="bg-white rounded-2xl border border-black/[0.06] shadow-[0_12px_40px_-8px_rgba(0,0,0,0.06)] overflow-hidden">
              <div className="flex">
                {/* Blocks sidebar */}
                <div className="w-44 border-r border-black/[0.04] bg-[#FAFAFA] p-3 space-y-1.5">
                  <div className="text-[10px] font-semibold text-[#999] uppercase tracking-wider mb-2 px-1">Blocs</div>
                  {["Hero premium", "Portfolio grid", "Services cards", "Checkout inline", "Contact form", "Footer"].map((b, i) => (
                    <div
                      key={b}
                      className={`px-3 py-2 rounded-lg text-[11px] font-medium transition-colors ${
                        i === 1
                          ? "bg-[#4F46E5] text-white shadow-sm shadow-[#4F46E5]/20"
                          : "text-[#666] hover:bg-white hover:border-black/[0.04]"
                      }`}
                    >
                      {b}
                    </div>
                  ))}
                </div>
                {/* Canvas */}
                <div className="flex-1 p-4 space-y-2.5 min-h-[320px] bg-[#FDFDFD]">
                  <div className="h-20 bg-gradient-to-r from-[#4F46E5]/8 to-[#7C3AED]/5 rounded-xl flex items-center justify-center border border-[#4F46E5]/10">
                    <div className="text-center">
                      <div className="h-2.5 w-24 bg-[#0A0A0A]/12 rounded mx-auto mb-1.5" />
                      <div className="h-1.5 w-32 bg-[#0A0A0A]/6 rounded mx-auto" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="aspect-[4/3] bg-[#F3F3F3] rounded-lg border border-black/[0.03] hover:border-[#4F46E5]/20 transition-colors" />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 h-14 bg-[#F5F5F5] rounded-xl border border-black/[0.03]" />
                    <div className="w-24 h-14 bg-[#4F46E5]/8 rounded-xl border border-[#4F46E5]/10 flex items-center justify-center">
                      <div className="h-2 w-12 bg-[#4F46E5]/30 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-1 lg:order-2"
          >
            <p className="text-[11px] font-bold text-[#7C3AED] uppercase tracking-[0.2em] mb-3">Builder</p>
            <h2 className="text-[clamp(1.6rem,3.5vw,2.4rem)] font-extrabold text-[#0A0A0A] leading-tight mb-5">
              Votre site n&apos;est pas une vitrine.
              <br />
              <span className="text-[#999]">C&apos;est une machine à convertir.</span>
            </h2>
            <p className="text-[16px] text-[#666] leading-relaxed mb-8">
              100+ blocs premium. Checkout intégré. Formulaires de brief. Templates par métier.
              Publiez un site qui ne se contente pas d&apos;exister — il vend.
            </p>
            <div className="space-y-3">
              {["100+ blocs designés", "Checkout et paiement intégrés", "Capture de leads automatique", "SEO et mobile optimisés", "Publication en un clic"].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#4F46E5]" />
                  <span className="text-[13px] text-[#444] font-medium">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// BUSINESS OPS — Cockpit
// ═══════════════════════════════════════════════════════════════════════
function OpsSection() {
  return (
    <section id="ops" className="py-28 relative">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-[11px] font-bold text-[#0891B2] uppercase tracking-[0.2em] mb-3">Operations</p>
          <h2 className="text-[clamp(1.6rem,3.5vw,2.4rem)] font-extrabold text-[#0A0A0A] mb-4">
            Un cockpit pour piloter votre activité
          </h2>
          <p className="text-[16px] text-[#888] max-w-xl mx-auto">
            Commandes, clients, projets, tâches, facturation — tout dans un espace que vous maîtrisez.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: "Pipeline", desc: "Kanban commandes avec statuts custom", accent: "#4F46E5", icon: "▣" },
            { title: "CRM", desc: "Historique, revenus, projets par client", accent: "#7C3AED", icon: "◉" },
            { title: "Analytics", desc: "Revenus, conversion, tendances", accent: "#0891B2", icon: "◈" },
            { title: "Projets", desc: "Folders, fichiers, livraison", accent: "#059669", icon: "◇" },
            { title: "Calendrier", desc: "Vue jour, semaine, mois", accent: "#D97706", icon: "⬡" },
            { title: "Facturation", desc: "Factures, exports, récurrence", accent: "#DC2626", icon: "▢" },
          ].map((mod, i) => (
            <motion.div
              key={mod.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="group bg-white rounded-xl border border-black/[0.04] p-6 hover:shadow-lg hover:shadow-black/[0.03] hover:-translate-y-1 transition-all duration-300 cursor-default"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[18px]" style={{ background: `${mod.accent}10`, color: mod.accent }}>
                  {mod.icon}
                </div>
                <div className="w-1.5 h-1.5 rounded-full group-hover:scale-150 transition-transform" style={{ background: mod.accent }} />
              </div>
              <h3 className="text-[16px] font-bold text-[#0A0A0A] mb-1">{mod.title}</h3>
              <p className="text-[13px] text-[#888]">{mod.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// PRICING
// ═══════════════════════════════════════════════════════════════════════
function PricingSection() {
  return (
    <section id="pricing" className="py-28 relative">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-[clamp(1.6rem,3.5vw,2.4rem)] font-extrabold text-[#0A0A0A] mb-3">Un prix, pas une surprise</h2>
          <p className="text-[16px] text-[#888]">Commencez gratuitement. Passez au Pro quand c&apos;est le bon moment.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Free */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl border border-black/[0.06] p-7"
          >
            <div className="text-[12px] font-bold text-[#999] uppercase tracking-wider mb-1">Free</div>
            <div className="text-[36px] font-extrabold text-[#0A0A0A] mb-5">0 <span className="text-[16px] text-[#CCC] font-semibold">€/mois</span></div>
            <div className="space-y-2.5 mb-7">
              {["1 site publié", "10 commandes/mois", "Blocs essentiels", "Dashboard & analytics"].map((f) => (
                <div key={f} className="flex items-center gap-2.5 text-[13px] text-[#555]">
                  <span className="w-4 h-4 rounded-full bg-[#F3F3F3] flex items-center justify-center text-[9px] text-[#999]">✓</span>
                  {f}
                </div>
              ))}
            </div>
            <Link href="/login" className="block text-center text-[13px] font-semibold text-[#0A0A0A] border border-black/[0.1] px-5 py-3 rounded-xl hover:bg-[#F7F7F5] transition-colors">
              Démarrer gratuitement
            </Link>
          </motion.div>

          {/* Pro */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="bg-[#0A0A0A] rounded-2xl p-7 relative overflow-hidden"
          >
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#4F46E5]/30 rounded-full blur-[60px]" />
            <div className="relative">
              <div className="text-[12px] font-bold text-[#4F46E5] uppercase tracking-wider mb-1">Pro</div>
              <div className="text-[36px] font-extrabold text-white mb-5">7 <span className="text-[16px] text-[#666] font-semibold">€/mois</span></div>
              <div className="space-y-2.5 mb-7">
                {["Sites illimités", "Commandes illimitées", "100+ blocs premium", "Domaine personnalisé", "Support prioritaire"].map((f) => (
                  <div key={f} className="flex items-center gap-2.5 text-[13px] text-[#AAA]">
                    <span className="w-4 h-4 rounded-full bg-[#4F46E5]/20 flex items-center justify-center text-[9px] text-[#4F46E5]">✓</span>
                    {f}
                  </div>
                ))}
              </div>
              <Link href="/login" className="block text-center text-[13px] font-semibold text-white bg-[#4F46E5] px-5 py-3 rounded-xl hover:bg-[#4338CA] transition-colors shadow-lg shadow-[#4F46E5]/30">
                Passer au Pro
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// FINAL CTA — Manifesto closing
// ═══════════════════════════════════════════════════════════════════════
function FinalCTA() {
  return (
    <section className="py-32 relative">
      {/* Dense pixel field for final emphasis */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: "linear-gradient(#4F46E5 1px, transparent 1px), linear-gradient(90deg, #4F46E5 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        maskImage: "radial-gradient(ellipse at center, black 0%, transparent 60%)",
        WebkitMaskImage: "radial-gradient(ellipse at center, black 0%, transparent 60%)",
      }} />

      <div className="max-w-3xl mx-auto px-6 text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-[clamp(1.8rem,4.5vw,3rem)] font-extrabold text-[#0A0A0A] leading-[1.1] tracking-tight mb-6">
            Arrêtez d&apos;improviser
            <br />
            votre infrastructure.
          </h2>
          <p className="text-[17px] text-[#888] mb-10 max-w-md mx-auto">
            Construisez le site que vos clients voient. Opérez le système qu&apos;ils ne voient pas.
          </p>
          <Link
            href="/login"
            className="group inline-flex text-[15px] font-semibold text-white bg-[#0A0A0A] px-8 py-4 rounded-xl transition-all hover:shadow-xl hover:shadow-black/10 hover:-translate-y-0.5 relative overflow-hidden"
          >
            <span className="relative z-10">Commencer gratuitement</span>
            <span className="absolute inset-0 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </Link>
          <p className="text-[12px] text-[#CCC] mt-4">Gratuit pour toujours. Sans carte bancaire.</p>
        </motion.div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// FOOTER
// ═══════════════════════════════════════════════════════════════════════
function Footer() {
  return (
    <footer className="border-t border-black/[0.04] py-8">
      <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-md bg-[#0A0A0A] flex items-center justify-center">
            <span className="text-white text-[8px] font-black">J</span>
          </div>
          <span className="text-[12px] text-[#BBB]">© 2026 Jestly — Le système des freelances modernes.</span>
        </div>
        <div className="flex gap-5">
          {["Mentions légales", "CGV", "Contact"].map((l) => (
            <a key={l} href="#" className="text-[11px] text-[#BBB] hover:text-[#666] transition-colors">{l}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// PAGE ASSEMBLY
// ═══════════════════════════════════════════════════════════════════════
export default function LandingPage() {
  return (
    <>
      <PixelField />
      <Topbar />
      <main>
        <HeroScene />
        <ManifestoSection />
        <ChaosToSystemSection />
        <BuilderSection />
        <OpsSection />
        <PricingSection />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
