-- ============================================================
-- Migration 045: Fix admin FK cascades
-- Without these fixes, deleting a user from auth.users is
-- blocked if any admin audit logs, notes, or flags exist.
-- ============================================================

-- admin_audit_logs.actor_id → CASCADE (logs follow user deletion)
ALTER TABLE admin_audit_logs DROP CONSTRAINT IF EXISTS admin_audit_logs_actor_id_fkey;
ALTER TABLE admin_audit_logs ADD CONSTRAINT admin_audit_logs_actor_id_fkey
  FOREIGN KEY (actor_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- admin_account_notes.account_id → CASCADE, author_id → SET NULL
ALTER TABLE admin_account_notes DROP CONSTRAINT IF EXISTS admin_account_notes_account_id_fkey;
ALTER TABLE admin_account_notes ADD CONSTRAINT admin_account_notes_account_id_fkey
  FOREIGN KEY (account_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE admin_account_notes DROP CONSTRAINT IF EXISTS admin_account_notes_author_id_fkey;
ALTER TABLE admin_account_notes ADD CONSTRAINT admin_account_notes_author_id_fkey
  FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- admin_account_flags.account_id → CASCADE, created_by → SET NULL
ALTER TABLE admin_account_flags DROP CONSTRAINT IF EXISTS admin_account_flags_account_id_fkey;
ALTER TABLE admin_account_flags ADD CONSTRAINT admin_account_flags_account_id_fkey
  FOREIGN KEY (account_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE admin_account_flags DROP CONSTRAINT IF EXISTS admin_account_flags_created_by_fkey;
ALTER TABLE admin_account_flags ADD CONSTRAINT admin_account_flags_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

NOTIFY pgrst, 'reload schema';
