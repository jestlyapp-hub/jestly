# Calendar Hard Fix — Persistence + Readability Report

**Date**: 2026-03-07
**Status**: FIXED
**Severity**: P1 — data persistence + visual readability

---

## Symptoms

1. **Manual calendar events disappear** when switching view (day/week/month) or navigating dates
2. **Calendar grid too white/faint** — hour lines and borders barely visible
3. **Event colors too pale** — ~7% opacity backgrounds, hard to read

## Root Causes

### 1. Persistence: Silent Error Handling + Mock Masking

The API route (`/api/calendar/events`) had multiple layers of silent failure:

- **POST**: On insert failure, returned a fake event with `id: "temp-..."` and HTTP 201. The frontend believed the event was saved, but nothing reached the database. On next fetch, the event was gone.
- **GET**: On query failure, returned `MOCK_CALENDAR_EVENTS` (hardcoded array). User saw mock data instead of their real events, masking the fact that the `calendar_events` table might not exist.
- **PATCH/DELETE**: On failure, returned `{ ok: true }` — silent success on actual failure.

### 2. Visual: Hardcoded Hex Opacity Suffix

Event backgrounds used `${accentColor}12` (hex suffix `12` = ~7% opacity). Grid borders used very light colors (`#F0F0EE`, `#E2E2E0`, `#E8E8E6`).

## Fixes Applied

### API Route — Complete Rewrite

| Operation | Before | After |
|-----------|--------|-------|
| GET fail | Return `MOCK_CALENDAR_EVENTS` | Log warning, return `[]` (real empty) |
| POST fail | Return fake event with `id: "temp-..."` | Return HTTP 500 with error message |
| PATCH fail | Return `{ ok: true }` | Return HTTP 500 with error message |
| DELETE fail | Return `{ ok: true }` | Return HTTP 500 with error message |

### calendar-utils.ts

- Removed `MOCK_CALENDAR_EVENTS` array (~130 lines of mock data)
- Added `getEventBgColor(event, opacity)` helper for controlled rgba backgrounds

### Visual Readability — All Three Views

| Element | Before | After |
|---------|--------|-------|
| Outer border | `#E2E2E0` | `#D8D8D6` |
| Section borders | `#E8E8E6` | `#DDDDD9` |
| Column separators | `#F0F0EE` | `#E4E4E2` |
| Grid major (6h) | `#D8D8D6` | `#CCCCC9` |
| Grid 3h | `#E4E4E2` | `#DCDCDA` |
| Grid minor | `#F0F0EE` | `#EAEAE8` |
| Event background | `${color}12` (~7%) | `getEventBgColor(evt, 0.18)` (18%) |
| Event text weight | `font-medium` | `font-semibold` |
| Drag ghost bg | `${color}18` | `getEventBgColor(evt, 0.22)` |

### Consistency Across Views

All three views (DayView, WeekView, MonthView) now use:
- Same border color hierarchy
- Same `getEventBgColor()` for event backgrounds
- Same `getEventDisplayColor()` for accent/text colors
- Same hover effects (`hover:brightness-95`, `hover:shadow-md`)

## Files Touched

| File | Change |
|------|--------|
| `src/app/api/calendar/events/route.ts` | Complete rewrite: remove silent catches, mock fallback, fake events |
| `src/lib/calendar-utils.ts` | Remove `MOCK_CALENDAR_EVENTS`, add `getEventBgColor()` |
| `src/components/calendrier/DayView.tsx` | Stronger borders + event colors |
| `src/components/calendrier/WeekView.tsx` | Stronger borders + event colors |
| `src/components/calendrier/MonthView.tsx` | Stronger borders + event colors, import `getEventBgColor` |
| `BLOCKERS.md` | Updated |

## Validation

- TypeScript: 0 errors
- Next.js build: success
- No mock fallback reintroduced
- All API errors now return proper HTTP status codes
