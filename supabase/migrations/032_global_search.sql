-- ══════════════════════════════════════════════════════════
-- 032 — Global Search Engine (Full-Text Search)
-- Unified search across all entities via PostgreSQL tsvector
-- ══════════════════════════════════════════════════════════

-- ─── View: global_search_index ───
-- Aggregates all searchable entities into a single queryable view.
-- Uses 'simple' config for accent-insensitive French search.

CREATE OR REPLACE VIEW public.global_search_index AS

-- Clients
SELECT
  id,
  user_id,
  'client'::text AS entity_type,
  name AS title,
  coalesce(email, '') AS subtitle,
  coalesce(company, '') AS extra,
  status,
  NULL::bigint AS amount_cents,
  NULL::date AS item_date,
  '/clients' AS href,
  (
    setweight(to_tsvector('simple', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(email, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(company, '')), 'C') ||
    setweight(to_tsvector('simple', coalesce(phone, '')), 'C') ||
    setweight(to_tsvector('simple', coalesce(notes, '')), 'D')
  ) AS search_vector
FROM clients

UNION ALL

-- Orders (with joined client name + service title)
SELECT
  o.id,
  o.user_id,
  'order'::text AS entity_type,
  coalesce(s.title, 'Commande') AS title,
  coalesce(c.name, '') AS subtitle,
  '' AS extra,
  o.status,
  o.total_cents AS amount_cents,
  o.created_at::date AS item_date,
  '/commandes' AS href,
  (
    setweight(to_tsvector('simple', coalesce(s.title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(c.name, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(o.id::text, '')), 'C')
  ) AS search_vector
FROM orders o
LEFT JOIN services s ON s.id = o.service_id
LEFT JOIN clients c ON c.id = o.client_id

UNION ALL

-- Products / Services
SELECT
  id,
  user_id,
  'product'::text AS entity_type,
  title,
  coalesce(category, '') AS subtitle,
  coalesce(short_description, '') AS extra,
  status,
  price_cents AS amount_cents,
  created_at::date AS item_date,
  '/produits' AS href,
  (
    setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(short_description, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(long_description, '')), 'C') ||
    setweight(to_tsvector('simple', coalesce(category, '')), 'B')
  ) AS search_vector
FROM services

UNION ALL

-- Tasks
SELECT
  id,
  user_id,
  'task'::text AS entity_type,
  title,
  coalesce(client_name, '') AS subtitle,
  coalesce(description, '') AS extra,
  status,
  NULL AS amount_cents,
  due_date AS item_date,
  '/taches/' || id AS href,
  (
    setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(client_name, '')), 'B')
  ) AS search_vector
FROM tasks

UNION ALL

-- Calendar Events
SELECT
  id,
  user_id,
  'event'::text AS entity_type,
  title,
  coalesce(category, '') AS subtitle,
  coalesce(description, '') AS extra,
  NULL AS status,
  NULL AS amount_cents,
  date AS item_date,
  '/calendrier' AS href,
  (
    setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(category, '')), 'B')
  ) AS search_vector
FROM calendar_events

UNION ALL

