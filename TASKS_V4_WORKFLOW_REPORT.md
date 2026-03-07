# Tasks V4 Workflow Engine Report

**Date**: 2026-03-07
**Sprint**: Task System → Workflow Engine
**Status**: COMPLETE

---

## Features Implemented

### Phase 1 — Quick Capture System

**Global Quick Capture Bar** (top of task workspace)
- Input field with + icon, always visible above the board
- Type title, press Enter → task created instantly in "A faire" column
- Keyboard shortcut: press `N` from anywhere on the page to focus the capture bar
- `Enter` to create, `Escape` to cancel and blur
- Visual feedback: `kbd` hint showing "Enter"
- Optimistic creation with rollback on API failure

**Inline Column Quick Add**
- Already existed, preserved and working
- Each kanban column has its own quick-add input

### Phase 2 — Smart Task Views

New filter system replacing the old one:

| Filter | Logic | Badge |
|--------|-------|-------|
| **Toutes** | All active (non-archived) tasks | — |
| **Aujourd'hui** | `dueDate === today` | Count (indigo) |
| **A venir** | `dueDate` within next 7 days, not done/completed | — |
| **En retard** | `dueDate < today`, not done/completed | Count (red) |
| **Urgentes** | Priority `urgent` or `high` | — |

All filters operate on real DB data from `/api/tasks`.

### Phase 3 — Task → Calendar Scheduling

**From Drawer:**
- "Planifier dans le calendrier" button
- Opens inline date + time picker
- Creates calendar event via `POST /api/calendar/events`
- Event linked to task: category "session", notes include task title
- Auto-sets `dueDate` if task had none

**From Full Task Page:**
- "Planifier au calendrier" button in sidebar Actions section
- Same flow: date + time → POST to calendar API
- Auto end time: startTime + 1 hour

**Calendar event includes:**
- Task title
- Task priority
- Client name/ID
- Category: "session"
- Notes: "Tache liee: {title}"

### Phase 4 — Task Workspace (Focus Mode)

**Full Task Page** (`/taches/[taskId]`):
- Already had workspace layout, now enhanced with:
  - **Duplicate** button in sidebar
  - **Schedule to calendar** button with inline date/time picker
  - All existing features preserved (title, notes, subtasks, tags, client, order, status, priority)

**Task Drawer** enhanced:
- **Duplicate** action in footer
- **Schedule to calendar** inline form
- Both `onDuplicate` and `onSchedule` props optional (backward compatible)

### Phase 5 — Task Templates

5 built-in templates for freelancer workflows:

| Template | Subtasks | Tags |
|----------|----------|------|
| **Video YouTube** | Script, Montage, Thumbnail, Upload+SEO, Publier | video, youtube |
| **Audit SEO** | Analyse technique, Audit contenu, Backlinks, Rapport | seo, audit |
| **Livraison design** | Concept, Revisions, Final, Export sources, Livraison | design, livraison |
| **Pack reseaux sociaux** | Briefing, Visuels, Textes, Revisions, Livraison | social-media, contenu |
| **Animation / Motion** | Storyboard, Assets, Animation, Sound, Export | motion, animation |

**Template picker:**
- Accessible via "Modele" button in toolbar
- Modal with template list (name, description, subtask count, tags)
- Click → creates task with pre-filled subtasks, tags, priority
- Opens in drawer for immediate editing

**Duplicate Task:**
- Creates a copy with "(copie)" suffix
- Resets status to "todo", unchecks all subtasks
- New ID, new timestamps
- Available from drawer footer and full page sidebar

### Phase 6 — Task from Order Automation

**API: `POST /api/tasks/generate`**

Generate multiple tasks from an order in one call.

```json
POST /api/tasks/generate
{
  "orderId": "uuid",
  "orderTitle": "YouTube montage",
  "clientId": "uuid",
  "clientName": "Marie Dupont",
  "tasks": [
    "Recuperer fichiers",
    "Montage video",
    "Creer thumbnail",
    "Export final",
    "Livraison"
  ]
}
```

