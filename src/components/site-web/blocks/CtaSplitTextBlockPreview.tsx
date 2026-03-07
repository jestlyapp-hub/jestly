"use client";
import { memo } from "react";
import type { CtaSplitTextBlockContent } from "@/types";

function CtaSplitTextBlockPreview({ content }: { content: CtaSplitTextBlockContent }) {
  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
        {/* Left: text */}
        <div className="flex-1">
          <h2
            className="text-3xl font-bold mb-4"
            style={{ color: "var(--site-text, #1A1A1A)", fontFamily: "var(--site-heading-font, inherit)" }}
          >
            {content.title}
          </h2>
          <p className="text-[15px] leading-relaxed" style={{ color: "var(--site-muted, #666)" }}>
            {content.description}
          </p>
        </div>

        {/* Right: CTA buttons */}
        <div className="flex-shrink-0 flex flex-col sm:flex-row gap-3">
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
          {content.secondaryCtaLabel && (
            <button
              className="px-8 py-3.5 text-[15px] font-semibold transition-opacity hover:opacity-90"
              style={{
                backgroundColor: "transparent",
                color: "var(--site-text, #1A1A1A)",
                borderRadius: "var(--site-btn-radius, 8px)",
                border: "1px solid var(--site-border, #E6E6E4)",
              }}
            >
              {content.secondaryCtaLabel}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

export default memo(CtaSplitTextBlockPreview);
