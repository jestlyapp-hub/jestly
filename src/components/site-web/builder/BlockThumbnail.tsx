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
          <div className="h-3 w-12 bg-[#6a18f1] rounded-sm mx-auto mt-1.5" />
        </div>
      );
    case "portfolio-grid":
      return (
        <div className="grid grid-cols-3 gap-1">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="aspect-square bg-[#F0EBFF] rounded-sm" />
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
              <div className="h-1.5 w-6 bg-[#6a18f1]/40 rounded-sm" />
            </div>
          ))}
        </div>
      );
    case "pack-premium":
      return (
        <div className="text-center space-y-1">
          <div className="h-1.5 w-10 bg-[#1A1A1A]/50 rounded-sm mx-auto" />
          <div className="h-3 w-6 bg-[#6a18f1] rounded-sm mx-auto" />
          {[0, 1].map((i) => (
            <div key={i} className="flex items-center gap-1 justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#6a18f1]/40" />
              <div className="h-1 w-12 bg-[#1A1A1A]/15 rounded-sm" />
            </div>
          ))}
          <div className="h-2.5 w-10 bg-[#6a18f1] rounded-sm mx-auto mt-0.5" />
        </div>
      );
    case "testimonials":
      return (
        <div className="grid grid-cols-2 gap-1">
          {[0, 1].map((i) => (
            <div key={i} className="p-1 border border-[#E6E8F0] rounded-sm">
              <div className="h-1 w-full bg-[#1A1A1A]/10 rounded-sm mb-1" />
              <div className="flex items-center gap-0.5">
                <div className="w-2 h-2 rounded-full bg-[#F0EBFF]" />
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
              <div className="w-3 h-3 rounded-full bg-[#6a18f1] text-white flex items-center justify-center text-[5px] font-bold flex-shrink-0">{n}</div>
              <div className="h-1 flex-1 bg-[#1A1A1A]/15 rounded-sm" />
            </div>
          ))}
        </div>
      );
    case "faq-accordion":
      return (
        <div className="space-y-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between p-0.5 border border-[#E6E8F0] rounded-sm">
              <div className="h-1 w-12 bg-[#1A1A1A]/30 rounded-sm" />
              <div className="w-1.5 h-1.5 border-b border-r border-[#999] rotate-45 -mt-0.5" />
            </div>
          ))}
        </div>
      );
    case "video":
      return (
        <div className="h-10 bg-[#0a0a12] rounded-sm flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
            <div className="w-0 h-0 border-t-[3px] border-b-[3px] border-l-[5px] border-transparent border-l-white ml-0.5" />
          </div>
        </div>
      );
    case "full-image":
      return (
        <div className="h-10 bg-gradient-to-br from-[#F0EBFF] to-[#E6E8F0] rounded-sm flex items-center justify-center">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#BBB" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
        </div>
      );
    case "why-me":
      return (
        <div className="space-y-1">
          <div className="h-1.5 w-14 bg-[#1A1A1A]/50 rounded-sm" />
          <div className="grid grid-cols-3 gap-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className="p-1 border border-[#E6E8F0] rounded-sm">
                <div className="w-2 h-2 rounded bg-[#F0EBFF] mb-0.5" />
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
          <div className="h-3 w-12 bg-[#6a18f1] rounded-sm mx-auto mt-1" />
        </div>
      );
    case "custom-form":
      return (
        <div className="space-y-1">
          {[0, 1, 2].map((i) => (
            <div key={i}>
              <div className="h-0.5 w-5 bg-[#999]/40 rounded-sm mb-0.5" />
              <div className="h-2.5 w-full bg-[#F8F9FC] border border-[#E6E8F0] rounded-sm" />
            </div>
          ))}
          <div className="h-2.5 w-8 bg-[#6a18f1] rounded-sm" />
        </div>
      );
    case "calendar-booking":
      return (
        <div className="text-center space-y-1">
          <div className="h-1.5 w-12 bg-[#1A1A1A]/50 rounded-sm mx-auto" />
          <div className="flex gap-0.5 justify-center flex-wrap">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-2 w-6 border border-[#E6E8F0] rounded-sm" />
            ))}
          </div>
        </div>
      );
    case "stats-counter":
      return (
        <div className="grid grid-cols-4 gap-1 text-center">
          {["50+", "98%", "8", "24h"].map((v) => (
            <div key={v}>
              <div className="text-[6px] font-bold text-[#6a18f1]">{v}</div>
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
            <div className="flex-1 h-2.5 bg-[#F8F9FC] border border-[#E6E8F0] rounded-sm" />
            <div className="h-2.5 w-6 bg-[#6a18f1] rounded-sm" />
          </div>
        </div>
      );
  }
}

const BlockThumbnail = memo(BlockThumbnailInner);
export default BlockThumbnail;
