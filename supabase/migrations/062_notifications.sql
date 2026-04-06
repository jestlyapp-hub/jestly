-- ══════════════════════════════════════════════════════════════════════
-- 062 — Notifications system
-- Table notifications + indexes + RLS
-- ══════════════════════════════════════════════════════════════════════

-- ── Table principale ──
CREATE TABLE IF NOT EXISTS notifications (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type          text        NOT NULL,          -- ex: order_new, task_due, invoice_suggestion…
  category      text        NOT NULL,          -- ex: orders, billing, tasks, calendar…
  title         text        NOT NULL,
  message       text        NOT NULL DEFAULT '',
  cta_label     text,
  cta_href      text,
  entity_type   text,                          -- ex: order, task, event, invoice…
  entity_id     uuid,
  severity      text        NOT NULL DEFAULT 'info',  -- info | success | warning | error
  is_read       boolean     NOT NULL DEFAULT false,
  is_archived   boolean     NOT NULL DEFAULT false,
  metadata      jsonb       NOT NULL DEFAULT '{}',
  triggered_by  text,                          -- system | cron | user | webhook
  idempotency_key text,                        -- clé unique pour éviter doublons
  read_at       timestamptz,
  archived_at   timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ── Indexes optimisés ──
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications (user_id, is_read, created_at DESC)
  WHERE is_archived = false;

CREATE INDEX IF NOT EXISTS idx_notifications_user_category
  ON notifications (user_id, category, created_at DESC)
  WHERE is_archived = false;

CREATE INDEX IF NOT EXISTS idx_notifications_user_archived
  ON notifications (user_id, is_archived, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_notifications_idempotency
  ON notifications (user_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

-- ── RLS ──
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Lecture : uniquement ses propres notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Mise à jour : uniquement ses propres notifications (mark read, archive)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Insertion : service_role uniquement (les notifications sont créées côté serveur)
-- Pas de policy INSERT pour anon/authenticated → seul service_role peut insérer

-- Suppression : pas permise côté client (archive uniquement)

-- ── Realtime ──
-- Activer la publication pour realtime sur INSERT
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ── Commentaires ──
COMMENT ON TABLE notifications IS 'Notifications in-app pour les utilisateurs Jestly';
COMMENT ON COLUMN notifications.type IS 'Type de notification (order_new, task_due, etc.)';
COMMENT ON COLUMN notifications.category IS 'Catégorie pour filtrage UI (orders, billing, tasks, etc.)';
COMMENT ON COLUMN notifications.severity IS 'Niveau de sévérité (info, success, warning, error)';
COMMENT ON COLUMN notifications.idempotency_key IS 'Clé unique par user pour éviter les doublons (ex: task_due:{taskId}:2026-04-05)';
COMMENT ON COLUMN notifications.triggered_by IS 'Source du déclenchement (system, cron, user, webhook)';
