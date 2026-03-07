"use client";

import { memo } from "react";
import type { VideoShowcaseBlockContent } from "@/types";
import SmartLinkButton from "@/components/site-public/SmartLinkButton";

function VideoShowcaseBlockPreviewInner({ content }: { content: VideoShowcaseBlockContent }) {
  const glow = content.glowColor || "var(--site-primary)";
  const glowLight = content.glowColor ? `color-mix(in srgb, ${content.glowColor} 25%, transparent)` : "var(--site-primary-light)";

  return (
    <section className="py-20 px-8">
      <div className="max-w-5xl mx-auto">
        {/* Title + subtitle */}
        {(content.title || content.subtitle) && (
          <div className="text-center mb-12">
            {content.title && (
              <h2
                className="text-3xl font-bold tracking-tight mb-3"
                style={{ color: "var(--site-text)", fontFamily: "var(--site-heading-font)" }}
              >
                {content.title}
              </h2>
            )}
            {content.subtitle && (
              <p className="text-[15px] max-w-2xl mx-auto leading-relaxed" style={{ color: "var(--site-muted)" }}>
                {content.subtitle}
              </p>
            )}
          </div>
        )}

        {/* Video embed area */}
        <div
          className="relative w-full overflow-hidden group"
          style={{
            aspectRatio: "16 / 9",
            borderRadius: "var(--site-btn-radius, 12px)",
            border: "1px solid var(--site-border)",
            backgroundColor: "var(--site-surface)",
            boxShadow: `0 0 80px -20px ${glowLight}, 0 4px 32px -8px rgba(0,0,0,0.3)`,
          }}
        >
          {content.thumbnailUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={content.thumbnailUrl}
                alt="Video thumbnail"
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-black/30 transition-opacity duration-300 group-hover:bg-black/20" />
              {/* Play button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center backdrop-blur-md transition-transform duration-300 group-hover:scale-110"
                  style={{
                    backgroundColor: glow,
                    boxShadow: `0 0 40px ${glowLight}`,
                  }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <polygon points="6 3 20 12 6 21 6 3" />
                  </svg>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* No thumbnail: show video URL hint */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: glow,
                    boxShadow: `0 0 40px ${glowLight}`,
                  }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <polygon points="6 3 20 12 6 21 6 3" />
                  </svg>
                </div>
                <span className="text-[12px]" style={{ color: "var(--site-muted)" }}>
                  {content.videoUrl || "URL video non definie"}
                </span>
              </div>
              {/* Subtle grid pattern background */}
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage: "linear-gradient(var(--site-text) 1px, transparent 1px), linear-gradient(90deg, var(--site-text) 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }}
              />
            </>
          )}
        </div>

        {/* Stats row */}
        {content.stats && content.stats.length > 0 && (
          <div
            className="mt-10 grid gap-6"
            style={{ gridTemplateColumns: `repeat(${Math.min(content.stats.length, 4)}, 1fr)` }}
          >
            {content.stats.map((stat, i) => (
              <div
                key={i}
                className="text-center py-5 px-4 rounded-xl transition-colors duration-200"
                style={{
                  backgroundColor: "var(--site-surface)",
                  border: "1px solid var(--site-border)",
                }}
              >
                <div
                  className="text-2xl font-bold tracking-tight"
                  style={{ color: "var(--site-text)", fontFamily: "var(--site-heading-font)" }}
                >
                  {stat.value}
                </div>
                <div className="text-[12px] mt-1" style={{ color: "var(--site-muted)" }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA button */}
        {content.ctaLabel && (
          <div className="mt-10 text-center">
            <SmartLinkButton
              link={content.blockLink}
              label={content.ctaLabel}
              className="inline-block text-[14px] font-semibold px-8 py-3 cursor-pointer transition-all duration-200"
            />
          </div>
        )}
      </div>
    </section>
  );
}

export default memo(VideoShowcaseBlockPreviewInner);
