"use client";
import { memo } from "react";
import type { Faq2ColumnBlockContent } from "@/types";

function Faq2ColumnBlockPreview({ content }: { content: Faq2ColumnBlockContent }) {
  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        {content.title && (
          <h2
            className="text-3xl font-bold text-center mb-3"
            style={{ color: "var(--site-text, #191919)", fontFamily: "var(--site-heading-font, inherit)" }}
          >
            {content.title}
          </h2>
        )}
        {content.subtitle && (
          <p className="text-center text-[15px] mb-12 max-w-2xl mx-auto" style={{ color: "var(--site-muted, #666)" }}>
            {content.subtitle}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          {content.items.map((item, i) => (
            <div key={i}>
              <h3
                className="text-[15px] font-semibold mb-2"
                style={{ color: "var(--site-text, #191919)", fontFamily: "var(--site-heading-font, inherit)" }}
              >
                {item.question}
              </h3>
              <p className="text-[14px] leading-relaxed" style={{ color: "var(--site-muted, #666)" }}>
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(Faq2ColumnBlockPreview);
