# Tasks Production Incident Report

**Date**: 2026-03-07
**Status**: FIXED
**Severity**: P0 — page completely broken in production

---

## Symptom

Production deployment on jestly.fr shows:
```
Erreur : Erreur de chargement des taches
```
The `/taches` page loads but all task data fails to fetch.

## Exact Failing Path

```
/taches (page.tsx)
  → TasksWorkspace (client component)
    → useApi<Task[]>("/api/tasks")
      → GET /api/tasks (route.ts)
        → getAuthUser() ✓ (auth works)
        → supabase.from("tasks").select("*").eq("user_id", ...).is("archived_at", null)
        → FAILS: column "archived_at" does not exist
        → Returns HTTP 500 { error: "Erreur de chargement des taches" }
      → useApi sets error state
    → Renders error UI
```

## Root Cause

**Category: DB SCHEMA MISMATCH (B)**

The migration `024_tasks_upgrade.sql` adds 6 columns to the `tasks` table:
- `client_id` (UUID)
- `client_name` (TEXT)
- `order_title` (TEXT)
- `tags` (JSONB)
- `subtasks` (JSONB)
- `archived_at` (TIMESTAMPTZ)

This migration was **not applied** to the production Supabase instance.

The code deployed to production (via git push to Vercel) references these columns in:
1. **GET /api/tasks** — `.is("archived_at", null)` filter
2. **POST /api/tasks** — inserts `client_id`, `client_name`, `order_title`, `tags`, `subtasks`, `archived_at`
3. **PATCH /api/tasks** — updates same columns

Since `archived_at` doesn't exist in production DB, the SELECT query fails with Postgres error `42703`, and the API returns 500.

## Production-Only Differences

| Aspect | Local Dev | Production |
|--------|-----------|------------|
| Migration 024 | Applied | NOT applied |
| `archived_at` column | Exists | Missing |
| `client_name` column | Exists | Missing |
| `tags` JSONB column | Exists | Missing |
| `subtasks` JSONB column | Exists | Missing |
| Priority constraint | `medium` valid | Only `normal` valid |

## Fix Applied

### 1. Resilient GET query (fallback without `archived_at`)
If the primary query with `.is("archived_at", null)` fails, the API now retries with a simple `select("*").eq("user_id", ...)` without the archive filter.

### 2. Resilient POST (minimal insert fallback)
If the full insert (with all 024 columns) fails, retries with only the original schema columns. Maps `medium` back to `normal` for the priority constraint.

### 3. Resilient PATCH (safe update fallback)
If the full update fails, strips migration-024-only fields and retries.

### 4. Robust mapper
`mapRowToTask()` now handles:
- Missing columns (returns safe defaults)
- `priority: "normal"` → maps to `"medium"`
- Unknown status/priority values → defaults
- JSONB tags/subtasks that might be strings
- Null/malformed rows (filtered out)

### 5. Actionable error messages
- Server logs now include Supabase error code + message
- Client error includes the specific failure reason (not just generic text)
- Warning logs when fallback succeeds → flags that migration 024 is not applied

### 6. Better error UI
- Error state shows a styled card with retry button instead of plain text

## Files Touched

| File | Change |
|------|--------|
| `src/app/api/tasks/route.ts` | GET/POST/PATCH fallback queries, robust mapper, detailed logging |
| `src/components/taches/TasksWorkspace.tsx` | Improved error UI with actionable info |
| `BLOCKERS.md` | Updated |

## Required Action: Apply Migration 024

The fallback queries work but lose functionality (no archive filter, no tags/subtasks/client fields).

**To fully fix production**, run migration 024 on the production Supabase instance:

```sql
-- Run in Supabase SQL Editor (production project)
-- Content of: supabase/migrations/024_tasks_upgrade.sql

ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS client_name TEXT,
  ADD COLUMN IF NOT EXISTS order_title TEXT,
  ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS subtasks JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ DEFAULT NULL;

ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_status_check
  CHECK (status IN ('todo', 'in_progress', 'done', 'completed'));

UPDATE public.tasks SET priority = 'medium' WHERE priority = 'normal';

ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_priority_check;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_priority_check
  CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

CREATE INDEX IF NOT EXISTS idx_tasks_archived_at ON public.tasks(archived_at);
CREATE INDEX IF NOT EXISTS idx_tasks_client_id ON public.tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
```

## Validation

- TypeScript: 0 errors
- Next.js build: success
- GET /api/tasks: works with or without migration 024
- POST /api/tasks: works with or without migration 024
- PATCH /api/tasks: works with or without migration 024
- Malformed rows: filtered, not crashed
- No mock fallback reintroduced

## Remaining Risks

1. **Without migration 024**: archive, tags, subtasks, client fields won't persist. Tasks load but with reduced functionality.
2. **Calendar events API**: not audited in this incident — may have similar schema issues if calendar migration was also not applied.
3. **Other migrations**: should verify all 24 migrations are applied to production.
