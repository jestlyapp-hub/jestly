"use client";

import { memo } from "react";
import type { HeroVideoShowreelBlockContent } from "@/types";

function HeroVideoShowreelBlockPreviewInner({ content }: { content: HeroVideoShowreelBlockContent }) {
  return (
    <section
      className="py-16 px-6"
    >
      <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
        <h1
          className="text-4xl sm:text-5xl font-bold leading-[1.1] mb-4 max-w-3xl"
          style={{
            color: "var(--site-text, #1A1A1A)",
            fontFamily: "var(--site-heading-font, inherit)",
          }}
        >
          {content.title}
        </h1>

        <p
          className="text-base leading-relaxed mb-8 max-w-xl"
          style={{ color: "var(--site-muted, #666)" }}
        >
          {content.subtitle}
        </p>

        {/* Video thumbnail frame */}
        <div className="w-full max-w-3xl mb-8">
          {content.videoUrl ? (
            <div
              className="aspect-video rounded-lg overflow-hidden relative"
              style={{ border: "1px solid var(--site-border, #E6E6E4)" }}
            >
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ backgroundColor: "var(--site-bg, #FFFFFF)" }}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: "var(--btn-bg, var(--site-primary, #4F46E5))",
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="var(--btn-text, #fff)"
                    stroke="none"
                  >
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="aspect-video rounded-lg flex flex-col items-center justify-center gap-3 relative overflow-hidden"
              style={{
                backgroundColor: "var(--site-bg, #FFFFFF)",
                border: "1px solid var(--site-border, #E6E6E4)",
              }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: "var(--site-primary-light, #EEF2FF)",
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ stroke: "var(--site-primary, #4F46E5)" }}
                >
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </div>
              <span className="text-xs" style={{ color: "var(--site-muted, #666)" }}>
                Showreel
              </span>
            </div>
          )}
        </div>

        {content.ctaLabel && (
          <button
            className="inline-flex items-center justify-center text-[13px] font-semibold px-6 py-3 transition-all duration-200 mb-8"
            style={{
              backgroundColor: "var(--btn-bg, var(--site-primary, #4F46E5))",
              color: "var(--btn-text, #fff)",
              borderRadius: "var(--site-btn-radius, 8px)",
            }}
          >
            {content.ctaLabel}
          </button>
        )}

        {/* Tags row */}
        {content.tags && content.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {content.tags.map((tag, i) => (
              <span
                key={i}
                className="text-[11px] font-medium px-3 py-1 rounded-full"
                style={{
                  backgroundColor: "var(--site-bg, #FFFFFF)",
                  color: "var(--site-muted, #666)",
                  border: "1px solid var(--site-border, #E6E6E4)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default memo(HeroVideoShowreelBlockPreviewInner);
