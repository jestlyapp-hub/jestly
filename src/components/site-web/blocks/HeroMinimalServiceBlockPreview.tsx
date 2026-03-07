"use client";

import { memo } from "react";
import type { HeroMinimalServiceBlockContent } from "@/types";

function HeroMinimalServiceBlockPreviewInner({ content }: { content: HeroMinimalServiceBlockContent }) {
  return (
    <section
      className="py-16 px-6"
      style={{ backgroundColor: "var(--site-bg, #FFFFFF)" }}
    >
      <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
        {content.trustBadge && (
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-5"
            style={{
              backgroundColor: "var(--site-primary-light, #EEF2FF)",
              color: "var(--site-primary, #4F46E5)",
            }}
          >
            {content.trustBadge}
          </span>
        )}

        <h1
          className="text-4xl sm:text-5xl font-bold leading-[1.1] mb-4 max-w-2xl"
          style={{
            color: "var(--site-text, #1A1A1A)",
            fontFamily: "var(--site-heading-font, inherit)",
          }}
        >
          {content.title}
        </h1>

        <p
          className="text-base leading-relaxed mb-8 max-w-xl"
          style={{ color: "var(--site-muted, #666)" }}
        >
          {content.subtitle}
        </p>

        <div className="flex items-center gap-3 flex-wrap justify-center">
          <button
            className="inline-flex items-center justify-center text-[13px] font-semibold px-6 py-3 transition-all duration-200"
            style={{
              backgroundColor: "var(--btn-bg, var(--site-primary, #4F46E5))",
              color: "var(--btn-text, #fff)",
              borderRadius: "var(--site-btn-radius, 8px)",
            }}
          >
            {content.ctaLabel}
          </button>

          {content.secondaryCtaLabel && (
            <button
              className="inline-flex items-center justify-center text-[13px] font-semibold px-6 py-3 border transition-all duration-200"
              style={{
                backgroundColor: "transparent",
                color: "var(--site-text, #1A1A1A)",
                borderColor: "var(--site-border, #E6E6E4)",
                borderRadius: "var(--site-btn-radius, 8px)",
              }}
            >
              {content.secondaryCtaLabel}
            </button>
          )}
        </div>

        {/* Proof items row */}
        {content.proofItems && content.proofItems.length > 0 && (
          <div className="flex items-center gap-6 flex-wrap justify-center mt-10 pt-6" style={{ borderTop: "1px solid var(--site-border, #E6E6E4)" }}>
            {content.proofItems.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-sm"
                style={{ color: "var(--site-muted, #666)" }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ stroke: "var(--site-primary, #4F46E5)" }}
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default memo(HeroMinimalServiceBlockPreviewInner);
