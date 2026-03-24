"use client";

import { useState, useEffect, useCallback, useRef, lazy, Suspense } from "react";
import type { Site, SitePage, Block, Product } from "@/types";

const ParticleBackground = lazy(() => import("@/components/site-web/blocks/ParticleBackground"));
import { resolvePageSlug, resolveNavLinkHref } from "@/lib/site-utils";
import {
  computePublicSectionStyle,
  computePublicContainerClass,
  computeButtonVars,
  getButtonHoverCSS,
  getHoverEffectCSS,
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
import AttributionTracker from "@/components/site-public/AttributionTracker";

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

function renderBlockContent(block: Block, ctx?: { siteId: string; pagePath: string; siteSlug?: string; basePath?: string }) {
  const lp = ctx ? { siteId: ctx.siteId, pagePath: ctx.pagePath, blockType: block.type } : undefined;
  switch (block.type) {
    case "hero": return <HeroBlockPreview content={block.content} />;
    case "portfolio-grid": return <PortfolioGridBlockPreview content={block.content} siteSlug={ctx?.siteSlug} />;
    case "services-list": return <ServicesListBlockPreview content={block.content} />;
    case "pack-premium": return <PackPremiumBlockPreview content={block.content} />;
    case "testimonials": return <TestimonialsBlockPreview content={block.content} />;
    case "timeline-process": return <TimelineProcessBlockPreview content={block.content} />;
    case "faq-accordion": return <FaqAccordionBlockPreview content={block.content} />;
    case "video": return <VideoBlockPreview content={block.content} />;
    case "full-image": return <FullImageBlockPreview content={block.content} />;
    case "why-me": return <WhyMeBlockPreview content={block.content} />;
    case "centered-cta": return <CenteredCtaBlockPreview content={block.content} />;
    case "custom-form": return <CustomFormBlockPreview content={block.content} leadCtx={lp} />;
    case "calendar-booking": return <CalendarBookingBlockPreview content={block.content} />;
    case "stats-counter": return <StatsCounterBlockPreview content={block.content} />;
    case "newsletter": return <NewsletterBlockPreview content={block.content} leadCtx={lp} />;
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
    case "contact-form": return <ContactFormBlockPreview content={block.content} leadCtx={lp} />;
    case "blog-preview": return <BlogPreviewBlockPreview content={block.content} />;
    case "video-text-split": return <VideoTextSplitBlockPreview content={block.content} />;
    case "before-after": return <BeforeAfterBlockPreview content={block.content} />;
    case "service-cards": return <ServiceCardsBlockPreview content={block.content} />;
    case "lead-magnet": return <LeadMagnetBlockPreview content={block.content} leadCtx={lp} />;
    case "availability-banner": return <AvailabilityBannerBlockPreview content={block.content} />;
    case "product-hero-checkout": return <ProductHeroCheckoutBlockPreview content={block.content} />;
    case "product-cards-grid": return <ProductCardsGridBlockPreview content={block.content} />;
    case "inline-checkout": return <InlineCheckoutBlockPreview content={block.content} />;
    case "bundle-builder": return <BundleBuilderBlockPreview content={block.content} />;
    case "pricing-table-real": return <PricingTableRealBlockPreview content={block.content} />;
    case "hero-split-glow": return <HeroSplitGlowBlockPreview content={block.content} />;
    case "hero-centered-mesh": return <HeroCenteredMeshBlockPreview content={block.content} />;
    case "services-premium": return <ServicesPremiumBlockPreview content={block.content} />;
    case "portfolio-masonry": return <PortfolioMasonryBlockPreview content={block.content} siteSlug={ctx?.siteSlug} />;
    case "pricing-modern": return <PricingModernBlockPreview content={block.content} />;
    case "testimonials-dark": return <TestimonialsDarkBlockPreview content={block.content} />;
    case "cta-banner": return <CtaBannerBlockPreview content={block.content} />;
    case "contact-premium": return <ContactPremiumBlockPreview content={block.content} leadCtx={lp} />;
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
    case "projects-grid-cases": return <ProjectsGridCasesBlockPreview content={block.content} siteSlug={ctx?.siteSlug} basePath={ctx?.basePath} />;
    case "projects-horizontal": return <ProjectsHorizontalBlockPreview content={block.content} siteSlug={ctx?.siteSlug} />;
    case "project-before-after": return <ProjectBeforeAfterBlockPreview content={block.content} />;
    case "project-timeline": return <ProjectTimelineBlockPreview content={block.content} />;
    case "project-masonry-wall": return <ProjectMasonryWallBlockPreview content={block.content} siteSlug={ctx?.siteSlug} basePath={ctx?.basePath} />;
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
    case "form-contact-simple": return <FormContactSimpleBlockPreview content={block.content} leadCtx={lp} />;
    case "form-quote-request": return <FormQuoteRequestBlockPreview content={block.content} leadCtx={lp} />;
    case "form-newsletter-lead": return <FormNewsletterLeadBlockPreview content={block.content} leadCtx={lp} />;
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

function PublicBlockSection({ block, site, pagePath }: { block: Block; site: Site; pagePath: string }) {
  const sectionStyle = computePublicSectionStyle(block.style, site.theme);
  const containerClass = computePublicContainerClass(block.style);
  const buttonVars = computeButtonVars(block.style.buttonStyle);
  const hoverCSS = getButtonHoverCSS(block.id);
  const cardHoverCSS = getHoverEffectCSS(block.id, block.style.hoverEffect);

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
      id={block.settings?.anchorId || `block-${block.id}`}
      data-block={block.id}
      style={mergedStyle}
      className="w-full max-w-full relative overflow-hidden break-words"
    >
      <style dangerouslySetInnerHTML={{ __html: hoverCSS + cardHoverCSS }} />
      {blockBg.overlayStyle && <div className="absolute inset-0 pointer-events-none z-0" style={blockBg.overlayStyle} />}
      {blockBg.html && block.style.background && (
        <Suspense fallback={null}>
          <ParticleBackground config={block.style.background} />
        </Suspense>
      )}
      <AnimateOnScroll
        animation={block.settings?.animation}
        duration={block.settings?.animationDuration}
        delay={block.settings?.animationDelay}
      >
        <div className={`relative z-[1] ${isFullBleed ? "" : `${containerClass} px-6`}`}>
          {renderBlockContent(block, { siteId: site.id, pagePath, siteSlug: site.domain?.subdomain, basePath: site.basePath })}
        </div>
      </AnimateOnScroll>
    </section>
  );
}

// ═══════════════════════════════════════════════
// Site Navigation (with mobile hamburger)
// ═══════════════════════════════════════════════

function usePublicNavScroll(behavior: string, threshold: number) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const rafId = useRef(0);

  useEffect(() => {
    setScrolled(false);
    setHidden(false);
    if (behavior === "static") return;

    const handleScroll = () => {
      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > threshold);

        if (behavior === "auto-hide") {
          setHidden(y > lastScrollY.current && y > threshold);
        }

        lastScrollY.current = y;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId.current);
    };
  }, [behavior, threshold]);

  return { scrolled, hidden };
}

