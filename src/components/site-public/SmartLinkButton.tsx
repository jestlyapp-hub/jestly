"use client";

import type { BlockLink } from "@/types";
import { useLinkContext } from "@/lib/link-context";
import { getBlockLinkProps, normalizeLink } from "@/lib/links";
import { getButtonInlineStyle } from "@/lib/block-style-engine";

interface SmartLinkButtonProps {
  link: BlockLink | undefined;
  label: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function SmartLinkButton({ link, label, className = "", style }: SmartLinkButtonProps) {
  const ctx = useLinkContext();
  const normalized = normalizeLink(link);

  const baseClass = `btn-styled ${className}`.trim();
  const mergedStyle = { ...getButtonInlineStyle(), ...style };

  // No LinkContext = inside builder → render as <span> (no navigation)
  if (!ctx) {
    return <span className={baseClass} style={mergedStyle}>{label}</span>;
  }

  // link.type === 'none' → render as <span>
  if (normalized.type === "none") {
    return <span className={baseClass} style={mergedStyle}>{label}</span>;
  }

  const props = getBlockLinkProps(normalized, ctx.site);
  if (!props) {
    return <span className={baseClass} style={mergedStyle}>{label}</span>;
  }

  return (
    <a
      href={props.href}
      target={props.target}
      rel={props.rel}
      className={baseClass}
      style={mergedStyle}
    >
      {label}
    </a>
  );
}
