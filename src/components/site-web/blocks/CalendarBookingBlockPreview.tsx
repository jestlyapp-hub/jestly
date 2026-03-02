import { memo } from "react";
import type { CalendarBookingBlockContent } from "@/types";

function CalendarBookingBlockPreviewInner({ content }: { content: CalendarBookingBlockContent }) {
  return (
    <div className="py-4 text-center">
      <h3 className="text-lg font-bold text-[#1A1A1A] mb-1">{content.title}</h3>
      <p className="text-[12px] text-[#999] mb-4">{content.description}</p>
      <div className="flex flex-wrap justify-center gap-2">
        {content.slots.map((slot, i) => (
          <span
            key={i}
            className="px-3 py-1.5 rounded-lg border border-[#E6E8F0] text-[12px] font-medium text-[#666] hover:border-[#6a18f1] hover:text-[#6a18f1]"
          >
            {slot}
          </span>
        ))}
      </div>
    </div>
  );
}

export default memo(CalendarBookingBlockPreviewInner);