Response: Array of created tasks, all linked to the order with tag "commande".

### Phase 7 — Keyboard Productivity

| Key | Context | Action |
|-----|---------|--------|
| `N` | Anywhere (not in input) | Focus quick capture bar |
| `Enter` | Quick capture bar | Create task |
| `Escape` | Quick capture bar | Cancel and blur |
| `Escape` | Drawer open | Close drawer |

### Phase 8 — Dashboard Integration (Real Data)

**TodayFocus** — Now uses real DB data:
- Fetches tasks from `/api/tasks` → filters today's due + overdue
- Fetches events from `/api/calendar/events` → filters today's events
- Sorts: urgent first, done last, then by time
- Links to individual task pages (`/taches/{id}`)
- Shows up to 8 items

**UpcomingDeadlines** — Now uses real DB data:
- Fetches tasks with due dates (not done, not archived) from `/api/tasks`
- Fetches order deadlines from `/api/calendar/events` (source="order")
- Sorted by date ascending
- Shows urgency: overdue (red), today (amber), this week (indigo), later (gray)
- Relative date formatting in French
- Shows up to 8 items

---

## Architecture Changes

### New Files
- `src/app/api/tasks/generate/route.ts` — Batch task creation from orders

### Modified Files
- `src/lib/tasks-utils.ts` — New filter types, templates, duplicate/template functions
- `src/components/taches/TasksWorkspace.tsx` — Quick capture, template picker, smart filters, schedule/duplicate handlers
- `src/components/taches/TaskDetailDrawer.tsx` — Schedule + duplicate actions
- `src/app/(dashboard)/taches/[taskId]/page.tsx` — Schedule + duplicate in full page
- `src/components/dashboard/TodayFocus.tsx` — Real DB data (was mock)
- `src/components/dashboard/UpcomingDeadlines.tsx` — Real DB data (was mock)

### Data Flow

```
User Action                    API                         DB
─────────────────────────────────────────────────────────────────
Quick capture (N + Enter) → POST /api/tasks          → tasks table
Template creation         → POST /api/tasks          → tasks table
Duplicate                 → POST /api/tasks          → tasks table
Schedule to calendar      → POST /api/calendar/events → calendar_events table
Order → tasks             → POST /api/tasks/generate  → tasks table (batch)
Dashboard Today           → GET /api/tasks + GET /api/calendar/events
Dashboard Deadlines       → GET /api/tasks + GET /api/calendar/events
```

---

## QA Validation

### Create task quickly
- Quick capture bar: type title, Enter → task appears in "A faire" column
- Keyboard N: focuses input from anywhere
- Optimistic + real DB ID replacement working

### Edit task page
- Full page persistence with autosave (500ms debounce)
- All fields: title, notes, status, priority, due date, client, order, subtasks, tags
- Changes persist across page refresh

### Schedule task in calendar
- Drawer: "Planifier dans le calendrier" → date/time → POST succeeds
- Full page: "Planifier au calendrier" → same flow
- Calendar event created with correct data

### Archive task
- Drawer + full page: archive → task disappears from active board
- Archive page shows archived tasks
- Restore works

### Search task
- Global search (Cmd+K) → `/api/search` finds tasks by title/description/client
- Results link to `/taches/{real-db-id}`

### Task from template
- Template picker → select → task created with subtasks/tags/priority
- Drawer opens for immediate editing

### Duplicate task
- Drawer footer + full page sidebar
- Creates copy with new ID, reset status, unchecked subtasks

### Dashboard real data
- TodayFocus: shows real tasks due today + today's calendar events
- UpcomingDeadlines: shows real upcoming deadlines from tasks + orders

---

## Build Validation
- TypeScript: 0 errors
- Next.js build: success
- Pre-commit validation: 23/23 checks passed
