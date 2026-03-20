"use client";

import { memo } from "react";
import type { HeroCreatorBrandBlockContent } from "@/types";

function HeroCreatorBrandBlockPreviewInner({ content }: { content: HeroCreatorBrandBlockContent }) {
  return (
    <section
      className="py-16 px-6"
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
        {/* Left — Portrait / image placeholder */}
        <div className="flex-1 min-w-0 flex justify-center">
          {content.imageUrl ? (
            <img
              src={content.imageUrl}
              alt={content.title}
              className="w-72 h-72 rounded-2xl object-cover"
              style={{ border: "1px solid var(--site-border, #E6E6E4)" }}
            />
          ) : (
            <div
              className="w-72 h-72 rounded-2xl flex flex-col items-center justify-center gap-3"
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
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span className="text-xs" style={{ color: "var(--site-muted, #666)" }}>
                Portrait
              </span>
            </div>
          )}
        </div>

        {/* Right — Content */}
        <div className="flex-1 min-w-0">
          <h1
            className="text-4xl sm:text-5xl font-bold leading-[1.1] mb-3"
            style={{
              color: "var(--site-text, #191919)",
              fontFamily: "var(--site-heading-font, inherit)",
            }}
          >
            {content.title}
          </h1>

          <p
            className="text-base leading-relaxed mb-5 max-w-lg"
            style={{ color: "var(--site-muted, #666)" }}
          >
            {content.subtitle}
          </p>

          {/* Credentials chips */}
          {content.credentials && content.credentials.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mb-6">
              {content.credentials.map((cred, i) => (
                <span
                  key={i}
                  className="text-[11px] font-medium px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: "var(--site-surface, #F7F7F5)",
                    color: "var(--site-text, #191919)",
                    border: "1px solid var(--site-border, #E6E6E4)",
                  }}
                >
                  {cred}
                </span>
              ))}
            </div>
          )}

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

          {/* Social proof numbers */}
          {content.socialProof && content.socialProof.length > 0 && (
            <div className="flex items-center gap-8 mt-8 pt-6" style={{ borderTop: "1px solid var(--site-border, #E6E6E4)" }}>
              {content.socialProof.map((sp, i) => (
                <div key={i}>
                  <div
                    className="text-2xl font-bold"
                    style={{ color: "var(--site-primary, #4F46E5)" }}
                  >
                    {sp.value}
                  </div>
                  <div
                    className="text-xs mt-0.5"
                    style={{ color: "var(--site-muted, #666)" }}
                  >
                    {sp.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default memo(HeroCreatorBrandBlockPreviewInner);
