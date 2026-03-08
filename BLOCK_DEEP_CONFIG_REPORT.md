# Block Deep Configuration & Media Hardening Report

## Sprint Overview
Date: 2026-03-08
Scope: Deepen block system — media handling, before/after visual support, gallery adaptation, desktop-first preview, ImageUploader component.

---

## Phase 1 — Audit Results

### Internal Image / Internal Linking
- **Root cause identified**: There was NO image upload/picker component in the builder. All image fields were plain `<input type="text">` for pasting URLs manually.
- **BlockLink system**: Already functional (internal page, external URL, product, none) via `LinkEditor.tsx` and `SmartLinkButton.tsx`. Resolution pipeline works correctly in both preview and public contexts.
- **Fix**: Created `ImageUploader` component with drag-drop file upload to Supabase storage, URL fallback input, preview thumbnails, change/remove buttons.

### Before/After Blocks
- `ProjectBeforeAfterBlockContent` had NO image fields — only text labels (beforeLabel, afterLabel, resultText, description).
- Older `before-after` and `before-after-pro` blocks had images but used plain URL inputs.

### Gallery/Portfolio Blocks
- `ProjectMasonryWallBlockPreview` used fixed pixel heights (`200px`, `260px`, etc.) regardless of image content.
- `GalleryStackedStoryboardBlockPreview` forced `aspect-[16/9]` on all images.
- Gallery editors used plain text inputs for image URLs.

### Preview Mode
- `PreviewSandbox.tsx` rendered blocks inside a 300px-wide panel without scaling, making all blocks appear in "mobile mode".
- The main builder canvas `BuilderCanvas.tsx` correctly supports desktop/tablet/mobile breakpoints.

---

## Phase 2 — ImageUploader Component

**File**: `src/components/site-web/editors/ImageUploader.tsx`

Features:
- Drag-and-drop zone with visual feedback
- File upload via `POST /api/upload` to Supabase `order-uploads` bucket
- Image preview with hover overlay (change/remove buttons)
- URL text input fallback for external images
- Configurable preview aspect ratio
- 10MB file size limit with error handling
- Loading spinner during upload

### Editors Upgraded with ImageUploader (25+ files)

| Editor Family | Files Updated |
|---|---|
| Hero blocks | HeroBlockEditor, HeroSplitGlowBlockEditor, HeroSplitPortfolioBlockEditor, HeroDarkSaasBlockEditor, HeroCreatorBrandBlockEditor |
| Before/After | BeforeAfterBlockEditor, BeforeAfterProBlockEditor, ProjectBeforeAfterBlockEditor |
| Portfolio/Gallery | ProjectsGridCasesBlockEditor, ProjectsHorizontalBlockEditor, ProjectMasonryWallBlockEditor, Gallery3UpStripBlockEditor, GalleryStackedStoryboardBlockEditor, PortfolioGridBlockEditor, PortfolioMasonryBlockEditor, MasonryGalleryBlockEditor |
| Media | MediaFeaturedVideoBlockEditor, TestimonialsVideoBlockEditor |
| Content | ContentFeatureArticleBlockEditor, Content3ArticlesBlockEditor, BlogPreviewBlockEditor |
| Products | Products3CardShopBlockEditor, ProductFeaturedCardBlockEditor, ProductBenefitsMockupBlockEditor |
| Social/Team | ResultsLogosQuotesBlockEditor, TeamMiniGridBlockEditor |
| About | AboutPersonalStoryBlockEditor |
| Full Image | FullImageBlockEditor |

---

## Phase 3 — Before/After Transformation Blocks

### Type Changes (`src/types/index.ts`)

**Before:**
```typescript
export interface ProjectBeforeAfterBlockContent {
  title: string;
  items: { beforeLabel: string; afterLabel: string; resultText: string; description: string }[];
}
```

