"use client";
import { memo } from "react";
import type { Gallery3UpStripBlockContent } from "@/types";

const ImagePlaceholder = () => (
  <div
    className="w-full aspect-[4/3] flex items-center justify-center rounded-lg"
    style={{
      backgroundColor: "var(--site-surface, #F7F7F5)",
      border: "1px solid var(--site-border, #E6E6E4)",
    }}
  >
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--site-muted, #666)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  </div>
);

function Gallery3UpStripBlockPreviewInner({ content }: { content: Gallery3UpStripBlockContent }) {
  const items = content.items?.length ? content.items : [
    { caption: "Photo 1" },
    { caption: "Photo 2" },
    { caption: "Photo 3" },
  ];

  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        {content.title && (
          <h2
            className="text-2xl font-bold mb-8 text-center"
            style={{ color: "var(--site-text, #1A1A1A)", fontFamily: "var(--site-heading-font, inherit)" }}
          >
            {content.title}
          </h2>
        )}
        <div className="grid grid-cols-3 gap-6">
          {items.slice(0, 3).map((item, i) => (
            <div key={i}>
              {item.imageUrl ? (
                <div className="w-full aspect-[4/3] rounded-lg overflow-hidden" style={{ border: "1px solid var(--site-border, #E6E6E4)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.imageUrl} alt={item.caption || ""} className="w-full h-full object-cover" />
                </div>
              ) : (
                <ImagePlaceholder />
              )}
              {item.caption && (
                <p
                  className="mt-3 text-sm text-center"
                  style={{ color: "var(--site-muted, #666)" }}
                >
                  {item.caption}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(Gallery3UpStripBlockPreviewInner);
