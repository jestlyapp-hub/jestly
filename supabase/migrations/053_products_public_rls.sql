-- Allow public read access to non-archived products
-- Products referenced in published blocks should be visible regardless of draft/active status
-- Only archived products (explicitly hidden by user) are excluded

DROP POLICY IF EXISTS "Public can view active products" ON products;

CREATE POLICY "Public can view non-archived products"
ON products FOR SELECT
USING (status != 'archived');
