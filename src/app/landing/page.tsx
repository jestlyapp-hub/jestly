"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════════════════════
   JESTLY V4 — THE FREELANCE OPERATING SYSTEM
   ═══════════════════════════════════════════════════════════════════════ */

const ease = [0.22, 1, 0.36, 1] as const;

const ORBIT_EVENTS = [
  { text: "Lead capturé", badge: "Lead", color: "#6A5CFF", x: -280, y: -60 },
  { text: "Commande payée — 490 €", badge: "Revenue", color: "#10B981", x: 240, y: -40 },
  { text: "Projet livré", badge: "Delivery", color: "#8B5CF6", x: -260, y: 80 },
  { text: "Site publié", badge: "Live", color: "#0EA5E9", x: 260, y: 60 },
  { text: "Facture envoyée", badge: "Invoice", color: "#F59E0B", x: -180, y: 140 },
  { text: "Client qualifié", badge: "CRM", color: "#EC4899", x: 200, y: 130 },
];

const CHAOS_TOOLS = [
  { name: "Notion", x: 5, y: 38, r: -8 },
  { name: "Stripe", x: 68, y: 28, r: 5 },
  { name: "Trello", x: 15, y: 65, r: -4 },
  { name: "Calendly", x: 72, y: 60, r: 6 },
  { name: "Drive", x: 40, y: 80, r: -2 },
  { name: "Gmail", x: 82, y: 42, r: 3 },
  { name: "WordPress", x: 8, y: 82, r: -6 },
  { name: "Sheets", x: 55, y: 72, r: 4 },
  { name: "Mailchimp", x: 30, y: 40, r: -3 },
  { name: "Airtable", x: 60, y: 45, r: 2 },
];

const LAYERS = [
  { n: "01", label: "Présenter", desc: "Site portfolio + 100 blocs premium + publication 1-clic", color: "#8B5CF6" },
  { n: "02", label: "Vendre", desc: "Checkout intégré, briefs clients, offres packagées", color: "#6A5CFF" },
  { n: "03", label: "Livrer", desc: "Projets, tâches, calendrier, fichiers, deadline", color: "#0EA5E9" },
  { n: "04", label: "Facturer", desc: "Factures, exports, récurrence, clôtures", color: "#10B981" },
  { n: "05", label: "Piloter", desc: "Dashboard, analytics, KPIs, tendances, vision", color: "#F59E0B" },
];

/* ═══════════════════════════════════════════════════════════════════════
   PIXEL SYSTEM BACKGROUND
   ═══════════════════════════════════════════════════════════════════════ */
