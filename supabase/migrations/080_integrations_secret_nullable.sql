-- 080_integrations_secret_nullable.sql
-- secret_encrypted n'est requis que pour le modèle client_credentials (Shopify).
-- Les intégrations OAuth (Pinterest, Google Ads, Klaviyo) utilisent les colonnes
-- oauth_*_encrypted et laissent secret_encrypted NULL → on retire NOT NULL.
--
-- Idempotente : check du is_nullable avant de tenter l'ALTER. Safe à rejouer.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'integrations'
      AND column_name = 'secret_encrypted'
      AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.integrations ALTER COLUMN secret_encrypted DROP NOT NULL;
  END IF;
END $$;
