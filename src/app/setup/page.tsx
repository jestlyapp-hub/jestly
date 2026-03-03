"use client";

import { useState, useEffect } from "react";

// Extract project ref from Supabase URL
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const PROJECT_REF = SUPABASE_URL.replace("https://", "").split(".")[0];
const SQL_EDITOR_URL = `https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new`;

const FULL_SQL = `-- ============================================================
-- Jestly — FULL MIGRATION (toutes les tables)
-- Safe to re-run: uses IF NOT EXISTS / IF NOT EXISTS everywhere
-- ============================================================

-- ============ MIGRATION 001: Core tables ============

CREATE TABLE IF NOT EXISTS public.profiles (
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

CREATE TABLE IF NOT EXISTS public.clients (
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

CREATE TABLE IF NOT EXISTS public.services (
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

CREATE TABLE IF NOT EXISTS public.orders (
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

CREATE TABLE IF NOT EXISTS public.invoices (
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

CREATE TABLE IF NOT EXISTS public.tasks (
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_clients_user_id   ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_services_user_id  ON public.services(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id    ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_client_id  ON public.orders(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id  ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON public.invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id     ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_order_id    ON public.tasks(order_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subdomain ON public.profiles(subdomain);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='Users can view own profile') THEN
    CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='Users can insert own profile') THEN
    CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='Users can update own profile') THEN
    CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='Users can delete own profile') THEN
    CREATE POLICY "Users can delete own profile" ON public.profiles FOR DELETE USING (id = auth.uid());
  END IF;
END $$;

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='clients' AND policyname='Users can view own clients') THEN
    CREATE POLICY "Users can view own clients" ON public.clients FOR SELECT USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='clients' AND policyname='Users can insert own clients') THEN
    CREATE POLICY "Users can insert own clients" ON public.clients FOR INSERT WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='clients' AND policyname='Users can update own clients') THEN
    CREATE POLICY "Users can update own clients" ON public.clients FOR UPDATE USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='clients' AND policyname='Users can delete own clients') THEN
    CREATE POLICY "Users can delete own clients" ON public.clients FOR DELETE USING (user_id = auth.uid());
  END IF;
END $$;

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='services' AND policyname='Users can view own services') THEN
    CREATE POLICY "Users can view own services" ON public.services FOR SELECT USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='services' AND policyname='Users can insert own services') THEN
    CREATE POLICY "Users can insert own services" ON public.services FOR INSERT WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='services' AND policyname='Users can update own services') THEN
    CREATE POLICY "Users can update own services" ON public.services FOR UPDATE USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='services' AND policyname='Users can delete own services') THEN
    CREATE POLICY "Users can delete own services" ON public.services FOR DELETE USING (user_id = auth.uid());
  END IF;
END $$;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='orders' AND policyname='Users can view own orders') THEN
    CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='orders' AND policyname='Users can insert own orders') THEN
    CREATE POLICY "Users can insert own orders" ON public.orders FOR INSERT WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='orders' AND policyname='Users can update own orders') THEN
    CREATE POLICY "Users can update own orders" ON public.orders FOR UPDATE USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='orders' AND policyname='Users can delete own orders') THEN
    CREATE POLICY "Users can delete own orders" ON public.orders FOR DELETE USING (user_id = auth.uid());
  END IF;
END $$;

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='invoices' AND policyname='Users can view own invoices') THEN
    CREATE POLICY "Users can view own invoices" ON public.invoices FOR SELECT USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='invoices' AND policyname='Users can insert own invoices') THEN
    CREATE POLICY "Users can insert own invoices" ON public.invoices FOR INSERT WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='invoices' AND policyname='Users can update own invoices') THEN
    CREATE POLICY "Users can update own invoices" ON public.invoices FOR UPDATE USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='invoices' AND policyname='Users can delete own invoices') THEN
    CREATE POLICY "Users can delete own invoices" ON public.invoices FOR DELETE USING (user_id = auth.uid());
  END IF;
END $$;

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='tasks' AND policyname='Users can view own tasks') THEN
    CREATE POLICY "Users can view own tasks" ON public.tasks FOR SELECT USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='tasks' AND policyname='Users can insert own tasks') THEN
    CREATE POLICY "Users can insert own tasks" ON public.tasks FOR INSERT WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='tasks' AND policyname='Users can update own tasks') THEN
    CREATE POLICY "Users can update own tasks" ON public.tasks FOR UPDATE USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='tasks' AND policyname='Users can delete own tasks') THEN
    CREATE POLICY "Users can delete own tasks" ON public.tasks FOR DELETE USING (user_id = auth.uid());
  END IF;
END $$;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Triggers (drop + recreate to be safe)
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_clients_updated_at ON public.clients;
CREATE TRIGGER set_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_services_updated_at ON public.services;
CREATE TRIGGER set_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_orders_updated_at ON public.orders;
CREATE TRIGGER set_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_invoices_updated_at ON public.invoices;
CREATE TRIGGER set_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_tasks_updated_at ON public.tasks;
CREATE TRIGGER set_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, subdomain, business_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(
      new.raw_user_meta_data->>'subdomain',
      lower(replace(COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), ' ', '-')) || '-' || substr(new.id::text, 1, 4)
    ),
    new.raw_user_meta_data->>'business_name'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    business_name = EXCLUDED.business_name,
    subdomain = EXCLUDED.subdomain;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============ MIGRATION 002: Site Builder ============

CREATE TABLE IF NOT EXISTS public.sites (
  id             uuid        primary key default gen_random_uuid(),
  owner_id       uuid        not null references public.profiles(id) on delete cascade,
  slug           text        unique not null,
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

CREATE TABLE IF NOT EXISTS public.site_pages (
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
  updated_at      timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS public.site_blocks (
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

CREATE TABLE IF NOT EXISTS public.site_published_snapshots (
  id           uuid        primary key default gen_random_uuid(),
  site_id      uuid        not null references public.sites(id) on delete cascade,
  page_id      uuid        not null references public.site_pages(id) on delete cascade,
  snapshot     jsonb       not null,
  published_at timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS public.site_assets (
  id        uuid        primary key default gen_random_uuid(),
  site_id   uuid        not null references public.sites(id) on delete cascade,
  path      text        not null,
  type      text        not null check (type in ('image', 'video', 'file')),
  metadata  jsonb       not null default '{}',
  created_at timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS public.site_product_links (
  id             uuid        primary key default gen_random_uuid(),
  site_id        uuid        not null references public.sites(id) on delete cascade,
  product_id     uuid        not null references public.services(id) on delete cascade,
  display_config jsonb       not null default '{}',
  created_at     timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS public.leads (
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

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id         uuid        primary key default gen_random_uuid(),
  site_id    uuid        not null references public.sites(id) on delete cascade,
  type       text        not null,
  page_slug  text,
  data       jsonb       not null default '{}',
  visitor_id text,
  created_at timestamptz not null default now()
);

-- Site builder indexes
CREATE INDEX IF NOT EXISTS idx_sites_slug           ON public.sites(slug);
CREATE INDEX IF NOT EXISTS idx_sites_owner          ON public.sites(owner_id);
CREATE INDEX IF NOT EXISTS idx_pages_site           ON public.site_pages(site_id);
CREATE INDEX IF NOT EXISTS idx_blocks_page_order    ON public.site_blocks(page_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_snapshots_site_page  ON public.site_published_snapshots(site_id, page_id);
CREATE INDEX IF NOT EXISTS idx_analytics_site_time  ON public.analytics_events(site_id, created_at desc);
CREATE INDEX IF NOT EXISTS idx_leads_site_time      ON public.leads(site_id, created_at desc);
CREATE INDEX IF NOT EXISTS idx_product_links_site   ON public.site_product_links(site_id);

-- Site builder RLS
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_published_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_product_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS set_sites_updated_at ON public.sites;
CREATE TRIGGER set_sites_updated_at BEFORE UPDATE ON public.sites FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
DROP TRIGGER IF EXISTS set_pages_updated_at ON public.site_pages;
CREATE TRIGGER set_pages_updated_at BEFORE UPDATE ON public.site_pages FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
DROP TRIGGER IF EXISTS set_blocks_updated_at ON public.site_blocks;
CREATE TRIGGER set_blocks_updated_at BEFORE UPDATE ON public.site_blocks FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- ============ MIGRATION 003: Checkout Flow ============

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS short_description TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS long_description TEXT,
  ADD COLUMN IF NOT EXISTS features TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS delivery_time_days INTEGER,
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS sales_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS form_schema_json JSONB NOT NULL DEFAULT '[]';

CREATE TABLE IF NOT EXISTS public.order_items (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   UUID        NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  service_id UUID        NOT NULL REFERENCES public.services(id),
  quantity   INTEGER     NOT NULL DEFAULT 1,
  unit_price NUMERIC     NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_submissions (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   UUID        NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  form_data  JSONB       NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_submissions ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.fn_upsert_client(
  p_user_id UUID, p_name TEXT, p_email TEXT, p_phone TEXT DEFAULT NULL
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_client_id UUID;
BEGIN
  SELECT id INTO v_client_id FROM public.clients
  WHERE user_id = p_user_id AND LOWER(email) = LOWER(p_email) LIMIT 1;
  IF v_client_id IS NOT NULL THEN
    UPDATE public.clients SET name = COALESCE(NULLIF(p_name, ''), name), phone = COALESCE(p_phone, phone), updated_at = now() WHERE id = v_client_id;
    RETURN v_client_id;
  ELSE
    INSERT INTO public.clients (user_id, name, email, phone) VALUES (p_user_id, p_name, p_email, p_phone) RETURNING id INTO v_client_id;
    RETURN v_client_id;
  END IF;
END; $$;

CREATE OR REPLACE FUNCTION public.fn_public_checkout(
  p_site_id UUID, p_product_id UUID, p_name TEXT, p_email TEXT,
  p_phone TEXT DEFAULT NULL, p_message TEXT DEFAULT NULL, p_form_data JSONB DEFAULT '{}'
) RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_owner_id UUID; v_service RECORD; v_client_id UUID; v_order_id UUID;
BEGIN
  SELECT owner_id INTO v_owner_id FROM public.sites WHERE id = p_site_id AND status = 'published';
  IF v_owner_id IS NULL THEN RAISE EXCEPTION 'Site not found'; END IF;
  SELECT id, title, price INTO v_service FROM public.services WHERE id = p_product_id AND user_id = v_owner_id AND is_active = true;
  IF v_service.id IS NULL THEN RAISE EXCEPTION 'Product not found'; END IF;
  v_client_id := public.fn_upsert_client(v_owner_id, p_name, p_email, p_phone);
  INSERT INTO public.orders (user_id, client_id, service_id, title, description, amount, status, paid)
  VALUES (v_owner_id, v_client_id, v_service.id, v_service.title, COALESCE(p_message, ''), v_service.price, 'new', false) RETURNING id INTO v_order_id;
  INSERT INTO public.order_items (order_id, service_id, quantity, unit_price) VALUES (v_order_id, v_service.id, 1, v_service.price);
  INSERT INTO public.order_submissions (order_id, form_data) VALUES (v_order_id, p_form_data);
  UPDATE public.services SET sales_count = sales_count + 1 WHERE id = v_service.id;
  UPDATE public.clients SET total_revenue = total_revenue + v_service.price WHERE id = v_client_id;
  RETURN json_build_object('order_id', v_order_id, 'client_id', v_client_id, 'amount', v_service.price);
END; $$;


-- ============ MIGRATION 004: Client Detail ============

ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS address JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS last_order_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.client_notes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL DEFAULT auth.uid(),
  client_id  UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_client_notes_client ON public.client_notes(client_id, created_at DESC);
ALTER TABLE public.client_notes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='client_notes' AND policyname='client_notes_select') THEN
    CREATE POLICY "client_notes_select" ON public.client_notes FOR SELECT USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='client_notes' AND policyname='client_notes_insert') THEN
    CREATE POLICY "client_notes_insert" ON public.client_notes FOR INSERT WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='client_notes' AND policyname='client_notes_update') THEN
    CREATE POLICY "client_notes_update" ON public.client_notes FOR UPDATE USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='client_notes' AND policyname='client_notes_delete') THEN
    CREATE POLICY "client_notes_delete" ON public.client_notes FOR DELETE USING (user_id = auth.uid());
  END IF;
END $$;

DROP TRIGGER IF EXISTS set_client_notes_updated_at ON public.client_notes;
CREATE TRIGGER set_client_notes_updated_at BEFORE UPDATE ON public.client_notes FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE IF NOT EXISTS public.client_events (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL DEFAULT auth.uid(),
  client_id  UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  payload    JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_client_events_client ON public.client_events(client_id, created_at DESC);
ALTER TABLE public.client_events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='client_events' AND policyname='client_events_select') THEN
    CREATE POLICY "client_events_select" ON public.client_events FOR SELECT USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='client_events' AND policyname='client_events_insert') THEN
    CREATE POLICY "client_events_insert" ON public.client_events FOR INSERT WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.fn_update_client_last_order()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.clients SET last_order_at = now() WHERE id = NEW.client_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_update_client_last_order ON public.orders;
CREATE TRIGGER trg_update_client_last_order AFTER INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION public.fn_update_client_last_order();


-- ============ MIGRATION 005: Client email unique ============

CREATE UNIQUE INDEX IF NOT EXISTS idx_clients_user_email ON public.clients (user_id, LOWER(email));

ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'fr',
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Europe/Paris',
  ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}';


-- ============ RELOAD SCHEMA CACHE ============
NOTIFY pgrst, 'reload schema';
`;

