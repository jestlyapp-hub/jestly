"use client";
import { memo } from "react";
import type { Content3ArticlesBlockContent } from "@/types";

const ImagePlaceholder = () => (
  <div
    className="w-full aspect-[16/10] flex items-center justify-center rounded-t-lg"
    style={{
      backgroundColor: "var(--site-surface, #F7F7F5)",
    }}
  >
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--site-muted, #666)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  </div>
);

function Content3ArticlesBlockPreviewInner({ content }: { content: Content3ArticlesBlockContent }) {
  const articles = content.articles?.length ? content.articles : [
    { title: "Article 1", excerpt: "Description de l\u2019article.", category: "Design", date: "7 mars 2026" },
    { title: "Article 2", excerpt: "Description de l\u2019article.", category: "Business", date: "5 mars 2026" },
    { title: "Article 3", excerpt: "Description de l\u2019article.", category: "Tech", date: "3 mars 2026" },
  ];

  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2
            className="text-2xl font-bold mb-2"
            style={{ color: "var(--site-text, #1A1A1A)", fontFamily: "var(--site-heading-font, inherit)" }}
          >
            {content.title}
          </h2>
          {content.subtitle && (
            <p className="text-sm max-w-xl mx-auto" style={{ color: "var(--site-muted, #666)" }}>
              {content.subtitle}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.slice(0, 3).map((article, i) => (
            <div
              key={i}
              className="rounded-lg overflow-hidden"
              style={{
                backgroundColor: "var(--site-surface, #F7F7F5)",
                border: "1px solid var(--site-border, #E6E6E4)",
              }}
            >
              {article.imageUrl ? (
                <div className="w-full aspect-[16/10] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <ImagePlaceholder />
              )}
              <div className="p-5">
                {article.category && (
                  <span
                    className="inline-block text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-3"
                    style={{
                      backgroundColor: "var(--site-primary-light, #EEF2FF)",
                      color: "var(--site-primary, #4F46E5)",
                    }}
                  >
                    {article.category}
                  </span>
                )}
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: "var(--site-text, #1A1A1A)", fontFamily: "var(--site-heading-font, inherit)" }}
                >
                  {article.title}
                </h3>
                <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--site-muted, #666)" }}>
                  {article.excerpt}
                </p>
                {article.date && (
                  <p className="text-xs" style={{ color: "var(--site-muted, #666)" }}>
                    {article.date}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(Content3ArticlesBlockPreviewInner);
