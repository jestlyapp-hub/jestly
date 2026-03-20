"use client";

import { memo } from "react";
import type { Products3CardShopBlockContent } from "@/types";
import { useProductsByIds } from "@/lib/product-context";
import { formatPrice } from "@/lib/productTypes";

function Products3CardShopBlockPreviewInner({ content }: { content: Products3CardShopBlockContent }) {
  const resolvedProducts = useProductsByIds(content.productIds || []);
  const displayProducts = content.mode === "product" && resolvedProducts.length > 0
    ? resolvedProducts.map(p => ({
        imageUrl: p.coverImageUrl || p.thumbnailUrl || "",
        title: p.name,
        price: formatPrice(p.priceCents),
        description: p.shortDescription || "",
        ctaLabel: p.ctaLabel || "Acheter",
      }))
    : content.products;

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
                color: "var(--site-text, #191919)",
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

        {/* 3 Product Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayProducts.map((product, i) => (
            <div
              key={i}
              className="rounded-xl overflow-hidden flex flex-col"
              style={{
                background: "var(--site-surface, #f9fafb)",
                border: "1px solid var(--site-border, #e5e7eb)",
              }}
            >
              {/* Image placeholder */}
              <div
                className="aspect-[4/3] flex items-center justify-center"
                style={{
                  background: "var(--site-primary-light, rgba(79,70,229,0.1))",
                }}
              >
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--site-primary, #4F46E5)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-30"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                )}
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col flex-1">
                <h3
                  className="text-base font-semibold mb-1"
                  style={{ color: "var(--site-text, #191919)" }}
                >
                  {product.title}
                </h3>
                <p
                  className="text-lg font-bold mb-2"
                  style={{ color: "var(--site-primary, #4F46E5)" }}
                >
                  {product.price}
                </p>
                <p
                  className="text-sm leading-relaxed mb-5 flex-1"
                  style={{ color: "var(--site-muted, #6b7280)" }}
                >
                  {product.description}
                </p>
                <button
                  className="w-full py-2.5 px-4 text-sm font-medium transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: "var(--btn-bg, var(--site-primary, #4F46E5))",
                    color: "var(--btn-text, #fff)",
                    borderRadius: "var(--site-btn-radius, 8px)",
                  }}
                >
                  {product.ctaLabel}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(Products3CardShopBlockPreviewInner);
