"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import SectionShell from "@/components/landing/SectionShell";

/* ═══════════════════════════════════════════════════════════════════════
   INTERACTIVE FEATURES GRID — Signature Section
   DNA: Xmind hover reveals × Linear polish × Stripe animations × Apple clarity
   ═══════════════════════════════════════════════════════════════════════ */

const ease = [0.22, 1, 0.36, 1] as const;

/* ── Feature Data ── */
interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
  cta: string;
  gradient: string;
  glowColor: string;
  borderColor: string;
}

const FEATURES: Feature[] = [
  {
    id: "projects",
    icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 5h6M9 14l2 2 4-4",
    title: "Gestion de projets",
    description: "Kanban, timeline et suivi de tâches. Glissez, planifiez, livrez.",
    cta: "Organiser",
    gradient: "linear-gradient(135deg, #7C5CFF08 0%, #6C63FF12 100%)",
    glowColor: "rgba(124,92,255,0.15)",
    borderColor: "rgba(124,92,255,0.12)",
  },
  {
    id: "invoicing",
    icon: "M9 7h6m-6 4h6m-6 4h4M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",
    title: "Facturation",
    description: "Factures automatiques, suivi des paiements, relances intelligentes.",
    cta: "Facturer",
    gradient: "linear-gradient(135deg, #FF6B3508 0%, #FF8F6512 100%)",
    glowColor: "rgba(255,107,53,0.12)",
    borderColor: "rgba(255,107,53,0.10)",
  },
  {
    id: "crm",
    icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
    title: "CRM clients",
    description: "Suivi visuel, historique complet, relances auto. Zéro client perdu.",
    cta: "Gérer",
    gradient: "linear-gradient(135deg, #10B98108 0%, #14C39A12 100%)",
    glowColor: "rgba(16,185,129,0.12)",
    borderColor: "rgba(16,185,129,0.10)",
  },
  {
    id: "portfolio",
    icon: "M3 3h18v18H3zM3 9h18M9 21V9",
    title: "Site portfolio",
    description: "Votre vitrine en ligne. Builder drag & drop, domaine personnalisé.",
    cta: "Publier",
    gradient: "linear-gradient(135deg, #8B5CF608 0%, #A78BFA12 100%)",
    glowColor: "rgba(139,92,246,0.12)",
    borderColor: "rgba(139,92,246,0.10)",
  },
  {
    id: "analytics",
    icon: "M18 20V10M12 20V4M6 20v-6",
    title: "Analytics",
    description: "Revenus, conversions, tendances. Prenez les bonnes décisions.",
    cta: "Analyser",
    gradient: "linear-gradient(135deg, #3B82F608 0%, #60A5FA12 100%)",
    glowColor: "rgba(59,130,246,0.12)",
    borderColor: "rgba(59,130,246,0.10)",
  },
  {
    id: "automations",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    title: "Automations",
    description: "Workflows intelligents. Trigger → action, sans coder.",
    cta: "Automatiser",
    gradient: "linear-gradient(135deg, #F59E0B08 0%, #FBBF2412 100%)",
    glowColor: "rgba(245,158,11,0.12)",
    borderColor: "rgba(245,158,11,0.10)",
  },
];

/* ═══════════════════════════════════════════════════════════════════════
   ANIMATED PREVIEWS — One per feature
   Each renders a mini UI mockup that animates on hover
   ═══════════════════════════════════════════════════════════════════════ */

