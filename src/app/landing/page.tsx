"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import TextSwapButton from "@/components/ui/TextSwapButton";
import SectionShell from "@/components/landing/SectionShell";
import InteractiveFeatures from "@/sections/InteractiveFeatures";
import DemosSoon from "@/sections/DemosSoon";

/* ═══════════════════════════════════════════════════════════════════════
   JESTLY V7 — COMPACT CONVERSION MACHINE
   5 sections max. Dense. Fast. Premium.
   ═══════════════════════════════════════════════════════════════════════ */

const ease = [0.22, 1, 0.36, 1] as const;

/* ═══════════════════════════════════════════════════════════════════════
   HERO PIXEL GRID BACKGROUND — Ambient digital surface
   ═══════════════════════════════════════════════════════════════════════ */
function HeroPixelGridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const CELL = 56;
    const INSET = 6;
    const BLOCK = CELL - INSET * 2;
    const R = 6;
    let w = 0, h = 0, cols = 0, rows = 0, dpr = 1;
    const centerXRatio = 0.5;
    const centerYRatio = 0.45;

    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    const enum Tier { Subtle, Medium, Accent }

    interface Cell {
      col: number; row: number; opacity: number; peak: number;
      phase: number; speed: number; tier: Tier;
    }

    let cells: Cell[] = [];
    let gridImg: OffscreenCanvas | HTMLCanvasElement;

    const buildGrid = () => {
      if (typeof OffscreenCanvas !== "undefined") {
        gridImg = new OffscreenCanvas(w * dpr, h * dpr);
      } else {
        gridImg = document.createElement("canvas");
        gridImg.width = w * dpr;
        gridImg.height = h * dpr;
      }
      const g = gridImg.getContext("2d");
      if (!g) return;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.strokeStyle = "rgba(110,95,160,0.08)";
      g.lineWidth = 0.5;
      g.beginPath();
      for (let x = 0; x <= w; x += CELL) { g.moveTo(x, 0); g.lineTo(x, h); }
      for (let y = 0; y <= h; y += CELL) { g.moveTo(0, y); g.lineTo(w, y); }
      g.stroke();
      g.fillStyle = "rgba(110,95,160,0.10)";
      for (let x = 0; x <= w; x += CELL * 4) {
        for (let y = 0; y <= h; y += CELL * 4) {
          g.beginPath(); g.arc(x, y, 1, 0, Math.PI * 2); g.fill();
        }
      }
    };

    const densityAt = (col: number, row: number): number => {
      const dx = (col / cols) - centerXRatio;
      const dy = (row / rows) - centerYRatio;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 0.15) return 0.015;
      if (dist < 0.28) return 0.04;
      return 0.06;
    };

    const initCells = () => {
      cells = [];
      const used = new Set<string>();
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          if (Math.random() < densityAt(c, r)) {
            const key = `${c},${r}`;
            if (used.has(key)) continue;
            used.add(key);
            const roll = Math.random();
            let tier: Tier, peak: number;
            if (roll < 0.70) { tier = Tier.Subtle; peak = rand(0.04, 0.08); }
            else if (roll < 0.90) { tier = Tier.Medium; peak = rand(0.10, 0.15); }
            else { tier = Tier.Accent; peak = rand(0.18, 0.22); }
            cells.push({ col: c, row: r, opacity: 0, peak, phase: rand(0, Math.PI * 2), speed: (Math.PI * 2) / rand(10, 18), tier });
          }
        }
      }
      const clusterSource = cells.filter(c => c.tier !== Tier.Subtle);
      for (const src of clusterSource) {
        if (Math.random() > 0.35) continue;
        const offsets = [[1, 0], [0, 1], [-1, 0], [0, -1]];
        const [dc, dr] = offsets[Math.floor(Math.random() * offsets.length)];
        const nc = src.col + dc, nr = src.row + dr;
        if (nc < 0 || nc >= cols || nr < 0 || nr >= rows) continue;
        const nk = `${nc},${nr}`;
        if (used.has(nk)) continue;
        used.add(nk);
        cells.push({ col: nc, row: nr, opacity: 0, peak: rand(0.04, 0.09), phase: src.phase + rand(-0.5, 0.5), speed: src.speed * rand(0.85, 1.15), tier: Tier.Subtle });
      }
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight * 1.3;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / CELL);
      rows = Math.ceil(h / CELL);
      buildGrid();
      initCells();
    };

    resize();
    window.addEventListener("resize", resize);

    const rr = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
      ctx.arcTo(x + w, y, x + w, y + r, r);
      ctx.lineTo(x + w, y + h - r);
      ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
      ctx.lineTo(x + r, y + h);
      ctx.arcTo(x, y + h, x, y + h - r, r);
      ctx.lineTo(x, y + r);
      ctx.arcTo(x, y, x + r, y, r);
      ctx.closePath(); ctx.fill();
    };

    let last = performance.now();
    const draw = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(gridImg as HTMLCanvasElement, 0, 0, w * dpr, h * dpr, 0, 0, w, h);
      for (const c of cells) {
        c.phase += c.speed * dt;
        const sine = Math.sin(c.phase);
        const t = Math.max(0, sine);
        const smooth = t * t * (3 - 2 * t);
        const target = smooth * c.peak;
        c.opacity += (target - c.opacity) * Math.min(1, 2.0 * dt);
        if (sine < -0.94 && c.opacity < 0.002) {
          let nc: number, nr: number;
          do { nc = Math.floor(Math.random() * cols); nr = Math.floor(Math.random() * rows); } while (nc === c.col && nr === c.row);
          c.col = nc; c.row = nr;
          c.speed = (Math.PI * 2) / rand(10, 18);
          const roll = Math.random();
          if (roll < 0.70) { c.tier = Tier.Subtle; c.peak = rand(0.04, 0.08); }
          else if (roll < 0.90) { c.tier = Tier.Medium; c.peak = rand(0.10, 0.15); }
          else { c.tier = Tier.Accent; c.peak = rand(0.18, 0.22); }
        }
        if (c.opacity < 0.003) continue;
        const px = c.col * CELL + INSET;
        const py = c.row * CELL + INSET;
        if (c.tier === Tier.Accent && c.opacity > 0.08) {
          ctx.fillStyle = `rgba(124,92,255,${c.opacity * 0.12})`;
          rr(px - 4, py - 4, BLOCK + 8, BLOCK + 8, R + 2);
        }
        if (c.tier === Tier.Accent) ctx.fillStyle = `rgba(124,92,255,${c.opacity})`;
        else if (c.tier === Tier.Medium) ctx.fillStyle = `rgba(130,105,255,${c.opacity})`;
        else ctx.fillStyle = `rgba(145,135,185,${c.opacity})`;
        rr(px, py, BLOCK, BLOCK, R);
      }
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(animRef.current); };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10 pointer-events-none" aria-hidden="true" />;
}

