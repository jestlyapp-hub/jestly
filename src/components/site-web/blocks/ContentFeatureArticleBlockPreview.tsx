"use client";
import { memo } from "react";
import type { ContentFeatureArticleBlockContent } from "@/types";

const ImagePlaceholder = () => (
  <div
    className="w-full h-full min-h-[240px] flex items-center justify-center"
    style={{
      backgroundColor: "var(--site-surface, #F7F7F5)",
      border: "1px solid var(--site-border, #E6E6E4)",
    }}
  >
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--site-muted, #666)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  </div>
);

function ContentFeatureArticleBlockPreviewInner({ content }: { content: ContentFeatureArticleBlockContent }) {
  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div
          className="flex flex-col md:flex-row rounded-xl overflow-hidden"
          style={{
            backgroundColor: "var(--site-surface, #F7F7F5)",
            border: "1px solid var(--site-border, #E6E6E4)",
          }}
        >
          {/* Image left — 40% */}
          <div className="md:w-[40%] flex-shrink-0">
            {content.imageUrl ? (
              <div className="w-full h-full min-h-[240px] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={content.imageUrl} alt={content.title} className="w-full h-full object-cover" />
              </div>
            ) : (
              <ImagePlaceholder />
            )}
          </div>

          {/* Content right — 60% */}
          <div className="md:w-[60%] p-8 flex flex-col justify-center">
            {content.category && (
              <span
                className="inline-block text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-4 w-fit"
                style={{
                  backgroundColor: "var(--site-primary-light, #EEF2FF)",
                  color: "var(--site-primary, #4F46E5)",
                }}
              >
                {content.category}
              </span>
            )}
            <h2
              className="text-2xl font-bold mb-2"
              style={{ color: "var(--site-text, #1A1A1A)", fontFamily: "var(--site-heading-font, inherit)" }}
            >
              {content.title}
            </h2>
            {content.date && (
              <p className="text-xs mb-4" style={{ color: "var(--site-muted, #666)" }}>
                {content.date}
              </p>
            )}
            <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--site-muted, #666)" }}>
              {content.excerpt}
            </p>
            <span
              className="inline-block text-sm font-semibold px-5 py-2.5 w-fit cursor-pointer"
              style={{
                backgroundColor: "var(--btn-bg, var(--site-primary, #4F46E5))",
                color: "var(--btn-text, #fff)",
                borderRadius: "var(--site-btn-radius, 8px)",
              }}
            >
              {content.ctaLabel || "Lire l\u2019article"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(ContentFeatureArticleBlockPreviewInner);
