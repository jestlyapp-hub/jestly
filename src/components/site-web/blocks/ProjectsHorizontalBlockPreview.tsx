"use client";

import { memo } from "react";
import type { ProjectsHorizontalBlockContent, PortfolioCard } from "@/types";

function ProjectsHorizontalBlockPreviewInner({ content }: { content: ProjectsHorizontalBlockContent }) {
  // Merge linked projects with manual items
  const projects: { imageUrl?: string; title: string; category: string }[] =
    (content as any).source === "linked_projects" && (content as any).resolvedProjects?.length
      ? ((content as any).resolvedProjects as PortfolioCard[]).map((rp) => ({
          imageUrl: rp.imageUrl || "",
          title: rp.title,
          category: rp.category,
        }))
      : content.projects;
  return (
    <section
      className="py-16 px-6"
    >
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
            className="text-base leading-relaxed mb-8 max-w-xl"
            style={{ color: "var(--site-muted, #666)" }}
          >
            {content.subtitle}
          </p>
        )}

        <div className="overflow-x-auto -mx-6 px-6 pb-4">
          <div className="flex gap-5 flex-nowrap" style={{ minWidth: "max-content" }}>
            {projects.map((project, i) => (
              <div
                key={i}
                className="w-72 flex-shrink-0 rounded-lg overflow-hidden"
                style={{
                  backgroundColor: "var(--site-surface, #F7F7F5)",
                  border: "1px solid var(--site-border, #E6E6E4)",
                }}
              >
                {/* Large cover */}
                {project.imageUrl ? (
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="w-full aspect-[4/3] object-cover"
                  />
                ) : (
                  <div
                    className="w-full aspect-[4/3] flex flex-col items-center justify-center gap-2"
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

                <div className="p-4">
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: "var(--site-primary, #4F46E5)" }}
                  >
                    {project.category}
                  </span>
                  <h3
                    className="text-base font-semibold mt-1"
                    style={{
                      color: "var(--site-text, #1A1A1A)",
                      fontFamily: "var(--site-heading-font, inherit)",
                    }}
                  >
                    {project.title}
                  </h3>
                </div>
              </div>
            ))}

            {/* CTA link at end */}
            {content.ctaLabel && (
              <div
                className="w-48 flex-shrink-0 rounded-lg flex items-center justify-center"
                style={{
                  border: "1px dashed var(--site-border, #E6E6E4)",
                }}
              >
                <span
                  className="text-sm font-semibold"
                  style={{ color: "var(--site-primary, #4F46E5)" }}
                >
                  {content.ctaLabel} &rarr;
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(ProjectsHorizontalBlockPreviewInner);
