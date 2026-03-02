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

export default function BlockEditor({ block }: { block: Block }) {
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
  }
}
