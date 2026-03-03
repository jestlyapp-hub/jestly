-- Index unique : un seul client par email par utilisateur
CREATE UNIQUE INDEX IF NOT EXISTS idx_clients_user_email
  ON public.clients (user_id, LOWER(email));

-- Nouveaux champs
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'fr',
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Europe/Paris',
  ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}';
