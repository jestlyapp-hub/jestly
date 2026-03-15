"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════════════════════
   JESTLY V5 — FREELANCE SYSTEM ACTIVATION
   Not a landing page. A system booting up.
   ═══════════════════════════════════════════════════════════════════════ */

const ease = [0.22, 1, 0.36, 1] as const;

/* ─── Orbital modules ─── */
const MODULES = [
  { label: "Site", icon: "◈", color: "#8B5CF6", orbit: 1 },
  { label: "Leads", icon: "◇", color: "#6A5CFF", orbit: 1 },
  { label: "Orders", icon: "□", color: "#0EA5E9", orbit: 1 },
  { label: "Revenue", icon: "△", color: "#10B981", orbit: 2 },
  { label: "Delivery", icon: "○", color: "#F59E0B", orbit: 2 },
  { label: "CRM", icon: "▽", color: "#EC4899", orbit: 2 },
  { label: "Analytics", icon: "◆", color: "#6366F1", orbit: 2 },
  { label: "Invoicing", icon: "▢", color: "#14B8A6", orbit: 2 },
];

const CHAOS = [
  { name: "Notion", x: 8, y: 35 },
  { name: "Stripe", x: 72, y: 25 },
  { name: "Trello", x: 18, y: 68 },
  { name: "Calendly", x: 75, y: 62 },
  { name: "Drive", x: 42, y: 82 },
  { name: "Gmail", x: 85, y: 44 },
  { name: "WordPress", x: 6, y: 80 },
  { name: "Sheets", x: 58, y: 74 },
  { name: "Airtable", x: 32, y: 42 },
  { name: "Mailchimp", x: 62, y: 40 },
];

const LAYERS = [
  { n: "01", label: "Présenter", desc: "Site portfolio, 100 blocs, publication 1-clic", color: "#8B5CF6" },
  { n: "02", label: "Vendre", desc: "Checkout, briefs, offres packagées", color: "#6A5CFF" },
  { n: "03", label: "Livrer", desc: "Projets, tâches, calendrier, fichiers", color: "#0EA5E9" },
  { n: "04", label: "Facturer", desc: "Factures, exports, récurrence", color: "#10B981" },
  { n: "05", label: "Piloter", desc: "Dashboard, analytics, KPIs", color: "#F59E0B" },
];

/* ═══════════════════════════════════════════════════════════════════════
   PIXEL TOPOGRAPHY
   ═══════════════════════════════════════════════════════════════════════ */
