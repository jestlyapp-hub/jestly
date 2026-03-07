"use client";
import { memo } from "react";
import type { GalleryStackedStoryboardBlockContent } from "@/types";

const ImagePlaceholder = () => (
  <div
    className="w-full aspect-[16/9] flex items-center justify-center rounded-lg"
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

function GalleryStackedStoryboardBlockPreviewInner({ content }: { content: GalleryStackedStoryboardBlockContent }) {
  const items = content.items?.length ? content.items : [
    { title: "Scene One", description: "A compelling visual narrative that captures the essence of the moment." },
    { title: "Scene Two", description: "Every frame tells a story worth remembering." },
  ];

  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        {content.title && (
          <h2
            className="text-3xl font-bold mb-12 text-center"
            style={{ color: "var(--site-text, #1A1A1A)", fontFamily: "var(--site-heading-font, inherit)" }}
          >
            {content.title}
          </h2>
        )}
        <div className="space-y-8">
          {items.map((item, i) => (
            <div
              key={i}
              className="rounded-xl overflow-hidden"
              style={{
                backgroundColor: "var(--site-surface, #F7F7F5)",
                border: "1px solid var(--site-border, #E6E6E4)",
              }}
            >
              {item.imageUrl ? (
                <div className="w-full aspect-[16/9] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="p-4 pb-0">
                  <ImagePlaceholder />
                </div>
              )}
              <div className="p-6">
                <h3
                  className="text-xl font-semibold mb-2"
                  style={{ color: "var(--site-text, #1A1A1A)", fontFamily: "var(--site-heading-font, inherit)" }}
                >
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--site-muted, #666)" }}>
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

export default memo(GalleryStackedStoryboardBlockPreviewInner);