function PixelSystem() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none" aria-hidden>
      <div className="absolute inset-0 bg-[#FAFAFA]" />

      {/* Grid L1 — architecture 80px */}
      <div className="absolute inset-0" style={{
        backgroundImage: "linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)",
        backgroundSize: "80px 80px",
      }} />

      {/* Grid L2 — micro 16px */}
      <div className="absolute inset-0" style={{
        backgroundImage: "linear-gradient(rgba(0,0,0,0.015) 0.5px, transparent 0.5px), linear-gradient(90deg, rgba(0,0,0,0.015) 0.5px, transparent 0.5px)",
        backgroundSize: "16px 16px",
      }} />

      {/* Dense cluster — hero zone */}
      <div className="absolute top-0 left-[15%] w-[70%] h-[60%]" style={{
        backgroundImage: "linear-gradient(rgba(106,92,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(106,92,255,0.04) 1px, transparent 1px)",
        backgroundSize: "10px 10px",
        maskImage: "radial-gradient(ellipse 90% 70% at 50% 35%, black 0%, transparent 65%)",
        WebkitMaskImage: "radial-gradient(ellipse 90% 70% at 50% 35%, black 0%, transparent 65%)",
      }} />

      {/* Glow — top center */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full blur-[140px]" style={{ background: "rgba(106,92,255,0.04)" }} />
      {/* Glow — right */}
      <div className="absolute top-[45%] right-[-8%] w-[400px] h-[400px] rounded-full blur-[120px]" style={{ background: "rgba(75,124,255,0.025)" }} />

      {/* Vignette */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 65% 50% at 50% 30%, transparent 0%, #FAFAFA 80%)" }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   TOPBAR — Floating system module (XMind-inspired, Jestly premium)
   ═══════════════════════════════════════════════════════════════════════ */
function Topbar() {
  const [scrolled, setScrolled] = useState(false);
  const hoverX = useMotionValue(0);
  const hoverW = useMotionValue(0);
  const hoverO = useMotionValue(0);
  const sX = useSpring(hoverX, { stiffness: 500, damping: 35 });
  const sW = useSpring(hoverW, { stiffness: 500, damping: 35 });
  const sO = useSpring(hoverO, { stiffness: 400, damping: 30 });
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const onHover = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!navRef.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    const n = navRef.current.getBoundingClientRect();
    hoverX.set(r.left - n.left);
    hoverW.set(r.width);
    hoverO.set(1);
  }, [hoverX, hoverW, hoverO]);

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-5"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.9, ease }}
    >
      <div
        className={`flex items-center justify-between w-full transition-all duration-500 ${
          scrolled ? "shadow-[0_10px_40px_rgba(0,0,0,0.06)]" : "shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
        }`}
        style={{
          maxWidth: 1100,
          padding: "12px 18px",
          borderRadius: 18,
          background: scrolled ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.65)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-[30px] h-[30px] rounded-[10px] bg-[#111] flex items-center justify-center group-hover:scale-105 transition-transform">
            <span className="text-white text-[11px] font-black">J</span>
          </div>
          <span className="text-[15px] font-semibold text-[#111] tracking-[-0.01em]">Jestly</span>
        </Link>

        {/* Center nav */}
        <nav ref={navRef} className="hidden md:flex items-center relative">
          <motion.div
            className="absolute top-0 h-full rounded-[10px]"
            style={{ x: sX, width: sW, opacity: sO, background: "rgba(0,0,0,0.04)" }}
          />
          {["Système", "Builder", "Operations", "Tarifs"].map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase()}`}
              className="relative z-10 px-4 py-2 text-[13px] font-medium text-[#111] hover:text-black transition-colors"
              onMouseEnter={onHover}
              onMouseLeave={() => hoverO.set(0)}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Right — CTAs */}
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-[13px] font-medium text-[#555] hover:text-[#111] transition-colors hidden sm:block">
            Connexion
          </Link>
          <Link
            href="/login"
            className="text-[12px] font-semibold text-white px-[18px] py-[10px] rounded-[12px] transition-all hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(135deg, #6A5CFF 0%, #4B7CFF 100%)",
              boxShadow: "0 8px 30px rgba(90,100,255,0.35)",
            }}
          >
            Démarrer
          </Link>
        </div>
      </div>
    </motion.header>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   HERO — System nucleus + orbiting events + giant statement
   ═══════════════════════════════════════════════════════════════════════ */
function HeroScene() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-[100vh] flex flex-col items-center justify-center pt-28 pb-20 overflow-hidden">
      <motion.div className="w-full max-w-6xl mx-auto px-6" style={{ y, opacity }}>

        {/* ─── GIANT STATEMENT ─── */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111] mb-10"
          >
            <span className="w-[6px] h-[6px] rounded-full bg-[#6A5CFF] animate-pulse" />
            <span className="text-[10px] font-bold text-white/90 tracking-[0.18em] uppercase">Freelance Operating System</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.9, ease }}
            className="text-[clamp(3rem,8vw,7rem)] font-extrabold leading-[0.92] tracking-[-0.05em] text-[#0A0A0A]"
          >
            <span className="block">Arrêtez de</span>
            <span className="block relative">
              <span className="relative">
                bricoler
                {/* Pixelated strike */}
                <span className="absolute bottom-[15%] left-0 right-0 h-[6px]" style={{
                  background: "linear-gradient(135deg, #6A5CFF, #4B7CFF)",
                  opacity: 0.25,
                  maskImage: "repeating-linear-gradient(90deg, black 0px, black 4px, transparent 4px, transparent 6px)",
                  WebkitMaskImage: "repeating-linear-gradient(90deg, black 0px, black 4px, transparent 4px, transparent 6px)",
                }} />
              </span>
            </span>
            <span className="block bg-gradient-to-r from-[#CCC] to-[#DDD] bg-clip-text text-transparent">votre business.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.6 }}
            className="text-[clamp(0.95rem,1.5vw,1.1rem)] text-[#888] max-w-md mx-auto mt-8 leading-relaxed"
          >
            Site, ventes, clients, projets, facturation — un seul système
            au lieu de 10 onglets.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex items-center justify-center gap-4 mt-10"
          >
            <Link
              href="/login"
              className="group relative text-[14px] font-semibold text-white px-7 py-3.5 rounded-[14px] overflow-hidden transition-all hover:-translate-y-0.5"
              style={{ boxShadow: "0 8px 30px rgba(90,100,255,0.35)" }}
            >
              <span className="absolute inset-0" style={{ background: "linear-gradient(135deg, #6A5CFF 0%, #4B7CFF 100%)" }} />
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: "linear-gradient(135deg, #4B7CFF 0%, #6A5CFF 100%)" }} />
              <span className="relative z-10">Démarrer gratuitement</span>
            </Link>
            <a href="#système" className="text-[13px] font-medium text-[#999] hover:text-[#111] transition-colors">
              Explorer le système →
            </a>
          </motion.div>
        </div>

        {/* ─── SYSTEM NUCLEUS — Dashboard + orbit ─── */}
        <motion.div
          className="relative mx-auto max-w-[700px]"
          initial={{ opacity: 0, scale: 0.8, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 1, ease }}
        >
          {/* Orbital rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[560px] h-[380px] rounded-[50%] border border-black/[0.03] hidden lg:block" />
            <div className="absolute w-[700px] h-[480px] rounded-[50%] border border-black/[0.02] hidden lg:block" />
          </div>

          {/* Dashboard frame */}
          <div className="relative z-10 bg-white rounded-[20px] border border-black/[0.06] overflow-hidden" style={{
            boxShadow: "0 24px 80px -16px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.02)",
          }}>
            {/* Chrome */}
            <div className="flex items-center gap-2 px-5 py-3 bg-[#FAFAFA] border-b border-black/[0.04]">
              <div className="flex gap-[6px]">
                <div className="w-[10px] h-[10px] rounded-full bg-[#FF5F57]" />
                <div className="w-[10px] h-[10px] rounded-full bg-[#FEBC2E]" />
                <div className="w-[10px] h-[10px] rounded-full bg-[#28C840]" />
              </div>
              <div className="flex-1 bg-white rounded-[8px] px-4 py-[5px] text-[10px] text-[#CCC] text-center border border-black/[0.03] ml-3 font-mono tracking-wide">
                jestly.fr / dashboard
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-[6px] h-[6px] rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">Live</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 bg-[#FAFAFA]">
              <div className="flex gap-3">
                {/* Sidebar */}
                <div className="w-10 bg-white rounded-xl flex flex-col items-center gap-2 py-3 border border-black/[0.03] flex-shrink-0 hidden sm:flex">
                  <div className="w-5 h-5 rounded-[6px]" style={{ background: "linear-gradient(135deg, #6A5CFF, #4B7CFF)" }} />
                  {[0, 1, 2, 3, 4].map((i) => <div key={i} className="w-5 h-5 rounded-[6px] bg-[#F0F0F0]" />)}
                </div>
                <div className="flex-1 space-y-3">
                  {/* KPIs */}
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { v: "3.2k €", l: "Revenus", c: "#6A5CFF" },
                      { v: "42", l: "Commandes", c: "#0EA5E9" },
                      { v: "18", l: "Clients", c: "#8B5CF6" },
                      { v: "89%", l: "Conversion", c: "#10B981" },
                    ].map((k) => (
                      <div key={k.l} className="bg-white rounded-[10px] p-2.5 border border-black/[0.03]">
                        <div className="text-[8px] text-[#BBB] mb-0.5">{k.l}</div>
                        <div className="text-[14px] font-bold" style={{ color: k.c }}>{k.v}</div>
                      </div>
                    ))}
                  </div>
                  {/* Chart */}
                  <div className="bg-white rounded-[10px] p-4 border border-black/[0.03]">
                    <div className="flex items-end gap-[3px] h-24">
                      {[28, 48, 35, 62, 42, 70, 52, 78, 58, 88, 65, 82].map((h, i) => (
                        <motion.div
                          key={i}
                          className="flex-1 rounded-t-[3px]"
                          style={{ background: i >= 9 ? "linear-gradient(to top, #6A5CFF, #4B7CFF)" : i >= 7 ? "#C4B5FD" : "#EDE9FE" }}
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ delay: 1.2 + i * 0.04, duration: 0.6, ease }}
                        />
                      ))}
                    </div>
                  </div>
                  {/* Mini table */}
                  <div className="bg-white rounded-[10px] p-3 border border-black/[0.03] space-y-1.5">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-[#F5F5F5]" />
                        <div className="flex-1 h-[6px] bg-[#F7F7F5] rounded" />
                        <div className="h-[6px] w-8 bg-[#EDE9FE] rounded" />
                        <div className="h-5 w-12 rounded-md bg-[#F5F5F5]" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── ORBITING EVENT CARDS ─── */}
          {ORBIT_EVENTS.map((ev, i) => (
            <motion.div
              key={ev.text}
              className="absolute hidden lg:flex items-center gap-2 px-3 py-2 bg-white/95 backdrop-blur-sm rounded-[12px] border border-black/[0.05] z-20"
              style={{
                left: `calc(50% + ${ev.x}px)`,
                top: `calc(50% + ${ev.y}px)`,
                boxShadow: "0 4px 16px -2px rgba(0,0,0,0.06)",
              }}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.5 + i * 0.12, duration: 0.5, ease }}
            >
              <span className="text-[8px] font-bold px-1.5 py-[2px] rounded-[5px] text-white uppercase tracking-wider" style={{ background: ev.color }}>
                {ev.badge}
              </span>
              <span className="text-[10px] font-medium text-[#444] whitespace-nowrap">{ev.text}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MANIFESTO
   ═══════════════════════════════════════════════════════════════════════ */
function Manifesto() {
  return (
    <section className="py-36">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, ease }}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-6" style={{ color: "#6A5CFF" }}>Manifeste</p>
          <h2 className="text-[clamp(1.8rem,4.5vw,3.2rem)] font-extrabold leading-[1.08] tracking-[-0.03em] text-[#0A0A0A] mb-8">
            Les freelances n&apos;ont pas besoin
            <br />d&apos;un outil de plus.
            <br /><span className="text-[#D4D4D4]">Ils ont besoin d&apos;un système.</span>
          </h2>
          <div className="w-10 h-[2px] mb-8" style={{ background: "linear-gradient(90deg, #6A5CFF, #4B7CFF)" }} />
          <p className="text-[17px] text-[#AAA] leading-[1.8] max-w-xl">
            Votre business ne devrait pas vivre entre des onglets, des docs, des DMs et des spreadsheets.
            Jestly est la couche centrale qui transforme le chaos freelance en système structuré.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   CHAOS → SYSTEM
   ═══════════════════════════════════════════════════════════════════════ */
function ChaosSection() {
  return (
    <section id="système" className="py-28 overflow-hidden">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div className="text-center mb-20" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-[clamp(1.5rem,3.5vw,2.4rem)] font-extrabold text-[#0A0A0A]">
            10 outils dispersés → 1 système
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* BEFORE */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative h-[360px] rounded-[20px] border border-red-100/60 p-7 overflow-hidden"
            style={{ background: "linear-gradient(135deg, rgba(254,226,226,0.3), transparent)" }}
          >
            <div className="text-[9px] font-bold text-red-400/70 uppercase tracking-[0.25em] mb-1">Avant Jestly</div>
            <div className="text-[18px] font-bold text-[#0A0A0A] mb-1">Le bricolage</div>
            <div className="text-[12px] text-[#BBB]">Chaque tâche dans un outil différent.</div>

            {CHAOS_TOOLS.map((t, i) => (
              <motion.div
                key={t.name}
                className="absolute px-2 py-1 bg-white rounded-[8px] border border-black/[0.05] text-[9px] font-medium text-[#888]"
                style={{ left: `${t.x}%`, top: `${t.y}%`, rotate: t.r, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 0.55 + (i % 3) * 0.15 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
              >
                {t.name}
              </motion.div>
            ))}
          </motion.div>

          {/* AFTER */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative h-[360px] rounded-[20px] border p-7"
            style={{ borderColor: "rgba(106,92,255,0.12)", background: "linear-gradient(135deg, rgba(106,92,255,0.03), transparent)" }}
          >
            <div className="text-[9px] font-bold uppercase tracking-[0.25em] mb-1" style={{ color: "#6A5CFF" }}>Avec Jestly</div>
            <div className="text-[18px] font-bold text-[#0A0A0A] mb-1">Le système</div>
            <div className="text-[12px] text-[#BBB]">Un noyau central, tout connecté.</div>

            {/* Nucleus */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[20%]">
              <div className="absolute -inset-16 rounded-full" style={{ border: "1px solid rgba(106,92,255,0.06)" }} />
              <div className="absolute -inset-28 rounded-full" style={{ border: "1px solid rgba(106,92,255,0.03)" }} />
              <motion.div
                className="relative w-16 h-16 rounded-[18px] bg-[#111] flex items-center justify-center z-10"
                style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.2)" }}
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              >
                <span className="text-white text-[18px] font-black">J</span>
              </motion.div>

              {/* Module nodes */}
              {[
                { icon: "◈", a: -60 }, { icon: "◇", a: 0 }, { icon: "○", a: 60 },
                { icon: "△", a: 120 }, { icon: "□", a: 180 }, { icon: "▽", a: 240 },
              ].map((m, i) => {
                const rad = m.a * (Math.PI / 180);
                const r = 72;
                return (
                  <motion.div
                    key={i}
                    className="absolute w-8 h-8 rounded-[10px] bg-white border flex items-center justify-center text-[13px]"
                    style={{
                      borderColor: "rgba(106,92,255,0.1)",
                      color: "#6A5CFF",
                      left: `${Math.cos(rad) * r - 16 + 32}px`,
                      top: `${Math.sin(rad) * r - 16 + 32}px`,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    }}
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + i * 0.07 }}
                  >
                    {m.icon}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   STICKY SYSTEM SHOWCASE — Scroll-driven layer reveal
   ═══════════════════════════════════════════════════════════════════════ */
function SystemShowcase() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  return (
    <section ref={ref} style={{ height: `${(LAYERS.length + 1) * 100}vh` }}>
      <div className="sticky top-0 h-screen flex items-center">
        <div className="max-w-4xl mx-auto px-6 w-full">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-3" style={{ color: "#6A5CFF" }}>Le système</p>
          <h2 className="text-[clamp(1.4rem,3vw,2rem)] font-extrabold text-[#0A0A0A] mb-10">5 couches. 1 système.</h2>

          <div className="space-y-3">
            {LAYERS.map((layer, i) => (
              <LayerCard key={layer.n} layer={layer} index={i} progress={scrollYProgress} total={LAYERS.length} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function LayerCard({ layer, index, progress, total }: { layer: typeof LAYERS[0]; index: number; progress: any; total: number }) {
  const start = index / (total + 1);
  const end = (index + 1) / (total + 1);
  const opacity = useTransform(progress, [start, start + 0.05, end, end + 0.05], [0.2, 1, 1, 0.2]);
  const scale = useTransform(progress, [start, start + 0.05, end], [0.98, 1, 1]);
  const x = useTransform(progress, [start, start + 0.05], [12, 0]);

  return (
    <motion.div
      className="flex items-center gap-5 p-5 rounded-[16px] border transition-colors"
      style={{
        opacity,
        scale,
        x,
        borderColor: `${layer.color}18`,
        background: `${layer.color}05`,
      }}
    >
      <div className="w-11 h-11 rounded-[12px] flex items-center justify-center text-[13px] font-bold text-white flex-shrink-0" style={{ background: layer.color }}>
        {layer.n}
      </div>
      <div>
        <div className="text-[15px] font-bold text-[#0A0A0A]">{layer.label}</div>
        <div className="text-[12px] text-[#999]">{layer.desc}</div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   BUILDER
   ═══════════════════════════════════════════════════════════════════════ */
function BuilderSection() {
  return (
    <section id="builder" className="py-28 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-14 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-3" style={{ color: "#8B5CF6" }}>Builder</p>
            <h2 className="text-[clamp(1.5rem,3vw,2.2rem)] font-extrabold text-[#0A0A0A] leading-tight mb-5">
              Construisez le site que<br />vos clients voient.
              <br /><span className="text-[#D4D4D4]">Opérez le système qu&apos;ils ne voient pas.</span>
            </h2>
            <p className="text-[14px] text-[#999] leading-relaxed mb-7">
              100+ blocs. Checkout intégré. Formulaires. Templates par métier. Un site qui convertit, pas juste une vitrine.
            </p>
            <div className="space-y-2">
              {["100+ blocs premium", "Checkout et paiement intégrés", "Capture de leads", "SEO et mobile natifs"].map((f) => (
                <div key={f} className="flex items-center gap-2.5">
                  <div className="w-[5px] h-[5px] rounded-full" style={{ background: "#8B5CF6" }} />
                  <span className="text-[12px] text-[#666] font-medium">{f}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
            <div className="absolute inset-0 rounded-3xl blur-3xl -z-10" style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.06), rgba(106,92,255,0.03))" }} />
            <div className="bg-white rounded-[20px] border border-black/[0.05] overflow-hidden" style={{ boxShadow: "0 20px 60px -12px rgba(0,0,0,0.06)" }}>
              <div className="flex">
                <div className="w-40 border-r border-black/[0.03] bg-[#FAFAFA] p-2.5 space-y-1 flex-shrink-0">
                  <div className="text-[8px] font-bold text-[#BBB] uppercase tracking-wider px-1 mb-2">Blocs</div>
                  {["Hero", "Portfolio", "Services", "Checkout", "Contact", "Footer"].map((b, i) => (
                    <div key={b} className={`px-2.5 py-1.5 rounded-[8px] text-[10px] font-medium ${
                      i === 1 ? "text-white" : "text-[#888]"
                    }`} style={i === 1 ? { background: "linear-gradient(135deg, #8B5CF6, #6A5CFF)" } : {}}>
                      {b}
                    </div>
                  ))}
                </div>
                <div className="flex-1 p-3 space-y-2 min-h-[280px] bg-[#FDFDFD]">
                  <div className="h-16 rounded-[10px] border flex items-center justify-center" style={{ borderColor: "rgba(139,92,246,0.1)", background: "rgba(139,92,246,0.03)" }}>
                    <div className="h-2 w-20 bg-[#0A0A0A]/8 rounded" />
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[0, 1, 2].map((i) => <div key={i} className="aspect-[4/3] bg-[#F5F5F5] rounded-[8px]" />)}
                  </div>
                  <div className="h-12 bg-[#F5F5F5] rounded-[10px]" />
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
  const mods = [
    { title: "Pipeline", desc: "Kanban + statuts custom", c: "#6A5CFF" },
    { title: "CRM", desc: "Historique + revenus par client", c: "#8B5CF6" },
    { title: "Analytics", desc: "Revenus, conversion, tendances", c: "#0EA5E9" },
    { title: "Projets", desc: "Folders, fichiers, livraison", c: "#10B981" },
    { title: "Calendrier", desc: "Jour, semaine, mois", c: "#F59E0B" },
    { title: "Facturation", desc: "Factures, exports, récurrence", c: "#EC4899" },
  ];

  return (
    <section id="operations" className="py-28">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-3" style={{ color: "#0EA5E9" }}>Operations</p>
          <h2 className="text-[clamp(1.5rem,3vw,2.2rem)] font-extrabold text-[#0A0A0A]">Le cockpit de votre activité</h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {mods.map((m, i) => (
            <motion.div
              key={m.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="group bg-white rounded-[14px] border border-black/[0.04] p-5 hover:shadow-lg hover:shadow-black/[0.03] hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="w-[7px] h-[7px] rounded-full group-hover:scale-[1.8] transition-transform" style={{ background: m.c }} />
                <h3 className="text-[14px] font-bold text-[#0A0A0A]">{m.title}</h3>
              </div>
              <p className="text-[11px] text-[#AAA]">{m.desc}</p>
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
function Pricing() {
  return (
    <section id="tarifs" className="py-28">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-[clamp(1.5rem,3vw,2.2rem)] font-extrabold text-[#0A0A0A] mb-2">Un prix, pas une surprise</h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-4">
          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white rounded-[18px] border border-black/[0.05] p-7">
            <div className="text-[10px] font-bold text-[#BBB] uppercase tracking-wider mb-1">Free</div>
            <div className="text-[32px] font-extrabold text-[#0A0A0A] mb-5">0<span className="text-[13px] text-[#DDD] font-semibold ml-1">€/mois</span></div>
            <div className="space-y-2 mb-6">
              {["1 site", "10 commandes/mois", "Blocs essentiels", "Dashboard"].map((f) => (
                <div key={f} className="flex items-center gap-2 text-[11px] text-[#777]">
                  <div className="w-3 h-3 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[7px] text-[#CCC]">✓</div>
                  {f}
                </div>
              ))}
            </div>
            <Link href="/login" className="block text-center text-[12px] font-semibold text-[#111] border border-black/[0.08] py-2.5 rounded-[12px] hover:bg-[#F7F7F5] transition-colors">
              Démarrer
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.06 }} className="bg-[#0A0A0A] rounded-[18px] p-7 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-[50px]" style={{ background: "rgba(106,92,255,0.3)" }} />
            <div className="relative">
              <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "#6A5CFF" }}>Pro</div>
              <div className="text-[32px] font-extrabold text-white mb-5">7<span className="text-[13px] text-[#666] font-semibold ml-1">€/mois</span></div>
              <div className="space-y-2 mb-6">
                {["Sites illimités", "Commandes illimitées", "100+ blocs premium", "Domaine custom", "Support prioritaire"].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-[11px] text-[#AAA]">
                    <div className="w-3 h-3 rounded-full flex items-center justify-center text-[7px]" style={{ background: "rgba(106,92,255,0.2)", color: "#6A5CFF" }}>✓</div>
                    {f}
                  </div>
                ))}
              </div>
              <Link href="/login" className="block text-center text-[12px] font-semibold text-white py-2.5 rounded-[12px] transition-colors" style={{ background: "linear-gradient(135deg, #6A5CFF, #4B7CFF)", boxShadow: "0 6px 24px rgba(106,92,255,0.3)" }}>
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
   FINAL CTA
   ═══════════════════════════════════════════════════════════════════════ */
function FinalCTA() {
  return (
    <section className="py-36 relative">
      <div className="absolute inset-0" style={{
        backgroundImage: "linear-gradient(rgba(106,92,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(106,92,255,0.04) 1px, transparent 1px)",
        backgroundSize: "16px 16px",
        maskImage: "radial-gradient(ellipse 55% 45% at 50% 50%, black 0%, transparent 65%)",
        WebkitMaskImage: "radial-gradient(ellipse 55% 45% at 50% 50%, black 0%, transparent 65%)",
      }} />

      <div className="max-w-3xl mx-auto px-6 text-center relative">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease }}>
          <h2 className="text-[clamp(1.8rem,4.5vw,3rem)] font-extrabold text-[#0A0A0A] leading-[1.06] tracking-[-0.03em] mb-6">
            Construisez quelque chose<br />de sérieux.
          </h2>
          <p className="text-[15px] text-[#AAA] mb-10">Le freelance OS pour ceux qui ne bricolent plus.</p>
          <Link
            href="/login"
            className="group inline-flex text-[15px] font-semibold text-white px-8 py-4 rounded-[14px] transition-all hover:-translate-y-0.5 relative overflow-hidden"
            style={{ boxShadow: "0 8px 30px rgba(90,100,255,0.35)" }}
          >
            <span className="absolute inset-0" style={{ background: "linear-gradient(135deg, #6A5CFF, #4B7CFF)" }} />
            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ background: "linear-gradient(135deg, #4B7CFF, #6A5CFF)" }} />
            <span className="relative z-10">Démarrer gratuitement</span>
          </Link>
          <p className="text-[11px] text-[#DDD] mt-5">Gratuit pour toujours. Sans carte bancaire.</p>
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
          <div className="w-5 h-5 rounded-[6px] bg-[#111] flex items-center justify-center">
            <span className="text-white text-[7px] font-black">J</span>
          </div>
          <span className="text-[11px] text-[#CCC]">© 2026 Jestly</span>
        </div>
        <div className="flex gap-5">
          {["Mentions légales", "CGV", "Contact"].map((l) => (
            <a key={l} href="#" className="text-[10px] text-[#CCC] hover:text-[#999] transition-colors">{l}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  return (
    <>
      <PixelSystem />
      <Topbar />
      <main>
        <HeroScene />
        <Manifesto />
        <ChaosSection />
        <SystemShowcase />
        <BuilderSection />
        <OpsSection />
        <Pricing />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
