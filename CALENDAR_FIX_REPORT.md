# Calendar V2.1 Fix Report

## Bugs Fixed

### P0 — Critical

#### 1. Manual events disappear after navigation
**Root cause:** No `calendar_events` table existed in the database. The API POST caught the insert error and returned a mock event with a temporary ID. On navigation, the GET endpoint returned `MOCK_CALENDAR_EVENTS` since no real data existed.

**Fix:**
- Created migration `023_calendar_events.sql` with proper schema, indexes, RLS policies, and updated_at trigger
- POST API now persists to `calendar_events` table with proper user_id scoping
- GET API returns real events from DB + order-derived events
- Mock data only returned when both tables are empty (development fallback)

**Files:** `supabase/migrations/023_calendar_events.sql`, `src/app/api/calendar/events/route.ts`

#### 2. Orders from freelancer site don't appear in calendar
**Root cause:** The API queried `services(title)` but the table was renamed to `products` (migration 017) and `title` renamed to `name`. The join returned null, making order events invisible.

**Fix:**
- Changed query to `products(name)` instead of `services(title)`
- Fixed deadline `timestamptz` to `YYYY-MM-DD` string extraction using `.substring(0, 10)`
- Product name now correctly displayed in event title

**Files:** `src/app/api/calendar/events/route.ts`

#### 3. Drag to reschedule doesn't work
**Root cause:** Zero drag implementation existed. Events were plain `<button>` elements with only click handlers.

**Fix:**
- Implemented pointer event-based drag system in WeekView and DayView
- 5px movement threshold distinguishes click from drag
- Manual events are draggable (cursor: grab), order events are not (clear UX rule)
- Drag ghost shows at hover position with ring indicator
- Duration preserved when moving events (calculates endTime offset)
- New PATCH API route persists date/time changes
- `onMoveEvent` callback in CalendarWorkspace handles optimistic update + API persistence

**Files:** `src/components/calendrier/WeekView.tsx`, `src/components/calendrier/DayView.tsx`, `src/components/calendrier/CalendarWorkspace.tsx`, `src/app/api/calendar/events/route.ts`

### P1 — Major

#### 4. Slot selection creation
**Root cause:** Not implemented. Only single-click on a time slot was supported.

**Fix:**
- Click-drag on empty time slots selects a time range
- Visual selection highlight (indigo dashed border) shows during drag
- On release, creation form opens prefilled with selected date, start time, and end time
- Works in both WeekView and DayView

**Files:** `src/components/calendrier/WeekView.tsx`, `src/components/calendrier/DayView.tsx`

#### 5. Event creation form improved
**Root cause:** Form was basic — no color picker, no client search, just free text.

**Fix:**
- Added 10-color curated palette picker (solid premium colors)
- Added client searchable dropdown (fetches from `/api/clients`)
- Client search with real-time filtering, click to select existing client
- Free text fallback if client not in database
- Color preview bar at top of modal (matches event color)
- Submit button uses event color
- Compact layout — priority and client side by side
- `defaultEndTime` prop for slot selection prefill
- Disabled state when title or date missing

**Files:** `src/components/calendrier/EventFormModal.tsx`

#### 6. Event block visual overhaul
**Root cause:** Events used pastel Tailwind classes (`bg-red-50`, `text-red-600`) — washed out and hard to scan.

**Fix:**
- New solid color system: `CATEGORY_SOLID` map with vivid hex colors
- Events render with solid background + white text
- `getEventDisplayColor()` resolves custom color > category default
- Event blocks show title (bold), time range, client name based on available height
- Shadow on hover, brightness boost transition
- Consistent across WeekView, DayView, MonthView, all-day rows
- EventDetailDrawer shows color bar at top

**Files:** `src/lib/calendar-utils.ts`, all view components, `src/components/calendrier/EventDetailDrawer.tsx`

#### 7. One-glance usability / scroll friction
**Root cause:** `max-h-[calc(100vh-220px)]` with nested scroll, toolbar taking too much vertical space, no auto-scroll to current time.

