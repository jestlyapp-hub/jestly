-- 067_cleanup_audit_cro.sql
-- Cleanup phase 1 : suppression de la section E-commerce / Audit CRO.
-- Drop des 9 tables introduites par les anciennes migrations 067/068 (jamais committées
-- dans le repo, appliquées en prod par script). Sera refait from scratch en phase 2.
-- Safe : DROP IF EXISTS CASCADE — no-op si les tables n'existent pas localement.

DROP TABLE IF EXISTS public.llm_calls CASCADE;
DROP TABLE IF EXISTS public.actions CASCADE;
DROP TABLE IF EXISTS public.insights CASCADE;
DROP TABLE IF EXISTS public.suggestions CASCADE;
DROP TABLE IF EXISTS public.audit_pages CASCADE;
DROP TABLE IF EXISTS public.audits CASCADE;
DROP TABLE IF EXISTS public.pages_library CASCADE;
DROP TABLE IF EXISTS public.scraped_pages_cache CASCADE;
DROP TABLE IF EXISTS public.user_quotas CASCADE;
