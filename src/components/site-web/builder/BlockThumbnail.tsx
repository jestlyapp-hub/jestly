import { memo } from "react";
import type { BlockType } from "@/types";

/* Miniature abstraite pour chaque type de bloc — shapes géométriques stylées */
function BlockThumbnailInner({ type }: { type: BlockType }) {
  switch (type) {
    case "hero":
      return (
        <div className="space-y-1.5">
          <div className="h-2 w-16 bg-[#1A1A1A]/70 rounded-sm mx-auto" />
          <div className="h-1.5 w-20 bg-[#1A1A1A]/20 rounded-sm mx-auto" />
          <div className="h-3 w-12 bg-[#4F46E5] rounded-sm mx-auto mt-1.5" />
        </div>
      );
    case "portfolio-grid":
      return (
        <div className="grid grid-cols-3 gap-1">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="aspect-square bg-[#EEF2FF] rounded-sm" />
          ))}
        </div>
      );
    case "services-list":
      return (
        <div className="space-y-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="h-1.5 w-10 bg-[#1A1A1A]/50 rounded-sm" />
                <div className="h-1 w-14 bg-[#1A1A1A]/15 rounded-sm" />
              </div>
              <div className="h-1.5 w-6 bg-[#4F46E5]/40 rounded-sm" />
            </div>
          ))}
        </div>
      );
    case "pack-premium":
      return (
        <div className="text-center space-y-1">
          <div className="h-1.5 w-10 bg-[#1A1A1A]/50 rounded-sm mx-auto" />
          <div className="h-3 w-6 bg-[#4F46E5] rounded-sm mx-auto" />
          {[0, 1].map((i) => (
            <div key={i} className="flex items-center gap-1 justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#4F46E5]/40" />
              <div className="h-1 w-12 bg-[#1A1A1A]/15 rounded-sm" />
            </div>
          ))}
          <div className="h-2.5 w-10 bg-[#4F46E5] rounded-sm mx-auto mt-0.5" />
        </div>
      );
    case "testimonials":
      return (
        <div className="grid grid-cols-2 gap-1">
          {[0, 1].map((i) => (
            <div key={i} className="p-1 border border-[#E6E6E4] rounded-sm">
              <div className="h-1 w-full bg-[#1A1A1A]/10 rounded-sm mb-1" />
              <div className="flex items-center gap-0.5">
                <div className="w-2 h-2 rounded-full bg-[#EEF2FF]" />
                <div className="h-1 w-4 bg-[#1A1A1A]/20 rounded-sm" />
              </div>
            </div>
          ))}
        </div>
      );
    case "timeline-process":
      return (
        <div className="space-y-1.5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#4F46E5] text-white flex items-center justify-center text-[5px] font-bold flex-shrink-0">{n}</div>
              <div className="h-1 flex-1 bg-[#1A1A1A]/15 rounded-sm" />
            </div>
          ))}
        </div>
      );
    case "faq-accordion":
      return (
        <div className="space-y-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between p-0.5 border border-[#E6E6E4] rounded-sm">
              <div className="h-1 w-12 bg-[#1A1A1A]/30 rounded-sm" />
              <div className="w-1.5 h-1.5 border-b border-r border-[#999] rotate-45 -mt-0.5" />
            </div>
          ))}
        </div>
      );
    case "video":
      return (
        <div className="h-10 bg-[#191919] rounded-sm flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
            <div className="w-0 h-0 border-t-[3px] border-b-[3px] border-l-[5px] border-transparent border-l-white ml-0.5" />
          </div>
        </div>
      );
    case "full-image":
      return (
        <div className="h-10 bg-gradient-to-br from-[#EEF2FF] to-[#E6E6E4] rounded-sm flex items-center justify-center">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#BBB" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
        </div>
      );
    case "why-me":
      return (
        <div className="space-y-1">
          <div className="h-1.5 w-14 bg-[#1A1A1A]/50 rounded-sm" />
          <div className="grid grid-cols-3 gap-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className="p-1 border border-[#E6E6E4] rounded-sm">
                <div className="w-2 h-2 rounded bg-[#EEF2FF] mb-0.5" />
                <div className="h-0.5 w-full bg-[#1A1A1A]/15 rounded-sm" />
              </div>
            ))}
          </div>
        </div>
      );
    case "centered-cta":
      return (
        <div className="text-center space-y-1 py-1">
          <div className="h-2 w-16 bg-[#1A1A1A]/50 rounded-sm mx-auto" />
          <div className="h-1 w-20 bg-[#1A1A1A]/15 rounded-sm mx-auto" />
          <div className="h-3 w-12 bg-[#4F46E5] rounded-sm mx-auto mt-1" />
        </div>
      );
    case "custom-form":
      return (
        <div className="space-y-1">
          {[0, 1, 2].map((i) => (
            <div key={i}>
              <div className="h-0.5 w-5 bg-[#999]/40 rounded-sm mb-0.5" />
              <div className="h-2.5 w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-sm" />
            </div>
          ))}
          <div className="h-2.5 w-8 bg-[#4F46E5] rounded-sm" />
        </div>
      );
    case "calendar-booking":
      return (
        <div className="text-center space-y-1">
          <div className="h-1.5 w-12 bg-[#1A1A1A]/50 rounded-sm mx-auto" />
          <div className="flex gap-0.5 justify-center flex-wrap">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-2 w-6 border border-[#E6E6E4] rounded-sm" />
            ))}
          </div>
        </div>
      );
    case "stats-counter":
      return (
        <div className="grid grid-cols-4 gap-1 text-center">
          {["50+", "98%", "8", "24h"].map((v) => (
            <div key={v}>
              <div className="text-[6px] font-bold text-[#4F46E5]">{v}</div>
              <div className="h-0.5 w-full bg-[#1A1A1A]/10 rounded-sm" />
            </div>
          ))}
        </div>
      );
    case "newsletter":
      return (
        <div className="text-center space-y-1">
          <div className="h-1.5 w-10 bg-[#1A1A1A]/50 rounded-sm mx-auto" />
          <div className="flex gap-1 items-center">
            <div className="flex-1 h-2.5 bg-[#F7F7F5] border border-[#E6E6E4] rounded-sm" />
            <div className="h-2.5 w-6 bg-[#4F46E5] rounded-sm" />
          </div>
        </div>
      );

    // ── V2 Blocks ──

    case "pricing-table":
      return (
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`flex-1 p-1 border rounded-sm ${i === 1 ? "border-[#4F46E5]" : "border-[#E6E6E4]"}`}>
              <div className="h-1 w-full bg-[#1A1A1A]/20 rounded-sm mb-1" />
              <div className="h-2 w-4 bg-[#4F46E5]/60 rounded-sm mx-auto mb-1" />
              <div className="h-1.5 w-full bg-[#4F46E5] rounded-sm" />
            </div>
          ))}
        </div>
      );
    case "feature-grid":
      return (
        <div className="grid grid-cols-3 gap-1">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-1 border border-[#E6E6E4] rounded-sm text-center">
              <div className="w-2 h-2 rounded bg-[#EEF2FF] mx-auto mb-0.5" />
              <div className="h-0.5 w-full bg-[#1A1A1A]/15 rounded-sm" />
            </div>
          ))}
        </div>
      );
    case "testimonials-carousel":
      return (
        <div className="space-y-1">
          <div className="flex gap-1 items-center">
            <div className="w-1.5 h-4 bg-[#E6E6E4] rounded-sm" />
            <div className="flex-1 p-1.5 border border-[#E6E6E4] rounded-sm">
              <div className="h-1 w-full bg-[#1A1A1A]/10 rounded-sm mb-1" />
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-[#EEF2FF]" />
                <div className="h-1 w-6 bg-[#1A1A1A]/20 rounded-sm" />
              </div>
            </div>
            <div className="w-1.5 h-4 bg-[#E6E6E4] rounded-sm" />
          </div>
          <div className="flex gap-0.5 justify-center">
            {[0, 1, 2].map((i) => (
              <div key={i} className={`w-1 h-1 rounded-full ${i === 0 ? "bg-[#4F46E5]" : "bg-[#E6E6E4]"}`} />
            ))}
          </div>
        </div>
      );
    case "faq-advanced":
      return (
        <div className="space-y-1">
          <div className="h-1.5 w-10 bg-[#1A1A1A]/50 rounded-sm mx-auto mb-1" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between p-0.5 border border-[#E6E6E4] rounded-sm">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#4F46E5]/30" />
                <div className="h-1 w-10 bg-[#1A1A1A]/30 rounded-sm" />
              </div>
              <div className="w-1.5 h-1.5 border-b border-r border-[#999] rotate-45 -mt-0.5" />
            </div>
          ))}
        </div>
      );
    case "timeline-advanced":
      return (
        <div className="flex items-start gap-1">
          <div className="flex flex-col items-center gap-0.5">
            {[1, 2, 3].map((n) => (
              <div key={n}>
                <div className="w-2.5 h-2.5 rounded-full bg-[#4F46E5] text-white flex items-center justify-center text-[4px] font-bold">{n}</div>
                {n < 3 && <div className="w-0.5 h-2 bg-[#4F46E5]/20 mx-auto" />}
              </div>
            ))}
          </div>
          <div className="flex-1 space-y-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i}>
                <div className="h-1 w-10 bg-[#1A1A1A]/40 rounded-sm" />
                <div className="h-0.5 w-14 bg-[#1A1A1A]/15 rounded-sm mt-0.5" />
              </div>
            ))}
          </div>
        </div>
      );
    case "cta-premium":
      return (
        <div className="flex gap-1.5 items-center">
          <div className="flex-1 space-y-1">
            <div className="h-2 w-14 bg-[#1A1A1A]/50 rounded-sm" />
            <div className="h-1 w-full bg-[#1A1A1A]/15 rounded-sm" />
            <div className="h-2.5 w-10 bg-[#4F46E5] rounded-sm mt-1" />
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-[#EEF2FF] to-[#E6E6E4] rounded-sm" />
        </div>
      );
    case "logo-cloud":
      return (
        <div className="space-y-1">
          <div className="h-1 w-10 bg-[#1A1A1A]/30 rounded-sm mx-auto" />
          <div className="flex gap-1.5 justify-center">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="w-5 h-3 bg-[#F7F7F5] border border-[#E6E6E4] rounded-sm" />
            ))}
          </div>
        </div>
      );
    case "stats-animated":
      return (
        <div className="grid grid-cols-3 gap-1 text-center">
          {["150+", "99%", "5K"].map((v) => (
            <div key={v} className="p-1 border border-[#E6E6E4] rounded-sm">
              <div className="text-[7px] font-bold text-[#4F46E5]">{v}</div>
              <div className="h-0.5 w-full bg-[#1A1A1A]/10 rounded-sm mt-0.5" />
            </div>
          ))}
        </div>
      );
    case "masonry-gallery":
      return (
        <div className="grid grid-cols-3 gap-0.5">
          <div className="col-span-2 row-span-2 bg-[#EEF2FF] rounded-sm aspect-square" />
          <div className="bg-[#E6E6E4]/60 rounded-sm aspect-square" />
          <div className="bg-[#E6E6E4]/40 rounded-sm aspect-square" />
          <div className="bg-[#E6E6E4]/60 rounded-sm aspect-square" />
          <div className="bg-[#EEF2FF] rounded-sm aspect-square" />
          <div className="bg-[#E6E6E4]/40 rounded-sm aspect-square" />
        </div>
      );
    case "comparison-table":
      return (
        <div className="space-y-0.5">
          <div className="flex gap-0.5">
            <div className="flex-1 h-2 bg-[#F7F7F5] rounded-sm" />
            <div className="w-6 h-2 bg-[#4F46E5]/20 rounded-sm" />
            <div className="w-6 h-2 bg-[#4F46E5] rounded-sm" />
          </div>
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-0.5">
              <div className="flex-1 h-1.5 bg-[#1A1A1A]/10 rounded-sm" />
              <div className="w-6 h-1.5 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-[#4F46E5]/30" />
              </div>
              <div className="w-6 h-1.5 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-[#4F46E5]" />
              </div>
            </div>
          ))}
        </div>
      );
    case "contact-form":
      return (
        <div className="space-y-1">
          <div className="h-1.5 w-10 bg-[#1A1A1A]/50 rounded-sm" />
          <div className="grid grid-cols-2 gap-0.5">
            <div className="h-2 bg-[#F7F7F5] border border-[#E6E6E4] rounded-sm" />
            <div className="h-2 bg-[#F7F7F5] border border-[#E6E6E4] rounded-sm" />
          </div>
          <div className="h-4 bg-[#F7F7F5] border border-[#E6E6E4] rounded-sm" />
          <div className="h-2 w-8 bg-[#4F46E5] rounded-sm" />
        </div>
      );
    case "blog-preview":
      return (
        <div className="grid grid-cols-3 gap-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="border border-[#E6E6E4] rounded-sm overflow-hidden">
              <div className="h-4 bg-[#EEF2FF]" />
              <div className="p-0.5">
                <div className="h-1 w-full bg-[#1A1A1A]/30 rounded-sm" />
                <div className="h-0.5 w-full bg-[#1A1A1A]/10 rounded-sm mt-0.5" />
              </div>
            </div>
          ))}
        </div>
      );
    case "video-text-split":
      return (
        <div className="flex gap-1.5 items-center">
          <div className="w-12 h-8 bg-[#191919] rounded-sm flex items-center justify-center">
            <div className="w-0 h-0 border-t-[2px] border-b-[2px] border-l-[4px] border-transparent border-l-white" />
          </div>
          <div className="flex-1 space-y-0.5">
            <div className="h-1.5 w-10 bg-[#1A1A1A]/50 rounded-sm" />
            <div className="h-1 w-full bg-[#1A1A1A]/15 rounded-sm" />
            <div className="h-2 w-6 bg-[#4F46E5] rounded-sm mt-0.5" />
          </div>
        </div>
      );
    case "before-after":
      return (
        <div className="flex items-center h-8">
          <div className="flex-1 h-full bg-[#E6E6E4]/50 rounded-l-sm" />
          <div className="w-0.5 h-full bg-[#4F46E5] relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#4F46E5] border-2 border-white" />
          </div>
          <div className="flex-1 h-full bg-[#EEF2FF] rounded-r-sm" />
        </div>
      );
    case "service-cards":
      return (
        <div className="grid grid-cols-3 gap-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="p-1 border border-[#E6E6E4] rounded-sm">
              <div className="w-2 h-2 rounded bg-[#EEF2FF] mb-0.5" />
              <div className="h-1 w-full bg-[#1A1A1A]/30 rounded-sm" />
              <div className="h-0.5 w-full bg-[#1A1A1A]/10 rounded-sm mt-0.5" />
              <div className="h-1.5 w-full bg-[#4F46E5] rounded-sm mt-1" />
            </div>
          ))}
        </div>
      );
    case "lead-magnet":
      return (
        <div className="flex gap-1.5 items-center p-1 border border-[#4F46E5]/30 rounded-sm bg-[#EEF2FF]/30">
          <div className="space-y-0.5 flex-1">
            <div className="h-1.5 w-12 bg-[#1A1A1A]/50 rounded-sm" />
            <div className="h-1 w-16 bg-[#1A1A1A]/15 rounded-sm" />
            <div className="flex gap-0.5 mt-0.5">
              <div className="flex-1 h-2 bg-[#F7F7F5] border border-[#E6E6E4] rounded-sm" />
              <div className="h-2 w-6 bg-[#4F46E5] rounded-sm" />
            </div>
          </div>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
        </div>
      );
    case "availability-banner":
      return (
        <div className="flex items-center justify-between p-1.5 bg-[#EEF2FF]/50 border border-[#4F46E5]/20 rounded-sm">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <div className="h-1.5 w-14 bg-[#1A1A1A]/40 rounded-sm" />
          </div>
          <div className="h-2 w-8 bg-[#4F46E5] rounded-sm" />
        </div>
      );
    case "product-hero-checkout":
      return (
        <div className="space-y-1.5">
          <div className="h-2 w-14 bg-[#1A1A1A]/70 rounded-sm mx-auto" />
          <div className="h-1 w-18 bg-[#1A1A1A]/15 rounded-sm mx-auto" />
          <div className="h-2.5 w-8 bg-[#4F46E5] rounded-sm mx-auto" />
          <div className="flex gap-1 justify-center mt-0.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-0.5">
                <div className="w-1 h-1 rounded-full bg-[#4F46E5]" />
                <div className="h-0.5 w-5 bg-[#1A1A1A]/15 rounded-sm" />
              </div>
            ))}
          </div>
        </div>
      );
    case "product-cards-grid":
      return (
        <div className="grid grid-cols-3 gap-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="border border-[#E6E6E4] rounded-sm p-1">
              <div className="h-3 bg-[#EEF2FF] rounded-sm mb-0.5" />
              <div className="h-1 w-full bg-[#1A1A1A]/30 rounded-sm" />
              <div className="h-1.5 w-full bg-[#4F46E5] rounded-sm mt-1" />
            </div>
          ))}
        </div>
      );
    case "inline-checkout":
      return (
        <div className="border border-[#E6E6E4] rounded-sm p-1.5 space-y-1">
          <div className="flex items-center justify-between">
            <div className="h-1.5 w-10 bg-[#1A1A1A]/50 rounded-sm" />
            <div className="h-1.5 w-5 bg-[#4F46E5] rounded-sm" />
          </div>
          <div className="flex gap-1">
            <div className="flex-1 h-2 bg-[#F7F7F5] border border-[#E6E6E4] rounded-sm" />
            <div className="flex-1 h-2 bg-[#F7F7F5] border border-[#E6E6E4] rounded-sm" />
          </div>
          <div className="h-2.5 w-full bg-[#4F46E5] rounded-sm" />
        </div>
      );
    case "bundle-builder":
      return (
        <div className="space-y-1">
          <div className="h-1.5 w-12 bg-[#1A1A1A]/50 rounded-sm mx-auto" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-1 p-0.5 border border-[#E6E6E4] rounded-sm">
              <div className={`w-2 h-2 rounded-sm border ${i < 2 ? "bg-[#4F46E5] border-[#4F46E5]" : "border-[#E6E6E4]"}`} />
              <div className="h-1 flex-1 bg-[#1A1A1A]/20 rounded-sm" />
              <div className="h-1 w-4 bg-[#1A1A1A]/30 rounded-sm" />
            </div>
          ))}
          <div className="h-2.5 w-10 bg-[#4F46E5] rounded-sm mx-auto" />
        </div>
      );
    case "pricing-table-real":
      return (
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`flex-1 p-1 border rounded-sm ${i === 1 ? "border-[#4F46E5] border-2" : "border-[#E6E6E4]"}`}>
              <div className="h-1 w-full bg-[#1A1A1A]/20 rounded-sm mb-0.5" />
              <div className="h-2 w-4 bg-[#4F46E5]/60 rounded-sm mx-auto mb-0.5" />
              {[0, 1].map((j) => (
                <div key={j} className="flex items-center gap-0.5 mb-0.5">
                  <div className="w-1 h-1 rounded-full bg-[#4F46E5]/40" />
                  <div className="h-0.5 flex-1 bg-[#1A1A1A]/10 rounded-sm" />
                </div>
              ))}
              <div className="h-1.5 w-full bg-[#4F46E5] rounded-sm mt-0.5" />
            </div>
          ))}
        </div>
      );
  }
}

const BlockThumbnail = memo(BlockThumbnailInner);
export default BlockThumbnail;
