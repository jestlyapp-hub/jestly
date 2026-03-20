"use client";

import { memo } from "react";
import type { TestimonialsVideoBlockContent } from "@/types";

function TestimonialsVideoBlockPreviewInner({ content }: { content: TestimonialsVideoBlockContent }) {
  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <h2
          className="text-2xl font-bold text-center mb-2"
          style={{ color: "var(--site-text, #191919)", fontFamily: "var(--site-heading-font, inherit)" }}
        >
          {content.title}
        </h2>
        {content.subtitle && (
          <p className="text-sm text-center mb-10" style={{ color: "var(--site-muted, #666)" }}>
            {content.subtitle}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {content.testimonials.map((t, i) => (
            <div
              key={i}
              className="rounded-xl overflow-hidden"
              style={{
                backgroundColor: "var(--site-surface, #F7F7F5)",
                border: "1px solid var(--site-border, #E6E6E4)",
              }}
            >
              {/* Video Thumbnail with Play */}
              <div
                className="relative w-full aspect-video flex items-center justify-center"
                style={{ backgroundColor: "var(--site-border, #E6E6E4)" }}
              >
                {t.thumbnailUrl ? (
                  <img src={t.thumbnailUrl} alt={t.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0" style={{ backgroundColor: "var(--site-border, #E6E6E4)" }} />
                )}
                <div
                  className="absolute w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: "var(--btn-bg, var(--site-primary, #4F46E5))" }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--btn-text, #fff)">
                    <polygon points="6 3 20 12 6 21 6 3" />
                  </svg>
                </div>
              </div>

              {/* Info */}
              <div className="p-5">
                <div className="text-sm font-semibold mb-0.5" style={{ color: "var(--site-text, #191919)" }}>
                  {t.name}
                </div>
                <div className="text-xs mb-3" style={{ color: "var(--site-primary, #4F46E5)" }}>
                  {t.company}
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "var(--site-muted, #666)" }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(TestimonialsVideoBlockPreviewInner);
