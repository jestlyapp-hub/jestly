"use client";
import { memo } from "react";
import type { TrustBadgesBlockContent } from "@/types";

function TrustBadgesBlockPreviewInner({ content }: { content: TrustBadgesBlockContent }) {
  const badges = content.badges?.length ? content.badges : [
    { icon: "shield", title: "Paiement securise", description: "Transactions chiffrees SSL" },
    { icon: "clock", title: "Livraison rapide", description: "Sous 48h ouvrees" },
    { icon: "star", title: "Satisfaction garantie", description: "Rembourse sous 30 jours" },
    { icon: "users", title: "+500 clients", description: "Nous font confiance" },
  ];

  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        {content.title && (
          <h2
            className="text-2xl font-bold mb-10 text-center"
            style={{ color: "var(--site-text, #191919)", fontFamily: "var(--site-heading-font, inherit)" }}
          >
            {content.title}
          </h2>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {badges.map((badge, i) => (
            <div key={i} className="flex flex-col items-center text-center p-6 rounded-xl" style={{ backgroundColor: "var(--site-surface, #F7F7F5)", border: "1px solid var(--site-border, #E6E6E4)" }}>
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: "var(--site-primary-light, #EEF2FF)" }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--site-primary, #4F46E5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3
                className="text-sm font-semibold mb-1"
                style={{ color: "var(--site-text, #191919)", fontFamily: "var(--site-heading-font, inherit)" }}
              >
                {badge.title}
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--site-muted, #666)" }}>
                {badge.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(TrustBadgesBlockPreviewInner);
