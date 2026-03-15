"use client";

import { memo } from "react";
import type { ProductBenefitsMockupBlockContent } from "@/types";
import { useProductById } from "@/lib/product-context";
import { formatPrice } from "@/lib/productTypes";

function ProductBenefitsMockupBlockPreviewInner({ content }: { content: ProductBenefitsMockupBlockContent }) {
  const resolvedProduct = useProductById(content.productId || "");
  const display = content.mode === "product" && resolvedProduct ? {
    title: resolvedProduct.name,
    subtitle: resolvedProduct.shortDescription || content.subtitle,
    benefits: resolvedProduct.features?.length ? resolvedProduct.features : content.benefits,
    ctaLabel: resolvedProduct.ctaLabel || content.ctaLabel,
    imageUrl: resolvedProduct.coverImageUrl || content.imageUrl,
  } : content;

  return (
    <section
      className="py-16 px-6"
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left — Image / Mockup placeholder */}
        <div
          className="aspect-[4/3] rounded-xl flex items-center justify-center"
          style={{
            background: "var(--site-primary-light, rgba(79,70,229,0.1))",
            border: "1px solid var(--site-border, #e5e7eb)",
          }}
        >
          {display.imageUrl ? (
            <img
              src={display.imageUrl}
              alt={display.title}
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--site-primary, #4F46E5)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-30"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          )}
        </div>

        {/* Right — Content */}
        <div>
          <h2
            className="text-3xl sm:text-4xl font-bold mb-3"
            style={{
              color: "var(--site-text, #1A1A1A)",
              fontFamily: "var(--site-heading-font, inherit)",
            }}
          >
            {display.title}
          </h2>
          <p
            className="text-base leading-relaxed mb-6"
            style={{ color: "var(--site-muted, #6b7280)" }}
          >
            {display.subtitle}
          </p>

          {/* Benefits list */}
          {display.benefits.length > 0 && (
            <ul className="space-y-3 mb-8">
              {display.benefits.map((benefit, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm"
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
                    className="shrink-0 mt-0.5"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {benefit}
                </li>
              ))}
            </ul>
          )}

          {/* CTA */}
          <button
            className="py-3 px-8 text-sm font-medium transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "var(--btn-bg, var(--site-primary, #4F46E5))",
              color: "var(--btn-text, #fff)",
              borderRadius: "var(--site-btn-radius, 8px)",
            }}
          >
            {display.ctaLabel}
          </button>
        </div>
      </div>
    </section>
  );
}

export default memo(ProductBenefitsMockupBlockPreviewInner);
