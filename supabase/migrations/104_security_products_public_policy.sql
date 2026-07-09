-- 104_security_products_public_policy.sql
-- Durcissement d'isolation multi-tenant (URGENT sécurité).
--
-- Avant : la policy publique de `products` exposait TOUT produit non archivé
-- (`status <> 'archived'`) à n'importe quel appelant (anon OU authenticated) via
-- la clé anon — soit le catalogue (noms, descriptions, prix) de TOUS les comptes.
--
-- Après : la lecture publique est limitée aux produits dont le PROPRIÉTAIRE a au
-- moins un site PUBLIÉ et non privé. Sémantique correcte « public = publié » :
--  - les vitrines publiques continuent de fonctionner (le resolver lit les
--    produits d'un propriétaire de site publié) ;
--  - les catalogues des comptes SANS site publié ne sont plus exposés à autrui ;
--  - le propriétaire garde l'accès à ses propres produits via la policy
--    « owner_id = auth.uid() » (inchangée), donc le dashboard n'est pas affecté.
--
-- Réversible : il suffit de recréer l'ancienne policy `status <> 'archived'`.

DROP POLICY IF EXISTS "Public can view non-archived products" ON public.products;

CREATE POLICY "Public can view products of owners with a published site"
  ON public.products
  FOR SELECT
  TO public
  USING (
    status <> 'archived'
    AND owner_id IN (
      SELECT s.owner_id FROM public.sites s
      WHERE s.status = 'published' AND s.is_private = false
    )
  );
