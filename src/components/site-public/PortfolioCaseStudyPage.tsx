"use client";

import { useEffect, useRef } from "react";
import type { Site } from "@/types";
import type { PortfolioData } from "@/app/s/[slug]/portfolio/[projectSlug]/page";
import { resolveTheme, computeThemeVars } from "@/lib/block-style-engine";

/* ═══════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════ */

interface Props {
  portfolio: PortfolioData;
  site: Site;
  siteSlug: string;
}

type GalleryItem = PortfolioData["gallery"][number];

/* ═══════════════════════════════════════════════════
   Fade-in animation hook
   ═══════════════════════════════════════════════════ */

function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function FadeIn({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useFadeIn();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: 0,
        transform: "translateY(24px)",
        transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Main Page Component
   ═══════════════════════════════════════════════════ */

export default function PortfolioCaseStudyPage({ portfolio, site, siteSlug }: Props) {
  const resolvedTheme = resolveTheme(site.theme, site.design);
  const themeVars = computeThemeVars(resolvedTheme);

  const p = portfolio;
  const hasContent = p.introText || p.challengeText || p.solutionText;
  const contentSections = [
    { label: "Contexte", icon: "context", text: p.introText },
    { label: "Le défi", icon: "challenge", text: p.challengeText },
    { label: "La solution", icon: "solution", text: p.solutionText },
  ].filter((s) => s.text);
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
      <PortfolioNav siteName={site.settings.name} siteSlug={siteSlug} />

      {/* ─── HERO ─── */}
      <PortfolioHero portfolio={p} />

      {/* ─── META STRIP ─── */}
      <PortfolioMetaStrip portfolio={p} />

      {/* ─── SUMMARY / OVERVIEW ─── */}
      {p.summary && <PortfolioOverview summary={p.summary} />}

      {/* ─── CONTENT SECTIONS (Context / Challenge / Solution) ─── */}
      {hasContent && <PortfolioContentGrid sections={contentSections} />}

      {/* ─── GALLERY ─── */}
      {hasGallery && <PortfolioGallery gallery={p.gallery} />}

      {/* ─── RESULTS ─── */}
      {hasResults && <PortfolioResults result={p.result} resultText={p.resultText} />}

      {/* ─── CTA ─── */}
      {hasCta && <PortfolioCTA ctaLabel={p.ctaLabel!} ctaUrl={p.ctaUrl!} />}

      {/* ─── Footer ─── */}
      <PortfolioFooter siteName={site.settings.name} siteSlug={siteSlug} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   1. NAV
   ═══════════════════════════════════════════════════ */

function PortfolioNav({ siteName, siteSlug }: { siteName: string; siteSlug: string }) {
  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-md"
      style={{
        backgroundColor: "color-mix(in srgb, var(--site-bg, #fff) 85%, transparent)",
        borderBottom: "1px solid color-mix(in srgb, var(--site-border, #E6E6E4) 50%, transparent)",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 sm:px-8 h-14 flex items-center justify-between">
        <a
          href={`/s/${siteSlug}`}
          className="text-[13px] font-medium flex items-center gap-2 transition-opacity hover:opacity-70"
          style={{ color: "var(--site-muted, #8A8A88)" }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          {siteName}
        </a>
        <a
          href={`/s/${siteSlug}`}
          className="text-[11px] font-medium uppercase tracking-widest transition-opacity hover:opacity-70"
          style={{ color: "var(--site-muted, #8A8A88)" }}
        >
          Portfolio
        </a>
      </div>
    </nav>
  );
}

/* ═══════════════════════════════════════════════════
   2. HERO — Stacked editorial with full-bleed cover
   ═══════════════════════════════════════════════════ */

function PortfolioHero({ portfolio: p }: { portfolio: PortfolioData }) {
  return (
    <header>
      {/* Text zone */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 pt-16 sm:pt-20 pb-10 sm:pb-14">
        <FadeIn>
          {/* Category badge */}
          {p.category && (
            <span
              className="inline-block text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.15em] px-3 py-1.5 rounded-full mb-6"
              style={{
                backgroundColor: "color-mix(in srgb, var(--site-primary, #4F46E5) 12%, transparent)",
                color: "var(--site-primary, #4F46E5)",
              }}
            >
              {p.category}
            </span>
          )}

          {/* Title */}
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.08] tracking-tight mb-5"
            style={{
              color: "var(--site-text, #191919)",
              fontFamily: "var(--site-heading-font, inherit)",
            }}
          >
            {p.title}
          </h1>

          {/* Subtitle */}
          {p.subtitle && (
            <p
              className="text-lg sm:text-xl leading-relaxed max-w-2xl"
              style={{ color: "var(--site-muted, #666)" }}
            >
              {p.subtitle}
            </p>
          )}
        </FadeIn>
      </div>

      {/* Cover image — full-bleed premium */}
      <FadeIn delay={0.15}>
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          {p.coverUrl ? (
            <div
              className="w-full overflow-hidden rounded-xl sm:rounded-2xl"
              style={{ border: "1px solid color-mix(in srgb, var(--site-border, #E6E6E4) 60%, transparent)" }}
            >
              <img
                src={p.coverUrl}
                alt={p.title}
                className="w-full aspect-[16/9] object-cover"
              />
            </div>
          ) : (
            <div
              className="w-full aspect-[16/9] rounded-xl sm:rounded-2xl flex items-center justify-center"
              style={{
                backgroundColor: "color-mix(in srgb, var(--site-surface, #F7F7F5) 60%, var(--site-bg, #fff))",
                border: "1px solid color-mix(in srgb, var(--site-border, #E6E6E4) 40%, transparent)",
              }}
            >
              <div
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl flex items-center justify-center text-3xl sm:text-4xl font-bold shadow-lg"
                style={{
                  backgroundColor: p.color || "var(--site-primary, #4F46E5)",
                  color: "#fff",
                  boxShadow: `0 8px 32px color-mix(in srgb, ${p.color || "var(--site-primary, #4F46E5)"} 30%, transparent)`,
                }}
              >
                {p.title.slice(0, 2).toUpperCase()}
              </div>
            </div>
          )}
        </div>
      </FadeIn>
    </header>
  );
}

/* ═══════════════════════════════════════════════════
   3. META STRIP — Horizontal info band
   ═══════════════════════════════════════════════════ */

function PortfolioMetaStrip({ portfolio: p }: { portfolio: PortfolioData }) {
  const items: { label: string; value: string }[] = [];
  if (p.category) items.push({ label: "Type", value: p.category });
  if (p.clientName) items.push({ label: "Client", value: p.clientName + (p.clientCompany ? ` — ${p.clientCompany}` : "") });
  if (p.result) items.push({ label: "Résultat clé", value: p.result });
  if (p.tags.length > 0) items.push({ label: "Tags", value: p.tags.slice(0, 4).join(" · ") });

  if (items.length === 0) return null;

  return (
    <FadeIn delay={0.2}>
      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-10 sm:py-14">
        <div
          className="grid gap-px rounded-xl overflow-hidden"
          style={{
            gridTemplateColumns: `repeat(${Math.min(items.length, 4)}, 1fr)`,
            backgroundColor: "color-mix(in srgb, var(--site-border, #E6E6E4) 50%, transparent)",
            border: "1px solid color-mix(in srgb, var(--site-border, #E6E6E4) 50%, transparent)",
          }}
        >
          {items.map((item) => (
            <div
              key={item.label}
              className="px-5 py-5 sm:px-6 sm:py-6"
              style={{ backgroundColor: "var(--site-bg, #fff)" }}
            >
              <div
                className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.12em] mb-2"
                style={{ color: "var(--site-muted, #8A8A88)" }}
              >
                {item.label}
              </div>
              <div
                className="text-sm sm:text-[15px] font-medium leading-snug"
                style={{ color: "var(--site-text, #191919)" }}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </FadeIn>
  );
}

/* ═══════════════════════════════════════════════════
   4. OVERVIEW — Editorial introduction
   ═══════════════════════════════════════════════════ */

function PortfolioOverview({ summary }: { summary: string }) {
  return (
    <FadeIn>
      <section className="max-w-6xl mx-auto px-6 sm:px-8 pb-16 sm:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          {/* Label */}
          <div className="lg:col-span-4">
            <SectionLabel>Aperçu du projet</SectionLabel>
          </div>
          {/* Text */}
          <div className="lg:col-span-8">
            <p
              className="text-lg sm:text-xl leading-[1.7] whitespace-pre-line"
              style={{ color: "var(--site-text, #191919)" }}
            >
              {summary}
            </p>
          </div>
        </div>
      </section>
    </FadeIn>
  );
}

/* ═══════════════════════════════════════════════════
   5. CONTENT GRID — Context / Challenge / Solution
   ═══════════════════════════════════════════════════ */

function PortfolioContentGrid({ sections }: { sections: { label: string; icon: string; text: string | null }[] }) {
  const iconPaths: Record<string, React.ReactNode> = {
    context: (
      <>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </>
    ),
    challenge: (
      <>
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </>
    ),
    solution: (
      <>
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </>
    ),
  };

  return (
    <section className="max-w-6xl mx-auto px-6 sm:px-8 pb-20 sm:pb-24">
      {/* Divider */}
      <div
        className="mb-16 sm:mb-20"
        style={{ borderTop: "1px solid color-mix(in srgb, var(--site-border, #E6E6E4) 50%, transparent)" }}
      />

      <FadeIn>
        <SectionLabel className="mb-10 sm:mb-12">Le processus</SectionLabel>
      </FadeIn>

      <div className={`grid grid-cols-1 ${sections.length >= 3 ? "md:grid-cols-3" : sections.length === 2 ? "md:grid-cols-2" : ""} gap-5 sm:gap-6`}>
        {sections.map((section, i) => (
          <FadeIn key={section.label} delay={i * 0.1}>
            <div
              className="rounded-xl sm:rounded-2xl p-6 sm:p-8 h-full flex flex-col"
              style={{
                backgroundColor: "color-mix(in srgb, var(--site-surface, #F7F7F5) 60%, var(--site-bg, #fff))",
                border: "1px solid color-mix(in srgb, var(--site-border, #E6E6E4) 40%, transparent)",
              }}
            >
              {/* Icon */}
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-5"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--site-primary, #4F46E5) 10%, transparent)",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ stroke: "var(--site-primary, #4F46E5)" }}
                >
                  {iconPaths[section.icon] || iconPaths.context}
                </svg>
              </div>

              {/* Label */}
              <h3
                className="text-[13px] font-semibold uppercase tracking-[0.1em] mb-3"
                style={{ color: "var(--site-primary, #4F46E5)" }}
              >
                {section.label}
              </h3>

              {/* Text */}
              <p
                className="text-[15px] leading-[1.75] whitespace-pre-line flex-1"
                style={{ color: "var(--site-text, #191919)", opacity: 0.85 }}
              >
                {section.text}
              </p>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   6. GALLERY — Vertical editorial, native aspect ratios
   ═══════════════════════════════════════════════════ */

function PortfolioGallery({ gallery }: { gallery: GalleryItem[] }) {
  return (
    <section
      className="py-20 sm:py-24"
      style={{
        backgroundColor: "color-mix(in srgb, var(--site-surface, #F7F7F5) 40%, var(--site-bg, #fff))",
      }}
    >
      <div className="max-w-5xl mx-auto px-6 sm:px-8">
        <FadeIn>
          <SectionLabel className="mb-10 sm:mb-12">Galerie</SectionLabel>
        </FadeIn>

        <div className="space-y-8 sm:space-y-10">
          {gallery.map((item, i) => (
            <FadeIn key={item.id} delay={i * 0.06}>
              <GalleryMedia item={item} />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function GalleryMedia({ item }: { item: GalleryItem }) {
  const borderStyle: React.CSSProperties = {
    border: "1px solid color-mix(in srgb, var(--site-border, #E6E6E4) 40%, transparent)",
  };

  if (item.type === "video") {
    return (
      <div className="flex justify-center">
        <div className="w-full overflow-hidden rounded-xl sm:rounded-2xl shadow-sm" style={borderStyle}>
          <video src={item.url} controls className="w-full h-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <div
        className="w-full overflow-hidden rounded-xl sm:rounded-2xl shadow-sm transition-transform duration-500 hover:scale-[1.01]"
        style={borderStyle}
      >
        <img
          src={item.url}
          alt={item.title || ""}
          className="max-w-full w-full h-auto block"
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   7. RESULTS — Bold stats section
   ═══════════════════════════════════════════════════ */

function PortfolioResults({ result, resultText }: { result: string | null; resultText: string | null }) {
  return (
    <section className="max-w-6xl mx-auto px-6 sm:px-8 py-20 sm:py-24">
      {/* Divider */}
      <div
        className="mb-16 sm:mb-20"
        style={{ borderTop: "1px solid color-mix(in srgb, var(--site-border, #E6E6E4) 50%, transparent)" }}
      />

      <FadeIn>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Left — label + key metric */}
          <div className="lg:col-span-4">
            <SectionLabel className="mb-6">Résultats</SectionLabel>

            {result && (
              <div
                className="inline-block text-2xl sm:text-3xl font-bold px-5 py-3 rounded-xl"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--site-primary, #4F46E5) 10%, transparent)",
                  color: "var(--site-primary, #4F46E5)",
                }}
              >
                {result}
              </div>
            )}
          </div>

          {/* Right — detailed text */}
          <div className="lg:col-span-8 flex items-center">
            {resultText && (
              <p
                className="text-lg sm:text-xl leading-[1.7] whitespace-pre-line"
                style={{ color: "var(--site-text, #191919)" }}
              >
                {resultText}
              </p>
            )}
          </div>
        </div>
      </FadeIn>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   8. CTA — Final call to action
   ═══════════════════════════════════════════════════ */

function PortfolioCTA({ ctaLabel, ctaUrl }: { ctaLabel: string; ctaUrl: string }) {
  return (
    <FadeIn>
      <section className="max-w-6xl mx-auto px-6 sm:px-8 pb-20 sm:pb-24">
        <div
          className="rounded-2xl sm:rounded-3xl px-8 sm:px-16 py-14 sm:py-20 text-center"
          style={{
            backgroundColor: "color-mix(in srgb, var(--site-surface, #F7F7F5) 60%, var(--site-bg, #fff))",
            border: "1px solid color-mix(in srgb, var(--site-border, #E6E6E4) 50%, transparent)",
          }}
        >
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-4"
            style={{
              color: "var(--site-text, #191919)",
              fontFamily: "var(--site-heading-font, inherit)",
            }}
          >
            Intéressé par un projet similaire ?
          </h2>
          <p
            className="text-base sm:text-lg leading-relaxed max-w-lg mx-auto mb-8"
            style={{ color: "var(--site-muted, #666)" }}
          >
            Discutons de votre prochain projet et voyons comment je peux vous aider.
          </p>
          <a
            href={ctaUrl}
            className="inline-flex items-center gap-2 px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl text-[14px] sm:text-[15px] font-semibold transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
            style={{
              backgroundColor: "var(--btn-bg, var(--site-primary, #4F46E5))",
              color: "var(--btn-text, #fff)",
              borderRadius: "var(--site-btn-radius, 12px)",
              boxShadow: "0 4px 16px color-mix(in srgb, var(--site-primary, #4F46E5) 25%, transparent)",
            }}
          >
            {ctaLabel}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        </div>
      </section>
    </FadeIn>
  );
}

/* ═══════════════════════════════════════════════════
   9. FOOTER
   ═══════════════════════════════════════════════════ */

function PortfolioFooter({ siteName, siteSlug }: { siteName: string; siteSlug: string }) {
  return (
    <footer
      className="py-10"
      style={{
        borderTop: "1px solid color-mix(in srgb, var(--site-border, #E6E6E4) 40%, transparent)",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 sm:px-8 flex items-center justify-between">
        <a
          href={`/s/${siteSlug}`}
          className="text-[13px] font-medium flex items-center gap-2 transition-opacity hover:opacity-70"
          style={{ color: "var(--site-muted, #8A8A88)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Retour au site
        </a>
        <span
          className="text-[11px] font-medium uppercase tracking-widest"
          style={{ color: "var(--site-muted, #8A8A88)", opacity: 0.6 }}
        >
          {siteName}
        </span>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════
   Shared sub-components
   ═══════════════════════════════════════════════════ */

function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`text-[11px] sm:text-xs font-semibold uppercase tracking-[0.15em] ${className || ""}`}
      style={{ color: "var(--site-primary, #4F46E5)" }}
    >
      {children}
    </div>
  );
}
