# Unified Link Destination System Report

## Overview

Every link surface in the builder now supports **3 destination types**:
1. **Page interne** — navigate to an internal page
2. **Page externe** — navigate to an external URL
3. **Bloc de page** — scroll to a specific block/section within a page

## Architecture

### Anchor ID Convention
- Every block in the public renderer gets `id="block-{block.id}"` (stable, auto-generated)
- Custom `anchorId` from block settings takes priority when set
- Format: `#block-{uuid}` for programmatic targeting

### NavLink Type (navbar + footer)
```typescript
interface NavLink {
  id?: string;
  label: string;
  pageId?: string;       // internal page target
  url?: string;          // external URL
  blockId?: string;      // NEW — block scroll target
  openNewTab?: boolean;
  children?: NavLink[];
}
```

### FooterLink Type
```typescript
interface FooterLink {
  label: string;
  pageId?: string;
  url?: string;
  blockId?: string;      // NEW — block scroll target
}
```

### BlockLink Type (CTAs, buttons in blocks)
- Already had `anchor?: string` field in "internal" variant
- LinkEditor now shows a block picker instead of free text input
- Anchors use `block-{id}` format for consistency

### Resolution Function
```typescript
resolveNavLinkHref(link, site) → string
// Examples:
// pageId only       → /s/subdomain/services
// pageId + blockId  → /s/subdomain/services#block-abc123
// blockId only      → #block-abc123  (same-page scroll)
// url only          → https://external.com
```

## Surfaces Updated

| Surface | Editor | Public Renderer | Block Targeting |
|---------|--------|-----------------|-----------------|
| Navbar links | NavFooterEditorPanel | SitePublicRenderer (SitePublicNav) | Yes |
| Navbar dropdown children | NavFooterEditorPanel | NavbarRenderer | Yes |
| Footer links | NavFooterEditorPanel | SitePublicRenderer (SitePublicFooter) | Yes |
| Block CTAs (10+ editors) | LinkEditor | SmartLinkButton / getBlockLinkProps | Yes |
| NavbarRenderer (variant system) | resolveHref prop | NavbarRenderer | Yes |

## Block Targeting UX

When a page is selected in any link editor:
1. A second dropdown appears: "Page entiere" or specific block
2. Blocks are listed with readable labels: `{Type Name} — {title if available}`
3. Only visible blocks are shown
4. Changing page resets block selection

### Label Generation
```
getBlockLabel(block) → "Hero — Mon titre de page..."
                     → "Pricing Table" (no title available)
                     → "Services Premium — Nos services..."
```

## Smooth Scroll Behavior

- Click handler intercepts `<a href="...#block-*">` clicks on same page
- Scrolls with `behavior: "smooth"` and navbar offset (sticky nav height + 16px margin)
- Updates URL hash via `history.pushState` (no page jump)
- Cross-page block links work normally (navigate + browser handles hash)
- `html.smooth-scroll` CSS class already present

## Files Modified

| File | Change |
|------|--------|
| `src/types/index.ts` | Added `blockId` to NavLink, created FooterLink type with blockId |
| `src/lib/site-utils.ts` | Added `resolveNavLinkHref()` and `getBlockLabel()` |
| `src/lib/links.ts` | Cleaned up `resolveBlockLink()` anchor handling |
| `src/components/site-web/editors/LinkEditor.tsx` | Block picker dropdown in "Page interne" tab |
| `src/components/site-web/builder/NavFooterEditorPanel.tsx` | Block picker for nav links, child links, footer links |
| `src/components/site-public/SitePublicRenderer.tsx` | Stable block IDs, smooth scroll handler, resolveNavLinkHref usage |

## Edge Cases Handled

| Case | Behavior |
|------|----------|
| Block deleted after being targeted | Link navigates to page (hash won't match, no error) |
| No visible blocks on page | Block picker not shown |
| Block on different page | Full URL with hash: `/s/sub/page#block-id` |
| Custom anchorId on block | Takes priority over auto-generated `block-{id}` |
| Legacy links (no blockId) | Work unchanged — backward compatible |
| NavLink with only URL | External URL takes precedence |

## Validation
- `tsc --noEmit` — pass
- `next build` — pass
