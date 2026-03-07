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

const FULL_BLEED_BLOCKS = new Set([
  "full-image", "video", "hero", "availability-banner",
  "hero-split-glow", "hero-centered-mesh", "cta-banner", "footer-block",
  "services-premium", "service-cards", "services-list",
  "portfolio-masonry", "pricing-modern",
  "testimonials-dark", "contact-premium", "video-showcase",
  "tech-stack", "before-after-pro", "cta-premium",
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
