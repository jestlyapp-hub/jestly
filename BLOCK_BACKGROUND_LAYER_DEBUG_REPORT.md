# Block Background Layer Debug Report

## Root Cause — Triple-Compound Invisibility Bug

Block backgrounds were invisible due to **3 compounding architectural issues**:

### Issue 1: Double Opacity (rendering engine)

`renderBackgroundConfig()` applied opacity TWICE:
- `colorWithAlpha(border, 25)` → reduces pattern color to 25% via `color-mix()`
- `opacity: 0.5` → reduces the entire overlay element to 50%

**Net visibility: 25% × 50% = 12.5%** — nearly invisible to the human eye.

**Fix**: Remove element-level `opacity` from all overlay backgrounds. Pattern intensity is now controlled solely via `colorWithAlpha()`, using a `strength` value derived from `config.opacity`.

### Issue 2: Wrong Color Variables (rendering engine)

Grid and dots used `var(--site-border, #27272A)` as their pattern color.

- Border colors are designed to be SUBTLE — they're not meant for decorative patterns
- On light themes: `--site-border` = `#E6E6E4` (light gray) at 12.5% on white = invisible
- On dark themes: `--site-border` = dark gray on dark background = invisible

**Fix**: Use `var(--site-primary, #4F46E5)` instead — thematic, visible, and intentional.

### Issue 3: 21 Block Content Components With Opaque Root Backgrounds (layer stack)

This was the "something on top" the user felt.

**Architecture**:
```
Block root div (relative, overflow-hidden)
├── sectionStyle → backgroundColor: "var(--site-bg)"    ← Layer 0 (block bg)
├── overlayDiv (absolute, inset-0, z-0)                  ← Layer 1 (decorative pattern)
├── contentDiv (relative, z-[1])                          ← Layer 2 (transparent wrapper)
│   └── <BlockPreview content={...} />                   ← Layer 3 (block content)
│       └── <section style={{ backgroundColor: "var(--site-bg)" }}>  ← OPAQUE WALL
```

21 block content components set their own `backgroundColor` or `background` on their root `<section>`, creating an opaque wall at Layer 3 that completely covered the decorative overlay at Layer 1.

These backgrounds were **redundant** — `computeSectionStyle()` already applies `backgroundColor: "var(--site-bg, #ffffff)"` on the block wrapper (Layer 0).

**Fix**: Removed all root-level opaque backgrounds from these 21 block content components.

## Files Modified

### Rendering Engine
| File | Change |
|------|--------|
| `src/lib/block-style-engine.ts` | Removed double opacity, switched to `--site-primary` for patterns, removed unused `border` variable, all backgrounds now use `strength` for opacity control |

