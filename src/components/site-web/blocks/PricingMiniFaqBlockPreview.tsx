"use client";

import { memo, useState } from "react";
import type { PricingMiniFaqBlockContent } from "@/types";
import { useProductsByIds } from "@/lib/product-context";
import { formatPrice } from "@/lib/productTypes";

function PricingMiniFaqBlockPreviewInner({ content }: { content: PricingMiniFaqBlockContent }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const resolvedProducts = useProductsByIds(content.productIds || []);
  const displayPlans = content.mode === "product" && resolvedProducts.length > 0
    ? resolvedProducts.map(p => ({
        name: p.name,
        price: formatPrice(p.priceCents),
        features: p.features || [],
        ctaLabel: p.ctaLabel || "Choisir",
      }))
    : content.plans;

  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        {content.title && (
          <h2
            className="text-2xl font-bold text-center mb-10"
            style={{ color: "var(--site-text, #1A1A1A)", fontFamily: "var(--site-heading-font, inherit)" }}
          >
            {content.title}
          </h2>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          {displayPlans.map((plan, i) => (
            <div
              key={i}
              className="rounded-xl p-6 flex flex-col"
              style={{
                backgroundColor: "var(--site-surface, #F7F7F5)",
                border: "1px solid var(--site-border, #E6E6E4)",
              }}
            >
              <div className="text-sm font-semibold mb-1" style={{ color: "var(--site-text, #1A1A1A)" }}>
                {plan.name}
              </div>
              <div className="text-3xl font-bold mb-4" style={{ color: "var(--site-primary, #4F46E5)" }}>
                {plan.price}
              </div>
              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((f, fi) => (
                  <li key={fi} className="text-xs flex items-center gap-2" style={{ color: "var(--site-muted, #666)" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--site-primary, #4F46E5)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                className="w-full text-sm font-semibold px-4 py-2.5 cursor-pointer"
                style={{
                  backgroundColor: "var(--btn-bg, var(--site-primary, #4F46E5))",
                  color: "var(--btn-text, #fff)",
                  borderRadius: "var(--site-btn-radius, 8px)",
                }}
              >
                {plan.ctaLabel}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto space-y-2">
          {content.faq.map((item, i) => (
            <div
              key={i}
              className="rounded-lg overflow-hidden"
              style={{ border: "1px solid var(--site-border, #E6E6E4)" }}
            >
              <button
                className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer"
                style={{ backgroundColor: "var(--site-surface, #F7F7F5)" }}
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
              >
                <span className="text-sm font-medium" style={{ color: "var(--site-text, #1A1A1A)" }}>
                  {item.question}
                </span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--site-muted, #666)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ transform: openIdx === i ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {openIdx === i && (
                <div className="px-5 pb-4 text-xs leading-relaxed" style={{ color: "var(--site-muted, #666)", backgroundColor: "var(--site-surface, #F7F7F5)" }}>
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(PricingMiniFaqBlockPreviewInner);