/* ── Background ── */
function Background() {
  return (
    <div className="fixed inset-0 -z-20 pointer-events-none" aria-hidden="true">
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #F8F8FC 0%, #F4F3FA 100%)" }} />
      <div className="absolute top-[-10%] right-[5%] w-[900px] h-[900px] rounded-full" style={{ background: "radial-gradient(450px circle, rgba(124,92,255,0.06), transparent 70%)" }} />
      <div className="absolute bottom-[-5%] left-[0%] w-[800px] h-[800px] rounded-full" style={{ background: "radial-gradient(400px circle, rgba(140,110,255,0.05), transparent 70%)" }} />
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[1200px] h-[600px] rounded-full" style={{ background: "radial-gradient(600px 300px at 50% 50%, rgba(124,92,255,0.035), transparent 70%)" }} />
    </div>
  );
}

/* ── Creative Signals ── */
function CreativeSignals() {
  const signals = [
    { content: "{ }", x: 7, y: 28, delay: 0, size: 11 },
    { content: "▶", x: 90, y: 35, delay: 2, size: 9 },
    { content: "◇", x: 6, y: 65, delay: 4, size: 10 },
    { content: "⊞", x: 91, y: 68, delay: 1, size: 9 },
    { content: "△", x: 14, y: 82, delay: 3, size: 8 },
    { content: "◎", x: 88, y: 22, delay: 5, size: 8 },
  ];
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {signals.map((s, i) => (
        <motion.span key={i} className="absolute font-mono select-none" style={{ left: `${s.x}%`, top: `${s.y}%`, fontSize: s.size, color: "rgba(124,92,255,0.12)" }} initial={{ opacity: 0 }} animate={{ opacity: [0, 0.5, 0], y: [0, -12, 0] }} transition={{ duration: 7 + i * 1.2, repeat: Infinity, delay: s.delay, ease: "easeInOut" as const }} />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   PRODUCT CARDS — Floating module satellites
   ═══════════════════════════════════════════════════════════════════════ */
function ProductCard({ children, title, icon, accentBg, accentGlow, className: posClass, delay, floatDuration, baseRotate = 0 }: {
  children: React.ReactNode; title: string; icon: React.ReactNode;
  accentBg: string; accentGlow: string; className: string;
  delay: number; floatDuration: number; baseRotate?: number;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div className={`absolute ${posClass} hidden md:block`} initial={{ opacity: 0, scale: 0.9, y: 30, rotate: 0 }} animate={{ opacity: 1, scale: 1, y: 0, rotate: baseRotate }} transition={{ delay, duration: 0.9, ease }} style={{ zIndex: 2 }}>
      <motion.div animate={{ y: [-5, 7, -5] }} transition={{ duration: floatDuration, repeat: Infinity, ease: "easeInOut" as const }}>
        <motion.div className="relative cursor-default" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} animate={{ y: hovered ? -12 : 0, scale: hovered ? 1.025 : 1, rotate: hovered ? baseRotate * 0.3 : 0 }} transition={{ duration: 0.4, ease }}>
          <motion.div className="absolute -inset-4 rounded-[34px]" animate={{ opacity: hovered ? 0.7 : 0.25 }} transition={{ duration: 0.5 }} style={{ background: `radial-gradient(ellipse at 50% 60%, ${accentGlow}, transparent 70%)`, filter: "blur(20px)" }} />
          <div className="relative rounded-[28px] p-6 w-[270px] lg:w-[300px]" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.97) 0%, rgba(255,255,255,0.92) 100%)", border: "1px solid rgba(20,20,30,0.06)", boxShadow: hovered ? `0 24px 70px rgba(80,70,130,0.12), 0 2px 4px rgba(0,0,0,0.03), 0 0 40px ${accentGlow}` : "0 16px 50px rgba(80,70,130,0.08), 0 1px 3px rgba(0,0,0,0.02)", transition: "box-shadow 0.4s cubic-bezier(0.22,1,0.36,1)" }}>
            <div className="absolute top-0 left-4 right-4 h-[1px] rounded-full" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)" }} />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-300" style={{ background: accentBg, transform: hovered ? "scale(1.08)" : "scale(1)" }}>{icon}</div>
              <span className="text-[14px] font-semibold text-[#111118]">{title}</span>
            </div>
            <div>{children}</div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/* ── Analytics Card ── */
function AnalyticsCard() {
  return (
    <ProductCard title="Analytics" accentBg="linear-gradient(135deg, #EEE8FF, #E0D6FF)" accentGlow="rgba(124,92,255,0.18)" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7C5CFF" strokeWidth="2" strokeLinecap="round"><path d="M3 3v18h18" /><path d="M7 16l4-8 4 4 5-9" /></svg>} className="top-[18%] left-[7%] xl:left-[11%] 2xl:left-[15%]" delay={0.7} floatDuration={6.5} baseRotate={-5}>
      <div>
        <div className="rounded-xl p-3 mb-3" style={{ background: "linear-gradient(135deg, #F8F5FF, #F3EEFF)" }}>
          <div className="flex items-end gap-[3px] h-[58px] mb-2">
            {[30, 48, 38, 62, 50, 72, 58, 85, 68, 92, 75].map((h, i) => (<div key={i} className="flex-1 rounded-[3px]" style={{ height: `${h}%`, background: i >= 9 ? "linear-gradient(to top, #7C5CFF, #9A74FF)" : i >= 7 ? "linear-gradient(to top, #C6B5FF, #B8A5FF)" : "rgba(124,92,255,0.10)" }} />))}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#8A8FA3] font-medium">Revenus mensuels</span>
            <span className="text-[11px] font-bold text-[#7C5CFF]">+32%</span>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 rounded-lg px-3 py-2.5" style={{ background: "#FAFAFE" }}><div className="text-[9px] text-[#8A8FA3] mb-1">Ce mois</div><div className="text-[15px] font-bold text-[#111118]">4 280 €</div></div>
          <div className="flex-1 rounded-lg px-3 py-2.5" style={{ background: "#FAFAFE" }}><div className="text-[9px] text-[#8A8FA3] mb-1">Clients actifs</div><div className="text-[15px] font-bold text-[#111118]">12</div></div>
        </div>
      </div>
    </ProductCard>
  );
}

/* ── Agenda Card ── */
function AgendaCard() {
  return (
    <ProductCard title="Agenda" accentBg="linear-gradient(135deg, #EAF3FF, #D9E8FF)" accentGlow="rgba(76,141,255,0.16)" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4C8DFF" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4" /><path d="M8 2v4" /><path d="M3 10h18" /></svg>} className="bottom-[16%] left-[7%] xl:left-[11%] 2xl:left-[15%]" delay={1.1} floatDuration={5.8} baseRotate={-3}>
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[12px] font-semibold text-[#111118]">Mars 2026</span>
          <div className="flex gap-1">
            <div className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] text-[#8A8FA3]" style={{ background: "#F5F8FF" }}>‹</div>
            <div className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] text-[#8A8FA3]" style={{ background: "#F5F8FF" }}>›</div>
          </div>
        </div>
        <div className="rounded-xl p-2.5 mb-3" style={{ background: "#FAFCFF" }}>
          <div className="grid grid-cols-7 gap-[3px] mb-1.5">{["L","M","M","J","V","S","D"].map((d,i) => <div key={`h-${i}`} className="text-[8px] text-[#8A8FA3] text-center font-semibold py-0.5">{d}</div>)}</div>
          <div className="grid grid-cols-7 gap-[3px]">
            {Array.from({ length: 28 }).map((_, i) => { const sel = i === 14; const ev = i === 10 || i === 17 || i === 22; return (<div key={i} className="aspect-square rounded-md flex items-center justify-center text-[8px]" style={{ background: sel ? "linear-gradient(135deg, #4C8DFF, #72A7FF)" : ev ? "#EAF3FF" : "#F5F8FF", color: sel ? "white" : ev ? "#4C8DFF" : "#8A8FA3", fontWeight: sel || ev ? 700 : 400, boxShadow: sel ? "0 4px 12px rgba(76,141,255,0.25)" : "none" }}>{i + 1}</div>); })}
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg" style={{ background: "#EAF3FF" }}><div className="w-[3px] h-5 rounded-full" style={{ background: "linear-gradient(180deg, #4C8DFF, #72A7FF)" }} /><div><div className="text-[10px] font-semibold text-[#4C8DFF]">Call client — Marc</div><div className="text-[8px] text-[#B8D3FF]">14h — 15h</div></div></div>
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg" style={{ background: "#FAFCFF" }}><div className="w-[3px] h-5 rounded-full" style={{ background: "#B8D3FF" }} /><div><div className="text-[10px] font-semibold text-[#66697A]">Livraison montage</div><div className="text-[8px] text-[#8A8FA3]">17h</div></div></div>
        </div>
      </div>
    </ProductCard>
  );
}

/* ── Site Web Card ── */
function SiteWebCard() {
  return (
    <ProductCard title="Site web" accentBg="linear-gradient(135deg, #FFF2E8, #FFE4D0)" accentGlow="rgba(255,138,61,0.14)" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF8A3D" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg>} className="top-[18%] right-[7%] xl:right-[11%] 2xl:right-[15%]" delay={0.9} floatDuration={7} baseRotate={4}>
      <div>
        <div className="rounded-xl overflow-hidden mb-3" style={{ border: "1px solid rgba(20,20,30,0.06)" }}>
          <div className="h-6 flex items-center px-2.5 gap-1.5" style={{ background: "#FFF8F2" }}><div className="w-[7px] h-[7px] rounded-full bg-[#FF6159]" /><div className="w-[7px] h-[7px] rounded-full bg-[#FFBF2F]" /><div className="w-[7px] h-[7px] rounded-full bg-[#2ACB42]" /><div className="ml-2.5 h-3 w-20 bg-[#FFE4D0] rounded-full" /></div>
          <div className="p-3 bg-white">
            <div className="rounded-lg p-3 mb-2" style={{ background: "linear-gradient(135deg, #FFF2E8, #FFECD8)" }}><div className="h-2 rounded w-3/5 mb-2" style={{ background: "rgba(255,138,61,0.3)" }} /><div className="h-1.5 rounded w-full mb-1" style={{ background: "rgba(255,138,61,0.12)" }} /><div className="h-1.5 rounded w-4/5 mb-2.5" style={{ background: "rgba(255,138,61,0.12)" }} /><div className="h-6 w-24 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #FF8A3D, #FFB36B)", boxShadow: "0 3px 10px rgba(255,138,61,0.2)" }}><span className="text-[8px] text-white font-semibold">Voir portfolio</span></div></div>
            <div className="grid grid-cols-3 gap-1.5">{["Portfolio","Services","Contact"].map((s,i) => <div key={s} className="rounded-lg p-2" style={{ background: i === 0 ? "#FFF8F2" : "#FAFAFA" }}><div className="w-5 h-4 rounded mb-1.5" style={{ background: i === 0 ? "#FFD1A8" : "#EEECF3" }} /><div className="h-1 rounded w-4/5 mb-0.5" style={{ background: i === 0 ? "#FFD1A8" : "#EEECF3" }} /></div>)}</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">{["Hero","Portfolio","Contact","Footer"].map((b,i) => <span key={b} className="text-[9px] font-medium px-2.5 py-1 rounded-lg" style={{ background: i === 0 ? "linear-gradient(135deg, #FFF2E8, #FFE4D0)" : "#FAFAFA", color: i === 0 ? "#FF8A3D" : "#8A8FA3", fontWeight: i === 0 ? 600 : 500 }}>{b}</span>)}</div>
      </div>
    </ProductCard>
  );
}

/* ── Facturation Card ── */
function FacturationCard() {
  return (
    <ProductCard title="Facturation" accentBg="linear-gradient(135deg, #ECFDF5, #D1FAE5)" accentGlow="rgba(34,197,94,0.14)" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 14l2 2 4-4" /></svg>} className="bottom-[16%] right-[7%] xl:right-[11%] 2xl:right-[15%]" delay={1.2} floatDuration={6.2} baseRotate={3}>
      <div>
        <div className="rounded-xl p-3 mb-3" style={{ background: "linear-gradient(135deg, #F0FDF4, #ECFDF5)" }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-[#8A8FA3] font-medium">CA total</span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[8px] font-semibold" style={{ background: "#D1FAE5", color: "#16a34a" }}><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M5 12l5 5L20 7" /></svg>100/100</span>
          </div>
          <div className="text-[22px] font-bold text-[#111118] mb-2">2 870 €</div>
          <div className="flex items-end gap-[3px] h-[32px]">{[40,55,70,85,65,90,78].map((h,i) => <div key={i} className="flex-1 rounded-[3px]" style={{ height: `${h}%`, background: i >= 5 ? "linear-gradient(to top, #22c55e, #4ade80)" : "rgba(34,197,94,0.12)" }} />)}</div>
        </div>
        <div className="space-y-1.5">
          {[{ label: "Facture #042", client: "Studio Krea", amount: "1 200 €", paid: true }, { label: "Facture #043", client: "Marc D.", amount: "870 €", paid: true }, { label: "Facture #044", client: "LumièreVFX", amount: "800 €", paid: false }].map((inv) => (
            <div key={inv.label} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg" style={{ background: "#FAFDFB" }}>
              <div className="w-[3px] h-5 rounded-full" style={{ background: inv.paid ? "linear-gradient(180deg, #22c55e, #4ade80)" : "#d1d5db" }} />
              <div className="flex-1"><div className="flex items-center justify-between"><span className="text-[10px] font-semibold text-[#111118]">{inv.label}</span><span className="text-[10px] font-bold" style={{ color: inv.paid ? "#22c55e" : "#8A8FA3" }}>{inv.amount}</span></div><div className="text-[8px] text-[#8A8FA3]">{inv.client}</div></div>
            </div>
          ))}
        </div>
      </div>
    </ProductCard>
  );
}

/* ── Connector Lines ── */
function ConnectorLines() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none hidden lg:block" aria-hidden="true" style={{ zIndex: 1 }}>
      <defs><linearGradient id="connGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="rgba(124,92,255,0)" /><stop offset="50%" stopColor="rgba(124,92,255,0.12)" /><stop offset="100%" stopColor="rgba(124,92,255,0)" /></linearGradient></defs>
      <path d="M 280 240 Q 400 280 500 320" fill="none" stroke="url(#connGrad)" strokeWidth="1" strokeDasharray="4 6" />
      <path d="M 780 350 Q 680 360 580 350" fill="none" stroke="url(#connGrad)" strokeWidth="1" strokeDasharray="4 6" />
      <path d="M 300 520 Q 400 480 480 430" fill="none" stroke="url(#connGrad)" strokeWidth="1" strokeDasharray="4 6" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 1 — HERO
   ═══════════════════════════════════════════════════════════════════════ */
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-28 pb-12 overflow-hidden">
      <CreativeSignals />
      <ConnectorLines />
      <AnalyticsCard />
      <AgendaCard />
      <SiteWebCard />
      <FacturationCard />

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <motion.h1 className="mb-5" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.7, ease }}>
          <span className="block text-[38px] sm:text-[48px] md:text-[58px] lg:text-[68px] font-extrabold leading-[1.06] tracking-[-0.035em] text-[#111118]">Centralisez</span>
          <span className="block text-[38px] sm:text-[48px] md:text-[58px] lg:text-[68px] font-extrabold leading-[1.06] tracking-[-0.035em] bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #7C5CFF 0%, #A78BFA 100%)" }}>votre business freelance.</span>
        </motion.h1>

        <motion.p className="text-[16px] sm:text-[18px] leading-relaxed max-w-xl mx-auto mb-8" style={{ color: "#6B6F80" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6, ease }}>
          Tout au même endroit : clients, facturation, CRM, site et agenda.
        </motion.p>

        <motion.div className="flex flex-col sm:flex-row items-center justify-center gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.5, ease }}>
          <TextSwapButton label="Commencer gratuitement" href="/login" variant="primary" size="lg" />
          <TextSwapButton label="Voir la démo" href="#features" variant="ghost" size="md" />
        </motion.div>

        <motion.div className="mt-10 flex items-center justify-center gap-8 sm:gap-10" initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ delay: 0.85, duration: 0.8 }}>
          {[{ icon: "M4 4h16v16H4zM4 12h16M12 4v16", label: "Tout-en-un" }, { icon: "M13 10V3L4 14h7v7l9-11h-7z", label: "Modules connectés" }, { icon: "M1 4h22v16H1zM1 10h22", label: "CRM + paiements" }].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7C5CFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon} /></svg>
              <span className="text-[12px] font-medium text-[#6B6F80]">{item.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 2 — PROBLEM + SOLUTION (MERGED)
   ═══════════════════════════════════════════════════════════════════════ */
const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>
    ),
    title: "Paiements simplifiés",
    description: "Encaissez en ligne, suivez vos paiements, relancez automatiquement.",
    color: "#22C55E",
    tint: "rgba(34,197,94,0.04)",
    borderTint: "rgba(34,197,94,0.10)",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>
    ),
    title: "CRM intégré",
    description: "Centralisez prospects, clients et historique d'échanges.",
    color: "#EC4899",
    tint: "rgba(236,72,153,0.04)",
    borderTint: "rgba(236,72,153,0.10)",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 12h18M12 3v18" /></svg>
    ),
    title: "Portfolio pro",
    description: "Présentez vos projets et convertissez les visiteurs en clients.",
    color: "#A855F7",
    tint: "rgba(168,85,247,0.04)",
    borderTint: "rgba(168,85,247,0.10)",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /><path d="M9 15l2 2 4-4" /></svg>
    ),
    title: "Facturation auto",
    description: "Devis, factures, relances. Conformes et générés en 2 clics.",
    color: "#F59E0B",
    tint: "rgba(245,158,11,0.04)",
    borderTint: "rgba(245,158,11,0.10)",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg>
    ),
    title: "Suivi projets",
    description: "Suivi visuel de la demande initiale à la livraison.",
    color: "#3B82F6",
    tint: "rgba(59,130,246,0.04)",
    borderTint: "rgba(59,130,246,0.10)",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" /></svg>
    ),
    title: "Analytics",
    description: "Revenus, croissance, performances : pilotez avec des chiffres.",
    color: "#7C3AED",
    tint: "rgba(124,58,237,0.04)",
    borderTint: "rgba(124,58,237,0.10)",
  },
];

