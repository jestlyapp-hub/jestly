"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 4 — "Gain de temps"
   Big stats with animated counters
   ═══════════════════════════════════════════════════════════════════════ */

const ease = [0.22, 1, 0.36, 1] as const;

const STATS = [
  { value: 40, suffix: "%", label: "de temps gagné", description: "Moins d'admin, plus de création.", color: "#7C5CFF" },
  { value: 3, suffix: "", prefix: "-", label: "outils en moins", description: "Tout est réuni au même endroit.", color: "#10B981" },
  { value: 2, suffix: "x", label: "plus d'organisation", description: "Pipeline clair, deadlines maîtrisées.", color: "#3B82F6" },
  { value: 100, suffix: "%", label: "paiements suivis", description: "Plus aucune facture oubliée.", color: "#F59E0B" },
];

function Counter({ value, suffix, prefix, color }: { value: number; suffix: string; prefix?: string; color: string }) {
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

  return <span ref={ref} className="text-[40px] sm:text-[52px] font-extrabold tabular-nums" style={{ color }}>{prefix}{display}{suffix}</span>;
}

export default function ConnectedModulesSection() {
  return (
    <section className="relative py-24 sm:py-32 lg:py-36 px-6 overflow-hidden" style={{ background: "white" }}>
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{ backgroundImage: "linear-gradient(rgba(124,92,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(124,92,255,1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <motion.span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-semibold mb-5" style={{ background: "rgba(124,92,255,0.08)", color: "#7C5CFF", border: "1px solid rgba(124,92,255,0.12)" }} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease }}>
            Impact
          </motion.span>
          <motion.h2 className="text-[26px] sm:text-[36px] md:text-[44px] font-extrabold leading-[1.1] tracking-[-0.03em] mb-4" style={{ color: "#111118" }} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.08, ease }}>
            Des résultats<span className="bg-clip-text text-transparent ml-2" style={{ backgroundImage: "linear-gradient(135deg, #7C5CFF, #9F7BFF)" }}>concrets</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              className="rounded-[24px] p-7 sm:p-8 group hover:-translate-y-1 transition-all duration-300"
              style={{ background: "#F7F7FB", border: "1px solid rgba(0,0,0,0.05)" }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1, ease }}
            >
              <Counter value={s.value} suffix={s.suffix} prefix={s.prefix} color={s.color} />
              <div className="text-[15px] font-bold mt-1 mb-1.5" style={{ color: "#111118" }}>{s.label}</div>
              <p className="text-[13px] leading-relaxed" style={{ color: "#66697A" }}>{s.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
