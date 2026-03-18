"use client";

import { motion } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════════════
   VideoPlaceholder — Premium large video container
   ═══════════════════════════════════════════════════════════════════════ */

interface VideoPlaceholderProps {
  label?: string;
  accentColor?: string;
}

export default function VideoPlaceholder({
  label = "Démo du module",
  accentColor = "#7C3AED",
}: VideoPlaceholderProps) {
  return (
    <motion.div
      className="relative w-full max-w-[1100px] mx-auto rounded-2xl overflow-hidden group cursor-pointer"
      style={{
        aspectRatio: "16/9",
        background: `linear-gradient(135deg, ${accentColor}08, ${accentColor}15)`,
        border: "1px solid #E5E7EB",
        boxShadow: `0 20px 60px rgba(124,58,237,0.12), 0 4px 16px rgba(0,0,0,0.04)`,
      }}
      initial={{ opacity: 0, y: 28, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ boxShadow: `0 28px 80px rgba(124,58,237,0.16), 0 8px 24px rgba(0,0,0,0.06)` }}
    >
      {/* Subtle grid inside */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05]" style={{ backgroundImage: "linear-gradient(rgba(124,58,237,1) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      {/* Gradient overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 50% 40%, ${accentColor}08, transparent 70%)` }} />

      {/* Browser dots */}
      <div className="absolute top-5 left-6 flex items-center gap-2">
        <div className="w-3 h-3 rounded-full" style={{ background: "#FF5F57" }} />
        <div className="w-3 h-3 rounded-full" style={{ background: "#FEBC2E" }} />
        <div className="w-3 h-3 rounded-full" style={{ background: "#28C840" }} />
      </div>

      {/* Center play button */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
        <motion.div
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
          style={{
            background: `linear-gradient(135deg, ${accentColor}, ${accentColor}CC)`,
            boxShadow: `0 12px 40px ${accentColor}40`,
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="white" className="ml-1">
            <path d="M8 5v14l11-7z" />
          </svg>
        </motion.div>
        <span className="text-[13px] font-medium" style={{ color: "#9CA3AF" }}>{label}</span>
      </div>
    </motion.div>
  );
}
