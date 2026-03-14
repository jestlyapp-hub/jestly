-- ============================================================
-- 044 — Campaigns & Lead Intelligence
-- Multi-touch attribution, campaign tracking, lead scoring,
-- email campaigns, daily stats aggregation
-- ============================================================

BEGIN;

-- ============================================================
-- 1. campaigns
-- ============================================================

CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','active','paused','archived','completed')),
  channel TEXT NOT NULL DEFAULT 'other'
    CHECK (channel IN ('meta','tiktok','google','email','seo','organic_social','affiliate','partner','direct','outbound','other')),
  objective TEXT DEFAULT 'lead'
    CHECK (objective IN ('lead','signup','activation','paid','awareness','launch','waitlist')),
  description TEXT,
  budget_planned NUMERIC(12,2) DEFAULT 0,
  budget_spent NUMERIC(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  start_date DATE,
  end_date DATE,
  owner TEXT,
  notes TEXT,
  target_audience TEXT,
  offer_name TEXT,
  hook TEXT,
  main_cta TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns (status);
CREATE INDEX IF NOT EXISTS idx_campaigns_channel ON public.campaigns (channel);
CREATE INDEX IF NOT EXISTS idx_campaigns_slug ON public.campaigns (slug);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON public.campaigns (created_at DESC);

-- updated_at trigger for campaigns
CREATE OR REPLACE FUNCTION public.fn_campaigns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_campaigns_updated_at ON public.campaigns;
CREATE TRIGGER trg_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.fn_campaigns_updated_at();


-- ============================================================
-- 2. landing_pages
-- ============================================================

CREATE TABLE IF NOT EXISTS public.landing_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path TEXT NOT NULL,
  page_title TEXT,
  page_type TEXT DEFAULT 'other'
    CHECK (page_type IN ('landing','article','waitlist','feature','pricing','webinar','lead_magnet','checkout','other')),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  variant_key TEXT,
  is_published BOOLEAN DEFAULT true,
  first_seen_at TIMESTAMPTZ DEFAULT now(),
  last_seen_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Unique constraint on (page_path, variant_key) with COALESCE for NULL safety
CREATE UNIQUE INDEX IF NOT EXISTS idx_landing_pages_path_variant
  ON public.landing_pages (page_path, COALESCE(variant_key, '__none__'));

CREATE INDEX IF NOT EXISTS idx_landing_pages_campaign_id ON public.landing_pages (campaign_id);
CREATE INDEX IF NOT EXISTS idx_landing_pages_page_type ON public.landing_pages (page_type);
CREATE INDEX IF NOT EXISTS idx_landing_pages_created_at ON public.landing_pages (created_at DESC);

-- updated_at trigger for landing_pages
CREATE OR REPLACE FUNCTION public.fn_landing_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_landing_pages_updated_at ON public.landing_pages;
CREATE TRIGGER trg_landing_pages_updated_at
  BEFORE UPDATE ON public.landing_pages
  FOR EACH ROW EXECUTE FUNCTION public.fn_landing_pages_updated_at();


-- ============================================================
-- 3. campaign_landing_pages (junction)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.campaign_landing_pages (
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  landing_page_id UUID NOT NULL REFERENCES public.landing_pages(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'primary',
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (campaign_id, landing_page_id)
);


-- ============================================================
-- 4. lead_attribution_touches
-- ============================================================

CREATE TABLE IF NOT EXISTS public.lead_attribution_touches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  anonymous_id TEXT,
  -- Attribution data
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  referrer TEXT,
  landing_path TEXT,
  gclid TEXT,
  fbclid TEXT,
  ttclid TEXT,
  -- References
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  landing_page_id UUID REFERENCES public.landing_pages(id) ON DELETE SET NULL,
  -- Touch metadata
  touch_type TEXT DEFAULT 'pageview'
    CHECK (touch_type IN ('pageview','form_view','cta_click','form_submit','checkout_start','other')),
  touch_number INTEGER DEFAULT 1,
  device_type TEXT,
  browser TEXT,
  ip_hash TEXT,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lat_lead_id ON public.lead_attribution_touches (lead_id);
CREATE INDEX IF NOT EXISTS idx_lat_anonymous_id ON public.lead_attribution_touches (anonymous_id);
CREATE INDEX IF NOT EXISTS idx_lat_campaign_id ON public.lead_attribution_touches (campaign_id);
CREATE INDEX IF NOT EXISTS idx_lat_created_at ON public.lead_attribution_touches (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lat_session_id ON public.lead_attribution_touches (session_id);


-- ============================================================
-- 5. Alter leads table — new columns
-- ============================================================

ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS utm_content TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS utm_term TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS owner TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS anonymous_id TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS landing_page_id UUID REFERENCES public.landing_pages(id) ON DELETE SET NULL;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS first_touch_campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS last_touch_campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS first_touch_source TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS last_touch_source TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS converted_to_user_id UUID;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS converted_to_user_at TIMESTAMPTZ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS converted_to_paid_at TIMESTAMPTZ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS quality_tier TEXT DEFAULT 'unknown'
  CHECK (quality_tier IN ('unknown','low','medium','high','premium'));
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Indexes on new leads columns
CREATE INDEX IF NOT EXISTS idx_leads_campaign_id ON public.leads (campaign_id);
CREATE INDEX IF NOT EXISTS idx_leads_landing_page_id ON public.leads (landing_page_id);
CREATE INDEX IF NOT EXISTS idx_leads_quality_tier ON public.leads (quality_tier);
CREATE INDEX IF NOT EXISTS idx_leads_score ON public.leads (score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_tags ON public.leads USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_leads_converted_to_user_id ON public.leads (converted_to_user_id);
CREATE INDEX IF NOT EXISTS idx_leads_updated_at ON public.leads (updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_anonymous_id ON public.leads (anonymous_id);

-- Update status constraint to include new statuses
-- Drop old constraint if it exists, then re-add
DO $$
BEGIN
  -- Try to drop old constraint (name may vary)
  ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_status_check;
  ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS chk_leads_status;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

ALTER TABLE public.leads ADD CONSTRAINT chk_leads_status
  CHECK (status IN ('new','contacted','qualified','nurturing','converted_signup','converted_paid','lost','spam','archived'));

-- updated_at trigger for leads
CREATE OR REPLACE FUNCTION public.fn_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_leads_updated_at ON public.leads;
CREATE TRIGGER trg_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.fn_leads_updated_at();


-- ============================================================
-- 6. lead_notes
-- ============================================================

CREATE TABLE IF NOT EXISTS public.lead_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  author_email TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lead_notes_lead_id ON public.lead_notes (lead_id);

-- updated_at trigger for lead_notes
CREATE OR REPLACE FUNCTION public.fn_lead_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_lead_notes_updated_at ON public.lead_notes;
CREATE TRIGGER trg_lead_notes_updated_at
  BEFORE UPDATE ON public.lead_notes
  FOR EACH ROW EXECUTE FUNCTION public.fn_lead_notes_updated_at();


-- ============================================================
-- 7. lead_activity_log
-- ============================================================

CREATE TABLE IF NOT EXISTS public.lead_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL
    CHECK (activity_type IN (
      'created','status_change','note_added','tag_added','tag_removed',
      'score_change','email_sent','form_submitted','page_visited',
      'signup','activation','payment','owner_change','merged','campaign_attributed'
    )),
  description TEXT,
  old_value TEXT,
  new_value TEXT,
  actor_email TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lead_activity_lead_id ON public.lead_activity_log (lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_activity_type ON public.lead_activity_log (activity_type);
CREATE INDEX IF NOT EXISTS idx_lead_activity_created_at ON public.lead_activity_log (created_at DESC);


-- ============================================================
-- 8. lead_conversions
-- ============================================================

CREATE TABLE IF NOT EXISTS public.lead_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  conversion_type TEXT NOT NULL
    CHECK (conversion_type IN ('lead_created','signup_completed','activation_completed','paid_conversion','upgrade','churn')),
  -- Attribution
  first_touch_campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  last_touch_campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  first_touch_source TEXT,
  last_touch_source TEXT,
  first_touch_landing_page_id UUID REFERENCES public.landing_pages(id) ON DELETE SET NULL,
  last_touch_landing_page_id UUID REFERENCES public.landing_pages(id) ON DELETE SET NULL,
  -- Value
  revenue_cents INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  -- Context
  metadata JSONB DEFAULT '{}',
  converted_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lc_lead_id ON public.lead_conversions (lead_id);
CREATE INDEX IF NOT EXISTS idx_lc_user_id ON public.lead_conversions (user_id);
CREATE INDEX IF NOT EXISTS idx_lc_conversion_type ON public.lead_conversions (conversion_type);
CREATE INDEX IF NOT EXISTS idx_lc_first_touch_campaign ON public.lead_conversions (first_touch_campaign_id);
CREATE INDEX IF NOT EXISTS idx_lc_last_touch_campaign ON public.lead_conversions (last_touch_campaign_id);
CREATE INDEX IF NOT EXISTS idx_lc_converted_at ON public.lead_conversions (converted_at DESC);


-- ============================================================
-- 9. email_campaigns
-- ============================================================

CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  preview_text TEXT,
  sender_name TEXT DEFAULT 'Jestly',
  sender_email TEXT DEFAULT 'hello@jestly.fr',
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','scheduled','sending','sent','paused','cancelled','failed')),
  audience_type TEXT DEFAULT 'all'
    CHECK (audience_type IN ('all','segment','manual','waitlist','leads')),
  audience_filter JSONB DEFAULT '{}',
  template_key TEXT,
  html_content TEXT,
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  -- Stats
  total_recipients INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  bounced_count INTEGER DEFAULT 0,
  unsubscribed_count INTEGER DEFAULT 0,
  -- Tracking
  open_tracking_enabled BOOLEAN DEFAULT false,
  click_tracking_enabled BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_campaigns_campaign_id ON public.email_campaigns (campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON public.email_campaigns (status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_sent_at ON public.email_campaigns (sent_at DESC);

-- updated_at trigger for email_campaigns
CREATE OR REPLACE FUNCTION public.fn_email_campaigns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_email_campaigns_updated_at ON public.email_campaigns;
CREATE TRIGGER trg_email_campaigns_updated_at
  BEFORE UPDATE ON public.email_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.fn_email_campaigns_updated_at();


-- ============================================================
-- 10. email_campaign_recipients
-- ============================================================

CREATE TABLE IF NOT EXISTS public.email_campaign_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_campaign_id UUID NOT NULL REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  waitlist_id UUID REFERENCES public.waitlist(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','sent','delivered','opened','clicked','bounced','unsubscribed','failed')),
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_ecr_campaign_email
  ON public.email_campaign_recipients (email_campaign_id, recipient_email);

CREATE INDEX IF NOT EXISTS idx_ecr_lead_id ON public.email_campaign_recipients (lead_id);
CREATE INDEX IF NOT EXISTS idx_ecr_waitlist_id ON public.email_campaign_recipients (waitlist_id);
CREATE INDEX IF NOT EXISTS idx_ecr_status ON public.email_campaign_recipients (status);


-- ============================================================
-- 11. campaign_daily_stats
-- ============================================================

CREATE TABLE IF NOT EXISTS public.campaign_daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  stat_date DATE NOT NULL,
  leads_count INTEGER DEFAULT 0,
  signups_count INTEGER DEFAULT 0,
  activations_count INTEGER DEFAULT 0,
  paid_count INTEGER DEFAULT 0,
  revenue_cents INTEGER DEFAULT 0,
  spend_cents INTEGER DEFAULT 0,
  sessions_count INTEGER DEFAULT 0,
  page_views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (campaign_id, stat_date)
);


-- ============================================================
-- 12. landing_page_daily_stats
-- ============================================================

CREATE TABLE IF NOT EXISTS public.landing_page_daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landing_page_id UUID NOT NULL REFERENCES public.landing_pages(id) ON DELETE CASCADE,
  stat_date DATE NOT NULL,
  leads_count INTEGER DEFAULT 0,
  signups_count INTEGER DEFAULT 0,
  activations_count INTEGER DEFAULT 0,
  paid_count INTEGER DEFAULT 0,
  sessions_count INTEGER DEFAULT 0,
  page_views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (landing_page_id, stat_date)
);


-- ============================================================
-- RLS — Enable on all new tables, admin-only (service_role)
-- ============================================================

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_attribution_touches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_page_daily_stats ENABLE ROW LEVEL SECURITY;

-- Public INSERT policy for anonymous attribution touches (visitor tracking)
CREATE POLICY "Anyone can insert attribution touches"
  ON public.lead_attribution_touches
  FOR INSERT
  WITH CHECK (true);


-- ============================================================
-- RPC: fn_campaign_stats
-- ============================================================

CREATE OR REPLACE FUNCTION public.fn_campaign_stats(p_campaign_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_leads_count INTEGER;
  v_signups_count INTEGER;
  v_activations_count INTEGER;
  v_paid_count INTEGER;
  v_revenue_cents BIGINT;
  v_lead_to_signup NUMERIC;
  v_signup_to_paid NUMERIC;
  v_lead_to_paid NUMERIC;
BEGIN
  -- Count leads attributed to this campaign (first or last touch)
  SELECT COUNT(*) INTO v_leads_count
  FROM public.leads
  WHERE campaign_id = p_campaign_id
     OR first_touch_campaign_id = p_campaign_id
     OR last_touch_campaign_id = p_campaign_id;

  -- Count conversions by type
  SELECT
    COALESCE(SUM(CASE WHEN conversion_type = 'signup_completed' THEN 1 ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN conversion_type = 'activation_completed' THEN 1 ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN conversion_type = 'paid_conversion' THEN 1 ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN conversion_type = 'paid_conversion' THEN revenue_cents ELSE 0 END), 0)
  INTO v_signups_count, v_activations_count, v_paid_count, v_revenue_cents
  FROM public.lead_conversions
  WHERE first_touch_campaign_id = p_campaign_id
     OR last_touch_campaign_id = p_campaign_id;

  -- Conversion rates
  v_lead_to_signup := CASE WHEN v_leads_count > 0
    THEN ROUND((v_signups_count::NUMERIC / v_leads_count) * 100, 2) ELSE 0 END;
  v_signup_to_paid := CASE WHEN v_signups_count > 0
    THEN ROUND((v_paid_count::NUMERIC / v_signups_count) * 100, 2) ELSE 0 END;
  v_lead_to_paid := CASE WHEN v_leads_count > 0
    THEN ROUND((v_paid_count::NUMERIC / v_leads_count) * 100, 2) ELSE 0 END;

  RETURN jsonb_build_object(
    'campaign_id', p_campaign_id,
    'leads_count', v_leads_count,
    'signups_count', v_signups_count,
    'activations_count', v_activations_count,
    'paid_count', v_paid_count,
    'revenue_cents', v_revenue_cents,
    'lead_to_signup_pct', v_lead_to_signup,
    'signup_to_paid_pct', v_signup_to_paid,
    'lead_to_paid_pct', v_lead_to_paid
  );
END;
$$;


-- ============================================================
-- RPC: fn_growth_dashboard_stats
-- ============================================================

CREATE OR REPLACE FUNCTION public.fn_growth_dashboard_stats(
  p_start_date DATE,
  p_end_date DATE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_leads INTEGER;
  v_total_signups INTEGER;
  v_total_activations INTEGER;
  v_total_paid INTEGER;
  v_top_campaigns JSONB;
  v_top_sources JSONB;
  v_top_landing_pages JSONB;
  v_daily_breakdown JSONB;
  v_lead_to_signup NUMERIC;
  v_signup_to_paid NUMERIC;
BEGIN
  -- Total leads in period
  SELECT COUNT(*) INTO v_total_leads
  FROM public.leads
  WHERE created_at >= p_start_date AND created_at < (p_end_date + INTERVAL '1 day');

  -- Conversions in period
  SELECT
    COALESCE(SUM(CASE WHEN conversion_type = 'signup_completed' THEN 1 ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN conversion_type = 'activation_completed' THEN 1 ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN conversion_type = 'paid_conversion' THEN 1 ELSE 0 END), 0)
  INTO v_total_signups, v_total_activations, v_total_paid
  FROM public.lead_conversions
  WHERE converted_at >= p_start_date AND converted_at < (p_end_date + INTERVAL '1 day');

  -- Conversion rates
  v_lead_to_signup := CASE WHEN v_total_leads > 0
    THEN ROUND((v_total_signups::NUMERIC / v_total_leads) * 100, 2) ELSE 0 END;
  v_signup_to_paid := CASE WHEN v_total_signups > 0
    THEN ROUND((v_total_paid::NUMERIC / v_total_signups) * 100, 2) ELSE 0 END;

  -- Top campaigns (by lead count)
  SELECT COALESCE(jsonb_agg(row_to_json(t)::jsonb), '[]'::jsonb) INTO v_top_campaigns
  FROM (
    SELECT c.id, c.name, c.channel, COUNT(l.id) AS leads_count
    FROM public.campaigns c
    LEFT JOIN public.leads l ON (l.campaign_id = c.id OR l.first_touch_campaign_id = c.id)
      AND l.created_at >= p_start_date AND l.created_at < (p_end_date + INTERVAL '1 day')
    GROUP BY c.id, c.name, c.channel
    ORDER BY leads_count DESC
    LIMIT 10
  ) t;

  -- Top sources
  SELECT COALESCE(jsonb_agg(row_to_json(t)::jsonb), '[]'::jsonb) INTO v_top_sources
  FROM (
    SELECT COALESCE(utm_source, source, 'direct') AS source_name, COUNT(*) AS leads_count
    FROM public.leads
    WHERE created_at >= p_start_date AND created_at < (p_end_date + INTERVAL '1 day')
    GROUP BY source_name
    ORDER BY leads_count DESC
    LIMIT 10
  ) t;

  -- Top landing pages
  SELECT COALESCE(jsonb_agg(row_to_json(t)::jsonb), '[]'::jsonb) INTO v_top_landing_pages
  FROM (
    SELECT lp.id, lp.page_path, lp.page_title, COUNT(l.id) AS leads_count
    FROM public.landing_pages lp
    LEFT JOIN public.leads l ON l.landing_page_id = lp.id
      AND l.created_at >= p_start_date AND l.created_at < (p_end_date + INTERVAL '1 day')
    GROUP BY lp.id, lp.page_path, lp.page_title
    ORDER BY leads_count DESC
    LIMIT 10
  ) t;

  -- Daily breakdown
  SELECT COALESCE(jsonb_agg(row_to_json(t)::jsonb ORDER BY t.day), '[]'::jsonb) INTO v_daily_breakdown
  FROM (
    SELECT
      d.day::DATE AS day,
      COALESCE(l_cnt.cnt, 0) AS leads,
      COALESCE(s_cnt.cnt, 0) AS signups,
      COALESCE(p_cnt.cnt, 0) AS paid
    FROM generate_series(p_start_date, p_end_date, '1 day'::INTERVAL) AS d(day)
    LEFT JOIN (
      SELECT created_at::DATE AS day, COUNT(*) AS cnt
      FROM public.leads
      WHERE created_at >= p_start_date AND created_at < (p_end_date + INTERVAL '1 day')
      GROUP BY created_at::DATE
    ) l_cnt ON l_cnt.day = d.day::DATE
    LEFT JOIN (
      SELECT converted_at::DATE AS day, COUNT(*) AS cnt
      FROM public.lead_conversions
      WHERE conversion_type = 'signup_completed'
        AND converted_at >= p_start_date AND converted_at < (p_end_date + INTERVAL '1 day')
      GROUP BY converted_at::DATE
    ) s_cnt ON s_cnt.day = d.day::DATE
    LEFT JOIN (
      SELECT converted_at::DATE AS day, COUNT(*) AS cnt
      FROM public.lead_conversions
      WHERE conversion_type = 'paid_conversion'
        AND converted_at >= p_start_date AND converted_at < (p_end_date + INTERVAL '1 day')
      GROUP BY converted_at::DATE
    ) p_cnt ON p_cnt.day = d.day::DATE
  ) t;

  RETURN jsonb_build_object(
    'period', jsonb_build_object('start', p_start_date, 'end', p_end_date),
    'totals', jsonb_build_object(
      'leads', v_total_leads,
      'signups', v_total_signups,
      'activations', v_total_activations,
      'paid', v_total_paid
    ),
    'conversion_rates', jsonb_build_object(
      'lead_to_signup_pct', v_lead_to_signup,
      'signup_to_paid_pct', v_signup_to_paid
    ),
    'top_campaigns', v_top_campaigns,
    'top_sources', v_top_sources,
    'top_landing_pages', v_top_landing_pages,
    'daily_breakdown', v_daily_breakdown
  );
END;
$$;


-- ============================================================
-- RPC: fn_compute_lead_score
-- ============================================================

CREATE OR REPLACE FUNCTION public.fn_compute_lead_score(p_lead_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_lead RECORD;
  v_score INTEGER := 0;
  v_notes_count INTEGER;
  v_email_domain TEXT;
  v_disposable_domains TEXT[] := ARRAY[
    'guerrillamail.com','tempmail.com','throwaway.email','mailinator.com',
    'yopmail.com','trashmail.com','sharklasers.com','guerrillamail.info',
    'grr.la','dispostable.com','maildrop.cc','temp-mail.org','fakeinbox.com',
    'getnada.com','10minutemail.com','mohmal.com','burnermail.io',
    'tempail.com','emailondeck.com','mintemail.com'
  ];
BEGIN
  SELECT * INTO v_lead FROM public.leads WHERE id = p_lead_id;
  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  -- +10 if has company
  IF v_lead.company IS NOT NULL AND v_lead.company <> '' THEN
    v_score := v_score + 10;
  END IF;

  -- +5 if has phone
  IF v_lead.phone IS NOT NULL AND v_lead.phone <> '' THEN
    v_score := v_score + 5;
  END IF;

  -- +10 if utm_source present (paid traffic indicator)
  IF v_lead.utm_source IS NOT NULL AND v_lead.utm_source <> '' THEN
    v_score := v_score + 10;
  END IF;

  -- +5 if referrer present
  IF v_lead.referrer IS NOT NULL AND v_lead.referrer <> '' THEN
    v_score := v_score + 5;
  END IF;

  -- Source-based scoring
  IF v_lead.source = 'checkout' THEN
    v_score := v_score + 15;
  ELSIF v_lead.source = 'contact-form' THEN
    v_score := v_score + 10;
  ELSIF v_lead.source = 'newsletter' THEN
    v_score := v_score + 5;
  END IF;

  -- -10 if disposable email domain (not gmail/yahoo/hotmail)
  IF v_lead.email IS NOT NULL THEN
    v_email_domain := LOWER(split_part(v_lead.email, '@', 2));
    IF v_email_domain = ANY(v_disposable_domains) THEN
      v_score := v_score - 10;
    END IF;
  END IF;

  -- +20 if converted to signup
  IF v_lead.converted_to_user_id IS NOT NULL THEN
    v_score := v_score + 20;
  END IF;

  -- +30 if converted to paid
  IF v_lead.converted_to_paid_at IS NOT NULL THEN
    v_score := v_score + 30;
  END IF;

  -- +5 per note (capped to avoid runaway)
  SELECT COUNT(*) INTO v_notes_count FROM public.lead_notes WHERE lead_id = p_lead_id;
  v_score := v_score + LEAST(v_notes_count * 5, 25);

  -- +5 if has message
  IF v_lead.message IS NOT NULL AND v_lead.message <> '' THEN
    v_score := v_score + 5;
  END IF;

  -- Clamp score to 0-100
  v_score := GREATEST(0, LEAST(v_score, 100));

  -- Update the lead
  UPDATE public.leads SET score = v_score WHERE id = p_lead_id;

  RETURN v_score;
END;
$$;


-- ============================================================
-- RPC: fn_match_leads_to_users
-- ============================================================

CREATE OR REPLACE FUNCTION public.fn_match_leads_to_users()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_matched INTEGER := 0;
  v_lead RECORD;
  v_profile RECORD;
BEGIN
  FOR v_lead IN
    SELECT l.id, l.email, l.first_touch_campaign_id, l.last_touch_campaign_id,
           l.first_touch_source, l.last_touch_source
    FROM public.leads l
    WHERE l.converted_to_user_id IS NULL
      AND l.email IS NOT NULL
      AND l.email <> ''
  LOOP
    SELECT p.id, p.created_at INTO v_profile
    FROM public.profiles p
    WHERE LOWER(p.email) = LOWER(v_lead.email)
    LIMIT 1;

    IF FOUND THEN
      -- Update lead
      UPDATE public.leads
      SET converted_to_user_id = v_profile.id,
          converted_to_user_at = v_profile.created_at
      WHERE id = v_lead.id;

      -- Create conversion record
      INSERT INTO public.lead_conversions (
        lead_id, user_id, conversion_type,
        first_touch_campaign_id, last_touch_campaign_id,
        first_touch_source, last_touch_source,
        converted_at
      ) VALUES (
        v_lead.id, v_profile.id, 'signup_completed',
        v_lead.first_touch_campaign_id, v_lead.last_touch_campaign_id,
        v_lead.first_touch_source, v_lead.last_touch_source,
        v_profile.created_at
      );

      v_matched := v_matched + 1;
    END IF;
  END LOOP;

  RETURN v_matched;
END;
$$;


-- ============================================================
-- RPC: fn_recompute_campaign_daily_stats
-- ============================================================

CREATE OR REPLACE FUNCTION public.fn_recompute_campaign_daily_stats(
  p_campaign_id UUID,
  p_date DATE
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_leads INTEGER;
  v_signups INTEGER;
  v_activations INTEGER;
  v_paid INTEGER;
  v_revenue INTEGER;
  v_sessions INTEGER;
  v_pageviews INTEGER;
  v_day_start TIMESTAMPTZ;
  v_day_end TIMESTAMPTZ;
BEGIN
  v_day_start := p_date::TIMESTAMPTZ;
  v_day_end := (p_date + INTERVAL '1 day')::TIMESTAMPTZ;

  -- Leads created that day attributed to this campaign
  SELECT COUNT(*) INTO v_leads
  FROM public.leads
  WHERE (campaign_id = p_campaign_id
      OR first_touch_campaign_id = p_campaign_id
      OR last_touch_campaign_id = p_campaign_id)
    AND created_at >= v_day_start AND created_at < v_day_end;

  -- Conversions that day
  SELECT
    COALESCE(SUM(CASE WHEN conversion_type = 'signup_completed' THEN 1 ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN conversion_type = 'activation_completed' THEN 1 ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN conversion_type = 'paid_conversion' THEN 1 ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN conversion_type = 'paid_conversion' THEN revenue_cents ELSE 0 END), 0)
  INTO v_signups, v_activations, v_paid, v_revenue
  FROM public.lead_conversions
  WHERE (first_touch_campaign_id = p_campaign_id OR last_touch_campaign_id = p_campaign_id)
    AND converted_at >= v_day_start AND converted_at < v_day_end;

  -- Sessions and pageviews from attribution touches
  SELECT
    COUNT(DISTINCT session_id),
    COUNT(*)
  INTO v_sessions, v_pageviews
  FROM public.lead_attribution_touches
  WHERE campaign_id = p_campaign_id
    AND created_at >= v_day_start AND created_at < v_day_end;

  -- Upsert
  INSERT INTO public.campaign_daily_stats (
    campaign_id, stat_date,
    leads_count, signups_count, activations_count, paid_count,
    revenue_cents, sessions_count, page_views_count,
    updated_at
  ) VALUES (
    p_campaign_id, p_date,
    v_leads, v_signups, v_activations, v_paid,
    v_revenue, v_sessions, v_pageviews,
    now()
  )
  ON CONFLICT (campaign_id, stat_date)
  DO UPDATE SET
    leads_count = EXCLUDED.leads_count,
    signups_count = EXCLUDED.signups_count,
    activations_count = EXCLUDED.activations_count,
    paid_count = EXCLUDED.paid_count,
    revenue_cents = EXCLUDED.revenue_cents,
    sessions_count = EXCLUDED.sessions_count,
    page_views_count = EXCLUDED.page_views_count,
    updated_at = now();
END;
$$;


COMMIT;
