// ═══════════════════════════════════════════════════════════════════
// Coachmark Position Engine — Smart viewport-aware positioning
//
// RULES:
// 1. NEVER overflow the viewport (horizontal or vertical)
// 2. Test placements in priority order
// 3. Clamp as final fallback
// 4. Padding from viewport edges: 16px minimum
// 5. Gap between anchor and card: 14px
// ═══════════════════════════════════════════════════════════════════

export type Placement = "right" | "left" | "top" | "bottom" | "center";

export interface AnchorRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface CoachmarkPosition {
  top: number;
  left: number;
  placement: Placement;
  fallbackUsed: boolean;
  clamped: boolean;
}

const VP = 16; // Viewport padding
const GAP = 14; // Gap between anchor and card

/**
 * Compute the optimal position for a coachmark card.
 *
 * Tests placements in priority order (preferred first),
 * picks the first that fits entirely in the viewport.
 * If none fits, uses the preferred with clamping.
 */
export function computeCoachmarkPosition(
  anchorRect: AnchorRect | null,
  cardWidth: number,
  cardHeight: number,
  preferredPlacement: string,
  viewportWidth?: number,
  viewportHeight?: number,
): CoachmarkPosition {
  const vw = viewportWidth ?? (typeof window !== "undefined" ? window.innerWidth : 1280);
  const vh = viewportHeight ?? (typeof window !== "undefined" ? window.innerHeight : 800);

  // ── Center fallback (no anchor or explicit center) ──────────
  if (!anchorRect || preferredPlacement === "center") {
    return {
      top: Math.max(VP, (vh - cardHeight) / 2),
      left: Math.max(VP, (vw - cardWidth) / 2),
      placement: "center",
      fallbackUsed: false,
      clamped: false,
    };
  }

  const cx = anchorRect.left + anchorRect.width / 2;
  const cy = anchorRect.top + anchorRect.height / 2;

  // ── Build placement priority list ──────────────────────────
  const preferred = normalPlacement(preferredPlacement);
  const order: Placement[] = [preferred];
  for (const p of ["bottom", "right", "left", "top"] as Placement[]) {
    if (!order.includes(p)) order.push(p);
  }

  // ── Test each placement ────────────────────────────────────
  for (const p of order) {
    const pos = calcRaw(p, anchorRect, cx, cy, cardWidth, cardHeight);
    if (fits(pos.left, pos.top, cardWidth, cardHeight, vw, vh)) {
      return { ...pos, placement: p, fallbackUsed: p !== preferred, clamped: false };
    }
  }

  // ── Nothing fits perfectly → clamp preferred ───────────────
  const raw = calcRaw(preferred, anchorRect, cx, cy, cardWidth, cardHeight);
  return {
    top: clamp(raw.top, VP, vh - cardHeight - VP),
    left: clamp(raw.left, VP, vw - cardWidth - VP),
    placement: preferred,
    fallbackUsed: false,
    clamped: true,
  };
}

// ── Helpers ──────────────────────────────────────────────────────

function normalPlacement(p: string): Placement {
  if (p === "right" || p === "left" || p === "top" || p === "bottom") return p;
  return "bottom";
}

function calcRaw(
  placement: Placement,
  anchor: AnchorRect,
  cx: number,
  cy: number,
  cw: number,
  ch: number,
): { top: number; left: number } {
  switch (placement) {
    case "right":
      return { left: anchor.left + anchor.width + GAP, top: cy - ch / 2 };
    case "left":
      return { left: anchor.left - cw - GAP, top: cy - ch / 2 };
    case "bottom":
      return { left: cx - cw / 2, top: anchor.top + anchor.height + GAP };
    case "top":
      return { left: cx - cw / 2, top: anchor.top - ch - GAP };
    default:
      return { left: cx - cw / 2, top: cy - ch / 2 };
  }
}

function fits(
  left: number,
  top: number,
  cw: number,
  ch: number,
  vw: number,
  vh: number,
): boolean {
  return (
    left >= VP &&
    top >= VP &&
    left + cw <= vw - VP &&
    top + ch <= vh - VP
  );
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(v, max));
}
