"use client";

import { memo } from "react";
import type { ServicesPremiumBlockContent } from "@/types";

const ICON_MAP: Record<string, React.ReactNode> = {
  zap: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  shield: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  heart: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  star: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  clock: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  globe: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  palette: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r="1.5" /><circle cx="17.5" cy="10.5" r="1.5" /><circle cx="8.5" cy="7.5" r="1.5" /><circle cx="6.5" cy="12.5" r="1.5" /><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.5-.67 1.5-1.5 0-.38-.15-.74-.39-1.01-.24-.27-.39-.63-.39-1.01 0-.83.67-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-5.17-4.49-9-10-9z" />
    </svg>
  ),
  code: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  camera: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" />
    </svg>
  ),
  video: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  ),
  music: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
    </svg>
  ),
  layers: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
    </svg>
  ),
};

function getIcon(key: string): React.ReactNode {
  return ICON_MAP[key] || ICON_MAP.star;
}

function ServicesPremiumBlockPreviewInner({ content }: { content: ServicesPremiumBlockContent }) {
  const cols = content.columns === 4
    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
    : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3";

  return (
    <section
      className="relative py-16 sm:py-20 px-4 sm:px-8"
      style={{ background: "var(--site-surface, #0a0a0a)" }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        {(content.title || content.subtitle) && (
          <div className="text-center mb-14">
            {content.title && (
              <h2
                className="text-3xl sm:text-4xl font-bold mb-4"
                style={{
                  color: "var(--site-text, #fafafa)",
                  fontFamily: "var(--site-heading-font, inherit)",
                }}
              >
                {content.title}
              </h2>
            )}
            {content.subtitle && (
              <p
                className="text-base max-w-2xl mx-auto leading-relaxed"
                style={{ color: "var(--site-muted, #a1a1a1)" }}
              >
                {content.subtitle}
              </p>
            )}
          </div>
        )}

        {/* Cards grid */}
        <div className={`grid ${cols} gap-5`}>
          {content.services.map((service, i) => (
            <div
              key={i}
              className="group relative rounded-xl p-6 transition-all duration-300"
              style={{
                background: "var(--site-surface, #0a0a0a)",
                border: "1px solid var(--site-border, #262626)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "color-mix(in srgb, var(--site-primary) 50%, var(--site-border, #262626))";
                e.currentTarget.style.boxShadow = "0 0 30px color-mix(in srgb, var(--site-primary) 10%, transparent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--site-border, #262626)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Icon */}
              <div
                className="w-11 h-11 rounded-lg flex items-center justify-center mb-5"
                style={{
                  background: "var(--site-primary-light, rgba(79,70,229,0.1))",
                  color: "var(--site-primary)",
                  boxShadow: "0 0 20px color-mix(in srgb, var(--site-primary) 15%, transparent)",
                }}
              >
                {getIcon(service.icon)}
              </div>

              {/* Title */}
              <h3
                className="text-[15px] font-semibold mb-2"
                style={{ color: "var(--site-text, #fafafa)" }}
              >
                {service.title}
              </h3>

              {/* Description */}
              <p
                className="text-[13px] leading-relaxed mb-4"
                style={{ color: "var(--site-muted, #a1a1a1)" }}
              >
                {service.description}
              </p>

              {/* Features */}
              {service.features && service.features.length > 0 && (
                <ul className="space-y-1.5">
                  {service.features.map((feat, j) => (
                    <li
                      key={j}
                      className="flex items-center gap-2 text-[12px]"
                      style={{ color: "var(--site-muted, #a1a1a1)" }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--site-primary)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="shrink-0"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {feat}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(ServicesPremiumBlockPreviewInner);
