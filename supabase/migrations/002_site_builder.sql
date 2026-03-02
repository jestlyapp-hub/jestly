-- ============================================================
-- Jestly — Site Builder Schema
-- Tables: sites, site_pages, site_blocks, site_published_snapshots,
--         site_assets, site_product_links, leads, analytics_events
-- ============================================================

-- ────────────────────────────────────────────
-- 1. SITES
-- ────────────────────────────────────────────
create table public.sites (
  id             uuid        primary key default gen_random_uuid(),
  owner_id       uuid        not null references public.profiles(id) on delete cascade,
  slug           text        unique not null check (slug ~ '^[a-z0-9][a-z0-9-]*[a-z0-9]$'),
  name           text        not null,
  status         text        not null default 'draft' check (status in ('draft', 'published')),
  theme          jsonb       not null default '{}',
  settings       jsonb       not null default '{}',
  seo            jsonb       not null default '{}',
  nav            jsonb,
  footer         jsonb,
  custom_domain  text        unique,
  is_private     boolean     not null default false,
  password_hash  text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ────────────────────────────────────────────
-- 2. SITE PAGES
-- ────────────────────────────────────────────
create table public.site_pages (
  id              uuid        primary key default gen_random_uuid(),
  site_id         uuid        not null references public.sites(id) on delete cascade,
  slug            text        not null,
  title           text        not null,
  is_home         boolean     not null default false,
  sort_order      integer     not null default 0,
  status          text        not null default 'draft' check (status in ('draft', 'published')),
  seo_title       text,
  seo_description text,
  og_image_url    text,
  published_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique(site_id, slug)
);

-- ────────────────────────────────────────────
-- 3. SITE BLOCKS
-- ────────────────────────────────────────────
create table public.site_blocks (
  id         uuid        primary key default gen_random_uuid(),
  page_id    uuid        not null references public.site_pages(id) on delete cascade,
  type       text        not null,
  sort_order integer     not null default 0,
  content    jsonb       not null default '{}',
  style      jsonb       not null default '{}',
  settings   jsonb       not null default '{}',
  visible    boolean     not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ────────────────────────────────────────────
-- 4. PUBLISHED SNAPSHOTS (immutable, for ISR)
-- ────────────────────────────────────────────
create table public.site_published_snapshots (
  id           uuid        primary key default gen_random_uuid(),
  site_id      uuid        not null references public.sites(id) on delete cascade,
  page_id      uuid        not null references public.site_pages(id) on delete cascade,
  snapshot     jsonb       not null,
  published_at timestamptz not null default now()
);

-- ────────────────────────────────────────────
-- 5. SITE ASSETS
-- ────────────────────────────────────────────
create table public.site_assets (
  id        uuid        primary key default gen_random_uuid(),
  site_id   uuid        not null references public.sites(id) on delete cascade,
  path      text        not null,
  type      text        not null check (type in ('image', 'video', 'file')),
  metadata  jsonb       not null default '{}',
  created_at timestamptz not null default now()
);

-- ────────────────────────────────────────────
-- 6. SITE ↔ PRODUCT LINKS
-- ────────────────────────────────────────────
create table public.site_product_links (
  id             uuid        primary key default gen_random_uuid(),
  site_id        uuid        not null references public.sites(id) on delete cascade,
  product_id     uuid        not null references public.services(id) on delete cascade,
  display_config jsonb       not null default '{}',
  created_at     timestamptz not null default now(),
  unique(site_id, product_id)
);

-- ────────────────────────────────────────────
-- 7. LEADS (form submissions from public sites)
-- ────────────────────────────────────────────
create table public.leads (
  id        uuid        primary key default gen_random_uuid(),
  site_id   uuid        not null references public.sites(id) on delete cascade,
  name      text,
  email     text        not null,
  phone     text,
  source    text,
  message   text,
  fields    jsonb       not null default '{}',
  created_at timestamptz not null default now()
);

-- ────────────────────────────────────────────
-- 8. ANALYTICS EVENTS
-- ────────────────────────────────────────────
create table public.analytics_events (
  id         uuid        primary key default gen_random_uuid(),
  site_id    uuid        not null references public.sites(id) on delete cascade,
  type       text        not null,
  page_slug  text,
  data       jsonb       not null default '{}',
  visitor_id text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_sites_slug           on public.sites(slug);
create index idx_sites_owner          on public.sites(owner_id);
create index idx_sites_custom_domain  on public.sites(custom_domain) where custom_domain is not null;
create index idx_pages_site           on public.site_pages(site_id);
create index idx_pages_site_slug      on public.site_pages(site_id, slug);
create index idx_blocks_page_order    on public.site_blocks(page_id, sort_order);
create index idx_snapshots_site_page  on public.site_published_snapshots(site_id, page_id);
create index idx_analytics_site_time  on public.analytics_events(site_id, created_at desc);
create index idx_leads_site_time      on public.leads(site_id, created_at desc);
create index idx_product_links_site   on public.site_product_links(site_id);

-- ============================================================
-- AUTO-UPDATE TRIGGERS
-- ============================================================
create trigger set_sites_updated_at
  before update on public.sites
  for each row execute function public.handle_updated_at();

create trigger set_pages_updated_at
  before update on public.site_pages
  for each row execute function public.handle_updated_at();

create trigger set_blocks_updated_at
  before update on public.site_blocks
  for each row execute function public.handle_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Sites
alter table public.sites enable row level security;

create policy "Owner can manage own sites"
  on public.sites for all
  using (owner_id = auth.uid());

create policy "Public can read published sites"
  on public.sites for select
  using (status = 'published' and is_private = false);

-- Site Pages
alter table public.site_pages enable row level security;

create policy "Owner can manage own pages"
  on public.site_pages for all
  using (site_id in (select id from public.sites where owner_id = auth.uid()));

create policy "Public can read published pages"
  on public.site_pages for select
  using (
    status = 'published'
    and site_id in (select id from public.sites where status = 'published' and is_private = false)
  );

-- Site Blocks
alter table public.site_blocks enable row level security;

create policy "Owner can manage own blocks"
  on public.site_blocks for all
  using (
    page_id in (
      select sp.id from public.site_pages sp
      join public.sites s on s.id = sp.site_id
      where s.owner_id = auth.uid()
    )
  );

create policy "Public can read blocks of published pages"
  on public.site_blocks for select
  using (
    page_id in (
      select sp.id from public.site_pages sp
      join public.sites s on s.id = sp.site_id
      where s.status = 'published' and sp.status = 'published' and s.is_private = false
    )
  );

-- Published Snapshots
alter table public.site_published_snapshots enable row level security;

create policy "Owner can manage own snapshots"
  on public.site_published_snapshots for all
  using (site_id in (select id from public.sites where owner_id = auth.uid()));

create policy "Public can read published snapshots"
  on public.site_published_snapshots for select
  using (site_id in (select id from public.sites where status = 'published'));

-- Site Assets
alter table public.site_assets enable row level security;

create policy "Owner can manage own assets"
  on public.site_assets for all
  using (site_id in (select id from public.sites where owner_id = auth.uid()));

-- Product Links
alter table public.site_product_links enable row level security;

create policy "Owner can manage own product links"
  on public.site_product_links for all
  using (site_id in (select id from public.sites where owner_id = auth.uid()));

create policy "Public can read product links of published sites"
  on public.site_product_links for select
  using (site_id in (select id from public.sites where status = 'published' and is_private = false));

-- Leads
alter table public.leads enable row level security;

create policy "Owner can read own leads"
  on public.leads for select
  using (site_id in (select id from public.sites where owner_id = auth.uid()));

create policy "Anyone can submit a lead"
  on public.leads for insert
  with check (true);

-- Analytics Events
alter table public.analytics_events enable row level security;

create policy "Owner can read own analytics"
  on public.analytics_events for select
  using (site_id in (select id from public.sites where owner_id = auth.uid()));

create policy "Anyone can insert analytics events"
  on public.analytics_events for insert
  with check (true);
