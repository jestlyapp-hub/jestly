import { memo } from "react";
import type { Block } from "@/types";
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

function BlockPreviewInner({ block }: { block: Block }) {
  const style: React.CSSProperties = {
    backgroundColor: block.style.backgroundColor,
    color: block.style.textColor,
    paddingTop: block.style.paddingTop,
    paddingBottom: block.style.paddingBottom,
  };

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
    }
  })();

  return (
    <div style={style} className="rounded-xl overflow-hidden bg-white">
      <div className="px-6">{content}</div>
    </div>
  );
}

const BlockPreview = memo(BlockPreviewInner);
export default BlockPreview;
