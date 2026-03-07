"use client";

import { memo } from "react";
import type { BeforeAfterProBlockContent } from "@/types";

function BeforeAfterProBlockPreviewInner({ content }: { content: BeforeAfterProBlockContent }) {
  const isSideBySide = content.layout === "side-by-side";

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

        {/* Items */}
        <div className="space-y-10">
          {content.items.map((item, i) => (
            <div key={i}>
              {isSideBySide ? (
                /* ─── Side by side layout ─── */
                <div
                  className="rounded-xl overflow-hidden"
                  style={{
                    backgroundColor: "var(--site-surface)",
                    border: "1px solid var(--site-border)",
                  }}
                >
                  <div className="grid grid-cols-2">
                    {/* Before */}
                    <div className="relative" style={{ borderRight: "1px solid var(--site-border)" }}>
                      <div className="aspect-[4/3] relative overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {item.beforeImageUrl && (
                          <img
                            src={item.beforeImageUrl}
                            alt={`${item.label} - Avant`}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        )}
                        {/* Subtle dark overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      </div>
                      {/* Label badge */}
                      <div
                        className="absolute bottom-3 left-3 px-3 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider backdrop-blur-md"
                        style={{
                          backgroundColor: "rgba(0,0,0,0.5)",
                          color: "#fff",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        Avant
                      </div>
                    </div>

                    {/* After */}
                    <div className="relative">
                      <div className="aspect-[4/3] relative overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {item.afterImageUrl && (
                          <img
                            src={item.afterImageUrl}
                            alt={`${item.label} - Apres`}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      </div>
                      <div
                        className="absolute bottom-3 left-3 px-3 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider backdrop-blur-md"
                        style={{
                          backgroundColor: "var(--site-primary)",
                          color: "var(--btn-text, #fff)",
                          boxShadow: "0 0 16px var(--site-primary-light)",
                        }}
                      >
                        Apres
                      </div>
                    </div>
                  </div>

                  {/* Label bar */}
                  <div
                    className="px-5 py-3 flex items-center justify-between"
                    style={{ borderTop: "1px solid var(--site-border)" }}
                  >
                    <span className="text-[13px] font-medium" style={{ color: "var(--site-text)" }}>
                      {item.label}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--site-primary)" }} />
                      <span className="text-[11px]" style={{ color: "var(--site-muted)" }}>
                        Transformation
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* ─── Slider layout (static preview) ─── */
                <div
                  className="rounded-xl overflow-hidden"
                  style={{
                    backgroundColor: "var(--site-surface)",
                    border: "1px solid var(--site-border)",
                  }}
                >
                  <div className="relative aspect-[16/9] overflow-hidden">
                    {/* After image (full) */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {item.afterImageUrl && (
                      <img
                        src={item.afterImageUrl}
                        alt={`${item.label} - Apres`}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    )}

                    {/* Before image (left half, clipped) */}
                    <div className="absolute inset-0 w-1/2 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {item.beforeImageUrl && (
                        <img
                          src={item.beforeImageUrl}
                          alt={`${item.label} - Avant`}
                          className="absolute inset-0 w-[200%] h-full object-cover"
                          style={{ maxWidth: "none" }}
                        />
                      )}
                    </div>

                    {/* Divider line */}
                    <div
                      className="absolute top-0 bottom-0 left-1/2 w-[2px] -translate-x-1/2"
                      style={{
                        backgroundColor: "var(--site-primary)",
                        boxShadow: "0 0 12px var(--site-primary-light), 0 0 4px var(--site-primary)",
                      }}
                    />

                    {/* Divider handle */}
                    <div
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md"
                      style={{
                        backgroundColor: "var(--site-primary)",
                        boxShadow: "0 0 24px var(--site-primary-light)",
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: "-4px" }}>
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>

                    {/* Labels */}
                    <div
                      className="absolute bottom-3 left-3 px-3 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider backdrop-blur-md"
                      style={{
                        backgroundColor: "rgba(0,0,0,0.5)",
                        color: "#fff",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      Avant
                    </div>
                    <div
                      className="absolute bottom-3 right-3 px-3 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider backdrop-blur-md"
                      style={{
                        backgroundColor: "var(--site-primary)",
                        color: "#fff",
                        boxShadow: "0 0 16px var(--site-primary-light)",
                      }}
                    >
                      Apres
                    </div>
                  </div>

                  {/* Label bar */}
                  <div
                    className="px-5 py-3 flex items-center justify-between"
                    style={{ borderTop: "1px solid var(--site-border)" }}
                  >
                    <span className="text-[13px] font-medium" style={{ color: "var(--site-text)" }}>
                      {item.label}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--site-primary)" }} />
                      <span className="text-[11px]" style={{ color: "var(--site-muted)" }}>
                        Glisser pour comparer
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(BeforeAfterProBlockPreviewInner);
