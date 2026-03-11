-- ══════════════════════════════════════════════════════════
-- 033 — Global Search V2 : Denormalized Index + pg_trgm
-- Replaces the V1 view with a real indexed table
-- ══════════════════════════════════════════════════════════

-- ─── Extensions ───
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- ─── Immutable unaccent wrapper (needed for indexes) ───
CREATE OR REPLACE FUNCTION public.f_unaccent(text)
RETURNS text AS $$
  SELECT public.unaccent('public.unaccent', $1);
$$ LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT;

-- ═══════════════════════════════════════════════════════════
-- 1. SEARCH_DOCUMENTS TABLE
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.search_documents (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type    text        NOT NULL,
  entity_id      uuid        NOT NULL,
  user_id        uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  -- Display
  title          text        NOT NULL DEFAULT '',
  subtitle       text        NOT NULL DEFAULT '',
  description    text        NOT NULL DEFAULT '',
  breadcrumbs    text[]      NOT NULL DEFAULT '{}',
  href           text        NOT NULL DEFAULT '',
  -- Metadata
  status         text,
  priority       text,
  amount_cents   numeric,
  item_date      date,
  is_archived    boolean     NOT NULL DEFAULT false,
  metadata       jsonb       NOT NULL DEFAULT '{}',
  -- Search vectors
  search_vector  tsvector,
  trigram_text   text        NOT NULL DEFAULT '',
  -- Ranking
  rank_boost     real        NOT NULL DEFAULT 1.0,
  -- Timestamps
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  -- Unique per entity
  UNIQUE(entity_type, entity_id)
);

