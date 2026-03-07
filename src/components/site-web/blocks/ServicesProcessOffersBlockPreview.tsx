"use client";

import { memo } from "react";
import type { ServicesProcessOffersBlockContent } from "@/types";

function ServicesProcessOffersBlockPreviewInner({ content }: { content: ServicesProcessOffersBlockContent }) {
  return (
    <section
      className="py-16 px-6"
      style={{ background: "var(--site-bg, #ffffff)" }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        {content.title && (
          <h2
            className="text-3xl sm:text-4xl font-bold mb-12 text-center"
            style={{
              color: "var(--site-text, #1A1A1A)",
              fontFamily: "var(--site-heading-font, inherit)",
            }}
          >
            {content.title}
          </h2>
        )}

        {/* Horizontal offer cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.offers.map((offer, i) => (
            <div
              key={i}
              className="rounded-xl p-6 flex flex-col"
              style={{
                background: "var(--site-surface, #f9fafb)",
                border: "1px solid var(--site-border, #e5e7eb)",
              }}
            >
              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: "var(--site-text, #1A1A1A)" }}
              >
                {offer.title}
              </h3>
              <p
                className="text-sm leading-relaxed mb-5"
                style={{ color: "var(--site-muted, #6b7280)" }}
              >
                {offer.description}
              </p>

              {/* Numbered steps */}
              {offer.steps.length > 0 && (
                <ol className="space-y-2.5 mt-auto">
                  {offer.steps.map((step, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm">
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                        style={{
                          background: "var(--site-primary-light, rgba(79,70,229,0.1))",
                          color: "var(--site-primary, #4F46E5)",
                        }}
                      >
                        {j + 1}
                      </span>
                      <span style={{ color: "var(--site-text, #1A1A1A)" }}>
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(ServicesProcessOffersBlockPreviewInner);
