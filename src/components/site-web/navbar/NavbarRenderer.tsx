"use client";

import { useState, useRef, useEffect } from "react";
import type { NavConfig, NavLink, NavSocialLink } from "@/types";

// ═══════════════════════════════════════════════
// NAVBAR RENDERER — 8 premium variants
// All variants respect user config via NavWrapper
// ═══════════════════════════════════════════════

interface NavbarProps {
  nav: NavConfig;
  siteName: string;
  logoUrl?: string;
  currentSlug?: string;
  resolveHref: (link: NavLink) => string;
  isBuilder?: boolean;
}

// ─── Shared helpers ───

function genId() {
  return Math.random().toString(36).slice(2, 9);
}

export function defaultNavConfig(): NavConfig {
  return {
    variant: "classic-floating",
    links: [
      { id: genId(), label: "Accueil" },
      { id: genId(), label: "Services" },
      { id: genId(), label: "Portfolio" },
      { id: genId(), label: "Contact" },
    ],
    showCta: true,
    ctaLabel: "Commencer",
    sticky: true,
    bgMode: "blur",
    showBorder: true,
    showShadow: false,
    density: "default",
    containerWidth: "boxed",
  };
}

const heightMap = { compact: "h-14", default: "h-16", spacious: "h-20" };
const containerMap = {
  full: "max-w-full px-6",
  boxed: "max-w-6xl mx-auto px-6",
  narrow: "max-w-4xl mx-auto px-6",
};

function NavLogo({ siteName, logoUrl }: { siteName: string; logoUrl?: string }) {
  if (logoUrl) {
    return <img src={logoUrl} alt={siteName} className="h-7 w-auto object-contain" />;
  }
  return (
    <span className="text-[15px] font-bold tracking-tight" style={{ color: "var(--site-text, #1A1A1A)" }}>
      {siteName}
    </span>
  );
}

// ─── Social Icons ───

const socialIcons: Record<string, (p: { size?: number }) => React.ReactNode> = {
  instagram: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" /><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  ),
  twitter: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
  ),
  linkedin: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" />
    </svg>
  ),
  youtube: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
    </svg>
  ),
  tiktok: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78 2.92 2.92 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.57 6.33 6.33 0 0 0 9.37 22a6.33 6.33 0 0 0 6.33-6.33V9.17a8.16 8.16 0 0 0 3.89.98V6.69z" /></svg>
  ),
  github: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" /></svg>
  ),
  dribbble: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M19.13 5.09C15.22 9.14 10 10.44 2.25 10.94" /><path d="M21.75 12.84c-6.62-1.41-12.14 1-16.38 6.32" /><path d="M8.56 2.75c4.37 6 6.03 11.86 6.69 19.25" /></svg>
  ),
  behance: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M6.938 4.503c.702 0 1.34.06 1.92.188.577.13 1.07.33 1.485.61.41.28.733.65.96 1.12.225.47.34 1.05.34 1.73 0 .74-.17 1.36-.507 1.86-.338.5-.837.9-1.502 1.22.906.26 1.576.72 2.022 1.37.448.66.67 1.45.67 2.36 0 .75-.13 1.39-.41 1.93-.28.55-.67 1-1.16 1.35-.48.348-1.05.6-1.67.767-.62.16-1.26.24-1.92.24H0V4.51h6.938v-.007zM6.545 10.16c.585 0 1.07-.138 1.46-.42.39-.28.58-.71.58-1.28 0-.32-.06-.58-.17-.78-.11-.2-.27-.36-.47-.48-.2-.12-.43-.2-.69-.24-.26-.04-.54-.06-.84-.06H3.53v3.26h3.015zm.185 5.24c.34 0 .66-.04.96-.12.3-.08.56-.2.79-.36.22-.16.4-.36.53-.6.13-.24.19-.54.19-.9 0-.71-.23-1.23-.67-1.56-.44-.33-1.01-.5-1.72-.5H3.53v4.04h3.2zM15.834 4.14h5.54v1.38h-5.54V4.14zm5.014 10.12c.245.4.4.82.45 1.26h-5.88c.04-.64.19-1.17.45-1.6.27-.43.6-.78.99-1.04.39-.27.83-.46 1.32-.58.49-.12.98-.18 1.49-.18.44 0 .87.06 1.28.18.41.12.78.31 1.1.57.32.26.58.59.78 1l.01.01-.01-.01v-.01zm-4.56-3.62c-.56 0-1.1.07-1.6.22-.5.14-.96.37-1.37.68-.41.3-.74.7-.99 1.18-.25.48-.4 1.06-.43 1.73h-.04v.04c0 .74.1 1.42.29 2.04.19.62.48 1.16.87 1.6.39.45.87.8 1.44 1.05.57.25 1.23.37 1.98.37.94 0 1.73-.2 2.37-.6.64-.4 1.13-.98 1.49-1.73l-1.6-.83c-.16.36-.41.67-.73.93-.33.25-.74.38-1.24.38-.68 0-1.2-.2-1.56-.6-.37-.4-.58-.96-.63-1.68h6.16c.04-.78-.03-1.53-.2-2.24-.18-.71-.46-1.33-.86-1.86-.39-.53-.88-.95-1.48-1.26-.59-.31-1.3-.47-2.12-.47h.2v-.01zm-2.41 3.83c.05-.55.22-1.01.51-1.36.3-.36.71-.62 1.24-.77.52-.15 1.08-.15 1.6 0 .52.15.93.41 1.22.77.3.36.47.8.52 1.36h-5.1z" /></svg>
  ),
};