**After:**
```typescript
export interface ProjectBeforeAfterBlockContent {
  title: string;
  subtitle?: string;
  items: {
    beforeLabel: string;
    afterLabel: string;
    beforeImageUrl?: string;   // NEW
    afterImageUrl?: string;    // NEW
    resultText: string;
    metricBadge?: string;      // NEW
    description: string;
    category?: string;         // NEW
  }[];
}
```

### Preview Component Rewrite

**File**: `src/components/site-web/blocks/ProjectBeforeAfterBlockPreview.tsx`

New rendering:
- When images present: side-by-side visual comparison (before arrow after) with image slots
- When no images: text-only fallback (preserved backward compatibility)
- Category badge per item
- Metric badge display (e.g., "+250%")
- Subtitle support in header
- Responsive grid (1/2/3 columns)

### Editor Rewrite

**File**: `src/components/site-web/editors/ProjectBeforeAfterBlockEditor.tsx`

New controls per transformation item:
- Category input
- **Before section** (colored background): ImageUploader + label input
- **After section** (indigo tint background): ImageUploader + label input
- Metric badge input + result text input (side by side)
- Description textarea
- Add/remove transformation items

---

## Phase 4 — Portfolio/Gallery Image Adaptation

### ProjectMasonryWallBlockPreview
**Before**: Fixed pixel heights (`heights = ["200px", "260px", "180px", ...]`)
**After**: Natural image flow with `minHeight: 160px`, `maxHeight: 320px`, `object-cover`. Placeholder items use varied aspect ratios (`3/4`, `4/3`, `1/1`, `3/5`, `5/3`, `4/5`) for visual interest.

### GalleryStackedStoryboardBlockPreview
**Before**: Forced `aspect-[16/9]` on all images
**After**: Removed forced aspect ratio, uses `maxHeight: 480px` + `minHeight: 200px` with `object-cover` for adaptive heights.

### Gallery3UpStripBlockPreview
Kept `aspect-[4/3]` — appropriate for 3-column strip layout.

### ProjectsGridCasesBlockPreview
Kept `aspect-[16/10]` — appropriate for case study cards.

---

## Phase 5 — Desktop-First Preview

### PreviewSandbox Fix

**File**: `src/components/site-web/builder/PreviewSandbox.tsx`

**Before**: Block rendered at natural width inside 300px panel = mobile appearance
**After**: Block rendered at 1024px width with `transform: scale(0.27)` to fit 300px panel = desktop-like preview

This means users see the real desktop layout of each block in the block picker sidebar.

---

## Phase 6 — Block Content Editors (50 new blocks)

All 50 new blocks now have content editors wired in `BlockEditor.tsx`:

| Category | Editors |
|---|---|
| Hero (5) | HeroSplitPortfolio, HeroMinimalService, HeroDarkSaas, HeroCreatorBrand, HeroVideoShowreel |
| Portfolio (5) | ProjectsGridCases, ProjectsHorizontal, ProjectBeforeAfter, ProjectTimeline, ProjectMasonryWall |
| Services (4) | Services3CardPremium, ServicesIconGrid, ServicesSplitValue, ServicesProcessOffers |
| Products (4) | ProductFeaturedCard, Products3CardShop, ProductBundleCompare, ProductBenefitsMockup |
| Pricing (3) | Pricing3TierSaas, PricingCustomQuote, PricingMiniFaq |
| Testimonials (5) | Testimonials3Dark, TestimonialsVideo, ResultsLogosQuotes, NumbersImpact, ResultsTimeline |
| About/Team (3) | AboutPersonalStory, AboutStudioValues, TeamMiniGrid |
| Process (2) | Process4Steps, ProcessDetailedTimeline |
| FAQ (2) | FaqAccordionFull, Faq2Column |
| CTA (3) | CtaCenteredStrong, CtaSplitText, CtaDarkGlow |
| Forms (3) | FormContactSimple, FormQuoteRequest, FormNewsletterLead |
| Media (3) | MediaFeaturedVideo, Gallery3UpStrip, GalleryStackedStoryboard |
| Content (3) | ContentFeatureArticle, Content3Articles, ContentComparisonWhy |
| Social/Trust (2) | TrustBadges, SocialProofMarquee |
| Footer (2) | FooterSimplePremium, FooterMultiColumn |
| Creative (1) | SignatureCreativeClosing |

