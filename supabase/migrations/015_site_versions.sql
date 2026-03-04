-- ============================================================
-- Jestly — Site versions (publish snapshots) + published_at
-- ============================================================

-- Track published_at on sites
ALTER TABLE public.sites
  ADD COLUMN IF NOT EXISTS published_at timestamptz;

-- Site versions: full site snapshot per publish
CREATE TABLE IF NOT EXISTS public.site_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  version int NOT NULL DEFAULT 1,
  snapshot jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(site_id, version)
);

ALTER TABLE public.site_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_manage_versions" ON public.site_versions
  FOR ALL USING (
    site_id IN (SELECT id FROM public.sites WHERE owner_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_site_versions_site
  ON public.site_versions(site_id, version DESC);
