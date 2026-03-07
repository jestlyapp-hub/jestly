"use client";

import { memo } from "react";
import type { AboutStudioValuesBlockContent } from "@/types";

function AboutStudioValuesBlockPreviewInner({ content }: { content: AboutStudioValuesBlockContent }) {
  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <h2
          className="text-2xl font-bold text-center mb-2"
          style={{ color: "var(--site-text, #1A1A1A)", fontFamily: "var(--site-heading-font, inherit)" }}
        >
          {content.title}
        </h2>
        {content.subtitle && (
          <p className="text-sm text-center mb-10" style={{ color: "var(--site-muted, #666)" }}>
            {content.subtitle}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {content.values.map((v, i) => (
            <div
              key={i}
              className="rounded-xl p-6 text-center"
              style={{
                backgroundColor: "var(--site-surface, #F7F7F5)",
                border: "1px solid var(--site-border, #E6E6E4)",
              }}
            >
              {/* Icon circle */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-lg"
                style={{
                  backgroundColor: "var(--site-primary-light, #EEF2FF)",
                  color: "var(--site-primary, #4F46E5)",
                }}
              >
                {v.icon || (i + 1)}
              </div>
              <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--site-text, #1A1A1A)" }}>
                {v.title}
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--site-muted, #666)" }}>
                {v.description}
              </p>
            </div>
          ))}
        </div>

        {content.teamNote && (
          <div
            className="rounded-lg p-5 text-center max-w-2xl mx-auto"
            style={{
              backgroundColor: "var(--site-surface, #F7F7F5)",
              border: "1px solid var(--site-border, #E6E6E4)",
            }}
          >
            <p className="text-sm leading-relaxed" style={{ color: "var(--site-muted, #666)" }}>
              {content.teamNote}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default memo(AboutStudioValuesBlockPreviewInner);
