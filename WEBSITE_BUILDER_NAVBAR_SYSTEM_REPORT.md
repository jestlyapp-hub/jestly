# Website Builder — Navbar System Report

## Vue d'ensemble

Systeme de navbar complet pour le builder Jestly avec 8 variantes premium, support dropdown, mobile responsive, et editeur avance.

## Bug fix critique

**Probleme** : La navbar n'apparaissait pas dans le preview du builder — seulement dans le site public.

**Cause** : `BuilderCanvas.tsx` ne rendait que les blocs de page, sans aucun composant nav.

**Fix** : Ajout de `NavbarRenderer` dans le canvas avant les blocs, avec `isBuilder` flag pour desactiver les liens.

## Architecture

```
NavbarRenderer (moteur principal)
├── NavWrapper         — wrapper partage (sticky, bg, border, shadow, density)
├── NavLogo            — rendu logo texte ou image
├── NavItem            — lien simple ou dropdown
├── NavDropdown        — menu deroulant desktop avec fermeture auto
├── MobileMenu         — drawer mobile avec sections pliables
├── SocialIcons        — icones reseaux sociaux (8 reseaux)
├── CtaButton          — bouton CTA (primary/secondary/outline/ghost)
└── 8 variantes visuelles
```

## Les 8 variantes

| # | Key | Nom | Caracteristiques |
|---|-----|-----|-----------------|
| 1 | classic-floating | Classique Flottant | Blanc, arrondi, ombre — SaaS / freelance |
| 2 | dark-premium | Dark Premium | Sombre, minimaliste — portfolio haut de gamme |
| 3 | capsule | Capsule | Liens dans pilule centrale — startup moderne |
| 4 | brand-heavy | Brand Studio | Logo fort, badge createur — studio creatif |
| 5 | dual-cta | Double CTA | Deux boutons d'action — pages de vente |
| 6 | dropdown-rich | Menus Riches | Support dropdown natif — sites de contenu |
| 7 | creative-split | Split Creatif | Logo centre, liens separes, ligne gradient — editorial premium |
| 8 | signature | Signature | Micro-bar + nav principale + accent dot — le plus premium |

## Modele de donnees (NavConfig)

```typescript
interface NavConfig {
  variant?: NavbarVariant;           // 8 variantes
  links: NavLink[];                  // liens avec sous-liens optionnels
  showCta: boolean;                  // CTA principal
  ctaLabel: string;
  ctaLink?: Link;
  showSecondaryCta?: boolean;        // CTA secondaire
  secondaryCtaLabel?: string;
  showSocials?: boolean;             // icones reseaux sociaux
  socials?: NavSocialLink[];
  sticky?: boolean;                  // fixee en haut
  transparent?: boolean;             // transparent sur hero
  bgMode?: "solid" | "blur" | "transparent";
  showBorder?: boolean;
  showShadow?: boolean;
  density?: "compact" | "default" | "spacious";
  containerWidth?: "full" | "boxed" | "narrow";
}

interface NavLink {
  id?: string;
  label: string;
  pageId?: string;
  url?: string;
  children?: NavLink[];              // sous-menu dropdown
}
```

## Editeur (NavFooterEditorPanel)

5 sous-sections organisees :
1. **Style** — choix variante (grille 2 colonnes) + logo/nom
2. **Liens** — gestion drag/reorder, sous-liens, pages internes ou URLs
3. **CTA** — bouton principal + secondaire avec toggles
4. **Social** — ajout/suppression reseaux sociaux
5. **Options** — fond (solid/blur/transparent), sticky, bordure, ombre, densite, largeur

## Responsive / Mobile

- Hamburger menu sur tous les ecrans < md (768px)
- Menu mobile plein ecran avec liens pliables
- Sous-liens en sections expandables
- CTAs centres en bas du menu mobile
- Icones sociales dans le menu mobile

## Coherence preview / public

| Aspect | Builder Preview | Site Public |
|--------|----------------|-------------|
| Rendu navbar | NavbarRenderer (isBuilder=true) | NavbarRenderer (isBuilder=false) |
| Liens | Desactives (preventDefault) | Actifs avec resolvePageSlug |
| Dropdowns | Fonctionnels | Fonctionnels |
| Mobile | Fonctionnel | Fonctionnel |
| Variantes | Toutes | Toutes |

Retrocompat : les sites sans `variant` utilisent l'ancien SitePublicNav.

## Fichiers modifies/crees

| Fichier | Action |
|---------|--------|
| `src/types/index.ts` | NavbarVariant, NavLink, NavSocialLink, NavConfig enrichi |
| `src/components/site-web/navbar/NavbarRenderer.tsx` | CREE — moteur 8 variantes |
| `src/components/site-web/builder/BuilderCanvas.tsx` | Ajout rendu navbar dans preview |
| `src/components/site-web/builder/NavFooterEditorPanel.tsx` | Reecrit — editeur complet |
| `src/components/site-public/SitePublicRenderer.tsx` | Integration NavbarRenderer |
| `src/lib/site-designs.ts` | Presets avec variant + id sur liens |

## QA

- TypeScript : 0 erreurs
- Next.js build : succes complet
- Retrocompatibilite : sites existants sans variant gardent l'ancien rendu
- Pas de regression sur les blocs existants
