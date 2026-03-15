"use client";

import { memo } from "react";
import type { Services3CardPremiumBlockContent } from "@/types";
import { useProductsByIds } from "@/lib/product-context";
import { formatPrice } from "@/lib/productTypes";

function Services3CardPremiumBlockPreviewInner({ content }: { content: Services3CardPremiumBlockContent }) {
  const resolvedProducts = useProductsByIds(content.productIds || []);
  const displayServices = content.mode === "product" && resolvedProducts.length > 0
    ? resolvedProducts.map((p) => ({
        title: p.name,
        description: p.shortDescription || "",
        features: p.features?.length ? p.features : [],
        ctaLabel: p.ctaLabel || "En savoir plus",
      }))
    : content.services;

  return (
    <section
      className="py-16 px-6"
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

        {/* 3 Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayServices.map((service, i) => (
            <div
              key={i}
              className="rounded-xl p-7 flex flex-col"
              style={{
                background: "var(--site-surface, #f9fafb)",
                border: "1px solid var(--site-border, #e5e7eb)",
              }}
            >
              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: "var(--site-text, #1A1A1A)" }}
              >
                {service.title}
              </h3>
              <p
                className="text-sm leading-relaxed mb-5"
                style={{ color: "var(--site-muted, #6b7280)" }}
              >
                {service.description}
              </p>

              {/* Feature bullets */}
              {service.features.length > 0 && (
                <ul className="space-y-2 mb-6 flex-1">
                  {service.features.map((feat, j) => (
                    <li
                      key={j}
                      className="flex items-start gap-2 text-sm"
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
                        className="shrink-0 mt-0.5"
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
                {service.ctaLabel}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(Services3CardPremiumBlockPreviewInner);
