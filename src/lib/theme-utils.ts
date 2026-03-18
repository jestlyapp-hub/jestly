import type { SiteTheme } from "@/types";

/**
 * Default theme values — the 4 required fields.
 * Optional fields are left undefined so DB values are never overwritten.
 */
export const THEME_DEFAULTS: SiteTheme = {
  primaryColor: "#4F46E5",
  fontFamily: "Inter, sans-serif",
  borderRadius: "rounded",
  shadow: "sm",
};

/**
 * Normalize a raw theme object from DB into a complete SiteTheme.
 * Preserves ALL existing fields, applies defaults only for missing required fields.
 * Use this everywhere instead of manual { primaryColor: raw?.primaryColor || "..." } patterns.
 */
export function normalizeTheme(raw: Record<string, unknown> | null | undefined): SiteTheme {
  return {
    ...(raw || {}),
    primaryColor: (raw?.primaryColor as string) || THEME_DEFAULTS.primaryColor,
    fontFamily: (raw?.fontFamily as string) || THEME_DEFAULTS.fontFamily,
    borderRadius: (raw?.borderRadius as SiteTheme["borderRadius"]) || THEME_DEFAULTS.borderRadius,
    shadow: (raw?.shadow as SiteTheme["shadow"]) || THEME_DEFAULTS.shadow,
  } as SiteTheme;
}

/**
 * Deep-merge a partial theme update into an existing theme.
 * Only overwrites fields that are explicitly present in the patch.
 * Used by PATCH endpoints to avoid wiping unrelated fields.
 */
export function mergeTheme(existing: Record<string, unknown> | null | undefined, patch: Record<string, unknown> | null | undefined): SiteTheme {
  const base = existing || {};
  const updates = patch || {};
  return normalizeTheme({ ...base, ...updates });
}
