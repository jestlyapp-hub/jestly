"use client";

import { memo } from "react";
import type { ProjectsGridCasesBlockContent, PortfolioCard } from "@/types";

function ProjectsGridCasesBlockPreviewInner({ content, siteSlug }: { content: ProjectsGridCasesBlockContent; siteSlug?: string }) {
  const source = content.source || "manual";

  // Determine cards to render
  const cards: { imageUrl?: string; title: string; category: string; result?: string; slug?: string }[] =
    source === "linked_projects" && content.resolvedProjects?.length
      ? content.resolvedProjects.map((p: PortfolioCard) => ({
          imageUrl: p.imageUrl,
          title: p.title,
          category: p.category,
          result: p.result,
          slug: p.slug,
        }))
      : content.projects;

  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <h2
          className="text-3xl font-bold mb-2"
          style={{
            color: "var(--site-text, #1A1A1A)",
            fontFamily: "var(--site-heading-font, inherit)",
          }}
        >
          {content.title}
        </h2>

        {content.subtitle && (
          <p
            className="text-base leading-relaxed mb-10 max-w-xl"
            style={{ color: "var(--site-muted, #666)" }}
          >
            {content.subtitle}
          </p>
        )}

        {cards.length === 0 && source === "linked_projects" ? (
          <div
            className="py-16 text-center rounded-lg border-2 border-dashed"
            style={{ borderColor: "var(--site-border, #E6E6E4)" }}
          >
            <p className="text-sm" style={{ color: "var(--site-muted, #666)" }}>
              Aucun projet lié — liez des projets depuis le panneau d&apos;édition
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {cards.map((project, i) => {
              const href = siteSlug && project.slug ? `/s/${siteSlug}/portfolio/${project.slug}` : undefined;
              const Wrapper = href ? "a" : "div";

              return (
                <Wrapper
                  key={i}
                  {...(href ? { href } : {})}
                  className={`rounded-lg overflow-hidden block${href ? " transition-shadow hover:shadow-md" : ""}`}
                  style={{
                    backgroundColor: "var(--site-surface, #F7F7F5)",
                    border: "1px solid var(--site-border, #E6E6E4)",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  {/* Image */}
                  {project.imageUrl ? (
                    <img
                      src={project.imageUrl}
                      alt={project.title}
                      className="w-full aspect-[16/10] object-cover"
                    />
                  ) : (
                    <div
                      className="w-full aspect-[16/10] flex flex-col items-center justify-center gap-2"
                      style={{
                        backgroundColor: "var(--site-surface, #F7F7F5)",
                        borderBottom: "1px solid var(--site-border, #E6E6E4)",
                      }}
                    >
                      <svg
                        width="36"
                        height="36"
                        viewBox="0 0 24 24"
                        fill="none"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ stroke: "var(--site-muted, #666)" }}
                        className="opacity-30"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </div>
                  )}

                  <div className="p-5">
                    {project.category && (
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: "var(--site-primary-light, #EEF2FF)",
                            color: "var(--site-primary, #4F46E5)",
                          }}
                        >
                          {project.category}
                        </span>
                      </div>
                    )}
                    <h3
                      className="text-lg font-semibold mb-1"
                      style={{
                        color: "var(--site-text, #1A1A1A)",
                        fontFamily: "var(--site-heading-font, inherit)",
                      }}
                    >
                      {project.title}
                    </h3>
                    {project.result && (
                      <p
                        className="text-sm"
                        style={{ color: "var(--site-muted, #666)" }}
                      >
                        {project.result}
                      </p>
                    )}
                  </div>
                </Wrapper>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default memo(ProjectsGridCasesBlockPreviewInner);
