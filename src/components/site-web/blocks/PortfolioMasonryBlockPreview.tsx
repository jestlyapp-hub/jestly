"use client";

import { memo } from "react";
import type { PortfolioMasonryBlockContent, PortfolioCard } from "@/types";
import { getProjectHref } from "@/lib/site-utils";

function PortfolioMasonryBlockPreviewInner({ content, siteSlug }: { content: PortfolioMasonryBlockContent; siteSlug?: string }) {
  const columnCount = content.columns === 2 ? 2 : 3;

  // Merge linked projects with manual items
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items: { imageUrl: string; title: string; category: string; description?: string; externalUrl?: string; slug?: string; ctaUrl?: string }[] =
    (content as any).source === "linked_projects" && (content as any).resolvedProjects?.length
      ? ((content as any).resolvedProjects as PortfolioCard[]).map((rp) => ({
          imageUrl: rp.imageUrl || "",
          title: rp.title,
          category: rp.category,
          description: rp.summary,
          slug: rp.slug,
          ctaUrl: rp.ctaUrl,
        }))
      : content.items;

  return (
    <section className="relative py-20 px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        {(content.title || content.subtitle) && (
          <div className="text-center mb-14">
            {content.title && (
              <h2
                className="text-3xl sm:text-4xl font-bold mb-4"
                style={{ color: "var(--site-text, #fafafa)", fontFamily: "var(--site-heading-font, inherit)" }}
              >
                {content.title}
              </h2>
            )}
            {content.subtitle && (
              <p className="text-base max-w-2xl mx-auto leading-relaxed" style={{ color: "var(--site-muted, #a1a1a1)" }}>
                {content.subtitle}
              </p>
            )}
          </div>
        )}

        {/* Masonry grid */}
        <div style={{ columnCount, columnGap: "16px" }}>
          {items.map((item, i) => {
            const aspectRatios = ["aspect-[3/4]", "aspect-[4/3]", "aspect-square", "aspect-[3/5]", "aspect-[5/3]"];
            const aspect = aspectRatios[i % aspectRatios.length];
            const link = getProjectHref(item, siteSlug);

            const cardContent = (
              <>
                {/* Image or gradient placeholder */}
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(${135 + i * 30}deg, color-mix(in srgb, var(--site-primary) ${15 + (i % 3) * 5}%, var(--site-surface, #0a0a0a)), var(--site-surface, #0a0a0a) 80%)`,
                    }}
                  >
                    <div
                      className="absolute inset-0 opacity-[0.03]"
                      style={{
                        backgroundImage: "linear-gradient(var(--site-text, #fff) 1px, transparent 1px), linear-gradient(90deg, var(--site-text, #fff) 1px, transparent 1px)",
                        backgroundSize: "32px 32px",
                      }}
                    />
                  </div>
                )}

                {/* Hover overlay */}
                <div
                  className="absolute inset-0 flex flex-col justify-end p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)" }}
                >
                  <span
                    className="inline-block self-start text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded mb-2"
                    style={{ background: "var(--site-primary-light, rgba(79,70,229,0.15))", color: "var(--site-primary)" }}
                  >
                    {item.category}
                  </span>
                  <h3 className="text-[15px] font-semibold mb-1" style={{ color: "var(--site-text, #fff)" }}>
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-[12px] leading-relaxed line-clamp-2" style={{ color: "var(--site-muted, rgba(255,255,255,0.7))" }}>
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Bottom info bar */}
                <div
                  className="absolute bottom-0 left-0 right-0 p-4 group-hover:opacity-0 transition-opacity duration-300"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)" }}
                >
                  <span className="text-[12px] font-medium" style={{ color: "rgba(255,255,255,0.9)" }}>
                    {item.title}
                  </span>
                </div>
              </>
            );

            const cardClass = `relative ${aspect} rounded-xl overflow-hidden ${link ? "cursor-pointer" : ""}`;
            const cardStyle = { border: "1px solid var(--site-border, #262626)" };

            return (
              <div key={i} className="mb-4 break-inside-avoid group" style={{ breakInside: "avoid" }}>
                {link ? (
                  <a
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    className={`block ${cardClass}`}
                    style={cardStyle}
                  >
                    {cardContent}
                  </a>
                ) : (
                  <div className={cardClass} style={cardStyle}>
                    {cardContent}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default memo(PortfolioMasonryBlockPreviewInner);
