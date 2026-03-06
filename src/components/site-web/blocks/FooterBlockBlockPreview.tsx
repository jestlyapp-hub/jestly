"use client";

import { memo } from "react";
import type { FooterBlockContent } from "@/types";

function FooterBlockBlockPreviewInner({ content }: { content: FooterBlockContent }) {
  const socials = content.socials || {};
  const hasSocials = content.showSocials && Object.values(socials).some(Boolean);

  return (
    <footer
      className="py-12 sm:py-16 px-4 sm:px-8"
      style={{ backgroundColor: "var(--site-surface)", color: "var(--site-muted)" }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Top section: brand + columns */}
        <div className="flex flex-col md:flex-row gap-8 sm:gap-12">
          {/* Brand column */}
          <div className="space-y-4 md:flex-[2]">
            <h3
              className="text-xl font-bold tracking-tight"
              style={{ color: "var(--site-text)", fontFamily: "var(--site-heading-font)" }}
            >
              {content.siteName}
            </h3>
            {content.description && (
              <p className="text-sm leading-relaxed max-w-xs" style={{ color: "var(--site-muted)" }}>
                {content.description}
              </p>
            )}
            {/* Social icons in brand column */}
            {hasSocials && (
              <div className="flex items-center gap-3 pt-2">
                {socials.instagram && (
                  <a href={socials.instagram} target="_blank" rel="noopener noreferrer" className="group">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="transition-colors duration-200" style={{ color: "var(--site-muted)" }} onMouseEnter={e => (e.currentTarget.style.color = "var(--site-text)")} onMouseLeave={e => (e.currentTarget.style.color = "var(--site-muted)")}>
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                  </a>
                )}
                {socials.twitter && (
                  <a href={socials.twitter} target="_blank" rel="noopener noreferrer">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="transition-colors duration-200" style={{ color: "var(--site-muted)" }} onMouseEnter={e => (e.currentTarget.style.color = "var(--site-text)")} onMouseLeave={e => (e.currentTarget.style.color = "var(--site-muted)")}>
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                    </svg>
                  </a>
                )}
                {socials.linkedin && (
                  <a href={socials.linkedin} target="_blank" rel="noopener noreferrer">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="transition-colors duration-200" style={{ color: "var(--site-muted)" }} onMouseEnter={e => (e.currentTarget.style.color = "var(--site-text)")} onMouseLeave={e => (e.currentTarget.style.color = "var(--site-muted)")}>
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                      <rect x="2" y="9" width="4" height="12" />
                      <circle cx="4" cy="4" r="2" />
                    </svg>
                  </a>
                )}
                {socials.youtube && (
                  <a href={socials.youtube} target="_blank" rel="noopener noreferrer">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="transition-colors duration-200" style={{ color: "var(--site-muted)" }} onMouseEnter={e => (e.currentTarget.style.color = "var(--site-text)")} onMouseLeave={e => (e.currentTarget.style.color = "var(--site-muted)")}>
                      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.13C5.12 19.56 12 19.56 12 19.56s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.43z" />
                      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
                    </svg>
                  </a>
                )}
                {socials.github && (
                  <a href={socials.github} target="_blank" rel="noopener noreferrer">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="transition-colors duration-200" style={{ color: "var(--site-muted)" }} onMouseEnter={e => (e.currentTarget.style.color = "var(--site-text)")} onMouseLeave={e => (e.currentTarget.style.color = "var(--site-muted)")}>
                      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Link columns */}
          {content.columns.map((col, i) => (
            <div key={i} className="space-y-4 md:flex-1">
              <h4
                className="text-[11px] font-semibold uppercase tracking-widest"
                style={{ color: "var(--site-muted)" }}
              >
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link, j) => (
                  <li key={j}>
                    {link.url ? (
                      <a
                        href={link.url}
                        className="text-[13px] transition-colors duration-200"
                        style={{ color: "var(--site-muted)" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "var(--site-text)")}
                        onMouseLeave={e => (e.currentTarget.style.color = "var(--site-muted)")}
                      >
                        {link.label}
                      </a>
                    ) : (
                      <span className="text-[13px]" style={{ color: "var(--site-muted)" }}>
                        {link.label}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Separator */}
        <div
          className="mt-12 mb-6"
          style={{ borderTop: "1px solid var(--site-border)" }}
        />

        {/* Bottom bar */}
        <div className="flex items-center justify-between">
          <p className="text-[12px]" style={{ color: "var(--site-muted)" }}>
            {content.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default memo(FooterBlockBlockPreviewInner);
