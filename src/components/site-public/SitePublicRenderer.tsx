"use client";

import { useState } from "react";
import type { Site, SitePage, Block, Product } from "@/types";
import { resolvePageSlug } from "@/lib/site-utils";
import {
  computePublicSectionStyle,
  computeSectionClass,
  computeButtonVars,
  getButtonHoverCSS,
  computeThemeVars,
} from "@/lib/block-style-engine";
import { ProductProvider } from "@/lib/product-context";
import AnimateOnScroll from "@/components/site-public/AnimateOnScroll";
import SiteAnalyticsTracker from "@/components/site-public/SiteAnalyticsTracker";

// ── Block Preview imports (reuse existing block content renderers) ──
import HeroBlockPreview from "@/components/site-web/blocks/HeroBlockPreview";
import PortfolioGridBlockPreview from "@/components/site-web/blocks/PortfolioGridBlockPreview";
import ServicesListBlockPreview from "@/components/site-web/blocks/ServicesListBlockPreview";
import PackPremiumBlockPreview from "@/components/site-web/blocks/PackPremiumBlockPreview";
import TestimonialsBlockPreview from "@/components/site-web/blocks/TestimonialsBlockPreview";
import TimelineProcessBlockPreview from "@/components/site-web/blocks/TimelineProcessBlockPreview";
import FaqAccordionBlockPreview from "@/components/site-web/blocks/FaqAccordionBlockPreview";
import VideoBlockPreview from "@/components/site-web/blocks/VideoBlockPreview";
import FullImageBlockPreview from "@/components/site-web/blocks/FullImageBlockPreview";
import WhyMeBlockPreview from "@/components/site-web/blocks/WhyMeBlockPreview";
import CenteredCtaBlockPreview from "@/components/site-web/blocks/CenteredCtaBlockPreview";
import CustomFormBlockPreview from "@/components/site-web/blocks/CustomFormBlockPreview";
import CalendarBookingBlockPreview from "@/components/site-web/blocks/CalendarBookingBlockPreview";
import StatsCounterBlockPreview from "@/components/site-web/blocks/StatsCounterBlockPreview";
import NewsletterBlockPreview from "@/components/site-web/blocks/NewsletterBlockPreview";
import PricingTableBlockPreview from "@/components/site-web/blocks/PricingTableBlockPreview";
import FeatureGridBlockPreview from "@/components/site-web/blocks/FeatureGridBlockPreview";
import TestimonialsCarouselBlockPreview from "@/components/site-web/blocks/TestimonialsCarouselBlockPreview";
import FaqAdvancedBlockPreview from "@/components/site-web/blocks/FaqAdvancedBlockPreview";
import TimelineAdvancedBlockPreview from "@/components/site-web/blocks/TimelineAdvancedBlockPreview";
import CtaPremiumBlockPreview from "@/components/site-web/blocks/CtaPremiumBlockPreview";
import LogoCloudBlockPreview from "@/components/site-web/blocks/LogoCloudBlockPreview";
import StatsAnimatedBlockPreview from "@/components/site-web/blocks/StatsAnimatedBlockPreview";
import MasonryGalleryBlockPreview from "@/components/site-web/blocks/MasonryGalleryBlockPreview";
import ComparisonTableBlockPreview from "@/components/site-web/blocks/ComparisonTableBlockPreview";
import ContactFormBlockPreview from "@/components/site-web/blocks/ContactFormBlockPreview";
import BlogPreviewBlockPreview from "@/components/site-web/blocks/BlogPreviewBlockPreview";
import VideoTextSplitBlockPreview from "@/components/site-web/blocks/VideoTextSplitBlockPreview";
import BeforeAfterBlockPreview from "@/components/site-web/blocks/BeforeAfterBlockPreview";
import ServiceCardsBlockPreview from "@/components/site-web/blocks/ServiceCardsBlockPreview";
import LeadMagnetBlockPreview from "@/components/site-web/blocks/LeadMagnetBlockPreview";
import AvailabilityBannerBlockPreview from "@/components/site-web/blocks/AvailabilityBannerBlockPreview";
import ProductHeroCheckoutBlockPreview from "@/components/site-web/blocks/ProductHeroCheckoutBlockPreview";
import ProductCardsGridBlockPreview from "@/components/site-web/blocks/ProductCardsGridBlockPreview";
import InlineCheckoutBlockPreview from "@/components/site-web/blocks/InlineCheckoutBlockPreview";
import BundleBuilderBlockPreview from "@/components/site-web/blocks/BundleBuilderBlockPreview";
import PricingTableRealBlockPreview from "@/components/site-web/blocks/PricingTableRealBlockPreview";

// ═══════════════════════════════════════════════
// Block Content Renderer (same content, different wrapper)
// ═══════════════════════════════════════════════