function FeatureCard({ f, i }: { f: typeof FEATURES[number]; i: number }) {
  return (
    <motion.div
      className="group relative rounded-[20px] px-6 pt-9 pb-8 text-center cursor-default"
      style={{
        background: `linear-gradient(170deg, ${f.tint}, rgba(255,255,255,0.95))`,
        border: `1px solid ${f.borderTint}`,
        boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 1px 2px rgba(0,0,0,0.02)",
      }}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: i * 0.07, duration: 0.5, ease }}
      whileHover={{
        y: -5,
        boxShadow: `0 20px 40px ${f.color}10, 0 8px 16px rgba(0,0,0,0.03)`,
        borderColor: `${f.color}25`,
      }}
    >
      {/* Glow subtil au hover */}
      <div
        className="absolute inset-0 rounded-[20px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% -20%, ${f.color}0A 0%, transparent 65%)`,
        }}
      />

      {/* Icon container */}
      <div className="relative mx-auto mb-6 w-[52px] h-[52px]">
        <div
          className="w-full h-full rounded-[14px] flex items-center justify-center transition-all duration-300 group-hover:scale-[1.08] group-hover:shadow-lg"
          style={{
            background: `linear-gradient(145deg, ${f.color}12, ${f.color}06)`,
            border: `1px solid ${f.color}15`,
            boxShadow: `0 2px 8px ${f.color}0A`,
            color: f.color,
          }}
        >
          {f.icon}
        </div>
      </div>

      {/* Titre */}
      <h3 className="text-[15px] font-semibold mb-2.5 relative" style={{ color: "#18181B" }}>
        {f.title}
      </h3>

      {/* Description */}
      <p className="text-[13px] leading-[1.65] relative max-w-[210px] mx-auto" style={{ color: "#9CA3AF" }}>
        {f.description}
      </p>
    </motion.div>
  );
}

