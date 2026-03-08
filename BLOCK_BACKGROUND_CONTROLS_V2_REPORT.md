# Block Background Controls V2 Report

## New Controls Added

### New BackgroundConfig Fields
| Field | Type | Used by | Purpose |
|-------|------|---------|---------|
| `position` | `BackgroundPosition` (9 values) | glow, halo, radial, particles-aura | Focal point placement |
| `lineWidth` | number (0.5-3) | grid-tech | Grid line thickness |
| `dotSize` | number (0.5-4) | dots | Dot radius |

### Existing Fields Enhanced
| Field | Enhancement |
|-------|-------------|
| `size` | Now also controls glow spread (20-120%), noise scale (64-512px) |
| `opacity` | Relabeled "Intensite" — clearer semantics |

## Control Matrix by Mode

| Mode | Color | 2nd Color | Intensity | Position | Spacing | Line Width | Dot Size | Scale | Spread | Blur | Density | Speed | Particle Size |
|------|-------|-----------|-----------|----------|---------|------------|----------|-------|--------|------|---------|-------|---------------|
| solid | x | - | - | - | - | - | - | - | - | - | - | - | - |
| glow | x | - | x | x | - | - | - | - | x | x | - | - | - |
| mesh | x | x | x | - | - | - | - | - | - | - | - | - | - |
| gradient-radial | - | - | - | x | - | - | - | - | - | - | - | - | - |
| grid-tech | x | - | x | - | x | x | - | - | - | - | - | - | - |
| dots | x | - | x | - | x | - | x | - | - | - | - | - | - |
| noise | - | - | x | - | - | - | - | x | - | - | - | - | - |
| particles-float | x | - | x | - | - | - | - | - | - | - | x | x | x |
| particles-constellation | x | x | x | - | - | - | - | - | - | - | x | x | x |
| particles-aura | x | x | x | x | - | - | - | - | - | - | x | x | x |
| luxe-waves | x | x | x | - | - | - | - | - | - | - | - | - | - |
| halo-spotlight | x | - | x | x | - | - | - | - | x | x | - | - | - |

## Presets Introduced

Every background mode now has **3 curated presets** accessible via "Style rapide" buttons:

### Pattern Modes
| Mode | Preset 1 | Preset 2 | Preset 3 |
|------|----------|----------|----------|
| grid-tech | Subtil (30%, 48px, 0.5px) | Editorial (50%, 60px, 1px) | Tech (70%, 28px, 1.5px) |
| dots | Subtil (30%, 24px, 0.8px) | Premium (50%, 16px, 1.2px) | Dense (70%, 12px, 1.8px) |
| noise | Subtil (20%, 256px) | Texture (50%, 200px) | Grain (80%, 150px) |

### Gradient / Glow Modes
| Mode | Preset 1 | Preset 2 | Preset 3 |
|------|----------|----------|----------|
| glow | Subtil (30%, wide, soft) | Hero (60%, focused top) | Spotlight (80%, tight center) |
| mesh | Subtil (30%) | Premium (60%) | Intense (90%) |
| gradient-radial | Centre | Haut | Bas |
| luxe-waves | Calme (30%) | Premium (50%) | Expressif (80%) |
| halo-spotlight | Doux (40%, soft) | Hero (70%, top) | Dramatique (90%, tight) |

### Animated Modes
| Mode | Preset 1 | Preset 2 | Preset 3 |
|------|----------|----------|----------|
| particles-float | Subtil (sparse, slow) | Premium (balanced) | Intense (dense, fast) |
| particles-constellation | Subtil (sparse) | Premium (balanced) | Reseau (very dense, slow) |
| particles-aura | Calme (sparse, slow) | Hero (balanced, center) | Cinema (dense, slow, large) |

## UX Changes in Editor

### Before (V1)
- All controls shown as a flat list
- No presets
- No position control
- Generic labels ("Taille", "Opacite")
- Same controls shown regardless of mode

### After (V2)
- **Mode-aware controls**: only relevant sliders/pickers shown per mode
- **Preset buttons first**: "Style rapide" row at top of controls for instant curated looks
- **Grouped by category**: Colors > Intensity > Position > Pattern > Gradient > Particle
- **Better labels**: "Intensite" instead of "Opacite", "Epaisseur" for line width, "Point focal" for position
- **Position grid**: 9-position visual grid for focal point selection
- **Safety caps**: Particle density/speed/size clamped to prevent performance issues

### Control Organization (per mode family)
```
1. [Style rapide]  ← 3 preset buttons
2. [Couleur]       ← if mode uses color
3. [Intensite]     ← universal strength
4. [Point focal]   ← 3x3 position grid (gradient/glow modes)
5. [Pattern]       ← spacing, line width, dot size (pattern modes)
6. [Gradient]      ← spread, blur (gradient/glow modes)
7. [Animation]     ← density, speed, particle size (animated modes)
```

## Performance Safeguards

| Safeguard | Value | Applied to |
|-----------|-------|------------|
| Density cap | max 2.0 (200%) | All particle modes |
| Speed cap | max 2.0 (200%) | All particle modes |
| Particle size cap | max 5px | All particle modes |
| `prefers-reduced-motion` | Single frame, no loop | All particle modes |
| Lazy loading | `React.lazy()` + `Suspense` | ParticleBackground component |
| `memo()` | Prevents re-renders | ParticleBackground component |
| No element opacity | Single opacity channel | All overlay backgrounds |

## Preview / Public Parity

Both `BlockPreview.tsx` and `SitePublicRenderer.tsx` share:
- Same `renderBackgroundConfig()` engine
- Same `ParticleBackground` component (lazy-loaded)
- Identical layer stack: root > overlay (z-0) > canvas > content (z-[1])
- All new parameters (position, lineWidth, dotSize) work identically in both

## QA Scenarios Executed

### A — Grid / Dots / Noise
- Grid: spacing slider changes cell size visibly, line width slider affects thickness
- Dots: spacing changes density, dot size slider affects dot radius
- Noise: scale slider changes texture coarseness
- All presets (Subtil/Editorial/Tech, Subtil/Premium/Dense, etc.) produce distinctly different looks

### B — Radial / Glow / Halo
- Intensity slider visibly affects strength
- Spread slider controls the gradient size
- Focal position changes where the glow/halo sits
- "Hero" preset (top focus) dramatically different from "Spotlight" (center focus)
- Text remains readable at all preset levels

### C — Particle Modes
- Density slider: 50% sparse vs 200% dense clearly different
- Speed slider: 20% very calm vs 200% energetic
- Safety caps prevent values beyond 2.0/5px
- Builder performance acceptable at max density

### D — Presets
- Each mode's 3 presets produce tastefully different results
- Subtil presets suitable for pricing/testimonial sections
- Hero/Intense presets suitable for hero/CTA sections
- Presets feel meaningfully different, not just opacity changes

### E — Save / Reload / Public
- New fields (position, lineWidth, dotSize) serialize correctly in JSON
- Reloading builder preserves all settings
- Public render matches builder preview

## Validation
- `tsc --noEmit` — pass
- `next build` — pass
- Pre-commit validation — 23/23 checks passed

## Future Opportunities
- Animated gradient modes (CSS animation on luxe-waves)
- Blend mode control (multiply/overlay for overlay patterns)
- Per-page background inheritance
- Background preview thumbnails in preset buttons
