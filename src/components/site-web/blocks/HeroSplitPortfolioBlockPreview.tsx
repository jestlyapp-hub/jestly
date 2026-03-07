"use client";

import { memo } from "react";
import type { HeroSplitPortfolioBlockContent } from "@/types";

function HeroSplitPortfolioBlockPreviewInner({ content }: { content: HeroSplitPortfolioBlockContent }) {
  return (
    <section
      className="py-16 px-6"
      style={{ backgroundColor: "var(--site-bg, #FFFFFF)" }}
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
        {/* Left — Text */}
        <div className="flex-1 min-w-0">
          {content.badge && (
            <span
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-5"
              style={{
                backgroundColor: "var(--site-primary-light, #EEF2FF)",
                color: "var(--site-primary, #4F46E5)",
              }}
            >
              {content.badge}
            </span>
          )}

          <h1
            className="text-4xl sm:text-5xl font-bold leading-[1.1] mb-4"
            style={{
              color: "var(--site-text, #1A1A1A)",
              fontFamily: "var(--site-heading-font, inherit)",
            }}
          >
            {content.title}
          </h1>

          <p
            className="text-base leading-relaxed mb-8 max-w-lg"
            style={{ color: "var(--site-muted, #666)" }}
          >
            {content.subtitle}
          </p>

          <div className="flex items-center gap-3 flex-wrap">
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

          {/* Stats row */}
          {content.stats && content.stats.length > 0 && (
            <div className="flex items-center gap-8 mt-8 pt-6" style={{ borderTop: "1px solid var(--site-border, #E6E6E4)" }}>
              {content.stats.map((stat, i) => (
                <div key={i}>
                  <div
                    className="text-2xl font-bold"
                    style={{ color: "var(--site-primary, #4F46E5)" }}
                  >
                    {stat.value}
                  </div>
                  <div
                    className="text-xs mt-0.5"
                    style={{ color: "var(--site-muted, #666)" }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right — Image or placeholder */}
        <div className="flex-1 min-w-0">
          {content.imageUrl ? (
            <img
              src={content.imageUrl}
              alt={content.title}
              className="w-full rounded-lg object-cover"
              style={{ border: "1px solid var(--site-border, #E6E6E4)" }}
            />
          ) : (
            <div
              className="aspect-[4/3] rounded-lg flex flex-col items-center justify-center gap-3"
              style={{
                backgroundColor: "var(--site-surface, #F7F7F5)",
                border: "1px solid var(--site-border, #E6E6E4)",
              }}
            >
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ stroke: "var(--site-muted, #666)" }}
                className="opacity-40"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span className="text-xs" style={{ color: "var(--site-muted, #666)" }}>
                Image
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default memo(HeroSplitPortfolioBlockPreviewInner);
