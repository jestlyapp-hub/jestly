"use client";

import { memo } from "react";
import type { ResultsLogosQuotesBlockContent } from "@/types";

function ResultsLogosQuotesBlockPreviewInner({ content }: { content: ResultsLogosQuotesBlockContent }) {
  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        {content.title && (
          <h2
            className="text-2xl font-bold text-center mb-10"
            style={{ color: "var(--site-text, #1A1A1A)", fontFamily: "var(--site-heading-font, inherit)" }}
          >
            {content.title}
          </h2>
        )}

        {/* Logo Strip */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-12">
          {content.logos.map((logo, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              {logo.imageUrl ? (
                <img src={logo.imageUrl} alt={logo.name} className="w-12 h-12 rounded-full object-cover" style={{ border: "1px solid var(--site-border, #E6E6E4)" }} />
              ) : (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{
                    backgroundColor: "var(--site-primary-light, #EEF2FF)",
                    color: "var(--site-primary, #4F46E5)",
                    border: "1px solid var(--site-border, #E6E6E4)",
                  }}
                >
                  {logo.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-[10px] font-medium" style={{ color: "var(--site-muted, #666)" }}>
                {logo.name}
              </span>
            </div>
          ))}
        </div>

        {/* Quotes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {content.quotes.map((q, i) => (
            <div
              key={i}
              className="rounded-xl p-6"
              style={{
                backgroundColor: "var(--site-surface, #F7F7F5)",
                border: "1px solid var(--site-border, #E6E6E4)",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--site-primary-light, #EEF2FF)" className="mb-3">
                <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
                <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
              </svg>
              <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--site-text, #1A1A1A)" }}>
                &ldquo;{q.text}&rdquo;
              </p>
              <div>
                <div className="text-sm font-semibold" style={{ color: "var(--site-text, #1A1A1A)" }}>
                  {q.name}
                </div>
                <div className="text-xs" style={{ color: "var(--site-muted, #666)" }}>
                  {q.role}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(ResultsLogosQuotesBlockPreviewInner);
