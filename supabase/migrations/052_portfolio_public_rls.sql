-- Allow public read access to published portfolio projects and their items
-- (needed for Server Components that use anon key, not service_role)

CREATE POLICY "Public can read published portfolios"
ON projects FOR SELECT
USING (is_portfolio = true AND portfolio_visibility = 'public' AND status != 'archived');

CREATE POLICY "Public can read portfolio project items"
ON project_items FOR SELECT
USING (EXISTS (
  SELECT 1 FROM projects
  WHERE projects.id = project_items.project_id
  AND projects.is_portfolio = true
  AND projects.portfolio_visibility = 'public'
  AND projects.status != 'archived'
));
