-- ═══════════════════════════════════════════════════════════
-- 057 — Pièces jointes photos sur les tâches
--
-- Ajoute une colonne JSONB `attachments` à la table tasks
-- pour stocker les métadonnées des images jointes.
-- Les sous-tâches stockent déjà leurs attachments dans le
-- JSONB `subtasks` automatiquement.
-- ═══════════════════════════════════════════════════════════

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN tasks.attachments IS 'Photos/pièces jointes de la tâche [{id, url, fileName, mimeType, size, storagePath, createdAt}]';
