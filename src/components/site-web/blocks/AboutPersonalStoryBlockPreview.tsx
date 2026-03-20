"use client";

import { memo } from "react";
import Image from "next/image";
import type { AboutPersonalStoryBlockContent } from "@/types";

function AboutPersonalStoryBlockPreviewInner({ content }: { content: AboutPersonalStoryBlockContent }) {
  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Left: Image / Portrait placeholder */}
        <div
          className="relative w-full aspect-[4/5] rounded-xl flex items-center justify-center overflow-hidden"
          style={{
            backgroundColor: "var(--site-surface, #F7F7F5)",
            border: "1px solid var(--site-border, #E6E6E4)",
          }}
        >
          {content.imageUrl ? (
            <Image src={content.imageUrl} alt={content.title} fill className="object-cover rounded-xl" unoptimized />
          ) : (
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--site-border, #E6E6E4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          )}
        </div>

        {/* Right: Story */}
        <div>
          <h2
            className="text-2xl font-bold mb-6"
            style={{ color: "var(--site-text, #191919)", fontFamily: "var(--site-heading-font, inherit)" }}
          >
            {content.title}
          </h2>

          <div className="space-y-4 mb-6">
            {content.story.split("\n").filter(Boolean).map((p, i) => (
              <p key={i} className="text-sm leading-relaxed" style={{ color: "var(--site-text, #191919)" }}>
                {p}
              </p>
            ))}
          </div>

          {content.highlights && content.highlights.length > 0 && (
            <ul className="space-y-2 mb-6">
              {content.highlights.map((h, i) => (
                <li key={i} className="text-sm flex items-start gap-2" style={{ color: "var(--site-text, #191919)" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--site-primary, #4F46E5)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {h}
                </li>
              ))}
            </ul>
          )}

          {content.mission && (
            <div
              className="rounded-lg p-4"
              style={{
                backgroundColor: "var(--site-primary-light, #EEF2FF)",
                border: "1px solid var(--site-border, #E6E6E4)",
              }}
            >
              <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--site-primary, #4F46E5)" }}>
                Mission
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--site-text, #191919)" }}>
                {content.mission}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default memo(AboutPersonalStoryBlockPreviewInner);
