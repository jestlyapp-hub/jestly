"use client";

import { memo } from "react";
import type { ServicesPremiumBlockContent } from "@/types";
import { getIcon } from "@/lib/icons";
import { useProductsByIds } from "@/lib/product-context";

function ServicesPremiumBlockPreviewInner({ content }: { content: ServicesPremiumBlockContent }) {
  const resolvedProducts = useProductsByIds(content.productIds || []);
  const displayServices = content.mode === "product" && resolvedProducts.length > 0
    ? resolvedProducts.map(p => ({
        icon: "package" as const,
        title: p.name,
        description: p.shortDescription || "",
        features: p.features || [],
      }))
    : content.services;

  const cols = content.columns === 4
    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
    : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3";

  return (
    <section
      className="relative py-16 sm:py-20 px-4 sm:px-8"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        {(content.title || content.subtitle) && (
          <div className="text-center mb-14">
            {content.title && (
              <h2
                className="text-3xl sm:text-4xl font-bold mb-4"
                style={{
                  color: "var(--site-text, #fafafa)",
                  fontFamily: "var(--site-heading-font, inherit)",
                }}
              >
                {content.title}
              </h2>
            )}
            {content.subtitle && (
              <p
                className="text-base max-w-2xl mx-auto leading-relaxed"
                style={{ color: "var(--site-muted, #a1a1a1)" }}
              >
                {content.subtitle}
              </p>
            )}
          </div>
        )}

        {/* Cards grid */}
        <div className={`grid ${cols} gap-5`}>
          {displayServices.map((service, i) => (
            <div
              key={i}
              className="group relative rounded-xl p-6 transition-all duration-300"
              style={{
                background: "var(--site-surface, #0a0a0a)",
                border: "1px solid var(--site-border, #262626)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "color-mix(in srgb, var(--site-primary) 50%, var(--site-border, #262626))";
                e.currentTarget.style.boxShadow = "0 0 30px color-mix(in srgb, var(--site-primary) 10%, transparent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--site-border, #262626)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Icon */}
              <div
                className="w-11 h-11 rounded-lg flex items-center justify-center mb-5"
                style={{
                  background: "var(--site-primary-light, rgba(79,70,229,0.1))",
                  color: "var(--site-primary)",
                  boxShadow: "0 0 20px color-mix(in srgb, var(--site-primary) 15%, transparent)",
                }}
              >
                {getIcon(service.icon)}
              </div>

              {/* Title */}
              <h3
                className="text-[15px] font-semibold mb-2"
                style={{ color: "var(--site-text, #fafafa)" }}
              >
                {service.title}
              </h3>

              {/* Description */}
              <p
                className="text-[13px] leading-relaxed mb-4"
                style={{ color: "var(--site-muted, #a1a1a1)" }}
              >
                {service.description}
              </p>

              {/* Features */}
              {service.features && service.features.length > 0 && (
                <ul className="space-y-1.5">
                  {service.features.map((feat, j) => (
                    <li
                      key={j}
                      className="flex items-center gap-2 text-[12px]"
                      style={{ color: "var(--site-muted, #a1a1a1)" }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--site-primary)"
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(ServicesPremiumBlockPreviewInner);