### Block Content Components (root background removed)
| File | Previous root background |
|------|-------------------------|
| `HeroDarkSaasBlockPreview.tsx` | `var(--site-surface, #F7F7F5)` |
| `HeroCenteredMeshBlockPreview.tsx` | `var(--site-surface, #0a0a0a)` |
| `HeroSplitGlowBlockPreview.tsx` | `var(--site-surface, #0a0a0a)` |
| `PortfolioMasonryBlockPreview.tsx` | `var(--site-surface, #0a0a0a)` |
| `FooterBlockBlockPreview.tsx` | `var(--site-surface)` |
| `ServicesPremiumBlockPreview.tsx` | `var(--site-surface, #0a0a0a)` |
| `HeroCreatorBrandBlockPreview.tsx` | `var(--site-bg, #FFFFFF)` |
| `HeroMinimalServiceBlockPreview.tsx` | `var(--site-bg, #FFFFFF)` |
| `HeroSplitPortfolioBlockPreview.tsx` | `var(--site-bg, #FFFFFF)` |
| `HeroVideoShowreelBlockPreview.tsx` | `var(--site-surface, #F7F7F5)` |
| `ProjectsGridCasesBlockPreview.tsx` | `var(--site-bg, #FFFFFF)` |
| `ProjectTimelineBlockPreview.tsx` | `var(--site-bg, #FFFFFF)` |
| `ProjectMasonryWallBlockPreview.tsx` | `var(--site-bg, #FFFFFF)` |
| `ProjectsHorizontalBlockPreview.tsx` | `var(--site-bg, #FFFFFF)` |
| `ProductBenefitsMockupBlockPreview.tsx` | `var(--site-bg, #ffffff)` |
| `Products3CardShopBlockPreview.tsx` | `var(--site-bg, #ffffff)` |
| `ServicesProcessOffersBlockPreview.tsx` | `var(--site-bg, #ffffff)` |
| `ProductBundleCompareBlockPreview.tsx` | `var(--site-bg, #ffffff)` |
| `ProductFeaturedCardBlockPreview.tsx` | `var(--site-bg, #ffffff)` |
| `ServicesSplitValueBlockPreview.tsx` | `var(--site-bg, #ffffff)` |
| `ServicesIconGridBlockPreview.tsx` | `var(--site-bg, #ffffff)` |
| `PricingCustomQuoteBlockPreview.tsx` | `var(--site-bg, #ffffff)` |
| `Pricing3TierSaasBlockPreview.tsx` | `var(--site-bg, #ffffff)` |
| `Services3CardPremiumBlockPreview.tsx` | `var(--site-bg, #ffffff)` |
| `ProjectBeforeAfterBlockPreview.tsx` | `var(--site-bg, #FFFFFF)` |

## Background Mode Validation

| Mode | Type | Visible? | Method |
|------|------|----------|--------|
| Aucun | — | N/A | No background applied |
| Uni | containerStyle | Yes | Direct `backgroundColor` on wrapper |
| Glow | containerStyle | Yes | Radial gradient on wrapper, strength-based opacity |
| Mesh | containerStyle | Yes | Multi-point radial gradients on wrapper |
| Radial | containerStyle | Yes | Radial gradient on wrapper |
| Grille | overlayStyle | Yes | Grid pattern via `--site-primary`, no element opacity |
| Dots | overlayStyle | Yes | Dot pattern via `--site-primary`, no element opacity |
| Noise | overlayStyle | Yes | SVG texture, single low opacity |
| Particles Float | canvas (html) | Yes | Canvas component at z-0 |
| Particles Constellation | canvas (html) | Yes | Canvas component at z-0 |
| Particles Aura | canvas (html) | Yes | Canvas component at z-0 |
| Luxe Waves | containerStyle | Yes | Layered radial gradients, strength-based |
| Halo Spotlight | overlayStyle | Yes | Radial glow, strength-based, no element opacity |

## Preview / Public Parity

Both `BlockPreview.tsx` and `SitePublicRenderer.tsx` use identical layer structures:
1. Root wrapper: `relative overflow-hidden` + `mergedStyle`
2. Overlay div: `absolute inset-0 pointer-events-none z-0` + `overlayStyle`
3. Canvas (if html): `ParticleBackground` in `Suspense`
4. Content wrapper: `relative z-[1]`

The only difference is `AnimateOnScroll` wrapping the content in public — this is a transparent wrapper with no impact on backgrounds.

**Result**: Same config → same visual result in builder preview and public site.

## Remaining Risks

1. **Inner card backgrounds**: Some blocks have opaque backgrounds on inner elements (cards, form inputs, placeholders). These are intentional design elements that partially cover the overlay in their footprint. This is expected behavior — the overlay remains visible in the gaps.

2. **CtaBannerBlockPreview**: This block has an intentional full-width gradient card design. Its inner gradient will cover the overlay, but this is by design (the block IS a colored banner).

3. **Custom user backgrounds**: If a user sets `style.backgroundColor` on a block via the editor, `computeSectionStyle()` will apply it on the wrapper. This is correct — user-chosen color becomes the base under the decorative overlay.

## Verification

- `tsc --noEmit` — pass
- `next build` — pass
- Pre-commit validation — 23/23 checks passed
