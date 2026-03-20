"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface HighlightZone {
  /** Position X en pourcentage (0-100) */
  x: number;
  /** Position Y en pourcentage (0-100) */
  y: number;
  /** Largeur en pourcentage (0-100), optionnel — si absent, affiche un dot pulsant */
  w?: number;
  /** Hauteur en pourcentage (0-100) */
  h?: number;
}

interface GuideStepCardProps {
  stepNumber: number;
  text: string;
  accentColor: string;
  /** Chemin vers un screenshot réel dans /public/guide/ (ex: "/guide/create-site-step1.png") */
  screenshot?: string;
  /** Zone à highlighter sur le screenshot */
  highlight?: HighlightZone;
  /** Label du highlight (ex: "Cliquez ici") */
  highlightLabel?: string;
}

export default function GuideStepCard({
  stepNumber,
  text,
  accentColor,
  screenshot,
  highlight,
  highlightLabel,
}: GuideStepCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: stepNumber * 0.08,
        ease: "easeOut" as const,
      }}
      className="flex items-start gap-3"
    >
      {/* Step number */}
      <span
        className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold text-white mt-0.5"
        style={{ backgroundColor: accentColor }}
      >
        {stepNumber}
      </span>

      <div className="flex-1 min-w-0">
        {/* Step text */}
        <p className="text-[13px] text-[#5A5A58] leading-relaxed">{text}</p>

        {/* Screenshot (only if provided) */}
        {screenshot && (
          <div className="mt-3 relative rounded-lg border border-[#E6E6E4] overflow-hidden shadow-sm">
            <Image
              src={screenshot}
              alt={`Étape ${stepNumber}`}
              width={800}
              height={450}
              className="w-full h-auto block"
              unoptimized
            />

            {/* Highlight overlay */}
            {highlight && (
              <>
                {highlight.w && highlight.h ? (
                  /* Zone rectangle highlight */
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      left: `${highlight.x}%`,
                      top: `${highlight.y}%`,
                      width: `${highlight.w}%`,
                      height: `${highlight.h}%`,
                    }}
                  >
                    {/* Pulsing border */}
                    <motion.div
                      className="absolute inset-0 rounded-md border-2"
                      style={{ borderColor: accentColor }}
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                    {/* Tinted overlay */}
                    <div
                      className="absolute inset-0 rounded-md"
                      style={{ backgroundColor: accentColor, opacity: 0.08 }}
                    />
                    {/* Label */}
                    {highlightLabel && (
                      <div
                        className="absolute -top-7 left-0 text-[11px] font-semibold px-2 py-0.5 rounded shadow-sm whitespace-nowrap"
                        style={{ backgroundColor: accentColor, color: "#fff" }}
                      >
                        {highlightLabel}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Dot pulsant */
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      left: `${highlight.x}%`,
                      top: `${highlight.y}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    {/* Pulse ring */}
                    <motion.div
                      className="absolute rounded-full"
                      style={{
                        width: 28,
                        height: 28,
                        left: -8,
                        top: -8,
                        backgroundColor: accentColor,
                      }}
                      animate={{ scale: [1, 2], opacity: [0.35, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" as const }}
                    />
                    {/* Dot */}
                    <div
                      className="w-3 h-3 rounded-full shadow-lg ring-2 ring-white"
                      style={{ backgroundColor: accentColor }}
                    />
                    {/* Label */}
                    {highlightLabel && (
                      <div
                        className="absolute left-6 top-1/2 -translate-y-1/2 text-[11px] font-semibold px-2 py-0.5 rounded shadow-sm whitespace-nowrap"
                        style={{ backgroundColor: accentColor, color: "#fff" }}
                      >
                        {highlightLabel}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
