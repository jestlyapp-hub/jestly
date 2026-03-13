-- ============================================================
-- 039 — Pivot Facturation → Commandes
-- ============================================================
-- La facturation est désormais pilotée par les commandes.
-- On ajoute les dates de transition financière aux commandes
-- et on enrichit billing_items pour les cas manuels/récurrents.

-- ── Dates financières sur orders ──
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS invoiced_at DATE,
  ADD COLUMN IF NOT EXISTS paid_at DATE;

CREATE INDEX IF NOT EXISTS idx_orders_billing
  ON orders(user_id, status)
  WHERE status IN ('delivered', 'invoiced', 'paid');

-- ── Ajouter 'paid' aux statuts billing_items (pour les items manuels) ──
-- Drop and recreate the check constraint
ALTER TABLE billing_items DROP CONSTRAINT IF EXISTS billing_items_status_check;
ALTER TABLE billing_items ADD CONSTRAINT billing_items_status_check
  CHECK (status IN ('draft','to_validate','validated','ready','exported','invoiced','paid','cancelled'));

-- ── Ajouter paid_at aux billing_items aussi ──
ALTER TABLE billing_items
  ADD COLUMN IF NOT EXISTS paid_at DATE;
