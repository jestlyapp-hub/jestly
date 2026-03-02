"use client";

import { memo } from "react";
import type { CalendarBookingBlockContent } from "@/types";
import { getButtonInlineStyle } from "@/lib/block-style-engine";

function CalendarBookingBlockPreviewInner({ content }: { content: CalendarBookingBlockContent }) {
  // If embedUrl is set, show provider integration
  if (content.embedUrl) {
    if (content.openModal) {
      // Modal mode: show a CTA button
      return (
        <div className="py-6 text-center">
          <h3 className="text-lg font-bold mb-1">{content.title}</h3>
          <p className="text-[12px] opacity-60 mb-4">{content.description}</p>
          <button
            className="btn-styled px-5 py-2.5 text-[13px] font-semibold cursor-pointer"
            style={getButtonInlineStyle()}
            onClick={() => {/* mock: would open modal */}}
          >
            {content.ctaLabel || "Réserver"}
          </button>
          <p className="text-[10px] text-[#BBB] mt-2">Ouvre la fenêtre {content.provider === "cal" ? "Cal.com" : "Calendly"}</p>
        </div>
      );
    }

    // Inline mode: iframe placeholder
    return (
      <div className="py-6">
        <h3 className="text-lg font-bold mb-1 text-center">{content.title}</h3>
        <p className="text-[12px] opacity-60 mb-4 text-center">{content.description}</p>
        <div className="rounded-xl border-2 border-dashed border-[#E6E6E4] bg-[#F7F7F5] h-48 flex flex-col items-center justify-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-[var(--site-primary-light)] flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--site-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <span className="text-[12px] font-medium text-[var(--site-primary)]">{content.provider === "cal" ? "Cal.com" : "Calendly"}</span>
          <span className="text-[10px] text-[#999] max-w-xs text-center truncate px-4">{content.embedUrl}</span>
        </div>
      </div>
    );
  }

  // Fallback: manual slots
  return (
    <div className="py-4 text-center">
      <h3 className="text-lg font-bold mb-1">{content.title}</h3>
      <p className="text-[12px] opacity-60 mb-4">{content.description}</p>
      <div className="flex flex-wrap justify-center gap-2">
        {content.slots.map((slot, i) => (
          <span
            key={i}
            className="btn-styled px-3 py-1.5 text-[12px] font-medium cursor-pointer"
            style={getButtonInlineStyle()}
          >
            {slot}
          </span>
        ))}
      </div>
    </div>
  );
}

export default memo(CalendarBookingBlockPreviewInner);
