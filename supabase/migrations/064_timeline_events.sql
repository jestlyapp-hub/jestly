-- ============================================================
-- 064 — Timeline unifiée : table timeline_events
-- ============================================================

CREATE TABLE IF NOT EXISTS public.timeline_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type    TEXT NOT NULL,
  entity_type   TEXT,
  entity_id     UUID,
  title         TEXT NOT NULL,
  description   TEXT,
  metadata      JSONB DEFAULT '{}',
  icon          TEXT,
  color         TEXT,
  is_important  BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now(),
  created_by    UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- ── Indexes pour performance (<300ms) ───────────────────────

-- Index principal : user + date desc (requête par défaut)
CREATE INDEX idx_timeline_user_date
  ON public.timeline_events (user_id, created_at DESC);

-- Index pour filtrage par type
CREATE INDEX idx_timeline_user_type_date
  ON public.timeline_events (user_id, event_type, created_at DESC);

-- Index pour filtrage par entité
CREATE INDEX idx_timeline_entity
  ON public.timeline_events (user_id, entity_type, entity_id);

-- Index pour recherche texte (ILIKE)
CREATE INDEX idx_timeline_title_trgm
  ON public.timeline_events USING gin (title gin_trgm_ops);

-- Index pour événements importants
CREATE INDEX idx_timeline_important
  ON public.timeline_events (user_id, is_important, created_at DESC)
  WHERE is_important = true;

-- ── RLS ─────────────────────────────────────────────────────

ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own timeline events"
  ON public.timeline_events FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own timeline events"
  ON public.timeline_events FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own timeline events"
  ON public.timeline_events FOR DELETE
  USING (user_id = auth.uid());

-- ── Triggers d'insertion automatique ────────────────────────

-- Fonction générique d'insertion timeline
CREATE OR REPLACE FUNCTION fn_timeline_insert(
  p_user_id UUID,
  p_event_type TEXT,
  p_entity_type TEXT,
  p_entity_id UUID,
  p_title TEXT,
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}',
  p_icon TEXT DEFAULT NULL,
  p_color TEXT DEFAULT NULL,
  p_is_important BOOLEAN DEFAULT false
) RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.timeline_events (
    user_id, event_type, entity_type, entity_id,
    title, description, metadata, icon, color, is_important, created_by
  ) VALUES (
    p_user_id, p_event_type, p_entity_type, p_entity_id,
    p_title, p_description, p_metadata, p_icon, p_color, p_is_important, p_user_id
  ) RETURNING id INTO v_id;
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── Trigger : orders ────────────────────────────────────────

CREATE OR REPLACE FUNCTION fn_timeline_on_order() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM fn_timeline_insert(
      NEW.user_id,
      'ORDER_CREATED',
      'order',
      NEW.id,
      'Nouvelle commande créée',
      NEW.title,
      jsonb_build_object(
        'order_title', NEW.title,
        'amount', NEW.amount,
        'client_name', COALESCE(NEW.client_name, '')
      ),
      'shopping-bag',
      'indigo',
      false
    );
  ELSIF TG_OP = 'UPDATE' THEN
    -- Commande livrée
    IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
      PERFORM fn_timeline_insert(
        NEW.user_id,
        'ORDER_DELIVERED',
        'order',
        NEW.id,
        'Commande livrée',
        NEW.title,
        jsonb_build_object(
          'order_title', NEW.title,
          'amount', NEW.amount,
          'client_name', COALESCE(NEW.client_name, '')
        ),
        'package-check',
        'emerald',
        true
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_timeline_orders
  AFTER INSERT OR UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION fn_timeline_on_order();

-- ── Trigger : clients ───────────────────────────────────────

CREATE OR REPLACE FUNCTION fn_timeline_on_client() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM fn_timeline_insert(
      NEW.user_id,
      'CLIENT_CREATED',
      'client',
      NEW.id,
      'Nouveau client',
      NEW.name,
      jsonb_build_object(
        'client_name', NEW.name,
        'email', COALESCE(NEW.email, '')
      ),
      'user-plus',
      'blue',
      false
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_timeline_clients
  AFTER INSERT ON public.clients
  FOR EACH ROW EXECUTE FUNCTION fn_timeline_on_client();

-- ── Trigger : invoices ──────────────────────────────────────

CREATE OR REPLACE FUNCTION fn_timeline_on_invoice() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM fn_timeline_insert(
      NEW.user_id,
      'INVOICE_CREATED',
      'invoice',
      NEW.id,
      'Facture créée',
      COALESCE(NEW.invoice_number, ''),
      jsonb_build_object(
        'amount', NEW.total_amount,
        'currency', COALESCE(NEW.currency, 'EUR'),
        'client_name', COALESCE(NEW.client_name, '')
      ),
      'file-text',
      'amber',
      false
    );
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
      PERFORM fn_timeline_insert(
        NEW.user_id,
        'INVOICE_PAID',
        'invoice',
        NEW.id,
        'Facture payée',
        COALESCE(NEW.invoice_number, ''),
        jsonb_build_object(
          'amount', NEW.total_amount,
          'currency', COALESCE(NEW.currency, 'EUR'),
          'client_name', COALESCE(NEW.client_name, '')
        ),
        'circle-check',
        'emerald',
        true
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_timeline_invoices
  AFTER INSERT OR UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION fn_timeline_on_invoice();

-- ── Trigger : projects ──────────────────────────────────────

CREATE OR REPLACE FUNCTION fn_timeline_on_project() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM fn_timeline_insert(
      NEW.user_id,
      'PROJECT_CREATED',
      'project',
      NEW.id,
      'Nouveau projet',
      NEW.name,
      jsonb_build_object('project_name', NEW.name),
      'palette',
      'violet',
      false
    );
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
      PERFORM fn_timeline_insert(
        NEW.user_id,
        'PROJECT_COMPLETED',
        'project',
        NEW.id,
        'Projet terminé',
        NEW.name,
        jsonb_build_object('project_name', NEW.name),
        'check-circle',
        'emerald',
        true
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_timeline_projects
  AFTER INSERT OR UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION fn_timeline_on_project();

-- ── Trigger : tasks ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION fn_timeline_on_task() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM fn_timeline_insert(
      NEW.user_id,
      'TASK_CREATED',
      'task',
      NEW.id,
      'Nouvelle tâche',
      NEW.title,
      jsonb_build_object('task_title', NEW.title),
      'check-square',
      'slate',
      false
    );
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status = 'done' AND OLD.status != 'done' THEN
      PERFORM fn_timeline_insert(
        NEW.user_id,
        'TASK_COMPLETED',
        'task',
        NEW.id,
        'Tâche terminée',
        NEW.title,
        jsonb_build_object('task_title', NEW.title),
        'circle-check',
        'emerald',
        false
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_timeline_tasks
  AFTER INSERT OR UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION fn_timeline_on_task();
