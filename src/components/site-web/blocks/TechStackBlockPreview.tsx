"use client";

import { memo } from "react";
import type { TechStackBlockContent } from "@/types";

function TechStackBlockPreviewInner({ content }: { content: TechStackBlockContent }) {
  return (
    <section className="py-20 px-8">
      <div className="max-w-5xl mx-auto">
        {/* Title + subtitle */}
        {(content.title || content.subtitle) && (
          <div className="text-center mb-14">
            {content.title && (
              <h2
                className="text-3xl font-bold tracking-tight mb-3"
                style={{ color: "var(--site-text)", fontFamily: "var(--site-heading-font)" }}
              >
                {content.title}
              </h2>
            )}
            {content.subtitle && (
              <p className="text-[15px] max-w-2xl mx-auto leading-relaxed" style={{ color: "var(--site-muted)" }}>
                {content.subtitle}
              </p>
            )}
          </div>
        )}

        {/* Categories */}
        <div className="space-y-12">
          {content.categories.map((cat, ci) => (
            <div key={ci}>
              {/* Category label */}
              <div className="flex items-center gap-3 mb-5">
                <span
                  className="text-[11px] font-semibold uppercase tracking-widest"
                  style={{ color: "var(--site-primary)" }}
                >
                  {cat.name}
                </span>
                <div className="flex-1 h-px" style={{ backgroundColor: "var(--site-border)" }} />
              </div>

              {/* Items grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {cat.items.map((item, ii) => (
                  <div
                    key={ii}
                    className="group flex items-start gap-3 p-4 rounded-xl transition-all duration-200"
                    style={{
                      backgroundColor: "var(--site-surface)",
                      border: "1px solid var(--site-border)",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = "var(--site-primary)";
                      e.currentTarget.style.boxShadow = "0 0 20px -8px var(--site-primary-light)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = "var(--site-border)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    {/* Icon circle */}
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-[13px] font-bold"
                      style={{
                        backgroundColor: "var(--site-primary-light)",
                        color: "var(--site-primary)",
                      }}
                    >
                      {item.icon ? (
                        <span className="text-[16px]">{item.icon}</span>
                      ) : (
                        item.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    {/* Text */}
                    <div className="min-w-0">
                      <div
                        className="text-[13px] font-semibold truncate"
                        style={{ color: "var(--site-text)" }}
                      >
                        {item.name}
                      </div>
                      {item.description && (
                        <div
                          className="text-[11px] mt-0.5 leading-snug line-clamp-2"
                          style={{ color: "var(--site-muted)" }}
                        >
                          {item.description}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(TechStackBlockPreviewInner);
