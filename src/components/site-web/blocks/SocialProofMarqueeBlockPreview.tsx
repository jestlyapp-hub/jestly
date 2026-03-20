"use client";
import { memo } from "react";
import type { SocialProofMarqueeBlockContent } from "@/types";

function SocialProofMarqueeBlockPreviewInner({ content }: { content: SocialProofMarqueeBlockContent }) {
  const items = content.items?.length ? content.items : [
    { text: "Un service exceptionnel, je recommande vivement !", name: "Marie D.", result: "+200% CA" },
    { text: "Professionnel et à l\u2019écoute. Résultat au-delà de mes attentes.", name: "Thomas L.", result: "5/5" },
    { text: "Collaboration fluide et livraison rapide.", name: "Sophie M." },
    { text: "La qualité du travail est remarquable.", name: "Pierre R.", result: "Top 1%" },
    { text: "Je referai appel sans hésiter.", name: "Julie B." },
    { text: "Excellent rapport qualité-prix.", name: "Marc V.", result: "+150 leads" },
  ];

  return (
    <section className="py-16 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="flex gap-5 flex-nowrap overflow-hidden">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-72 rounded-xl p-6"
              style={{
                backgroundColor: "var(--site-surface, #F7F7F5)",
                border: "1px solid var(--site-border, #E6E6E4)",
              }}
            >
              <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--site-text, #191919)" }}>
                &ldquo;{item.text}&rdquo;
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold" style={{ color: "var(--site-muted, #666)" }}>
                  {item.name}
                </span>
                {item.result && (
                  <span
                    className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                    style={{
                      backgroundColor: "var(--site-primary-light, #EEF2FF)",
                      color: "var(--site-primary, #4F46E5)",
                    }}
                  >
                    {item.result}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(SocialProofMarqueeBlockPreviewInner);
