"use client";

/**
 * BetaPricingLock — Overlay premium pour verrouiller les zones pricing pendant la bêta.
 *
 * Affiche le contenu enfant flouté avec un overlay cadenas + message.
 * Réutilisable sur n'importe quelle surface pricing / billing.
 *
 * Usage :
 *   <BetaPricingLock>
 *     <PricingCards />
 *   </BetaPricingLock>
 */

import { type ReactNode } from "react";

interface BetaPricingLockProps {
  children: ReactNode;
  /** Titre principal de l'overlay */
  title?: string;
  /** Sous-texte explicatif */
  subtitle?: string;
}

export default function BetaPricingLock({
  children,
  title = "Abonnements disponibles prochainement",
  subtitle = "Pendant la bêta, toutes les fonctionnalités sont incluses gratuitement.",
}: BetaPricingLockProps) {
  return (
    <div className="relative rounded-2xl overflow-hidden">
      {/* Contenu flouté */}
      <div
        className="pointer-events-none select-none"
        aria-hidden="true"
        style={{ filter: "blur(6px)", opacity: 0.35 }}
      >
        {children}
      </div>

      {/* Overlay glass */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px]" />

        {/* Contenu centré */}
        <div className="relative flex flex-col items-center gap-4 px-6 py-8 max-w-sm text-center">
          {/* Cadenas */}
          <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] border border-[#DDD6FE] flex items-center justify-center shadow-sm">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#4F46E5"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>

          {/* Badge bêta */}
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#4F46E5] bg-[#EEF2FF] border border-[#DDD6FE] px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5]" />
            Bêta
          </span>

          {/* Texte */}
          <h3 className="text-[16px] font-bold text-[#191919] leading-snug">
            {title}
          </h3>
          <p className="text-[13px] text-[#8A8A88] leading-relaxed">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}
