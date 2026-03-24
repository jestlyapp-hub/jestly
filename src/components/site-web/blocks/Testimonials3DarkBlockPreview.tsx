"use client";

import { memo } from "react";
import type { Testimonials3DarkBlockContent } from "@/types";

function Testimonials3DarkBlockPreviewInner({ content }: { content: Testimonials3DarkBlockContent }) {
  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <h2
          className="text-xl sm:text-2xl font-bold text-center mb-10"
          style={{ color: "var(--site-text, #191919)", fontFamily: "var(--site-heading-font, inherit)" }}
        >
          {content.title}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {content.testimonials.map((t, i) => (
            <div
              key={i}
              className="rounded-xl p-6 flex flex-col"
              style={{
                backgroundColor: "var(--site-surface, #F7F7F5)",
                border: "1px solid var(--site-border, #E6E6E4)",
              }}
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, si) => (
                  <svg
                    key={si}
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill={si < t.rating ? "var(--site-primary, #4F46E5)" : "none"}
                    stroke="var(--site-primary, #4F46E5)"
                    strokeWidth="2"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm leading-relaxed flex-1 mb-5" style={{ color: "var(--site-text, #191919)" }}>
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Avatar + Info */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={{
                    backgroundColor: "var(--site-primary-light, #EEF2FF)",
                    color: "var(--site-primary, #4F46E5)",
                  }}
                >
                  {t.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: "var(--site-text, #191919)" }}>
                    {t.name}
                  </div>
                  <div className="text-xs" style={{ color: "var(--site-muted, #666)" }}>
                    {t.role}{t.company ? `, ${t.company}` : ""}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(Testimonials3DarkBlockPreviewInner);
