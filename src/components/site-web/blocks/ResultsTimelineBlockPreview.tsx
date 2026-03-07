"use client";

import { memo } from "react";
import type { ResultsTimelineBlockContent } from "@/types";

function ResultsTimelineBlockPreviewInner({ content }: { content: ResultsTimelineBlockContent }) {
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
          <p className="text-sm text-center mb-12" style={{ color: "var(--site-muted, #666)" }}>
            {content.subtitle}
          </p>
        )}

        {/* Horizontal timeline */}
        <div className="relative">
          {/* Connecting line */}
          <div
            className="absolute top-6 left-0 right-0 h-0.5"
            style={{ backgroundColor: "var(--site-border, #E6E6E4)" }}
          />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {content.milestones.map((m, i) => (
              <div key={i} className="flex flex-col items-center text-center pt-0">
                {/* Dot on line */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold mb-4 relative z-10"
                  style={{
                    backgroundColor: "var(--site-primary, #4F46E5)",
                    color: "var(--btn-text, #fff)",
                  }}
                >
                  {m.label.slice(0, 3)}
                </div>

                {/* Card */}
                <div
                  className="rounded-xl p-5 w-full"
                  style={{
                    backgroundColor: "var(--site-surface, #F7F7F5)",
                    border: "1px solid var(--site-border, #E6E6E4)",
                  }}
                >
                  <div
                    className="text-xs font-semibold uppercase tracking-wider mb-2 px-2 py-0.5 rounded-full inline-block"
                    style={{
                      backgroundColor: "var(--site-primary-light, #EEF2FF)",
                      color: "var(--site-primary, #4F46E5)",
                    }}
                  >
                    {m.label}
                  </div>
                  <div
                    className="text-2xl font-bold mb-2"
                    style={{ color: "var(--site-primary, #4F46E5)" }}
                  >
                    {m.value}
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--site-muted, #666)" }}>
                    {m.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(ResultsTimelineBlockPreviewInner);
