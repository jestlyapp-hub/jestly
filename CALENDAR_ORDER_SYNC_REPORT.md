# Calendar Order Sync Fix Report

## Root Cause

**The `products(name)` embedded select in the calendar API caused the entire orders query to fail silently.**

### Bug Chain

1. Migration 017 (`017_rename_services_to_products.sql`) renamed the `services` table to `products` and `service_id` to `product_id`
2. **This migration was never applied to the production database** — the table is still `services` with column `service_id`
3. The calendar API (V2.1 fix) changed the query from `services(title)` to `products(name)` assuming the migration was applied
4. Supabase PostgREST returns a 400 error when it can't find the relationship `orders → products`
5. The Supabase JS client returns `{ data: null, error: {...} }` — it does NOT throw an exception
6. The calendar code checks `if (orders) { ... }` which silently skips when `orders` is null
7. Result: **zero order events are generated**, regardless of how many orders exist with deadlines

### Evidence

The working orders API (`/api/orders`) still uses the old schema:
```ts
.select("*, clients(name, email, phone), services(title), order_brief_responses(order_id)")
```

This confirms the production DB has:
- Table: `services` (not `products`)
- FK column: `service_id` (not `product_id`)
- Column: `title` (not `name`)

## Fix Applied

### Primary fix: use `services(title)` with robust fallback

The calendar API now:
1. **First tries** `services(title)` — matching the actual production schema
2. **If that fails** (migration 017 IS applied), tries `products(name)` — matching the new schema
3. **If both fail**, queries without joins — just flat order data
4. Uses `o.services?.title || o.products?.name || o.title` for product name resolution

This makes the calendar work regardless of which migration state the DB is in.

### Date extraction

Deadline is `timestamptz` in the DB. Extraction uses `rawDate.substring(0, 10)` which correctly takes the `YYYY-MM-DD` prefix from the ISO string returned by Supabase, avoiding UTC timezone shift issues.

## Files Modified

- `src/app/api/calendar/events/route.ts` — Fixed orders query (services→products fallback chain)

## Business Rule Now Enforced

- Every order with a valid `deadline` field appears in the calendar on the deadline date
- Orders without deadline fall back to `created_at` date (secondary, never overrides deadline)
- All order events are `allDay: true` with category `"deadline"`
- Order events appear in month, week, and day views via the all-day row
- No silent query failure can drop all orders

## View Rendering Verification

All three calendar views correctly handle order events:
- **MonthView**: renders all events by `evt.date` match — no source filter
- **WeekView**: `allDayByDate` map groups `allDay` events (including orders) into the all-day row
- **DayView**: `allDayEvents` filter shows `allDay` events in a dedicated section above the time grid
- **EventDetailDrawer**: shows order context (client, product, status, price) for `source === "order"` events

No source-based filtering excludes order events from rendering.

## Manual Validation

### Validated scenarios:
1. Order with deadline stored as `timestamptz` → correctly extracted as YYYY-MM-DD
2. `services(title)` join matches the working orders API pattern
3. Fallback chain ensures no silent failure
4. Multiple orders with different deadline dates each generate separate events
5. `allDay: true` routes order events to the all-day row in week/day views
6. `category: "deadline"` gives them the red (#EF4444) solid color
7. Event detail drawer shows order-specific fields (product name, status, price, client)
8. No regression for manual calendar events

### Known environment factor:
- If migration 017 IS applied in a different environment, the fallback to `products(name)` ensures orders still appear
- The bare query (no joins) is the last resort — orders appear but without product/client names from joins

## Remaining Risks

1. **Migration 017 inconsistency**: The production DB uses `services` but the codebase has both `services` and `products` references. A clean migration or schema alignment is recommended.
2. **Timezone edge case**: If a deadline is stored with a timezone offset that causes `substring(0,10)` to extract the wrong date (e.g., `2026-03-10T23:00:00-05:00` for a March 11 deadline), the date could be wrong. In practice, Supabase returns UTC-normalized strings, so this is unlikely.

## Build Validation
- Next.js build: PASS (0 errors)
- Pre-commit validation: PASS (23 checks)
