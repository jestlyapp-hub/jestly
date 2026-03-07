import { memo } from "react";
import type { Block } from "@/types";
import { computeSectionStyle, computePublicContainerClass, computeButtonVars, getButtonHoverCSS, renderBackgroundConfig } from "@/lib/block-style-engine";
import HeroBlockPreview from "./HeroBlockPreview";
import PortfolioGridBlockPreview from "./PortfolioGridBlockPreview";
import ServicesListBlockPreview from "./ServicesListBlockPreview";
import PackPremiumBlockPreview from "./PackPremiumBlockPreview";
import TestimonialsBlockPreview from "./TestimonialsBlockPreview";
import TimelineProcessBlockPreview from "./TimelineProcessBlockPreview";
import FaqAccordionBlockPreview from "./FaqAccordionBlockPreview";
import VideoBlockPreview from "./VideoBlockPreview";
import FullImageBlockPreview from "./FullImageBlockPreview";
import WhyMeBlockPreview from "./WhyMeBlockPreview";
import CenteredCtaBlockPreview from "./CenteredCtaBlockPreview";
import CustomFormBlockPreview from "./CustomFormBlockPreview";
import CalendarBookingBlockPreview from "./CalendarBookingBlockPreview";
import StatsCounterBlockPreview from "./StatsCounterBlockPreview";
import NewsletterBlockPreview from "./NewsletterBlockPreview";
import PricingTableBlockPreview from "./PricingTableBlockPreview";
import FeatureGridBlockPreview from "./FeatureGridBlockPreview";
import TestimonialsCarouselBlockPreview from "./TestimonialsCarouselBlockPreview";
import FaqAdvancedBlockPreview from "./FaqAdvancedBlockPreview";
import TimelineAdvancedBlockPreview from "./TimelineAdvancedBlockPreview";
import CtaPremiumBlockPreview from "./CtaPremiumBlockPreview";
import LogoCloudBlockPreview from "./LogoCloudBlockPreview";
import StatsAnimatedBlockPreview from "./StatsAnimatedBlockPreview";
import MasonryGalleryBlockPreview from "./MasonryGalleryBlockPreview";
import ComparisonTableBlockPreview from "./ComparisonTableBlockPreview";
import ContactFormBlockPreview from "./ContactFormBlockPreview";
import BlogPreviewBlockPreview from "./BlogPreviewBlockPreview";
import VideoTextSplitBlockPreview from "./VideoTextSplitBlockPreview";
import BeforeAfterBlockPreview from "./BeforeAfterBlockPreview";
import ServiceCardsBlockPreview from "./ServiceCardsBlockPreview";
import LeadMagnetBlockPreview from "./LeadMagnetBlockPreview";
import AvailabilityBannerBlockPreview from "./AvailabilityBannerBlockPreview";
import ProductHeroCheckoutBlockPreview from "./ProductHeroCheckoutBlockPreview";
import ProductCardsGridBlockPreview from "./ProductCardsGridBlockPreview";
import InlineCheckoutBlockPreview from "./InlineCheckoutBlockPreview";
import BundleBuilderBlockPreview from "./BundleBuilderBlockPreview";
import PricingTableRealBlockPreview from "./PricingTableRealBlockPreview";
import HeroSplitGlowBlockPreview from "./HeroSplitGlowBlockPreview";
import HeroCenteredMeshBlockPreview from "./HeroCenteredMeshBlockPreview";
import ServicesPremiumBlockPreview from "./ServicesPremiumBlockPreview";
import PortfolioMasonryBlockPreview from "./PortfolioMasonryBlockPreview";
import PricingModernBlockPreview from "./PricingModernBlockPreview";
import TestimonialsDarkBlockPreview from "./TestimonialsDarkBlockPreview";
import CtaBannerBlockPreview from "./CtaBannerBlockPreview";
import ContactPremiumBlockPreview from "./ContactPremiumBlockPreview";
import FooterBlockBlockPreview from "./FooterBlockBlockPreview";
import VideoShowcaseBlockPreview from "./VideoShowcaseBlockPreview";
import TechStackBlockPreview from "./TechStackBlockPreview";
import BeforeAfterProBlockPreview from "./BeforeAfterProBlockPreview";
// ─── 50 new blocks ───
import HeroSplitPortfolioBlockPreview from "./HeroSplitPortfolioBlockPreview";
import HeroMinimalServiceBlockPreview from "./HeroMinimalServiceBlockPreview";
import HeroDarkSaasBlockPreview from "./HeroDarkSaasBlockPreview";
import HeroCreatorBrandBlockPreview from "./HeroCreatorBrandBlockPreview";
import HeroVideoShowreelBlockPreview from "./HeroVideoShowreelBlockPreview";
import ProjectsGridCasesBlockPreview from "./ProjectsGridCasesBlockPreview";
import ProjectsHorizontalBlockPreview from "./ProjectsHorizontalBlockPreview";
import ProjectBeforeAfterBlockPreview from "./ProjectBeforeAfterBlockPreview";
import ProjectTimelineBlockPreview from "./ProjectTimelineBlockPreview";
import ProjectMasonryWallBlockPreview from "./ProjectMasonryWallBlockPreview";
import Services3CardPremiumBlockPreview from "./Services3CardPremiumBlockPreview";
import ServicesIconGridBlockPreview from "./ServicesIconGridBlockPreview";
import ServicesSplitValueBlockPreview from "./ServicesSplitValueBlockPreview";
import ServicesProcessOffersBlockPreview from "./ServicesProcessOffersBlockPreview";
import ProductFeaturedCardBlockPreview from "./ProductFeaturedCardBlockPreview";
import Products3CardShopBlockPreview from "./Products3CardShopBlockPreview";
import ProductBundleCompareBlockPreview from "./ProductBundleCompareBlockPreview";
import ProductBenefitsMockupBlockPreview from "./ProductBenefitsMockupBlockPreview";
import Pricing3TierSaasBlockPreview from "./Pricing3TierSaasBlockPreview";
import PricingCustomQuoteBlockPreview from "./PricingCustomQuoteBlockPreview";
import PricingMiniFaqBlockPreview from "./PricingMiniFaqBlockPreview";
import Testimonials3DarkBlockPreview from "./Testimonials3DarkBlockPreview";
import TestimonialsVideoBlockPreview from "./TestimonialsVideoBlockPreview";
import ResultsLogosQuotesBlockPreview from "./ResultsLogosQuotesBlockPreview";
import NumbersImpactBlockPreview from "./NumbersImpactBlockPreview";
import ResultsTimelineBlockPreview from "./ResultsTimelineBlockPreview";
import AboutPersonalStoryBlockPreview from "./AboutPersonalStoryBlockPreview";
import AboutStudioValuesBlockPreview from "./AboutStudioValuesBlockPreview";
import TeamMiniGridBlockPreview from "./TeamMiniGridBlockPreview";
import Process4StepsBlockPreview from "./Process4StepsBlockPreview";
import ProcessDetailedTimelineBlockPreview from "./ProcessDetailedTimelineBlockPreview";
import FaqAccordionFullBlockPreview from "./FaqAccordionFullBlockPreview";
import Faq2ColumnBlockPreview from "./Faq2ColumnBlockPreview";
import CtaCenteredStrongBlockPreview from "./CtaCenteredStrongBlockPreview";
import CtaSplitTextBlockPreview from "./CtaSplitTextBlockPreview";
import CtaDarkGlowBlockPreview from "./CtaDarkGlowBlockPreview";
import FormContactSimpleBlockPreview from "./FormContactSimpleBlockPreview";
import FormQuoteRequestBlockPreview from "./FormQuoteRequestBlockPreview";
import FormNewsletterLeadBlockPreview from "./FormNewsletterLeadBlockPreview";
import MediaFeaturedVideoBlockPreview from "./MediaFeaturedVideoBlockPreview";
import Gallery3UpStripBlockPreview from "./Gallery3UpStripBlockPreview";
import GalleryStackedStoryboardBlockPreview from "./GalleryStackedStoryboardBlockPreview";
import ContentFeatureArticleBlockPreview from "./ContentFeatureArticleBlockPreview";
import Content3ArticlesBlockPreview from "./Content3ArticlesBlockPreview";
import ContentComparisonWhyBlockPreview from "./ContentComparisonWhyBlockPreview";
import TrustBadgesBlockPreview from "./TrustBadgesBlockPreview";
import SocialProofMarqueeBlockPreview from "./SocialProofMarqueeBlockPreview";
import FooterSimplePremiumBlockPreview from "./FooterSimplePremiumBlockPreview";
import FooterMultiColumnBlockPreview from "./FooterMultiColumnBlockPreview";
import SignatureCreativeClosingBlockPreview from "./SignatureCreativeClosingBlockPreview";

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