function ProblemSolutionSection() {
  return (
    <SectionShell atmosphere="system" id="features">
      <div className="py-16 sm:py-20">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
        >
          <h2 className="text-[28px] sm:text-[42px] font-bold leading-[1.15] text-[#18181B]">
            Arrêtez de jongler entre{" "}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #7C5CFF, #A78BFA)" }}>10 outils.</span>
          </h2>
          <p className="text-[15px] sm:text-[17px] mt-4 max-w-[480px] mx-auto" style={{ color: "#6B7280" }}>
            Clients, paiements, projets, CRM... tout est dispersé. Jestly centralise tout.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 max-w-[920px] mx-auto">
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.title} f={f} i={i} />
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 3 — SOCIAL PROOF (PREMIUM)
   ═══════════════════════════════════════════════════════════════════════ */
const METRICS = [
  {
    value: "5h",
    label: "gagnées par semaine",
    sub: "en moyenne par freelance",
    color: "#7C5CFF",
    tint: "rgba(124,92,255,0.06)",
    borderTint: "rgba(124,92,255,0.12)",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>,
  },
  {
    value: "6",
    label: "outils remplacés",
    sub: "un seul cockpit freelance",
    color: "#22C55E",
    tint: "rgba(34,197,94,0.06)",
    borderTint: "rgba(34,197,94,0.12)",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg>,
  },
  {
    value: "100%",
    label: "centralisé",
    sub: "clients, projets, paiements",
    color: "#3B82F6",
    tint: "rgba(59,130,246,0.06)",
    borderTint: "rgba(59,130,246,0.12)",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>,
  },
];

const TESTIMONIALS = [
  {
    name: "Clara Dubois",
    role: "Directrice artistique",
    location: "Paris",
    initials: "CD",
    color: "#EC4899",
    tint: "rgba(236,72,153,0.04)",
    borderTint: "rgba(236,72,153,0.10)",
    quote: "Avant Jestly, je passais plus de temps à gérer l'admin qu'à créer. Maintenant tout est centralisé — clients, factures, portfolio. Je me concentre enfin sur mon métier de directrice artistique.",
  },
  {
    name: "Lucas Martin",
    role: "Développeur freelance",
    location: "Lyon",
    initials: "LM",
    color: "#3B82F6",
    tint: "rgba(59,130,246,0.04)",
    borderTint: "rgba(59,130,246,0.10)",
    quote: "J'avais une stack de 6 outils pour gérer mon activité. Jestly a tout remplacé en une seule plateforme. Suivi de projets, CRM, facturation : un seul endroit. J'ai retrouvé le temps de coder.",
  },
];

function StatCard({ m, i }: { m: typeof METRICS[number]; i: number }) {
  return (
    <motion.div
      className="group relative text-center rounded-[18px] px-5 py-6 sm:py-7"
      style={{
        background: `linear-gradient(160deg, ${m.tint}, rgba(255,255,255,0.96))`,
        border: `1px solid ${m.borderTint}`,
        boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
      }}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.08, duration: 0.5, ease }}
      whileHover={{ y: -3, boxShadow: `0 12px 30px ${m.color}10` }}
    >
      <div className="flex items-center justify-center mb-3" style={{ color: m.color }}>
        {m.icon}
      </div>
      <div className="text-[32px] sm:text-[38px] font-extrabold leading-none" style={{ color: m.color }}>
        {m.value}
      </div>
      <div className="text-[13px] font-semibold mt-2" style={{ color: "#18181B" }}>
        {m.label}
      </div>
      <div className="text-[11px] mt-1" style={{ color: "#9CA3AF" }}>
        {m.sub}
      </div>
    </motion.div>
  );
}