function SitePublicNav({ site, currentSlug, pageBlocks }: { site: Site; currentSlug: string; pageBlocks?: Block[] }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const nav = site.nav;
  if (!nav) return null;
  const navStyle = site.design?.navStyle;
  const navClass = navStyle ? getNavClass(navStyle) : "";

  // Scroll behavior — backwards compatible
  const behavior = nav.scrollBehavior || (nav.sticky === true || (nav.sticky as unknown) === "true" ? "sticky" : "static");
  const threshold = nav.scrollThreshold ?? 50;
  const animDuration = nav.scrollAnimDuration ?? 300;
  const { scrolled, hidden } = usePublicNavScroll(behavior, threshold);

  // Position classes
  let positionClass = "relative";
  if (behavior === "sticky") positionClass = "sticky top-0";
  else if (behavior === "fixed" || behavior === "auto-hide" || behavior === "transparent-to-solid") positionClass = "fixed top-0 left-0 right-0";

  // Background — respect bgMode like NavWrapper
  const bgStyle: React.CSSProperties = {};
  if (behavior === "transparent-to-solid" && !scrolled) {
    bgStyle.backgroundColor = "transparent";
  } else if (nav.navBgColor) {
    bgStyle.backgroundColor = nav.navBgColor;
  } else if (navClass) {
    // navClass handles bg
  } else if (nav.bgMode === "transparent") {
    bgStyle.backgroundColor = "transparent";
  } else if (nav.bgMode === "blur") {
    bgStyle.backgroundColor = "color-mix(in srgb, var(--site-bg, #fff) 85%, transparent)";
    bgStyle.backdropFilter = "blur(12px)";
    bgStyle.WebkitBackdropFilter = "blur(12px)";
  } else {
    bgStyle.backgroundColor = "var(--site-bg, #fff)";
  }

  // Blur on scroll (additive, only if not already set by bgMode)
  if (nav.scrollAddBlur && scrolled && !bgStyle.backdropFilter) {
    bgStyle.backdropFilter = "blur(12px)";
    bgStyle.WebkitBackdropFilter = "blur(12px)";
  }

  // Shadow on scroll
  const shadowOnScroll = nav.scrollAddShadow && scrolled
    ? "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)"
    : undefined;

  // Transform (auto-hide)
  const transform = behavior === "auto-hide" && hidden ? "translateY(-100%)" : "translateY(0)";

  // Height — respect density like NavWrapper
  const baseH = nav.density === "compact" ? 56 : nav.density === "spacious" ? 80 : 64;
  const shrunkH = Math.round(baseH * 0.82);
  const currentH = nav.scrollShrink && scrolled ? shrunkH : baseH;

  // Transition
  const transitionParts: string[] = [];
  if (behavior === "auto-hide") transitionParts.push(`transform ${animDuration}ms ease-in-out`);
  if (behavior === "transparent-to-solid" || nav.scrollChangeBg) transitionParts.push(`background-color ${animDuration}ms ease`);
  if (nav.scrollShrink) transitionParts.push(`height ${animDuration}ms ease`);
  if (nav.scrollAddShadow) transitionParts.push(`box-shadow ${animDuration}ms ease`);
  if (nav.scrollAddBlur) transitionParts.push(`backdrop-filter ${animDuration}ms ease`);
  const transition = transitionParts.length > 0 ? transitionParts.join(", ") : undefined;

  const needsSpacer = behavior === "fixed" || behavior === "auto-hide" || behavior === "transparent-to-solid";

  return (
    <>
      {needsSpacer && <div style={{ height: `${baseH}px` }} aria-hidden="true" />}
      <nav
        className={`${positionClass} z-50 ${nav.showBorder !== false ? "border-b" : ""} ${navClass || ""}`}
        style={{
          ...bgStyle,
          borderColor: nav.showBorder !== false ? (nav.navBorderColor || "var(--site-border)") : undefined,
          height: `${currentH}px`,
          transform,
          transition,
          boxShadow: shadowOnScroll,
        }}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between" style={{ height: "100%" }}>
          {/* Logo / Site name */}
          <a href="/" className="text-base font-bold tracking-tight" style={{ color: "var(--site-text)" }}>
            {site.settings.name}
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            {nav.links.map((link, i) => {
              const href = resolveNavLinkHref(link, site, pageBlocks);
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
            {nav.showSecondaryCta && nav.secondaryCtaLabel && (
              <a
                href={nav.secondaryCtaUrl || "#"}
                target={nav.secondaryCtaOpenNewTab ? "_blank" : undefined}
                rel={nav.secondaryCtaOpenNewTab ? "noopener noreferrer" : undefined}
                className="hidden md:inline-flex text-[13px] font-semibold px-4 py-2 border transition-colors hover:opacity-80"
                style={{
                  backgroundColor: nav.secondaryCtaBgColor || "transparent",
                  color: nav.secondaryCtaTextColor || "var(--site-text, #191919)",
                  borderColor: nav.secondaryCtaBorderColor || "var(--site-border, #E6E6E4)",
                  borderRadius: "var(--site-btn-radius, 6px)",
                }}
              >
                {nav.secondaryCtaLabel}
              </a>
            )}
            {nav.showCta && nav.ctaLabel && (
              <a
                href={nav.ctaLink?.value ? resolvePageSlug(site, nav.ctaLink.value) : "#"}
                className="hidden md:inline-flex text-[13px] font-semibold px-4 py-2 transition-colors hover:opacity-90"
                style={{
                  backgroundColor: nav.ctaBgColor || "var(--btn-bg, var(--site-primary))",
                  color: nav.ctaTextColor || "var(--btn-text, #fff)",
                  borderRadius: nav.ctaBorderRadius || "var(--site-btn-radius, 6px)",
                }}
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
                const href = resolveNavLinkHref(link, site, pageBlocks);
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
              {nav.showSecondaryCta && nav.secondaryCtaLabel && (
                <a
                  href={nav.secondaryCtaUrl || "#"}
                  onClick={() => setMobileOpen(false)}
                  className="block text-center text-sm font-semibold px-4 py-2.5 border transition-colors mt-2"
                  style={{
                    backgroundColor: nav.secondaryCtaBgColor || "transparent",
                    color: nav.secondaryCtaTextColor || "var(--site-text, #191919)",
                    borderColor: nav.secondaryCtaBorderColor || "var(--site-border, #E6E6E4)",
                    borderRadius: "var(--site-btn-radius, 6px)",
                  }}
                >
                  {nav.secondaryCtaLabel}
                </a>
              )}
              {nav.showCta && nav.ctaLabel && (
                <a
                  href={nav.ctaLink?.value ? resolvePageSlug(site, nav.ctaLink.value) : "#"}
                  className="block text-center text-sm font-semibold px-4 py-2.5 transition-colors mt-2"
                  style={{
                    backgroundColor: nav.ctaBgColor || "var(--btn-bg, var(--site-primary))",
                    color: nav.ctaTextColor || "var(--btn-text, #fff)",
                    borderRadius: nav.ctaBorderRadius || "var(--site-btn-radius, 6px)",
                  }}
                >
                  {nav.ctaLabel}
                </a>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

// ═══════════════════════════════════════════════
// Site Footer
// ═══════════════════════════════════════════════

function SitePublicFooter({ site, pageBlocks }: { site: Site; pageBlocks?: Block[] }) {
  const footer = site.footer;
  if (!footer) return null;

  return (
    <footer className="py-12 px-6 border-t" style={{ backgroundColor: "var(--site-surface, var(--site-bg, #F7F7F5))", borderColor: "var(--site-border, #E6E6E4)" }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-6">
            {footer.links.map((link, i) => {
              const href = resolveNavLinkHref(link, site, pageBlocks);
              const isExternal = link.url && !link.pageId && !link.blockId;
              return (
                <a
                  key={i}
                  href={href}
                  target={isExternal && link.openNewTab ? "_blank" : undefined}
                  rel={isExternal && link.openNewTab ? "noopener noreferrer" : undefined}
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

  // ── Scrollspy: track active section ──
  // Uses scroll position directly (not IntersectionObserver) for reliable results.
  // Determines which section's top edge is closest to (but above) the scroll trigger line.
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  useEffect(() => {
    let ticking = false;

    const updateActiveSection = () => {
      const sections = document.querySelectorAll<HTMLElement>("section[id^='block-']");
      if (sections.length === 0) return;

      const navHeight = document.querySelector("nav")?.getBoundingClientRect().height || 0;
      // Trigger line: just below the sticky navbar + some breathing room
      const triggerY = window.scrollY + navHeight + 40;

      let activeId: string | null = null;

      // Walk sections in DOM order; pick the last one whose top is above the trigger line
      for (const section of sections) {
        const sectionTop = section.offsetTop;
        if (sectionTop <= triggerY) {
          activeId = section.id; // e.g. "block-bf91c2c2-..."
        } else {
          break; // sections are in DOM order (top to bottom), no need to continue
        }
      }

      // If scrolled near top of page, no active section
      if (window.scrollY < 100) activeId = null;

      setActiveSectionId(activeId);
    };

    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          updateActiveSection();
          ticking = false;
        });
      }
    };

    // Initial + scroll
    updateActiveSection();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [visibleBlocks]);

  // Apply active attribute to nav links matching the active section
  useEffect(() => {
    const isAtTop = !activeSectionId;

    document.querySelectorAll<HTMLAnchorElement>("nav a[href*='#']").forEach((a) => {
      const href = a.getAttribute("href") || "";
      const hash = href.includes("#") ? href.slice(href.indexOf("#") + 1) : "";

      const isActive =
        (hash === "top" && isAtTop) ||
        (activeSectionId && hash === activeSectionId);

      if (isActive) {
        a.setAttribute("data-scrollspy-active", "true");
      } else {
        a.removeAttribute("data-scrollspy-active");
      }
    });
  }, [activeSectionId]);

  // ── Helper: scroll to a hash target with navbar offset ──
  const scrollToHash = useCallback((hash: string) => {
    if (!hash) return;
    if (hash === "#top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const targetId = hash.replace(/^#/, "");
    const el = document.getElementById(targetId);

    if (!el) return;

    const navHeight = document.querySelector("nav")?.getBoundingClientRect().height || 0;
    const top = el.getBoundingClientRect().top + window.scrollY - navHeight - 16;
    window.scrollTo({ top, behavior: "smooth" });
  }, []);

  // ── Scroll to hash on initial load (cross-page navigation) ──
  // Retries via MutationObserver if the target element isn't rendered yet.
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    const tryScroll = () => {
      if (hash === "#top") { window.scrollTo({ top: 0, behavior: "smooth" }); return true; }
      const el = document.getElementById(hash.replace(/^#/, ""));
      if (el) { scrollToHash(hash); return true; }
      return false;
    };

    if (tryScroll()) return;

    // Element not found yet — wait for it (max 3s)
    let done = false;
    const observer = new MutationObserver(() => {
      if (!done && tryScroll()) { done = true; observer.disconnect(); }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    const timeout = setTimeout(() => {
      done = true; observer.disconnect();
    }, 3000);

    return () => { done = true; observer.disconnect(); clearTimeout(timeout); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.documentElement.classList.add("smooth-scroll");

    // ── Click handler: intercept same-page anchor links ──
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a[href*='#']");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || !href.includes("#")) return;
      const hash = href.slice(href.indexOf("#"));
      if (!hash || hash === "#") return;

      // Normalize: compare pathnames without trailing slash
      const linkPath = href.split("#")[0].replace(/\/+$/, "");
      const currentPath = window.location.pathname.replace(/\/+$/, "");
      const isSamePage = href.startsWith("#") || linkPath === currentPath;

      if (!isSamePage) return;

      e.preventDefault();
      e.stopPropagation();
      scrollToHash(hash);
      history.pushState(null, "", hash);
    };

    // ── hashchange handler: browser back/forward between anchors ──
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash) scrollToHash(hash);
    };

    document.addEventListener("click", handleClick, true);
    window.addEventListener("hashchange", handleHashChange);
    return () => {
      document.documentElement.classList.remove("smooth-scroll");
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [scrollToHash]);

  // ── Dev: detect horizontal overflow in blocks ──
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    const timer = setTimeout(() => {
      const sections = document.querySelectorAll<HTMLElement>("section[data-block]");
      sections.forEach((section) => {
        if (section.scrollWidth > section.clientWidth + 1) {
          const blockId = section.getAttribute("data-block");
          const overflow = section.scrollWidth - section.clientWidth;
          console.warn(`[responsive-overflow] block=${blockId} viewport=${window.innerWidth} overflow=${overflow}px`);
        }
      });
    }, 2000);
    return () => clearTimeout(timer);
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
          {/* Scrollspy active link styles */}
          <style dangerouslySetInnerHTML={{ __html: `
            nav a[data-scrollspy-active="true"] {
              color: var(--site-primary, #4F46E5) !important;
              font-weight: 600;
            }
            /* Defensive responsive: prevent inline content from breaking layout */
            section[data-block] img:not([class*="object-"]) { max-width: 100%; height: auto; }
            section[data-block] iframe { max-width: 100%; }
            section[data-block] pre, section[data-block] code { overflow-x: auto; max-width: 100%; }
            section[data-block] table { max-width: 100%; overflow-x: auto; display: block; }
          ` }} />
          {siteBgOverlayStyle && <div className="fixed inset-0 pointer-events-none z-0" style={siteBgOverlayStyle} />}
          <SiteAnalyticsTracker siteId={site.id} pageSlug={page.slug} />
          <AttributionTracker />
          {/* Navbar — new variant system or legacy fallback */}
          {resolvedSite.nav && (
            resolvedSite.nav.variant
              ? <NavbarRenderer
                  nav={resolvedSite.nav}
                  siteName={resolvedSite.settings.name}
                  logoUrl={resolvedSite.settings.logoUrl}
                  currentSlug={page.slug}
                  resolveHref={(link: NavLink) => resolveNavLinkHref(link, resolvedSite, page.blocks)}
                />
              : <SitePublicNav site={resolvedSite} currentSlug={page.slug} pageBlocks={page.blocks} />
          )}

          <main className="flex-1 relative z-[1] flex flex-col" style={{ gap: `var(--site-section-gap, 0px)` }}>
            {visibleBlocks.map((block) => (
              <PublicBlockSection key={block.id} block={block} site={resolvedSite} pagePath={page.slug} />
            ))}
          </main>

          <SitePublicFooter site={resolvedSite} pageBlocks={page.blocks} />
        </div>
      </LinkProvider>
    </ProductProvider>
  );
}