function renderBlockContent(block: Block) {
  switch (block.type) {
    case "hero": return <HeroBlockPreview content={block.content} />;
    case "portfolio-grid": return <PortfolioGridBlockPreview content={block.content} />;
    case "services-list": return <ServicesListBlockPreview content={block.content} />;
    case "pack-premium": return <PackPremiumBlockPreview content={block.content} />;
    case "testimonials": return <TestimonialsBlockPreview content={block.content} />;
    case "timeline-process": return <TimelineProcessBlockPreview content={block.content} />;
    case "faq-accordion": return <FaqAccordionBlockPreview content={block.content} />;
    case "video": return <VideoBlockPreview content={block.content} />;
    case "full-image": return <FullImageBlockPreview content={block.content} />;
    case "why-me": return <WhyMeBlockPreview content={block.content} />;
    case "centered-cta": return <CenteredCtaBlockPreview content={block.content} />;
    case "custom-form": return <CustomFormBlockPreview content={block.content} />;
    case "calendar-booking": return <CalendarBookingBlockPreview content={block.content} />;
    case "stats-counter": return <StatsCounterBlockPreview content={block.content} />;
    case "newsletter": return <NewsletterBlockPreview content={block.content} />;
    case "pricing-table": return <PricingTableBlockPreview content={block.content} />;
    case "feature-grid": return <FeatureGridBlockPreview content={block.content} />;
    case "testimonials-carousel": return <TestimonialsCarouselBlockPreview content={block.content} />;
    case "faq-advanced": return <FaqAdvancedBlockPreview content={block.content} />;
    case "timeline-advanced": return <TimelineAdvancedBlockPreview content={block.content} />;
    case "cta-premium": return <CtaPremiumBlockPreview content={block.content} />;
    case "logo-cloud": return <LogoCloudBlockPreview content={block.content} />;
    case "stats-animated": return <StatsAnimatedBlockPreview content={block.content} />;
    case "masonry-gallery": return <MasonryGalleryBlockPreview content={block.content} />;
    case "comparison-table": return <ComparisonTableBlockPreview content={block.content} />;
    case "contact-form": return <ContactFormBlockPreview content={block.content} />;
    case "blog-preview": return <BlogPreviewBlockPreview content={block.content} />;
    case "video-text-split": return <VideoTextSplitBlockPreview content={block.content} />;
    case "before-after": return <BeforeAfterBlockPreview content={block.content} />;
    case "service-cards": return <ServiceCardsBlockPreview content={block.content} />;
    case "lead-magnet": return <LeadMagnetBlockPreview content={block.content} />;
    case "availability-banner": return <AvailabilityBannerBlockPreview content={block.content} />;
    case "product-hero-checkout": return <ProductHeroCheckoutBlockPreview content={block.content} />;
    case "product-cards-grid": return <ProductCardsGridBlockPreview content={block.content} />;
    case "inline-checkout": return <InlineCheckoutBlockPreview content={block.content} />;
    case "bundle-builder": return <BundleBuilderBlockPreview content={block.content} />;
    case "pricing-table-real": return <PricingTableRealBlockPreview content={block.content} />;
  }
}

// Full-bleed blocks that should NOT get horizontal padding
const FULL_BLEED_BLOCKS = new Set([
  "full-image", "video", "hero", "availability-banner",
]);

// ═══════════════════════════════════════════════
// Public Block Section (no rounded-xl, no forced bg-white)
// ═══════════════════════════════════════════════

function PublicBlockSection({ block, site }: { block: Block; site: Site }) {
  const sectionStyle = computePublicSectionStyle(block.style, site.theme);
  const sectionClass = computeSectionClass(block.style);
  const buttonVars = computeButtonVars(block.style.buttonStyle);
  const hoverCSS = getButtonHoverCSS(block.id);

  const mergedStyle: React.CSSProperties = {
    ...sectionStyle,
    ...buttonVars,
  } as React.CSSProperties;

  const isFullBleed = FULL_BLEED_BLOCKS.has(block.type);

  return (
    <section
      id={block.settings?.anchorId || undefined}
      data-block={block.id}
      style={mergedStyle}
      className={`w-full ${sectionClass}`}
    >
      <style dangerouslySetInnerHTML={{ __html: hoverCSS }} />
      <AnimateOnScroll animation={block.settings?.animation}>
        <div className={isFullBleed ? "" : "px-6"}>
          {renderBlockContent(block)}
        </div>
      </AnimateOnScroll>
    </section>
  );
}

// ═══════════════════════════════════════════════
// Site Navigation (with mobile hamburger)
// ═══════════════════════════════════════════════

