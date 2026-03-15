"use client";

import { memo } from "react";
import type { ProductFeaturedCardBlockContent } from "@/types";
import { useProductById } from "@/lib/product-context";
import { formatPrice } from "@/lib/productTypes";

function ProductFeaturedCardBlockPreviewInner({ content }: { content: ProductFeaturedCardBlockContent }) {
  const resolvedProduct = useProductById(content.productId || "");
  const display = content.mode === "product" && resolvedProduct ? {
    title: resolvedProduct.name,
    description: resolvedProduct.shortDescription || content.description,
    price: formatPrice(resolvedProduct.priceCents),
    benefits: resolvedProduct.features?.length ? resolvedProduct.features : content.benefits,
    ctaLabel: resolvedProduct.ctaLabel || content.ctaLabel,
    imageUrl: resolvedProduct.coverImageUrl || content.imageUrl,
    trustNote: content.trustNote,
  } : content;

  return (
    <section
      className="py-16 px-6"
    >
      <div className="max-w-4xl mx-auto">
        <div
          className="rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2"
          style={{
            background: "var(--site-surface, #f9fafb)",
            border: "1px solid var(--site-border, #e5e7eb)",
          }}
        >
          {/* Left — Image placeholder */}
          <div
            className="aspect-square md:aspect-auto flex items-center justify-center"
            style={{
              background: "var(--site-primary-light, rgba(79,70,229,0.1))",
            }}
          >
            {display.imageUrl ? (
              <img
                src={display.imageUrl}
                alt={display.title}
                className="w-full h-full object-cover"
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
                className="opacity-40"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            )}
          </div>

          {/* Right — Product info */}
          <div className="p-8 flex flex-col justify-center">
            <h2
              className="text-2xl sm:text-3xl font-bold mb-2"
              style={{
                color: "var(--site-text, #1A1A1A)",
                fontFamily: "var(--site-heading-font, inherit)",
              }}
            >
              {display.title}
            </h2>

            <p
              className="text-2xl font-bold mb-4"
              style={{ color: "var(--site-primary, #4F46E5)" }}
            >
              {display.price}
            </p>

            <p
              className="text-sm leading-relaxed mb-5"
              style={{ color: "var(--site-muted, #6b7280)" }}
            >
              {display.description}
            </p>

            {/* Benefits checklist */}
            {display.benefits.length > 0 && (
              <ul className="space-y-2 mb-6">
                {display.benefits.map((benefit, i) => (
                  <li
                    key={i}
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
                    {benefit}
                  </li>
                ))}
              </ul>
            )}

            {/* CTA */}
            <button
              className="w-full py-3 px-4 text-sm font-medium transition-opacity hover:opacity-90"
              style={{
                backgroundColor: "var(--btn-bg, var(--site-primary, #4F46E5))",
                color: "var(--btn-text, #fff)",
                borderRadius: "var(--site-btn-radius, 8px)",
              }}
            >
              {display.ctaLabel}
            </button>

            {/* Trust note */}
            {display.trustNote && (
              <p
                className="text-xs mt-3 text-center"
                style={{ color: "var(--site-muted, #6b7280)" }}
              >
                {display.trustNote}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(ProductFeaturedCardBlockPreviewInner);
