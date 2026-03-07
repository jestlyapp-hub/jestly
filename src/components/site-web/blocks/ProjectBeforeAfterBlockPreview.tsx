"use client";

import { memo } from "react";
import type { ProjectBeforeAfterBlockContent } from "@/types";

function ProjectBeforeAfterBlockPreviewInner({ content }: { content: ProjectBeforeAfterBlockContent }) {
  return (
    <section
      className="py-16 px-6"
      style={{ backgroundColor: "var(--site-bg, #FFFFFF)" }}
    >
      <div className="max-w-6xl mx-auto">
        <h2
          className="text-3xl font-bold mb-10 text-center"
          style={{
            color: "var(--site-text, #1A1A1A)",
            fontFamily: "var(--site-heading-font, inherit)",
          }}
        >
          {content.title}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {content.items.map((item, i) => (
            <div
              key={i}
              className="rounded-lg overflow-hidden"
              style={{
                backgroundColor: "var(--site-surface, #F7F7F5)",
                border: "1px solid var(--site-border, #E6E6E4)",
              }}
            >
              {/* Before / After labels side by side */}
              <div className="flex">
                <div
                  className="flex-1 py-6 px-4 flex flex-col items-center justify-center text-center"
                  style={{
                    borderRight: "1px solid var(--site-border, #E6E6E4)",
                  }}
                >
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wider mb-2 px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: "var(--site-bg, #FFFFFF)",
                      color: "var(--site-muted, #666)",
                      border: "1px solid var(--site-border, #E6E6E4)",
                    }}
                  >
                    Avant
                  </span>
                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--site-text, #1A1A1A)" }}
                  >
                    {item.beforeLabel}
                  </span>
                </div>
                <div className="flex-1 py-6 px-4 flex flex-col items-center justify-center text-center">
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wider mb-2 px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: "var(--site-primary-light, #EEF2FF)",
                      color: "var(--site-primary, #4F46E5)",
                    }}
                  >
                    Apres
                  </span>
                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--site-text, #1A1A1A)" }}
                  >
                    {item.afterLabel}
                  </span>
                </div>
              </div>

              {/* Result badge + description */}
              <div
                className="px-5 py-4"
                style={{ borderTop: "1px solid var(--site-border, #E6E6E4)" }}
              >
                <div
                  className="inline-flex text-[11px] font-semibold px-2.5 py-1 rounded-full mb-2"
                  style={{
                    backgroundColor: "var(--site-primary-light, #EEF2FF)",
                    color: "var(--site-primary, #4F46E5)",
                  }}
                >
                  {item.resultText}
                </div>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--site-muted, #666)" }}
                >
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(ProjectBeforeAfterBlockPreviewInner);