function SocialIcons({ socials, className }: { socials: NavSocialLink[]; className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className || ""}`}>
      {socials.map((s, i) => {
        const Icon = socialIcons[s.network];
        if (!Icon) return null;
        return (
          <a
            key={i}
            href={s.url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-50 hover:opacity-100 transition-opacity"
            style={{ color: "var(--site-muted, #666)" }}
          >
            <Icon size={15} />
          </a>
        );
      })}
    </div>
  );
}

// ─── Dropdown component ───

function NavDropdown({ item, resolveHref, isBuilder }: { item: NavLink; resolveHref: (l: NavLink) => string; isBuilder?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-[13px] font-medium transition-colors"
        style={{ color: "var(--site-muted, #666)" }}
        onMouseEnter={e => (e.currentTarget.style.color = "var(--site-text, #1A1A1A)")}
        onMouseLeave={e => { if (!open) e.currentTarget.style.color = "var(--site-muted, #666)"; }}
      >
        {item.label}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${open ? "rotate-180" : ""}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div
          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 min-w-[200px] rounded-xl border py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
          style={{
            backgroundColor: "var(--site-bg, #fff)",
            borderColor: "var(--site-border, #E6E6E4)",
            boxShadow: "0 8px 30px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          {item.children?.map((child, j) => {
            const isExt = child.url && !child.pageId && !child.blockId;
            return (
              <a
                key={j}
                href={isBuilder ? undefined : resolveHref(child)}
                onClick={e => { if (isBuilder) e.preventDefault(); setOpen(false); }}
                target={isExt && child.openNewTab ? "_blank" : undefined}
                rel={isExt && child.openNewTab ? "noopener noreferrer" : undefined}
                className="block px-4 py-2 text-[13px] font-medium transition-colors"
                style={{ color: "var(--site-muted, #666)" }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = "var(--site-text, #1A1A1A)";
                  e.currentTarget.style.backgroundColor = "var(--site-surface, #F7F7F5)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = "var(--site-muted, #666)";
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                {child.label}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Mobile menu ───

function MobileMenu({
  nav, siteName, resolveHref, isBuilder,
}: { nav: NavConfig; siteName: string; resolveHref: (l: NavLink) => string; isBuilder?: boolean }) {
  const [open, setOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden p-2 transition-colors"
        style={{ color: "var(--site-muted, #666)" }}
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" /></svg>
        )}
      </button>
      {open && (
        <div
          className="fixed inset-x-0 top-[calc(var(--nav-h,64px))] bottom-0 z-40 md:hidden overflow-y-auto"
          style={{ backgroundColor: "var(--site-bg, #fff)" }}
        >
          <div className="px-6 py-6 space-y-1">
            {nav.links.map((link) => (
              <div key={link.id || link.label}>
                {link.children && link.children.length > 0 ? (
                  <>
                    <button
                      onClick={() => setExpandedId(expandedId === (link.id || link.label) ? null : (link.id || link.label))}
                      className="w-full flex items-center justify-between py-3 text-[15px] font-medium border-b"
                      style={{ color: "var(--site-text, #1A1A1A)", borderColor: "var(--site-border, #E6E6E4)" }}
                    >
                      {link.label}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={`transition-transform ${expandedId === (link.id || link.label) ? "rotate-180" : ""}`}>
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                    {expandedId === (link.id || link.label) && (
                      <div className="pl-4 py-1 space-y-0.5">
                        {link.children.map((child, j) => (
                          <a
                            key={j}
                            href={isBuilder ? undefined : resolveHref(child)}
                            onClick={e => { if (isBuilder) e.preventDefault(); setOpen(false); }}
                            className="block py-2.5 text-[14px] font-medium"
                            style={{ color: "var(--site-muted, #666)" }}
                          >
                            {child.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <a
                    href={isBuilder ? undefined : resolveHref(link)}
                    onClick={e => { if (isBuilder) e.preventDefault(); setOpen(false); }}
                    className="block py-3 text-[15px] font-medium border-b"
                    style={{ color: "var(--site-text, #1A1A1A)", borderColor: "var(--site-border, #E6E6E4)" }}
                  >
                    {link.label}
                  </a>
                )}
              </div>
            ))}

            {/* CTAs in mobile */}
            <div className="pt-4 space-y-2">
              {nav.showSecondaryCta && nav.secondaryCtaLabel && (
                <a
                  href={isBuilder ? undefined : resolveCtaHref(nav, false, resolveHref)}
                  onClick={() => setOpen(false)}
                  className="block text-center text-[14px] font-semibold py-3 rounded-lg border transition-colors"
                  style={{ color: "var(--site-text, #1A1A1A)", borderColor: "var(--site-border, #E6E6E4)" }}
                >
                  {nav.secondaryCtaLabel}
                </a>
              )}
              {nav.showCta && nav.ctaLabel && (
                <a
                  href={isBuilder ? undefined : resolveCtaHref(nav, true, resolveHref)}
                  onClick={() => setOpen(false)}
                  className="block text-center text-[14px] font-semibold py-3 rounded-lg transition-colors"
                  style={{
                    backgroundColor: nav.ctaBgColor || "var(--btn-bg, var(--site-primary, #4F46E5))",
                    color: nav.ctaTextColor || "var(--btn-text, #fff)",
                    borderRadius: nav.ctaBorderRadius || "var(--site-btn-radius, 8px)",
                  }}
                >
                  {nav.ctaLabel}
                </a>
              )}
            </div>

            {/* Socials in mobile */}
            {nav.showSocials && nav.socials && nav.socials.length > 0 && (
              <div className="pt-4 flex justify-center">
                <SocialIcons socials={nav.socials} />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ─── NavLink renderer (flat or dropdown) ───

function NavItem({ item, resolveHref, isBuilder }: { item: NavLink; resolveHref: (l: NavLink) => string; isBuilder?: boolean }) {
  if (item.children && item.children.length > 0) {
    return <NavDropdown item={item} resolveHref={resolveHref} isBuilder={isBuilder} />;
  }
  const isExternal = item.url && !item.pageId && !item.blockId;
  return (
    <a
      href={isBuilder ? undefined : resolveHref(item)}
      onClick={e => { if (isBuilder) e.preventDefault(); }}
      target={isExternal && item.openNewTab ? "_blank" : undefined}
      rel={isExternal && item.openNewTab ? "noopener noreferrer" : undefined}
      className="text-[13px] font-medium transition-colors"
      style={{ color: "var(--site-muted, #666)" }}
      onMouseEnter={e => (e.currentTarget.style.color = "var(--site-text, #1A1A1A)")}
      onMouseLeave={e => (e.currentTarget.style.color = "var(--site-muted, #666)")}
    >
      {item.label}
    </a>
  );
}

// ─── CTA href resolution ───

function resolveCtaHref(nav: NavConfig, isPrimary: boolean, resolveHref: (link: NavLink) => string): string {
  const destType = isPrimary ? nav.ctaDestinationType : nav.secondaryCtaDestinationType;
  const pageId = isPrimary ? nav.ctaPageId : nav.secondaryCtaPageId;
  const blockId = isPrimary ? nav.ctaBlockId : nav.secondaryCtaBlockId;
  const url = isPrimary ? nav.ctaUrl : nav.secondaryCtaUrl;

  if (!destType) return "#";

  // Build a NavLink-compatible object and reuse the same resolver
  return resolveHref({ label: "", destinationType: destType, pageId, blockId, url });
}

// ─── CTA Button (reads nav config for custom styles + destination) ───

function CtaButton({ label, isPrimary, nav, href }: { label: string; isPrimary?: boolean; nav?: NavConfig; href?: string }) {
  const base = "text-[13px] font-semibold px-5 py-2 transition-all";
  const style = isPrimary !== false
    ? (nav?.ctaStyle || "filled")
    : "outline";

  // Resolve target & rel for external links
  const isExternal = href && (href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:"));
  const openNewTab = isPrimary !== false ? nav?.ctaOpenNewTab : nav?.secondaryCtaOpenNewTab;
  const target = isExternal && openNewTab ? "_blank" : undefined;
  const rel = target ? "noopener noreferrer" : undefined;
  const resolvedHref = href || "#";

  const linkProps = { href: resolvedHref, target, rel };

  if (style === "filled") {
    return (
      <a {...linkProps} className={`${base} hover:opacity-90`} style={{
        backgroundColor: nav?.ctaBgColor || "var(--btn-bg, var(--site-primary, #4F46E5))",
        color: nav?.ctaTextColor || "var(--btn-text, #fff)",
        borderRadius: nav?.ctaBorderRadius || "var(--site-btn-radius, 8px)",
      }}>
        {label}
      </a>
    );
  }
  if (style === "outline") {
    return (
      <a {...linkProps} className={`${base} border hover:opacity-80`} style={{
        color: nav?.ctaBgColor || "var(--site-text, #1A1A1A)",
        borderColor: nav?.ctaBgColor || "var(--site-border, #E6E6E4)",
        borderRadius: nav?.ctaBorderRadius || "var(--site-btn-radius, 8px)",
      }}>
        {label}
      </a>
    );
  }
  if (style === "soft") {
    return (
      <a {...linkProps} className={`${base} hover:opacity-80`} style={{
        backgroundColor: nav?.ctaBgColor
          ? `color-mix(in srgb, ${nav.ctaBgColor} 15%, transparent)`
          : "var(--site-primary-light, #EEF2FF)",
        color: nav?.ctaBgColor || "var(--site-primary, #4F46E5)",
        borderRadius: nav?.ctaBorderRadius || "var(--site-btn-radius, 8px)",
      }}>
        {label}
      </a>
    );
  }
  // ghost
  return (
    <a {...linkProps} className={`${base} hover:opacity-70`} style={{
      color: nav?.ctaBgColor || "var(--site-primary, #4F46E5)",
    }}>
      {label}
    </a>
  );
}

// ═══════════════════════════════════════════════
// SHARED NAV WRAPPER (outer shell — sticky, bg, border, shadow)
// All 8 variants MUST use this for consistency
// ═══════════════════════════════════════════════

function NavWrapper({ nav, children, className }: { nav: NavConfig; children: React.ReactNode; className?: string }) {
  const hPx = nav.density === "compact" ? 56 : nav.density === "spacious" ? 80 : 64;

  let bgStyle: React.CSSProperties = {};
  if (nav.bgMode === "transparent") {
    bgStyle.backgroundColor = "transparent";
  } else if (nav.bgMode === "blur") {
    bgStyle.backgroundColor = "color-mix(in srgb, var(--site-bg, #fff) 85%, transparent)";
    bgStyle.backdropFilter = "blur(12px)";
    bgStyle.WebkitBackdropFilter = "blur(12px)";
  } else {
    bgStyle.backgroundColor = "var(--site-bg, #fff)";
  }

  return (
    <nav
      className={`${nav.sticky ? "sticky top-0" : "relative"} z-50 ${className || ""}`}
      style={{
        ...bgStyle,
        borderBottom: nav.showBorder ? "1px solid var(--site-border, #E6E6E4)" : "none",
        boxShadow: nav.showShadow ? "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)" : "none",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ["--nav-h" as any]: `${hPx}px`,
      }}
    >
      {children}
    </nav>
  );
}

// Container row inside NavWrapper
function NavContainer({ nav, children, className }: { nav: NavConfig; children: React.ReactNode; className?: string }) {
  const h = heightMap[nav.density || "default"];
  return (
    <div className={`${containerMap[nav.containerWidth || "boxed"]} ${h} flex items-center ${className || ""}`}>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════
// VARIANT 1 — Classic SaaS White Floating
// ═══════════════════════════════════════════════

function NavClassicFloating(props: NavbarProps) {
  const { nav, siteName, logoUrl, resolveHref, isBuilder } = props;
  return (
    <NavWrapper nav={nav} className="mx-4 mt-3 rounded-2xl">
      <NavContainer nav={nav}>
        <div className="flex items-center justify-between w-full">
          <NavLogo siteName={siteName} logoUrl={logoUrl} />
          <div className="hidden md:flex items-center gap-7">
            {nav.links.map(item => <NavItem key={item.id || item.label} item={item} resolveHref={resolveHref} isBuilder={isBuilder} />)}
          </div>
          <div className="flex items-center gap-3">
            {nav.showCta && nav.ctaLabel && (
              <div className="hidden md:block"><CtaButton label={nav.ctaLabel} nav={nav} href={resolveCtaHref(nav, true, resolveHref)} /></div>
            )}
            <MobileMenu nav={nav} siteName={siteName} resolveHref={resolveHref} isBuilder={isBuilder} />
          </div>
        </div>
      </NavContainer>
    </NavWrapper>
  );
}

// ═══════════════════════════════════════════════
// VARIANT 2 — Dark Premium Centered
// ═══════════════════════════════════════════════

function NavDarkPremium(props: NavbarProps) {
  const { nav, siteName, logoUrl, resolveHref, isBuilder } = props;
  return (
    <NavWrapper nav={nav}>
      <NavContainer nav={nav} className="justify-between">
        <NavLogo siteName={siteName} logoUrl={logoUrl} />
        <div className="hidden md:flex items-center gap-7">
          {nav.links.map(item => <NavItem key={item.id || item.label} item={item} resolveHref={resolveHref} isBuilder={isBuilder} />)}
        </div>
        <div className="flex items-center gap-3">
          {nav.showCta && nav.ctaLabel && (
            <div className="hidden md:block"><CtaButton label={nav.ctaLabel} nav={nav} href={resolveCtaHref(nav, true, resolveHref)} /></div>
          )}
          <MobileMenu nav={nav} siteName={siteName} resolveHref={resolveHref} isBuilder={isBuilder} />
        </div>
      </NavContainer>
    </NavWrapper>
  );
}

// ═══════════════════════════════════════════════
// VARIANT 3 — Capsule Navigation
// ═══════════════════════════════════════════════

function NavCapsule(props: NavbarProps) {
  const { nav, siteName, logoUrl, resolveHref, isBuilder } = props;
  return (
    <NavWrapper nav={nav}>
      <NavContainer nav={nav}>
        <div className="flex items-center justify-between w-full">
          <NavLogo siteName={siteName} logoUrl={logoUrl} />

          {/* Capsule pill in center */}
          <div
            className="hidden md:flex items-center gap-1 px-1.5 py-1.5 rounded-full"
            style={{
              backgroundColor: "var(--site-surface, #F3F3F1)",
              border: "1px solid var(--site-border, #E6E6E4)",
            }}
          >
            {nav.links.map(item => {
              if (item.children && item.children.length > 0) {
                return <NavDropdown key={item.id || item.label} item={item} resolveHref={resolveHref} isBuilder={isBuilder} />;
              }
              return (
                <a
                  key={item.id || item.label}
                  href={isBuilder ? undefined : resolveHref(item)}
                  onClick={e => { if (isBuilder) e.preventDefault(); }}
                  className="text-[12px] font-medium px-3.5 py-1.5 rounded-full transition-all"
                  style={{ color: "var(--site-muted, #666)" }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = "var(--site-text, #1A1A1A)";
                    e.currentTarget.style.backgroundColor = "var(--site-bg, #fff)";
                    e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = "var(--site-muted, #666)";
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {item.label}
                </a>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            {nav.showCta && nav.ctaLabel && (
              <div className="hidden md:block"><CtaButton label={nav.ctaLabel} nav={nav} href={resolveCtaHref(nav, true, resolveHref)} /></div>
            )}
            <MobileMenu nav={nav} siteName={siteName} resolveHref={resolveHref} isBuilder={isBuilder} />
          </div>
        </div>
      </NavContainer>
    </NavWrapper>
  );
}

// ═══════════════════════════════════════════════
// VARIANT 4 — Brand-Heavy Creator
// ═══════════════════════════════════════════════

function NavBrandHeavy(props: NavbarProps) {
  const { nav, siteName, logoUrl, resolveHref, isBuilder } = props;
  return (
    <NavWrapper nav={nav}>
      <NavContainer nav={nav}>
        <div className="flex items-center justify-between w-full">
          {/* Larger brand presence */}
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img src={logoUrl} alt={siteName} className="h-9 w-auto" />
            ) : (
              <span className="text-lg font-extrabold tracking-tight" style={{ color: "var(--site-text, #1A1A1A)" }}>
                {siteName}
              </span>
            )}
            <div
              className="hidden sm:block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-widest"
              style={{
                backgroundColor: "var(--site-primary-light, #EEF2FF)",
                color: "var(--site-primary, #4F46E5)",
              }}
            >
              Studio
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6">
            {nav.links.map(item => <NavItem key={item.id || item.label} item={item} resolveHref={resolveHref} isBuilder={isBuilder} />)}
          </div>

          <div className="flex items-center gap-3">
            {nav.showSocials && nav.socials && nav.socials.length > 0 && (
              <div className="hidden lg:flex"><SocialIcons socials={nav.socials} /></div>
            )}
            {nav.showCta && nav.ctaLabel && (
              <div className="hidden md:block"><CtaButton label={nav.ctaLabel} nav={nav} href={resolveCtaHref(nav, true, resolveHref)} /></div>
            )}
            <MobileMenu nav={nav} siteName={siteName} resolveHref={resolveHref} isBuilder={isBuilder} />
          </div>
        </div>
      </NavContainer>
    </NavWrapper>
  );
}

// ═══════════════════════════════════════════════
// VARIANT 5 — Dual CTA / Sales-Oriented
// ═══════════════════════════════════════════════

function NavDualCta(props: NavbarProps) {
  const { nav, siteName, logoUrl, resolveHref, isBuilder } = props;
  return (
    <NavWrapper nav={nav}>
      <NavContainer nav={nav}>
        <div className="flex items-center justify-between w-full">
          <NavLogo siteName={siteName} logoUrl={logoUrl} />

          <div className="hidden md:flex items-center gap-7">
            {nav.links.map(item => <NavItem key={item.id || item.label} item={item} resolveHref={resolveHref} isBuilder={isBuilder} />)}
          </div>

          <div className="flex items-center gap-2">
            {nav.showSecondaryCta && nav.secondaryCtaLabel && (
              <div className="hidden md:block"><CtaButton label={nav.secondaryCtaLabel} isPrimary={false} nav={nav} href={resolveCtaHref(nav, false, resolveHref)} /></div>
            )}
            {nav.showCta && nav.ctaLabel && (
              <div className="hidden md:block"><CtaButton label={nav.ctaLabel} nav={nav} href={resolveCtaHref(nav, true, resolveHref)} /></div>
            )}
            <MobileMenu nav={nav} siteName={siteName} resolveHref={resolveHref} isBuilder={isBuilder} />
          </div>
        </div>
      </NavContainer>
    </NavWrapper>
  );
}

// ═══════════════════════════════════════════════
// VARIANT 6 — Dropdown-Rich / Resource
// ═══════════════════════════════════════════════

function NavDropdownRich(props: NavbarProps) {
  const { nav, siteName, logoUrl, resolveHref, isBuilder } = props;
  return (
    <NavWrapper nav={nav}>
      <NavContainer nav={nav}>
        <div className="flex items-center justify-between w-full">
          <NavLogo siteName={siteName} logoUrl={logoUrl} />

          <div className="hidden md:flex items-center gap-6">
            {nav.links.map(item => <NavItem key={item.id || item.label} item={item} resolveHref={resolveHref} isBuilder={isBuilder} />)}
          </div>

          <div className="flex items-center gap-3">
            {nav.showSocials && nav.socials && nav.socials.length > 0 && (
              <div className="hidden lg:flex"><SocialIcons socials={nav.socials} /></div>
            )}
            {nav.showSecondaryCta && nav.secondaryCtaLabel && (
              <div className="hidden md:block"><CtaButton label={nav.secondaryCtaLabel} isPrimary={false} nav={nav} href={resolveCtaHref(nav, false, resolveHref)} /></div>
            )}
            {nav.showCta && nav.ctaLabel && (
              <div className="hidden md:block"><CtaButton label={nav.ctaLabel} nav={nav} href={resolveCtaHref(nav, true, resolveHref)} /></div>
            )}
            <MobileMenu nav={nav} siteName={siteName} resolveHref={resolveHref} isBuilder={isBuilder} />
          </div>
        </div>
      </NavContainer>
    </NavWrapper>
  );
}

// ═══════════════════════════════════════════════
// VARIANT 7 — Creative Split
// ═══════════════════════════════════════════════

function NavCreativeSplit(props: NavbarProps) {
  const { nav, siteName, logoUrl, resolveHref, isBuilder } = props;
  const midpoint = Math.ceil(nav.links.length / 2);
  const leftLinks = nav.links.slice(0, midpoint);
  const rightLinks = nav.links.slice(midpoint);

  return (
    <NavWrapper nav={nav}>
      <NavContainer nav={nav}>
        {/* Left nav group */}
        <div className="hidden md:flex items-center gap-5 flex-1">
          {leftLinks.map(item => <NavItem key={item.id || item.label} item={item} resolveHref={resolveHref} isBuilder={isBuilder} />)}
        </div>

        {/* Center logo with decorative elements */}
        <div className="flex items-center gap-3">
          <div className="hidden md:block w-8 h-px" style={{ backgroundColor: "var(--site-border, #E6E6E4)" }} />
          {logoUrl ? (
            <img src={logoUrl} alt={siteName} className="h-8 w-auto" />
          ) : (
            <span className="text-base font-black tracking-tighter" style={{ color: "var(--site-text, #1A1A1A)" }}>
              {siteName}
            </span>
          )}
          <div className="hidden md:block w-8 h-px" style={{ backgroundColor: "var(--site-border, #E6E6E4)" }} />
        </div>

        {/* Right nav group */}
        <div className="hidden md:flex items-center gap-5 flex-1 justify-end">
          {rightLinks.map(item => <NavItem key={item.id || item.label} item={item} resolveHref={resolveHref} isBuilder={isBuilder} />)}
          {nav.showCta && nav.ctaLabel && <CtaButton label={nav.ctaLabel} nav={nav} href={resolveCtaHref(nav, true, resolveHref)} />}
        </div>

        <div className="md:hidden ml-auto">
          <MobileMenu nav={nav} siteName={siteName} resolveHref={resolveHref} isBuilder={isBuilder} />
        </div>
      </NavContainer>
      {/* Subtle gradient line under nav */}
      <div className="h-px w-full" style={{
        background: `linear-gradient(90deg, transparent 0%, var(--site-primary, #4F46E5) 50%, transparent 100%)`,
        opacity: 0.2,
      }} />
    </NavWrapper>
  );
}

