"use client";

import { memo } from "react";
import type { NumbersImpactBlockContent } from "@/types";

function NumbersImpactBlockPreviewInner({ content }: { content: NumbersImpactBlockContent }) {
  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        {content.title && (
          <h2
            className="text-2xl font-bold text-center mb-2"
            style={{ color: "var(--site-text, #191919)", fontFamily: "var(--site-heading-font, inherit)" }}
          >
            {content.title}
          </h2>
        )}
        {content.subtitle && (
          <p className="text-sm text-center mb-10" style={{ color: "var(--site-muted, #666)" }}>
            {content.subtitle}
          </p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {content.stats.map((stat, i) => (
            <div
              key={i}
              className="rounded-xl p-5 text-center"
              style={{
                backgroundColor: "var(--site-surface, #F7F7F5)",
                border: "1px solid var(--site-border, #E6E6E4)",
              }}
            >
              <div
                className="text-3xl font-bold mb-1"
                style={{ color: "var(--site-primary, #4F46E5)" }}
              >
                {stat.value}
              </div>
              <div className="text-sm font-medium mb-1" style={{ color: "var(--site-text, #191919)" }}>
                {stat.label}
              </div>
              {stat.context && (
                <div className="text-xs" style={{ color: "var(--site-muted, #666)" }}>
                  {stat.context}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(NumbersImpactBlockPreviewInner);
