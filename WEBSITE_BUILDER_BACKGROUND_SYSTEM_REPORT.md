# Website Builder — Block Spacing & Background System Fix

## Problemes resolus

### A. Espacement / gaps noirs entre blocs
**Cause racine** : Les blocs sans `backgroundColor` explicite etaient transparents, laissant le fond du canvas builder (`bg-[#F0F1F5]`) apparaitre entre les sections.

**Fix** : `computeSectionStyle()` applique maintenant `backgroundColor: "var(--site-bg, #ffffff)"` comme fallback quand aucun background n'est defini. Cela garantit que chaque bloc a toujours un fond opaque.

### B. Systeme de fond par bloc
**Avant** : Les controles d'arriere-plan dans BlockStyleEditor etaient limites (pas de color picker pour solid/glow/mesh, pas de previews visuels).

**Apres** : Systeme complet avec :
- 3 modes principaux : **Inherit** (herite du site) / **None** (explicitement aucun) / **Solid** (couleur unie)
- 6 effets : **Glow** / **Mesh** / **Radial** / **Grid** / **Dots** / **Noise**
- Color pickers pour solid, glow, mesh (+ couleur secondaire pour mesh)
- Sliders pour opacity, size, blur selon le type
- Previews visuels miniatures sur chaque bouton

## Fichiers modifies

| Fichier | Changement |
|---------|-----------|
| `src/lib/block-style-engine.ts` | Fallback `var(--site-bg, #ffffff)` dans `computeSectionStyle()` |
| `src/components/site-web/blocks/BlockPreview.tsx` | Wrapper toujours `relative overflow-hidden`, contenu `relative z-[1]`, fallback bloc inconnu |
| `src/components/site-public/SitePublicRenderer.tsx` | Meme structure que BlockPreview, fallback `null` pour types inconnus |
| `src/components/site-web/editors/BlockStyleEditor.tsx` | Section "Fond du bloc" completement reecrite avec UX complete |

## Architecture du rendu

```
[Section wrapper] — relative overflow-hidden, inline styles (bg, padding, button vars, block bg)
  [<style>]       — scoped hover CSS for buttons
  [Overlay div]   — absolute inset-0 z-0 (grid/dots/noise overlays, optionnel)
  [Content div]   — relative z-[1], container class + px-6 (sauf full-bleed)
    [Block component] — contenu pur (hero, feature-grid, etc.)
```

## Coherence preview / public
Les deux renderers (BlockPreview + SitePublicRenderer.PublicBlockSection) utilisent exactement la meme structure, les memes fonctions du style engine, et le meme set FULL_BLEED_BLOCKS.

## QA
- TypeScript : 0 erreurs
- Next.js build : succes complet
- Pas de regression sur les 37+ types de blocs
