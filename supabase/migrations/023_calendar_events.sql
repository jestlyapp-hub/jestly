-- ============================================================
-- Migration 023: Calendar Events table
-- Manual events with persistence + client/order linking
-- ============================================================

create table if not exists public.calendar_events (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references public.profiles(id) on delete cascade,
  title       text        not null,
  category    text        not null default 'personnel',
  date        date        not null,
  start_time  text,       -- HH:MM format
  end_time    text,       -- HH:MM format
  all_day     boolean     not null default true,
  notes       text,
  priority    text        not null default 'medium'
                          check (priority in ('low', 'medium', 'high', 'urgent')),
  color       text,       -- hex color override (e.g. #EF4444)
  client_id   uuid        references public.clients(id) on delete set null,
  client_name text,
  client_email text,
  order_id    uuid        references public.orders(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Indexes
create index if not exists idx_calendar_events_user_id on public.calendar_events(user_id);
create index if not exists idx_calendar_events_date    on public.calendar_events(user_id, date);

-- RLS
alter table public.calendar_events enable row level security;

create policy "Users can view own calendar events"
  on public.calendar_events for select using (user_id = auth.uid());

create policy "Users can insert own calendar events"
  on public.calendar_events for insert with check (user_id = auth.uid());

create policy "Users can update own calendar events"
  on public.calendar_events for update using (user_id = auth.uid());

create policy "Users can delete own calendar events"
  on public.calendar_events for delete using (user_id = auth.uid());

-- Auto-update updated_at
create trigger set_calendar_events_updated_at
  before update on public.calendar_events
  for each row execute function public.handle_updated_at();

-- Refresh PostgREST schema cache
notify pgrst, 'reload schema';
