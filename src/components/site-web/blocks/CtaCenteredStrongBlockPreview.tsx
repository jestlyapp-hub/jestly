"use client";
import { memo } from "react";
import type { CtaCenteredStrongBlockContent } from "@/types";

function CtaCenteredStrongBlockPreview({ content }: { content: CtaCenteredStrongBlockContent }) {
  return (
    <section className="py-20 px-6">
      <div className="max-w-3xl mx-auto text-center">
        {content.title && (
          <h2
            className="text-2xl sm:text-4xl font-bold mb-4"
            style={{ color: "var(--site-text, #191919)", fontFamily: "var(--site-heading-font, inherit)" }}
          >
            {content.title}
          </h2>
        )}
        {content.subtitle && (
          <p className="text-[16px] mb-10 max-w-xl mx-auto" style={{ color: "var(--site-muted, #666)" }}>
            {content.subtitle}
          </p>
        )}

        <div className="flex items-center justify-center gap-4 flex-wrap">
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
                color: "var(--site-text, #191919)",
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

export default memo(CtaCenteredStrongBlockPreview);