function BlockPreviewInner({ block }: { block: Block }) {
  // Compute section styles from the style engine
  const sectionStyle = computeSectionStyle(block.style);
  const containerClass = computePublicContainerClass(block.style);
  const buttonVars = computeButtonVars(block.style.buttonStyle);
  const hoverCSS = getButtonHoverCSS(block.id);
  const isFullBleed = FULL_BLEED_BLOCKS.has(block.type);

  // Per-block background (only if block has an explicit override)
  const blockBg = block.style.background ? renderBackgroundConfig(block.style.background) : {};

  // Merge button CSS variables into section style
  const mergedStyle: React.CSSProperties = {
    ...sectionStyle,
    ...buttonVars,
    ...blockBg.containerStyle,
  } as React.CSSProperties;

  const content = (() => {
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
      default: return <div className="py-8 text-center text-sm opacity-50">Bloc « {(block as { type: string }).type} » non reconnu</div>;
    }
  })();

  return (
    <div data-block={block.id} style={mergedStyle} className="relative overflow-hidden">
      {/* Scoped hover CSS for buttons */}
      <style dangerouslySetInnerHTML={{ __html: hoverCSS }} />
      {blockBg.overlayStyle && <div className="absolute inset-0 pointer-events-none z-0" style={blockBg.overlayStyle} />}
      <div className={`relative z-[1] ${isFullBleed ? "" : `${containerClass} px-6`}`}>{content}</div>
    </div>
  );
}

const BlockPreview = memo(BlockPreviewInner);
export default BlockPreview;
