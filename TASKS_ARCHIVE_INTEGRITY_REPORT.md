# Tasks Archive Integrity Report

**Date**: 2026-03-07
**Status**: FIXED
**Severity**: P0 — data integrity / destructive mutation bug

---

## Symptom

User archives 1 task, but the archive page shows 3 tasks (all their tasks).

## Root Cause

**Category: Combined BACKEND FALLBACK BUG + UI ILLUSION (Scenario B)**

The bug is caused by the interaction between the production fallback code (added in the previous incident fix) and the missing migration 024.

### Three compounding failures:

**1. GET fallback returns ALL tasks on archive page**
When `GET /api/tasks?archived=true` fails (missing `archived_at` column), the fallback query returned ALL tasks without any archive filter. The archive page then displayed every task — not just archived ones.

**2. PATCH fallback silently drops the archive operation**
When `PATCH /api/tasks` with `{ archived: true }` fails (missing `archived_at` column), the fallback stripped `archived_at` from the update payload and retried. The retry succeeded but only updated `updated_at` — the task was NEVER actually archived in the database. Silent data loss.

**3. Optimistic UI creates illusion of success**
The frontend optimistically marked the task as `archived: true` in local state (hiding it from the board), then the PATCH "succeeded" (fallback returned 200). No rollback occurred because the request didn't throw. On the archive page, ALL tasks appeared due to issue #1.

### Result for user:
- Board: 1 task disappears (optimistic, not real)
- Archive page: 3 tasks appear (all tasks, due to unfiltered fallback)
- On board refresh: the "archived" task reappears (DB was never updated)
- User perception: "I archived 1, but 3 got archived"

## Backend Mutation Audit

The actual PATCH mutation is **correct by design**:
```sql
UPDATE tasks SET archived_at = ... WHERE id = :exactUUID AND user_id = :userId
```

- Uses `.eq("id", id)` — targets exactly one row by UUID
- Uses `.eq("user_id", user.id)` — security scoping
- Uses `.single()` — asserts exactly 1 row returned
- No title matching, no group/family matching, no bulk operation
- Duplicate tasks have independent UUIDs, no shared relation field

The bug was entirely in the fallback error handling layer, not in the core mutation.

## Duplicate/Copy System Analysis

`duplicateTask()` in `tasks-utils.ts`:
- Creates a new UUID via `createId()`
- Appends "(copie)" to title
- No `sourceTaskId`, `originalId`, or `duplicatedFrom` field exists
- Copies are fully independent records
- No parent/child or group relationship
- Archive by UUID cannot accidentally target siblings

**Conclusion**: The duplicate system is safe. No cross-contamination possible at the DB level.

## Fixes Applied

### Fix 1: GET fallback — empty archive view when column missing
When `GET /api/tasks?archived=true` primary query fails:
- **Before**: fallback returned ALL tasks (no archive filter)
- **After**: returns empty array `[]` (nothing can be archived if column doesn't exist)

### Fix 2: PATCH fallback — fail explicitly on archive operation
When `PATCH /api/tasks` with `archived: true/false` fails:
- **Before**: silently stripped `archived_at` and retried (archive silently lost)
- **After**: returns HTTP 500 with explicit error message about missing migration 024

### Fix 3: Frontend archive rollback on failure
In `TasksWorkspace.handleArchive()`:
- **Before**: fire-and-forget `.catch()` (no rollback on failure)
- **After**: `await` + rollback optimistic update if PATCH throws

### Fix 4: Full page archive error handling
In `[taskId]/page.tsx handleArchive()`:
- **Before**: `await` but no try/catch (unhandled rejection + redirect anyway on error)
- **After**: try/catch with user-visible error alert, no redirect on failure

## Files Touched

| File | Change |
|------|--------|
| `src/app/api/tasks/route.ts` | GET fallback: return `[]` for archive query. PATCH fallback: fail explicitly on archive ops |
| `src/components/taches/TasksWorkspace.tsx` | Archive handler: await + rollback on failure |
| `src/app/(dashboard)/taches/[taskId]/page.tsx` | Archive handler: try/catch with error feedback |
| `BLOCKERS.md` | Updated |

## Validation

- **Backend PATCH mutation**: targets single row by UUID (`.eq("id", id).eq("user_id", user.id).single()`)
- **Frontend all surfaces**: send exact `task.id` (UUID)
- **Drawer archive** (`TaskDetailDrawer.tsx:524`): `onArchive(local.id)` — correct
- **Full page archive** (`[taskId]/page.tsx:213`): `{ id: task.id }` — correct
- **Board archive** (`TasksWorkspace.tsx:398`): `handleArchive(id)` — correct with rollback
- **Restore** (`archive/page.tsx:28`): `{ id: taskId, archived: false }` — correct
- **TypeScript**: 0 errors
- **Next.js build**: success
- **No mock fallback reintroduced**

## QA Scenarios Validated (Code Audit)

### Scenario A — Single Normal Task
- Archive sends `{ id: exactUUID, archived: true }` → single row updated
- Board optimistic: only that task hidden
- If PATCH fails: rollback restores task to board

### Scenario B — Duplicate/Copy Tasks
- Each task has unique UUID from `createId()` / DB `gen_random_uuid()`
- No shared relation field (`sourceTaskId` etc.) exists
- Archive by UUID is guaranteed single-record
- Sibling copies unaffected

### Scenario C — Restore
- Restore sends `{ id: taskId, archived: false, status: "todo" }` → single row
- Same UUID-based targeting, same `.single()` assertion

### Scenario D — Multiple Surfaces
- Drawer, board, full page all use the same `task.id` wiring
- No surface sends title-based or group-based identifiers

## Remaining Risks

1. **Without migration 024**: archive/restore operations will fail with explicit error (not silently). User must apply migration 024 for archive functionality.
2. **Restore silent catch**: archive page `handleRestore` still has a silent catch — acceptable since `mutate()` refreshes from DB truth.
3. **Alert UX**: full page archive uses `alert()` for error feedback — could be improved to toast/inline message in future.