interface TableStatus {
  [key: string]: boolean;
}

export default function SetupPage() {
  const [status, setStatus] = useState<"loading" | "checking" | "ok" | "missing" | "error">("loading");
  const [tables, setTables] = useState<TableStatus>({});
  const [missing, setMissing] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const checkTables = async () => {
    setStatus("checking");
    try {
      const res = await fetch("/api/setup");
      const data = await res.json();
      setTables(data.tables);
      setMissing(data.missing);
      setStatus(data.ok ? "ok" : "missing");
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => {
    checkTables();
  }, []);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(FULL_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-6">
      <div className="max-w-lg w-full">
        <div className="bg-white border border-[#E6E6E4] rounded-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-[#4F46E5] flex items-center justify-center">
              <span className="text-white text-[13px] font-bold">J</span>
            </div>
            <h1 className="text-[20px] font-bold text-[#111]">Setup Jestly</h1>
          </div>

          {/* Status */}
          {status === "loading" || status === "checking" ? (
            <div className="flex items-center gap-3 py-8 justify-center">
              <div className="w-5 h-5 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
              <span className="text-[14px] text-[#666]">Vérification des tables...</span>
            </div>
          ) : status === "ok" ? (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <p className="text-[14px] text-emerald-700 font-medium">Toutes les tables sont OK !</p>
                <p className="text-[12px] text-emerald-600 mt-1">Ta base de données est prête.</p>
              </div>
              <a
                href="/dashboard"
                className="block text-center w-full bg-[#4F46E5] text-white text-[14px] font-semibold py-2.5 rounded-lg hover:bg-[#4338CA] transition-colors"
              >
                Aller au Dashboard
              </a>
            </div>
          ) : status === "error" ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-[14px] text-red-600">Erreur de connexion. Vérifie tes variables Supabase.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Missing tables */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-[14px] text-amber-700 font-medium mb-2">
                  {missing.length} table{missing.length > 1 ? "s" : ""} manquante{missing.length > 1 ? "s" : ""}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {missing.map((t) => (
                    <span key={t} className="text-[11px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-mono">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-3">
                <p className="text-[13px] font-semibold text-[#111]">3 clics pour tout fixer :</p>

                {/* Step 1: Copy */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#4F46E5] text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                  <div className="flex-1">
                    <p className="text-[13px] text-[#333] mb-2">Copie le SQL complet :</p>
                    <button
                      onClick={handleCopy}
                      className="w-full bg-[#4F46E5] text-white text-[13px] font-semibold py-2.5 rounded-lg hover:bg-[#4338CA] transition-colors cursor-pointer"
                    >
                      {copied ? "Copié !" : "Copier le SQL"}
                    </button>
                  </div>
                </div>

                {/* Step 2: Open SQL Editor */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#4F46E5] text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                  <div className="flex-1">
                    <p className="text-[13px] text-[#333] mb-2">Ouvre le SQL Editor Supabase, colle et clique Run :</p>
                    <a
                      href={SQL_EDITOR_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center w-full bg-white border border-[#E6E6E4] text-[#111] text-[13px] font-semibold py-2.5 rounded-lg hover:bg-[#F7F7F5] transition-colors"
                    >
                      Ouvrir Supabase SQL Editor &rarr;
                    </a>
                  </div>
                </div>

                {/* Step 3: Verify */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#4F46E5] text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                  <div className="flex-1">
                    <p className="text-[13px] text-[#333] mb-2">Reviens ici et vérifie :</p>
                    <button
                      onClick={checkTables}
                      className="w-full bg-white border border-[#E6E6E4] text-[#111] text-[13px] font-semibold py-2.5 rounded-lg hover:bg-[#F7F7F5] transition-colors cursor-pointer"
                    >
                      Vérifier les tables
                    </button>
                  </div>
                </div>
              </div>

              {/* Table grid */}
              <div className="border-t border-[#EFEFEF] pt-4">
                <p className="text-[11px] font-medium text-[#999] uppercase tracking-wider mb-2">Statut des tables</p>
                <div className="grid grid-cols-2 gap-1">
                  {Object.entries(tables).map(([name, ok]) => (
                    <div key={name} className="flex items-center gap-1.5 py-1">
                      <div className={`w-2 h-2 rounded-full ${ok ? "bg-emerald-400" : "bg-red-400"}`} />
                      <span className={`text-[11px] font-mono ${ok ? "text-[#999]" : "text-red-500"}`}>{name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
