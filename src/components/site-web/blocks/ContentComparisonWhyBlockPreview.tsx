"use client";
import { memo } from "react";
import type { ContentComparisonWhyBlockContent } from "@/types";

function ContentComparisonWhyBlockPreviewInner({ content }: { content: ContentComparisonWhyBlockContent }) {
  const leftItems = content.leftColumn?.items?.length ? content.leftColumn.items : ["Option limitée", "Résultat incertain", "Support lent"];
  const rightItems = content.rightColumn?.items?.length ? content.rightColumn.items : ["Solution complète", "Résultat garanti", "Support réactif"];

  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2
            className="text-2xl font-bold mb-2"
            style={{ color: "var(--site-text, #191919)", fontFamily: "var(--site-heading-font, inherit)" }}
          >
            {content.title}
          </h2>
          {content.subtitle && (
            <p className="text-sm max-w-xl mx-auto" style={{ color: "var(--site-muted, #666)" }}>
              {content.subtitle}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column — negative / muted */}
          <div
            className="rounded-xl p-8"
            style={{
              backgroundColor: "var(--site-surface, #F7F7F5)",
              border: "1px solid var(--site-border, #E6E6E4)",
            }}
          >
            <h3
              className="text-lg font-semibold mb-6"
              style={{ color: "var(--site-muted, #666)", fontFamily: "var(--site-heading-font, inherit)" }}
            >
              {content.leftColumn?.title || "Sans nous"}
            </h3>
            <ul className="space-y-4">
              {leftItems.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5"
                    style={{ backgroundColor: "var(--site-surface, #F7F7F5)", border: "1px solid var(--site-border, #E6E6E4)" }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--site-muted, #666)" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </span>
                  <span className="text-sm" style={{ color: "var(--site-muted, #666)" }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right column — positive / accent */}
          <div
            className="rounded-xl p-8"
            style={{
              backgroundColor: "var(--site-primary-light, #EEF2FF)",
              border: "1px solid var(--site-border, #E6E6E4)",
            }}
          >
            <h3
              className="text-lg font-semibold mb-6"
              style={{ color: "var(--site-primary, #4F46E5)", fontFamily: "var(--site-heading-font, inherit)" }}
            >
              {content.rightColumn?.title || "Avec nous"}
            </h3>
            <ul className="space-y-4">
              {rightItems.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5"
                    style={{ backgroundColor: "var(--site-primary, #4F46E5)" }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </span>
                  <span className="text-sm" style={{ color: "var(--site-text, #191919)" }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(ContentComparisonWhyBlockPreviewInner);
