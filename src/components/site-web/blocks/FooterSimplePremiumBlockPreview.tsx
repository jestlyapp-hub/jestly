"use client";
import { memo } from "react";
import type { FooterSimplePremiumBlockContent } from "@/types";

function FooterSimplePremiumBlockPreviewInner({ content }: { content: FooterSimplePremiumBlockContent }) {
  const links = content.links?.length ? content.links : [
    { label: "Accueil" },
    { label: "Services" },
    { label: "Portfolio" },
    { label: "Contact" },
  ];

  const socials = content.socials || {};

  return (
    <footer
      className="py-12 px-6"
      style={{
        backgroundColor: "var(--site-surface, #F7F7F5)",
        borderTop: "1px solid var(--site-border, #E6E6E4)",
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          {/* Brand */}
          <span
            className="text-lg font-bold"
            style={{ color: "var(--site-text, #1A1A1A)", fontFamily: "var(--site-heading-font, inherit)" }}
          >
            {content.siteName || "Mon Site"}
          </span>

          {/* Links */}
          <nav className="flex flex-wrap items-center gap-6">
            {links.map((link, i) => (
              <a
                key={i}
                href={link.url || "#"}
                className="text-sm hover:underline"
                style={{ color: "var(--site-muted, #666)" }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Socials */}
          {content.showSocials && Object.keys(socials).length > 0 && (
            <div className="flex items-center gap-4">
              {Object.entries(socials).map(([platform, url]) => (
                <a
                  key={platform}
                  href={url || "#"}
                  className="text-xs font-medium uppercase tracking-wide hover:underline"
                  style={{ color: "var(--site-muted, #666)" }}
                >
                  {platform}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Copyright */}
        <div className="text-center">
          <p className="text-xs" style={{ color: "var(--site-muted, #666)" }}>
            {content.copyright || `\u00A9 ${new Date().getFullYear()} Tous droits reserves.`}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default memo(FooterSimplePremiumBlockPreviewInner);
