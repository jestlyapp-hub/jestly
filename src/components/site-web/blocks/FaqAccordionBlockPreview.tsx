import { memo } from "react";
import type { FaqAccordionBlockContent } from "@/types";

function FaqAccordionBlockPreviewInner({ content }: { content: FaqAccordionBlockContent }) {
  return (
    <div className="py-4 space-y-2">
      {content.items.map((item, i) => (
        <div key={i} className="p-3 rounded-lg" style={{ border: "1px solid var(--site-border, #E6E6E4)" }}>
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium" style={{ color: "var(--site-text, #191919)" }}>{item.question}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--site-muted, #999)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
          <p className="text-[11px] mt-1.5" style={{ color: "var(--site-muted, #999)" }}>{item.answer}</p>
        </div>
      ))}
    </div>
  );
}

export default memo(FaqAccordionBlockPreviewInner);
