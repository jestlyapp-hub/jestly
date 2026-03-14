import type { BlockStyle, ButtonStyle, SiteTheme, SiteDesign, DesignKey, BackgroundConfig, BackgroundPosition, HoverEffect, SpacingPreset } from "@/types";
import { getDesignPreset } from "@/lib/site-designs";

const shadowMap: Record<string, string> = {
  none: "none",
  sm: "0 1px 2px rgba(0,0,0,0.05)",
  md: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)",
  lg: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
};

/**
 * Compute inline CSSProperties from a BlockStyle.
 * Applied by the BlockPreview wrapper on the section container.
 */
export function computeSectionStyle(style: BlockStyle): React.CSSProperties {
  const css: React.CSSProperties = {};

  // Background — always fall back to site bg so no parent canvas color bleeds through
  if (style.backgroundGradient) {
    css.background = style.backgroundGradient;
  } else if (style.backgroundColor) {
    css.backgroundColor = style.backgroundColor;
  } else {
    css.backgroundColor = "var(--site-bg, #ffffff)";
  }

  // Text
  if (style.textColor) css.color = style.textColor;

  // Padding
  if (style.paddingTop != null) css.paddingTop = style.paddingTop;
  if (style.paddingBottom != null) css.paddingBottom = style.paddingBottom;
  if (style.paddingLeft != null) css.paddingLeft = style.paddingLeft;
  if (style.paddingRight != null) css.paddingRight = style.paddingRight;

  // Typography
  if (style.fontSize != null) css.fontSize = style.fontSize;
  if (style.fontWeight) css.fontWeight = style.fontWeight;
  if (style.lineHeight != null) css.lineHeight = style.lineHeight;
  if (style.textAlign) css.textAlign = style.textAlign;

  // Border & shadow
  if (style.borderRadius != null) css.borderRadius = style.borderRadius;
  if (style.borderColor) css.borderColor = style.borderColor;
  if (style.borderWidth != null) {
    css.borderWidth = style.borderWidth;
    css.borderStyle = "solid";
  }
  if (style.shadow && style.shadow !== "none") {
    css.boxShadow = shadowMap[style.shadow] ?? "none";
  }

  return css;
}

/**
 * Derive a darker shade (for hover) from a hex color.
 */
