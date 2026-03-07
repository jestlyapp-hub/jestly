# Calendar Dots + 24h + Grid Visibility Report

## Issues Fixed

### P0 #1 — Show ALL command dots (no +X collapse)
- **Root cause**: `OrderDots` had a `maxDots` prop (default 3) that sliced the array and showed `+N` for overflow
- **Fix**: Removed `maxDots` entirely. All orders render as individual markers. Flex-wrap enabled so markers flow to multiple lines if needed.
- **Files**: `OrderDots.tsx`, `WeekView.tsx`, `DayView.tsx`, `MonthView.tsx`

### P0 #2 — Client initial on each command marker
- **Before**: Anonymous 7px colored dots — impossible to identify which order belongs to which client
- **After**: 16-18px circular badges with the first letter of the client name rendered inside
- **Fallback**: If `clientName` is null/empty, shows "?" as the initial
- **Design**: Colored circle (using `getEventDisplayColor`) with white bold text inside. Compact but readable.
- **Tooltip**: Hover shows full list with initials, titles, and order status
- **Files**: `OrderDots.tsx`

### P0 #3 — Full 24h time range
- **Before**: `START_HOUR=6, END_HOUR=24` (18h range, missing midnight-6am)
- **After**: `START_HOUR=0, END_HOUR=24` (full 24h range)
- **Applied to**: WeekView and DayView
- **Time labels**: 00h through 23h with zero-padded format
- **Current time indicator**: Now works at any hour (removed hour range guard)
- **Event positioning**: Unchanged — `getEventTopPercent` and `getEventHeightPercent` use the new 0-24 range
- **Files**: `WeekView.tsx`, `DayView.tsx`

### P1 #4 — Stronger grid and visual structure
**Background**:
- Container: `bg-[#FAFAF9]` instead of pure `bg-white` (warm off-white)
- Headers: `bg-[#F7F7F5]` solid background
- All-day strip: `bg-[#F7F7F5]/60` subtle tint
- Time column: `bg-[#F7F7F5]/50` subtle tint

**Grid line hierarchy** (4 levels):
- Midnight (0h) + Noon (12h): `border-[#D4D4D2]` — strongest
- 6h + 18h: `border-[#DDDCDA]` — strong
- 3h boundaries: `border-[#E5E5E3]` — medium
- All other hours: `border-[#EDEDEB]` — subtle

**Borders**:
- Container border: `border-[#E0E0DE]` (stronger than previous `#EAEAEA`)
- Column separators: `border-l-[#EAEAE8]` (visible between day columns)
- All-day cells: `border-l-[#ECECEA]`

**Time axis**:
- Major hours (0h, 6h, 12h, 18h): `text-[9px] font-semibold text-[#888]`
- Minor hours: `text-[8px] font-normal text-[#B8B8B6]`
- Zero-padded format: "00h", "06h", "12h", etc.

**Today emphasis**:
- Header cell: `bg-[#4F46E5]/[0.04]` tint
- Column: `bg-[#4F46E5]/[0.02]` tint
- Day name: `text-[#4F46E5] font-semibold`

## Files Touched

| File | Changes |
|------|---------|
| `src/components/calendrier/OrderDots.tsx` | Full rewrite: removed maxDots, added client initials, compact mode |
| `src/components/calendrier/WeekView.tsx` | Full rewrite: 24h range, stronger grid, updated OrderDots usage |
| `src/components/calendrier/DayView.tsx` | Full rewrite: 24h range, stronger grid, updated OrderDots usage |
| `src/components/calendrier/MonthView.tsx` | Updated OrderDots: removed maxDots, added compact prop |

## Design Decisions

1. **Client initials over plain dots**: A 16-18px circle with a letter is more informative than a 7px anonymous dot while staying compact
2. **No maxDots cap**: All orders visible. Flex-wrap handles overflow cleanly without clipping
3. **Full 24h not business-hours**: Freelancers work all hours. The grid adapts with major/minor label hierarchy
4. **4-level grid hierarchy**: Prevents visual monotony while keeping the surface readable
5. **Warm off-white base**: `#FAFAF9` is barely noticeable but prevents the sterile pure-white feeling

## Manual QA Checklist

- [x] All command markers visible — no +X collapse
- [x] Each marker shows client initial letter
- [x] No crash when clientName is missing (shows "?")
- [x] Markers remain compact and don't overflow horizontally
- [x] Tooltip shows full order list with initials and status
- [x] Grid is visibly stronger than before
- [x] Grid hierarchy distinguishes major/minor hours
- [x] Today column has visible emphasis
- [x] Week view: full 24h from 00h to 23h
- [x] Day view: full 24h from 00h to 23h
- [x] Time labels aligned and readable
- [x] Timed events still position correctly
- [x] Manual events still visible as pills
- [x] No horizontal overflow
- [x] No regression in drag/drop or selection
- [x] Build: PASS (0 errors)
- [x] Pre-commit validation: PASS (23 checks)

## Remaining Notes

- MonthView still uses `overflow-x-auto` + `min-w-[640px]` — not in scope but could be modernized
- MonthView uses `compact` mode for OrderDots (smaller 16px markers)
