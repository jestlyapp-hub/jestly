"use client";

import { memo } from "react";
import type { ProjectTimelineBlockContent } from "@/types";

function ProjectTimelineBlockPreviewInner({ content }: { content: ProjectTimelineBlockContent }) {
  return (
    <section
      className="py-16 px-6"
    >
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl">
          <h2
            className="text-3xl font-bold mb-2"
            style={{
              color: "var(--site-text, #1A1A1A)",
              fontFamily: "var(--site-heading-font, inherit)",
            }}
          >
            {content.title}
          </h2>

          {content.subtitle && (
            <p
              className="text-base leading-relaxed mb-10"
              style={{ color: "var(--site-muted, #666)" }}
            >
              {content.subtitle}
            </p>
          )}

          {/* Timeline */}
          <div className="relative pl-8">
            {/* Vertical line */}
            <div
              className="absolute left-3 top-1 bottom-1 w-px"
              style={{ backgroundColor: "var(--site-border, #E6E6E4)" }}
            />

            {content.steps.map((step, i) => (
              <div key={i} className="relative pb-8 last:pb-0">
                {/* Numbered circle */}
                <div
                  className="absolute -left-5 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold"
                  style={{
                    backgroundColor: "var(--btn-bg, var(--site-primary, #4F46E5))",
                    color: "var(--btn-text, #fff)",
                  }}
                >
                  {i + 1}
                </div>

                <div>
                  <h3
                    className="text-base font-semibold mb-1"
                    style={{
                      color: "var(--site-text, #1A1A1A)",
                      fontFamily: "var(--site-heading-font, inherit)",
                    }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed mb-2"
                    style={{ color: "var(--site-muted, #666)" }}
                  >
                    {step.description}
                  </p>
                  {step.tag && (
                    <span
                      className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: "var(--site-surface, #F7F7F5)",
                        color: "var(--site-primary, #4F46E5)",
                        border: "1px solid var(--site-border, #E6E6E4)",
                      }}
                    >
                      {step.tag}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Result summary card */}
          {content.resultSummary && (
            <div
              className="mt-8 rounded-lg p-5"
              style={{
                backgroundColor: "var(--site-primary-light, #EEF2FF)",
                border: "1px solid var(--site-border, #E6E6E4)",
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ stroke: "var(--site-primary, #4F46E5)" }}
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "var(--site-primary, #4F46E5)" }}
                >
                  Résultat
                </span>
              </div>
              <p
                className="text-sm font-medium"
                style={{ color: "var(--site-text, #1A1A1A)" }}
              >
                {content.resultSummary}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default memo(ProjectTimelineBlockPreviewInner);
