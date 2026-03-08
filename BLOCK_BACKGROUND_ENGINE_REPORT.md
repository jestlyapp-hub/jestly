# Block Background Engine — Fix & Expansion Report

## Root Cause

All block background modes (Grille, Dots, Glow, Mesh, etc.) were **silently invisible** because the rendering engine appended hex opacity suffixes to CSS `var()` expressions.

Example of broken output:
```css
/* Invalid — browser silently ignores this */
background: repeating-linear-gradient(
  var(--site-primary, #4F46E5)22 1px,
  transparent 1px
);
```

CSS `var()` expressions are opaque tokens — appending `22` creates an invalid color value that the browser discards entirely.

## Fix Applied

Created `colorWithAlpha()` helper using `color-mix()`:

```typescript
function colorWithAlpha(color: string, percent: number): string {
  return `color-mix(in srgb, ${color} ${Math.round(percent)}%, transparent)`;
}
```

This works with both `var(--site-primary, #4F46E5)` and raw hex values like `#4F46E5`.

All 6 existing background types rewritten to use `colorWithAlpha()`:
- **solid** — direct backgroundColor
- **glow** — radial gradient with color-mix
- **mesh** — conic gradient with color-mix
- **grid-tech** — repeating linear gradients with color-mix
- **dots** — radial-gradient dots with color-mix
- **gradient-radial** — radial gradient with color-mix
- **noise** — SVG data URI (opacity increased from 0.04 to 0.15)

## 5 New Premium Backgrounds

### Animated (Canvas-based)
1. **Particles Float** — gentle floating particles, configurable density/speed/size
2. **Particles Constellation** — particles with connecting lines between nearby points
3. **Particles Aura** — particles orbiting radial glow zones with orbital drift

### Static
4. **Luxe Waves** — layered undulating CSS gradients
5. **Halo Spotlight** — centered radial glow overlay

## Architecture

```
BackgroundPreset type (src/types/index.ts)
  ↓
renderBackgroundConfig() (src/lib/block-style-engine.ts)
  ├── Returns { containerStyle, overlayStyle } for CSS backgrounds
  └── Returns { html: "particles-*" } for canvas backgrounds
        ↓
BlockPreview.tsx / SitePublicRenderer.tsx
  └── React.lazy(() => import("./ParticleBackground"))
        └── Canvas animation with ResizeObserver + requestAnimationFrame
```

- Canvas component lazy-loaded with `Suspense` for zero bundle impact on non-particle blocks
- `prefers-reduced-motion: reduce` respected (draws once, no animation loop)
- ParticleBackground uses `memo()` to prevent unnecessary re-renders

## Editor Controls (BlockStyleEditor.tsx)

New "Premium" section with 5 buttons. Context-aware sliders:
- **Density** (0.2–2) — particle types only
- **Speed** (0.2–2) — particle types only
- **Particle Size** (1–6 px) — particle types only
- **Blur** (0–100 px) — halo-spotlight only
- **Opacity** (0–1) — all non-solid types

## Files Modified

| File | Change |
|------|--------|
| `src/types/index.ts` | +5 BackgroundPreset values, +3 BackgroundConfig fields |
| `src/lib/block-style-engine.ts` | colorWithAlpha(), rewrote all renderers, +5 new types |
| `src/components/site-web/blocks/ParticleBackground.tsx` | NEW — canvas component |
| `src/components/site-web/blocks/BlockPreview.tsx` | Lazy ParticleBackground import |
| `src/components/site-public/SitePublicRenderer.tsx` | Lazy ParticleBackground import |
| `src/components/site-web/editors/BlockStyleEditor.tsx` | Premium section + expanded controls |

## Verification

- `tsc --noEmit` — pass
- `next build` — pass
- Pre-commit validation — 23/23 checks passed
