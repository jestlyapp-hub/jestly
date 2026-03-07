"use client";
import { memo } from "react";
import type { FooterMultiColumnBlockContent } from "@/types";

function FooterMultiColumnBlockPreviewInner({ content }: { content: FooterMultiColumnBlockContent }) {
  const columns = content.columns?.length ? content.columns : [
    { title: "Produit", links: [{ label: "Fonctionnalites" }, { label: "Tarifs" }, { label: "FAQ" }] },
    { title: "Entreprise", links: [{ label: "A propos" }, { label: "Blog" }, { label: "Carrieres" }] },
    { title: "Legal", links: [{ label: "Mentions legales" }, { label: "CGV" }, { label: "Confidentialite" }] },
  ];

  const socials = content.socials || {};

  return (
    <footer
      className="py-16 px-6"
      style={{
        backgroundColor: "var(--site-surface, #F7F7F5)",
        borderTop: "1px solid var(--site-border, #E6E6E4)",
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Top section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">
          {/* Brand + description */}
          <div className="md:col-span-4">
            <h3
              className="text-lg font-bold mb-3"
              style={{ color: "var(--site-text, #1A1A1A)", fontFamily: "var(--site-heading-font, inherit)" }}
            >
              {content.siteName || "Mon Site"}
            </h3>
            {content.description && (
              <p className="text-sm leading-relaxed" style={{ color: "var(--site-muted, #666)" }}>
                {content.description}
              </p>
            )}
          </div>

          {/* Link columns */}
          <div className="md:col-span-8 grid grid-cols-3 gap-6">
            {columns.map((col, i) => (
              <div key={i}>
                <h4
                  className="text-sm font-semibold mb-4"
                  style={{ color: "var(--site-text, #1A1A1A)", fontFamily: "var(--site-heading-font, inherit)" }}
                >
                  {col.title}
                </h4>
                <ul className="space-y-2.5">
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <a
                        href={link.url || "#"}
                        className="text-sm hover:underline"
                        style={{ color: "var(--site-muted, #666)" }}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom section */}
        <div
          className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ borderTop: "1px solid var(--site-border, #E6E6E4)" }}
        >
          <p className="text-xs" style={{ color: "var(--site-muted, #666)" }}>
            {content.copyright || `\u00A9 ${new Date().getFullYear()} Tous droits reserves.`}
          </p>

          {content.contact && (
            <div className="flex items-center gap-4 text-xs" style={{ color: "var(--site-muted, #666)" }}>
              {content.contact.email && <span>{content.contact.email}</span>}
              {content.contact.phone && <span>{content.contact.phone}</span>}
            </div>
          )}

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
      </div>
    </footer>
  );
}

export default memo(FooterMultiColumnBlockPreviewInner);
