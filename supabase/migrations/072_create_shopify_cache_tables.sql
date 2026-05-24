-- 072_create_shopify_cache_tables.sql
-- Tables cache local pour éviter de taper l'API Shopify en runtime.
-- Sync delta toutes les 5 min via cron + push realtime via webhooks.

-- ── shopify_orders ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.shopify_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id uuid NOT NULL REFERENCES public.integrations(id) ON DELETE CASCADE,
  shopify_order_id text NOT NULL,
  order_number text,
  name text,
  total_price numeric(12, 2),
  subtotal_price numeric(12, 2),
  total_tax numeric(12, 2),
  total_shipping numeric(12, 2),
  total_discounts numeric(12, 2),
  currency text DEFAULT 'EUR',
  financial_status text,
  fulfillment_status text,
  customer_id text,
  email text,
  phone text,
  line_items jsonb NOT NULL DEFAULT '[]',
  shipping_address jsonb,
  billing_address jsonb,
  tags text[] NOT NULL DEFAULT '{}',
  source_name text,
  referring_site text,
  landing_site text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  processed_at timestamptz,
  cancelled_at timestamptz,
  synced_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (integration_id, shopify_order_id)
);

CREATE INDEX IF NOT EXISTS idx_shopify_orders_integration_created ON public.shopify_orders(integration_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shopify_orders_financial_status ON public.shopify_orders(integration_id, financial_status);
CREATE INDEX IF NOT EXISTS idx_shopify_orders_email ON public.shopify_orders(integration_id, email);
CREATE INDEX IF NOT EXISTS idx_shopify_orders_source ON public.shopify_orders(integration_id, source_name);

-- ── shopify_products ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.shopify_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id uuid NOT NULL REFERENCES public.integrations(id) ON DELETE CASCADE,
  shopify_product_id text NOT NULL,
  title text NOT NULL,
  handle text,
  description text,
  product_type text,
  vendor text,
  status text,
  tags text[] NOT NULL DEFAULT '{}',
  variants jsonb NOT NULL DEFAULT '[]',
  images jsonb NOT NULL DEFAULT '[]',
  featured_image_url text,
  price_min numeric(12, 2),
  price_max numeric(12, 2),
  total_inventory int,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  published_at timestamptz,
  synced_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (integration_id, shopify_product_id)
);

CREATE INDEX IF NOT EXISTS idx_shopify_products_integration ON public.shopify_products(integration_id);
CREATE INDEX IF NOT EXISTS idx_shopify_products_status ON public.shopify_products(integration_id, status);
CREATE INDEX IF NOT EXISTS idx_shopify_products_handle ON public.shopify_products(integration_id, handle);

-- ── shopify_customers ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.shopify_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id uuid NOT NULL REFERENCES public.integrations(id) ON DELETE CASCADE,
  shopify_customer_id text NOT NULL,
  email text,
  first_name text,
  last_name text,
  phone text,
  orders_count int DEFAULT 0,
  total_spent numeric(12, 2) DEFAULT 0,
  currency text DEFAULT 'EUR',
  accepts_marketing boolean DEFAULT false,
  addresses jsonb NOT NULL DEFAULT '[]',
  default_address jsonb,
  tags text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  synced_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (integration_id, shopify_customer_id)
);

CREATE INDEX IF NOT EXISTS idx_shopify_customers_integration ON public.shopify_customers(integration_id);
CREATE INDEX IF NOT EXISTS idx_shopify_customers_email ON public.shopify_customers(integration_id, email);
CREATE INDEX IF NOT EXISTS idx_shopify_customers_total_spent ON public.shopify_customers(integration_id, total_spent DESC);

-- ── shopify_sessions_daily ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.shopify_sessions_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id uuid NOT NULL REFERENCES public.integrations(id) ON DELETE CASCADE,
  date date NOT NULL,
  sessions int DEFAULT 0,
  online_store_visitors int DEFAULT 0,
  sessions_with_cart_additions int DEFAULT 0,
  sessions_that_reached_checkout int DEFAULT 0,
  sessions_that_completed_checkout int DEFAULT 0,
  sessions_by_device jsonb NOT NULL DEFAULT '{}',
  sessions_by_country jsonb NOT NULL DEFAULT '{}',
  sessions_by_referrer jsonb NOT NULL DEFAULT '{}',
  sessions_by_landing_page jsonb NOT NULL DEFAULT '{}',
  avg_session_duration numeric(10, 2),
  synced_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (integration_id, date)
);

CREATE INDEX IF NOT EXISTS idx_shopify_sessions_integration_date ON public.shopify_sessions_daily(integration_id, date DESC);

-- ── shopify_analytics_daily ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.shopify_analytics_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id uuid NOT NULL REFERENCES public.integrations(id) ON DELETE CASCADE,
  date date NOT NULL,
  gross_sales numeric(12, 2) DEFAULT 0,
  discounts numeric(12, 2) DEFAULT 0,
  returns numeric(12, 2) DEFAULT 0,
  net_sales numeric(12, 2) DEFAULT 0,
  shipping_charges numeric(12, 2) DEFAULT 0,
  taxes numeric(12, 2) DEFAULT 0,
  total_sales numeric(12, 2) DEFAULT 0,
  orders int DEFAULT 0,
  returning_customers int DEFAULT 0,
  new_customers int DEFAULT 0,
  total_customers int DEFAULT 0,
  returning_customer_rate numeric(5, 2),
  average_order_value numeric(12, 2),
  units_sold int DEFAULT 0,
  synced_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (integration_id, date)
);

CREATE INDEX IF NOT EXISTS idx_shopify_analytics_integration_date ON public.shopify_analytics_daily(integration_id, date DESC);
