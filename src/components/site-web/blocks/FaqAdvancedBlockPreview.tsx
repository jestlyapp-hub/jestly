"use client";

import { memo, useState } from "react";
import type { FaqAdvancedBlockContent } from "@/types";
import { getWorkspaceFaq } from "@/lib/mock-data";

function FaqAdvancedBlockPreviewInner({ content }: { content: FaqAdvancedBlockContent }) {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());
  const displayItems = content.useGlobal ? getWorkspaceFaq() : content.items;

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
      {content.title && <h3 className="text-lg font-bold mb-4">{content.title}</h3>}
      <div className="space-y-2">
        {displayItems.map((item, i) => {
          const isOpen = openItems.has(i);
          return (
            <div key={i} className="rounded-lg border border-[#E6E6E4] overflow-hidden">
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#FBFBFA] transition-colors"
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
                <div className="px-4 pb-3 text-[12px] opacity-60">{item.answer}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default memo(FaqAdvancedBlockPreviewInner);
