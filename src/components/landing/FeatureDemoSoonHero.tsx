"use client";

import { motion } from "framer-motion";

interface FeatureDemoSoonHeroProps {
  accentColor: string;
  featureName: string;
}

const ease = [0.22, 1, 0.36, 1] as const;

export default function FeatureDemoSoonHero({ accentColor, featureName }: FeatureDemoSoonHeroProps) {
  return (
    <motion.div
      id="demo"
      className="relative overflow-hidden rounded-2xl"
      style={{
        background: `linear-gradient(145deg, ${accentColor}08, ${accentColor}14, ${accentColor}06)`,
        border: `1px solid ${accentColor}18`,
      }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.35, ease }}
    >
      {/* Ghost UI lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top bar mock */}
        <div className="absolute top-0 left-0 right-0 h-10 flex items-center gap-2 px-5" style={{ background: `${accentColor}06`, borderBottom: `1px solid ${accentColor}0A` }}>
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: `${accentColor}20` }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: `${accentColor}15` }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: `${accentColor}10` }} />
          </div>
          <div className="ml-3 h-2.5 w-32 rounded-full" style={{ background: `${accentColor}10` }} />
        </div>

        {/* Sidebar mock */}
        <div className="absolute top-10 left-0 w-[140px] bottom-0 hidden sm:flex flex-col gap-2.5 pt-5 px-3" style={{ borderRight: `1px solid ${accentColor}0A` }}>
          {[40, 28, 36, 24, 32, 20].map((w, i) => (
            <div key={i} className="h-2 rounded-full" style={{ width: `${w + 20}%`, background: `${accentColor}${i === 0 ? "18" : "0A"}` }} />
          ))}
        </div>

        {/* Content area mock */}
        <div className="absolute top-14 left-[140px] right-4 hidden sm:flex flex-col gap-3 p-4">
          <div className="h-5 w-48 rounded" style={{ background: `${accentColor}0C` }} />
          <div className="grid grid-cols-3 gap-2.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-lg p-3 space-y-2" style={{ background: `${accentColor}06`, border: `1px solid ${accentColor}08` }}>
                <div className="h-2 w-3/4 rounded-full" style={{ background: `${accentColor}12` }} />
                <div className="h-2 w-1/2 rounded-full" style={{ background: `${accentColor}0A` }} />
              </div>
            ))}
          </div>
          <div className="flex gap-2.5 mt-1">
            {[60, 45, 55].map((w, i) => (
              <div key={i} className="h-8 rounded-md" style={{ width: `${w}%`, background: `${accentColor}08` }} />
            ))}
          </div>
        </div>

        {/* Halo */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full blur-[100px] pointer-events-none"
          style={{ background: `${accentColor}12` }}
        />
      </div>

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center justify-center py-24 sm:py-32 md:py-36 px-6">
        {/* Play icon subtle */}
        <motion.div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
          style={{ background: `${accentColor}12`, border: `1px solid ${accentColor}20` }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5, ease }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
            <polygon points="6 3 20 12 6 21 6 3" />
          </svg>
        </motion.div>

        {/* Badge */}
        <motion.span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-4"
          style={{ background: `${accentColor}12`, color: accentColor, border: `1px solid ${accentColor}20` }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.55, ease }}
        >
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: accentColor }} />
          Bientôt
        </motion.span>

        {/* Title */}
        <motion.h3
          className="text-[18px] sm:text-[20px] font-bold tracking-[-0.01em] mb-2"
          style={{ color: "#191919" }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6, ease }}
        >
          Démo {featureName} en préparation
        </motion.h3>

        {/* Subtitle */}
        <motion.p
          className="text-[14px] max-w-sm text-center leading-relaxed"
          style={{ color: "#8A8A88" }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.65, ease }}
        >
          Une démonstration guidée de cette fonctionnalité arrive très bientôt.
        </motion.p>
      </div>
    </motion.div>
  );
}