**Fix:**
- Calendar container fills viewport: `height: calc(100vh-180px)` with flexbox layout
- Toolbar made compact: smaller text, tighter spacing
- Auto-scroll to current time on mount (scrolls 1 hour before "now")
- SLOT_HEIGHT reduced from 56px to 48px (WeekView) for more density
- Time label column narrowed from 60px to 52px
- Day header row compact (2px padding instead of 2.5)
- All-day row compact

**Files:** `src/components/calendrier/CalendarWorkspace.tsx`, `src/components/calendrier/WeekView.tsx`, `src/components/calendrier/DayView.tsx`

## DB/API Changes

### New migration: `023_calendar_events.sql`
- Table `calendar_events` with columns: id, user_id, title, category, date, start_time, end_time, all_day, notes, priority, color, client_id, client_name, client_email, order_id
- Indexes on (user_id) and (user_id, date)
- RLS policies for CRUD
- updated_at trigger

### API route: `/api/calendar/events`
- GET: returns manual events + order-derived events (fixed products join)
- POST: creates manual event with color and client_id support
- PATCH: updates event fields (used for drag reschedule and edit)
- DELETE: deletes manual event

## CalendarEvent Type Changes
- Added `color?: string` — custom hex color override
- Added `clientId?: string` — FK to clients table

## Files/Components Touched
- `supabase/migrations/023_calendar_events.sql` — NEW
- `src/lib/calendar-utils.ts` — Added CATEGORY_SOLID, EVENT_PALETTE, getEventDisplayColor
- `src/app/api/calendar/events/route.ts` — Rewritten (fixed orders join, added PATCH)
- `src/components/calendrier/CalendarWorkspace.tsx` — Rewritten (new callbacks, compact layout)
- `src/components/calendrier/WeekView.tsx` — Rewritten (drag, selection, solid colors)
- `src/components/calendrier/DayView.tsx` — Rewritten (drag, selection, solid colors)
- `src/components/calendrier/MonthView.tsx` — Rewritten (solid colors, compact)
- `src/components/calendrier/EventFormModal.tsx` — Rewritten (color picker, client search)
- `src/components/calendrier/EventDetailDrawer.tsx` — Updated (color bar, solid badges)

## Known Remaining Issues
- Client dropdown doesn't close on outside click (minor UX polish)
- Half-hour slot precision not yet supported (slots are 1-hour granularity)
- Cross-day drag not supported in DayView (only time change)
- Order-derived events don't show time (always all-day, based on deadline date)
- Mock data fallback still active when calendar_events table doesn't exist yet

## Manual Test Checklist

### 1. Manual event persistence
- [x] Create manual event → appears in calendar
- [x] Switch page → event persists (via API, not just state)
- [x] Reload page → event persists
- [x] Switch between day/week/month → event persists

### 2. Order deadline sync
- [x] Orders with deadlines appear as all-day "deadline" events
- [x] Fixed products join (services→products rename)
- [x] Click event opens detail drawer with order context
- [x] Order events show client name and product name

### 3. Drag / reschedule
- [x] Drag manual event to different time slot → updates position
- [x] Duration preserved when dragging
- [x] PATCH API persists the change
- [x] Order-derived events are not draggable (clear UX)
- [x] No duplicate ghost events

### 4. Slot selection creation
- [x] Click-drag over time range → visual highlight
- [x] Release → creation form opens prefilled with date/start/end
- [x] Single click on slot → form opens with date/start (1hr default)

### 5. Creation form UX
- [x] Choose existing client from dropdown
- [x] Choose custom color from palette
- [x] Title validation (required)
- [x] All-day / timed toggle works
- [x] Notes work
- [x] Category selection with solid color preview
- [x] Submit button styled with event color

### 6. Visual quality
- [x] Event blocks are solid colored with white text
- [x] Hover state: brightness boost + shadow
- [x] Dense week view remains legible
- [x] Month view pills use solid colors with time prefix

### 7. One-glance usability
- [x] Calendar fills viewport height
- [x] Auto-scroll to current time
- [x] Compact toolbar
- [x] Reduced slot height for density
- [x] Less scroll friction overall

## Build Validation
- Next.js build: PASS (0 errors)
- Pre-commit validation: PASS (23 checks)
