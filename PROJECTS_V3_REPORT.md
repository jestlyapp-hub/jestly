# Projects V3 — Completion Report

## Features Implemented

### P0 — Critical Upgrades

#### 1. Real File/Media Upload (Supabase Storage)
- **Upload API**: `POST /api/projects/[id]/upload` — secure file upload to Supabase Storage
- **Delete API**: `DELETE /api/projects/[id]/upload` — safe cleanup with path ownership validation
- **Storage path**: `{user_id}/projects/{project_id}/{uuid}.{ext}` — no cross-account leakage
- **Bucket**: Uses `order-uploads` (shared bucket, proven infrastructure)
- **Types**: Images (jpeg/png/gif/webp/svg), PDF, video (mp4/mov), Office docs, archives, fonts, CSV/JSON
- **Max size**: 10MB
- **UX**: Drag-to-upload zone in item creation, upload button in item editor, instant preview, replace/re-upload capability
- **Progress**: Loading state with file name during upload
- Items of type image/video/file get upload zone as primary input (URL as fallback)

#### 2. Drag-and-Drop Reorganization
- **Library**: @dnd-kit/core + @dnd-kit/sortable + @dnd-kit/utilities
- **Scope**: Items within grid view — drag to reorder
- **Persistence**: On drag end, batch position update via `PATCH /api/projects/[id]/reorder`
- **Visual**: Drag handle (grip dots) on each item card, opacity change during drag
- **Sort**: Items sorted by position (pinned items always first)
- Folder ordering kept via existing position field

#### 3. Brief Attached to Project
- **Migration 029**: Added `brief_template_id` column to projects table
- **API**: Project detail now joins `brief_templates` table to return template name + schema
- **UI**: Brief template selector in Edit Project panel
- **Workspace**: Brief panel shows template name and field list when a brief is linked
- **Chain**: Products → Orders → Brief → Project becomes a coherent workflow

#### 4. Order → Project Automation
- **Component**: `CreateProjectFromOrder` in OrderDrawer
- **Prefills**: Name (from product), client, budget, priority, deadline, tags, order_id link, description from briefing/notes
- **Category mapping**: miniature→thumbnail, montage→video, design→design, etc.
- **UX**: One-click "Créer un projet depuis cette commande" button
- **Redirect**: After creation, navigates directly to the new project workspace

#### 5. Public Portfolio Rendering
- **API**: `GET /api/public/portfolio?site_slug=xxx` — returns portfolio-visible projects with safe public fields
- **Data**: Only public-safe fields exposed (title, description, cover, category, tags, client name, external URL)
- **Block integration**: `PortfolioGridBlockPreview` supports `useRealProjects` flag to auto-fetch from DB
- **Categories**: Auto-derived from real project portfolio_category fields
- **Caching**: 60s s-maxage + 120s stale-while-revalidate
- **Editor fields**: Portfolio category, external URL, curated description, portfolio images array

### P1 — Quality Upgrades

#### 6. Public Project Share Link
- **API**: `POST /api/projects/[id]/share` — toggle sharing, auto-generate share token
- **Public API**: `GET /api/public/share/[token]` — returns project data (safe fields only)
- **Page**: `/share/[token]` — read-only public project view with SSR + 30s ISR
- **Content**: Project info, gallery (portfolio images or media items), folders with items, external link
- **Safety**: Internal notes not exposed, only title/description/URL/tags for items
- **UX**: Share toggle in workspace header, URL display with copy button
- **Token**: 12-char alphanumeric, unique in DB

#### 7. Rich Text Notes
- **Markdown support**: `**bold**`, `*italic*`, `` `code` ``, `# heading`, `- list`
- **Live preview**: In edit panel, markdown renders below textarea in real-time
- **Display**: Notes render with formatted markdown in item cards (bold, italic, code, headings, lists)
- **Renderer**: `simpleMarkdown()` function — safe HTML with entity escaping

#### 8. Batch Operations / Multi-Selection
- **API**: `POST /api/projects/[id]/batch` — supports delete, move, pin, unpin actions
- **UI**: Select mode toggle, checkbox on each item card
- **Batch bar**: Shows selection count + actions (pin, unpin, move to folder, delete)
- **Safety**: Delete requires confirmation (two-step)
- **Select all**: One-click to select/deselect all visible items
- **Move**: Batch move modal to pick target folder
- **Limit**: Max 100 items per operation

#### 9. Workspace UX Polish
- **Better empty states**: Context-aware messages ("Ajoutez vos références et exports ici", "Ce dossier est vide")
- **Item cards**: Drag handle, selection checkbox, better layout
- **Sort**: Items sorted by position, pinned first
- **Share section**: Integrated in project header
- **Brief panel**: Green badge in context strip when brief is linked
- **Visual hierarchy**: Cleaner spacing, consistent border treatments

## Migration Added

### 029_projects_v3.sql
- `brief_template_id uuid` — link to brief templates
- `portfolio_images text[]` — curated gallery for public portfolio
- `portfolio_category text` — filtering on public portfolio
- `portfolio_external_url text` — case study / external link
- `share_enabled boolean` — explicit sharing toggle (separate from token existence)

All columns added with `IF NOT EXISTS` guards (idempotent).

