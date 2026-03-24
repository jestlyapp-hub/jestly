"use client";
import { memo, useState } from "react";
import type { FaqAccordionFullBlockContent } from "@/types";

function FaqAccordionFullBlockPreview({ content }: { content: FaqAccordionFullBlockContent }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <section className="py-16 px-6">
      <div className="max-w-3xl mx-auto">
        {content.title && (
          <h2
            className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-3"
            style={{ color: "var(--site-text, #191919)", fontFamily: "var(--site-heading-font, inherit)" }}
          >
            {content.title}
          </h2>
        )}
        {content.subtitle && (
          <p className="text-center text-[15px] mb-10 max-w-xl mx-auto" style={{ color: "var(--site-muted, #666)" }}>
            {content.subtitle}
          </p>
        )}

        <div className="space-y-3">
          {content.items.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="rounded-lg overflow-hidden"
                style={{
                  border: "1px solid var(--site-border, #E6E6E4)",
                  backgroundColor: isOpen ? "var(--site-surface, #F7F7F5)" : "transparent",
                }}
              >
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer"
                >
                  <span
                    className="text-[15px] font-medium"
                    style={{ color: "var(--site-text, #191919)" }}
                  >
                    {item.question}
                  </span>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--site-muted, #666)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="flex-shrink-0 ml-4 transition-transform duration-200"
                    style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {isOpen && (
                  <div className="px-5 pb-4">
                    <p className="text-[14px] leading-relaxed" style={{ color: "var(--site-muted, #666)" }}>
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default memo(FaqAccordionFullBlockPreview);
