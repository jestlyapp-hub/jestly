-- 013_hide_default_seeded_fields.sql
-- Hide the 6 columns that were auto-seeded by DEFAULT_FIELDS.
-- They stay in DB (data preserved, visible in side sheet) but won't appear in the table.
-- Idempotent: only updates rows where config.hidden is not already set.

UPDATE order_fields
SET config = jsonb_set(
  COALESCE(config, '{}'::jsonb),
  '{hidden}',
  'true'::jsonb
)
WHERE key IN (
  'deadline_custom',
  'lien_drive',
  'revisions',
  'type_paiement',
  'client_vip',
  'notes_custom'
)
AND is_system = false
AND (config IS NULL OR NOT (config ? 'hidden'));

NOTIFY pgrst, 'reload schema';
