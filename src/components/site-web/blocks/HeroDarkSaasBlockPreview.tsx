"use client";

import { memo } from "react";
import type { HeroDarkSaasBlockContent } from "@/types";

function HeroDarkSaasBlockPreviewInner({ content }: { content: HeroDarkSaasBlockContent }) {
  return (
    <section
      className="py-16 px-6"
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-6 sm:gap-12">
        {/* Left — Text */}
        <div className="flex-1 min-w-0">
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.1] mb-5"
            style={{
              color: "var(--site-text, #191919)",
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
                  color: "var(--site-text, #191919)",
                  borderColor: "var(--site-border, #E6E6E4)",
                  borderRadius: "var(--site-btn-radius, 8px)",
                }}
              >
                {content.secondaryCtaLabel}
              </button>
            )}
          </div>

          {/* Floating feature cards */}
          {content.features && content.features.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-10">
              {content.features.map((feat, i) => (
                <div
                  key={i}
                  className="rounded-lg p-4"
                  style={{
                    backgroundColor: "var(--site-bg, #FFFFFF)",
                    border: "1px solid var(--site-border, #E6E6E4)",
                  }}
                >
                  <div
                    className="text-sm font-semibold mb-1"
                    style={{ color: "var(--site-text, #191919)" }}
                  >
                    {feat.title}
                  </div>
                  <div
                    className="text-xs leading-relaxed"
                    style={{ color: "var(--site-muted, #666)" }}
                  >
                    {feat.description}
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
              className="aspect-[4/3] rounded-lg flex flex-col items-center justify-center gap-3 relative overflow-hidden"
              style={{
                backgroundColor: "var(--site-bg, #FFFFFF)",
                border: "1px solid var(--site-border, #E6E6E4)",
              }}
            >
              {/* Decorative grid */}
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage:
                    "linear-gradient(var(--site-text, #191919) 1px, transparent 1px), linear-gradient(90deg, var(--site-text, #191919) 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
              />
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ stroke: "var(--site-muted, #666)" }}
                className="opacity-40 relative z-10"
              >
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              <span className="text-xs relative z-10" style={{ color: "var(--site-muted, #666)" }}>
                Mockup
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default memo(HeroDarkSaasBlockPreviewInner);