/* ── 1. Projects: Gantt bars sliding in ── */
function ProjectsPreview({ active }: { active: boolean }) {
  const tasks = [
    { label: "Design", width: "65%", color: "#7C5CFF", delay: 0 },
    { label: "Dev front", width: "80%", color: "#9F7BFF", delay: 0.12 },
    { label: "Backend", width: "55%", color: "#6C63FF", delay: 0.24 },
    { label: "Tests", width: "40%", color: "#B197FC", delay: 0.36 },
  ];

  return (
    <div className="relative w-full h-full flex flex-col justify-center gap-[7px] px-1">
      {/* Timeline header */}
      <div className="flex items-center justify-between mb-1 px-1">
        {["Lun", "Mar", "Mer", "Jeu", "Ven"].map((d) => (
          <span key={d} className="text-[8px] font-medium" style={{ color: "#B0B3C0" }}>{d}</span>
        ))}
      </div>
      {/* Gantt bars */}
      {tasks.map((t) => (
        <div key={t.label} className="flex items-center gap-2">
          <span className="text-[8px] font-medium w-[42px] flex-shrink-0 text-right" style={{ color: "#8A8FA3" }}>
            {t.label}
          </span>
          <div className="flex-1 h-[14px] rounded-full overflow-hidden" style={{ background: "rgba(124,92,255,0.06)" }}>
            <motion.div
              className="h-full rounded-full relative"
              style={{ background: t.color }}
              initial={{ width: "0%" }}
              animate={active ? { width: t.width } : { width: "0%" }}
              transition={{ duration: 0.7, delay: t.delay, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Shimmer */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
                }}
                animate={active ? { x: ["-100%", "200%"] } : {}}
                transition={{ duration: 1.5, delay: t.delay + 0.6, repeat: Infinity, repeatDelay: 2 }}
              />
            </motion.div>
          </div>
        </div>
      ))}
      {/* Floating avatar */}
      <motion.div
        className="absolute right-3 top-3 w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-bold text-white"
        style={{ background: "#7C5CFF", boxShadow: "0 2px 8px rgba(124,92,255,0.35)" }}
        animate={active ? { y: [0, -4, 0], x: [0, 6, 0] } : { y: 0, x: 0 }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        JB
      </motion.div>
    </div>
  );
}

/* ── 2. Invoicing: Invoice appearing with counter ── */
function InvoicingPreview({ active }: { active: boolean }) {
  const [count, setCount] = useState(0);
  const [paid, setPaid] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (active) {
      setCount(0);
      setPaid(false);
      const target = 1247;
      const steps = 30;
      const stepVal = target / steps;
      let current = 0;
      intervalRef.current = setInterval(() => {
        current += stepVal;
        if (current >= target) {
          setCount(target);
          if (intervalRef.current) clearInterval(intervalRef.current);
          setTimeout(() => setPaid(true), 300);
        } else {
          setCount(Math.floor(current));
        }
      }, 35);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setCount(0);
      setPaid(false);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [active]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <motion.div
        className="w-[85%] rounded-xl overflow-hidden"
        style={{
          background: "white",
          boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
          border: "1px solid rgba(0,0,0,0.06)",
        }}
        initial={{ opacity: 0, y: 16, scale: 0.95 }}
        animate={active ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 16, scale: 0.95 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Invoice header */}
        <div className="px-3 py-2 flex items-center justify-between" style={{ borderBottom: "1px solid #F0F0EE" }}>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ background: "#7C5CFF" }} />
            <span className="text-[8px] font-bold" style={{ color: "#111118" }}>FACTURE</span>
          </div>
          <span className="text-[7px] font-medium" style={{ color: "#8A8FA3" }}>#JES-0042</span>
        </div>

        {/* Invoice body */}
        <div className="px-3 py-2.5 space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-[8px]" style={{ color: "#8A8FA3" }}>Refonte site</span>
            <span className="text-[8px]" style={{ color: "#8A8FA3" }}>800 €</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[8px]" style={{ color: "#8A8FA3" }}>Logo + charte</span>
            <span className="text-[8px]" style={{ color: "#8A8FA3" }}>447 €</span>
          </div>
          <div className="h-px my-1" style={{ background: "#F0F0EE" }} />
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-bold" style={{ color: "#111118" }}>Total</span>
            <motion.span
              className="text-[11px] font-extrabold tabular-nums"
              style={{ color: "#7C5CFF" }}
            >
              {count.toLocaleString("fr-FR")} €
            </motion.span>
          </div>
        </div>

        {/* Status bar */}
        <div className="px-3 py-2" style={{ background: paid ? "#ECFDF5" : "#F7F7F5", borderTop: "1px solid #F0F0EE" }}>
          <AnimatePresence mode="wait">
            {paid ? (
              <motion.div
                key="paid"
                className="flex items-center gap-1.5"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", damping: 15, stiffness: 300 }}
              >
                <motion.div
                  className="w-3.5 h-3.5 rounded-full flex items-center justify-center"
                  style={{ background: "#10B981" }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 12, stiffness: 400, delay: 0.1 }}
                >
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </motion.div>
                <span className="text-[8px] font-bold" style={{ color: "#059669" }}>Payé</span>
              </motion.div>
            ) : (
              <motion.div
                key="pending"
                className="flex items-center gap-1.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#F59E0B" }} />
                <span className="text-[8px] font-medium" style={{ color: "#92400E" }}>En attente</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

