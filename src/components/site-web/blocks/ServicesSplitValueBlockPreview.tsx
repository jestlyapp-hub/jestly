"use client";

import { memo } from "react";
import type { ServicesSplitValueBlockContent } from "@/types";

function ServicesSplitValueBlockPreviewInner({ content }: { content: ServicesSplitValueBlockContent }) {
  return (
    <section
      className="py-16 px-6"
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left column — Text */}
        <div>
          <h2
            className="text-3xl sm:text-4xl font-bold mb-4"
            style={{
              color: "var(--site-text, #191919)",
              fontFamily: "var(--site-heading-font, inherit)",
            }}
          >
            {content.title}
          </h2>
          {content.subtitle && (
            <p
              className="text-lg font-medium mb-4"
              style={{ color: "var(--site-primary, #4F46E5)" }}
            >
              {content.subtitle}
            </p>
          )}
          {content.description && (
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--site-muted, #6b7280)" }}
            >
              {content.description}
            </p>
          )}
        </div>

        {/* Right column — Pillar cards */}
        <div className="space-y-4">
          {content.pillars.map((pillar, i) => (
            <div
              key={i}
              className="rounded-xl p-5"
              style={{
                background: "var(--site-surface, #f9fafb)",
                border: "1px solid var(--site-border, #e5e7eb)",
              }}
            >
              <h3
                className="text-base font-semibold mb-1.5"
                style={{ color: "var(--site-text, #191919)" }}
              >
                {pillar.title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--site-muted, #6b7280)" }}
              >
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(ServicesSplitValueBlockPreviewInner);
