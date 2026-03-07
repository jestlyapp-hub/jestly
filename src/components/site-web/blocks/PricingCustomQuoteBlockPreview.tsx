"use client";

import { memo } from "react";
import type { PricingCustomQuoteBlockContent } from "@/types";

function PricingCustomQuoteBlockPreviewInner({ content }: { content: PricingCustomQuoteBlockContent }) {
  return (
    <section
      className="py-16 px-6"
      style={{ background: "var(--site-bg, #ffffff)" }}
    >
      <div className="max-w-2xl mx-auto text-center">
        {/* Header */}
        <h2
          className="text-3xl sm:text-4xl font-bold mb-4"
          style={{
            color: "var(--site-text, #1A1A1A)",
            fontFamily: "var(--site-heading-font, inherit)",
          }}
        >
          {content.title}
        </h2>
        <p
          className="text-base leading-relaxed mb-10"
          style={{ color: "var(--site-muted, #6b7280)" }}
        >
          {content.subtitle}
        </p>

        {/* Highlighted card */}
        <div
          className="rounded-xl p-8 text-left"
          style={{
            background: "var(--site-surface, #f9fafb)",
            border: "2px solid var(--site-primary, #4F46E5)",
          }}
        >
          {/* Features checklist */}
          {content.features.length > 0 && (
            <ul className="space-y-3 mb-8">
              {content.features.map((feat, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 text-sm"
                  style={{ color: "var(--site-text, #1A1A1A)" }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--site-primary, #4F46E5)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {feat}
                </li>
              ))}
            </ul>
          )}

          {/* CTA */}
          <button
            className="w-full py-3.5 px-4 text-base font-semibold transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "var(--btn-bg, var(--site-primary, #4F46E5))",
              color: "var(--btn-text, #fff)",
              borderRadius: "var(--site-btn-radius, 8px)",
            }}
          >
            {content.ctaLabel}
          </button>

          {/* Note */}
          {content.note && (
            <p
              className="text-xs mt-4 text-center"
              style={{ color: "var(--site-muted, #6b7280)" }}
            >
              {content.note}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default memo(PricingCustomQuoteBlockPreviewInner);
