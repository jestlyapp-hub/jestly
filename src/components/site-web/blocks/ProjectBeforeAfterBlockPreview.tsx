"use client";

import { memo } from "react";
import type { ProjectBeforeAfterBlockContent } from "@/types";

function Placeholder({ label }: { label: string }) {
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center"
      style={{ backgroundColor: "var(--site-surface, #F7F7F5)" }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--site-muted, #999)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mb-1 opacity-40"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
      <span
        className="text-[10px] opacity-40"
        style={{ color: "var(--site-muted, #999)" }}
      >
        {label}
      </span>
    </div>
  );
}

function ProjectBeforeAfterBlockPreviewInner({
  content,
}: {
  content: ProjectBeforeAfterBlockContent;
}) {
  return (
    <section
      className="py-16 px-6"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h2
            className="text-3xl font-bold mb-3"
            style={{
              color: "var(--site-text, #1A1A1A)",
              fontFamily: "var(--site-heading-font, inherit)",
            }}
          >
            {content.title}
          </h2>
          {content.subtitle && (
            <p
              className="text-base max-w-2xl mx-auto"
              style={{ color: "var(--site-muted, #666)" }}
            >
              {content.subtitle}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.items.map((item, i) => {
            const hasImages = item.beforeImageUrl || item.afterImageUrl;

            return (
              <div
                key={i}
                className="rounded-xl overflow-hidden"
                style={{
                  backgroundColor: "var(--site-surface, #F7F7F5)",
                  border: "1px solid var(--site-border, #E6E6E4)",
                }}
              >
                {/* Category badge */}
                {item.category && (
                  <div className="px-4 pt-3">
                    <span
                      className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor:
                          "var(--site-primary-light, #EEF2FF)",
                        color: "var(--site-primary, #4F46E5)",
                      }}
                    >
                      {item.category}
                    </span>
                  </div>
                )}

                {/* Before / After visual comparison */}
                {hasImages ? (
                  <div className="flex gap-0.5 p-3">
                    {/* Before image */}
                    <div className="flex-1 flex flex-col">
                      <span
                        className="text-[10px] font-semibold uppercase tracking-wider mb-1.5 text-center px-2 py-0.5 rounded self-center"
                        style={{
                          backgroundColor: "var(--site-bg, #FFFFFF)",
                          color: "var(--site-muted, #666)",
                          border:
                            "1px solid var(--site-border, #E6E6E4)",
                        }}
                      >
                        Avant
                      </span>
                      <div
                        className="rounded-lg overflow-hidden flex-1"
                        style={{ aspectRatio: "4 / 3" }}
                      >
                        {item.beforeImageUrl ? (
                          <img
                            src={item.beforeImageUrl}
                            alt={item.beforeLabel}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Placeholder label="Avant" />
                        )}
                      </div>
                      <p
                        className="text-[11px] mt-1.5 text-center font-medium truncate px-1"
                        style={{ color: "var(--site-text, #1A1A1A)" }}
                      >
                        {item.beforeLabel}
                      </p>
                    </div>

                    {/* Arrow separator */}
                    <div className="flex items-center px-1 pt-5">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--site-primary, #4F46E5)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </div>

                    {/* After image */}
                    <div className="flex-1 flex flex-col">
                      <span
                        className="text-[10px] font-semibold uppercase tracking-wider mb-1.5 text-center px-2 py-0.5 rounded self-center"
                        style={{
                          backgroundColor:
                            "var(--site-primary-light, #EEF2FF)",
                          color: "var(--site-primary, #4F46E5)",
                        }}
                      >
                        Apres
                      </span>
                      <div
                        className="rounded-lg overflow-hidden flex-1"
                        style={{ aspectRatio: "4 / 3" }}
                      >
                        {item.afterImageUrl ? (
                          <img
                            src={item.afterImageUrl}
                            alt={item.afterLabel}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Placeholder label="Apres" />
                        )}
                      </div>
                      <p
                        className="text-[11px] mt-1.5 text-center font-medium truncate px-1"
                        style={{ color: "var(--site-text, #1A1A1A)" }}
                      >
                        {item.afterLabel}
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Text-only fallback — before / after labels side by side */
                  <div className="flex m-3 rounded-lg overflow-hidden"
                    style={{ border: "1px solid var(--site-border, #E6E6E4)" }}
                  >
                    <div
                      className="flex-1 py-5 px-3 flex flex-col items-center justify-center text-center"
                      style={{
                        borderRight:
                          "1px solid var(--site-border, #E6E6E4)",
                      }}
                    >
                      <span
                        className="text-[10px] font-semibold uppercase tracking-wider mb-2 px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: "var(--site-bg, #FFFFFF)",
                          color: "var(--site-muted, #666)",
                          border:
                            "1px solid var(--site-border, #E6E6E4)",
                        }}
                      >
                        Avant
                      </span>
                      <span
                        className="text-sm font-medium"
                        style={{
                          color: "var(--site-text, #1A1A1A)",
                        }}
                      >
                        {item.beforeLabel}
                      </span>
                    </div>
                    <div className="flex-1 py-5 px-3 flex flex-col items-center justify-center text-center">
                      <span
                        className="text-[10px] font-semibold uppercase tracking-wider mb-2 px-2 py-0.5 rounded"
                        style={{
                          backgroundColor:
                            "var(--site-primary-light, #EEF2FF)",
                          color: "var(--site-primary, #4F46E5)",
                        }}
                      >
                        Apres
                      </span>
                      <span
                        className="text-sm font-medium"
                        style={{
                          color: "var(--site-text, #1A1A1A)",
                        }}
                      >
                        {item.afterLabel}
                      </span>
                    </div>
                  </div>
                )}

                {/* Result badge + description */}
                <div
                  className="px-4 pb-4 pt-1"
                  style={{
                    borderTop:
                      "1px solid var(--site-border, #E6E6E4)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {item.metricBadge && (
                      <span
                        className="text-[13px] font-bold px-2 py-0.5 rounded"
                        style={{
                          color: "var(--site-primary, #4F46E5)",
                        }}
                      >
                        {item.metricBadge}
                      </span>
                    )}
                    <span
                      className="inline-flex text-[11px] font-semibold px-2.5 py-1 rounded-full"
                      style={{
                        backgroundColor:
                          "var(--site-primary-light, #EEF2FF)",
                        color: "var(--site-primary, #4F46E5)",
                      }}
                    >
                      {item.resultText}
                    </span>
                  </div>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--site-muted, #666)" }}
                  >
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default memo(ProjectBeforeAfterBlockPreviewInner);
