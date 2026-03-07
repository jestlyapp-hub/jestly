"use client";

import { memo } from "react";
import type { ProductBundleCompareBlockContent } from "@/types";

function ProductBundleCompareBlockPreviewInner({ content }: { content: ProductBundleCompareBlockContent }) {
  return (
    <section
      className="py-16 px-6"
      style={{ background: "var(--site-bg, #ffffff)" }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          {content.title && (
            <h2
              className="text-3xl sm:text-4xl font-bold mb-4"
              style={{
                color: "var(--site-text, #1A1A1A)",
                fontFamily: "var(--site-heading-font, inherit)",
              }}
            >
              {content.title}
            </h2>
          )}
          {content.subtitle && (
            <p
              className="text-base max-w-2xl mx-auto leading-relaxed"
              style={{ color: "var(--site-muted, #6b7280)" }}
            >
              {content.subtitle}
            </p>
          )}
        </div>

        {/* 3 Bundle columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {content.bundles.map((bundle, i) => (
            <div
              key={i}
              className="rounded-xl p-7 flex flex-col relative"
              style={{
                background: "var(--site-surface, #f9fafb)",
                border: bundle.isPopular
                  ? "2px solid var(--site-primary, #4F46E5)"
                  : "1px solid var(--site-border, #e5e7eb)",
              }}
            >
              {/* Populaire badge */}
              {bundle.isPopular && (
                <span
                  className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: "var(--site-primary, #4F46E5)",
                    color: "var(--btn-text, #fff)",
                  }}
                >
                  Populaire
                </span>
              )}

              <h3
                className="text-lg font-semibold mb-1"
                style={{ color: "var(--site-text, #1A1A1A)" }}
              >
                {bundle.name}
              </h3>
              <p
                className="text-2xl font-bold mb-2"
                style={{ color: "var(--site-primary, #4F46E5)" }}
              >
                {bundle.price}
              </p>
              <p
                className="text-sm leading-relaxed mb-5"
                style={{ color: "var(--site-muted, #6b7280)" }}
              >
                {bundle.description}
              </p>

              {/* Features */}
              {bundle.features.length > 0 && (
                <ul className="space-y-2 mb-6 flex-1">
                  {bundle.features.map((feat, j) => (
                    <li
                      key={j}
                      className="flex items-center gap-2 text-sm"
                      style={{ color: "var(--site-text, #1A1A1A)" }}
                    >
                      <svg
                        width="16"
                        height="16"
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
                className="w-full py-2.5 px-4 text-sm font-medium transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: "var(--btn-bg, var(--site-primary, #4F46E5))",
                  color: "var(--btn-text, #fff)",
                  borderRadius: "var(--site-btn-radius, 8px)",
                }}
              >
                {bundle.ctaLabel}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(ProductBundleCompareBlockPreviewInner);
