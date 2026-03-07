"use client";

import { useState, useEffect } from "react";
import type { Site, SitePage, Block, Product } from "@/types";
import { resolvePageSlug } from "@/lib/site-utils";
import {
  computePublicSectionStyle,
  computePublicContainerClass,
  computeButtonVars,
  getButtonHoverCSS,
  computeThemeVars,
  resolveTheme,
} from "@/lib/block-style-engine";
import { getNavClass } from "@/lib/site-designs";
import NavbarRenderer from "@/components/site-web/navbar/NavbarRenderer";
import type { NavLink } from "@/types";
import { resolveBackgroundConfig, renderBackgroundConfig } from "@/lib/block-style-engine";
import { ProductProvider } from "@/lib/product-context";
import { LinkProvider } from "@/lib/link-context";
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
import HeroSplitGlowBlockPreview from "@/components/site-web/blocks/HeroSplitGlowBlockPreview";
import HeroCenteredMeshBlockPreview from "@/components/site-web/blocks/HeroCenteredMeshBlockPreview";
import ServicesPremiumBlockPreview from "@/components/site-web/blocks/ServicesPremiumBlockPreview";
import PortfolioMasonryBlockPreview from "@/components/site-web/blocks/PortfolioMasonryBlockPreview";
import PricingModernBlockPreview from "@/components/site-web/blocks/PricingModernBlockPreview";
import TestimonialsDarkBlockPreview from "@/components/site-web/blocks/TestimonialsDarkBlockPreview";
import CtaBannerBlockPreview from "@/components/site-web/blocks/CtaBannerBlockPreview";
import ContactPremiumBlockPreview from "@/components/site-web/blocks/ContactPremiumBlockPreview";
import FooterBlockBlockPreview from "@/components/site-web/blocks/FooterBlockBlockPreview";
import VideoShowcaseBlockPreview from "@/components/site-web/blocks/VideoShowcaseBlockPreview";
import TechStackBlockPreview from "@/components/site-web/blocks/TechStackBlockPreview";
import BeforeAfterProBlockPreview from "@/components/site-web/blocks/BeforeAfterProBlockPreview";
// ─── 50 new blocks ───
import HeroSplitPortfolioBlockPreview from "@/components/site-web/blocks/HeroSplitPortfolioBlockPreview";
import HeroMinimalServiceBlockPreview from "@/components/site-web/blocks/HeroMinimalServiceBlockPreview";
import HeroDarkSaasBlockPreview from "@/components/site-web/blocks/HeroDarkSaasBlockPreview";
import HeroCreatorBrandBlockPreview from "@/components/site-web/blocks/HeroCreatorBrandBlockPreview";
import HeroVideoShowreelBlockPreview from "@/components/site-web/blocks/HeroVideoShowreelBlockPreview";
import ProjectsGridCasesBlockPreview from "@/components/site-web/blocks/ProjectsGridCasesBlockPreview";
import ProjectsHorizontalBlockPreview from "@/components/site-web/blocks/ProjectsHorizontalBlockPreview";
import ProjectBeforeAfterBlockPreview from "@/components/site-web/blocks/ProjectBeforeAfterBlockPreview";
import ProjectTimelineBlockPreview from "@/components/site-web/blocks/ProjectTimelineBlockPreview";
import ProjectMasonryWallBlockPreview from "@/components/site-web/blocks/ProjectMasonryWallBlockPreview";
import Services3CardPremiumBlockPreview from "@/components/site-web/blocks/Services3CardPremiumBlockPreview";
import ServicesIconGridBlockPreview from "@/components/site-web/blocks/ServicesIconGridBlockPreview";
import ServicesSplitValueBlockPreview from "@/components/site-web/blocks/ServicesSplitValueBlockPreview";
import ServicesProcessOffersBlockPreview from "@/components/site-web/blocks/ServicesProcessOffersBlockPreview";
import ProductFeaturedCardBlockPreview from "@/components/site-web/blocks/ProductFeaturedCardBlockPreview";
import Products3CardShopBlockPreview from "@/components/site-web/blocks/Products3CardShopBlockPreview";
import ProductBundleCompareBlockPreview from "@/components/site-web/blocks/ProductBundleCompareBlockPreview";
import ProductBenefitsMockupBlockPreview from "@/components/site-web/blocks/ProductBenefitsMockupBlockPreview";
import Pricing3TierSaasBlockPreview from "@/components/site-web/blocks/Pricing3TierSaasBlockPreview";
import PricingCustomQuoteBlockPreview from "@/components/site-web/blocks/PricingCustomQuoteBlockPreview";
import PricingMiniFaqBlockPreview from "@/components/site-web/blocks/PricingMiniFaqBlockPreview";
import Testimonials3DarkBlockPreview from "@/components/site-web/blocks/Testimonials3DarkBlockPreview";
import TestimonialsVideoBlockPreview from "@/components/site-web/blocks/TestimonialsVideoBlockPreview";
import ResultsLogosQuotesBlockPreview from "@/components/site-web/blocks/ResultsLogosQuotesBlockPreview";
import NumbersImpactBlockPreview from "@/components/site-web/blocks/NumbersImpactBlockPreview";
import ResultsTimelineBlockPreview from "@/components/site-web/blocks/ResultsTimelineBlockPreview";
import AboutPersonalStoryBlockPreview from "@/components/site-web/blocks/AboutPersonalStoryBlockPreview";
import AboutStudioValuesBlockPreview from "@/components/site-web/blocks/AboutStudioValuesBlockPreview";
import TeamMiniGridBlockPreview from "@/components/site-web/blocks/TeamMiniGridBlockPreview";
import Process4StepsBlockPreview from "@/components/site-web/blocks/Process4StepsBlockPreview";
import ProcessDetailedTimelineBlockPreview from "@/components/site-web/blocks/ProcessDetailedTimelineBlockPreview";
import FaqAccordionFullBlockPreview from "@/components/site-web/blocks/FaqAccordionFullBlockPreview";
import Faq2ColumnBlockPreview from "@/components/site-web/blocks/Faq2ColumnBlockPreview";
import CtaCenteredStrongBlockPreview from "@/components/site-web/blocks/CtaCenteredStrongBlockPreview";
import CtaSplitTextBlockPreview from "@/components/site-web/blocks/CtaSplitTextBlockPreview";
import CtaDarkGlowBlockPreview from "@/components/site-web/blocks/CtaDarkGlowBlockPreview";
import FormContactSimpleBlockPreview from "@/components/site-web/blocks/FormContactSimpleBlockPreview";
import FormQuoteRequestBlockPreview from "@/components/site-web/blocks/FormQuoteRequestBlockPreview";
import FormNewsletterLeadBlockPreview from "@/components/site-web/blocks/FormNewsletterLeadBlockPreview";
import MediaFeaturedVideoBlockPreview from "@/components/site-web/blocks/MediaFeaturedVideoBlockPreview";
import Gallery3UpStripBlockPreview from "@/components/site-web/blocks/Gallery3UpStripBlockPreview";
import GalleryStackedStoryboardBlockPreview from "@/components/site-web/blocks/GalleryStackedStoryboardBlockPreview";
import ContentFeatureArticleBlockPreview from "@/components/site-web/blocks/ContentFeatureArticleBlockPreview";
import Content3ArticlesBlockPreview from "@/components/site-web/blocks/Content3ArticlesBlockPreview";
import ContentComparisonWhyBlockPreview from "@/components/site-web/blocks/ContentComparisonWhyBlockPreview";
import TrustBadgesBlockPreview from "@/components/site-web/blocks/TrustBadgesBlockPreview";
import SocialProofMarqueeBlockPreview from "@/components/site-web/blocks/SocialProofMarqueeBlockPreview";
import FooterSimplePremiumBlockPreview from "@/components/site-web/blocks/FooterSimplePremiumBlockPreview";
import FooterMultiColumnBlockPreview from "@/components/site-web/blocks/FooterMultiColumnBlockPreview";
import SignatureCreativeClosingBlockPreview from "@/components/site-web/blocks/SignatureCreativeClosingBlockPreview";

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
    case "hero-split-glow": return <HeroSplitGlowBlockPreview content={block.content} />;
    case "hero-centered-mesh": return <HeroCenteredMeshBlockPreview content={block.content} />;
    case "services-premium": return <ServicesPremiumBlockPreview content={block.content} />;
    case "portfolio-masonry": return <PortfolioMasonryBlockPreview content={block.content} />;
    case "pricing-modern": return <PricingModernBlockPreview content={block.content} />;
    case "testimonials-dark": return <TestimonialsDarkBlockPreview content={block.content} />;
    case "cta-banner": return <CtaBannerBlockPreview content={block.content} />;
    case "contact-premium": return <ContactPremiumBlockPreview content={block.content} />;
    case "footer-block": return <FooterBlockBlockPreview content={block.content} />;
    case "video-showcase": return <VideoShowcaseBlockPreview content={block.content} />;
    case "tech-stack": return <TechStackBlockPreview content={block.content} />;
    case "before-after-pro": return <BeforeAfterProBlockPreview content={block.content} />;
    // ─── 50 new blocks ───
    case "hero-split-portfolio": return <HeroSplitPortfolioBlockPreview content={block.content} />;
    case "hero-minimal-service": return <HeroMinimalServiceBlockPreview content={block.content} />;
    case "hero-dark-saas": return <HeroDarkSaasBlockPreview content={block.content} />;
    case "hero-creator-brand": return <HeroCreatorBrandBlockPreview content={block.content} />;
    case "hero-video-showreel": return <HeroVideoShowreelBlockPreview content={block.content} />;
    case "projects-grid-cases": return <ProjectsGridCasesBlockPreview content={block.content} />;
    case "projects-horizontal": return <ProjectsHorizontalBlockPreview content={block.content} />;
    case "project-before-after": return <ProjectBeforeAfterBlockPreview content={block.content} />;
    case "project-timeline": return <ProjectTimelineBlockPreview content={block.content} />;
    case "project-masonry-wall": return <ProjectMasonryWallBlockPreview content={block.content} />;
    case "services-3card-premium": return <Services3CardPremiumBlockPreview content={block.content} />;
    case "services-icon-grid": return <ServicesIconGridBlockPreview content={block.content} />;
    case "services-split-value": return <ServicesSplitValueBlockPreview content={block.content} />;
    case "services-process-offers": return <ServicesProcessOffersBlockPreview content={block.content} />;
    case "product-featured-card": return <ProductFeaturedCardBlockPreview content={block.content} />;
    case "products-3card-shop": return <Products3CardShopBlockPreview content={block.content} />;
    case "product-bundle-compare": return <ProductBundleCompareBlockPreview content={block.content} />;
    case "product-benefits-mockup": return <ProductBenefitsMockupBlockPreview content={block.content} />;
    case "pricing-3tier-saas": return <Pricing3TierSaasBlockPreview content={block.content} />;
    case "pricing-custom-quote": return <PricingCustomQuoteBlockPreview content={block.content} />;
    case "pricing-mini-faq": return <PricingMiniFaqBlockPreview content={block.content} />;
    case "testimonials-3dark": return <Testimonials3DarkBlockPreview content={block.content} />;
    case "testimonials-video": return <TestimonialsVideoBlockPreview content={block.content} />;
    case "results-logos-quotes": return <ResultsLogosQuotesBlockPreview content={block.content} />;
    case "numbers-impact": return <NumbersImpactBlockPreview content={block.content} />;
    case "results-timeline": return <ResultsTimelineBlockPreview content={block.content} />;
    case "about-personal-story": return <AboutPersonalStoryBlockPreview content={block.content} />;
    case "about-studio-values": return <AboutStudioValuesBlockPreview content={block.content} />;
    case "team-mini-grid": return <TeamMiniGridBlockPreview content={block.content} />;
    case "process-4steps": return <Process4StepsBlockPreview content={block.content} />;
    case "process-detailed-timeline": return <ProcessDetailedTimelineBlockPreview content={block.content} />;
    case "faq-accordion-full": return <FaqAccordionFullBlockPreview content={block.content} />;
    case "faq-2column": return <Faq2ColumnBlockPreview content={block.content} />;
    case "cta-centered-strong": return <CtaCenteredStrongBlockPreview content={block.content} />;
    case "cta-split-text": return <CtaSplitTextBlockPreview content={block.content} />;
    case "cta-dark-glow": return <CtaDarkGlowBlockPreview content={block.content} />;
    case "form-contact-simple": return <FormContactSimpleBlockPreview content={block.content} />;
    case "form-quote-request": return <FormQuoteRequestBlockPreview content={block.content} />;
    case "form-newsletter-lead": return <FormNewsletterLeadBlockPreview content={block.content} />;
    case "media-featured-video": return <MediaFeaturedVideoBlockPreview content={block.content} />;
    case "gallery-3up-strip": return <Gallery3UpStripBlockPreview content={block.content} />;
    case "gallery-stacked-storyboard": return <GalleryStackedStoryboardBlockPreview content={block.content} />;
    case "content-feature-article": return <ContentFeatureArticleBlockPreview content={block.content} />;
    case "content-3articles": return <Content3ArticlesBlockPreview content={block.content} />;
    case "content-comparison-why": return <ContentComparisonWhyBlockPreview content={block.content} />;
    case "trust-badges": return <TrustBadgesBlockPreview content={block.content} />;
    case "social-proof-marquee": return <SocialProofMarqueeBlockPreview content={block.content} />;
    case "footer-simple-premium": return <FooterSimplePremiumBlockPreview content={block.content} />;
    case "footer-multi-column": return <FooterMultiColumnBlockPreview content={block.content} />;
    case "signature-creative-closing": return <SignatureCreativeClosingBlockPreview content={block.content} />;
    default: return null;
  }
}

