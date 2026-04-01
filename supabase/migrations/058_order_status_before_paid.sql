-- ═══════════════════════════════════════════════════════════
-- 058 — Mémorisation du statut avant passage en "payé"
--
-- Quand le toggle Payé est activé, on sauvegarde le statut
-- courant pour pouvoir le restaurer si on décoche.
-- ═══════════════════════════════════════════════════════════

ALTER TABLE orders ADD COLUMN IF NOT EXISTS status_before_paid VARCHAR DEFAULT NULL;