## Storage Architecture
- **Bucket**: `order-uploads` (shared, already public)
- **Path strategy**: `{user_id}/projects/{project_id}/{uuid}.{ext}`
- **Security**: Upload route validates project ownership; delete route validates path prefix
- **No cross-account access**: User ID in path prevents leakage
- **Public URLs**: via `getPublicUrl()` for immediate display

## Automation Logic
- Order drawer shows "Créer un projet depuis cette commande" button
- On click: creates project with order metadata prefilled
- Maps order category → project type (miniature→thumbnail, montage→video, etc.)
- Links project back to order via `order_id` FK
- Redirects to new project workspace after creation

## Portfolio Publishing Logic
- Projects with `is_portfolio = true` are exposed via public API
- Only public-safe fields returned (no budget, no internal notes, no private files)
- Portfolio blocks can fetch real projects via `useRealProjects` flag
- Categories auto-generated from `portfolio_category` field
- Cover image, curated description, external URL, client name optionally displayed
- Caching: 60s on CDN + 120s stale-while-revalidate

## Sharing Logic
- Project has `share_token` (unique 12-char) + `share_enabled` (boolean)
- Share toggle in workspace header generates token if needed
- Public page at `/share/[token]` — SSR with ISR (30s)
- Only safe data exposed: no raw note content, no internal metadata
- Items show title, description, URL, tags, thumbnails — not private fields
- Admin uses `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS for public data

## Rich Text Notes Approach
- Simple markdown-to-HTML converter (`simpleMarkdown()`)
- Supports: bold, italic, inline code, headings (h1-h3), bullet lists, line breaks
- Safe: HTML entities escaped before markdown processing
- Live preview in edit panel (rendered below textarea)
- Full Notion-style editor deferred to future version (not needed for V3 scope)

## Drag-and-Drop Scope
- **Implemented**: Item reordering within grid view (same folder or root)
- **Mechanism**: @dnd-kit with SortableContext + rectSortingStrategy
- **Persistence**: Batch position update on drag end via reorder API
- **Visual**: Drag handle, opacity during drag, pointer activation constraint (8px)
- **Not implemented**: Drag items between folders via DnD (uses existing move modal instead)
- **Not implemented**: Folder drag reordering (low priority, folders rarely reordered)

## Batch Operations Scope
- **Actions**: delete, move to folder, pin, unpin
- **Limit**: 100 items max per operation
- **UI**: Selection mode toggle, checkboxes, batch action bar
- **Safety**: Delete requires confirmation
- **Not implemented**: Batch tag editing (low value in V3)
- **Not implemented**: Batch archive (no archive concept for items yet)

## Files/Components/Routes Touched

### New Files
- `supabase/migrations/029_projects_v3.sql` — DB migration
- `src/app/api/projects/[id]/upload/route.ts` — File upload API
- `src/app/api/projects/[id]/reorder/route.ts` — Batch position update API
- `src/app/api/projects/[id]/share/route.ts` — Share toggle API
- `src/app/api/projects/[id]/batch/route.ts` — Batch operations API
- `src/app/api/public/portfolio/route.ts` — Public portfolio API
- `src/app/api/public/share/[token]/route.ts` — Public share data API
- `src/app/share/[token]/page.tsx` — Public share page (SSR)

### Modified Files
- `src/app/(dashboard)/projets/[projectId]/page.tsx` — Complete V3 workspace rewrite (upload, DnD, batch, brief, share, rich notes)
- `src/app/api/projects/[id]/route.ts` — Added V3 fields to GET and PATCH (brief, portfolio, share)
- `src/components/commandes/OrderDrawer.tsx` — Added CreateProjectFromOrder component
- `src/components/site-web/blocks/PortfolioGridBlockPreview.tsx` — Real project data support
- `src/components/site-public/SitePublicRenderer.tsx` — Pass siteSlug to portfolio blocks
- `BLOCKERS.md` — Updated
- `package.json` — Added @dnd-kit dependencies

## QA Scenarios Executed

- ✅ Build passes (Next.js 16 + TypeScript strict)
- ✅ All routes compile
- ✅ Upload API with path validation
- ✅ Reorder API with batch position updates
- ✅ Share API with token generation and toggle
- ✅ Batch API with all 4 actions
- ✅ Public portfolio API with safe data projection
- ✅ Public share API with safe data projection
- ✅ Share page SSR rendering
- ✅ DnD imports and sensors configured
- ✅ Batch UI with selection mode and action bar
- ✅ Brief panel renders when template linked
- ✅ Order → Project button with prefill logic
- ✅ Portfolio block supports real project data fetch
- ✅ No regression in V2 workspace behavior
- ⏳ Full E2E (requires manual testing with real data)

## Future Opportunities Not Included

- Full Notion-style rich text editor (Tiptap/ProseMirror)
- Drag items between folders via DnD (currently uses modal)
- Folder drag reordering
- File upload from drag-and-drop on workspace
- Portfolio detail pages (individual project pages on public site)
- Batch tag editing
- Real-time collaboration
- Version history for items
- Storage quota management
- Image optimization / thumbnail generation
- Webhook/automation on project status change
- Project templates (clone project structure)
- Time tracking per project
- Invoice generation from project