-- Invoices
SELECT
  id,
  user_id,
  'invoice'::text AS entity_type,
  coalesce(invoice_number, 'Facture') AS title,
  coalesce(client_name, '') AS subtitle,
  '' AS extra,
  status,
  total AS amount_cents,
  due_date AS item_date,
  '/facturation' AS href,
  (
    setweight(to_tsvector('simple', coalesce(invoice_number, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(client_name, '')), 'A')
  ) AS search_vector
FROM invoices

UNION ALL

-- Projects
SELECT
  p.id,
  p.user_id,
  'project'::text AS entity_type,
  p.name AS title,
  coalesce(c.name, '') AS subtitle,
  coalesce(p.description, '') AS extra,
  p.status,
  p.budget AS amount_cents,
  p.created_at::date AS item_date,
  '/projets/' || p.id AS href,
  (
    setweight(to_tsvector('simple', coalesce(p.name, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(p.description, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(c.name, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(array_to_string(p.tags, ' '), '')), 'C')
  ) AS search_vector
FROM projects p
LEFT JOIN clients c ON c.id = p.client_id

UNION ALL

-- Project Items (files, images, links, notes)
SELECT
  pi.id,
  p.user_id,
  'file'::text AS entity_type,
  coalesce(pi.title, pi.file_path) AS title,
  coalesce(p.name, '') AS subtitle,
  coalesce(pi.item_type, '') AS extra,
  NULL AS status,
  NULL AS amount_cents,
  pi.created_at::date AS item_date,
  '/projets/' || pi.project_id AS href,
  (
    setweight(to_tsvector('simple', coalesce(pi.title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(pi.file_path, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(p.name, '')), 'C')
  ) AS search_vector
FROM project_items pi
JOIN projects p ON p.id = pi.project_id

UNION ALL

-- Leads
SELECT
  l.id,
  s.user_id,
  'lead'::text AS entity_type,
  coalesce(l.name, l.email) AS title,
  coalesce(l.email, '') AS subtitle,
  coalesce(l.message, '') AS extra,
  coalesce(l.status, 'new') AS status,
  l.amount AS amount_cents,
  l.created_at::date AS item_date,
  '/site-web/' || l.site_id || '/leads' AS href,
  (
    setweight(to_tsvector('simple', coalesce(l.name, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(l.email, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(l.company, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(l.message, '')), 'C')
  ) AS search_vector
FROM leads l
JOIN sites s ON s.id = l.site_id;

-- ─── RPC: fn_global_search ───
-- Single function for the API to call. Returns ranked results.

CREATE OR REPLACE FUNCTION fn_global_search(
  search_query text,
  user_uuid uuid,
  max_results int DEFAULT 25
)
RETURNS TABLE(
  id uuid,
  entity_type text,
  title text,
  subtitle text,
  extra text,
  status text,
  amount_cents bigint,
  item_date date,
  href text,
  rank real
)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT
    g.id,
    g.entity_type,
    g.title,
    g.subtitle,
    g.extra,
    g.status,
    g.amount_cents,
    g.item_date,
    g.href,
    ts_rank(g.search_vector, query) AS rank
  FROM global_search_index g,
       plainto_tsquery('simple', search_query) query
  WHERE g.user_id = user_uuid
    AND g.search_vector @@ query
  ORDER BY ts_rank(g.search_vector, query) DESC
  LIMIT max_results;
$$;

-- ─── RPC: fn_global_search_fuzzy ───
-- Fallback: ILIKE search when full-text returns nothing (typos, partial words)

CREATE OR REPLACE FUNCTION fn_global_search_fuzzy(
  search_query text,
  user_uuid uuid,
  max_results int DEFAULT 25
)
RETURNS TABLE(
  id uuid,
  entity_type text,
  title text,
  subtitle text,
  extra text,
  status text,
  amount_cents bigint,
  item_date date,
  href text,
  rank real
)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT
    g.id,
    g.entity_type,
    g.title,
    g.subtitle,
    g.extra,
    g.status,
    g.amount_cents,
    g.item_date,
    g.href,
    CASE
      WHEN lower(g.title) = lower(search_query) THEN 1.0
      WHEN lower(g.title) LIKE lower(search_query) || '%' THEN 0.8
      WHEN lower(g.title) LIKE '%' || lower(search_query) || '%' THEN 0.5
      WHEN lower(g.subtitle) LIKE '%' || lower(search_query) || '%' THEN 0.3
      ELSE 0.1
    END::real AS rank
  FROM global_search_index g
  WHERE g.user_id = user_uuid
    AND (
      g.title ILIKE '%' || search_query || '%'
      OR g.subtitle ILIKE '%' || search_query || '%'
      OR g.extra ILIKE '%' || search_query || '%'
    )
  ORDER BY rank DESC
  LIMIT max_results;
$$;
