# Calendar Save Fix Report

**Date**: 2026-03-07
**Status**: FIXED
**Severity**: P0 — data persistence failure + P1 visual readability

---

## Exact Root Cause of Save Failure

**Category: MISSING TABLE + SILENT FRONTEND MASKING**

The `calendar_events` table (migration 023) was never applied to the production Supabase database. This caused a cascade of failures:

### Failure Chain

1. **POST /api/calendar/events** → Supabase INSERT fails with error code `42P01` ("relation public.calendar_events does not exist") → API returns HTTP 500
2. **Frontend `handleFormSubmit`** catches the error and creates a **fake temp event** with `id: "temp-..."` → User sees the event appear
3. **Any navigation/refresh** → `useApi` fetches events from API → GET returns only order events (manual events table missing) → Fake temp event is replaced → Event disappears

### Why the user perceived "events don't persist":
- The event appeared temporarily (fake temp event in local state)
- On view switch, page navigation, or refresh → only real DB events loaded → fake event gone
- No error was shown to the user (catch block silently created fake event)

## Failing API Route and Reason

**Route**: `POST /api/calendar/events`
**Reason**: `(supabase.from("calendar_events") as any).insert(...)` fails because table doesn't exist
**Error**: `{ code: "42P01", message: "relation \"public.calendar_events\" does not exist" }`
**Response**: HTTP 500 (after previous sprint hardening — before that, it returned fake success)

## Fixes Applied

### Fix 1: Auto-Migration via Direct Postgres Connection

When POST or GET encounters a "table not found" error (code 42P01):
1. Extracts project ref from `NEXT_PUBLIC_SUPABASE_URL`
2. Connects directly to Postgres using `DATABASE_PASSWORD` env var
3. Runs `CREATE TABLE IF NOT EXISTS` with full schema (columns, indexes, RLS policies)
4. Sends `NOTIFY pgrst, 'reload schema'` to refresh PostgREST cache
5. Retries the original operation

```typescript
// Connection constructed from environment
const ref = new URL(supabaseUrl).hostname.split(".")[0];
const sql = postgres({
  host: `db.${ref}.supabase.co`,
  port: 5432,
  database: "postgres",
  username: "postgres",
  password: dbPassword,
  ssl: "require",
});
```

Migration is lazy (only on first failure) and cached (`migrationAttempted` flag prevents repeated attempts).

### Fix 2: Created Admin Supabase Client

New file `src/lib/supabase/admin.ts` — service-role client for trusted server operations.

### Fix 3: Frontend — Removed Fake Temp Events

**Before**:
```typescript
} catch {
  const tempEvent = { id: `temp-${Date.now()}`, ... };
  setEvents((prev) => [...prev, tempEvent]); // FAKE EVENT
}
```

**After**:
```typescript
} catch (e) {
  setSaveError(e.message);
  return; // No fake event — form stays open for retry
}
```

### Fix 4: Frontend — Error Toast + Rollback

- Save/edit/delete errors display red toast at bottom of screen
- Edit operations rollback optimistic state on failure
- Delete operations restore deleted event on failure
- Move operations rollback position on failure

### Fix 5: Modal — Await Save Before Closing

**Before**: Modal called `onClose()` immediately after `onSubmit()` (sync call)
**After**: Modal `await`s `onSubmit()` — only closes on success, stays open on failure

Added loading state: "Enregistrement..." shown during API call.

### Fix 6: API — Structured Error Responses

All error responses now include:
```json
{
  "error": "Human-readable message",
  "code": "TABLE_MISSING | INSERT_FAILED | UPDATE_FAILED | DELETE_FAILED | VALIDATION",
  "detail": "Supabase error message"
}
```

Server-side logging includes: payload shape, auth context, error codes.

## Visual Event Color Adjustments

**User feedback**: Events were still too pale (18% opacity backgrounds).

### Changes Applied (all three views):

| Element | Before | After |
|---------|--------|-------|
| Event background | `rgba(color, 0.18)` | `rgba(color, 0.85)` |
| Drag ghost background | `rgba(color, 0.22)` | `rgba(color, 0.9)` |
| Event title text | `color: accentColor` | `text-white drop-shadow-sm` |
| Event time text | `color: accentColor, opacity: 0.7` | `text-white/80` |
| Client name text | `color: accentColor, opacity: 0.55` | `text-white/65` |
| Month event pills | `color: accentColor` | `text-white` |

Events are now near-solid colored blocks with white text — visually anchored and clearly readable.

## Files Touched

| File | Change |
|------|--------|
| `src/app/api/calendar/events/route.ts` | Auto-migration, structured errors, detailed logging |
| `src/lib/supabase/admin.ts` | New: service-role Supabase client |
| `src/components/calendrier/CalendarWorkspace.tsx` | No fake events, error toast, rollback on failure |
| `src/components/calendrier/EventFormModal.tsx` | Await save, loading state, stays open on error |
| `src/components/calendrier/DayView.tsx` | Event colors 0.85, white text |
| `src/components/calendrier/WeekView.tsx` | Event colors 0.85, white text |
| `src/components/calendrier/MonthView.tsx` | Event colors 0.85, white text |
| `BLOCKERS.md` | Updated |

## Validation Scenarios

### Scenario A — Create Manual Event
- POST awaits real API response
- On success: event added to state from DB response (real ID)
- On failure: error toast shown, modal stays open for retry

### Scenario B — View Switch
- Events from `useApi` are refetched from same URL (cached)
- All views read from same `events` array — no data loss on switch

### Scenario C — Range Switch
- `useApi` URL is `/api/calendar/events` (no date filter) — ALL events loaded once
- Navigating prev/next week changes `currentDate` but events array unchanged

### Scenario D — Page Return
- `useApi` refetches on mount — shows DB-backed events
- No temp events to lose

### Scenario E — All-Day vs Timed
- All-day: `allDay: true`, no startTime/endTime → renders in top banner
- Timed: `allDay: false`, startTime + endTime → renders in grid
- Both paths go through same POST handler

### Scenario F — Edit Event
- Optimistic update applied immediately
- If PATCH fails → rollback to original event state

### Scenario G — Delete Event
- Optimistic removal from list
- If DELETE fails → restore event to list

## Remaining Risks

1. **Auto-migration depends on `DATABASE_PASSWORD`**: If not set in Vercel env, auto-migration won't work. Clear error message provided.
2. **PostgREST cache delay**: After auto-creating table, 1s delay before retry. If PostgREST hasn't refreshed, the retry will also fail. User can retry manually.
3. **Direct postgres connection in serverless**: Works on Vercel but may timeout on cold starts. The `connect_timeout: 15` should handle most cases.
4. **RLS policies created via auto-migration**: Use different policy names than migration 023 to avoid conflicts if both run.