// Full-bleed blocks that should NOT get horizontal padding
const FULL_BLEED_BLOCKS = new Set([
  "full-image", "video", "hero", "availability-banner",
  "hero-split-glow", "hero-centered-mesh", "cta-banner", "footer-block",
  "services-premium", "service-cards", "services-list",
  "portfolio-masonry", "pricing-modern",
  "testimonials-dark", "contact-premium", "video-showcase",
  "tech-stack", "before-after-pro", "cta-premium",
  // new full-bleed blocks
  "hero-split-portfolio", "hero-minimal-service", "hero-dark-saas",
  "hero-creator-brand", "hero-video-showreel",
  "services-3card-premium", "services-icon-grid", "services-split-value", "services-process-offers",
  "cta-centered-strong", "cta-split-text", "cta-dark-glow",
  "footer-simple-premium", "footer-multi-column", "signature-creative-closing",
  "social-proof-marquee", "numbers-impact", "results-timeline",
  "testimonials-3dark", "testimonials-video", "results-logos-quotes",
]);

// ═══════════════════════════════════════════════
// Public Block Section (no rounded-xl, no forced bg-white)
// ═══════════════════════════════════════════════

function PublicBlockSection({ block, site }: { block: Block; site: Site }) {
  const sectionStyle = computePublicSectionStyle(block.style, site.theme);
  const containerClass = computePublicContainerClass(block.style);
  const buttonVars = computeButtonVars(block.style.buttonStyle);
  const hoverCSS = getButtonHoverCSS(block.id);

  // Per-block background override
  const blockBg = block.style.background ? renderBackgroundConfig(block.style.background) : {};

  const mergedStyle: React.CSSProperties = {
    ...sectionStyle,
    ...buttonVars,
    ...blockBg.containerStyle,
  } as React.CSSProperties;

  const isFullBleed = FULL_BLEED_BLOCKS.has(block.type);

  return (
    <section
      id={block.settings?.anchorId || undefined}
      data-block={block.id}
      style={mergedStyle}
      className="w-full relative overflow-hidden"
    >
      <style dangerouslySetInnerHTML={{ __html: hoverCSS }} />
      {blockBg.overlayStyle && <div className="absolute inset-0 pointer-events-none z-0" style={blockBg.overlayStyle} />}
      <AnimateOnScroll animation={block.settings?.animation}>
        <div className={`relative z-[1] ${isFullBleed ? "" : `${containerClass} px-6`}`}>
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
  const navStyle = site.design?.navStyle;
  const navClass = navStyle ? getNavClass(navStyle) : "";

  return (
    <nav className={`sticky top-0 z-50 border-b ${
      navClass || "backdrop-blur-sm"
    }`} style={{ backgroundColor: navClass ? undefined : "color-mix(in srgb, var(--site-bg, #fff) 95%, transparent)", borderColor: "var(--site-border)" }}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo / Site name */}
        <a href="/" className="text-base font-bold tracking-tight" style={{ color: "var(--site-text)" }}>
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
                className="text-[13px] font-medium transition-colors"
                style={{ color: isActive ? "var(--site-text)" : "var(--site-muted)" }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = "var(--site-text)"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = "var(--site-muted)"; }}
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
              className="hidden md:inline-flex text-[13px] font-semibold px-4 py-2 transition-colors hover:opacity-90"
              style={{ backgroundColor: "var(--btn-bg, var(--site-primary))", color: "var(--btn-text, #fff)", borderRadius: "var(--site-btn-radius, 6px)" }}
            >
              {nav.ctaLabel}
            </a>
          )}

          {/* Hamburger button (mobile) */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 transition-colors"
            style={{ color: "var(--site-muted)" }}
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
        <div className="md:hidden border-t" style={{ borderColor: "var(--site-border)", backgroundColor: "var(--site-bg, #fff)" }}>
          <div className="px-6 py-4 space-y-3">
            {nav.links.map((link, i) => {
              const href = link.pageId ? resolvePageSlug(site, link.pageId) : "#";
              return (
                <a
                  key={i}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="block text-sm font-medium transition-colors py-1"
                  style={{ color: "var(--site-muted)" }}
                >
                  {link.label}
                </a>
              );
            })}
            {nav.showCta && nav.ctaLabel && (
              <a
                href={nav.ctaLink?.value ? resolvePageSlug(site, nav.ctaLink.value) : "#"}
                className="block text-center text-sm font-semibold px-4 py-2.5 transition-colors mt-2"
                style={{ backgroundColor: "var(--btn-bg, var(--site-primary))", color: "var(--btn-text, #fff)", borderRadius: "var(--site-btn-radius, 6px)" }}
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
    <footer className="py-12 px-6 border-t" style={{ backgroundColor: "var(--site-surface, var(--site-bg, #F7F7F5))", borderColor: "var(--site-border, #E6E6E4)" }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-6">
            {footer.links.map((link, i) => {
              const href = link.pageId ? resolvePageSlug(site, link.pageId) : "#";
              return (
                <a
                  key={i}
                  href={href}
                  className="text-[13px] transition-colors"
                  style={{ color: "var(--site-muted)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--site-text)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--site-muted)")}
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
                <a href={site.settings.socials.instagram} target="_blank" rel="noopener noreferrer" className="transition-colors" style={{ color: "var(--site-muted)" }} onMouseEnter={e => (e.currentTarget.style.color = "var(--site-text)")} onMouseLeave={e => (e.currentTarget.style.color = "var(--site-muted)")}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <circle cx="12" cy="12" r="5" />
                    <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
                  </svg>
                </a>
              )}
              {site.settings.socials.twitter && (
                <a href={site.settings.socials.twitter} target="_blank" rel="noopener noreferrer" className="transition-colors" style={{ color: "var(--site-muted)" }} onMouseEnter={e => (e.currentTarget.style.color = "var(--site-text)")} onMouseLeave={e => (e.currentTarget.style.color = "var(--site-muted)")}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                  </svg>
                </a>
              )}
              {site.settings.socials.linkedin && (
                <a href={site.settings.socials.linkedin} target="_blank" rel="noopener noreferrer" className="transition-colors" style={{ color: "var(--site-muted)" }} onMouseEnter={e => (e.currentTarget.style.color = "var(--site-text)")} onMouseLeave={e => (e.currentTarget.style.color = "var(--site-muted)")}>
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
          <div className="mt-8 pt-6 border-t" style={{ borderColor: "var(--site-border, #E6E6E4)" }}>
            <p className="text-xs text-center" style={{ color: "var(--site-muted)" }}>{footer.copyright}</p>
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

  // Resolve theme: fill in missing properties from design preset
  const resolvedTheme = resolveTheme(site.theme, site.design);
  const themeVars = computeThemeVars(resolvedTheme);
  const isDark = resolvedTheme.mode === "dark";

  useEffect(() => {
    document.documentElement.classList.add("smooth-scroll");
    return () => document.documentElement.classList.remove("smooth-scroll");
  }, []);

  // Background config
  const siteBgConfig = resolveBackgroundConfig(site.design);
  const { containerStyle: siteBgContainerStyle, overlayStyle: siteBgOverlayStyle } = renderBackgroundConfig(siteBgConfig);

  // Use resolved theme for site-wide styling
  const resolvedSite = { ...site, theme: resolvedTheme };

  return (
    <ProductProvider products={products} siteId={site.id}>
      <LinkProvider site={site} products={products}>
        <div
          className="min-h-screen flex flex-col relative"
          style={{
            fontFamily: resolvedTheme.fontFamily,
            backgroundColor: resolvedTheme.backgroundColor || (isDark ? "#0A0A0F" : "#ffffff"),
            color: resolvedTheme.textColor || (isDark ? "#FAFAFA" : "#191919"),
            ...themeVars,
            ...siteBgContainerStyle,
          } as React.CSSProperties}
        >
          {siteBgOverlayStyle && <div className="fixed inset-0 pointer-events-none z-0" style={siteBgOverlayStyle} />}
          <SiteAnalyticsTracker siteId={site.id} pageSlug={page.slug} />
          {/* Navbar — new variant system or legacy fallback */}
          {resolvedSite.nav && (
            resolvedSite.nav.variant
              ? <NavbarRenderer
                  nav={resolvedSite.nav}
                  siteName={resolvedSite.settings.name}
                  logoUrl={resolvedSite.settings.logoUrl}
                  currentSlug={page.slug}
                  resolveHref={(link: NavLink) => link.pageId ? resolvePageSlug(resolvedSite, link.pageId) : (link.url || "#")}
                />
              : <SitePublicNav site={resolvedSite} currentSlug={page.slug} />
          )}

          <main className="flex-1 relative z-[1]">
            {visibleBlocks.map((block) => (
              <PublicBlockSection key={block.id} block={block} site={resolvedSite} />
            ))}
          </main>

          <SitePublicFooter site={resolvedSite} />
        </div>
      </LinkProvider>
    </ProductProvider>
  );
}