// ═══════════════════════════════════════════════
// VARIANT 8 — Signature High-End Original
// ═══════════════════════════════════════════════

function NavSignature(props: NavbarProps) {
  const { nav, siteName, logoUrl, resolveHref, isBuilder } = props;

  return (
    <NavWrapper nav={nav}>
      {/* Top micro-bar with socials or tagline */}
      <div
        className="h-8 flex items-center justify-between text-[10px] tracking-widest uppercase font-medium"
        style={{
          backgroundColor: "var(--site-surface, #F5F5F3)",
          color: "var(--site-muted, #999)",
          borderBottom: "1px solid var(--site-border, #E6E6E4)",
        }}
      >
        <div className={containerMap[nav.containerWidth || "boxed"] + " flex items-center justify-between w-full"}>
          <span>Portfolio &amp; Services</span>
          <div className="flex items-center gap-3">
            {nav.showSocials && nav.socials && nav.socials.length > 0 && (
              <SocialIcons socials={nav.socials} />
            )}
          </div>
        </div>
      </div>

      {/* Main nav row */}
      <NavContainer nav={nav} className="justify-between">
        {/* Logo with accent dot */}
        <div className="flex items-center gap-2">
          {logoUrl ? (
            <img src={logoUrl} alt={siteName} className="h-8 w-auto" />
          ) : (
            <>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--site-primary, #4F46E5)" }} />
              <span className="text-[15px] font-bold tracking-tight" style={{ color: "var(--site-text, #1A1A1A)" }}>
                {siteName}
              </span>
            </>
          )}
        </div>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-0.5">
          {nav.links.map(item => {
            if (item.children && item.children.length > 0) {
              return <NavDropdown key={item.id || item.label} item={item} resolveHref={resolveHref} isBuilder={isBuilder} />;
            }
            return (
              <a
                key={item.id || item.label}
                href={isBuilder ? undefined : resolveHref(item)}
                onClick={e => { if (isBuilder) e.preventDefault(); }}
                className="relative text-[12px] font-medium px-4 py-2 rounded-lg transition-all"
                style={{ color: "var(--site-muted, #666)" }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = "var(--site-text, #1A1A1A)";
                  e.currentTarget.style.backgroundColor = "var(--site-surface, #F7F7F5)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = "var(--site-muted, #666)";
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                {item.label}
              </a>
            );
          })}
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          {nav.showSecondaryCta && nav.secondaryCtaLabel && (
            <div className="hidden md:block"><CtaButton label={nav.secondaryCtaLabel} isPrimary={false} nav={nav} href={resolveCtaHref(nav, false, resolveHref)} /></div>
          )}
          {nav.showCta && nav.ctaLabel && (
            <div className="hidden md:block"><CtaButton label={nav.ctaLabel} nav={nav} href={resolveCtaHref(nav, true, resolveHref)} /></div>
          )}
          <MobileMenu nav={nav} siteName={siteName} resolveHref={resolveHref} isBuilder={isBuilder} />
        </div>
      </NavContainer>
    </NavWrapper>
  );
}

// ═══════════════════════════════════════════════
// MAIN RENDERER
// ═══════════════════════════════════════════════

const variantMap: Record<string, React.FC<NavbarProps>> = {
  "classic-floating": NavClassicFloating,
  "dark-premium": NavDarkPremium,
  "capsule": NavCapsule,
  "brand-heavy": NavBrandHeavy,
  "dual-cta": NavDualCta,
  "dropdown-rich": NavDropdownRich,
  "creative-split": NavCreativeSplit,
  "signature": NavSignature,
};

export default function NavbarRenderer({
  nav,
  siteName,
  logoUrl,
  currentSlug,
  resolveHref,
  isBuilder,
}: NavbarProps) {
  const Variant = variantMap[nav.variant || "classic-floating"] || NavClassicFloating;
  return <Variant nav={nav} siteName={siteName} logoUrl={logoUrl} currentSlug={currentSlug} resolveHref={resolveHref} isBuilder={isBuilder} />;
}

// ─── Variant metadata for editor ───

export const NAVBAR_VARIANTS = [
  { key: "classic-floating", name: "Classique Flottant", description: "Blanc, arrondi, ombre subtile — ideal SaaS / freelance" },
  { key: "dark-premium", name: "Dark Premium", description: "Sombre et minimaliste — portfolio haut de gamme" },
  { key: "capsule", name: "Capsule", description: "Liens dans une pilule centrale — startup moderne" },
  { key: "brand-heavy", name: "Brand Studio", description: "Logo fort, badge createur — studio / creatif" },
  { key: "dual-cta", name: "Double CTA", description: "Deux boutons d'action — pages de vente" },
  { key: "dropdown-rich", name: "Menus Riches", description: "Support dropdown natif — sites de contenu" },
  { key: "creative-split", name: "Split Creatif", description: "Logo centre, liens separes — editorial premium" },
  { key: "signature", name: "Signature", description: "Micro-bar + nav principale — le plus premium et original" },
] as const;
