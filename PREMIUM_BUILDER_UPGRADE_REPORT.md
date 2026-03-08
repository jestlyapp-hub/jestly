# Premium Builder Upgrade — Sprint Report

## Vue d'ensemble

Sprint de 9 features premium pour le builder de sites. Toutes les features sont livrées, le build passe, aucun blocker rencontré.

## Features livrées

### 1. Animations d'entrée (8 types)
- **Fichiers** : `AnimateOnScroll.tsx`, `BuilderPropertyPanel.tsx`, types
- **Types** : fade-up, fade-down, fade-in, fade-left, fade-right, scale-in, blur-reveal, slide-left
- **Contrôles** : sélecteur de type + sliders durée (0.2-1.5s) et délai (0-1s)
- **Commit** : `feat(builder-motion): add entrance animation system with 8 types, duration and delay`

### 2. Scrollspy navigation
- **Fichier** : `SitePublicRenderer.tsx`
- **Mécanisme** : IntersectionObserver sur les sections visibles, `data-scrollspy-active` sur les liens nav
- **Cleanup** : `observer.disconnect()` au unmount
- **Commit** : `feat(builder-scrollspy): add active section tracking for navigation`

### 3. Hover effects (5 effets)
- **Fichiers** : `block-style-engine.ts`, `BuilderPropertyPanel.tsx`, `BlockPreview.tsx`, types
- **Effets** : lift, zoom, glow, soft-overlay, border-glow
- **Scoping** : CSS injecté via `[data-block="id"] .hover-card:hover`
- **Accessibilité** : `@media (prefers-reduced-motion: reduce)` safeguard
- **Commit** : `feat(builder-hover+spacing): add hover effects and semantic spacing presets`

### 4. Templates de pages (6 templates)
- **Fichier** : `page-templates.ts`, `BuilderPageList.tsx`
- **Templates** : portfolio-creatif, agence-studio, freelance-services, coach-personal-brand, startup-saas, landing-produit
- **UX** : modal de sélection à la création de page, option "page vierge" toujours disponible
- **Commit** : `feat(builder-templates): add 6 full-page starter templates`

### 5. Spacing presets (4 niveaux)
- **Fichiers** : `block-style-engine.ts`, `BuilderPropertyPanel.tsx`, types
- **Presets** : compact (20px), normal (48px), large (80px), hero (100px)
- **UX** : boutons dans l'onglet Style du property panel
- **Commit** : (inclus dans le commit hover+spacing)

### 6. Responsive preview (amélioré)
- **Fichier** : `BuilderCanvas.tsx`
- **Améliorations** : label de device (Tablet 768px / Mobile 375px), anneau visuel indicateur
- **Commit** : `feat(builder-responsive): enhance responsive preview with device frame indicator`

### 7. Style presets (10 presets)
- **Fichier** : `style-presets.ts`, `BuilderPropertyPanel.tsx`
- **Catégories** : section (4), hero (2), CTA (2), card (2)
- **UX** : section dépliable en haut de l'onglet Style
- **Commit** : `feat(builder-style-presets): add reusable style presets system`

### 8. Smart suggestions
- **Fichier** : `block-suggestions.ts`, `AddBlockModal.tsx`
- **Algorithme** : heuristique de flow par catégorie, priorise les catégories manquantes, max 2 par catégorie
- **UX** : section "Suggestions" avec icône étoile en haut du catalogue de blocs
- **Commit** : `feat(builder-suggestions): add contextual block suggestions`

### 9. Undo/Redo (amélioré)
- **Fichier** : `site-builder-context.tsx`
- **Existant** : 50 états, Ctrl+Z/Y, boutons UI
- **Amélioration** : coalescing des edits rapides (500ms) — les frappes clavier successives sur le même bloc fusionnent en une seule entrée d'historique
- **Commit** : `feat(builder-undo): add history coalescing for content/style edits`

## QA Integration (12 points)

| # | Check | Statut |
|---|-------|--------|
| 1 | Animation imports | PASS |
| 2 | Scrollspy cleanup | PASS |
| 3 | Hover effect scoping | PASS |
| 4 | Template block types | PASS |
| 5 | Spacing preset values | PASS |
| 6 | Style preset types | PASS |
| 7 | Suggestion categories | PASS |
| 8 | History coalescing | PASS |
| 9 | Responsive preview | PASS |
| 10 | No circular imports | PASS |
| 11 | Keyboard shortcuts | PASS |
| 12 | Block registry consistency | WARN (101 vs 99 renderer — pré-existant) |

## Build

`next build` : PASS (0 erreurs TypeScript, 0 erreurs de build)

## Fichiers créés

- `src/lib/page-templates.ts`
- `src/lib/style-presets.ts`
- `src/lib/block-suggestions.ts`

## Fichiers modifiés

- `src/components/site-public/AnimateOnScroll.tsx`
- `src/components/site-public/SitePublicRenderer.tsx`
- `src/components/site-web/builder/BuilderPropertyPanel.tsx`
- `src/components/site-web/builder/BuilderCanvas.tsx`
- `src/components/site-web/builder/BuilderPageList.tsx`
- `src/components/site-web/builder/AddBlockModal.tsx`
- `src/components/site-web/blocks/BlockPreview.tsx`
- `src/lib/block-style-engine.ts`
- `src/lib/site-builder-context.tsx`
- `src/types/index.ts`
