"use client";

import { memo, useState } from "react";
import type { FaqAdvancedBlockContent } from "@/types";

function FaqAdvancedBlockPreviewInner({ content }: { content: FaqAdvancedBlockContent }) {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());
  const displayItems = content.items;

  const toggle = (i: number) => {
    setOpenItems((prev) => {
      const next = new Set(content.allowMultiple ? prev : []);
      if (prev.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <div className="py-4">
      {content.title && <h3 className="text-lg font-bold mb-4" style={{ color: "var(--site-text)" }}>{content.title}</h3>}
      <div className="space-y-2">
        {displayItems.map((item, i) => {
          const isOpen = openItems.has(i);
          return (
            <div key={i} className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--site-border, #E6E6E4)" }}>
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors"
                style={{ color: "var(--site-text)" }}
              >
                <span className="text-[13px] font-medium">{item.question}</span>
                <svg
                  width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  className={`transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {isOpen && (
                <div className="px-4 pb-3 text-[12px]" style={{ color: "var(--site-muted)" }}>{item.answer}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default memo(FaqAdvancedBlockPreviewInner);