---

## Preview / Public Render Consistency

Both `BlockPreview.tsx` (builder) and `SitePublicRenderer.tsx` (public) use the SAME preview components for all 100 blocks. Changes to preview components automatically apply to both contexts.

Verified:
- `ProjectBeforeAfterBlockPreview` — same component in both contexts
- `ProjectMasonryWallBlockPreview` — same component in both contexts
- `GalleryStackedStoryboardBlockPreview` — same component in both contexts

---

## QA Scenarios

### Scenario A — Transformation Block
- [x] Select project-before-after block
- [x] Configure before/after text labels
- [x] Before/after image fields available via ImageUploader
- [x] Metric badge and category fields available
- [x] Preview shows visual side-by-side when images present
- [x] Preview shows text-only fallback when no images
- [x] Type-safe: `tsc --noEmit` passes

### Scenario B — Portfolio/Gallery Mixed Ratios
- [x] ProjectMasonryWall uses natural image heights (min 160px, max 320px)
- [x] No more fixed pixel heights forcing uniform look
- [x] Placeholder items use varied aspect ratios for masonry effect
- [x] GalleryStackedStoryboard uses adaptive image heights

### Scenario C — Image Upload
- [x] ImageUploader component renders drag-drop zone
- [x] URL fallback input available
- [x] Preview thumbnail shows after upload/URL entry
- [x] Change/remove buttons on hover overlay
- [x] Component reused across 25+ editors

### Scenario D — Desktop-First Preview
- [x] PreviewSandbox renders at 1024px width
- [x] Scale transform (0.27) fits 300px panel
- [x] Block layout appears desktop-like in picker

### Scenario E — Deeper Config
- [x] ProjectBeforeAfter: 8 fields per item (vs 4 before)
- [x] ImageUploader replaces plain URL inputs in 25+ editors
- [x] All 100 blocks have content editors

---

## Files Modified / Created

### New Files (52)
| File | Purpose |
|---|---|
| `src/components/site-web/editors/ImageUploader.tsx` | Reusable image upload component |
| 50 new block editor files | Content editors for new blocks |

### Modified Files (17)
| File | Changes |
|---|---|
| `src/types/index.ts` | Extended ProjectBeforeAfterBlockContent with image/metric/category fields |
| `src/lib/site-builder-context.tsx` | Updated defaultContent for project-before-after |
| `src/components/site-web/editors/BlockEditor.tsx` | +50 imports, +50 switch cases |
| `src/components/site-web/blocks/ProjectBeforeAfterBlockPreview.tsx` | Full rewrite with visual media support |
| `src/components/site-web/blocks/ProjectMasonryWallBlockPreview.tsx` | Adaptive image heights |
| `src/components/site-web/blocks/GalleryStackedStoryboardBlockPreview.tsx` | Adaptive image heights |
| `src/components/site-web/builder/PreviewSandbox.tsx` | Desktop-first scale rendering |
| 10 existing editors | Upgraded from URL inputs to ImageUploader |

---

## Build Validation

| Check | Result |
|---|---|
| TypeScript (`tsc --noEmit`) | 0 errors |
| Next.js build (`next build`) | Success |
| Jestly validation hooks | 23/23 passed |

---

## Remaining Future Opportunities

1. **Dedicated media library**: Browse/reuse previously uploaded images instead of re-uploading
2. **Image optimization**: Auto-resize/compress on upload, WebP conversion
3. **Crop mode selector**: Per-image object-fit control (cover/contain/fill)
4. **Item reordering**: Drag-and-drop reorder for repeated items in editors
5. **Image alt text**: Dedicated alt-text field per image for accessibility
6. **Video embed blocks**: YouTube/Vimeo URL validation and embed preview
7. **More block variants**: Style variants for portfolio/gallery blocks
8. **Responsive preview toggle**: Desktop/tablet/mobile toggle in block picker preview
