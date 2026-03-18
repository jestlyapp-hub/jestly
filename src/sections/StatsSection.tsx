"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import SectionShell from "@/components/landing/SectionShell";

/* ═══════════════════════════════════════════════════════════════════════
   RÉSULTATS — Premium impact snapshot
   1 hero metric + 3 secondary. Editorial hierarchy.
   ═══════════════════════════════════════════════════════════════════════ */

const ease = [0.22, 1, 0.36, 1] as const;

const HERO_STAT = {
  value: 40, suffix: "%", label: "de temps gagné", description: "Moins d'admin, plus de temps pour votre métier. Jestly automatise ce qui vous ralentit.", color: "#7C5CFF",
};

const SECONDARY_STATS = [
  { value: 3, suffix: "", prefix: "-", label: "outils en moins", description: "Tout est réuni au même endroit.", color: "#10B981", icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" },
  { value: 2, suffix: "x", label: "plus d'organisation", description: "Pipeline clair, deadlines maîtrisées.", color: "#3B82F6", icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 14l2 2 4-4" },
  { value: 100, suffix: "%", label: "paiements suivis", description: "Plus aucune facture oubliée.", color: "#F59E0B", icon: "M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" },
];

function Counter({ value, suffix, prefix, color, className }: { value: number; suffix: string; prefix?: string; color: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const steps = 25;
    const inc = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += inc;
      if (current >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(Math.floor(current));
    }, 40);
    return () => clearInterval(timer);
  }, [inView, value]);

  return <span ref={ref} className={`font-extrabold tabular-nums ${className || ""}`} style={{ color }}>{prefix}{display}{suffix}</span>;
}

export default function StatsSection() {
  return (
    <SectionShell atmosphere="editorial">
        {/* Header */}
        <div className="text-center mb-16 sm:mb-20">
          <motion.span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-semibold mb-6" style={{ background: "rgba(124,92,255,0.08)", color: "#7C5CFF", border: "1px solid rgba(124,92,255,0.12)" }} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease }}>
            Impact
          </motion.span>
          <motion.h2 className="text-[28px] sm:text-[38px] md:text-[46px] font-extrabold leading-[1.08] tracking-[-0.03em]" style={{ color: "#111118" }} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.08, ease }}>
            Des résultats<span className="bg-clip-text text-transparent ml-2" style={{ backgroundImage: "linear-gradient(135deg, #7C5CFF, #9F7BFF)" }}>concrets</span>
          </motion.h2>
        </div>

        {/* Hero metric */}
        <motion.div
          className="rounded-[28px] p-8 sm:p-12 mb-5 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgba(124,92,255,0.04) 0%, rgba(124,92,255,0.08) 100%)", border: "1px solid rgba(124,92,255,0.1)" }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
        >
          {/* Decorative glow */}
          <div className="absolute -right-20 -top-20 w-[300px] h-[300px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(124,92,255,0.06), transparent 70%)" }} />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <Counter value={HERO_STAT.value} suffix={HERO_STAT.suffix} color={HERO_STAT.color} className="text-[56px] sm:text-[72px] md:text-[80px] leading-none" />
              <div className="text-[18px] sm:text-[20px] font-bold mt-2 mb-2" style={{ color: "#111118" }}>{HERO_STAT.label}</div>
              <p className="text-[14px] sm:text-[15px] leading-relaxed max-w-sm" style={{ color: "#66697A" }}>{HERO_STAT.description}</p>
            </div>
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "rgba(124,92,255,0.08)" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7C5CFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
          </div>
        </motion.div>

        {/* Secondary metrics — 3 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          {SECONDARY_STATS.map((s, i) => (
            <motion.div
              key={s.label}
              className="rounded-[22px] p-6 sm:p-7 transition-all duration-300 hover:-translate-y-0.5"
              style={{ background: "#F8F8FC", border: "1px solid rgba(0,0,0,0.04)" }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.08, ease }}
            >
              <div className="flex items-start justify-between mb-4">
                <Counter value={s.value} suffix={s.suffix} prefix={s.prefix} color={s.color} className="text-[32px] sm:text-[36px] leading-none" />
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${s.color}0A` }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={s.icon} /></svg>
                </div>
              </div>
              <div className="text-[14px] font-bold mb-1" style={{ color: "#111118" }}>{s.label}</div>
              <p className="text-[12px] leading-relaxed" style={{ color: "#8A8FA3" }}>{s.description}</p>
            </motion.div>
          ))}
        </div>
    </SectionShell>
  );
}
