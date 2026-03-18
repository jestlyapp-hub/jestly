"use client";

import { motion } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════════════
   AuthLayout — Shared split layout for Login + Signup
   LEFT (42%): WHITE form slot | RIGHT (58%): PURPLE immersive visual
   ═══════════════════════════════════════════════════════════════════════ */

interface FloatCard {
  label: string;
  sub: string;
  x: string;
  y: string;
  delay: number;
  color: string;
}

interface AuthLayoutProps {
  children: React.ReactNode;
  headline: string;
  floatCards?: FloatCard[];
}

const DEFAULT_CARDS: FloatCard[] = [
  { label: "+2 400 €", sub: "Encaissé ce mois", x: "15%", y: "18%", delay: 0, color: "#10B981" },
  { label: "Nouveau lead", sub: "Sophie Martin", x: "65%", y: "14%", delay: 1, color: "#EC4899" },
  { label: "Projet livré", sub: "Brand Kit", x: "60%", y: "58%", delay: 2, color: "#3B82F6" },
  { label: "Site en ligne", sub: "julie.jestly.fr", x: "18%", y: "65%", delay: 1.5, color: "#FF8A3D" },
  { label: "+32%", sub: "Croissance", x: "42%", y: "82%", delay: 2.5, color: "#F59E0B" },
];

export default function AuthLayout({ children, headline, floatCards = DEFAULT_CARDS }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ═══ LEFT: White form panel ═══ */}
      <div className="lg:w-[42%] flex-shrink-0 flex items-center justify-center px-6 sm:px-10 py-12 lg:py-0 bg-white relative">
        <div className="relative z-10 w-full max-w-[380px]">
          {children}
        </div>
      </div>

      {/* ═══ RIGHT: Purple immersive ═══ */}
      <div className="flex-1 relative overflow-hidden hidden lg:flex items-center justify-center" style={{ background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 40%, #4C1D95 100%)", minHeight: "100vh" }}>

        {/* Grid */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.08]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />

        {/* Floating blurred shapes */}
        <motion.div className="absolute w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.08), transparent 60%)", top: "-10%", right: "-8%" }} animate={{ x: [0, -25, 0], y: [0, 20, 0] }} transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="absolute w-[400px] h-[400px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.05), transparent 60%)", bottom: "-8%", left: "-5%" }} animate={{ x: [0, 20, 0], y: [0, -18, 0] }} transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }} />

        {/* Center content */}
        <div className="relative z-10 text-center px-12 max-w-lg">
          <motion.h2
            className="text-[32px] sm:text-[40px] font-extrabold text-white leading-[1.1] tracking-[-0.03em] mb-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {headline}
          </motion.h2>
          <motion.p
            className="text-[15px] leading-relaxed text-white/50"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            Clients, paiements, portfolio — tout au même endroit.
          </motion.p>

          {/* Social proof */}
          <motion.div className="flex items-center justify-center gap-3 mt-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.7 }}>
            <div className="flex -space-x-2">
              {["#7C5CFF", "#EC4899", "#10B981", "#F59E0B"].map((c, i) => (
                <div key={i} className="w-7 h-7 rounded-full border-2 border-white/20 flex items-center justify-center text-[8px] font-bold text-white" style={{ background: c }}>{["S", "M", "L", "A"][i]}</div>
              ))}
            </div>
            <div className="text-left">
              <div className="text-[12px] font-semibold text-white/80">+1 200 freelancers</div>
              <div className="text-[10px] text-white/40">nous font confiance</div>
            </div>
          </motion.div>
        </div>

        {/* Float cards */}
        {floatCards.map((card, i) => (
          <motion.div
            key={i}
            className="absolute flex items-center gap-2.5 px-4 py-3 rounded-2xl pointer-events-none"
            style={{ left: card.x, top: card.y, background: "rgba(255,255,255,0.1)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1, y: [0, -6, 0] }}
            transition={{ opacity: { duration: 0.5, delay: 0.6 + i * 0.2 }, scale: { duration: 0.4, delay: 0.6 + i * 0.2 }, y: { duration: 5 + i * 1.3, repeat: Infinity, ease: "easeInOut" } }}
          >
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: card.color, boxShadow: `0 0 8px ${card.color}60` }} />
            <div>
              <div className="text-[12px] font-semibold text-white leading-tight">{card.label}</div>
              <div className="text-[9px] font-medium text-white/40 leading-tight">{card.sub}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
