"use client";

import type { Site, SitePage } from "@/types";
import BlockPreview from "@/components/site-web/blocks/BlockPreview";
import { resolvePageSlug } from "@/lib/site-utils";

interface SiteRendererProps {
  site: Site;
  page: SitePage;
}

function SiteNav({ site, currentSlug }: { site: Site; currentSlug: string }) {
  const nav = site.nav;
  if (!nav) return null;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-[#EFEFEF]">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Site name */}
        <a href="/" className="text-[16px] font-bold text-[#191919] tracking-tight">
          {site.settings.name}
        </a>

        {/* Links */}
        <div className="hidden md:flex items-center gap-6">
          {nav.links.map((link, i) => {
            const href = link.pageId ? resolvePageSlug(site, link.pageId) : "#";
            const isActive = href === currentSlug;
            return (
              <a
                key={i}
                href={href}
                className={`text-[13px] font-medium transition-colors ${
                  isActive ? "text-[#191919]" : "text-[#5A5A58] hover:text-[#191919]"
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </div>

        {/* CTA */}
        {nav.showCta && nav.ctaLabel && (
          <a
            href={nav.ctaLink?.value ? resolvePageSlug(site, nav.ctaLink.value) : "#"}
            className="text-[13px] font-semibold px-4 py-2 rounded-md text-white transition-colors"
            style={{ backgroundColor: site.theme.primaryColor }}
          >
            {nav.ctaLabel}
          </a>
        )}
      </div>
    </nav>
  );
}

function SiteFooter({ site }: { site: Site }) {
  const footer = site.footer;
  if (!footer) return null;

  return (
    <footer className="bg-[#F7F7F5] border-t border-[#E6E6E4] py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Links */}
          <div className="flex items-center gap-6">
            {footer.links.map((link, i) => {
              const href = link.pageId ? resolvePageSlug(site, link.pageId) : "#";
              return (
                <a
                  key={i}
                  href={href}
                  className="text-[13px] text-[#5A5A58] hover:text-[#191919] transition-colors"
                >
                  {link.label}
                </a>
              );
            })}
          </div>

          {/* Socials */}
          {footer.showSocials && site.settings.socials && (
            <div className="flex items-center gap-4">
              {site.settings.socials.instagram && (
                <a href={site.settings.socials.instagram} target="_blank" rel="noopener noreferrer" className="text-[#8A8A88] hover:text-[#191919] transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <circle cx="12" cy="12" r="5" />
                    <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
                  </svg>
                </a>
              )}
              {site.settings.socials.twitter && (
                <a href={site.settings.socials.twitter} target="_blank" rel="noopener noreferrer" className="text-[#8A8A88] hover:text-[#191919] transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                  </svg>
                </a>
              )}
              {site.settings.socials.linkedin && (
                <a href={site.settings.socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-[#8A8A88] hover:text-[#191919] transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </a>
              )}
            </div>
          )}
        </div>

        {/* Copyright */}
        {footer.copyright && (
          <div className="mt-8 pt-6 border-t border-[#E6E6E4]">
            <p className="text-[12px] text-[#8A8A88] text-center">{footer.copyright}</p>
          </div>
        )}
      </div>
    </footer>
  );
}

export default function SiteRenderer({ site, page }: SiteRendererProps) {
  const visibleBlocks = page.blocks.filter((b) => b.visible);

  return (
    <div className="min-h-screen flex flex-col bg-white" style={{ fontFamily: site.theme.fontFamily }}>
      <SiteNav site={site} currentSlug={page.slug} />

      <main className="flex-1">
        {visibleBlocks.map((block) => (
          <BlockPreview key={block.id} block={block} />
        ))}
      </main>

      <SiteFooter site={site} />
    </div>
  );
}
