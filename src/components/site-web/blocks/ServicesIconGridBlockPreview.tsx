"use client";

import { memo } from "react";
import type { ServicesIconGridBlockContent } from "@/types";

function ServicesIconGridBlockPreviewInner({ content }: { content: ServicesIconGridBlockContent }) {
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

        {/* 2x3 Icon Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.services.map((service, i) => (
            <div
              key={i}
              className="rounded-xl p-6 text-center"
              style={{
                background: "var(--site-surface, #f9fafb)",
                border: "1px solid var(--site-border, #e5e7eb)",
              }}
            >
              {/* Icon circle with first letter */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold"
                style={{
                  background: "var(--site-primary-light, rgba(79,70,229,0.1))",
                  color: "var(--site-primary, #4F46E5)",
                }}
              >
                {(service.icon || "S").charAt(0).toUpperCase()}
              </div>

              <h3
                className="text-base font-semibold mb-2"
                style={{ color: "var(--site-text, #1A1A1A)" }}
              >
                {service.title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--site-muted, #6b7280)" }}
              >
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(ServicesIconGridBlockPreviewInner);
