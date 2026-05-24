-- 068_archive_projects.sql
-- Cleanup phase 1 : archive de la section Projets avant refonte (phase 2 = miniatures).
-- On rename les 3 tables au lieu de DROP : data conservée pour relecture/migration future.
-- Les FKs internes project_folders.project_id et project_items.project_id suivent le rename
-- (les contraintes sont liées aux OIDs, pas aux noms).

-- Purger les entrées search_documents liées aux projets (évite des liens morts dans la recherche globale)
DELETE FROM public.search_documents WHERE entity_type = 'project';

-- Rename des tables (data conservée)
ALTER TABLE IF EXISTS public.projects RENAME TO projects_archived;
ALTER TABLE IF EXISTS public.project_folders RENAME TO project_folders_archived;
ALTER TABLE IF EXISTS public.project_items RENAME TO project_items_archived;
