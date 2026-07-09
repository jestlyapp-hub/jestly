-- 105_security_briefs_public_policy.sql
-- Durcissement d'isolation multi-tenant (URGENT sécurité) — briefs.
--
-- Avant : brief_templates et product_briefs avaient une policy
--   `SELECT TO anon USING (true)`
-- → n'importe quel appelant anonyme (clé anon, depuis le navigateur) pouvait
--   ÉNUMÉRER tous les modèles de brief et tous les briefs produits de TOUS les
--   comptes (56 modèles de 25 comptes exposés). Fuite inter-tenant réelle.
--
-- Ces policies anon existaient uniquement pour le formulaire public
-- `GET /api/public/brief` (schéma de brief affiché sur une page produit
-- publique). Cette route est désormais servie via le client service_role avec
-- un filtrage EXPLICITE par id/product_id (voir src/app/api/public/brief/route.ts)
-- : elle ne lit que le brief précis demandé, jamais l'ensemble. On peut donc
-- retirer les policies anon sans casser le formulaire public.
--
-- Les propriétaires gardent l'accès à LEURS briefs via les policies existantes
-- `owner_id = auth.uid()` (dashboard, routes authentifiées) — inchangées.
--
-- Réversible : recréer les policies `FOR SELECT TO anon USING (true)`.

DROP POLICY IF EXISTS "brief_templates_public_select" ON public.brief_templates;
DROP POLICY IF EXISTS "pb_public_select" ON public.product_briefs;
