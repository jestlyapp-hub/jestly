"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
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
  basePath?: string;
}

type GalleryItem = PortfolioData["gallery"][number];

/* ═══════════════════════════════════════════════════
   Fade-in observer
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
      { threshold: 0.08 }
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
        transform: "translateY(20px)",
        transition: `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════ */

export default function PortfolioCaseStudyPage({ portfolio, site, siteSlug, basePath }: Props) {
  const siteUrl = basePath ?? `/s/${siteSlug}`;
  const resolvedTheme = resolveTheme(site.theme, site.design);
  const themeVars = computeThemeVars(resolvedTheme);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const p = portfolio;
  const hasGallery = p.gallery.length > 0;
  const hasContent = p.introText || p.challengeText || p.solutionText || p.summary;
  const hasResults = p.resultText || p.result;
  const hasCta = p.ctaLabel && p.ctaUrl;

  // Guess tags from gallery titles or use real tags
  const tags: string[] = p.tags.length > 0 ? p.tags : p.gallery.map(g => g.title).filter((t): t is string => !!t);

  return (
    <div
      className="min-h-screen"
      style={{
        fontFamily: resolvedTheme.fontFamily || "Inter, system-ui, sans-serif",
        backgroundColor: "#0A0A0B",
        color: "#F5F5F5",
        ...themeVars,
      }}
    >
      {/* ─── Nav ─── */}
      <nav className="sticky top-0 z-50 backdrop-blur-md" style={{ backgroundColor: "rgba(10,10,11,0.85)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-12 flex items-center justify-between">
          <a href={siteUrl} className="text-[12px] font-medium text-white/50 flex items-center gap-1.5 hover:text-white/80 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
            {site.settings.name}
          </a>
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">Portfolio</span>
        </div>
      </nav>

      {/* ─── HERO COMPACT ─── */}
      <header className="max-w-7xl mx-auto px-5 sm:px-8 pt-10 sm:pt-14 pb-8 sm:pb-10">
        <FadeIn>
          <div className="flex flex-col gap-3">
            {p.category && (
              <span className="inline-flex self-start text-[10px] font-semibold uppercase tracking-[0.18em] px-3 py-1 rounded-full bg-white/[0.06] text-white/50 border border-white/[0.06]">
                {p.category}
              </span>
            )}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.1] tracking-tight text-white" style={{ fontFamily: "var(--site-heading-font, inherit)" }}>
              {p.title}
            </h1>
            {p.subtitle && (
              <p className="text-[15px] sm:text-base leading-relaxed text-white/45 max-w-2xl">{p.subtitle}</p>
            )}
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              {p.clientName && <MetaChip>{p.clientName}</MetaChip>}
              {p.category && <MetaChip>{p.category}</MetaChip>}
              {hasGallery && <MetaChip>{p.gallery.length} création{p.gallery.length > 1 ? "s" : ""}</MetaChip>}
            </div>
          </div>
        </FadeIn>
      </header>

      {/* ─── GALLERY IMMÉDIATE ─── */}
      {hasGallery && (
        <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-16 sm:pb-24">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {p.gallery.map((item, i) => (
              <FadeIn key={item.id} delay={Math.min(i * 0.04, 0.4)}>
                <GalleryCard
                  item={item}
                  index={i}
                  tag={tags[i]}
                  featured={i === 0}
                  onClick={() => setLightboxIndex(i)}
                />
              </FadeIn>
            ))}
          </div>
        </section>
      )}

      {/* ─── TEXTE LÉGER (sous la galerie) ─── */}
      {hasContent && <ContentSection portfolio={p} />}

      {/* ─── RÉSULTATS ─── */}
      {hasResults && (
        <FadeIn>
          <section className="max-w-4xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
            <div className="rounded-2xl p-8 sm:p-10 border border-white/[0.06]" style={{ background: "rgba(255,255,255,0.02)" }}>
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30 mb-4 block">Résultats</span>
              {p.result && <div className="text-2xl sm:text-3xl font-bold text-white mb-3">{p.result}</div>}
              {p.resultText && <p className="text-[15px] leading-[1.7] text-white/55 whitespace-pre-line">{p.resultText}</p>}
            </div>
          </section>
        </FadeIn>
      )}

      {/* ─── CTA ─── */}
      {hasCta && (
        <FadeIn>
          <section className="max-w-4xl mx-auto px-5 sm:px-8 pb-20 sm:pb-28 text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3" style={{ fontFamily: "var(--site-heading-font, inherit)" }}>
              Intéressé par un projet similaire ?
            </h2>
            <p className="text-[14px] text-white/40 mb-7 max-w-md mx-auto">
              Discutons de votre prochain projet.
            </p>
            <a
              href={p.ctaUrl!}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-[14px] font-semibold transition-all duration-200 hover:scale-[1.02]"
              style={{
                backgroundColor: "var(--btn-bg, var(--site-primary, #4F46E5))",
                color: "var(--btn-text, #fff)",
                borderRadius: "var(--site-btn-radius, 12px)",
                boxShadow: "0 4px 24px rgba(79,70,229,0.3)",
              }}
            >
              {p.ctaLabel}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
            </a>
          </section>
        </FadeIn>
      )}

      {/* ─── Footer ─── */}
      <footer className="py-8 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between">
          <a href={siteUrl} className="text-[12px] font-medium text-white/30 flex items-center gap-1.5 hover:text-white/60 transition-colors">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
            Retour au site
          </a>
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/15">{site.settings.name}</span>
        </div>
      </footer>

      {/* ─── Lightbox ─── */}
      {lightboxIndex !== null && (
        <Lightbox
          gallery={p.gallery}
          index={lightboxIndex}
          tags={tags}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Gallery Card — Premium hover
   ═══════════════════════════════════════════════════ */

function GalleryCard({ item, index, tag, featured, onClick }: {
  item: GalleryItem; index: number; tag?: string; featured?: boolean; onClick: () => void;
}) {
  const isFeatured = featured && index === 0;

  return (
    <button
      onClick={onClick}
      className={`group relative overflow-hidden rounded-xl sm:rounded-2xl cursor-pointer border border-white/[0.04] transition-all duration-300 hover:border-white/[0.1] ${
        isFeatured ? "sm:col-span-2 lg:col-span-2" : ""
      }`}
      style={{ background: "#111113" }}
    >
      {/* Image */}
      <div className="relative aspect-[16/9] overflow-hidden">
        {item.type === "video" ? (
          <video src={item.url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" muted />
        ) : (
          <Image
            src={item.url}
            alt={item.title || `Création ${index + 1}`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            unoptimized
          />
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Bottom info on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          {tag && (
            <span className="inline-block text-[10px] font-semibold uppercase tracking-[0.15em] text-white/70 bg-white/[0.1] backdrop-blur-sm px-2.5 py-1 rounded-full mb-1.5">
              {tag}
            </span>
          )}
          {item.title && (
            <div className="text-[13px] font-medium text-white/90">{item.title}</div>
          )}
        </div>
      </div>
    </button>
  );
}

/* ═══════════════════════════════════════════════════
   Lightbox — Premium viewer
   ═══════════════════════════════════════════════════ */

function Lightbox({ gallery, index, tags, onClose, onNavigate }: {
  gallery: GalleryItem[]; index: number; tags: string[]; onClose: () => void; onNavigate: (i: number) => void;
}) {
  const item = gallery[index];
  const total = gallery.length;

  const goPrev = useCallback(() => onNavigate((index - 1 + total) % total), [index, total, onNavigate]);
  const goNext = useCallback(() => onNavigate((index + 1) % total), [index, total, onNavigate]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose, goPrev, goNext]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.92)", backdropFilter: "blur(20px)" }}>
      {/* Close */}
      <button onClick={onClose} className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center transition-colors z-10 cursor-pointer">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
      </button>

      {/* Prev */}
      {total > 1 && (
        <button onClick={goPrev} className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center transition-colors cursor-pointer">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
      )}

      {/* Next */}
      {total > 1 && (
        <button onClick={goNext} className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center transition-colors cursor-pointer">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><polyline points="9 6 15 12 9 18" /></svg>
        </button>
      )}

      {/* Image */}
      <div className="max-w-6xl w-full mx-4 sm:mx-8">
        <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden">
          {item.type === "video" ? (
            <video src={item.url} controls className="w-full h-full object-contain" />
          ) : (
            <Image src={item.url} alt={item.title || ""} fill className="object-contain" unoptimized />
          )}
        </div>

        {/* Info bar */}
        <div className="flex items-center justify-between mt-4 px-1">
          <div className="flex items-center gap-3">
            {tags[index] && (
              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/40 bg-white/[0.06] px-2.5 py-1 rounded-full">{tags[index]}</span>
            )}
            {item.title && <span className="text-[13px] font-medium text-white/60">{item.title}</span>}
          </div>
          <span className="text-[11px] font-medium text-white/25">{index + 1} / {total}</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Content Section — Compact, below gallery
   ═══════════════════════════════════════════════════ */

function ContentSection({ portfolio: p }: { portfolio: PortfolioData }) {
  const sections = [
    { label: "Contexte", text: p.introText },
    { label: "Le défi", text: p.challengeText },
    { label: "Approche", text: p.solutionText },
  ].filter((s) => s.text);

  if (sections.length === 0 && !p.summary) return null;

  return (
    <FadeIn>
      <section className="max-w-4xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
        <div className="border-t border-white/[0.06] pt-12 sm:pt-16">
          {p.summary && (
            <p className="text-[16px] sm:text-lg leading-[1.75] text-white/50 mb-12 max-w-3xl whitespace-pre-line">{p.summary}</p>
          )}

          {sections.length > 0 && (
            <div className={`grid grid-cols-1 ${sections.length >= 3 ? "md:grid-cols-3" : sections.length === 2 ? "md:grid-cols-2" : ""} gap-6`}>
              {sections.map((s) => (
                <div key={s.label} className="rounded-xl p-6 border border-white/[0.04]" style={{ background: "rgba(255,255,255,0.015)" }}>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/25 mb-3 block">{s.label}</span>
                  <p className="text-[14px] leading-[1.75] text-white/50 whitespace-pre-line">{s.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </FadeIn>
  );
}

/* ═══════════════════════════════════════════════════
   MetaChip — Tiny metadata pill
   ═══════════════════════════════════════════════════ */

function MetaChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] sm:text-[11px] font-medium text-white/30 bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/[0.04]">
      {children}
    </span>
  );
}
