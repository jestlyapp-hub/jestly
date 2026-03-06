import type { BlockStyle, ButtonStyle, SiteTheme, SiteDesign, DesignKey } from "@/types";
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

  // Background
  if (style.backgroundGradient) {
    css.background = style.backgroundGradient;
  } else if (style.backgroundColor) {
    css.backgroundColor = style.backgroundColor;
  }

  // Text
  if (style.textColor) css.color = style.textColor;

  // Padding
  if (style.paddingTop != null) css.paddingTop = style.paddingTop;
  if (style.paddingBottom != null) css.paddingBottom = style.paddingBottom;
  if (style.paddingLeft != null) css.paddingLeft = style.paddingLeft;
  if (style.paddingRight != null) css.paddingRight = style.paddingRight;

  // Margin
  if (style.marginTop != null) css.marginTop = style.marginTop;
  if (style.marginBottom != null) css.marginBottom = style.marginBottom;

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
