-- 070_enable_pgsodium.sql
-- Active pgsodium pour le chiffrement at-rest des access tokens (Shopify, etc.)
-- Note : pgsodium est disponible sur Supabase à partir du tier gratuit (extension).

CREATE EXTENSION IF NOT EXISTS pgsodium WITH SCHEMA pgsodium;

-- Helper pour récupérer la clé de chiffrement principale.
-- En V1 on utilise une clé fixe stockée dans pgsodium key vault.
-- À configurer une seule fois via le dashboard Supabase :
--   SELECT pgsodium.create_key(name => 'jestly_integrations_key');
-- Le key_id résultant est référencé par la migration 071 (colonne key_id).
