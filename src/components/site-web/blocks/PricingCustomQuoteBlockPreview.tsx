"use client";

import { memo } from "react";
import type { PricingCustomQuoteBlockContent } from "@/types";
import { useProductById } from "@/lib/product-context";
import { formatPrice } from "@/lib/productTypes";

function PricingCustomQuoteBlockPreviewInner({ content }: { content: PricingCustomQuoteBlockContent }) {
  const resolvedProduct = useProductById(content.productId || "");
  const display = content.mode === "product" && resolvedProduct ? {
    title: resolvedProduct.name,
    subtitle: resolvedProduct.shortDescription || content.subtitle,
    features: resolvedProduct.features?.length ? resolvedProduct.features : content.features,
    ctaLabel: resolvedProduct.ctaLabel || content.ctaLabel,
    note: content.note,
  } : content;

  return (
    <section
      className="py-16 px-6"
    >
      <div className="max-w-2xl mx-auto text-center">
        {/* Header */}
        <h2
          className="text-3xl sm:text-4xl font-bold mb-4"
          style={{
            color: "var(--site-text, #191919)",
            fontFamily: "var(--site-heading-font, inherit)",
          }}
        >
          {display.title}
        </h2>
        <p
          className="text-base leading-relaxed mb-10"
          style={{ color: "var(--site-muted, #6b7280)" }}
        >
          {display.subtitle}
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
          {display.features.length > 0 && (
            <ul className="space-y-3 mb-8">
              {display.features.map((feat, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 text-sm"
                  style={{ color: "var(--site-text, #191919)" }}
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
            {display.ctaLabel}
          </button>

          {/* Note */}
          {display.note && (
            <p
              className="text-xs mt-4 text-center"
              style={{ color: "var(--site-muted, #6b7280)" }}
            >
              {display.note}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default memo(PricingCustomQuoteBlockPreviewInner);
