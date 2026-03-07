# Calendar V2.2 Fix Report

## Bugs Fixed

### P0 #1 — Orders not all visible in calendar

**Root cause:** API query used `.not("deadline", "is", null)` which excluded orders without a deadline set. Orders created via checkout RPC often don't have a deadline, so they were invisible in the calendar.

**Fix:**
- Removed the deadline null filter — now fetches ALL orders
- Orders WITH deadline → show as deadline event on deadline date
- Orders WITHOUT deadline → show on `created_at` date as "Commande: ..." event
- Added `created_at` to the select query for fallback date
- All-day row made more prominent: background tint, thicker bottom border, larger text
- Order events show a clock icon and status badge in day view

**Files:** `src/app/api/calendar/events/route.ts`, `src/components/calendrier/WeekView.tsx`, `src/components/calendrier/DayView.tsx`

### P0 #2 — Zero scrolling

**Root cause:** Time grid used fixed pixel heights (`SLOT_HEIGHT_PX * hours`) with `overflow-y-auto`, creating a 720-840px scrollable area that exceeded viewport.

**Fix:**
- Removed `SLOT_HEIGHT_PX` constant and `totalHeight` fixed calculations
- Removed `scrollRef` and auto-scroll useEffect (no scroll = no need to auto-scroll)
- Time grid container: `overflow-y-auto` → `overflow-hidden` with `flex-1 min-h-0`
- Inner grid: `absolute inset-0` fills available space exactly
- Day columns: height inherited from grid (no fixed px)
- All positioning uses percentages (`getEventTopPercent`, `getEventHeightPercent`) which scale to any container size
- WeekView/DayView use `h-full` instead of `calc(100vh - 180px)` — fills parent flex container

**Files:** `src/components/calendrier/WeekView.tsx`, `src/components/calendrier/DayView.tsx`

### P1 #3 — Grid lines too light

**Root cause:** All borders used `border-[#EFEFEF]` which is nearly invisible, especially on bright screens.

**Fix:**
- Hour lines: `border-[#EFEFEF]` → `border-[#D5D5D3]` (stronger, clearly visible)
- Column separators: `border-[#EFEFEF]` → `border-[#E0E0DE]` (distinct but not heavy)
- Added half-hour dashed lines (`border-dashed border-[#ECECEA]`) at 50% of each slot
- All-day row bottom border: `border-b` → `border-b-2 border-[#E6E6E4]` (clear separation)
- Time labels: `font-medium` → `font-semibold` for better readability

**Files:** `src/components/calendrier/WeekView.tsx`, `src/components/calendrier/DayView.tsx`

### P1 #4 — Date/time selection too boring

**Root cause:** Native `<input type="time">` is slow to use (requires scrolling through values) and looks inconsistent across browsers. Native `<input type="date">` requires multiple clicks to reach common dates.

**Fix:**
- **Time picker:** Replaced native time inputs with custom dropdown grid
  - 30-minute increment buttons from 07:00 to 22:00 in a 4-column layout
  - Click to select instantly (1 click vs scrolling)
  - Selected time highlighted in indigo
  - End time picker auto-filters to show only times after start time
  - Selecting start time auto-sets end time (+1 hour)
  - Outside click to close
- **Date quick-select:** Added 3 chip buttons above the date input
  - "Aujourd'hui", "Demain", "Apres-demain" — instant one-click selection
  - Native date input kept below as fallback for specific dates
  - Selected chip highlighted in indigo

**Files:** `src/components/calendrier/EventFormModal.tsx`

## Files Modified

- `src/app/api/calendar/events/route.ts` — Show all orders (removed deadline filter)
- `src/components/calendrier/WeekView.tsx` — Zero scroll, grid contrast, all-day prominence
- `src/components/calendrier/DayView.tsx` — Zero scroll, grid contrast, all-day prominence
- `src/components/calendrier/EventFormModal.tsx` — Custom time picker, date quick-select

## Build Validation
- Next.js build: PASS (0 errors)
- Pre-commit validation: PASS (23 checks)
