-- 087_v3_stores.sql
-- V3 multi-stores : un utilisateur peut gérer N boutiques.
-- Migration ADDITIVE et IDEMPOTENTE : ne casse pas le V2 mono-store.
-- L'ajout de store_id sur integrations est NULLABLE + backfill, jamais NOT NULL,
-- afin que le code V2 existant continue de fonctionner pendant la transition.

CREATE TABLE IF NOT EXISTS public.stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  shopify_domain TEXT,
  shopify_currency TEXT,
  shopify_country TEXT,
  shopify_timezone TEXT,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stores_user ON public.stores(user_id);
-- Au plus une boutique par défaut par utilisateur.
CREATE UNIQUE INDEX IF NOT EXISTS uq_stores_user_default
  ON public.stores(user_id) WHERE is_default = TRUE;

DROP TRIGGER IF EXISTS trg_stores_updated_at ON public.stores;
CREATE TRIGGER trg_stores_updated_at
  BEFORE UPDATE ON public.stores
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "stores_owner_all" ON public.stores;
CREATE POLICY "stores_owner_all" ON public.stores
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Lien integrations -> stores (nullable pour compat V2).
ALTER TABLE public.integrations ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_integrations_store ON public.integrations(store_id);

-- Backfill : crée une boutique "Boutique principale" par utilisateur ayant des
-- integrations, puis rattache ses integrations sans store_id.
INSERT INTO public.stores (user_id, name, shopify_domain, is_default)
SELECT DISTINCT ON (i.user_id)
  i.user_id, 'Boutique principale', i.shop_domain, TRUE
FROM public.integrations i
WHERE NOT EXISTS (SELECT 1 FROM public.stores s WHERE s.user_id = i.user_id)
ORDER BY i.user_id, i.created_at;

UPDATE public.integrations i
SET store_id = s.id
FROM public.stores s
WHERE i.store_id IS NULL AND s.user_id = i.user_id AND s.is_default = TRUE;