-- ─── Indexes ───
CREATE INDEX IF NOT EXISTS idx_sd_user_id        ON search_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_sd_entity_type    ON search_documents(entity_type);
CREATE INDEX IF NOT EXISTS idx_sd_search_vector  ON search_documents USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_sd_trigram_text   ON search_documents USING GIN(trigram_text gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_sd_user_vector    ON search_documents USING GIN(search_vector) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sd_updated_at     ON search_documents(updated_at DESC);

-- ─── RLS ───
ALTER TABLE search_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sd_select" ON search_documents FOR SELECT
  USING (user_id = auth.uid());
CREATE POLICY "sd_insert" ON search_documents FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "sd_update" ON search_documents FOR UPDATE
  USING (user_id = auth.uid());
CREATE POLICY "sd_delete" ON search_documents FOR DELETE
  USING (user_id = auth.uid());

-- ═══════════════════════════════════════════════════════════
-- 2. AUTO-COMPUTE search_vector + trigram_text ON INSERT/UPDATE
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION fn_sd_compute_vectors()
RETURNS TRIGGER AS $$
BEGIN
  -- Build tsvector with weights
  NEW.search_vector :=
    setweight(to_tsvector('simple', f_unaccent(coalesce(NEW.title, ''))), 'A') ||
    setweight(to_tsvector('simple', f_unaccent(coalesce(NEW.subtitle, ''))), 'B') ||
    setweight(to_tsvector('simple', f_unaccent(coalesce(NEW.description, ''))), 'C') ||
    setweight(to_tsvector('simple', f_unaccent(coalesce(array_to_string(NEW.breadcrumbs, ' '), ''))), 'D');

  -- Build trigram text (concatenation of all searchable text, unaccented)
  NEW.trigram_text := lower(f_unaccent(
    coalesce(NEW.title, '') || ' ' ||
    coalesce(NEW.subtitle, '') || ' ' ||
    coalesce(NEW.description, '')
  ));

  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sd_compute_vectors
  BEFORE INSERT OR UPDATE ON search_documents
  FOR EACH ROW EXECUTE FUNCTION fn_sd_compute_vectors();

-- ═══════════════════════════════════════════════════════════
-- 3. UPSERT HELPER
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION fn_upsert_search_doc(
  p_entity_type   text,
  p_entity_id     uuid,
  p_user_id       uuid,
  p_title         text,
  p_subtitle      text DEFAULT '',
  p_description   text DEFAULT '',
  p_breadcrumbs   text[] DEFAULT '{}',
  p_href          text DEFAULT '',
  p_status        text DEFAULT NULL,
  p_priority      text DEFAULT NULL,
  p_amount_cents  numeric DEFAULT NULL,
  p_item_date     date DEFAULT NULL,
  p_is_archived   boolean DEFAULT false,
  p_metadata      jsonb DEFAULT '{}',
  p_rank_boost    real DEFAULT 1.0
)
RETURNS void AS $$
BEGIN
  INSERT INTO search_documents (
    entity_type, entity_id, user_id, title, subtitle, description,
    breadcrumbs, href, status, priority, amount_cents, item_date,
    is_archived, metadata, rank_boost
  ) VALUES (
    p_entity_type, p_entity_id, p_user_id, p_title, p_subtitle, p_description,
    p_breadcrumbs, p_href, p_status, p_priority, p_amount_cents, p_item_date,
    p_is_archived, p_metadata, p_rank_boost
  )
  ON CONFLICT (entity_type, entity_id)
  DO UPDATE SET
    user_id     = EXCLUDED.user_id,
    title       = EXCLUDED.title,
    subtitle    = EXCLUDED.subtitle,
    description = EXCLUDED.description,
    breadcrumbs = EXCLUDED.breadcrumbs,
    href        = EXCLUDED.href,
    status      = EXCLUDED.status,
    priority    = EXCLUDED.priority,
    amount_cents = EXCLUDED.amount_cents,
    item_date   = EXCLUDED.item_date,
    is_archived = EXCLUDED.is_archived,
    metadata    = EXCLUDED.metadata,
    rank_boost  = EXCLUDED.rank_boost;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════
-- 4. SYNC TRIGGERS — Keep search_documents in sync
-- ═══════════════════════════════════════════════════════════

-- ─── 4a. Clients ───
CREATE OR REPLACE FUNCTION fn_sd_sync_client()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM search_documents WHERE entity_type = 'client' AND entity_id = OLD.id;
    RETURN OLD;
  END IF;

  PERFORM fn_upsert_search_doc(
    'client', NEW.id, NEW.user_id,
    NEW.name,
    coalesce(NEW.email, ''),
    concat_ws(' ', NEW.company, NEW.phone, NEW.notes),
    ARRAY[]::text[],
    '/clients',
    NEW.status,
    NULL,
    NEW.total_revenue,
    NULL,
    NEW.status = 'archived',
    jsonb_build_object(
      'email', coalesce(NEW.email, ''),
      'company', coalesce(NEW.company, ''),
      'phone', coalesce(NEW.phone, ''),
      'tags', coalesce(array_to_string(NEW.tags, ','), '')
    ),
    5.0  -- Clients are high priority
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sd_client ON clients;
CREATE TRIGGER trg_sd_client
  AFTER INSERT OR UPDATE OR DELETE ON clients
  FOR EACH ROW EXECUTE FUNCTION fn_sd_sync_client();

-- ─── 4b. Orders ───
CREATE OR REPLACE FUNCTION fn_sd_sync_order()
RETURNS TRIGGER AS $$
DECLARE
  v_client_name text;
  v_product_name text;
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM search_documents WHERE entity_type = 'order' AND entity_id = OLD.id;
    RETURN OLD;
  END IF;

  SELECT name INTO v_client_name FROM clients WHERE id = NEW.client_id;
  SELECT title INTO v_product_name FROM services WHERE id = NEW.service_id;

  PERFORM fn_upsert_search_doc(
    'order', NEW.id, NEW.user_id,
    coalesce(v_product_name, NEW.title, 'Commande'),
    coalesce(v_client_name, ''),
    coalesce(NEW.description, '') || ' ' || coalesce(NEW.notes, ''),
    ARRAY[coalesce(v_client_name, '')]::text[],
    '/commandes',
    NEW.status,
    NEW.priority,
    NEW.amount,
    NEW.created_at::date,
    NEW.status IN ('cancelled', 'refunded'),
    jsonb_build_object('client_name', coalesce(v_client_name, ''), 'product_name', coalesce(v_product_name, '')),
    4.0
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sd_order ON orders;
CREATE TRIGGER trg_sd_order
  AFTER INSERT OR UPDATE OR DELETE ON orders
  FOR EACH ROW EXECUTE FUNCTION fn_sd_sync_order();

-- ─── 4c. Products (table = services) ───
CREATE OR REPLACE FUNCTION fn_sd_sync_product()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM search_documents WHERE entity_type = 'product' AND entity_id = OLD.id;
    RETURN OLD;
  END IF;

  PERFORM fn_upsert_search_doc(
    'product', NEW.id, NEW.user_id,
    NEW.title,
    coalesce(NEW.category, ''),
    concat_ws(' ', NEW.short_description, NEW.long_description),
    ARRAY[]::text[],
    '/produits',
    CASE WHEN NEW.is_active THEN 'active' ELSE 'inactive' END,
    NULL,
    NEW.price,
    NEW.created_at::date,
    NOT NEW.is_active,
    jsonb_build_object('type', coalesce(NEW.type, ''), 'category', coalesce(NEW.category, '')),
    3.0
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sd_product ON services;
CREATE TRIGGER trg_sd_product
  AFTER INSERT OR UPDATE OR DELETE ON services
  FOR EACH ROW EXECUTE FUNCTION fn_sd_sync_product();

-- ─── 4d. Tasks ───
CREATE OR REPLACE FUNCTION fn_sd_sync_task()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM search_documents WHERE entity_type = 'task' AND entity_id = OLD.id;
    RETURN OLD;
  END IF;

  PERFORM fn_upsert_search_doc(
    'task', NEW.id, NEW.user_id,
    NEW.title,
    coalesce(NEW.client_name, ''),
    coalesce(NEW.description, ''),
    ARRAY[coalesce(NEW.client_name, '')]::text[],
    '/taches/' || NEW.id,
    NEW.status,
    NEW.priority,
    NULL,
    NEW.due_date,
    NEW.archived_at IS NOT NULL,
    jsonb_build_object('tags', coalesce(array_to_string(NEW.tags, ','), '')),
    2.5
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sd_task ON tasks;
CREATE TRIGGER trg_sd_task
  AFTER INSERT OR UPDATE OR DELETE ON tasks
  FOR EACH ROW EXECUTE FUNCTION fn_sd_sync_task();

-- ─── 4e. Invoices ───
CREATE OR REPLACE FUNCTION fn_sd_sync_invoice()
RETURNS TRIGGER AS $$
DECLARE
  v_client_name text;
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM search_documents WHERE entity_type = 'invoice' AND entity_id = OLD.id;
    RETURN OLD;
  END IF;

  SELECT name INTO v_client_name FROM clients WHERE id = NEW.client_id;

  PERFORM fn_upsert_search_doc(
    'invoice', NEW.id, NEW.user_id,
    coalesce(NEW.invoice_number, 'Facture'),
    coalesce(v_client_name, ''),
    '',
    ARRAY[coalesce(v_client_name, '')]::text[],
    '/facturation',
    NEW.status,
    NULL,
    NEW.total,
    NEW.due_date,
    NEW.status = 'cancelled',
    jsonb_build_object('client_name', coalesce(v_client_name, ''), 'pdf_url', coalesce(NEW.pdf_url, '')),
    3.5
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sd_invoice ON invoices;
CREATE TRIGGER trg_sd_invoice
  AFTER INSERT OR UPDATE OR DELETE ON invoices
  FOR EACH ROW EXECUTE FUNCTION fn_sd_sync_invoice();

-- ─── 4f. Projects ───
CREATE OR REPLACE FUNCTION fn_sd_sync_project()
RETURNS TRIGGER AS $$
DECLARE
  v_client_name text;
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM search_documents WHERE entity_type = 'project' AND entity_id = OLD.id;
    RETURN OLD;
  END IF;

  SELECT name INTO v_client_name FROM clients WHERE id = NEW.client_id;

  PERFORM fn_upsert_search_doc(
    'project', NEW.id, NEW.user_id,
    NEW.name,
    coalesce(v_client_name, ''),
    coalesce(NEW.description, '') || ' ' || coalesce(array_to_string(NEW.tags, ' '), ''),
    ARRAY[coalesce(v_client_name, '')]::text[],
    '/projets/' || NEW.id,
    NEW.status,
    NEW.priority,
    NEW.budget,
    NEW.created_at::date,
    NEW.status = 'archived',
    jsonb_build_object(
      'client_name', coalesce(v_client_name, ''),
      'project_type', coalesce(NEW.project_type, ''),
      'color', coalesce(NEW.color, ''),
      'tags', coalesce(array_to_string(NEW.tags, ','), '')
    ),
    4.5
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sd_project ON projects;
CREATE TRIGGER trg_sd_project
  AFTER INSERT OR UPDATE OR DELETE ON projects
  FOR EACH ROW EXECUTE FUNCTION fn_sd_sync_project();

-- ─── 4g. Project Items (files/images/notes/links) ───
CREATE OR REPLACE FUNCTION fn_sd_sync_project_item()
RETURNS TRIGGER AS $$
DECLARE
  v_project_name text;
  v_user_id uuid;
  v_client_name text;
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM search_documents WHERE entity_type = 'file' AND entity_id = OLD.id;
    RETURN OLD;
  END IF;

  SELECT p.name, p.user_id, c.name
  INTO v_project_name, v_user_id, v_client_name
  FROM projects p LEFT JOIN clients c ON c.id = p.client_id
  WHERE p.id = NEW.project_id;

  IF v_user_id IS NULL THEN RETURN NEW; END IF;

  PERFORM fn_upsert_search_doc(
    'file', NEW.id, v_user_id,
    coalesce(NULLIF(NEW.title, ''), NEW.file_path, 'Fichier'),
    coalesce(v_project_name, ''),
    coalesce(NEW.description, '') || ' ' || coalesce(NEW.content, ''),
    ARRAY[coalesce(v_project_name, ''), coalesce(v_client_name, '')]::text[],
    '/projets/' || NEW.project_id,
    NULL,
    NULL,
    NULL,
    NEW.created_at::date,
    false,
    jsonb_build_object(
      'item_type', coalesce(NEW.item_type, 'file'),
      'mime_type', coalesce(NEW.mime_type, ''),
      'project_name', coalesce(v_project_name, ''),
      'client_name', coalesce(v_client_name, ''),
      'file_path', coalesce(NEW.file_path, ''),
      'is_pinned', coalesce(NEW.is_pinned::text, 'false')
    ),
    1.5
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sd_project_item ON project_items;
CREATE TRIGGER trg_sd_project_item
  AFTER INSERT OR UPDATE OR DELETE ON project_items
  FOR EACH ROW EXECUTE FUNCTION fn_sd_sync_project_item();

-- ─── 4h. Calendar Events ───
CREATE OR REPLACE FUNCTION fn_sd_sync_calendar_event()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM search_documents WHERE entity_type = 'event' AND entity_id = OLD.id;
    RETURN OLD;
  END IF;

  PERFORM fn_upsert_search_doc(
    'event', NEW.id, NEW.user_id,
    NEW.title,
    coalesce(NEW.category, ''),
    coalesce(NEW.notes, '') || ' ' || coalesce(NEW.client_name, ''),
    ARRAY[coalesce(NEW.client_name, '')]::text[],
    '/calendrier',
    NULL,
    NEW.priority,
    NULL,
    NEW.date,
    false,
    jsonb_build_object('category', coalesce(NEW.category, ''), 'color', coalesce(NEW.color, '')),
    2.0
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sd_calendar_event ON calendar_events;
CREATE TRIGGER trg_sd_calendar_event
  AFTER INSERT OR UPDATE OR DELETE ON calendar_events
  FOR EACH ROW EXECUTE FUNCTION fn_sd_sync_calendar_event();

-- ─── 4i. Leads ───
CREATE OR REPLACE FUNCTION fn_sd_sync_lead()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id uuid;
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM search_documents WHERE entity_type = 'lead' AND entity_id = OLD.id;
    RETURN OLD;
  END IF;

  SELECT owner_id INTO v_user_id FROM sites WHERE id = NEW.site_id;
  IF v_user_id IS NULL THEN RETURN NEW; END IF;

  PERFORM fn_upsert_search_doc(
    'lead', NEW.id, v_user_id,
    coalesce(NEW.name, NEW.email, 'Lead'),
    coalesce(NEW.email, ''),
    coalesce(NEW.message, '') || ' ' || coalesce(NEW.company, ''),
    ARRAY[]::text[],
    '/site-web/' || NEW.site_id || '/leads',
    coalesce(NEW.status, 'new'),
    NULL,
    NEW.amount,
    NEW.created_at::date,
    false,
    jsonb_build_object('company', coalesce(NEW.company, ''), 'phone', coalesce(NEW.phone, '')),
    1.0
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sd_lead ON leads;
CREATE TRIGGER trg_sd_lead
  AFTER INSERT OR UPDATE OR DELETE ON leads
  FOR EACH ROW EXECUTE FUNCTION fn_sd_sync_lead();

-- ─── 4j. Brief Templates ───
CREATE OR REPLACE FUNCTION fn_sd_sync_brief_template()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM search_documents WHERE entity_type = 'brief' AND entity_id = OLD.id;
    RETURN OLD;
  END IF;

  PERFORM fn_upsert_search_doc(
    'brief', NEW.id, NEW.owner_id,
    NEW.name,
    coalesce(NEW.description, ''),
    '',
    ARRAY[]::text[],
    '/briefs',
    NULL,
    NULL,
    NULL,
    NULL,
    false,
    '{}'::jsonb,
    1.5
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sd_brief_template ON brief_templates;
CREATE TRIGGER trg_sd_brief_template
  AFTER INSERT OR UPDATE OR DELETE ON brief_templates
  FOR EACH ROW EXECUTE FUNCTION fn_sd_sync_brief_template();

-- ─── 4k. Client Notes ───
CREATE OR REPLACE FUNCTION fn_sd_sync_client_note()
RETURNS TRIGGER AS $$
DECLARE
  v_client_name text;
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM search_documents WHERE entity_type = 'note' AND entity_id = OLD.id;
    RETURN OLD;
  END IF;

  SELECT name INTO v_client_name FROM clients WHERE id = NEW.client_id;

  PERFORM fn_upsert_search_doc(
    'note', NEW.id, NEW.user_id,
    'Note — ' || coalesce(v_client_name, ''),
    coalesce(v_client_name, ''),
    NEW.content,
    ARRAY[coalesce(v_client_name, '')]::text[],
    '/clients',
    NULL,
    NULL,
    NULL,
    NEW.created_at::date,
    false,
    jsonb_build_object('client_name', coalesce(v_client_name, '')),
    1.0
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sd_client_note ON client_notes;
CREATE TRIGGER trg_sd_client_note
  AFTER INSERT OR UPDATE OR DELETE ON client_notes
  FOR EACH ROW EXECUTE FUNCTION fn_sd_sync_client_note();

-- ─── 4l. Order Files ───
CREATE OR REPLACE FUNCTION fn_sd_sync_order_file()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id uuid;
  v_order_title text;
  v_client_name text;
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM search_documents WHERE entity_type = 'file' AND entity_id = OLD.id;
    RETURN OLD;
  END IF;

  SELECT o.user_id, coalesce(s.title, o.title), c.name
  INTO v_user_id, v_order_title, v_client_name
  FROM orders o
  LEFT JOIN services s ON s.id = o.service_id
  LEFT JOIN clients c ON c.id = o.client_id
  WHERE o.id = NEW.order_id;

  IF v_user_id IS NULL THEN RETURN NEW; END IF;

  PERFORM fn_upsert_search_doc(
    'file', NEW.id, v_user_id,
    coalesce(NEW.file_name, 'Fichier'),
    coalesce(v_order_title, ''),
    '',
    ARRAY[coalesce(v_order_title, ''), coalesce(v_client_name, '')]::text[],
    '/commandes',
    NULL,
    NULL,
    NULL,
    NEW.created_at::date,
    false,
    jsonb_build_object('mime_type', coalesce(NEW.mime_type, ''), 'order_title', coalesce(v_order_title, '')),
    1.0
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sd_order_file ON order_files;
CREATE TRIGGER trg_sd_order_file
  AFTER INSERT OR UPDATE OR DELETE ON order_files
  FOR EACH ROW EXECUTE FUNCTION fn_sd_sync_order_file();

-- ═══════════════════════════════════════════════════════════
-- 5. V2 SEARCH FUNCTION — Hybrid ranking
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION fn_search_v2(
  p_query       text,
  p_user_id     uuid,
  p_limit       int DEFAULT 25,
  p_entity_type text DEFAULT NULL
)
RETURNS TABLE(
  id            uuid,
  entity_type   text,
  entity_id     uuid,
  title         text,
  subtitle      text,
  description   text,
  breadcrumbs   text[],
  href          text,
  status        text,
  priority      text,
  amount_cents  numeric,
  item_date     date,
  is_archived   boolean,
  metadata      jsonb,
  rank_score    real
)
LANGUAGE plpgsql STABLE SECURITY DEFINER
AS $$
DECLARE
  v_query_clean text;
  v_tsquery tsquery;
  v_prefix_query tsquery;
BEGIN
  -- Clean query
  v_query_clean := trim(lower(f_unaccent(p_query)));

  -- Build tsquery for full-text
  v_tsquery := plainto_tsquery('simple', v_query_clean);

  -- Build prefix tsquery (last word gets prefix matching)
  v_prefix_query := to_tsquery('simple',
    regexp_replace(v_query_clean, '\s+', ':* & ', 'g') || ':*'
  );

  RETURN QUERY
  SELECT
    sd.id,
    sd.entity_type,
    sd.entity_id,
    sd.title,
    sd.subtitle,
    sd.description,
    sd.breadcrumbs,
    sd.href,
    sd.status,
    sd.priority,
    sd.amount_cents,
    sd.item_date,
    sd.is_archived,
    sd.metadata,
    (
      -- Full-text relevance (0-1 range, scaled to 40)
      COALESCE(ts_rank_cd(sd.search_vector, v_tsquery, 32), 0) * 40

      -- Prefix match relevance
      + CASE WHEN sd.search_vector @@ v_prefix_query
          THEN COALESCE(ts_rank_cd(sd.search_vector, v_prefix_query, 32), 0) * 20
          ELSE 0 END

      -- Exact title match
      + CASE WHEN lower(f_unaccent(sd.title)) = v_query_clean THEN 50 ELSE 0 END

      -- Title starts with query
      + CASE WHEN lower(f_unaccent(sd.title)) LIKE v_query_clean || '%' THEN 30 ELSE 0 END

      -- Title contains query
      + CASE WHEN lower(f_unaccent(sd.title)) LIKE '%' || v_query_clean || '%' THEN 15 ELSE 0 END

      -- Trigram similarity (0-1, scaled to 15)
      + similarity(sd.trigram_text, v_query_clean) * 15

      -- Type boost
      + sd.rank_boost

      -- Recency boost: 0-3 points for items updated in last 90 days
      + GREATEST(0, 3 - EXTRACT(EPOCH FROM now() - sd.updated_at) / 86400 / 30)::real

      -- Archived penalty
      + CASE WHEN sd.is_archived THEN -20 ELSE 0 END
    )::real AS rank_score

  FROM search_documents sd
  WHERE sd.user_id = p_user_id
    AND (p_entity_type IS NULL OR sd.entity_type = p_entity_type)
    AND (
      -- Full-text match
      sd.search_vector @@ v_tsquery
      -- OR prefix match
      OR sd.search_vector @@ v_prefix_query
      -- OR trigram similarity (for typos)
      OR similarity(sd.trigram_text, v_query_clean) > 0.2
      -- OR direct ILIKE (catch-all)
      OR lower(f_unaccent(sd.title)) LIKE '%' || v_query_clean || '%'
      OR lower(f_unaccent(sd.subtitle)) LIKE '%' || v_query_clean || '%'
    )
  ORDER BY rank_score DESC
  LIMIT p_limit;
END;
$$;

-- ═══════════════════════════════════════════════════════════
-- 6. FULL REBUILD FUNCTION
-- Populates search_documents from all source tables
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION fn_rebuild_search_index(p_user_id uuid DEFAULT NULL)
RETURNS int AS $$
DECLARE
  v_count int := 0;
  r RECORD;
BEGIN
  -- Clear existing docs for this user (or all if NULL)
  IF p_user_id IS NOT NULL THEN
    DELETE FROM search_documents WHERE user_id = p_user_id;
  ELSE
    TRUNCATE search_documents;
  END IF;

  -- Clients
  FOR r IN SELECT * FROM clients WHERE (p_user_id IS NULL OR user_id = p_user_id) LOOP
    PERFORM fn_upsert_search_doc(
      'client', r.id, r.user_id, r.name,
      coalesce(r.email, ''),
      concat_ws(' ', r.company, r.phone, r.notes),
      ARRAY[]::text[], '/clients',
      r.status, NULL, r.total_revenue, NULL,
      r.status = 'archived',
      jsonb_build_object('email', coalesce(r.email,''), 'company', coalesce(r.company,''), 'phone', coalesce(r.phone,'')),
      5.0
    );
    v_count := v_count + 1;
  END LOOP;

  -- Orders
  FOR r IN
    SELECT o.*, c.name AS client_name_val, s.title AS product_name_val
    FROM orders o
    LEFT JOIN clients c ON c.id = o.client_id
    LEFT JOIN services s ON s.id = o.service_id
    WHERE (p_user_id IS NULL OR o.user_id = p_user_id)
  LOOP
    PERFORM fn_upsert_search_doc(
      'order', r.id, r.user_id,
      coalesce(r.product_name_val, r.title, 'Commande'),
      coalesce(r.client_name_val, ''),
      coalesce(r.description, '') || ' ' || coalesce(r.notes, ''),
      ARRAY[coalesce(r.client_name_val, '')]::text[], '/commandes',
      r.status, r.priority, r.amount, r.created_at::date,
      r.status IN ('cancelled', 'refunded'),
      jsonb_build_object('client_name', coalesce(r.client_name_val,''), 'product_name', coalesce(r.product_name_val,'')),
      4.0
    );
    v_count := v_count + 1;
  END LOOP;

  -- Products (table = services)
  FOR r IN SELECT * FROM services WHERE (p_user_id IS NULL OR user_id = p_user_id) LOOP
    PERFORM fn_upsert_search_doc(
      'product', r.id, r.user_id, r.title,
      coalesce(r.category, ''),
      concat_ws(' ', r.short_description, r.long_description),
      ARRAY[]::text[], '/produits',
      CASE WHEN r.is_active THEN 'active' ELSE 'inactive' END,
      NULL, r.price, r.created_at::date,
      NOT r.is_active,
      jsonb_build_object('type', coalesce(r.type,''), 'category', coalesce(r.category,'')),
      3.0
    );
    v_count := v_count + 1;
  END LOOP;

  -- Tasks
  FOR r IN SELECT * FROM tasks WHERE (p_user_id IS NULL OR user_id = p_user_id) LOOP
    PERFORM fn_upsert_search_doc(
      'task', r.id, r.user_id, r.title,
      coalesce(r.client_name, ''),
      coalesce(r.description, ''),
      ARRAY[coalesce(r.client_name, '')]::text[], '/taches/' || r.id,
      r.status, r.priority, NULL, r.due_date,
      r.archived_at IS NOT NULL,
      jsonb_build_object('tags', coalesce(array_to_string(r.tags, ','),'')),
      2.5
    );
    v_count := v_count + 1;
  END LOOP;

  -- Invoices
  FOR r IN
    SELECT i.*, c.name AS cname
    FROM invoices i LEFT JOIN clients c ON c.id = i.client_id
    WHERE (p_user_id IS NULL OR i.user_id = p_user_id)
  LOOP
    PERFORM fn_upsert_search_doc(
      'invoice', r.id, r.user_id,
      coalesce(r.invoice_number, 'Facture'),
      coalesce(r.cname, ''),
      '',
      ARRAY[coalesce(r.cname, '')]::text[], '/facturation',
      r.status, NULL, r.total, r.due_date,
      r.status = 'cancelled',
      jsonb_build_object('client_name', coalesce(r.cname,''), 'pdf_url', coalesce(r.pdf_url,'')),
      3.5
    );
    v_count := v_count + 1;
  END LOOP;

  -- Projects
  FOR r IN
    SELECT p.*, c.name AS cname
    FROM projects p LEFT JOIN clients c ON c.id = p.client_id
    WHERE (p_user_id IS NULL OR p.user_id = p_user_id)
  LOOP
    PERFORM fn_upsert_search_doc(
      'project', r.id, r.user_id, r.name,
      coalesce(r.cname, ''),
      coalesce(r.description, '') || ' ' || coalesce(array_to_string(r.tags, ' '), ''),
      ARRAY[coalesce(r.cname, '')]::text[], '/projets/' || r.id,
      r.status, r.priority, r.budget, r.created_at::date,
      r.status = 'archived',
      jsonb_build_object('client_name', coalesce(r.cname,''), 'project_type', coalesce(r.project_type,''), 'color', coalesce(r.color,'')),
      4.5
    );
    v_count := v_count + 1;
  END LOOP;

  -- Project Items
  FOR r IN
    SELECT pi.*, p.name AS pname, p.user_id AS p_uid, c.name AS cname
    FROM project_items pi
    JOIN projects p ON p.id = pi.project_id
    LEFT JOIN clients c ON c.id = p.client_id
    WHERE (p_user_id IS NULL OR p.user_id = p_user_id)
  LOOP
    PERFORM fn_upsert_search_doc(
      'file', r.id, r.p_uid,
      coalesce(NULLIF(r.title, ''), r.file_path, 'Fichier'),
      coalesce(r.pname, ''),
      coalesce(r.description, '') || ' ' || coalesce(r.content, ''),
      ARRAY[coalesce(r.pname, ''), coalesce(r.cname, '')]::text[],
      '/projets/' || r.project_id,
      NULL, NULL, NULL, r.created_at::date,
      false,
      jsonb_build_object('item_type', coalesce(r.item_type,'file'), 'mime_type', coalesce(r.mime_type,''), 'project_name', coalesce(r.pname,'')),
      1.5
    );
    v_count := v_count + 1;
  END LOOP;

  -- Calendar Events
  FOR r IN SELECT * FROM calendar_events WHERE (p_user_id IS NULL OR user_id = p_user_id) LOOP
    PERFORM fn_upsert_search_doc(
      'event', r.id, r.user_id, r.title,
      coalesce(r.category, ''),
      coalesce(r.notes, '') || ' ' || coalesce(r.client_name, ''),
      ARRAY[coalesce(r.client_name, '')]::text[], '/calendrier',
      NULL, r.priority, NULL, r.date,
      false,
      jsonb_build_object('category', coalesce(r.category,''), 'color', coalesce(r.color,'')),
      2.0
    );
    v_count := v_count + 1;
  END LOOP;

  -- Leads
  FOR r IN
    SELECT l.*, s.owner_id AS site_owner
    FROM leads l JOIN sites s ON s.id = l.site_id
    WHERE (p_user_id IS NULL OR s.owner_id = p_user_id)
  LOOP
    PERFORM fn_upsert_search_doc(
      'lead', r.id, r.site_owner,
      coalesce(r.name, r.email, 'Lead'),
      coalesce(r.email, ''),
      coalesce(r.message, '') || ' ' || coalesce(r.company, ''),
      ARRAY[]::text[], '/site-web/' || r.site_id || '/leads',
      coalesce(r.status, 'new'), NULL, r.amount, r.created_at::date,
      false,
      jsonb_build_object('company', coalesce(r.company,''), 'phone', coalesce(r.phone,'')),
      1.0
    );
    v_count := v_count + 1;
  END LOOP;

  -- Brief Templates
  FOR r IN SELECT * FROM brief_templates WHERE (p_user_id IS NULL OR owner_id = p_user_id) LOOP
    PERFORM fn_upsert_search_doc(
      'brief', r.id, r.owner_id, r.name,
      coalesce(r.description, ''),
      '', ARRAY[]::text[], '/briefs',
      NULL, NULL, NULL, NULL, false, '{}'::jsonb, 1.5
    );
    v_count := v_count + 1;
  END LOOP;

  -- Client Notes
  FOR r IN
    SELECT cn.*, c.name AS cname
    FROM client_notes cn LEFT JOIN clients c ON c.id = cn.client_id
    WHERE (p_user_id IS NULL OR cn.user_id = p_user_id)
  LOOP
    PERFORM fn_upsert_search_doc(
      'note', r.id, r.user_id,
      'Note — ' || coalesce(r.cname, ''),
      coalesce(r.cname, ''),
      r.content,
      ARRAY[coalesce(r.cname, '')]::text[], '/clients',
      NULL, NULL, NULL, r.created_at::date, false,
      jsonb_build_object('client_name', coalesce(r.cname,'')),
      1.0
    );
    v_count := v_count + 1;
  END LOOP;

  -- Order Files
  FOR r IN
    SELECT of2.*, o.user_id AS o_uid, coalesce(s.title, o.title) AS order_title, c.name AS cname
    FROM order_files of2
    JOIN orders o ON o.id = of2.order_id
    LEFT JOIN services s ON s.id = o.service_id
    LEFT JOIN clients c ON c.id = o.client_id
    WHERE (p_user_id IS NULL OR o.user_id = p_user_id)
  LOOP
    PERFORM fn_upsert_search_doc(
      'file', r.id, r.o_uid,
      coalesce(r.file_name, 'Fichier'),
      coalesce(r.order_title, ''),
      '',
      ARRAY[coalesce(r.order_title, ''), coalesce(r.cname, '')]::text[],
      '/commandes', NULL, NULL, NULL, r.created_at::date, false,
      jsonb_build_object('mime_type', coalesce(r.mime_type,''), 'order_title', coalesce(r.order_title,'')),
      1.0
    );
    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════
-- 7. SEARCH ANALYTICS TABLE (optional, lightweight)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.search_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  query       text NOT NULL,
  result_count int NOT NULL DEFAULT 0,
  clicked_id  uuid,
  clicked_type text,
  clicked_position int,
  duration_ms int,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_search_logs_user ON search_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_logs_query ON search_logs(query);

ALTER TABLE search_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "search_logs_select" ON search_logs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "search_logs_insert" ON search_logs FOR INSERT WITH CHECK (user_id = auth.uid());

-- ═══════════════════════════════════════════════════════════
-- 8. CLEANUP — Drop V1 view and functions if they exist
-- ═══════════════════════════════════════════════════════════

DROP VIEW IF EXISTS global_search_index CASCADE;
DROP FUNCTION IF EXISTS fn_global_search(text, uuid, int);
DROP FUNCTION IF EXISTS fn_global_search_fuzzy(text, uuid, int);