function PixelField() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none" aria-hidden>
      <div className="absolute inset-0 bg-[#FAFAFA]" />
      {/* L1 architecture */}
      <div className="absolute inset-0" style={{
        backgroundImage: "linear-gradient(rgba(0,0,0,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.025) 1px, transparent 1px)",
        backgroundSize: "80px 80px",
      }} />
      {/* L2 micro */}
      <div className="absolute inset-0" style={{
        backgroundImage: "linear-gradient(rgba(0,0,0,0.012) 0.5px, transparent 0.5px), linear-gradient(90deg, rgba(0,0,0,0.012) 0.5px, transparent 0.5px)",
        backgroundSize: "16px 16px",
      }} />
      {/* L3 dense cluster hero */}
      <div className="absolute top-0 left-[10%] w-[80%] h-[65%]" style={{
        backgroundImage: "linear-gradient(rgba(106,92,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(106,92,255,0.045) 1px, transparent 1px)",
        backgroundSize: "10px 10px",
        maskImage: "radial-gradient(ellipse 80% 65% at 50% 35%, black 0%, transparent 60%)",
        WebkitMaskImage: "radial-gradient(ellipse 80% 65% at 50% 35%, black 0%, transparent 60%)",
      }} />
      {/* Glow */}
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full blur-[150px]" style={{ background: "rgba(106,92,255,0.035)" }} />
      <div className="absolute top-[50%] right-[-5%] w-[400px] h-[400px] rounded-full blur-[120px]" style={{ background: "rgba(75,124,255,0.02)" }} />
      {/* Vignette */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 45% at 50% 30%, transparent 0%, #FAFAFA 80%)" }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   CSS KEYFRAMES (injected once)
   ═══════════════════════════════════════════════════════════════════════ */
function GlobalStyles() {
  return (
    <style jsx global>{`
      @keyframes orbit1 {
        from { transform: rotate(0deg) translateX(160px) rotate(0deg); }
        to   { transform: rotate(360deg) translateX(160px) rotate(-360deg); }
      }
      @keyframes orbit2 {
        from { transform: rotate(0deg) translateX(240px) rotate(0deg); }
        to   { transform: rotate(360deg) translateX(240px) rotate(-360deg); }
      }
      @keyframes orbit1m {
        from { transform: rotate(0deg) translateX(100px) rotate(0deg); }
        to   { transform: rotate(360deg) translateX(100px) rotate(-360deg); }
      }
      @keyframes orbit2m {
        from { transform: rotate(0deg) translateX(150px) rotate(0deg); }
        to   { transform: rotate(360deg) translateX(150px) rotate(-360deg); }
      }
      @keyframes pulse-ring {
        0%, 100% { opacity: 0.08; transform: scale(1); }
        50%      { opacity: 0.15; transform: scale(1.02); }
      }
    `}</style>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   TOPBAR
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

  const onHover = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!navRef.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    const n = navRef.current.getBoundingClientRect();
    hoverX.set(r.left - n.left);
    hoverW.set(r.width);
    hoverO.set(1);
  };

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
          background: scrolled ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.6)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-[30px] h-[30px] rounded-[10px] bg-[#111] flex items-center justify-center group-hover:scale-105 transition-transform">
            <span className="text-white text-[11px] font-black">J</span>
          </div>
          <span className="text-[15px] font-semibold text-[#111]">Jestly</span>
        </Link>

        <nav ref={navRef} className="hidden md:flex items-center relative">
          <motion.div
            className="absolute top-0 h-full rounded-[10px]"
            style={{ x: sX, width: sW, opacity: sO, background: "rgba(0,0,0,0.04)" }}
          />
          {["Système", "Builder", "Operations", "Tarifs"].map((l) => (
            <a key={l} href={`#${l.toLowerCase()}`} className="relative z-10 px-4 py-2 text-[13px] font-medium text-[#111] hover:text-black transition-colors"
              onMouseEnter={onHover} onMouseLeave={() => hoverO.set(0)}>{l}</a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login" className="text-[13px] font-medium text-[#555] hover:text-[#111] transition-colors hidden sm:block">Connexion</Link>
          <Link href="/login" className="text-[12px] font-semibold text-white px-[18px] py-[10px] rounded-[12px] transition-all hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, #6A5CFF, #4B7CFF)", boxShadow: "0 8px 30px rgba(90,100,255,0.35)" }}>
            Démarrer
          </Link>
        </div>
      </div>
    </motion.header>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   HERO — ORBITAL SYSTEM CORE
   The system boots up. Modules orbit the core.
   ═══════════════════════════════════════════════════════════════════════ */
function HeroSystem() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const orbit1Modules = MODULES.filter((m) => m.orbit === 1);
  const orbit2Modules = MODULES.filter((m) => m.orbit === 2);

  return (
    <section ref={ref} className="relative min-h-[100vh] flex flex-col items-center justify-center pt-28 pb-20 overflow-hidden">
      <motion.div className="w-full max-w-5xl mx-auto px-6" style={{ y, opacity }}>

        {/* Badge */}
        <motion.div className="text-center mb-8" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111]">
            <span className="w-[6px] h-[6px] rounded-full bg-[#6A5CFF] animate-pulse" />
            <span className="text-[10px] font-bold text-white/90 tracking-[0.18em] uppercase">System Activating</span>
          </span>
        </motion.div>

        {/* Headline */}
        <motion.div className="text-center mb-6" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8, ease }}>
          <h1 className="text-[clamp(2.6rem,7.5vw,6rem)] font-extrabold leading-[0.92] tracking-[-0.05em] text-[#0A0A0A]">
            <span className="block">Your freelance</span>
            <span className="block">business deserves</span>
            <span className="block bg-gradient-to-r from-[#6A5CFF] to-[#4B7CFF] bg-clip-text text-transparent">infrastructure.</span>
          </h1>
        </motion.div>

        {/* Sub */}
        <motion.p className="text-center text-[clamp(0.9rem,1.4vw,1.05rem)] text-[#999] max-w-md mx-auto mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
          Site, ventes, clients, projets, facturation — un système structuré au lieu de 10 outils.
        </motion.p>

        {/* CTAs */}
        <motion.div className="flex items-center justify-center gap-4 mb-20" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
          <Link href="/login" className="group relative text-[14px] font-semibold text-white px-7 py-3.5 rounded-[14px] overflow-hidden transition-all hover:-translate-y-0.5"
            style={{ boxShadow: "0 8px 30px rgba(90,100,255,0.35)" }}>
            <span className="absolute inset-0" style={{ background: "linear-gradient(135deg, #6A5CFF, #4B7CFF)" }} />
            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: "linear-gradient(135deg, #4B7CFF, #6A5CFF)" }} />
            <span className="relative z-10">Start free</span>
          </Link>
          <a href="#système" className="text-[13px] font-medium text-[#999] hover:text-[#111] transition-colors">Explore the system →</a>
        </motion.div>

        {/* ─── ORBITAL SYSTEM ─── */}
        <motion.div
          className="relative mx-auto w-[320px] h-[320px] sm:w-[400px] sm:h-[400px] lg:w-[520px] lg:h-[520px]"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, duration: 1.2, ease }}
        >
          {/* Orbital rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[320px] h-[320px] sm:w-[400px] lg:w-[480px] sm:h-[400px] lg:h-[480px] rounded-full border border-black/[0.04]"
              style={{ animation: "pulse-ring 4s ease-in-out infinite" }} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[220px] h-[220px] sm:w-[280px] lg:w-[320px] sm:h-[280px] lg:h-[320px] rounded-full border border-black/[0.05]"
              style={{ animation: "pulse-ring 4s ease-in-out infinite 1s" }} />
          </div>

          {/* CORE */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <motion.div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-[20px] bg-[#111] flex items-center justify-center"
              style={{ boxShadow: "0 12px 40px rgba(0,0,0,0.25), 0 0 60px rgba(106,92,255,0.15)" }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1, type: "spring", stiffness: 200 }}
            >
              <span className="text-white text-xl sm:text-2xl font-black">J</span>
            </motion.div>
            <div className="absolute -inset-3 rounded-[24px] border border-[#6A5CFF]/20 animate-pulse" />
          </div>

          {/* ORBIT 1 — inner ring (3 modules) */}
          {orbit1Modules.map((mod, i) => {
            const offset = (i / orbit1Modules.length) * 360;
            return (
              <motion.div
                key={mod.label}
                className="absolute top-1/2 left-1/2 z-10"
                style={{
                  animation: `orbit1 30s linear infinite`,
                  animationDelay: `${-offset / 360 * 30}s`,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 + i * 0.1 }}
              >
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/95 backdrop-blur-sm rounded-[10px] border border-black/[0.05] -translate-x-1/2 -translate-y-1/2"
                  style={{ boxShadow: `0 4px 16px ${mod.color}15` }}>
                  <span className="text-[12px]" style={{ color: mod.color }}>{mod.icon}</span>
                  <span className="text-[10px] font-semibold text-[#333]">{mod.label}</span>
                </div>
              </motion.div>
            );
          })}

          {/* ORBIT 2 — outer ring (5 modules) */}
          {orbit2Modules.map((mod, i) => {
            const offset = (i / orbit2Modules.length) * 360;
            return (
              <motion.div
                key={mod.label}
                className="absolute top-1/2 left-1/2 z-10 hidden sm:block"
                style={{
                  animation: `orbit2 50s linear infinite reverse`,
                  animationDelay: `${-offset / 360 * 50}s`,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 + i * 0.1 }}
              >
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/90 backdrop-blur-sm rounded-[10px] border border-black/[0.04] -translate-x-1/2 -translate-y-1/2"
                  style={{ boxShadow: `0 3px 12px ${mod.color}10` }}>
                  <span className="text-[11px]" style={{ color: mod.color }}>{mod.icon}</span>
                  <span className="text-[9px] font-semibold text-[#444]">{mod.label}</span>
                </div>
              </motion.div>
            );
          })}
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
        <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.9, ease }}>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-6" style={{ color: "#6A5CFF" }}>Manifeste</p>
          <h2 className="text-[clamp(1.8rem,4.5vw,3.2rem)] font-extrabold leading-[1.08] tracking-[-0.03em] text-[#0A0A0A] mb-8">
            Freelancers don&apos;t need<br />another tool.
            <br /><span className="text-[#D4D4D4]">They need a system.</span>
          </h2>
          <div className="w-10 h-[2px] mb-8" style={{ background: "linear-gradient(90deg, #6A5CFF, #4B7CFF)" }} />
          <p className="text-[17px] text-[#AAA] leading-[1.8] max-w-xl">
            Your business shouldn&apos;t live across tabs, docs, DMs and spreadsheets.
            Jestly turns freelance work into a structured operating layer.
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
            From 10 scattered tools → 1 system
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* BEFORE */}
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="relative h-[360px] rounded-[20px] border border-red-100/60 p-7 overflow-hidden"
            style={{ background: "linear-gradient(135deg, rgba(254,226,226,0.25), transparent)" }}>
            <div className="text-[9px] font-bold text-red-400/70 uppercase tracking-[0.25em] mb-1">Before</div>
            <div className="text-[18px] font-bold text-[#0A0A0A] mb-1">The patchwork</div>
            <div className="text-[12px] text-[#BBB]">Every task in a different tool.</div>
            {CHAOS.map((t, i) => (
              <motion.div key={t.name} className="absolute px-2 py-1 bg-white rounded-[8px] border border-black/[0.05] text-[9px] font-medium text-[#888]"
                style={{ left: `${t.x}%`, top: `${t.y}%`, rotate: (i % 2 ? 1 : -1) * (2 + i % 5), boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}
                initial={{ opacity: 0 }} whileInView={{ opacity: 0.5 + (i % 3) * 0.15 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}>
                {t.name}
              </motion.div>
            ))}
          </motion.div>

          {/* AFTER */}
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="relative h-[360px] rounded-[20px] border p-7"
            style={{ borderColor: "rgba(106,92,255,0.12)", background: "linear-gradient(135deg, rgba(106,92,255,0.03), transparent)" }}>
            <div className="text-[9px] font-bold uppercase tracking-[0.25em] mb-1" style={{ color: "#6A5CFF" }}>After</div>
            <div className="text-[18px] font-bold text-[#0A0A0A] mb-1">The system</div>
            <div className="text-[12px] text-[#BBB]">One core. Everything connected.</div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[20%]">
              <div className="absolute -inset-16 rounded-full" style={{ border: "1px solid rgba(106,92,255,0.06)" }} />
              <div className="absolute -inset-28 rounded-full" style={{ border: "1px solid rgba(106,92,255,0.03)" }} />
              <motion.div className="relative w-16 h-16 rounded-[18px] bg-[#111] flex items-center justify-center z-10"
                style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.2)" }}
                initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.3, type: "spring", stiffness: 200 }}>
                <span className="text-white text-[18px] font-black">J</span>
              </motion.div>
              {MODULES.slice(0, 6).map((m, i) => {
                const a = ((i * 60) - 90) * (Math.PI / 180); const r = 72;
                return (
                  <motion.div key={m.label} className="absolute w-8 h-8 rounded-[10px] bg-white border flex items-center justify-center text-[13px]"
                    style={{ borderColor: `${m.color}20`, color: m.color, left: `${Math.cos(a) * r - 16 + 32}px`, top: `${Math.sin(a) * r - 16 + 32}px`, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                    initial={{ opacity: 0, scale: 0.5 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.5 + i * 0.07 }}>
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
   STICKY SYSTEM LAYERS
   ═══════════════════════════════════════════════════════════════════════ */
function SystemLayers() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  return (
    <section ref={ref} style={{ height: `${(LAYERS.length + 1) * 100}vh` }}>
      <div className="sticky top-0 h-screen flex items-center">
        <div className="max-w-4xl mx-auto px-6 w-full">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-3" style={{ color: "#6A5CFF" }}>System Architecture</p>
          <h2 className="text-[clamp(1.4rem,3vw,2rem)] font-extrabold text-[#0A0A0A] mb-10">5 layers. 1 system.</h2>
          <div className="space-y-3">
            {LAYERS.map((l, i) => <Layer key={l.n} layer={l} index={i} progress={scrollYProgress} total={LAYERS.length} />)}
          </div>
        </div>
      </div>
    </section>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Layer({ layer, index, progress, total }: { layer: typeof LAYERS[0]; index: number; progress: any; total: number }) {
  const s = index / (total + 1); const e = (index + 1) / (total + 1);
  const opacity = useTransform(progress, [s, s + 0.05, e, e + 0.05], [0.15, 1, 1, 0.15]);
  const scale = useTransform(progress, [s, s + 0.05, e], [0.97, 1, 1]);
  const x = useTransform(progress, [s, s + 0.05], [16, 0]);
  return (
    <motion.div className="flex items-center gap-5 p-5 rounded-[16px] border" style={{ opacity, scale, x, borderColor: `${layer.color}18`, background: `${layer.color}05` }}>
      <div className="w-11 h-11 rounded-[12px] flex items-center justify-center text-[13px] font-bold text-white flex-shrink-0" style={{ background: layer.color }}>{layer.n}</div>
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
              Build the site<br />clients see.
              <br /><span className="text-[#D4D4D4]">Run the system they don&apos;t.</span>
            </h2>
            <p className="text-[14px] text-[#999] leading-relaxed mb-7">100+ blocks. Integrated checkout. Brief forms. Templates by profession.</p>
            <div className="space-y-2">
              {["100+ premium blocks", "Checkout & payments", "Lead capture", "SEO & mobile native"].map((f) => (
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
                  <div className="text-[8px] font-bold text-[#BBB] uppercase tracking-wider px-1 mb-2">Blocks</div>
                  {["Hero", "Portfolio", "Services", "Checkout", "Contact", "Footer"].map((b, i) => (
                    <div key={b} className={`px-2.5 py-1.5 rounded-[8px] text-[10px] font-medium ${i === 1 ? "text-white" : "text-[#888]"}`}
                      style={i === 1 ? { background: "linear-gradient(135deg, #8B5CF6, #6A5CFF)" } : {}}>{b}</div>
                  ))}
                </div>
                <div className="flex-1 p-3 space-y-2 min-h-[280px] bg-[#FDFDFD]">
                  <div className="h-16 rounded-[10px] border flex items-center justify-center" style={{ borderColor: "rgba(139,92,246,0.1)", background: "rgba(139,92,246,0.03)" }}>
                    <div className="h-2 w-20 bg-[#0A0A0A]/8 rounded" />
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">{[0, 1, 2].map((i) => <div key={i} className="aspect-[4/3] bg-[#F5F5F5] rounded-[8px]" />)}</div>
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
    { t: "Pipeline", d: "Kanban + custom statuses", c: "#6A5CFF" },
    { t: "CRM", d: "Client history + revenue", c: "#8B5CF6" },
    { t: "Analytics", d: "Revenue, conversion, trends", c: "#0EA5E9" },
    { t: "Projects", d: "Folders, files, delivery", c: "#10B981" },
    { t: "Calendar", d: "Day, week, month views", c: "#F59E0B" },
    { t: "Invoicing", d: "Invoices, exports, recurring", c: "#EC4899" },
  ];
  return (
    <section id="operations" className="py-28">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-3" style={{ color: "#0EA5E9" }}>Operations</p>
          <h2 className="text-[clamp(1.5rem,3vw,2.2rem)] font-extrabold text-[#0A0A0A]">Your business cockpit</h2>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {mods.map((m, i) => (
            <motion.div key={m.t} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
              className="group bg-white rounded-[14px] border border-black/[0.04] p-5 hover:shadow-lg hover:shadow-black/[0.03] hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="w-[7px] h-[7px] rounded-full group-hover:scale-[1.8] transition-transform" style={{ background: m.c }} />
                <h3 className="text-[14px] font-bold text-[#0A0A0A]">{m.t}</h3>
              </div>
              <p className="text-[11px] text-[#AAA]">{m.d}</p>
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
          <h2 className="text-[clamp(1.5rem,3vw,2.2rem)] font-extrabold text-[#0A0A0A] mb-2">One price. No surprises.</h2>
        </motion.div>
        <div className="grid md:grid-cols-2 gap-4">
          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white rounded-[18px] border border-black/[0.05] p-7">
            <div className="text-[10px] font-bold text-[#BBB] uppercase tracking-wider mb-1">Free</div>
            <div className="text-[32px] font-extrabold text-[#0A0A0A] mb-5">0<span className="text-[13px] text-[#DDD] font-semibold ml-1">€/mo</span></div>
            <div className="space-y-2 mb-6">{["1 site", "10 orders/mo", "Essential blocks", "Dashboard"].map((f) => (
              <div key={f} className="flex items-center gap-2 text-[11px] text-[#777]"><div className="w-3 h-3 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[7px] text-[#CCC]">✓</div>{f}</div>
            ))}</div>
            <Link href="/login" className="block text-center text-[12px] font-semibold text-[#111] border border-black/[0.08] py-2.5 rounded-[12px] hover:bg-[#F7F7F5] transition-colors">Start free</Link>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.06 }} className="bg-[#0A0A0A] rounded-[18px] p-7 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-[50px]" style={{ background: "rgba(106,92,255,0.3)" }} />
            <div className="relative">
              <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "#6A5CFF" }}>Pro</div>
              <div className="text-[32px] font-extrabold text-white mb-5">7<span className="text-[13px] text-[#666] font-semibold ml-1">€/mo</span></div>
              <div className="space-y-2 mb-6">{["Unlimited sites", "Unlimited orders", "100+ premium blocks", "Custom domain", "Priority support"].map((f) => (
                <div key={f} className="flex items-center gap-2 text-[11px] text-[#AAA]"><div className="w-3 h-3 rounded-full flex items-center justify-center text-[7px]" style={{ background: "rgba(106,92,255,0.2)", color: "#6A5CFF" }}>✓</div>{f}</div>
              ))}</div>
              <Link href="/login" className="block text-center text-[12px] font-semibold text-white py-2.5 rounded-[12px] transition-colors" style={{ background: "linear-gradient(135deg, #6A5CFF, #4B7CFF)", boxShadow: "0 6px 24px rgba(106,92,255,0.3)" }}>Go Pro</Link>
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
        maskImage: "radial-gradient(ellipse 50% 40% at 50% 50%, black 0%, transparent 60%)",
        WebkitMaskImage: "radial-gradient(ellipse 50% 40% at 50% 50%, black 0%, transparent 60%)",
      }} />
      <div className="max-w-3xl mx-auto px-6 text-center relative">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease }}>
          <h2 className="text-[clamp(1.8rem,4.5vw,3rem)] font-extrabold text-[#0A0A0A] leading-[1.06] tracking-[-0.03em] mb-6">
            Stop improvising.<br />Start operating.
          </h2>
          <p className="text-[15px] text-[#AAA] mb-10">The freelance OS for people building something serious.</p>
          <Link href="/login" className="group inline-flex text-[15px] font-semibold text-white px-8 py-4 rounded-[14px] transition-all hover:-translate-y-0.5 relative overflow-hidden"
            style={{ boxShadow: "0 8px 30px rgba(90,100,255,0.35)" }}>
            <span className="absolute inset-0" style={{ background: "linear-gradient(135deg, #6A5CFF, #4B7CFF)" }} />
            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ background: "linear-gradient(135deg, #4B7CFF, #6A5CFF)" }} />
            <span className="relative z-10">Start free</span>
          </Link>
          <p className="text-[11px] text-[#DDD] mt-5">Free forever. No credit card.</p>
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
          <div className="w-5 h-5 rounded-[6px] bg-[#111] flex items-center justify-center"><span className="text-white text-[7px] font-black">J</span></div>
          <span className="text-[11px] text-[#CCC]">© 2026 Jestly</span>
        </div>
        <div className="flex gap-5">{["Legal", "Terms", "Contact"].map((l) => (
          <a key={l} href="#" className="text-[10px] text-[#CCC] hover:text-[#999] transition-colors">{l}</a>
        ))}</div>
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
      <GlobalStyles />
      <PixelField />
      <Topbar />
      <main>
        <HeroSystem />
        <Manifesto />
        <ChaosSection />
        <SystemLayers />
        <BuilderSection />
        <OpsSection />
        <Pricing />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
