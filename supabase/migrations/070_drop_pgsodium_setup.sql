-- 070_drop_pgsodium_setup.sql
-- pgsodium est déprécié par Supabase (remplacé par Vault).
-- On abandonne complètement : chiffrement applicatif AES-256-GCM côté Node (lib/encryption.ts).
-- Cette migration nettoie tout résidu éventuel.

DROP EXTENSION IF EXISTS pgsodium CASCADE;
