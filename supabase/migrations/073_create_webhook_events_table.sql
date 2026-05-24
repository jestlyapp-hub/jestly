-- 073_create_webhook_events_table.sql
-- Log de tous les webhooks Shopify reçus (audit + replay + debug).

CREATE TABLE IF NOT EXISTS public.shopify_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id uuid NOT NULL REFERENCES public.integrations(id) ON DELETE CASCADE,
  topic text NOT NULL,
  shopify_id text,
  payload jsonb NOT NULL,
  signature_valid boolean NOT NULL,
  processed_at timestamptz,
  error text,
  received_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_topic_received ON public.shopify_webhook_events(topic, received_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_events_unprocessed ON public.shopify_webhook_events(received_at) WHERE processed_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_webhook_events_integration ON public.shopify_webhook_events(integration_id, received_at DESC);