function TestimonialCard({ t, i }: { t: typeof TESTIMONIALS[number]; i: number }) {
  return (
    <motion.div
      className="group relative rounded-[20px] p-6 sm:p-7"
      style={{
        background: `linear-gradient(170deg, ${t.tint}, rgba(255,255,255,0.96))`,
        border: `1px solid ${t.borderTint}`,
        boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
      }}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1 + i * 0.08, duration: 0.5, ease }}
      whileHover={{ y: -3, boxShadow: `0 12px 30px ${t.color}0C` }}
    >
      {/* Guillemet décoratif */}
      <div className="text-[40px] leading-none font-serif mb-2 select-none" style={{ color: `${t.color}20` }}>"</div>

      <blockquote className="text-[14px] sm:text-[15px] leading-[1.7] mb-6" style={{ color: "#3F3F46" }}>
        {t.quote}
      </blockquote>

      <div className="flex items-center gap-3.5">
        {/* Avatar premium */}
        <div
          className="w-10 h-10 rounded-[12px] flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${t.color}, #7C5CFF)` }}
        >
          {t.initials}
        </div>
        <div>
          <div className="text-[13px] font-semibold" style={{ color: "#18181B" }}>{t.name}</div>
          <div className="text-[12px]" style={{ color: "#9CA3AF" }}>
            {t.role} · {t.location}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SocialProofSection() {
  return (
    <SectionShell atmosphere="editorial">
      <div className="relative py-16 sm:py-20 overflow-hidden">
        {/* Glow de fond subtil */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full pointer-events-none" style={{ background: "radial-gradient(ellipse, rgba(124,92,255,0.04) 0%, transparent 70%)" }} />

        {/* Header */}
        <motion.div
          className="relative text-center mb-12 sm:mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium mb-5" style={{ background: "rgba(124,92,255,0.08)", color: "#7C5CFF", border: "1px solid rgba(124,92,255,0.12)" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg>
            Pensé pour les freelances créatifs
          </div>

          <h2 className="text-[28px] sm:text-[42px] font-bold leading-[1.15] text-[#18181B]">
            Moins d&apos;outils. Plus de clarté.{" "}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #7C5CFF, #A78BFA)" }}>Plus de business.</span>
          </h2>
          <p className="text-[15px] sm:text-[17px] mt-4 max-w-[520px] mx-auto" style={{ color: "#6B7280" }}>
            CRM, facturation, portfolio, gestion de projets — les freelances qui utilisent Jestly gagnent en moyenne 5 heures par semaine et pilotent toute leur activité depuis un seul endroit.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-[720px] mx-auto mb-12 sm:mb-14">
          {METRICS.map((m, i) => (
            <StatCard key={m.label} m={m} i={i} />
          ))}
        </div>

        {/* Témoignages */}
        <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 max-w-[800px] mx-auto">
          {TESTIMONIALS.map((t, i) => (
            <TestimonialCard key={t.name} t={t} i={i} />
          ))}
        </div>

        {/* Ligne de réassurance */}
        <motion.div
          className="relative text-center mt-10 sm:mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <p className="text-[13px] font-medium" style={{ color: "#9CA3AF" }}>
            Gratuit pour démarrer · Aucune carte requise · Prêt en 2 minutes
          </p>
        </motion.div>
      </div>
    </SectionShell>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 4 — CTA FINAL
   ═══════════════════════════════════════════════════════════════════════ */
function FinalCTA() {
  return (
    <SectionShell atmosphere="elevated">
      <div className="py-14 sm:py-16">
        <motion.div
          className="text-center rounded-[24px] px-6 py-12 sm:py-14"
          style={{ background: "linear-gradient(135deg, rgba(124,92,255,0.06), rgba(124,92,255,0.02))", border: "1px solid rgba(124,92,255,0.1)" }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
        >
          <h2 className="text-[26px] sm:text-[38px] font-bold leading-tight max-w-[560px] mx-auto text-[#111118]">
            Arrêtez de perdre du temps.{" "}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #7C5CFF, #A78BFA)" }}>Centralisez tout.</span>
          </h2>
          <p className="text-[15px] sm:text-[16px] mt-3 max-w-[420px] mx-auto" style={{ color: "#6B7280" }}>
            Gratuit pour commencer. Aucun engagement. Prêt en 2 minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <TextSwapButton label="Commencer gratuitement" href="/login" variant="primary" size="lg" />
            <TextSwapButton label="Voir la démo" href="/" variant="ghost" size="md" />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-6">
            {["Gratuit pour commencer", "Aucun engagement", "Export libre", "Support inclus"].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7C5CFF" strokeWidth="2.5" strokeLinecap="round"><path d="M5 13l4 4L19 7" /></svg>
                <span className="text-[11px] font-medium" style={{ color: "#8A8FA3" }}>{item}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </SectionShell>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  return (
    <div className="min-h-screen relative">
      <Background />
      <HeroPixelGridBackground />
      <main>
        <Hero />
        <InteractiveFeatures />
        <ProblemSolutionSection />
        <SocialProofSection />
        <DemosSoon />
        <FinalCTA />
      </main>
    </div>
  );
}
