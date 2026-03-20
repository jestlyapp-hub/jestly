"use client";
import { memo } from "react";
import type { CtaDarkGlowBlockContent } from "@/types";

function CtaDarkGlowBlockPreview({ content }: { content: CtaDarkGlowBlockContent }) {
  return (
    <section className="py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div
          className="relative overflow-hidden rounded-2xl px-10 py-16 text-center"
          style={{
            backgroundColor: "var(--site-surface, #F7F7F5)",
            border: "1px solid var(--site-border, #E6E6E4)",
          }}
        >
          {/* Glow effect */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at 50% 0%, var(--site-primary, #4F46E5) 0%, transparent 60%)",
              opacity: 0.08,
            }}
          />

          <div className="relative z-10">
            <h2
              className="text-3xl font-bold mb-3"
              style={{ color: "var(--site-text, #191919)", fontFamily: "var(--site-heading-font, inherit)" }}
            >
              {content.title}
            </h2>
            <p className="text-[15px] mb-8 max-w-lg mx-auto" style={{ color: "var(--site-muted, #666)" }}>
              {content.subtitle}
            </p>

            <button
              className="px-8 py-3.5 text-[15px] font-semibold transition-opacity hover:opacity-90"
              style={{
                backgroundColor: "var(--btn-bg, var(--site-primary, #4F46E5))",
                color: "var(--btn-text, #fff)",
                borderRadius: "var(--site-btn-radius, 8px)",
              }}
            >
              {content.ctaLabel}
            </button>

            {content.trustBadges && content.trustBadges.length > 0 && (
              <div className="flex items-center justify-center gap-6 mt-8 flex-wrap">
                {content.trustBadges.map((badge, i) => (
                  <span key={i} className="text-[13px] font-medium" style={{ color: "var(--site-muted, #666)" }}>
                    {badge}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(CtaDarkGlowBlockPreview);