function darkenHex(hex: string, amount = 20): string {
  const c = hex.replace("#", "");
  const num = parseInt(c, 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0xff) - amount);
  const b = Math.max(0, (num & 0xff) - amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

/**
 * Derive a light tint (bg) from a hex color.
 */
function lightenHex(hex: string): string {
  const c = hex.replace("#", "");
  const num = parseInt(c, 16);
  const r = Math.min(255, ((num >> 16) * 0.1 + 255 * 0.9) | 0);
  const g = Math.min(255, (((num >> 8) & 0xff) * 0.1 + 255 * 0.9) | 0);
  const b = Math.min(255, ((num & 0xff) * 0.1 + 255 * 0.9) | 0);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

/**
 * Compute CSS custom properties for site theme tokens.
 * Applied on the root of the public renderer so all blocks inherit.
 */
/**
 * Resolve a complete theme by filling in missing properties from the design preset.
 * This ensures dark designs actually get dark colors even if the site theme is partial.
 */
export function resolveTheme(theme: SiteTheme, design?: SiteDesign): SiteTheme {
  if (!design?.designKey) return theme;
  const preset = getDesignPreset(design.designKey);
  if (!preset) return theme;

  return {
    ...preset.theme,
    ...Object.fromEntries(
      Object.entries(theme).filter(([, v]) => v !== undefined && v !== null && v !== "")
    ),
  } as SiteTheme;
}

export function computeThemeVars(theme: SiteTheme): Record<string, string> {
  const vars: Record<string, string> = {};
  if (theme.primaryColor) {
    vars["--site-primary"] = theme.primaryColor;
    vars["--site-primary-hover"] = darkenHex(theme.primaryColor, 20);
    vars["--site-primary-light"] = lightenHex(theme.primaryColor);
  }
  if (theme.secondaryColor) vars["--site-secondary"] = theme.secondaryColor;
  if (theme.backgroundColor) vars["--site-bg"] = theme.backgroundColor;
  if (theme.surfaceColor) vars["--site-surface"] = theme.surfaceColor;
  if (theme.textColor) vars["--site-text"] = theme.textColor;
  if (theme.mutedTextColor) vars["--site-muted"] = theme.mutedTextColor;
  if (theme.borderColor) vars["--site-border"] = theme.borderColor;
  if (theme.headingFont) vars["--site-heading-font"] = theme.headingFont;
  if (theme.fontFamily) vars["--site-body-font"] = theme.fontFamily;
  if (theme.buttonRadius) {
    const brMap = { none: "0", sm: "4px", md: "8px", full: "999px" };
    vars["--site-btn-radius"] = brMap[theme.buttonRadius] || "8px";
  }
  // Theme-level button defaults (block overrides take precedence via computeButtonVars)
  if (theme.buttonBg) vars["--btn-bg"] = theme.buttonBg;
  if (theme.buttonText) vars["--btn-text"] = theme.buttonText;
  if (theme.buttonBorder) vars["--btn-border"] = theme.buttonBorder;
  if (theme.buttonHoverBg) vars["--btn-hover-bg"] = theme.buttonHoverBg;
  if (theme.buttonHoverText) vars["--btn-hover-text"] = theme.buttonHoverText;
  if (theme.buttonHoverBorder) vars["--btn-hover-border"] = theme.buttonHoverBorder;
  if (theme.buttonHoverShadow) vars["--btn-hover-shadow"] = shadowMap[theme.buttonHoverShadow] ?? "none";
  if (theme.buttonHoverScale != null) vars["--btn-hover-scale"] = String(theme.buttonHoverScale);
  if (theme.sectionGap) vars["--site-section-gap"] = `${sectionGapValues[theme.sectionGap] ?? 0}px`;
  return vars;
}

/**
 * Compute inline CSSProperties for public site sections.
 * Propagates site theme primaryColor as a CSS custom property.
 */
export function computePublicSectionStyle(
  style: BlockStyle,
  theme?: SiteTheme
): React.CSSProperties {
  const css = computeSectionStyle(style);

  // Propagate theme primary color as a CSS var (legacy compat)
  if (theme?.primaryColor) {
    (css as Record<string, string>)["--theme-primary"] = theme.primaryColor;
  }

  return css;
}

/**
 * Compute container className from a BlockStyle.
 * Used in builder canvas where section = container.
 */
export function computeSectionClass(style: BlockStyle): string {
  const classes: string[] = ["overflow-hidden"];

  switch (style.containerWidth) {
    case "boxed":
      classes.push("max-w-4xl mx-auto");
      break;
    case "narrow":
      classes.push("max-w-2xl mx-auto");
      break;
    // "full" or undefined → no constraint
  }

  return classes.join(" ");
}

/**
 * Compute inner container className for public site rendering.
 * Section stays full-width (for backgrounds); only inner container is constrained.
 */
export function computePublicContainerClass(style: BlockStyle): string {
  switch (style.containerWidth) {
    case "narrow":
      return "max-w-4xl mx-auto";
    case "boxed":
      return "max-w-6xl mx-auto";
    default:
      // "full" or undefined → wide container (1280px)
      return "max-w-7xl mx-auto";
  }
}

/**
 * Compute CSS custom properties for button styling.
 * Applied on the section wrapper so children can read them.
 */
export function computeButtonVars(btn?: ButtonStyle): Record<string, string> {
  if (!btn) return {};
  const vars: Record<string, string> = {};

  if (btn.bg) vars["--btn-bg"] = btn.bg;
  if (btn.text) vars["--btn-text"] = btn.text;
  if (btn.border) vars["--btn-border"] = btn.border;
  if (btn.radius != null) vars["--btn-radius"] = `${btn.radius}px`;
  if (btn.hoverBg) vars["--btn-hover-bg"] = btn.hoverBg;
  if (btn.hoverText) vars["--btn-hover-text"] = btn.hoverText;
  if (btn.hoverBorder) vars["--btn-hover-border"] = btn.hoverBorder;
  if (btn.hoverScale != null) vars["--btn-hover-scale"] = String(btn.hoverScale);
  if (btn.transitionMs != null) vars["--btn-transition"] = `${btn.transitionMs}ms`;
  if (btn.hoverShadow) vars["--btn-hover-shadow"] = shadowMap[btn.hoverShadow] ?? "none";

  return vars;
}

/**
 * CSS for a styled button inside a block.
 * Uses CSS variables with fallbacks.
 */
export function getButtonInlineStyle(): React.CSSProperties {
  return {
    backgroundColor: "var(--btn-bg, var(--site-primary))",
    color: "var(--btn-text, #fff)",
    border: "1px solid var(--btn-border, transparent)",
    borderRadius: "var(--btn-radius, 8px)",
    transition: "all var(--btn-transition, 200ms) ease",
  };
}

/**
 * Generate a <style> string scoped to a block for hover states.
 */
export function getButtonHoverCSS(blockId: string): string {
  return `
    [data-block="${blockId}"] .btn-styled:hover {
      background-color: var(--btn-hover-bg, var(--btn-bg, var(--site-primary-hover))) !important;
      color: var(--btn-hover-text, var(--btn-text, #fff)) !important;
      border-color: var(--btn-hover-border, var(--btn-border, transparent)) !important;
      transform: scale(var(--btn-hover-scale, 1));
      box-shadow: var(--btn-hover-shadow, none);
    }
  `;
}

/* ═══════════════════════════════════════════════════════════
   HOVER EFFECTS — shared hover CSS for card-based blocks
   ═══════════════════════════════════════════════════════════ */

const hoverEffectCSS: Record<string, string> = {
  lift: `transform: translateY(-4px); box-shadow: 0 12px 24px -4px rgba(0,0,0,0.12);`,
  zoom: `transform: scale(1.02);`,
  glow: `box-shadow: 0 0 20px rgba(79,70,229,0.15);`,
  "soft-overlay": `filter: brightness(1.03);`,
  "border-glow": `border-color: var(--site-primary, #4F46E5) !important; box-shadow: 0 0 0 1px var(--site-primary, #4F46E5);`,
};

/**
 * Generate scoped hover CSS for interactive card elements within a block.
 * Targets elements with .hover-card class inside the block scope.
 */
export function getHoverEffectCSS(blockId: string, effect?: HoverEffect): string {
  if (!effect || effect === "none") return "";
  const css = hoverEffectCSS[effect];
  if (!css) return "";

  return `
    [data-block="${blockId}"] .hover-card {
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    [data-block="${blockId}"] .hover-card:hover {
      ${css}
    }
    @media (prefers-reduced-motion: reduce) {
      [data-block="${blockId}"] .hover-card:hover {
        transform: none !important;
      }
    }
  `;
}

/**
 * Resolve spacing preset to paddingTop/paddingBottom values.
 */
export const spacingPresetValues: Record<SpacingPreset, { paddingTop: number; paddingBottom: number }> = {
  compact: { paddingTop: 20, paddingBottom: 20 },
  normal: { paddingTop: 48, paddingBottom: 48 },
  large: { paddingTop: 80, paddingBottom: 80 },
  hero: { paddingTop: 100, paddingBottom: 100 },
};

/**
 * Section gap values — controlled by theme, applied between blocks.
 * When blocks have 0 padding, the renderer applies this gap as margin.
 */
export const sectionGapValues: Record<string, number> = {
  none: 0,
  compact: 24,
  normal: 48,
  large: 72,
  hero: 120,
};

/**
 * Resolve the section gap in px from a SiteTheme.
 */
export function resolveSectionGap(theme?: SiteTheme): number {
  if (!theme?.sectionGap) return 0;
  return sectionGapValues[theme.sectionGap] ?? 0;
}

/* ═══════════════════════════════════════════════════════════
   BACKGROUND CONFIG — site-level & block-level backgrounds
   ═══════════════════════════════════════════════════════════ */

/**
 * Resolve the effective BackgroundConfig from SiteDesign.
 * Handles backward compat: old `backgroundPreset` string → BackgroundConfig.
 */
export function resolveBackgroundConfig(design?: SiteDesign): BackgroundConfig | undefined {
  if (!design) return undefined;
  if (design.background) return design.background;
  if (design.backgroundPreset && design.backgroundPreset !== "none") {
    return { type: design.backgroundPreset };
  }
  return undefined;
}

/**
 * Render a BackgroundConfig into inline styles.
 * Returns containerStyle (applied to the wrapper) and/or overlayStyle (for absolute overlay div).
 */
/**
 * Helper: produce a color with opacity using color-mix().
 * CSS var() values cannot have hex suffixes appended — "var(--c)22" is invalid CSS.
 * color-mix(in srgb, <color> <percent>, transparent) works with both var() and hex.
 */
function colorWithAlpha(color: string, percent: number): string {
  return `color-mix(in srgb, ${color} ${Math.round(percent)}%, transparent)`;
}

/**
 * Map BackgroundPosition to CSS background-position percentages.
 */
function positionToCSS(pos?: BackgroundPosition): string {
  switch (pos) {
    case "top":          return "50% 0%";
    case "bottom":       return "50% 100%";
    case "left":         return "0% 50%";
    case "right":        return "100% 50%";
    case "top-left":     return "20% 10%";
    case "top-right":    return "80% 10%";
    case "bottom-left":  return "20% 90%";
    case "bottom-right": return "80% 90%";
    default:             return "50% 40%"; // center (slightly raised)
  }
}

export function renderBackgroundConfig(
  config: BackgroundConfig | undefined,
): { containerStyle?: React.CSSProperties; overlayStyle?: React.CSSProperties; html?: string } {
  if (!config || config.type === "none") return {};

  const primary = config.primaryColor || "var(--site-primary, #4F46E5)";
  const secondary = config.secondaryColor || "var(--site-primary, #6366F1)";
  const bgColor = "var(--site-bg, #0A0A0F)";
  const surface = "var(--site-surface, #141420)";
  const opacity = config.opacity ?? 0.5;

  // Map user opacity (0-1) to a visual strength percentage for patterns.
  // Single opacity channel via colorWithAlpha — no element-level opacity.
  const strength = Math.round(opacity * 100);
  const focal = positionToCSS(config.position);

  switch (config.type) {
    case "solid":
      return { containerStyle: { backgroundColor: config.primaryColor || undefined } };

    case "glow": {
      const blur = config.blur ?? 60;
      const spread = config.size ?? 80;
      return {
        containerStyle: {
          backgroundImage: `radial-gradient(ellipse ${spread}% ${blur}% at ${focal}, ${colorWithAlpha(primary, Math.max(25, strength * 0.5))}, transparent 70%)`,
        },
      };
    }

    case "mesh":
      return {
        containerStyle: {
          backgroundImage: [
            `radial-gradient(at 20% 20%, ${colorWithAlpha(primary, Math.max(20, strength * 0.4))} 0%, transparent 50%)`,
            `radial-gradient(at 80% 80%, ${colorWithAlpha(secondary, Math.max(15, strength * 0.3))} 0%, transparent 50%)`,
            `radial-gradient(at 50% 50%, ${bgColor} 0%, transparent 100%)`,
          ].join(", "),
        },
      };

    case "gradient-radial":
      return {
        containerStyle: {
          backgroundImage: `radial-gradient(ellipse at ${focal}, ${surface} 0%, ${bgColor} 70%)`,
        },
      };

    case "grid-tech": {
      const size = config.size ?? 40;
      const lw = config.lineWidth ?? 1;
      const lineColor = colorWithAlpha(primary, Math.max(15, strength * 0.3));
      return {
        overlayStyle: {
          backgroundImage: [
            `linear-gradient(${lineColor} ${lw}px, transparent ${lw}px)`,
            `linear-gradient(90deg, ${lineColor} ${lw}px, transparent ${lw}px)`,
          ].join(", "),
          backgroundSize: `${size}px ${size}px`,
        },
      };
    }

    case "dots": {
      const size = config.size ?? 20;
      const ds = config.dotSize ?? 1.2;
      const dotColor = colorWithAlpha(primary, Math.max(20, strength * 0.4));
      return {
        overlayStyle: {
          backgroundImage: `radial-gradient(circle, ${dotColor} ${ds}px, transparent ${ds}px)`,
          backgroundSize: `${size}px ${size}px`,
        },
      };
    }

    case "noise": {
      const noiseScale = config.size ?? 256;
      return {
        overlayStyle: {
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.15'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: `${noiseScale}px ${noiseScale}px`,
          opacity: Math.max(0.08, opacity * 0.4),
        },
      };
    }

    // ─── ANIMATED BACKGROUNDS ───

    case "particles-float":
    case "particles-constellation":
    case "particles-aura":
      return { html: config.type };

    // ─── PREMIUM STATIC BACKGROUNDS ───

    case "luxe-waves": {
      const c1 = primary;
      const c2 = secondary;
      return {
        containerStyle: {
          backgroundImage: [
            `radial-gradient(ellipse 120% 80% at 20% 100%, ${colorWithAlpha(c1, Math.max(15, strength * 0.35))} 0%, transparent 60%)`,
            `radial-gradient(ellipse 100% 60% at 80% 0%, ${colorWithAlpha(c2, Math.max(12, strength * 0.28))} 0%, transparent 60%)`,
            `radial-gradient(ellipse 140% 50% at 60% 60%, ${colorWithAlpha(c1, Math.max(8, strength * 0.16))} 0%, transparent 70%)`,
          ].join(", "),
        },
      };
    }

    case "halo-spotlight": {
      const haloColor = primary;
      const haloSize = config.size ?? 50;
      const haloBlur = config.blur ?? 80;
      // Secondary glow offset from focal point
      const [fx, fy] = focal.split(" ");
      const secX = Math.max(10, parseInt(fx) - 20);
      const secY = Math.min(90, parseInt(fy) + 20);
      return {
        overlayStyle: {
          backgroundImage: [
            `radial-gradient(ellipse ${haloSize}% ${haloSize * 0.7}% at ${focal}, ${colorWithAlpha(haloColor, Math.max(20, strength * 0.4))} 0%, transparent 70%)`,
            `radial-gradient(ellipse ${haloSize * 0.5}% ${haloSize * 0.3}% at ${secX}% ${secY}%, ${colorWithAlpha(haloColor, Math.max(10, strength * 0.2))} 0%, transparent 70%)`,
          ].join(", "),
          filter: `blur(${haloBlur * 0.3}px)`,
        },
      };
    }

    default:
      return {};
  }
}

/**
 * Resolve the effective background for a block: block override or site global.
 */
export function resolveBlockBackground(
  blockBg: BackgroundConfig | undefined,
  siteBg: BackgroundConfig | undefined,
): BackgroundConfig | undefined {
  // Block has explicit background → use it (even "none" = intentional clear)
  if (blockBg) return blockBg;
  // Otherwise inherit site background
  return siteBg;
}
