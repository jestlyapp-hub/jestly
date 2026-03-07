# Website Builder — Navbar Editor Hardening Report

## Sprint Overview
Date: 2026-03-07
Scope: Fix all non-functional navbar editor controls, make every control produce real visual output.

---

## Phase 1: Audit — Broken Controls Identified

### Root Cause
Multiple navbar variants bypassed or overrode `NavWrapper`, making style controls non-functional:

| Variant | Issue |
|---|---|
| V1 Classic Floating | Overrode `showShadow: true, showBorder: false` — user could not toggle these |
| V2 Dark Premium | Did NOT use NavWrapper — had its own `<nav>` with hardcoded styles |
| V3 Capsule | Overrode `bgMode: "transparent", showBorder: false, showShadow: false` |
| V4 Brand Heavy | Overrode `density: "spacious"` |
| V7 Creative Split | Did NOT use NavWrapper — hardcoded bg, no border/shadow/density support |
| V8 Signature | Did NOT use NavWrapper — hardcoded backdrop-blur, border, height |

### Dead Type Fields
- `transparent` — redundant with `bgMode: "transparent"`, never used in editor
- `logoPosition` — existed in type but never read by any renderer
- `alignment` — existed in type and defaultNavConfig but never read

### CTA Button
- Only had hardcoded CSS variable fallbacks
- No user-configurable style (filled/outline/ghost), color, or border-radius controls

---

## Phase 2: Fix — All Variants Use NavWrapper (DONE)

### Architecture Change
Split `NavWrapper` into two composable components:
- **`NavWrapper`** — outer `<nav>` shell: handles sticky, bgMode, border, shadow, CSS var `--nav-h`
- **`NavContainer`** — inner row: handles containerWidth, density height, flex layout

All 8 variants now compose `NavWrapper` + `NavContainer`. No variant bypasses or overrides shared config.

### Variants Fixed
- **V1 (classic-floating)**: Removed `showShadow: true, showBorder: false` override. User controls work.
- **V2 (dark-premium)**: Converted from raw `<nav>` to `NavWrapper + NavContainer`. All style controls work.
- **V3 (capsule)**: Removed `bgMode/showBorder/showShadow` overrides. User controls work.
- **V4 (brand-heavy)**: Removed `density: "spacious"` override. User controls work.
- **V7 (creative-split)**: Converted from raw `<nav>` to `NavWrapper + NavContainer`. Gradient line preserved inside wrapper.
- **V8 (signature)**: Converted from raw `<nav>` to `NavWrapper + NavContainer`. Micro-bar + main row preserved inside wrapper.

---

## Phase 3: Sticky — End-to-End (DONE)

Sticky behavior pipeline:
1. **Editor toggle** (NavFooterEditorPanel > Style > Sticky) → writes `nav.sticky` to state
2. **State** → `site-builder-context` serializes `nav` in save payload
3. **Builder preview** → NavWrapper reads `nav.sticky` → applies `sticky top-0` or `relative`
4. **Public site** → SitePublicRenderer passes nav to NavbarRenderer → same NavWrapper logic

Builder canvas uses `overflow-y-auto` which is the scroll container — `sticky top-0` works correctly inside it.

---

## Phase 4: Deep CTA Editor (DONE)

### New NavConfig Fields
```typescript
ctaStyle?: "filled" | "outline" | "ghost" | "soft";
ctaBgColor?: string;
ctaTextColor?: string;
ctaBorderRadius?: string;
```

### CtaButton Refactored
- New signature: `CtaButton({ label, isPrimary, nav })` — reads CTA config from NavConfig
- Primary CTA uses `nav.ctaStyle` (default: "filled")
- Secondary CTA always uses "outline" style
- Colors: `nav.ctaBgColor` overrides CSS var `--btn-bg`, `nav.ctaTextColor` overrides `--btn-text`
- Border radius: `nav.ctaBorderRadius` overrides `--site-btn-radius`

### Editor Controls Added
- **Style selector**: filled / outline / soft / ghost (4-column grid)
- **Background color**: color picker + hex input + reset button
- **Text color**: color picker + hex input + reset button
- **Border radius**: carre (4px) / normal (8px) / arrondi (12px) / pilule (9999px)

---

## Phase 5: All Style Controls Map to Real Rendering (DONE)

### Control → Rendering Matrix (all 8 variants)

| Control | NavConfig field | NavWrapper reads | Works for all variants |
|---|---|---|---|
| Fond (bgMode) | `bgMode` | solid/blur/transparent | YES |
| Sticky | `sticky` | sticky top-0 / relative | YES |
| Bordure | `showBorder` | border-bottom | YES |
| Ombre | `showShadow` | box-shadow | YES |
| Densite | `density` | h-14/h-16/h-20 + --nav-h | YES |
| Largeur | `containerWidth` | max-w-4xl/6xl/full | YES |
| CTA style | `ctaStyle` | CtaButton rendering | YES |
| CTA bg color | `ctaBgColor` | inline style | YES |
| CTA text color | `ctaTextColor` | inline style | YES |
| CTA radius | `ctaBorderRadius` | inline style | YES |

---

## Dead Code Removed

### Type Fields Deleted from NavConfig
- `transparent?: boolean` — redundant with `bgMode: "transparent"`
- `logoPosition?: "left" | "center"` — never implemented in any renderer
- `alignment?: "left" | "center" | "right"` — never implemented in any renderer

### NavWrapper Cleanup
- Removed `nav.transparent` check (was redundant with bgMode)
- Removed `alignment` from `defaultNavConfig()`

---

## Files Modified

| File | Changes |
|---|---|
| `src/types/index.ts` | Removed dead fields, added CTA style fields |
| `src/components/site-web/navbar/NavbarRenderer.tsx` | Full refactor: NavWrapper+NavContainer split, all variants use wrapper, CtaButton reads nav config |
| `src/components/site-web/builder/NavFooterEditorPanel.tsx` | Added CTA style/color/radius controls |

## TypeScript
- `npx tsc --noEmit` passes with 0 errors
