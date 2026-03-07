"use client";
import { memo } from "react";
import type { MediaFeaturedVideoBlockContent } from "@/types";

function MediaFeaturedVideoBlockPreview({ content }: { content: MediaFeaturedVideoBlockContent }) {
  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        {content.title && (
          <h2
            className="text-3xl font-bold text-center mb-3"
            style={{ color: "var(--site-text, #1A1A1A)", fontFamily: "var(--site-heading-font, inherit)" }}
          >
            {content.title}
          </h2>
        )}
        {content.subtitle && (
          <p className="text-center text-[15px] mb-10 max-w-2xl mx-auto" style={{ color: "var(--site-muted, #666)" }}>
            {content.subtitle}
          </p>
        )}

        {/* Main video placeholder */}
        <div
          className="relative aspect-video rounded-xl overflow-hidden flex items-center justify-center cursor-pointer group"
          style={{
            backgroundColor: "var(--site-surface, #F7F7F5)",
            border: "1px solid var(--site-border, #E6E6E4)",
          }}
        >
          {content.thumbnailUrl ? (
            <img
              src={content.thumbnailUrl}
              alt={content.title || "Video"}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : null}
          {/* Play button */}
          <div
            className="relative z-10 w-16 h-16 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
            style={{
              backgroundColor: "var(--btn-bg, var(--site-primary, #4F46E5))",
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="var(--btn-text, #fff)"
            >
              <polygon points="8,5 20,12 8,19" />
            </svg>
          </div>
        </div>

        {/* Secondary thumbnails */}
        {content.secondaryVideos && content.secondaryVideos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            {content.secondaryVideos.slice(0, 3).map((video, i) => (
              <div
                key={i}
                className="relative aspect-video rounded-lg overflow-hidden flex items-center justify-center cursor-pointer group"
                style={{
                  backgroundColor: "var(--site-surface, #F7F7F5)",
                  border: "1px solid var(--site-border, #E6E6E4)",
                }}
              >
                {video.thumbnailUrl ? (
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title || "Video"}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : null}
                {/* Small play icon */}
                <div
                  className="relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{
                    backgroundColor: "var(--btn-bg, var(--site-primary, #4F46E5))",
                    opacity: 0.9,
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="var(--btn-text, #fff)"
                  >
                    <polygon points="8,5 20,12 8,19" />
                  </svg>
                </div>
                {video.title && (
                  <div className="absolute bottom-0 left-0 right-0 px-3 py-2 z-10">
                    <span className="text-[12px] font-medium" style={{ color: "var(--site-text, #1A1A1A)" }}>
                      {video.title}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default memo(MediaFeaturedVideoBlockPreview);
