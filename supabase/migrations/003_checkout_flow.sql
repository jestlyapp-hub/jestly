-- ============================================================
-- Jestly — Checkout Flow Schema
-- Extends services, adds order_items, order_submissions,
-- upsert client RPC, public checkout RPC
-- ============================================================

-- ────────────────────────────────────────────
-- 1. EXTEND SERVICES TABLE
-- ────────────────────────────────────────────
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS short_description TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS long_description TEXT,
  ADD COLUMN IF NOT EXISTS features TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS delivery_time_days INTEGER,
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS sales_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS form_schema_json JSONB NOT NULL DEFAULT '[]';

-- ────────────────────────────────────────────
-- 2. ORDER ITEMS (line items per order)
-- ────────────────────────────────────────────
CREATE TABLE public.order_items (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   UUID        NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  service_id UUID        NOT NULL REFERENCES public.services(id),
  quantity   INTEGER     NOT NULL DEFAULT 1,
  unit_price NUMERIC     NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_items_order ON public.order_items(order_id);

-- ────────────────────────────────────────────
-- 3. ORDER SUBMISSIONS (form data per order)
-- ────────────────────────────────────────────
CREATE TABLE public.order_submissions (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   UUID        NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  form_data  JSONB       NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_submissions_order ON public.order_submissions(order_id);

-- ────────────────────────────────────────────
-- 4. RLS for new tables
-- ────────────────────────────────────────────
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own order items"
  ON public.order_items FOR SELECT
  USING (order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own order items"
  ON public.order_items FOR INSERT
  WITH CHECK (order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid()));

ALTER TABLE public.order_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own order submissions"
  ON public.order_submissions FOR SELECT
  USING (order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own order submissions"
  ON public.order_submissions FOR INSERT
  WITH CHECK (order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid()));

-- ────────────────────────────────────────────
-- 5. Public SELECT on services (for public sites)
-- ────────────────────────────────────────────
CREATE POLICY "Public can view active services of published sites"
  ON public.services FOR SELECT
  USING (
    is_active = true
    AND user_id IN (
      SELECT owner_id FROM public.sites WHERE status = 'published'
    )
  );

-- ────────────────────────────────────────────
-- 6. RPC: Upsert Client (find by email or create)
-- ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.fn_upsert_client(
  p_user_id UUID,
  p_name    TEXT,
  p_email   TEXT,
  p_phone   TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_client_id UUID;
BEGIN
  -- Look for existing client by email (case-insensitive) within user scope
  SELECT id INTO v_client_id
  FROM public.clients
  WHERE user_id = p_user_id AND LOWER(email) = LOWER(p_email)
  LIMIT 1;

  IF v_client_id IS NOT NULL THEN
    -- Update name and phone if provided
    UPDATE public.clients
    SET
      name = COALESCE(NULLIF(p_name, ''), name),
      phone = COALESCE(p_phone, phone),
      updated_at = now()
    WHERE id = v_client_id;
    RETURN v_client_id;
  ELSE
    -- Create new client
    INSERT INTO public.clients (user_id, name, email, phone)
    VALUES (p_user_id, p_name, p_email, p_phone)
    RETURNING id INTO v_client_id;
    RETURN v_client_id;
  END IF;
END;
$$;

-- ────────────────────────────────────────────
-- 7. RPC: Public Checkout (single transaction)
-- ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.fn_public_checkout(
  p_site_id    UUID,
  p_product_id UUID,
  p_name       TEXT,
  p_email      TEXT,
  p_phone      TEXT DEFAULT NULL,
  p_message    TEXT DEFAULT NULL,
  p_form_data  JSONB DEFAULT '{}'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_owner_id  UUID;
  v_service   RECORD;
  v_client_id UUID;
  v_order_id  UUID;
BEGIN
  -- Resolve site owner
  SELECT owner_id INTO v_owner_id
  FROM public.sites
  WHERE id = p_site_id AND status = 'published';

  IF v_owner_id IS NULL THEN
    RAISE EXCEPTION 'Site not found or not published';
  END IF;

  -- Resolve service
  SELECT id, title, price INTO v_service
  FROM public.services
  WHERE id = p_product_id AND user_id = v_owner_id AND is_active = true;

  IF v_service.id IS NULL THEN
    RAISE EXCEPTION 'Product not found or inactive';
  END IF;

  -- Upsert client
  v_client_id := public.fn_upsert_client(v_owner_id, p_name, p_email, p_phone);

  -- Create order
  INSERT INTO public.orders (user_id, client_id, service_id, title, description, amount, status, paid)
  VALUES (v_owner_id, v_client_id, v_service.id, v_service.title, COALESCE(p_message, ''), v_service.price, 'new', false)
  RETURNING id INTO v_order_id;

  -- Create order item
  INSERT INTO public.order_items (order_id, service_id, quantity, unit_price)
  VALUES (v_order_id, v_service.id, 1, v_service.price);

  -- Create order submission (form data)
  INSERT INTO public.order_submissions (order_id, form_data)
  VALUES (v_order_id, p_form_data);

  -- Increment sales count
  UPDATE public.services SET sales_count = sales_count + 1 WHERE id = v_service.id;

  -- Update client revenue
  UPDATE public.clients
  SET total_revenue = total_revenue + v_service.price
  WHERE id = v_client_id;

  RETURN json_build_object(
    'order_id', v_order_id,
    'client_id', v_client_id,
    'amount', v_service.price
  );
END;
$$;
