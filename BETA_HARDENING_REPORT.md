# Beta Hardening Report

## Sprint Summary

Pre-beta reliability sprint focused on fixing silent failures, security flaws, and missing error feedback across Builder, Leads CRM, and Projects V3.

---

## Fixes Applied

### SECURITY (P0)

#### 1. Share Route — Ownership Verification
- **File**: `src/app/api/projects/[id]/share/route.ts`
- **Issue**: No project ownership check — any authenticated user could toggle sharing on any project
- **Fix**: Added `user_id` verification via `eq("user_id", auth.user.id)` before allowing share toggle
- **Severity**: Critical

### BUILDER (P0)

#### 2. Publish Flow — Error Checking
- **File**: `src/app/api/sites/[id]/publish/route.ts`
- **Issue**: Page update errors and snapshot insert errors were unchecked (fire-and-forget)
- **Fix**: Added error checking for page updates (logged) and snapshot inserts (returns 500 on failure)

#### 3. Publish Error — User Feedback
- **File**: `src/components/site-web/builder/BuilderToolbar.tsx`
- **Issue**: Publish errors were logged to console only, no message shown to user
- **Fix**: Added `publishError` state + error tooltip below publish button showing the actual error message for 6 seconds

### LEADS CRM (P0)

#### 4. ContactForm — leadCtx + Error Feedback
- **File**: `src/components/site-web/blocks/ContactFormBlockPreview.tsx`
- **Issue**: (1) No `leadCtx` prop — page_path attribution missing; (2) Silent catch on submission error
- **Fix**: Added `leadCtx` prop with `page_path` in lead payload; added response validation (`res.ok`); added visible error message to user

#### 5. CustomForm — leadCtx + Error Feedback
- **File**: `src/components/site-web/blocks/CustomFormBlockPreview.tsx`
- **Issue**: Same as ContactForm
- **Fix**: Same — `leadCtx` prop, `page_path`, response check, error message

#### 6. SitePublicRenderer — Pass leadCtx to Forms
- **File**: `src/components/site-public/SitePublicRenderer.tsx`
- **Issue**: `contact-form` and `custom-form` blocks were rendered without `leadCtx`
- **Fix**: Added `leadCtx={lp}` to both block renderers

#### 7. Leads Dashboard — updateLead Error Handling
- **File**: `src/app/(dashboard)/site-web/[siteId]/leads/page.tsx`
- **Issue**: `updateLead()` had no try/catch — errors silently ignored, UI updated as if successful
- **Fix**: Wrapped in try/catch with error alert, moved `mutate()` inside try block

### PROJECTS V3 (P0)

#### 8. Portfolio API — Filter Archived Projects
- **File**: `src/app/api/public/portfolio/route.ts`
- **Issue**: Archived projects were included in public portfolio
- **Fix**: Added `.neq("status", "archived")` filter

#### 9. Workspace — 11 Silent Catch Blocks
- **File**: `src/app/(dashboard)/projets/[projectId]/page.tsx`
- **Issue**: 11 `catch { /* */ }` blocks — user never saw errors for delete, pin, reorder, batch, share, move, rename operations
- **Fix**:
  - Added `toastError` state + `showError()` helper for main component (8 catches)
  - Added `alert()` for modal components (3 catches — RenameFolderModal, MoveItemModal, BatchMoveModal)
  - Added animated error toast (bottom-right, auto-dismiss 4s)

#### 10. CreateProjectFromOrder — Error Feedback
- **File**: `src/components/commandes/OrderDrawer.tsx`
- **Issue**: Catch block only reset `creating` state — no error shown to user
- **Fix**: Added `createError` state with visible error message below button

---

## Files Modified

| File | Changes |
|------|---------|
| `src/app/api/projects/[id]/share/route.ts` | Ownership verification |
| `src/app/api/public/portfolio/route.ts` | Filter archived projects |
| `src/app/api/sites/[id]/publish/route.ts` | Page update + snapshot error handling |
| `src/components/site-web/builder/BuilderToolbar.tsx` | Publish error tooltip |
| `src/components/site-public/SitePublicRenderer.tsx` | Pass leadCtx to contact-form & custom-form |
| `src/components/site-web/blocks/ContactFormBlockPreview.tsx` | leadCtx prop, error feedback |
| `src/components/site-web/blocks/CustomFormBlockPreview.tsx` | leadCtx prop, error feedback |
| `src/app/(dashboard)/site-web/[siteId]/leads/page.tsx` | updateLead error handling |
| `src/app/(dashboard)/projets/[projectId]/page.tsx` | 11 silent catches → error toasts |
| `src/components/commandes/OrderDrawer.tsx` | CreateProjectFromOrder error feedback |

## Build Status

- ✅ `next build` passes (Next.js 16.1.6 + Turbopack)
- ✅ All routes compile
- ✅ No TypeScript errors
