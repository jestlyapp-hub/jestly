"use client";

import type { Site } from "@/types";
import type { PortfolioData } from "@/app/s/[slug]/portfolio/[projectSlug]/page";
import { resolveTheme, computeThemeVars } from "@/lib/block-style-engine";

interface Props {
  portfolio: PortfolioData;
  site: Site;
  siteSlug: string;
}

export default function PortfolioCaseStudyPage({ portfolio, site, siteSlug }: Props) {
  const resolvedTheme = resolveTheme(site.theme, site.design);
  const themeVars = computeThemeVars(resolvedTheme);

  const p = portfolio;
  const hasContent = p.introText || p.challengeText || p.solutionText;
  const hasResults = p.resultText || p.result;
  const hasGallery = p.gallery.length > 0;
  const hasCta = p.ctaLabel && p.ctaUrl;

  return (
    <div
      className="min-h-screen"
      style={{
        fontFamily: resolvedTheme.fontFamily || "Inter, system-ui, sans-serif",
        backgroundColor: "var(--site-bg, #ffffff)",
        color: "var(--site-text, #191919)",
        ...themeVars,
      }}
    >
      {/* ─── Minimal nav ─── */}
      <nav
        className="sticky top-0 z-50 border-b backdrop-blur-sm"
        style={{
          backgroundColor: "color-mix(in srgb, var(--site-bg, #fff) 90%, transparent)",
          borderColor: "var(--site-border, #E6E6E4)",
        }}
      >
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <a
            href={`/s/${siteSlug}`}
            className="text-[13px] font-medium flex items-center gap-1.5 transition-colors"
            style={{ color: "var(--site-muted, #8A8A88)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            {site.settings.name}
          </a>
          {p.category && (
            <span
              className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full"
              style={{
                backgroundColor: "var(--site-primary-light, #EEF2FF)",
                color: "var(--site-primary, #4F46E5)",
              }}
            >
              {p.category}
            </span>
          )}
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <header className="relative">
        {/* Cover image */}
        {p.coverUrl ? (
          <div className="w-full aspect-[21/9] max-h-[480px] overflow-hidden">
            <img
              src={p.coverUrl}
              alt={p.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div
            className="w-full aspect-[21/9] max-h-[480px] flex items-center justify-center"
            style={{ backgroundColor: "var(--site-surface, #F7F7F5)" }}
          >
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold"
              style={{
                backgroundColor: p.color || "var(--site-primary, #4F46E5)",
                color: "#fff",
              }}
            >
              {p.title.slice(0, 2).toUpperCase()}
            </div>
          </div>
        )}

        {/* Hero content */}
        <div className="max-w-3xl mx-auto px-6 pt-10 pb-8">
          {p.category && (
            <span
              className="inline-block text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full mb-4"
              style={{
                backgroundColor: "var(--site-primary-light, #EEF2FF)",
                color: "var(--site-primary, #4F46E5)",
              }}
            >
              {p.category}
            </span>
          )}

          <h1
            className="text-3xl sm:text-4xl font-bold leading-tight mb-3"
            style={{
              color: "var(--site-text, #191919)",
              fontFamily: "var(--site-heading-font, inherit)",
            }}
          >
            {p.title}
          </h1>

          {p.subtitle && (
            <p
              className="text-lg leading-relaxed mb-4"
              style={{ color: "var(--site-muted, #666)" }}
            >
              {p.subtitle}
            </p>
          )}

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3 mt-5">
            {p.result && (
              <span
                className="text-[13px] font-semibold px-3 py-1.5 rounded-lg"
                style={{
                  backgroundColor: "var(--site-primary-light, #EEF2FF)",
                  color: "var(--site-primary, #4F46E5)",
                }}
              >
                {p.result}
              </span>
            )}
            {p.clientName && (
              <span
                className="text-[13px] px-3 py-1.5 rounded-lg"
                style={{
                  backgroundColor: "var(--site-surface, #F7F7F5)",
                  color: "var(--site-muted, #666)",
                  border: "1px solid var(--site-border, #E6E6E4)",
                }}
              >
                Client : {p.clientName}
                {p.clientCompany ? ` — ${p.clientCompany}` : ""}
              </span>
            )}
            {p.tags.length > 0 && p.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[11px] px-2 py-1 rounded"
                style={{
                  backgroundColor: "var(--site-surface, #F7F7F5)",
                  color: "var(--site-muted, #666)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div
          className="max-w-3xl mx-auto px-6"
          style={{ borderBottom: "1px solid var(--site-border, #E6E6E4)" }}
        />
      </header>

      {/* ─── SUMMARY ─── */}
      {p.summary && (
        <section className="max-w-3xl mx-auto px-6 py-10">
          <p
            className="text-base leading-relaxed"
            style={{ color: "var(--site-text, #191919)" }}
          >
            {p.summary}
          </p>
        </section>
      )}

      {/* ─── CONTENT SECTIONS ─── */}
      {hasContent && (
        <div className="max-w-3xl mx-auto px-6 pb-6 space-y-10">
          {/* Intro */}
          {p.introText && (
            <ContentSection
              label="Contexte"
              text={p.introText}
            />
          )}

          {/* Challenge */}
          {p.challengeText && (
            <ContentSection
              label="Le défi"
              text={p.challengeText}
            />
          )}

          {/* Solution */}
          {p.solutionText && (
            <ContentSection
              label="La solution"
              text={p.solutionText}
            />
          )}
        </div>
      )}

      {/* ─── GALLERY ─── */}
      {hasGallery && (
        <section className="py-10">
          <div className="max-w-5xl mx-auto px-6">
            <h2
              className="text-xl font-semibold mb-6"
              style={{
                color: "var(--site-text, #191919)",
                fontFamily: "var(--site-heading-font, inherit)",
              }}
            >
              Galerie
            </h2>

            {p.gallery.length === 1 ? (
              <GalleryImage item={p.gallery[0]} />
            ) : p.gallery.length === 2 ? (
              <div className="grid grid-cols-2 gap-3">
                {p.gallery.map((item) => <GalleryImage key={item.id} item={item} />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {p.gallery.map((item, i) => (
                  <div key={item.id} className={i === 0 ? "col-span-2 row-span-2" : ""}>
                    <GalleryImage item={item} large={i === 0} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ─── RESULTS ─── */}
      {hasResults && (
        <section
          className="py-12"
          style={{ backgroundColor: "var(--site-surface, #F7F7F5)" }}
        >
          <div className="max-w-3xl mx-auto px-6">
            <h2
              className="text-xl font-semibold mb-4"
              style={{
                color: "var(--site-text, #191919)",
                fontFamily: "var(--site-heading-font, inherit)",
              }}
            >
              Résultats
            </h2>

            {p.result && (
              <div
                className="inline-block text-lg font-bold px-4 py-2 rounded-lg mb-4"
                style={{
                  backgroundColor: "var(--site-primary-light, #EEF2FF)",
                  color: "var(--site-primary, #4F46E5)",
                }}
              >
                {p.result}
              </div>
            )}

            {p.resultText && (
              <p
                className="text-base leading-relaxed"
                style={{ color: "var(--site-text, #191919)" }}
              >
                {p.resultText}
              </p>
            )}
          </div>
        </section>
      )}

      {/* ─── CTA ─── */}
      {hasCta && (
        <section className="py-16">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <h2
              className="text-2xl font-bold mb-3"
              style={{
                color: "var(--site-text, #191919)",
                fontFamily: "var(--site-heading-font, inherit)",
              }}
            >
              Intéressé par un projet similaire ?
            </h2>
            <p className="text-base mb-6" style={{ color: "var(--site-muted, #666)" }}>
              Discutons de votre projet et voyons comment je peux vous aider.
            </p>
            <a
              href={p.ctaUrl!}
              className="inline-block px-8 py-3 rounded-lg text-[14px] font-semibold transition-all hover:opacity-90"
              style={{
                backgroundColor: "var(--btn-bg, var(--site-primary, #4F46E5))",
                color: "var(--btn-text, #fff)",
                borderRadius: "var(--site-btn-radius, 8px)",
              }}
            >
              {p.ctaLabel}
            </a>
          </div>
        </section>
      )}

      {/* ─── Footer ─── */}
      <footer
        className="border-t py-8"
        style={{
          backgroundColor: "var(--site-surface, var(--site-bg, #F7F7F5))",
          borderColor: "var(--site-border, #E6E6E4)",
        }}
      >
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <a
            href={`/s/${siteSlug}`}
            className="text-[13px] font-medium transition-colors"
            style={{ color: "var(--site-muted, #8A8A88)" }}
          >
            &larr; Retour au site
          </a>
          <span className="text-[11px]" style={{ color: "var(--site-muted, #8A8A88)" }}>
            {site.settings.name}
          </span>
        </div>
      </footer>
    </div>
  );
}

/* ─── Sub-components ─── */

function ContentSection({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <h3
        className="text-xs font-semibold uppercase tracking-wider mb-3"
        style={{ color: "var(--site-primary, #4F46E5)" }}
      >
        {label}
      </h3>
      <p
        className="text-base leading-relaxed whitespace-pre-line"
        style={{ color: "var(--site-text, #191919)" }}
      >
        {text}
      </p>
    </div>
  );
}

function GalleryImage({ item, large }: { item: { id: string; type: string; url: string; title: string | null }; large?: boolean }) {
  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ border: "1px solid var(--site-border, #E6E6E4)" }}
    >
      {item.type === "video" ? (
        <video
          src={item.url}
          controls
          className={`w-full object-cover ${large ? "aspect-[16/10]" : "aspect-[4/3]"}`}
        />
      ) : (
        <img
          src={item.url}
          alt={item.title || ""}
          className={`w-full object-cover ${large ? "aspect-[16/10]" : "aspect-[4/3]"}`}
        />
      )}
    </div>
  );
}
