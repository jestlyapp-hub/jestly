-- ============================================================
-- Jestly — Initial Database Schema
-- ============================================================

-- 1. PROFILES (extends auth.users)
-- ============================================================
create table public.profiles (
  id            uuid        primary key references auth.users(id) on delete cascade,
  email         text        not null,
  full_name     text        not null,
  business_name text,
  avatar_url    text,
  subdomain     text        unique not null,
  plan          text        not null default 'free' check (plan in ('free', 'pro')),
  stripe_customer_id     text,
  stripe_subscription_id text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- 2. CLIENTS
-- ============================================================
create table public.clients (
  id            uuid        primary key default gen_random_uuid(),
  user_id       uuid        not null references public.profiles(id) on delete cascade,
  name          text        not null,
  email         text        not null,
  phone         text,
  company       text,
  notes         text,
  tags          text[]      not null default '{}',
  total_revenue numeric     not null default 0,
  status        text        not null default 'active' check (status in ('active', 'inactive', 'archived')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- 3. SERVICES
-- ============================================================
create table public.services (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references public.profiles(id) on delete cascade,
  title       text        not null,
  description text        not null default '',
  price       numeric     not null,
  currency    text        not null default 'EUR',
  type        text        not null check (type in ('service', 'pack', 'formation')),
  is_active   boolean     not null default true,
  image_url   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 4. ORDERS (commandes)
-- ============================================================
create table public.orders (
  id                uuid        primary key default gen_random_uuid(),
  user_id           uuid        not null references public.profiles(id) on delete cascade,
  client_id         uuid        not null references public.clients(id),
  service_id        uuid        references public.services(id),
  title             text        not null,
  description       text        not null default '',
  amount            numeric     not null,
  status            text        not null default 'new' check (status in ('new', 'in_progress', 'delivered', 'cancelled', 'refunded')),
  priority          text        not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  deadline          timestamptz,
  stripe_payment_id text,
  paid              boolean     not null default false,
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- 5. INVOICES (factures)
-- ============================================================
create table public.invoices (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        not null references public.profiles(id) on delete cascade,
  client_id       uuid        not null references public.clients(id),
  order_id        uuid        references public.orders(id),
  invoice_number  text        unique not null,
  amount          numeric     not null,
  tax_rate        numeric     not null default 0,
  tax_amount      numeric     not null default 0,
  total           numeric     not null,
  status          text        not null default 'draft' check (status in ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  due_date        date,
  paid_at         timestamptz,
  pdf_url         text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- 6. TASKS (taches / to-do)
-- ============================================================
create table public.tasks (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references public.profiles(id) on delete cascade,
  order_id     uuid        references public.orders(id),
  title        text        not null,
  description  text,
  status       text        not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  priority     text        not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  due_date     date,
  completed_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_clients_user_id   on public.clients(user_id);
create index idx_services_user_id  on public.services(user_id);
create index idx_orders_user_id    on public.orders(user_id);
create index idx_orders_client_id  on public.orders(client_id);
create index idx_invoices_user_id  on public.invoices(user_id);
create index idx_invoices_client_id on public.invoices(client_id);
create index idx_tasks_user_id     on public.tasks(user_id);
create index idx_tasks_order_id    on public.tasks(order_id);
create index idx_profiles_subdomain on public.profiles(subdomain);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Profiles
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (id = auth.uid());

create policy "Users can update own profile"
  on public.profiles for update
  using (id = auth.uid());

create policy "Users can delete own profile"
  on public.profiles for delete
  using (id = auth.uid());

-- Clients
alter table public.clients enable row level security;

create policy "Users can view own clients"
  on public.clients for select
  using (user_id = auth.uid());

create policy "Users can insert own clients"
  on public.clients for insert
  with check (user_id = auth.uid());

create policy "Users can update own clients"
  on public.clients for update
  using (user_id = auth.uid());

create policy "Users can delete own clients"
  on public.clients for delete
  using (user_id = auth.uid());

-- Services
alter table public.services enable row level security;

create policy "Users can view own services"
  on public.services for select
  using (user_id = auth.uid());

create policy "Users can insert own services"
  on public.services for insert
  with check (user_id = auth.uid());

create policy "Users can update own services"
  on public.services for update
  using (user_id = auth.uid());

create policy "Users can delete own services"
  on public.services for delete
  using (user_id = auth.uid());

-- Orders
alter table public.orders enable row level security;

create policy "Users can view own orders"
  on public.orders for select
  using (user_id = auth.uid());

create policy "Users can insert own orders"
  on public.orders for insert
  with check (user_id = auth.uid());

create policy "Users can update own orders"
  on public.orders for update
  using (user_id = auth.uid());

create policy "Users can delete own orders"
  on public.orders for delete
  using (user_id = auth.uid());

-- Invoices
alter table public.invoices enable row level security;

create policy "Users can view own invoices"
  on public.invoices for select
  using (user_id = auth.uid());

create policy "Users can insert own invoices"
  on public.invoices for insert
  with check (user_id = auth.uid());

create policy "Users can update own invoices"
  on public.invoices for update
  using (user_id = auth.uid());

create policy "Users can delete own invoices"
  on public.invoices for delete
  using (user_id = auth.uid());

-- Tasks
alter table public.tasks enable row level security;

create policy "Users can view own tasks"
  on public.tasks for select
  using (user_id = auth.uid());

create policy "Users can insert own tasks"
  on public.tasks for insert
  with check (user_id = auth.uid());

create policy "Users can update own tasks"
  on public.tasks for update
  using (user_id = auth.uid());

create policy "Users can delete own tasks"
  on public.tasks for delete
  using (user_id = auth.uid());

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger set_clients_updated_at
  before update on public.clients
  for each row execute function public.handle_updated_at();

create trigger set_services_updated_at
  before update on public.services
  for each row execute function public.handle_updated_at();

create trigger set_orders_updated_at
  before update on public.orders
  for each row execute function public.handle_updated_at();

create trigger set_invoices_updated_at
  before update on public.invoices
  for each row execute function public.handle_updated_at();

create trigger set_tasks_updated_at
  before update on public.tasks
  for each row execute function public.handle_updated_at();

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, subdomain)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    lower(replace(coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), ' ', '-')) || '-' || substr(new.id::text, 1, 4)
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