/* ── 3. CRM: Kanban cards moving ── */
function CrmPreview({ active }: { active: boolean }) {
  const columns = [
    { label: "Lead", color: "#F59E0B" },
    { label: "Prospect", color: "#3B82F6" },
    { label: "Client", color: "#10B981" },
  ];

  return (
    <div className="relative w-full h-full flex items-end gap-1.5 px-1 pb-1">
      {columns.map((col, ci) => (
        <div key={col.label} className="flex-1 flex flex-col items-stretch">
          {/* Column header */}
          <div className="flex items-center gap-1 mb-1.5 px-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: col.color }} />
            <span className="text-[7px] font-bold uppercase tracking-wider" style={{ color: "#8A8FA3" }}>
              {col.label}
            </span>
          </div>
          {/* Cards */}
          <div className="space-y-1">
            {ci === 0 && (
              <>
                {/* Card that moves */}
                <motion.div
                  className="rounded-lg px-2 py-1.5"
                  style={{
                    background: "white",
                    border: "1px solid #F0F0EE",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  }}
                  animate={active ? {
                    x: [0, 0, "calc(100% + 6px)", "calc(200% + 12px)"],
                    scale: [1, 1.06, 1.06, 1],
                    boxShadow: [
                      "0 1px 3px rgba(0,0,0,0.04)",
                      "0 4px 16px rgba(124,92,255,0.15)",
                      "0 4px 16px rgba(124,92,255,0.15)",
                      "0 1px 3px rgba(0,0,0,0.04)",
                    ],
                  } : {}}
                  transition={{
                    duration: 2.8,
                    times: [0, 0.15, 0.55, 1],
                    ease: [0.22, 1, 0.36, 1],
                    repeat: Infinity,
                    repeatDelay: 1.5,
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center text-[6px] font-bold text-white" style={{ background: "#7C5CFF" }}>S</div>
                    <div>
                      <div className="text-[7px] font-semibold" style={{ color: "#111118" }}>Studio Créa</div>
                      <div className="text-[6px]" style={{ color: "#8A8FA3" }}>Design UX/UI</div>
                    </div>
                  </div>
                </motion.div>
                {/* Static card */}
                <div
                  className="rounded-lg px-2 py-1.5"
                  style={{ background: "white", border: "1px solid #F0F0EE" }}
                >
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center text-[6px] font-bold text-white" style={{ background: "#3B82F6" }}>M</div>
                    <div>
                      <div className="text-[7px] font-semibold" style={{ color: "#111118" }}>Maison B.</div>
                      <div className="text-[6px]" style={{ color: "#8A8FA3" }}>Branding</div>
                    </div>
                  </div>
                </div>
              </>
            )}
            {ci === 1 && (
              <div
                className="rounded-lg px-2 py-1.5"
                style={{ background: "white", border: "1px solid #F0F0EE" }}
              >
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center text-[6px] font-bold text-white" style={{ background: "#10B981" }}>L</div>
                  <div>
                    <div className="text-[7px] font-semibold" style={{ color: "#111118" }}>La Forge</div>
                    <div className="text-[6px]" style={{ color: "#8A8FA3" }}>Web dev</div>
                  </div>
                </div>
              </div>
            )}
            {ci === 2 && (
              <div
                className="rounded-lg px-2 py-1.5"
                style={{ background: "white", border: "1px solid #F0F0EE" }}
              >
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center text-[6px] font-bold text-white" style={{ background: "#F59E0B" }}>A</div>
                  <div>
                    <div className="text-[7px] font-semibold" style={{ color: "#111118" }}>Agence X</div>
                    <div className="text-[6px]" style={{ color: "#8A8FA3" }}>Motion</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── 4. Portfolio: Mini site with auto-scroll ── */
function PortfolioPreview({ active }: { active: boolean }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <motion.div
        className="w-[88%] rounded-xl overflow-hidden"
        style={{
          background: "white",
          boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
          border: "1px solid rgba(0,0,0,0.06)",
        }}
        initial={{ opacity: 0.5 }}
        animate={active ? { opacity: 1 } : { opacity: 0.5 }}
        transition={{ duration: 0.4 }}
      >
        {/* Browser chrome */}
        <div className="flex items-center gap-1 px-2 py-1.5" style={{ background: "#FAFAFA", borderBottom: "1px solid #F0F0EE" }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#FF5F57" }} />
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#FEBC2E" }} />
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#28C840" }} />
          <div className="flex-1 mx-2 h-3 rounded-full" style={{ background: "#F0F0EE" }}>
            <div className="px-1.5 text-[5px] font-medium leading-[12px]" style={{ color: "#B0B3C0" }}>julie.jestly.fr</div>
          </div>
        </div>
        {/* Site content that scrolls */}
        <div className="h-[85px] overflow-hidden relative">
          <motion.div
            animate={active ? { y: [0, -60, -60, 0] } : { y: 0 }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", times: [0, 0.35, 0.65, 1] }}
          >
            {/* Hero block */}
            <div className="px-3 py-3">
              <div className="w-[60%] h-2 rounded-full mb-1.5" style={{ background: "#111118" }} />
              <div className="w-[40%] h-1.5 rounded-full" style={{ background: "#E0E0E0" }} />
            </div>
            {/* Portfolio grid */}
            <div className="px-3 grid grid-cols-3 gap-1">
              {["#7C5CFF", "#FF6B35", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6"].map((c, i) => (
                <motion.div
                  key={i}
                  className="rounded-md aspect-square"
                  style={{ background: c, opacity: 0.2 }}
                  animate={active ? { opacity: [0.15, 0.4, 0.15] } : { opacity: 0.15 }}
                  transition={{ duration: 2, delay: i * 0.15, repeat: Infinity }}
                />
              ))}
            </div>
            {/* CTA section */}
            <div className="px-3 py-3 flex items-center justify-center">
              <motion.div
                className="px-3 py-1 rounded-full text-[6px] font-bold text-white"
                style={{ background: "#7C5CFF" }}
                animate={active ? { scale: [1, 1.08, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Voir portfolio
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

/* ── 5. Analytics: Animated chart bars ── */
function AnalyticsPreview({ active }: { active: boolean }) {
  const bars = [
    { h: "35%", delay: 0 },
    { h: "55%", delay: 0.08 },
    { h: "45%", delay: 0.16 },
    { h: "70%", delay: 0.24 },
    { h: "60%", delay: 0.32 },
    { h: "85%", delay: 0.40 },
    { h: "75%", delay: 0.48 },
  ];

  return (
    <div className="relative w-full h-full flex flex-col px-2 pb-1">
      {/* Top stats */}
      <div className="flex items-center justify-between px-1 py-1.5">
        <div>
          <div className="text-[7px] font-medium" style={{ color: "#8A8FA3" }}>Revenus</div>
          <motion.div
            className="text-[12px] font-extrabold tabular-nums"
            style={{ color: "#111118" }}
            animate={active ? { opacity: [0, 1] } : { opacity: 0.4 }}
            transition={{ duration: 0.6 }}
          >
            4 230 €
          </motion.div>
        </div>
        <motion.div
          className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[7px] font-bold"
          style={{ background: "#ECFDF5", color: "#059669" }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={active ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
          transition={{ delay: 0.8, type: "spring", damping: 15 }}
        >
          <svg width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
          +32%
        </motion.div>
      </div>

      {/* Bar chart */}
      <div className="flex-1 flex items-end gap-[3px] px-1">
        {bars.map((b, i) => (
          <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
            <motion.div
              className="w-full rounded-t-sm"
              style={{
                background: i === bars.length - 1
                  ? "linear-gradient(to top, #7C5CFF, #9F7BFF)"
                  : "linear-gradient(to top, rgba(124,92,255,0.2), rgba(124,92,255,0.35))",
              }}
              initial={{ height: "0%" }}
              animate={active ? { height: b.h } : { height: "0%" }}
              transition={{ duration: 0.6, delay: b.delay, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        ))}
      </div>

      {/* X-axis labels */}
      <div className="flex items-center justify-between px-1 mt-1">
        {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
          <span key={i} className="text-[6px] font-medium flex-1 text-center" style={{ color: "#C4C7D4" }}>{d}</span>
        ))}
      </div>
    </div>
  );
}

/* ── 6. Automations: Flow nodes with pulse ── */
function AutomationsPreview({ active }: { active: boolean }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg width="100%" height="100%" viewBox="0 0 180 110" fill="none" className="absolute inset-0">
        {/* Connection lines */}
        <motion.path
          d="M 40 35 C 65 35, 70 55, 90 55"
          stroke="url(#flowGrad)"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={active ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.path
          d="M 110 55 C 130 55, 130 35, 145 35"
          stroke="url(#flowGrad)"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={active ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.path
          d="M 110 55 C 130 55, 130 78, 145 78"
          stroke="url(#flowGrad)"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={active ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
        {/* Pulse particles on paths */}
        {active && (
          <>
            <motion.circle
              r="2.5"
              fill="#7C5CFF"
              style={{ filter: "drop-shadow(0 0 4px rgba(124,92,255,0.6))" }}
              animate={{
                offsetDistance: ["0%", "100%"],
                opacity: [0, 1, 1, 0],
              }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
            >
              <animateMotion
                dur="1.5s"
                repeatCount="indefinite"
                path="M 40 35 C 65 35, 70 55, 90 55"
              />
            </motion.circle>
            <motion.circle
              r="2.5"
              fill="#9F7BFF"
              style={{ filter: "drop-shadow(0 0 4px rgba(159,123,255,0.6))" }}
            >
              <animateMotion
                dur="1.5s"
                repeatCount="indefinite"
                path="M 110 55 C 130 55, 130 35, 145 35"
                begin="0.6s"
              />
            </motion.circle>
          </>
        )}
        <defs>
          <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7C5CFF" />
            <stop offset="100%" stopColor="#9F7BFF" />
          </linearGradient>
        </defs>
      </svg>

      {/* Nodes */}
      {/* Trigger */}
      <motion.div
        className="absolute rounded-xl flex flex-col items-center justify-center"
        style={{
          left: "12%", top: "18%",
          width: 52, height: 34,
          background: "white",
          border: "1.5px solid rgba(124,92,255,0.25)",
          boxShadow: "0 2px 8px rgba(124,92,255,0.08)",
        }}
        animate={active ? { scale: [1, 1.06, 1] } : {}}
        transition={{ duration: 1.8, repeat: Infinity }}
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#7C5CFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16v16H4zM12 8v8M8 12h8" />
        </svg>
        <span className="text-[5px] font-bold mt-0.5" style={{ color: "#7C5CFF" }}>Trigger</span>
      </motion.div>

      {/* Process */}
      <motion.div
        className="absolute rounded-xl flex flex-col items-center justify-center"
        style={{
          left: "42%", top: "35%",
          width: 52, height: 34,
          background: "white",
          border: "1.5px solid rgba(124,92,255,0.2)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={active ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#6C63FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span className="text-[5px] font-bold mt-0.5" style={{ color: "#6C63FF" }}>Process</span>
      </motion.div>

      {/* Actions */}
      <motion.div
        className="absolute rounded-xl flex flex-col items-center justify-center"
        style={{
          right: "8%", top: "16%",
          width: 52, height: 34,
          background: "white",
          border: "1.5px solid rgba(16,185,129,0.25)",
          boxShadow: "0 2px 8px rgba(16,185,129,0.08)",
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={active ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
        </svg>
        <span className="text-[5px] font-bold mt-0.5" style={{ color: "#10B981" }}>Email</span>
      </motion.div>

      <motion.div
        className="absolute rounded-xl flex flex-col items-center justify-center"
        style={{
          right: "8%", top: "55%",
          width: 52, height: 34,
          background: "white",
          border: "1.5px solid rgba(245,158,11,0.25)",
          boxShadow: "0 2px 8px rgba(245,158,11,0.08)",
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={active ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
        transition={{ delay: 0.85, duration: 0.5 }}
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 7h6m-6 4h6m-6 4h4M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
        </svg>
        <span className="text-[5px] font-bold mt-0.5" style={{ color: "#F59E0B" }}>Facture</span>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   PREVIEW SELECTOR
   ═══════════════════════════════════════════════════════════════════════ */

function AnimatedPreview({ featureId, active }: { featureId: string; active: boolean }) {
  switch (featureId) {
    case "projects": return <ProjectsPreview active={active} />;
    case "invoicing": return <InvoicingPreview active={active} />;
    case "crm": return <CrmPreview active={active} />;
    case "portfolio": return <PortfolioPreview active={active} />;
    case "analytics": return <AnalyticsPreview active={active} />;
    case "automations": return <AutomationsPreview active={active} />;
    default: return null;
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   FEATURE CARD — 3D tilt + glow + animated preview
   ═══════════════════════════════════════════════════════════════════════ */

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // 3D tilt
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [4, -4]), { damping: 30, stiffness: 200 });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-4, 4]), { damping: 30, stiffness: 200 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  }, [mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    setHovered(false);
    mouseX.set(0.5);
    mouseY.set(0.5);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      ref={cardRef}
      className="relative group cursor-pointer"
      style={{
        perspective: 800,
        transformStyle: "preserve-3d",
      }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="relative rounded-3xl overflow-hidden h-full"
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          background: feature.gradient,
          border: `1px solid ${feature.borderColor}`,
        }}
        animate={{
          scale: hovered ? 1.03 : 1,
          boxShadow: hovered
            ? `0 20px 60px ${feature.glowColor}, 0 0 0 1px ${feature.borderColor}`
            : `0 4px 20px rgba(0,0,0,0.04), 0 0 0 1px ${feature.borderColor}`,
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
      >
        {/* Glow overlay on hover */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(600px circle at ${hovered ? "50%" : "50%"} ${hovered ? "30%" : "50%"}, ${feature.glowColor}, transparent 70%)`,
          }}
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.4 }}
        />

        {/* Content */}
        <div className="relative z-10 p-6 sm:p-7 flex flex-col h-full">
          {/* Icon + text */}
          <div className="mb-4">
            <motion.div
              className="w-10 h-10 rounded-2xl flex items-center justify-center mb-3"
              style={{
                background: `linear-gradient(135deg, ${feature.glowColor.replace("0.12", "0.15").replace("0.15", "0.18")}, transparent)`,
                border: `1px solid ${feature.borderColor}`,
              }}
              animate={hovered ? { scale: 1.08, rotate: 3 } : { scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 20 }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={feature.glowColor.includes("124,92") ? "#7C5CFF" : feature.glowColor.includes("255,107") ? "#FF6B35" : feature.glowColor.includes("16,185") ? "#10B981" : feature.glowColor.includes("139,92") ? "#8B5CF6" : feature.glowColor.includes("59,130") ? "#3B82F6" : "#F59E0B"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={feature.icon} />
              </svg>
            </motion.div>

            <h3 className="text-[16px] sm:text-[17px] font-bold mb-1.5" style={{ color: "#111118" }}>
              {feature.title}
            </h3>
            <p className="text-[13px] leading-relaxed" style={{ color: "#66697A" }}>
              {feature.description}
            </p>
          </div>

          {/* Animated preview area */}
          <div
            className="flex-1 min-h-[130px] rounded-2xl overflow-hidden relative"
            style={{
              background: "rgba(255,255,255,0.6)",
              border: "1px solid rgba(0,0,0,0.04)",
              backdropFilter: "blur(8px)",
            }}
          >
            <AnimatedPreview featureId={feature.id} active={hovered} />
          </div>

          {/* CTA */}
          <motion.div
            className="mt-4 flex items-center gap-1.5"
            animate={hovered ? { x: 4 } : { x: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <span className="text-[12px] font-semibold" style={{ color: "#7C5CFF" }}>
              {feature.cta}
            </span>
            <motion.svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#7C5CFF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              animate={hovered ? { x: [0, 3, 0] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </motion.svg>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SECTION — INTERACTIVE FEATURES GRID
   ═══════════════════════════════════════════════════════════════════════ */

export default function InteractiveFeatures() {
  return (
    <SectionShell atmosphere="system" maxWidth="max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16 sm:mb-20">
          <motion.div
            className="mb-5"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
          >
            <span
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-semibold"
              style={{
                background: "rgba(124,92,255,0.08)",
                color: "#7C5CFF",
                border: "1px solid rgba(124,92,255,0.12)",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              Tout-en-un
            </span>
          </motion.div>

          <motion.h2
            className="text-[28px] sm:text-[36px] md:text-[44px] lg:text-[52px] font-extrabold leading-[1.08] tracking-[-0.03em] mb-5"
            style={{ color: "#111118" }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1, ease }}
          >
            Tout ce dont vous avez besoin,
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, #7C5CFF 0%, #9F7BFF 50%, #6F5BFF 100%)" }}
            >
              en un seul endroit
            </span>
          </motion.h2>

          <motion.p
            className="text-[15px] sm:text-[17px] leading-relaxed max-w-xl mx-auto"
            style={{ color: "#66697A" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, ease }}
          >
            Gérez votre business freelance avec une plateforme
            <br className="hidden sm:block" />
            pensée pour aller vite. Survolez pour découvrir.
          </motion.p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.id} feature={feature} index={i} />
          ))}
        </div>
    </SectionShell>
  );
}
