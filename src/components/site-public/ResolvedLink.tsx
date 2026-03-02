"use client";

import type { Site } from "@/types";
import { resolveLink } from "@/lib/site-utils";

interface ResolvedLinkProps {
  link?: { type: string; value: string; openInNewTab?: boolean };
  site: Site;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

/**
 * Universal link resolver for public site.
 * Converts Link objects (internal_page, external_url, product, anchor, email, phone, etc.)
 * into real <a> tags with proper href.
 * If no link or type is "none", renders children without wrapping.
 */
export default function ResolvedLink({
  link,
  site,
  children,
  className,
  style,
  onClick,
}: ResolvedLinkProps) {
  const href = resolveLink(link, site);

  if (!href) {
    return <>{children}</>;
  }

  const isExternal =
    link?.type === "external_url" ||
    link?.type === "booking" ||
    link?.openInNewTab;

  return (
    <a
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className={className}
      style={style}
      onClick={onClick}
    >
      {children}
    </a>
  );
}