function SitePublicNav({ site, currentSlug }: { site: Site; currentSlug: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const nav = site.nav;
  if (!nav) return null;

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#EFEFEF]">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo / Site name */}
        <a href="/" className="text-base font-bold text-[#191919] tracking-tight">
          {site.settings.name}
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {nav.links.map((link, i) => {
            const href = link.pageId ? resolvePageSlug(site, link.pageId) : "#";
            const isActive = href === currentSlug;
            return (
              <a
                key={i}
                href={href}
                className={`text-[13px] font-medium transition-colors ${
                  isActive ? "text-[#191919]" : "text-[#5A5A58] hover:text-[#191919]"
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </div>

        {/* Desktop CTA + Mobile hamburger */}
        <div className="flex items-center gap-3">
          {nav.showCta && nav.ctaLabel && (
            <a
              href={nav.ctaLink?.value ? resolvePageSlug(site, nav.ctaLink.value) : "#"}
              className="hidden md:inline-flex text-[13px] font-semibold px-4 py-2 rounded-md text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: site.theme.primaryColor }}
            >
              {nav.ctaLabel}
            </a>
          )}

          {/* Hamburger button (mobile) */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-[#5A5A58] hover:text-[#191919] transition-colors"
            aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {mobileOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#EFEFEF] bg-white">
          <div className="px-6 py-4 space-y-3">
            {nav.links.map((link, i) => {
              const href = link.pageId ? resolvePageSlug(site, link.pageId) : "#";
              return (
                <a
                  key={i}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="block text-sm font-medium text-[#5A5A58] hover:text-[#191919] transition-colors py-1"
                >
                  {link.label}
                </a>
              );
            })}
            {nav.showCta && nav.ctaLabel && (
              <a
                href={nav.ctaLink?.value ? resolvePageSlug(site, nav.ctaLink.value) : "#"}
                className="block text-center text-sm font-semibold px-4 py-2.5 rounded-md text-white transition-colors mt-2"
                style={{ backgroundColor: site.theme.primaryColor }}
              >
                {nav.ctaLabel}
              </a>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

// ═══════════════════════════════════════════════
// Site Footer
// ═══════════════════════════════════════════════

function SitePublicFooter({ site }: { site: Site }) {
  const footer = site.footer;
  if (!footer) return null;

  return (
    <footer className="bg-[#F7F7F5] border-t border-[#E6E6E4] py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-6">
            {footer.links.map((link, i) => {
              const href = link.pageId ? resolvePageSlug(site, link.pageId) : "#";
              return (
                <a
                  key={i}
                  href={href}
                  className="text-[13px] text-[#5A5A58] hover:text-[#191919] transition-colors"
                >
                  {link.label}
                </a>
              );
            })}
          </div>

          {/* Socials */}
          {footer.showSocials && site.settings.socials && (
            <div className="flex items-center gap-4">
              {site.settings.socials.instagram && (
                <a href={site.settings.socials.instagram} target="_blank" rel="noopener noreferrer" className="text-[#8A8A88] hover:text-[#191919] transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <circle cx="12" cy="12" r="5" />
                    <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
                  </svg>
                </a>
              )}
              {site.settings.socials.twitter && (
                <a href={site.settings.socials.twitter} target="_blank" rel="noopener noreferrer" className="text-[#8A8A88] hover:text-[#191919] transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                  </svg>
                </a>
              )}
              {site.settings.socials.linkedin && (
                <a href={site.settings.socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-[#8A8A88] hover:text-[#191919] transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </a>
              )}
            </div>
          )}
        </div>

        {footer.copyright && (
          <div className="mt-8 pt-6 border-t border-[#E6E6E4]">
            <p className="text-xs text-[#8A8A88] text-center">{footer.copyright}</p>
          </div>
        )}
      </div>
    </footer>
  );
}

// ═══════════════════════════════════════════════
// Main Public Site Renderer
// ═══════════════════════════════════════════════

interface SitePublicRendererProps {
  site: Site;
  page: SitePage;
  products?: Product[];
}

export default function SitePublicRenderer({ site, page, products = [] }: SitePublicRendererProps) {
  const visibleBlocks = page.blocks.filter((b) => b.visible);
  const themeVars = computeThemeVars(site.theme);

  return (
    <ProductProvider products={products}>
      <div
        className="min-h-screen flex flex-col bg-white"
        style={{ fontFamily: site.theme.fontFamily, ...themeVars } as React.CSSProperties}
      >
        <SiteAnalyticsTracker siteId={site.id} pageSlug={page.slug} />
        <SitePublicNav site={site} currentSlug={page.slug} />

        <main className="flex-1">
          {visibleBlocks.map((block) => (
            <PublicBlockSection key={block.id} block={block} site={site} />
          ))}
        </main>

        <SitePublicFooter site={site} />
      </div>
    </ProductProvider>
  );
}
