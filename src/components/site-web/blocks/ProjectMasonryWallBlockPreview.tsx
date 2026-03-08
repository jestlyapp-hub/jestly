"use client";

import { memo } from "react";
import type { ProjectMasonryWallBlockContent } from "@/types";

function ProjectMasonryWallBlockPreviewInner({ content }: { content: ProjectMasonryWallBlockContent }) {
  const cols = content.columns || 3;

  return (
    <section
      className="py-16 px-6"
      style={{ backgroundColor: "var(--site-bg, #FFFFFF)" }}
    >
      <div className="max-w-6xl mx-auto">
        {content.title && (
          <h2
            className="text-3xl font-bold mb-8"
            style={{
              color: "var(--site-text, #1A1A1A)",
              fontFamily: "var(--site-heading-font, inherit)",
            }}
          >
            {content.title}
          </h2>
        )}

        {/* CSS columns masonry */}
        <div
          className="gap-4"
          style={{
            columnCount: cols,
            columnGap: "16px",
          }}
        >
          {content.items.map((item, i) => {
            // Varied aspect ratios for placeholder masonry effect
            const placeholderAspects = ["3/4", "4/3", "1/1", "3/5", "5/3", "4/5"];
            const aspect = placeholderAspects[i % placeholderAspects.length];

            return (
              <div
                key={i}
                className="relative rounded-lg overflow-hidden mb-4 group"
                style={{
                  breakInside: "avoid",
                  border: "1px solid var(--site-border, #E6E6E4)",
                }}
              >
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full object-cover"
                    style={{ minHeight: "160px", maxHeight: "320px" }}
                  />
                ) : (
                  <div
                    className="w-full flex items-center justify-center"
                    style={{
                      aspectRatio: aspect,
                      backgroundColor: "var(--site-surface, #F7F7F5)",
                    }}
                  >
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ stroke: "var(--site-muted, #666)" }}
                      className="opacity-25"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                )}

                {/* Overlay with title + category */}
                <div
                  className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{
                    background: "linear-gradient(transparent 40%, rgba(0,0,0,0.6) 100%)",
                  }}
                >
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wider mb-1"
                    style={{ color: "var(--site-primary-light, #EEF2FF)" }}
                  >
                    {item.category}
                  </span>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "#fff" }}
                  >
                    {item.title}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default memo(ProjectMasonryWallBlockPreviewInner);
