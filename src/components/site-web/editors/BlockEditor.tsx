"use client";

import type { Block } from "@/types";
import HeroBlockEditor from "./HeroBlockEditor";
import PortfolioGridBlockEditor from "./PortfolioGridBlockEditor";
import ServicesListBlockEditor from "./ServicesListBlockEditor";
import PackPremiumBlockEditor from "./PackPremiumBlockEditor";
import TestimonialsBlockEditor from "./TestimonialsBlockEditor";
import TimelineProcessBlockEditor from "./TimelineProcessBlockEditor";
import FaqAccordionBlockEditor from "./FaqAccordionBlockEditor";
import VideoBlockEditor from "./VideoBlockEditor";
import FullImageBlockEditor from "./FullImageBlockEditor";
import WhyMeBlockEditor from "./WhyMeBlockEditor";
import CenteredCtaBlockEditor from "./CenteredCtaBlockEditor";
import CustomFormBlockEditor from "./CustomFormBlockEditor";
import CalendarBookingBlockEditor from "./CalendarBookingBlockEditor";
import StatsCounterBlockEditor from "./StatsCounterBlockEditor";
import NewsletterBlockEditor from "./NewsletterBlockEditor";
import PricingTableBlockEditor from "./PricingTableBlockEditor";
import FeatureGridBlockEditor from "./FeatureGridBlockEditor";
import TestimonialsCarouselBlockEditor from "./TestimonialsCarouselBlockEditor";
import FaqAdvancedBlockEditor from "./FaqAdvancedBlockEditor";
import TimelineAdvancedBlockEditor from "./TimelineAdvancedBlockEditor";
import CtaPremiumBlockEditor from "./CtaPremiumBlockEditor";
import LogoCloudBlockEditor from "./LogoCloudBlockEditor";
import StatsAnimatedBlockEditor from "./StatsAnimatedBlockEditor";
import MasonryGalleryBlockEditor from "./MasonryGalleryBlockEditor";
import ComparisonTableBlockEditor from "./ComparisonTableBlockEditor";
import ContactFormBlockEditor from "./ContactFormBlockEditor";
import BlogPreviewBlockEditor from "./BlogPreviewBlockEditor";
import VideoTextSplitBlockEditor from "./VideoTextSplitBlockEditor";
import BeforeAfterBlockEditor from "./BeforeAfterBlockEditor";
import ServiceCardsBlockEditor from "./ServiceCardsBlockEditor";
import LeadMagnetBlockEditor from "./LeadMagnetBlockEditor";
import AvailabilityBannerBlockEditor from "./AvailabilityBannerBlockEditor";
import ProductHeroCheckoutBlockEditor from "./ProductHeroCheckoutBlockEditor";
import ProductCardsGridBlockEditor from "./ProductCardsGridBlockEditor";
import InlineCheckoutBlockEditor from "./InlineCheckoutBlockEditor";
import BundleBuilderBlockEditor from "./BundleBuilderBlockEditor";
import PricingTableRealBlockEditor from "./PricingTableRealBlockEditor";
import { useBuilder } from "@/lib/site-builder-context";

export default function BlockEditor({ block }: { block: Block }) {
  const { dispatch } = useBuilder();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const contentChange = (c: any) => dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content: c });

  switch (block.type) {
    case "hero": return <HeroBlockEditor block={block} />;
    case "portfolio-grid": return <PortfolioGridBlockEditor block={block} />;
    case "services-list": return <ServicesListBlockEditor block={block} />;
    case "pack-premium": return <PackPremiumBlockEditor block={block} />;
    case "testimonials": return <TestimonialsBlockEditor block={block} />;
    case "timeline-process": return <TimelineProcessBlockEditor block={block} />;
    case "faq-accordion": return <FaqAccordionBlockEditor block={block} />;
    case "video": return <VideoBlockEditor block={block} />;
    case "full-image": return <FullImageBlockEditor block={block} />;
    case "why-me": return <WhyMeBlockEditor block={block} />;
    case "centered-cta": return <CenteredCtaBlockEditor block={block} />;
    case "custom-form": return <CustomFormBlockEditor block={block} />;
    case "calendar-booking": return <CalendarBookingBlockEditor block={block} />;
    case "stats-counter": return <StatsCounterBlockEditor block={block} />;
    case "newsletter": return <NewsletterBlockEditor block={block} />;
    case "pricing-table": return <PricingTableBlockEditor block={block} />;
    case "feature-grid": return <FeatureGridBlockEditor block={block} />;
    case "testimonials-carousel": return <TestimonialsCarouselBlockEditor block={block} />;
    case "faq-advanced": return <FaqAdvancedBlockEditor block={block} />;
    case "timeline-advanced": return <TimelineAdvancedBlockEditor block={block} />;
    case "cta-premium": return <CtaPremiumBlockEditor block={block} />;
    case "logo-cloud": return <LogoCloudBlockEditor block={block} />;
    case "stats-animated": return <StatsAnimatedBlockEditor block={block} />;
    case "masonry-gallery": return <MasonryGalleryBlockEditor block={block} />;
    case "comparison-table": return <ComparisonTableBlockEditor block={block} />;
    case "contact-form": return <ContactFormBlockEditor block={block} />;
    case "blog-preview": return <BlogPreviewBlockEditor block={block} />;
    case "video-text-split": return <VideoTextSplitBlockEditor block={block} />;
    case "before-after": return <BeforeAfterBlockEditor block={block} />;
    case "service-cards": return <ServiceCardsBlockEditor block={block} />;
    case "lead-magnet": return <LeadMagnetBlockEditor block={block} />;
    case "availability-banner": return <AvailabilityBannerBlockEditor block={block} />;
    case "product-hero-checkout": return <ProductHeroCheckoutBlockEditor content={block.content} onChange={contentChange} />;
    case "product-cards-grid": return <ProductCardsGridBlockEditor content={block.content} onChange={contentChange} />;
    case "inline-checkout": return <InlineCheckoutBlockEditor content={block.content} onChange={contentChange} />;
    case "bundle-builder": return <BundleBuilderBlockEditor content={block.content} onChange={contentChange} />;
    case "pricing-table-real": return <PricingTableRealBlockEditor content={block.content} onChange={contentChange} />;
  }
}
