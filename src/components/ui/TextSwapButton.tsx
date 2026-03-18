"use client";

import { useState } from "react";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════════════════════
   TextSwapButton — Masked vertical text-swap on hover
   100% inline styles — no external CSS dependency.
   Structure: button > mask (overflow:hidden, 1 line) > track (2 lines)
   On hover: track translateY(-lineH) → text 2 replaces text 1
   Button stays stable. Only the text moves.
   ═══════════════════════════════════════════════════════════════════════ */

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

interface TextSwapButtonProps {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: Variant;
  size?: Size;
  className?: string;
  icon?: React.ReactNode;
}

const LINE_H: Record<Size, number> = { sm: 16, md: 20, lg: 22 };
const BTN_H: Record<Size, number> = { sm: 36, md: 46, lg: 50 };
const FONT: Record<Size, number> = { sm: 12, md: 14, lg: 15 };
const PX: Record<Size, number> = { sm: 20, md: 28, lg: 32 };
const RADIUS: Record<Size, number> = { sm: 12, md: 16, lg: 16 };

export default function TextSwapButton({
  label,
  href,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
  icon,
}: TextSwapButtonProps) {
  const [hovered, setHovered] = useState(false);

  const lineH = LINE_H[size];
  const btnH = BTN_H[size];
  const fontSize = FONT[size];
  const px = PX[size];
  const radius = RADIUS[size];

  const textContent = icon ? (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      {label}
      {icon}
    </span>
  ) : (
    label
  );

  // ── Button base styles ──
  const btnBase: React.CSSProperties = {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: btnH,
    paddingLeft: px,
    paddingRight: px,
    borderRadius: radius,
    fontSize,
    fontWeight: variant === "primary" ? 600 : 500,
    overflow: "hidden",
    cursor: "pointer",
    textDecoration: "none",
    outline: "none",
    transition: "box-shadow 300ms ease, border-color 300ms ease",
  };

  // ── Variant styles ──
  const variantBase: Record<Variant, React.CSSProperties> = {
    primary: {
      color: "white",
      background: "linear-gradient(135deg, #7C5CFF, #9C6BFF)",
      border: "none",
      boxShadow: hovered
        ? "0 12px 40px rgba(124,92,255,0.35)"
        : "0 8px 32px rgba(124,92,255,0.25)",
    },
    secondary: {
      color: hovered ? "#111118" : "#57534E",
      background: "rgba(255,255,255,0.7)",
      border: hovered ? "1px solid rgba(124,92,255,0.2)" : "1px solid rgba(0,0,0,0.08)",
      backdropFilter: "blur(8px)",
      boxShadow: hovered ? "0 8px 24px rgba(124,92,255,0.08)" : "none",
    },
    ghost: {
      color: hovered ? "#111118" : "#57534E",
      background: "transparent",
      border: hovered ? "1px solid rgba(124,92,255,0.15)" : "1px solid rgba(0,0,0,0.08)",
      boxShadow: "none",
    },
  };

  const combinedStyle: React.CSSProperties = { ...btnBase, ...variantBase[variant] };

  // ── Mask: clips to exactly 1 line height ──
  const maskStyle: React.CSSProperties = {
    position: "relative",
    zIndex: 10,
    overflow: "hidden",
    height: lineH,
    display: "block",
  };

  // ── Track: 2 rows stacked, shifts up on hover ──
  const trackStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    transform: hovered ? `translateY(-${lineH}px)` : "translateY(0)",
    transition: "transform 400ms cubic-bezier(0.76, 0, 0.24, 1)",
    willChange: "transform",
  };

  // ── Each text row ──
  const rowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    whiteSpace: "nowrap",
    height: lineH,
    lineHeight: `${lineH}px`,
  };

  const inner = (
    <span style={maskStyle}>
      <span style={trackStyle}>
        <span style={rowStyle}>{textContent}</span>
        <span style={rowStyle} aria-hidden="true">{textContent}</span>
      </span>
    </span>
  );

  const handlers = {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
  };

  if (href) {
    return (
      <Link href={href} className={className} style={combinedStyle} {...handlers}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className} style={combinedStyle} {...handlers}>
      {inner}
    </button>
  );
}
