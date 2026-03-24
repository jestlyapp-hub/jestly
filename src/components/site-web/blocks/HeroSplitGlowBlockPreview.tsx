"use client";

import { memo } from "react";
import type { HeroSplitGlowBlockContent } from "@/types";
import SmartLinkButton from "@/components/site-public/SmartLinkButton";

function HeroSplitGlowBlockPreviewInner({ content }: { content: HeroSplitGlowBlockContent }) {
  const glow = content.glowColor || "var(--site-primary)";

  return (
    <section
      className="relative overflow-hidden py-12 sm:py-20 px-4 sm:px-8"
    >
      {/* Radial glow background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 70% 50%, ${glow}22 0%, transparent 70%)`,
        }}
      />
      <div
        className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[250px] h-[250px] sm:w-[500px] sm:h-[500px] rounded-full pointer-events-none blur-[120px] opacity-30"
        style={{ background: glow }}
      />

      <div className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8 sm:gap-16">
        {/* Left — Text */}
        <div className="flex-1 min-w-0">
          {content.badge && (
            <span
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-6"
              style={{
                background: `color-mix(in srgb, ${glow} 15%, transparent)`,
                color: glow,
                border: `1px solid color-mix(in srgb, ${glow} 25%, transparent)`,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: glow }}
              />
              {content.badge}
            </span>
          )}

          <h1
            className="text-4xl sm:text-5xl font-bold leading-[1.1] mb-5"
            style={{
              color: "var(--site-text, #fafafa)",
              fontFamily: "var(--site-heading-font, inherit)",
            }}
          >
            {content.title}
          </h1>

          <p
            className="text-base leading-relaxed mb-8 max-w-lg"
            style={{ color: "var(--site-muted, #a1a1a1)" }}
          >
            {content.subtitle}
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            <SmartLinkButton
              link={content.primaryBlockLink}
              label={content.primaryCtaLabel}
              className="inline-flex items-center justify-center text-[13px] font-semibold px-6 py-3 rounded-[var(--site-btn-radius,8px)] transition-all duration-200 hover:brightness-110 hover:shadow-lg"
              style={{
                background: "var(--site-primary)",
                color: "var(--site-text, #fff)",
                boxShadow: `0 0 20px color-mix(in srgb, ${glow} 35%, transparent)`,
              }}
            />

            {content.secondaryCtaLabel && (
              <SmartLinkButton
                link={content.secondaryBlockLink}
                label={content.secondaryCtaLabel}
                className="inline-flex items-center justify-center text-[13px] font-semibold px-6 py-3 rounded-[var(--site-btn-radius,8px)] transition-all duration-200 hover:brightness-125"
                style={{
                  background: "transparent",
                  color: "var(--site-text, #fafafa)",
                  border: "1px solid var(--site-border, #262626)",
                }}
              />
            )}
          </div>
        </div>

        {/* Right — Image or glowing placeholder */}
        <div className="flex-1 min-w-0">
          {content.imageUrl ? (
            <div className="relative">
              <div
                className="absolute -inset-4 rounded-2xl blur-[60px] opacity-20"
                style={{ background: glow }}
              />
              <img
                src={content.imageUrl}
                alt={content.title}
                className="relative w-full rounded-xl object-cover"
                style={{
                  border: "1px solid var(--site-border, #262626)",
                }}
              />
            </div>
          ) : (
            <div
              className="relative aspect-[4/3] rounded-xl flex items-center justify-center overflow-hidden"
              style={{
                background: `linear-gradient(135deg, color-mix(in srgb, ${glow} 8%, var(--site-surface, #0a0a0a)), var(--site-surface, #0a0a0a))`,
                border: "1px solid var(--site-border, #262626)",
              }}
            >
              {/* Decorative grid lines */}
              <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage:
                    "linear-gradient(var(--site-text, #fff) 1px, transparent 1px), linear-gradient(90deg, var(--site-text, #fff) 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }}
              />
              {/* Center glow orb */}
              <div
                className="w-24 h-24 rounded-full blur-[40px] opacity-40"
                style={{ background: glow }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={glow}
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-50"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default memo(HeroSplitGlowBlockPreviewInner);
